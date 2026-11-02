# Proposal

## Why

El común del Lighthouse no tiene un manifiesto propio: hoy tiene un "Pacto de convivencia" de seis compromisos (`lib/manifiestos/datos.ts`, id `lighthouse`) sin principios, y `fogon-propuestas` necesita una **lista de principios** para citar al bloquear un concern y para las sugerencias del Guardián (IA), que por ahora deja como datos de ejemplo detrás de una costura (backlog D36, C2). El 29-oct-2026 Gus definió el pedido: la meta-tribu se llama **Lighthouse VRN**, su manifiesto pone **la regeneración y la vida en el centro de las decisiones**, toda persona tiene que adherir para participar en la gobernanza y cada tribu suma sus principios sin contradecirlo.

## What Changes

- **Manifiesto de Lighthouse VRN (borrador, a ratificar por el común)**, redactado en este cambio (design §3), en voseo y tono de Juego B, es/en. Reemplaza al "Pacto de convivencia del Lighthouse" (mismo id `lighthouse`, misma adhesión). Partes:
  - el **propósito** en una frase;
  - **15 principios** en cinco grupos (tierra, agua, comunidad, economía, generaciones futuras), cada uno con una línea de qué significa en la práctica;
  - los **siete derechos de la tierra** que asumimos;
  - los **compromisos** de quien adhiere;
  - **cómo se cambia** el manifiesto: por consenso del común, con el proceso de `fogon-propuestas`.
  - Se inspira en principios de comunidades regenerativas de referencia, en la Declaración Universal de los Derechos de la Madre Tierra y en el vault de permacultura, **sin nombrar a las comunidades de referencia**.
- **Fuente única de principios**: los principios viven en los datos del manifiesto, con ids estables. Se expone un adaptador con la forma de `FuentePrincipios` de `fogon-propuestas` (`estado: "borrador"`, `origen: "manifiesto"`) para que esa costura cambie en una línea. Hifa y el Guardián (IA) leen de la misma fuente.
- **Ficha de "Lighthouse VRN Commons" en Tribus** (`/tribus/lighthouse`): el propósito, los principios por grupo, los derechos, los equipos transversales, el estado de adhesión y los botones para leer y adherir. Una tarjeta destacada en `/tribus` lleva a la ficha. El nombre "Commons" es **provisorio** y vive en una sola constante (design §2 propone alternativas).
- **Equipos transversales del Lighthouse VRN** ("una startup para el procomún"): son los **círculos del común** de la holarquía, no una entidad nueva. Se renombran dos y se suman dos para cubrir la lista de Gus: legal, permacultura y regeneración, marketing y comunicación, tecnología, gestión de contratistas, gobernanza, cuidado y conflictos, agua. "Tokenomics y Semillas" se mantiene (ver preguntas).
- **Adhesión obligatoria para participar en la gobernanza**: una sola regla (`puedeParticiparEnGobernanza`). Sin adhesión al manifiesto de Lighthouse VRN se puede mirar el Fogón, las consultas y la holarquía, pero no votar ni repartir créditos. En su lugar se muestra un aviso con el enlace al manifiesto. `fogon-propuestas` (concerns, bloqueos, comentarios) usa la misma regla cuando se implemente.
- **Principios propios de cada tribu**: el manifiesto de una tribu puede **sumar** principios, nunca contradecir ni reemplazar los de Lighthouse VRN. La regla está escrita en el manifiesto y hay una validación simple en los datos (`validarPrincipiosDeTribu`, con tests). Dos tribus de ejemplo suman uno o dos principios; la lectura del manifiesto de cada tribu muestra "suma a los principios de Lighthouse VRN".
- **Vista NetX**: en "Juego A o Juego B" (`/netx/financiamiento`), un bloque corto "Las decisiones, con la vida en el centro" con el propósito, los cinco grupos y el enlace a la ficha.
- ⚖ nuevos en borrador: `manifiestovrn`, `derechostierra`, `adhesiongobernanza`. Además se actualiza `adhesion`. Datos de ejemplo marcados, accesible con teclado y axe en verde.
- **Dos noches**: 1) datos, fuente de principios, ficha y lectura; 2) regla de adhesión en el Fogón y las consultas, principios de tribu, Vista NetX y e2e.

