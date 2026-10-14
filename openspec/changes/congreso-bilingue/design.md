# Design

## Context

- Parte de `congreso-vitrina` implementado: `app/congreso/page.tsx` arma la vitrina con `await obtenerEvento()`, piezas portables en `app/congreso/evento/` (y `evento/secciones/`), piezas de NetX en `app/congreso/netx/` (con sus textos en `netx/textos.ts`), `/congreso` pública, origen con `GuardarOrigen` y bloque del ticket protegido por sesión, nivel y consentimiento.
- La barra del evento (`congreso-tema-evento`) muestra hoy un indicador fijo "ES".
- `<html lang="es">` lo pone `app/layout.tsx`. Todo el marco de NetX está en español.
- Configuración ya tiene "Idioma" con "English · próximamente" deshabilitado (`e2e/configuracion.spec.ts`). Este cambio no lo toca.
- `lib/demo/claves.ts`: `CLAVES` sigue a la persona en sesión (prefijo `u:<id>:`) y `lib/demo/borrar.ts` borra todas las claves de `NOMBRES_BASE`.
- El ⚖ es `components/termino-legal.tsx` → `components/tooltip-termino.tsx` (textos fijos "Qué significa legalmente: …" y "Borrador: texto a revisar") y anota en la bitácora (`lib/demo/bitacora.ts`: `mostrado`, `huella`, `borrador`).

## Goals / Non-Goals

**Goals:**
- Que la página de los organizadores pueda enlazar directo a la versión en inglés, y a una sección.
- Que un texto sin traducir no pase desapercibido: o lo atrapa un test o se ve marcado en la página.
- No agregar dependencias ni tocar el resto de la plataforma.

**Non-Goals:**
- i18n de la plataforma, librería de traducciones, "English" en Configuración.
- Traducir Sumarte, territorio, tribus o la Bitácora.

## Decisions

### 1. Tipos: `Bilingue` y un evento genérico en su texto
- `lib/congreso/idioma.ts` (puro, sin dependencias): `type Idioma = "es" | "en"`, `IDIOMAS`, `esIdioma(x)`, `type Bilingue = { es: string; en?: string }` y `resolver<T>(fuente, idioma) → { valor, sinTraducir: string[] }`.
- En `lib/congreso/evento.ts`, los tipos pasan a tener un parámetro para el tipo de texto: `Evento<Tx = string>`, `Parada<Tx>`, `Voz<Tx>`, etc. Solo los campos traducibles usan `Tx` (títulos, textos, etiquetas, descripciones, preguntas, respuestas, lema, bajada, `precio.unidad`, `momentoClave.etiqueta`, cierre, notas). No traducibles quedan `string`: ids, URLs, ISO, `iniciales`, nombres de personas y del evento, `icono`, `tono`, `estado`, montos y moneda.
- `evento-ejemplo.ts` exporta `EVENTO_EJEMPLO: Evento<Bilingue>`. `obtenerEvento(idioma: Idioma = "es"): Promise<EventoEnIdioma>` con `EventoEnIdioma = Evento<string> & { idioma: Idioma; sinTraducir: readonly string[] }`. El valor por defecto mantiene compilando lo que ya llama `obtenerEvento()`.
- `resolver` recorre el objeto: un objeto cuyas únicas claves son `es` y `en` y cuyo `es` es texto se trata como `Bilingue`; si `en` falta o es `""` (o solo espacios), devuelve `es` y anota la ruta (`"voces.principales.0.afiliacion"`). Si `es` está vacío, el test del contenido falla (nunca se resuelve a vacío).
- El contrato de la costura (`congreso-tema-evento` design §1) no cambia: el día que entre UnityHub, el adaptador entrega `Evento<Bilingue>` (o solo `es`, y el inglés cae marcado).
- **Alternativa descartada:** dos archivos de contenido, uno por idioma. Se desincronizan (una parada nueva en uno y no en el otro) y no hay caída por texto.

