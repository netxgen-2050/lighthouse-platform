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

**Recomendación: D. Aceptada por Gus el 15-oct-2026** (direcciones iguales en los dos idiomas, selector y `?lang=en`); ADR-004 queda en Propuesta hasta que Gus mergee. Si algún día hace falta que las páginas públicas (portada, tribus, territorio) se indexen en inglés, se suma el prefijo **solo para esas páginas** (ADR nuevo) y `/congreso/en` pasa a redirección permanente (308) hacia la dirección nueva, como promete ADR-003.

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
- **Orden (decisión de Gus, 15-oct-2026):** (1) `?lang=` del enlace; (2) la cookie `lh-idioma` (lo elegido en este navegador); (3) la preferencia guardada de la persona, al entrar, si no hay cookie; (4) el idioma del navegador (`Accept-Language`); (5) si el navegador no pide español ni inglés, **inglés**. Lo elegido (1 a 3) siempre gana sobre lo detectado (4 y 5).
- **Idioma del navegador** (`lib/idioma/navegador.ts`, `idiomaDelNavegador(acceptLanguage)`, función pura): toma el idioma de **mayor peso** de la lista (respetando `q`; empate → el primero) y mira solo su parte principal: `es`, `es-AR`, `es-ES`… → `"es"`; `en`, `en-GB`… → `"en"`; cualquier otro (`pt-BR`, `fr`, `*`) → `"en"`. Encabezado ausente o ilegible → `"en"`. Lo detectado **nunca** escribe la cookie ni la preferencia: solo decide qué se muestra mientras la persona no elija. Así, si la persona cambia el idioma de su navegador, la plataforma la sigue.
- **Cookie `lh-idioma`** (`es` | `en`, `path=/`, `SameSite=Lax`, un año, sin `HttpOnly` para que el cliente la pueda escribir). La lee el servidor (`lib/idioma/servidor.ts`, `idiomaDelPedido()` con `cookies()` y `headers()` de `next/headers`; cookie válida → ese idioma; inválida o ausente → `idiomaDelNavegador(...)`). Es una cookie de preferencia de interfaz pedida por la persona: no necesita consentimiento (exención de las cookies de personalización de la interfaz, Grupo del Art. 29, Dictamen 04/2012) y no lleva la identidad. Se suma a la política en `idioma-legal`.
- **Por persona:** `Preferencias` suma `idiomaElegido: "es" | "en" | null` (en `lh-configuracion`, con su prefijo; por defecto `null` = "no eligió"). El campo viejo `idioma: "es"` se ignora al leer: nunca fue una elección (English estaba deshabilitado) y, si se tomara como tal, una persona con el navegador en inglés quedaría forzada al español. "Borrar todo" lo borra.
<!-- arquitecto: la preferencia "por persona" vive hoy en el localStorage de este navegador, con el prefijo de la persona. -->
- **Alcance real de "por persona" en el prototipo (decisión de Gus, 15-oct-2026: alcanza así hasta `datos-en-la-nube`):** como `lh-configuracion` está en `localStorage`, la preferencia de la persona **no viaja a otro navegador ni a otro dispositivo** hasta que las preferencias se muden a la base (`datos-en-la-nube`). Lo que sí resuelve hoy: la misma persona en el mismo navegador cuando la cookie se borró o venció, y la computadora compartida (cada persona recupera la suya al entrar). El día que las preferencias estén en la base, `SincronizarIdioma` no cambia: solo cambia de dónde lee `leerPreferencias`. **Dueño del dato:** NetX (la persona); la cookie es una copia de trabajo del navegador, sin identidad.
- **"Borrar todo"** borra la preferencia guardada de la persona pero **no la cookie** `lh-idioma` (es del navegador, no de la persona): la pantalla sigue en el idioma actual. Salir tampoco la borra (regla 4).
- **Reglas** (en `lib/idioma/cliente.tsx`, `SincronizarIdioma`, montado con sesión y consentimiento vigente):
  1. La cookie manda: es la elección de este navegador.
  2. Al entrar: si no hay cookie y la persona tiene `idiomaElegido` → se escribe la cookie y `router.refresh()`. Si no hay cookie y la persona no eligió → no se guarda nada (sigue lo detectado del navegador). Si hay cookie y difiere de `idiomaElegido` → se guarda la de la cookie en la persona.
  3. Al elegir (selector o Configuración): se escribe la cookie, se guarda en la persona si hay sesión, se pone `document.documentElement.lang` y `router.refresh()`.
  4. Al salir, la cookie queda (el idioma es del navegador).
