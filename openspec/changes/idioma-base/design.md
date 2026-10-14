# Design

## Context

- Después de `congreso-bilingue`: `lib/congreso/idioma.ts` (`Idioma`, `IDIOMAS`, `esIdioma`, `Bilingue`, `NEUTROS`, `resolver`), diccionarios tipados `es`/`en` en `lib/congreso/interfaz.ts` y `app/congreso/netx/textos.ts`, `/congreso/en` como dirección pública (ADR-003), preferencia `lh-congreso-idioma` en `NOMBRES_BASE` y `app/congreso/netx/preferencia-idioma.tsx`, que redirige en el cliente de `/congreso` a `/congreso/en`.
- `app/layout.tsx` pone `<html lang="es">`. No hay `middleware.ts` ni lectura de cookies en el servidor: hoy las páginas se pueden prerenderizar.
- Las preferencias de la persona (`lib/configuracion/preferencias.ts`) viven en `lh-configuracion` (con prefijo de la persona si hay sesión) y ya tienen `idioma: "es"`. Configuración muestra "English · próximamente". `SCRIPT_APARIENCIA` aplica el tema antes de hidratar.
- `formatearMonto` usa punto de miles fijo. Los textos de la interfaz están escritos en cada componente; las etiquetas del rail en `lib/navegacion.ts`.
- Hay unas 16 mil líneas en `app/`, `components/` y `lib/` (sin el Congreso), por eso las zonas van en cambios aparte.

## Goals / Non-Goals

**Goals:**
- Una sola manera de manejar el idioma en toda la plataforma, compatible con la del Congreso.
- Que traducir una zona sea mecánico: mover textos a un diccionario y escribir el inglés.
- Que un texto sin traducir no pase desapercibido (no compila, lo atrapa un test o se ve marcado).

**Non-Goals:**
- Traducir el contenido de las páginas (cambios por zona), SEO, otros idiomas.

## Decisions

### 1. Direcciones: preferencia + `?lang=`, sin prefijo (ADR-004)

| Opción | A favor | En contra |
|---|---|---|
| A · Prefijo `/en/...` en toda la plataforma | Cada idioma tiene su dirección; se puede enlazar cualquier página en inglés; lo mejor para buscadores; `hreflang` en todas | Hay que mover todo `app/` a `app/[idioma]/` (choca con todo lo que esté en curso), reescribir cada enlace, `rutas-publicas.ts`, `lib/permisos/niveles.ts` (rutas por nivel), la ruta activa del rail y los e2e; varias noches bloqueando el resto; `/congreso/en` quedaría como redirección a `/en/congreso`. Buscadores: casi todo pide sesión, así que la ganancia es chica |
| B · Parámetro `?lang=en` en todas las direcciones | Sin mover archivos | Hay que propagarlo en cada enlace y formulario; se pierde con facilidad; direcciones largas con UTM |
| C · Solo preferencia (cookie y por persona) | Sin mover nada; las direcciones no cambian | No se puede mandar un enlace en inglés: el inversor ve español hasta encontrar el selector |
| **D · Preferencia + `?lang=` de un solo uso** (recomendada) | Lo de C, más un enlace compartible (`/sumarte?lang=en`) que fija el idioma y desaparece de la dirección; el Congreso mantiene `/congreso/en`; cambio chico y reversible | Las páginas no tienen una dirección por idioma (sin `hreflang` fuera del Congreso); todas las páginas pasan a renderizarse por pedido porque el servidor lee la cookie |

**Recomendación: D.** Si algún día hace falta que las páginas públicas (portada, tribus, territorio) se indexen en inglés, se suma el prefijo **solo para esas páginas** (ADR nuevo) y `/congreso/en` pasa a redirección permanente (308) hacia la dirección nueva, como promete ADR-003.

### 2. Librería: propia, extendiendo la del Congreso

| Opción | A favor | En contra |
|---|---|---|
| next-intl (v4, sin ruteo por idioma) | Estándar de facto en App Router; funciona en componentes de servidor y cliente; plurales ICU; formateo de fechas y números; tipos de claves | Dependencia nueva; las piezas portables del Congreso no pueden importarla (test de portabilidad), así que quedan dos sistemas o hay que rehacer el Congreso; el inglés completo se exige igual con tipos propios; la caída marcada se arma con su `getMessageFallback` |
| i18next / react-i18next | Muy usado, con muchos complementos | Pensado para el cliente; en App Router con servidor pide más armado; claves en texto sin tipos estrictos por defecto |
| Lingui | Extracción automática de textos, buen flujo para traductores | Macros y paso de compilación (plugin de SWC); más piezas en el build |
| Paraglide (inlang) | Funciones tipadas por mensaje, muy liviano | Compilador propio y archivos de mensajes aparte; poco conocido por los agentes |
| **Propia** (recomendada) | Ya existe en el repo (Congreso); sin dependencias; TypeScript exige el inglés completo; control total de la caída marcada y de `lang`; los agentes siguen un solo patrón | Sin extracción automática ni plurales ICU (se resuelven con funciones: `(n) => n === 1 ? "1 tribe" : \`${n} tribes\``); hay que mantener unas 150 líneas |