### 2. Textos fijos: diccionarios tipados
- `lib/congreso/interfaz.ts`: textos fijos de las piezas portables (`const ES = {...}`, `const EN: Textos = {...}` con `type Textos = { [K in keyof typeof ES]: (typeof ES)[K] extends string ? string : (typeof ES)[K] }`). TypeScript obliga a que el inglés tenga todas las claves. Entradas con datos son funciones (`vanDeTribu: (n, m) => …`).
- Las piezas portables reciben `idioma?: Idioma` (por defecto `"es"`) y leen `textosEvento(idioma)`. Se suma `@/lib/congreso/interfaz` y `@/lib/congreso/idioma` a las importaciones permitidas del test de portabilidad.
- `app/congreso/netx/textos.ts` pasa a tener `es` y `en` con el mismo patrón. `RegistroTicket` suma `idioma?: Idioma` con su diccionario al lado; el español queda **idéntico** (los e2e de hoy siguen valiendo).
- Lista de neutros (`NEUTROS` en `lib/congreso/idioma.ts`): valores que pueden ser iguales en los dos idiomas: "NetX", "UnityHub", "Genesis", "USD", "ES", "EN", códigos de ejemplo. Un test recorre diccionarios y contenido y falla si un `en` es igual a su `es` fuera de esa lista: atrapa el "copié y no traduje".
- Voseo: el test de tuteo de `congreso-tema-evento` se aplica a los lados `es`.

### 3. Formatos con idioma
- `rangoFechas(inicio, fin, idioma)`: `"5–9"` + `"febrero 2027"` / `"February 2027"` (con `Intl.DateTimeFormat` y `timeZone: "UTC"`, que las fechas son sin hora).
- `textoPrecio(tipo, idioma)`: separador de miles `es-AR` / `en-US` ("USD 1.200" / "USD 1,200"); sin precio, "Precio sin dato" / "Price not available". La unidad (`c/u` / `each`) viene del contenido.
- La cuenta regresiva toma sus etiquetas ("días", "Llegó el día", "Calculando la cuenta regresiva") de `interfaz.ts`.

### 4. Direcciones: se recomienda `/congreso/en`

| Opción | A favor | En contra |
|---|---|---|
| `?lang=en` | Una sola página; cambio chico | Al combinarse con UTM y anclas queda largo (`/congreso?lang=en&utm_source=…#entradas`), es fácil que alguien lo copie mal o que una herramienta lo descarte; vuelve la URL ambigua (¿`/congreso` es español o "lo que prefiera la persona"?); `hreflang` y la caché funcionan peor con parámetros |
| **`/congreso/en`** | Dirección corta y obvia para un organizador ("la versión en inglés está en /congreso/en"); se combina limpio con UTM y anclas; cada idioma es una página propia (`hreflang`, título y descripción en inglés); el rail ya la reconoce dentro de Congreso | Una ruta más (un archivo de 10 líneas) y una línea más en rutas públicas; reserva el tramo `en` bajo `/congreso` |
| Solo preferencia guardada | Ninguna dirección nueva | **No permite enlazar directo al inglés**: un inversor que llega desde la página de los organizadores ve español hasta que encuentra el selector. No cumple el pedido |

**Recomendación: `/congreso/en`**, con `/congreso` como español (no hay `/congreso/es`). La página de los organizadores enlaza `/congreso/en?utm_source=pagina-oficial&utm_medium=enlace&utm_campaign=congreso-2027#entradas`.