- **Congreso:** `app/congreso/netx/preferencia-idioma.tsx` pasa a leer el idioma de la plataforma (contexto de `ProveedorIdioma`) en lugar de `lh-congreso-idioma`; la primera carga ya la resuelve el middleware (§5) y el componente queda para cuando el idioma cambia estando en `/congreso` (por ejemplo, al recuperar la preferencia de la persona). El selector del evento, al hacer clic, escribe la cookie `lh-idioma` y la preferencia de la persona en lugar de `lh-congreso-idioma`. Migración: si no hay cookie y existe `lh-congreso-idioma`, `SincronizarIdioma` la usa una vez. La clave vieja sigue en `NOMBRES_BASE` para que "Borrar todo" la borre.

### 5. Middleware
- `middleware.ts` con `matcher` que excluye `/_next`, `/api` y archivos con extensión.
- Si la query trae `lang`: valor `es`/`en` → cookie y redirección 307 a la misma ruta sin `lang` (con el resto de la query; el navegador conserva el ancla). Otro valor → redirección sin `lang` y sin cookie. Caso Congreso: `/congreso?lang=en` va a `/congreso/en` y `/congreso/en?lang=es` va a `/congreso`.
- Sin `lang`: si la ruta es exactamente `/congreso` y el idioma del pedido es `en` (cookie `en`, o sin cookie y navegador que no pide español) → 307 a `/congreso/en` con la query. Así se va el parpadeo de la redirección en el cliente. Con la cookie en `es`, `/congreso` no redirige aunque el navegador pida inglés.
- No mira sesión ni permisos: solo idioma. `/congreso/en` no se redirige nunca hacia el español (la dirección explícita gana, ADR-003).
<!-- arquitecto: redirecciones seguras y sin caché. -->
- **Siempre al mismo sitio:** la dirección de destino se arma clonando `request.nextUrl` (mismo origen) y quitando `lang`; nunca se toma un destino de la query ni del encabezado `Host`. Así `?lang=` no se puede usar para mandar a la persona a otro dominio (redirección abierta). Test en `resolverIdioma`: `?lang=en&next=https://otro.com` termina en la misma ruta del mismo origen.
- **Sin caché:** las redirecciones que dependen de la cookie o del navegador (`/congreso` → `/congreso/en`) llevan `Cache-Control: private, no-store` y `Vary: Cookie, Accept-Language`, para que ninguna caché intermedia le sirva a otra persona la redirección de alguien que eligió inglés. Las 307 no se guardan por defecto, pero se deja explícito.
- **Si el middleware falla** (excepción): deja pasar el pedido sin redirigir y sin cookie (la página sale en el idioma de la cookie que ya hubiera, o en español). Nunca una página de error por el idioma.

### 6. Selector
- `components/selector-idioma.tsx` (cliente): igual que el del Congreso, un grupo con nombre "Idioma · Language" y dos enlaces "ES" y "EN" con `lang`, `hreflang`, nombre accesible "ES · Español" / "EN · English" (parte larga en `sr-only`) y `aria-current="true"` en el actual (con subrayado y peso, no solo color). `href` = la ruta actual con `?lang=xx` (funciona sin JavaScript y en otra pestaña). Con clic normal, hace §4.3 sin navegar; con Ctrl/Cmd/clic medio, deja el enlace.
- En la barra superior, a la izquierda del avatar; en 390 px, solo "ES | EN".
- Configuración → Idioma: los dos radios habilitados ("Español", "English" con `lang="en"`), conectados a la misma función de §4.3.