**Recomendación: propia.** Revisar si se suma un tercer idioma, si traducen personas de afuera del equipo con una herramienta (Crowdin, Lokalise) o si aparecen muchos plurales y concordancias: ahí conviene next-intl y la migración es mecánica porque los textos ya están en diccionarios.

### 3. Tipos y diccionarios
- `lib/idioma/tipos.ts` reexporta de `@/lib/congreso/idioma` (`Idioma`, `IDIOMAS`, `esIdioma`, `Bilingue`, `resolver`): la fuente sigue siendo la del Congreso, que es portable; la plataforma depende de ella y no al revés. No se tocan los archivos del Congreso para esto.
- `Textos<T>`: tipo que convierte el diccionario español en el contrato del inglés: cada `string` pasa a `string`, cada función conserva su firma, cada objeto se recorre y cada tupla (`as const`) conserva su largo. Así `const en: Textos<typeof es>` no compila si falta una clave o un elemento.
- Un archivo por zona en `lib/idioma/textos/<zona>.ts` que exporta `{ es, en }`. `lib/idioma/textos.ts` los registra (`DICCIONARIOS = { marco, comunes, … }`) para que los tests los recorran todos. Este cambio crea `marco` y `comunes` (textos que se repiten en todas las zonas: "Cargando…", "Cancelar", "Cerrar", "Guardar", "sin dato", "(simulado)", "Error: tu navegador no permite guardar datos en este sitio…"); cada cambio de zona suma el suyo y usa `comunes` en lugar de repetir.
- Acceso: en el servidor, `textos("marco", await idiomaDelPedido())`; en el cliente, `useTextos("marco")`, que lee el idioma del contexto `ProveedorIdioma` (lo pone el layout con el valor del servidor).
- Los textos con datos son funciones (`noLeidas: (n: number) => …`). Los textos con enlaces o negritas se arman en el componente con piezas del diccionario (no se guarda HTML en los diccionarios).

### 4. Dónde se guarda y quién manda
- **Cookie `lh-idioma`** (`es` | `en`, `path=/`, `SameSite=Lax`, un año, sin `HttpOnly` para que el cliente la pueda escribir). La lee el servidor (`lib/idioma/servidor.ts`, `idiomaDelPedido()` con `cookies()` de `next/headers`; valor inválido o ausente → `"es"`). Es una cookie de preferencia de interfaz pedida por la persona: no necesita consentimiento (exención de las cookies de personalización de la interfaz, Grupo del Art. 29, Dictamen 04/2012) y no lleva la identidad. Se suma a la política en `idioma-legal`.
- **Por persona:** `Preferencias.idioma` pasa a `"es" | "en"` (en `lh-configuracion`, con su prefijo). `leerPreferencias` acepta los dos; lo guardado como `"es"` sigue valiendo. "Borrar todo" ya lo borra.
- **Reglas** (en `lib/idioma/cliente.tsx`, `SincronizarIdioma`, montado con sesión y consentimiento vigente):
  1. La cookie manda: es la elección de este navegador.
  2. Al entrar: si no hay cookie y la persona tiene `idioma` guardado → se escribe la cookie y `router.refresh()`. Si hay cookie y difiere de la de la persona → se guarda la de la cookie en la persona.
  3. Al elegir (selector o Configuración): se escribe la cookie, se guarda en la persona si hay sesión, se pone `document.documentElement.lang` y `router.refresh()`.
  4. Al salir, la cookie queda (el idioma es del navegador).
- **Congreso:** `app/congreso/netx/preferencia-idioma.tsx` pasa a leer el idioma de la plataforma (contexto de `ProveedorIdioma`) en lugar de `lh-congreso-idioma`; la primera carga ya la resuelve el middleware (§5) y el componente queda para cuando el idioma cambia estando en `/congreso` (por ejemplo, al recuperar la preferencia de la persona). El selector del evento, al hacer clic, escribe la cookie `lh-idioma` y la preferencia de la persona en lugar de `lh-congreso-idioma`. Migración: si no hay cookie y existe `lh-congreso-idioma`, `SincronizarIdioma` la usa una vez. La clave vieja sigue en `NOMBRES_BASE` para que "Borrar todo" la borre.