- `app/congreso/vitrina.tsx` (server): `Vitrina({ idioma, parametros })` con todo lo que hoy arma `page.tsx`. `app/congreso/page.tsx` y `app/congreso/en/page.tsx` la llaman con `"es"` y `"en"`; cada una con su `metadata` (título y descripción en su idioma) y `alternates.languages: { es: "/congreso", en: "/congreso/en" }`.
- `lib/sesion/rutas-publicas.ts`: `/^\/congreso(\/en)?$/` (reemplaza la de `congreso-vitrina`). `/congreso/fr` sigue sin existir (404 de Next) y no es pública.
- Las anclas son las mismas en los dos idiomas (`#entradas`, no `#tickets`): las ids no se ven y así un enlace sirve cambiando solo el `/en`.
- La tabla de enlaces de vuelta de `congreso-vitrina` (design §9) suma la variante en inglés de cada fila.
- <!-- arquitecto --> **`/congreso/en` es una promesa pública:** una vez que los organizadores la publiquen, no se puede cambiar sin romper enlaces. Si más adelante la plataforma entera pasa a i18n con prefijo de idioma (`/en/...`), `/congreso/en` se mantiene como redirección permanente a la dirección nueva. Ver `docs/decisiones/ADR-003-idioma-del-congreso.md` (Propuesta).

### 5. Selector de idioma
- La barra del evento (portable) suma el hueco `selectorIdioma?: ReactNode`. Sin hueco, muestra el indicador fijo del idioma actual (como hoy "ES"). El selector queda visible en todos los anchos (como el logo y "Entradas").
- `app/congreso/netx/selector-idioma.tsx` (cliente): un grupo `role="group"` con nombre "Idioma · Language" y dos `<a>`: "ES" (`href="/congreso"`, `hreflang="es"`, `lang="es"`) y "EN" (`href="/congreso/en"`, `hreflang="en"`, `lang="en"`). Nombre accesible = texto visible + idioma: "ES · Español", "EN · English" (la parte larga en `sr-only`). El actual lleva `aria-current="true"` y se distingue con subrayado y peso, no solo color.
- Al hacer clic (o Enter): guarda la preferencia y navega a la otra versión con la query y el ancla actuales (`location.search + location.hash`). Con Ctrl/Cmd/clic medio deja el comportamiento normal del enlace (abre en otra pestaña sin guardar).
- **Alternativa descartada:** un `<select>` o un botón con `aria-pressed`: cambian de dirección sin ser enlaces, no se pueden abrir en otra pestaña y el lector de pantalla no anuncia que navega.

### 6. Preferencia por persona
- `lib/demo/claves.ts` suma `idiomaCongreso: "lh-congreso-idioma"` a `NOMBRES_BASE`: con sesión se guarda con el prefijo de la persona; sin sesión, por navegador. Al estar en `NOMBRES_BASE`, "borrar mis datos" (`lib/demo/borrar.ts`) la borra y la importación de datos previos la cubre.
- Valores `"es"` o `"en"`; cualquier otra cosa se ignora (`esIdioma`).
- `app/congreso/netx/preferencia-idioma.tsx` (cliente, sin interfaz) se dibuja **solo en `/congreso`**: si la preferencia es `"en"`, `router.replace("/congreso/en" + search + hash)`. En `/congreso/en` no se dibuja: la dirección explícita en inglés siempre gana. Así un enlace en inglés de los organizadores nunca se pasa al español, y quien eligió inglés no tiene que volver a elegirlo.
- Espera a que la sesión deje de estar "cargando" para leer la clave con el prefijo correcto.
- Asimetría aceptada: quien prefiere inglés y abre un enlace a `/congreso` termina en inglés. Es lo que pidió ("que se recuerde").
- Es una preferencia de interfaz, no un dato sensible; igual queda en la revisión del arquitecto porque es un dato más por persona.

### 7. `lang` y marco
- El contenedor `TemaEvento` recibe `lang` y lo pone en su `div`. El marco no cambia: `<html lang="es">`.
- Textos en español dentro del inglés (aviso de prototipo original, ⚖ sin traducción) van en un `span lang="es"`.
- Limitación conocida: si un texto del **contenido** cae al español, no lleva `lang="es"` propio (las piezas reciben `string`); la sección muestra la nota visible "Part of this section is only available in Spanish." (`BloqueFuente` la dibuja si alguna ruta de `sinTraducir` empieza por el campo de esa sección, con un mapa sección → prefijos). Con el contenido de ejemplo no pasa: un test exige `sinTraducir` vacío.