### 7. Caída marcada
- **Datos:** `components/texto-bilingue.tsx`: `<TextoBilingue valor={b} />` muestra `b.en` en inglés; si falta, `<span lang="es">{b.es}</span>` con la marca visible "ES" (`aria-hidden`) y un `sr-only` "(only available in Spanish)". Las zonas lo usan para los datos de ejemplo que pasan a `Bilingue`.
- **Páginas:** `lib/idioma/rutas.ts` con `RUTAS_TRADUCIDAS` (expresiones como `rutas-publicas.ts`). En este cambio: ninguna página de contenido, más `/congreso` y `/congreso/en` (las maneja el Congreso). La puerta, en inglés y con una ruta fuera de la lista, envuelve la página en `<div lang="es">` y pone arriba `components/aviso-sin-traducir.tsx`: "This page is only available in Spanish for now." (en inglés, con `lang="en"`). Cada cambio de zona suma sus rutas.
<!-- arquitecto: el idioma del contenido de una página sin traducir es "es" para todo lo que va adentro, también la bitácora. -->
- **El envoltorio también fija el idioma del contenido:** además de `<div lang="es">`, la puerta anida `<ProveedorIdioma idioma="es">` alrededor de la página sin traducir (el marco sigue en inglés porque está afuera). Así todo lo que la página pida con `useTextos`, `formatearMonto` o `TerminoLegal` sale en español y coincide con su `lang="es"`. Es lo que mantiene la regla de la bitácora de `congreso-bilingue` (§4: `idioma` es el del texto **mostrado**): un ⚖ dentro de una página sin traducir se muestra y se anota en español, nunca como "en" dentro de un bloque en español. Test: un componente con `useIdioma()` dentro del envoltorio devuelve `"es"` con la plataforma en inglés.

### 8. Formatos
- `lib/idioma/formatos.ts`: `LOCALES = { es: "es-AR", en: "en-US" }`; `formatearFecha(iso, idioma, estilo)` (con `timeZone: "UTC"` para fechas sin hora), `formatearNumero(n, idioma)`, `sinDato(idioma)` ("sin dato" / "no data").
- `formatearMonto(usd, moneda, idioma = "es")` en `lib/configuracion/preferencias.ts` pasa a usar `formatearNumero`: en español queda **idéntico** a hoy ("USD 1.200", "sin dato"); en inglés, "USD 1,200" / "no data". `NOTA_TIPO_DE_CAMBIO` pasa al diccionario.

### 9. Glosario y nombres propios
- `lib/idioma/glosario.ts`: términos de la plataforma con su inglés, **confirmado por Gus el 15-oct-2026** (comentario con la fecha): Inicio → Home, Descubrir → Discover, Participar → Take part, Territorio → Territory, Tribus → Tribes, Pactos → Pacts, **Semillas → Semillas** (no se traduce, ver abajo), Fogón → Fireside, Compromisos → Commitments, Congreso → Congress, Sumarte → Join, Perfil → Profile, Pasaporte → Passport, Mi recorrido → My journey, Configuración → Settings, Mis datos → My data, Explorador → Explorer, Miembro → Member, Pase Fundador → Founder Pass, Plan Tribu → Tribe Plan, Ronda 0 → Round 0, Fondo Común → Common Fund, Sellos → Stamps. Los diccionarios toman estos términos del glosario (una sola fuente).
- **"Semillas" en inglés (decisión de Gus):** se dice "Semillas", como una marca de la plataforma. El glosario la guarda como `{ es: "Semillas", en: "Semillas", explicada: { en: "Semillas (seeds)" } }`. Regla para las zonas: la **primera** mención en el contenido de una página en inglés (título o primer párrafo) usa `explicada`; las siguientes, el rail y los botones dicen "Semillas". Se dibuja con `translate="no"` (que el traductor del navegador no la cambie) y "Semillas" va en `lib/idioma/neutros.ts` (puede ser igual en los dos idiomas).
- Nombres propios (no se traducen): personas, tribus (Valle Solar…), barrios, territorios (Lighthouse, Macrolote 7, Soluna, BioPueblo), lugares, NetX, NetXGen, UnityHub, Genesis, Hifa, Privy. Cuando un nombre se dibuja dentro de texto en inglés, va con `translate="no"` (atributo HTML estándar que dice "no traducir"): el detector lo ignora y los traductores automáticos del navegador también.

### 10. Qué se traduce de los datos de ejemplo (regla para las zonas)
| Tipo | Se traduce | Ejemplos |
|---|---|---|
| Interfaz (botones, títulos, ayudas, errores, estados) | Sí, en diccionarios | "Elegí un plan", "Activa", "En formación" |
| Datos de ejemplo escritos por la plataforma | Sí, como `Bilingue` | Descripción de una tribu, textos del territorio, filas de la comparativa de planes, sellos |
| Textos de ejemplo de comunidades (decisión de Gus, 15-oct-2026) | Sí, como `Bilingue` con su idioma original, y en el otro idioma se ve "Translated from Spanish" / "Traducido del inglés" | Manifiestos y declaraciones de tribus, decisiones del Fogón, ofertas de ejemplo del Mercado, citas |
| Lo que escribe la persona | Nunca (sin traducción automática); se muestra tal cual, con `lang` del idioma en que se escribió (por ahora `"es"`) | Perfil, pactos propios, ofertas propias, reportes |
| Nombres propios | Nunca | Ver §9 |
| Montos, fechas, números | Solo el formato | §8 |