### 5. Middleware
- `middleware.ts` con `matcher` que excluye `/_next`, `/api` y archivos con extensión.
- Si la query trae `lang`: valor `es`/`en` → cookie y redirección 307 a la misma ruta sin `lang` (con el resto de la query; el navegador conserva el ancla). Otro valor → redirección sin `lang` y sin cookie. Caso Congreso: `/congreso?lang=en` va a `/congreso/en` y `/congreso/en?lang=es` va a `/congreso`.
- Sin `lang`: si la ruta es exactamente `/congreso` y la cookie es `en` → 307 a `/congreso/en` con la query. Así se va el parpadeo de la redirección en el cliente.
- No mira sesión ni permisos: solo idioma. `/congreso/en` no se redirige nunca hacia el español (la dirección explícita gana, ADR-003).

### 6. Selector
- `components/selector-idioma.tsx` (cliente): igual que el del Congreso, un grupo con nombre "Idioma · Language" y dos enlaces "ES" y "EN" con `lang`, `hreflang`, nombre accesible "ES · Español" / "EN · English" (parte larga en `sr-only`) y `aria-current="true"` en el actual (con subrayado y peso, no solo color). `href` = la ruta actual con `?lang=xx` (funciona sin JavaScript y en otra pestaña). Con clic normal, hace §4.3 sin navegar; con Ctrl/Cmd/clic medio, deja el enlace.
- En la barra superior, a la izquierda del avatar; en 390 px, solo "ES | EN".
- Configuración → Idioma: los dos radios habilitados ("Español", "English" con `lang="en"`), conectados a la misma función de §4.3.

### 7. Caída marcada
- **Datos:** `components/texto-bilingue.tsx`: `<TextoBilingue valor={b} />` muestra `b.en` en inglés; si falta, `<span lang="es">{b.es}</span>` con la marca visible "ES" (`aria-hidden`) y un `sr-only` "(only available in Spanish)". Las zonas lo usan para los datos de ejemplo que pasan a `Bilingue`.
- **Páginas:** `lib/idioma/rutas.ts` con `RUTAS_TRADUCIDAS` (expresiones como `rutas-publicas.ts`). En este cambio: ninguna página de contenido, más `/congreso` y `/congreso/en` (las maneja el Congreso). La puerta, en inglés y con una ruta fuera de la lista, envuelve la página en `<div lang="es">` y pone arriba `components/aviso-sin-traducir.tsx`: "This page is only available in Spanish for now." (en inglés, con `lang="en"`). Cada cambio de zona suma sus rutas.

### 8. Formatos
- `lib/idioma/formatos.ts`: `LOCALES = { es: "es-AR", en: "en-US" }`; `formatearFecha(iso, idioma, estilo)` (con `timeZone: "UTC"` para fechas sin hora), `formatearNumero(n, idioma)`, `sinDato(idioma)` ("sin dato" / "no data").
- `formatearMonto(usd, moneda, idioma = "es")` en `lib/configuracion/preferencias.ts` pasa a usar `formatearNumero`: en español queda **idéntico** a hoy ("USD 1.200", "sin dato"); en inglés, "USD 1,200" / "no data". `NOTA_TIPO_DE_CAMBIO` pasa al diccionario.

### 9. Glosario y nombres propios
- `lib/idioma/glosario.ts`: términos de la plataforma con su inglés **propuesto** (comentario "propuesta: a confirmar por Gus"): Inicio → Home, Descubrir → Discover, Participar → Take part, Territorio → Territory, Tribus → Tribes, Pactos → Pacts, Semillas → Seeds, Fogón → Fireside, Compromisos → Commitments, Congreso → Congress, Sumarte → Join, Perfil → Profile, Pasaporte → Passport, Mi recorrido → My journey, Configuración → Settings, Mis datos → My data, Explorador → Explorer, Miembro → Member, Pase Fundador → Founder Pass, Plan Tribu → Tribe Plan, Ronda 0 → Round 0, Fondo Común → Common Fund, Sellos → Stamps. Los diccionarios toman estos términos del glosario (una sola fuente).
- Nombres propios (no se traducen): personas, tribus (Valle Solar…), barrios, territorios (Lighthouse, Macrolote 7, Soluna, BioPueblo), lugares, NetX, NetXGen, UnityHub, Genesis, Hifa, Privy. Cuando un nombre se dibuja dentro de texto en inglés, va con `translate="no"` (atributo HTML estándar que dice "no traducir"): el detector lo ignora y los traductores automáticos del navegador también.