### 8. ⚖ en inglés
- `lib/legal/terminos.ts`: las claves `ticket`, `presencia`, `obra` y `encuentroeducativo` suman `en: { titulo, texto }` con el comentario "Traducción nueva: borrador a revisar antes de cualquier uso real". Toda versión `en` es borrador por definición.
- `TerminoLegal` suma `idioma?: Idioma`. Con `"en"`: si hay `en`, muestra título y texto en inglés con "Draft: text under review" y etiqueta "What it means legally: …"; si no hay, muestra el español dentro de `lang="es"` con "Only available in Spanish". `TooltipTermino` recibe esos dos textos fijos por props (con los valores en español por defecto, así el resto de la plataforma no cambia).
- Bitácora: la entrada de `termino-legal` suma `idioma?: "es" | "en"` (ausente = `"es"`, compatible con lo guardado). `mostrado` y `huella` se calculan sobre lo que se mostró de verdad (el inglés si se mostró en inglés). La validación de `lib/demo/bitacora.ts` acepta el campo opcional.
<!-- arquitecto: tres precisiones para que la bitácora diga la verdad sobre lo que se mostró. -->
- `idioma` es el idioma **del texto que se mostró**, no el de la página: un ⚖ sin inglés en `/congreso/en` se anota con `idioma: "es"` (la `ruta` ya dice que fue en `/congreso/en`).
- Con `idioma: "en"`, la entrada va **siempre con `borrador: true`**, aunque la versión en español de esa clave no sea borrador (`ticket`, `presencia` y `obra` no lo son). Si no, la bitácora registraría como texto revisado una traducción que nadie revisó.
- `esEntrada` descarta la entrada si `idioma` está presente y no es `"es"` ni `"en"` (se rechaza lo que sobra, no solo lo que falta).
- La bitácora no se anota sin sesión (`anotarEnBitacora` ya lo impide); no cambia.

### 9. Lo demás de la vitrina en inglés
- Origen: `Vitrina` hace `leerParametros` y `GuardarOrigen` en los dos idiomas.
- Ticket: el llamado usa `hrefSumarte("/congreso/en#ticket", "explorador")` en inglés. Texto: "Join for free to link your ticket (sign-up is in Spanish for now)". Al volver de Sumarte llega a `/congreso/en#ticket`.
- <!-- arquitecto --> La decisión de qué mostrar en el bloque del ticket es **la misma función** `queMostrarEnTicket` de `congreso-vitrina` (design §11), sin copia por idioma: el idioma solo cambia los textos. La fila de política pendiente en inglés: "Accept the privacy policy to link your ticket (in Spanish)", con el mismo `href`. La pantalla de consentimiento y la política siguen solo en español: la persona acepta un texto en español (ver pregunta para Gus).
- Diálogo de demo: "Here you would buy your ticket" / "In the real version, this button would open the purchase of the selected pass…" / "Prototype: nothing is charged and no other page opens." Tampoco dice quién cobra.
- Enlaces a `/territorios/lighthouse` y `/tribus` desde el inglés: "Explore the map in NetX (in Spanish)", con `hreflang="es"`.