- **Idioma original visible:** `Bilingue` suma `original?: Idioma` (por defecto `"es"`). `<TextoBilingue valor={b} />` muestra el texto en el idioma de la página y, si ese idioma no es el original, una nota visible debajo o al lado: "Translated from Spanish" (en inglés) o "Traducido del inglés" (en español), en texto (no solo con un ícono o un color). La nota sale del diccionario `comunes`. Si falta la traducción, vale la caída marcada de §7 (texto original con `lang` y la marca "ES"). Una traducción de un texto de comunidad cuenta como texto de ejemplo y queda `pendiente` de revisión nativa (§12).

### 11. Tests
- `lib/idioma/tipos.test.ts` (`Textos<T>` con `expectTypeOf` o `// @ts-expect-error` para una clave faltante y una tupla corta).
- `lib/idioma/diccionarios.test.ts`, sobre todo `DICCIONARIOS`: ningún texto vacío (las funciones se llaman con valores de prueba); ningún `en === es` fuera de `lib/idioma/neutros.ts` (que reutiliza `NEUTROS` del Congreso y suma "NetX", "ES", "EN", "Lighthouse"…); el lado `en` sin `¿`, `¡`, `ñ` ni palabras de una lista corta de español (`el`, `los`, `que`, `para`, `tu`, `tus`, `con`, `sin`, `más`); el lado `es` sin tuteo (`tú`, `tienes`, `puedes`, `quieres`, `eres`, `sabes`).
- `lib/idioma/formatos.test.ts`, `lib/configuracion/preferencias.test.ts` (`idiomaElegido: "en"` válido, `null` por defecto, el campo viejo `idioma: "es"` se ignora, `formatearMonto` en español idéntico a antes), `lib/idioma/rutas.test.ts`, test del middleware como función pura (`resolverIdioma(url, cookie, acceptLanguage) → { redirigir?, cookie? }`).
- `lib/idioma/navegador.test.ts`: `es-AR,es;q=0.9` → es; `en-US` → en; `pt-BR,pt;q=0.9,es;q=0.8` → en (manda el de mayor peso); `fr;q=0.5,es;q=0.8` → es; `*`, vacío o ilegible → en.
- `lib/idioma/revision-nativa.test.ts` (§12).
- **Playwright en español por defecto:** `playwright.config.ts` fija `use.locale: "es-AR"` (el Chromium de Playwright manda `en-US`, y sin esto todos los e2e actuales pasarían a inglés). Los casos de detección usan `test.use({ locale: … })`.
- `e2e/ayudas-idioma.ts`: `textosEnEspanol(page, raiz)`: junta el texto visible de `raiz` sin los subárboles `[lang="es"]` ni `[translate="no"]` y devuelve las coincidencias con la lista de palabras en español (con límites de palabra) y `¿¡ñ`.
- `e2e/idioma.spec.ts`: (a) sin cuenta, EN en la barra → marco en inglés y `html[lang=en]`; recarga y sigue; (b) `?lang=en` con UTM y ancla; `?lang=fr`; (c) con preferencia inglés, `/congreso` → `/congreso/en` sin pasar por español; `/congreso/en` con español elegido; el selector del Congreso cambia la plataforma; (d) página sin traducir: aviso y `lang="es"`; (e) para cada página: `textosEnEspanol` vacío en `nav`, `header` y `footer`; para las de `RUTAS_TRADUCIDAS`, también en `main`; (f) Configuración → English; (g) persona con inglés guardado entra desde un contexto sin cookie (y navegador en español) y termina en inglés; (h) 390 px sin desborde; (i) idioma inicial: contexto con `locale: "en-US"` → marco en inglés; `"pt-BR"` → inglés; `"es-ES"` → español; con `en-US` y la cookie en `es` → español; ninguno de esos casos escribe la cookie; (j) con la plataforma en inglés, el rail dice "Semillas" y un `TextoBilingue` de prueba con `original: "es"` muestra "Translated from Spanish".
- `e2e/accesibilidad.spec.ts`: suma la portada, `/tribus` y `/configuracion` en inglés.