### 10. Qué se traduce de los datos de ejemplo (regla para las zonas)
| Tipo | Se traduce | Ejemplos |
|---|---|---|
| Interfaz (botones, títulos, ayudas, errores, estados) | Sí, en diccionarios | "Elegí un plan", "Activa", "En formación" |
| Datos de ejemplo escritos por la plataforma | Sí, como `Bilingue` | Descripción de una tribu, textos del territorio, filas de la comparativa de planes, sellos |
| Voz de personas o comunidades | No: se muestra en el original con `lang="es"` y "Written in Spanish" | Manifiestos, mensajes del Fogón, ofertas del Mercado, citas |
| Lo que escribe la persona | Nunca | Perfil, pactos propios, reportes |
| Nombres propios | Nunca | Ver §9 |
| Montos, fechas, números | Solo el formato | §8 |

Si Gus prefiere traducir también los manifiestos de ejemplo, se suman como `Bilingue` en `idioma-tribus-territorio` (pregunta abierta).

### 11. Tests
- `lib/idioma/tipos.test.ts` (`Textos<T>` con `expectTypeOf` o `// @ts-expect-error` para una clave faltante y una tupla corta).
- `lib/idioma/diccionarios.test.ts`, sobre todo `DICCIONARIOS`: ningún texto vacío (las funciones se llaman con valores de prueba); ningún `en === es` fuera de `lib/idioma/neutros.ts` (que reutiliza `NEUTROS` del Congreso y suma "NetX", "ES", "EN", "Lighthouse"…); el lado `en` sin `¿`, `¡`, `ñ` ni palabras de una lista corta de español (`el`, `los`, `que`, `para`, `tu`, `tus`, `con`, `sin`, `más`); el lado `es` sin tuteo (`tú`, `tienes`, `puedes`, `quieres`, `eres`, `sabes`).
- `lib/idioma/formatos.test.ts`, `lib/configuracion/preferencias.test.ts` (idioma `en` válido, `formatearMonto` en español idéntico a antes), `lib/idioma/rutas.test.ts`, test del middleware como función pura (`resolverIdioma(url, cookie) → { redirigir?, cookie? }`).
- `e2e/ayudas-idioma.ts`: `textosEnEspanol(page, raiz)`: junta el texto visible de `raiz` sin los subárboles `[lang="es"]` ni `[translate="no"]` y devuelve las coincidencias con la lista de palabras en español (con límites de palabra) y `¿¡ñ`.
- `e2e/idioma.spec.ts`: (a) sin cuenta, EN en la barra → marco en inglés y `html[lang=en]`; recarga y sigue; (b) `?lang=en` con UTM y ancla; `?lang=fr`; (c) con preferencia inglés, `/congreso` → `/congreso/en` sin pasar por español; `/congreso/en` con español elegido; el selector del Congreso cambia la plataforma; (d) página sin traducir: aviso y `lang="es"`; (e) para cada página: `textosEnEspanol` vacío en `nav`, `header` y `footer`; para las de `RUTAS_TRADUCIDAS`, también en `main`; (f) Configuración → English; (g) persona con inglés guardado entra desde un contexto sin cookie y termina en inglés; (h) 390 px sin desborde.
- `e2e/accesibilidad.spec.ts`: suma la portada, `/tribus` y `/configuracion` en inglés.

## Risks / Trade-offs

- [Todas las páginas pasan a renderizarse por pedido (el layout lee la cookie)] → en el prototipo no se nota; si se nota, las páginas públicas pueden volver a ser estáticas con el prefijo de §1.
- [Computadora compartida: la persona siguiente hereda el idioma del navegador y lo guarda como suyo] → se cambia con un clic; aceptado en el prototipo (como R5).
- [Mientras las zonas no se traduzcan, el inglés es "marco en inglés + páginas en español con aviso"] → por eso el aviso es visible y el orden de las zonas prioriza lo que ve un inversor (portada y Sumarte).
- [El glosario lo propone un agente] → queda marcado como propuesta; cambiar un término es una línea.
- [Un middleware nuevo corre en cada pedido] → solo mira la query y una cookie; no toca sesión ni permisos.

## Migration Plan

- Rama `agente/idioma-base` desde `main` con `congreso-bilingue` ya mergeado.
- En español no cambia nada visible (salvo el selector en la barra y el radio de Configuración habilitado): los e2e actuales siguen valiendo.
- Volver atrás: revertir el PR. La cookie `lh-idioma` queda sin efecto; `Preferencias.idioma: "en"` guardado se lee como `"es"` con el código viejo; `/congreso/en` sigue funcionando con su redirección en el cliente.

## Open Questions

- Revisión del agente arquitecto pendiente (middleware y preferencia por persona).
- ADR-004 en estado Propuesta: lo acepta Gus.