### 10. Tests
- Unitarios: `lib/congreso/idioma.test.ts` (resolución completa, caída con ruta, `""` cae, ningún `Bilingue` queda tras resolver, `esIdioma`), `lib/congreso/evento.test.ts` (ejemplo en `"en"` con `sinTraducir` vacío; todo `es` no vacío; neutros), `lib/congreso/formatos.test.ts` (inglés), `lib/congreso/interfaz.test.ts` y `app/congreso/netx/textos.test.ts` (claves iguales y ningún `en === es` fuera de neutros), `lib/legal/terminos.test.ts` (las 4 claves tienen `en`), `lib/demo/bitacora.test.ts` (acepta `idioma` y entradas viejas sin él), `lib/demo/claves.test.ts` / `borrar.test.ts` (la clave nueva), `lib/sesion/rutas-publicas.test.ts` (`/congreso/en` pública; `/congreso/fr` no), test de portabilidad (importaciones nuevas permitidas) y `renderToStaticMarkup` del selector (dos enlaces, `aria-current`, `lang`/`hreflang`).
- `e2e/congreso-en.spec.ts`: `lang="en"` en la vitrina y `lang="es"` en `<html>`; aviso en los dos idiomas; textos clave en inglés; ausencia de "Comprar", "ejemplo", "Por confirmar", "Preguntas" y "Sumate" dentro del contenedor `[lang="en"]`, descontando sus descendientes `[lang="es"]` (el marco de NetX no se mira: sigue en español); selector con teclado ida y vuelta conservando el ancla; preferencia (elegir EN → abrir `/congreso` → termina en `/congreso/en`; elegir ES → se queda); `/congreso/en#entradas` sin sesión; llamado del ticket en inglés con su `href`; registro con sesión en inglés; ⚖ en inglés con "Draft"; UTM guardado; diálogo en inglés con Escape.
- `e2e/accesibilidad.spec.ts`: `/congreso/en` en la lista (32 rutas) más la variante con modo de origen y diálogo; `e2e/configuracion.spec.ts`: `/congreso/en` en el bucle de tema oscuro.

## Risks / Trade-offs

- [La traducción de ejemplo es larga y la escribe un agente] → es contenido de ejemplo, como el español; los tests atrapan faltantes y copias sin traducir, no la calidad. Gus o el equipo la revisan en el PR.
- [Un visitante en inglés cae en páginas en español (Sumarte, mapa, tribus)] → los enlaces lo avisan; la plataforma bilingüe queda como paso futuro.
- [Redirección por preferencia: se ve el español un instante antes de pasar al inglés] → aceptado en el prototipo; la alternativa (cookie leída en el servidor) no es por persona y suma un dato más en el servidor.
- [Generizar los tipos del evento toca archivos de los dos cambios anteriores] → el parámetro tiene valor por defecto `string`; lo que ya compila sigue compilando.
- [Dos sistemas de textos (diccionarios del Congreso y el resto de la plataforma sin diccionario)] → acotado a `/congreso`; si se decide i18n general, se migra con su ADR.

## Migration Plan

- Rama `agente/congreso-bilingue` apilada sobre `agente/congreso-vitrina`.
- Volver atrás: revertir el PR. `/congreso/en` deja de existir (404), la clave `lh-congreso-idioma` queda huérfana y sin efecto, y las entradas de bitácora con `idioma` se siguen leyendo (el campo es opcional).
- Al archivar: después de `congreso-tema-evento` y `congreso-vitrina`. Como esos todavía no están en `openspec/specs/`, este cambio trae su propia capacidad; al archivar conviene revisar si los requisitos de la barra ("indicador ES") y de `obtenerEvento()` sin idioma quedan como `MODIFIED`.

## Open Questions

- **Revisado por el arquitecto (14-oct):** ruta pública nueva, preferencia por persona en el navegador y campo nuevo en la bitácora. Ajustes integrados en §4 (dirección como promesa pública, ADR-003), §8 (bitácora: idioma del texto mostrado, borrador siempre en inglés, validación) y §9 (misma decisión del ticket en los dos idiomas). <!-- arquitecto -->
- La preferencia de idioma (`"es"`/`"en"`) es una preferencia de interfaz pedida por la persona: se guarda sin sesión igual que el origen, entra en "Mis datos" y en "borrar mis datos" por estar en `NOMBRES_BASE`. La elegida sin sesión pasa a la cuenta solo con "Importar a mi cuenta"; si no, con sesión arranca en español. Aceptado en el prototipo. <!-- arquitecto -->
