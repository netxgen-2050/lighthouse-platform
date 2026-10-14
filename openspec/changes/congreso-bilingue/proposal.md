# Proposal

## Why

Al Congreso de febrero 2027 lo van a mirar inversores del exterior, y la página de los organizadores tiene que poder mandarlos directo a una versión en inglés. Hoy la vitrina (`congreso-vitrina`) es solo en español (voseo). Gus pidió que **la página del Congreso** sea bilingüe español / inglés, sin traducir todavía el resto de la plataforma.

Se apila sobre `congreso-vitrina` (que a su vez se apila sobre `congreso-tema-evento`) y entra en una noche.

## What Changes

- **Contenido del evento en dos idiomas.** En el contenido tipado de `lib/congreso/`, cada texto traducible pasa a ser `{ es, en }`. `obtenerEvento(idioma)` devuelve el evento ya resuelto en el idioma pedido (por defecto `"es"`, así la vitrina no se rompe). Si falta la traducción, **cae al español y lo marca**: nunca devuelve un texto vacío.
- **Textos fijos traducidos** de las piezas del evento ("Quiero ir", "ejemplo", "Por confirmar", la cuenta regresiva…) y de las piezas de NetX dentro de `/congreso` (cinta y modo de origen, territorio, tribus, pasos del ticket, `RegistroTicket`, sello Genesis, diálogo de demo, llamado a sumarse). Diccionarios `es`/`en` con tipos que obligan a que el inglés tenga todas las claves.
- **Dos direcciones:** `/congreso` (español) y `/congreso/en` (inglés), con las mismas anclas (`#entradas`, `#ticket`, …), para que la página de los organizadores enlace directo a `/congreso/en#entradas`. Se comparan `?lang=en`, `/congreso/en` y "solo preferencia" en `design.md`; se recomienda `/congreso/en`.
- **Selector ES / EN** visible en la barra del evento (también en móvil), hecho con dos enlaces usables con teclado, con el idioma actual marcado con `aria-current`. La elección **se recuerda por persona** (en el navegador, con el prefijo de la persona si hay sesión) y al abrir `/congreso` con preferencia inglés se pasa a `/congreso/en`.
- **`lang` correcto:** el contenedor de la vitrina lleva `lang="es"` o `lang="en"`; el marco de NetX (rail, barra superior, Hifa, "Reportar") sigue en español con `lang="es"`.
- **⚖ en inglés como borrador:** los cuatro términos de la vitrina (`ticket`, `presencia`, `obra`, `encuentroeducativo`) suman su versión en inglés en el catálogo `lib/legal/terminos.ts`, marcada siempre como borrador ("Draft: text under review"). La bitácora anota en qué idioma se mostró.
- **Aviso de prototipo** en la versión en inglés: "Internal prototype · sample data" junto al original "Prototipo interno · datos de ejemplo" (`lang="es"`).
- Lo que ya hace la vitrina vale igual en `/congreso/en`: abierta sin cuenta, guarda el origen (UTM), vincular el ticket pide cuenta (vuelve a `/congreso/en#ticket`), compra de demo.

### Fuera de alcance

- **El resto de la plataforma sigue solo en español** (rail, barra superior, Sumarte, tribus, territorio, Hifa, Bitácora, mails). Posible paso futuro: plataforma bilingüe con una librería de i18n y su ADR, y habilitar "English" en Configuración (hoy dice "próximamente"; no se toca).
- Enlaces desde `/congreso/en` a páginas de NetX que siguen en español (Sumarte, mapa, tribus): se avisa "(in Spanish)" en el texto del enlace; no se traducen esas páginas.
- Otros idiomas, `/congreso/es`, traducción automática, detección por el idioma del navegador y SEO más allá de `hreflang`.
- Revisión legal de los ⚖ en inglés: quedan como borrador.
- Servir la vitrina fuera de NetX (sigue como pregunta abierta de `congreso-vitrina`).
- Datos reales del Congreso y su traducción oficial (los textos en inglés son de ejemplo, como los en español).

## Capabilities

### New Capabilities
- `congreso-bilingue`: la vitrina del Congreso en español e inglés: contenido y textos en dos idiomas con caída marcada al español, dos direcciones, selector, preferencia por persona, `lang`, ⚖ en inglés como borrador y las reglas de calidad de la traducción.

### Modified Capabilities
- (ninguna en `openspec/specs/`: `congreso-contenido-evento`, `congreso-tema-evento` y `congreso-vitrina` todavía no están archivadas. El design anota qué cambia de cada una: la firma de `obtenerEvento`, los formatos con idioma y el hueco del selector en la barra.)

## Impact

- Código: `lib/congreso/evento.ts` (tipo `Bilingue`, `obtenerEvento(idioma)`), `lib/congreso/idioma.ts` (nuevo: `Idioma`, resolución y caída), `lib/congreso/evento-ejemplo.ts` (textos `{ es, en }`), `lib/congreso/formatos.ts` (con idioma), `lib/congreso/interfaz.ts` (nuevo), `app/congreso/vitrina.tsx` (nuevo, lo que hoy arma `page.tsx`), `app/congreso/page.tsx` y `app/congreso/en/page.tsx`, `app/congreso/evento/*` (prop `idioma`, hueco del selector), `app/congreso/netx/*` (textos `es`/`en`, `selector-idioma.tsx`, `preferencia-idioma.tsx`), `app/congreso/registro-ticket.tsx` (prop `idioma`, español sin cambios), `components/termino-legal.tsx` y `components/tooltip-termino.tsx` (prop `idioma`), `lib/legal/terminos.ts` (+`en` borrador en 4 claves), `lib/demo/claves.ts` (+`lh-congreso-idioma`), `lib/demo/bitacora.ts` (campo `idioma` opcional), `lib/sesion/rutas-publicas.ts` (+`/congreso/en`).
- Tests: unitarios de resolución, completitud y "sin texto sin traducir"; `e2e/congreso-en.spec.ts` nuevo; `e2e/accesibilidad.spec.ts` y el bucle de tema oscuro de `e2e/configuracion.spec.ts` suman `/congreso/en`.
- **Toca permisos y datos personales (pendiente de revisión del arquitecto):** abre una ruta nueva sin cuenta (`/congreso/en`), guarda una preferencia por persona en el navegador y agrega un campo a la bitácora de términos legales. Sin base de datos ni integraciones externas; sin plata nueva (los montos siguen siendo de ejemplo).
- Depende de `congreso-vitrina` (rama `agente/congreso-bilingue` apilada sobre `agente/congreso-vitrina`).