**Fuera de alcance:**
- **No va en Sumarte** (decisión de Gus): ni planes ni alta mencionan el manifiesto.
- Proponer un cambio al manifiesto desde la pantalla, ratificarlo o votarlo: el manifiesto explica el proceso y enlaza al Fogón; el flujo es de `fogon-propuestas`.
- Implementar `fogon-propuestas` o su Guardián: acá solo la fuente que van a leer y la regla de adhesión.
- Base de datos: la adhesión sigue en el navegador (clave de membresía existente). No hay tablas ni migraciones.
- Guardar a qué versión del manifiesto adhirió cada persona, o pedir que se vuelva a adherir cuando cambia.
- Compradores de un lote privado que quizás no adhieran: solo se anota como pregunta, **no se diseña**.
- Aprobación de la adhesión por el común (B6, P8): sigue simulada como hoy.
- Un formulario para que una tribu edite sus principios: los principios de tribu son datos de ejemplo.
- El nuevo nivel de abstracción en Explorar el territorio y en Tribus (switch del mapa entre tribus que ocupan territorio y equipos transversales): **solo se anota como pregunta de diseño** con 3 opciones en design §8. No se implementa.
- Cambiar "el común" en los textos corridos de toda la app: solo cambian los nombres propios visibles (ficha, raíz de la holarquía, tarjeta en Tribus).
- Revisión legal del manifiesto: es borrador; los derechos de la tierra no se presentan como texto jurídico.

## Capabilities

### New Capabilities
- `manifiesto-lighthouse-vrn`: el manifiesto de la meta-tribu (propósito, principios, derechos, compromisos, cómo se cambia, equipos transversales), su ficha en Tribus, la fuente única de principios, los principios propios de las tribus que suman sin contradecir, y su presencia en la Vista NetX.
- `gobernanza-adhesion`: la regla que exige adherir al manifiesto de Lighthouse VRN para participar en cualquier aspecto de la gobernanza, y cómo se ve cuando falta.

### Modified Capabilities
<!-- ninguna en openspec/specs: los cambios a tribu-adhesion-manifiesto y fogon-gobernanza-holarquia (todavía sin archivar) se describen dentro de las capacidades nuevas -->

## Impact

- **Nuevo:** `lib/manifiestos/lighthouse-vrn.ts` (manifiesto, principios, derechos, equipos, nombre provisorio, adaptador de fuente; con tests), `lib/manifiestos/principios-tribu.ts` (validación; con tests), `lib/gobernanza/participar.ts` (regla de adhesión; con tests), `app/tribus/[id]/ficha-comun.tsx`, `lib/idioma/textos/manifiesto-vrn.ts`, `e2e/manifiesto-lighthouse-vrn.spec.ts`.
- **Se toca:**
  - `lib/manifiestos/datos.ts`: el id `lighthouse` pasa a armarse desde el manifiesto nuevo, y las tribus de ejemplo suman principios.
  - `app/tribus/[id]/page.tsx`, `app/tribus/[id]/manifiesto/lectura.tsx` y `app/tribus/page.tsx`.
  - `lib/gobernanza/datos.ts`: círculos del común y nombre de la raíz.
  - `app/fogon/fogon-cliente.tsx`, `lib/fogon/` (motivo nuevo) y `app/fogon/consultas/[id]/consulta-cliente.tsx`.
  - `app/netx/financiamiento/secciones-modelo.tsx`, `lib/legal/terminos.ts`, `lib/idioma/textos/tribus.ts` y `lib/idioma/textos/fogon.ts`.
  - Tests existentes que nombran el "Pacto de convivencia" o "Permacultura y suelo" (`lib/manifiestos/manifiestos.test.ts`, `e2e/fogon-gobernanza.spec.ts`) y `e2e/accesibilidad.spec.ts`.
- **Sin dependencias nuevas**, sin tablas, sin pedidos de red, sin integraciones. Toca **permisos de participación** (una regla nueva sobre la membresía del navegador; no cambia `lib/permisos/`), así que pide revisión del agente `arquitecto`.
- **Relación con otros cambios:**
  - `fogon-propuestas` (rama `spec/fogon-propuestas`, sin merge): este cambio es la fuente de su lista de principios. Sus ids se conservan salvo tres, que se mapean (design §4).
  - `fogon-gobernanza-holarquia` (en `dev`): se reusan sus círculos del común.
  - `tribu-adhesion-manifiesto` (en `dev`): se reusa la lectura y la adhesión.