### 12. Revisión nativa pendiente (decisión de Gus, 15-oct-2026)
La revisión por un hablante nativo queda para más adelante; mientras tanto, todo inglés escrito por agentes queda marcado para que Gus avise con el tiempo.
- `lib/idioma/revision-nativa.ts`: `REVISION_NATIVA: Record<string, { estado: "pendiente" | "revisado"; que: string; revisadoPor?: string; fecha?: string }>`. La clave es la fuente: `textos/<zona>` para cada diccionario de `DICCIONARIOS`, `glosario`, y la ruta del archivo para datos de ejemplo con inglés (`lib/tribus/datos.ts`, `lib/manifiestos/datos.ts`…) y para el catálogo legal (`lib/legal/terminos.ts`, que además tiene su revisión legal aparte, R14). Todo entra como `pendiente`; pasa a `revisado` solo cuando Gus lo indica (con quién y cuándo).
- Este cambio anota `textos/marco`, `textos/comunes` y `glosario`. Cada cambio de zona anota sus diccionarios y sus archivos de datos (está en sus tasks).
- `lib/idioma/revision-nativa.test.ts`: (a) falla si un diccionario de `DICCIONARIOS` o el glosario no está en `REVISION_NATIVA`, nombrando cuál; (b) genera la lista de pendientes en Markdown (fuente, qué es, cantidad de textos en inglés) y la compara con `docs/idioma/revisar-nativo.md` con `toMatchFileSnapshot`, así la lista versionada nunca queda vieja.
- `pnpm idioma:pendientes` (= `vitest run lib/idioma/revision-nativa.test.ts -u`) regenera `docs/idioma/revisar-nativo.md`. El archivo dice arriba cómo marcar algo como revisado. Sin dependencias nuevas.

## Risks / Trade-offs

- [Todas las páginas pasan a renderizarse por pedido (el layout lee la cookie)] → en el prototipo no se nota; si se nota, las páginas públicas pueden volver a ser estáticas con el prefijo de §1.
- [Computadora compartida: la persona siguiente hereda el idioma del navegador y lo guarda como suyo] → se cambia con un clic; aceptado en el prototipo (como R5).
- [Mientras las zonas no se traduzcan, el inglés es "marco en inglés + páginas en español con aviso"] → por eso el aviso es visible y el orden de las zonas prioriza lo que ve un inversor (portada y Sumarte).
- [El glosario y las traducciones los escribe un agente] → Gus confirmó el glosario; el resto queda `pendiente` en la lista de revisión nativa; cambiar un término es una línea.
- [Detectar por el navegador: un inversor hispanohablante con el navegador en inglés ve inglés] → el selector está siempre a la vista y lo elegido gana para siempre en ese navegador.
- [Los e2e corren con un navegador en inglés] → `locale: "es-AR"` en `playwright.config.ts`; si falta, los e2e en español fallan enseguida y en masa (fácil de ver).
- [Un middleware nuevo corre en cada pedido] → solo mira la query y una cookie; no toca sesión ni permisos.

## Migration Plan

- Rama `agente/idioma-base` desde `main` con `congreso-bilingue` ya mergeado.
- En español no cambia nada visible (salvo el selector en la barra y el radio de Configuración habilitado): los e2e actuales siguen valiendo.
- Volver atrás: revertir el PR. La cookie `lh-idioma` queda sin efecto; `Preferencias.idioma: "en"` guardado se lee como `"es"` con el código viejo; `/congreso/en` sigue funcionando con su redirección en el cliente.

## Open Questions

- ~~Revisión del agente arquitecto pendiente~~ <!-- arquitecto: revisado el 14-oct-2026; ajustes en §4, §5 y §7. -->
- ~~ADR-004~~ Gus aceptó la decisión el 15-oct-2026; el ADR pasa a Aceptada al mergear.
- ~~Preferencia en otro dispositivo~~ Gus: alcanza con el navegador hasta `datos-en-la-nube`.
- ~~Glosario, manifiestos, idioma inicial, revisión nativa~~ respondidas por Gus el 15-oct-2026 (§4, §9, §10 y §12).
- Sin preguntas abiertas.
