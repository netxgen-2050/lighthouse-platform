# Proposal

## Why

Hoy las decisiones del Fogón son una tarjeta con votos de ejemplo, y la lente "Decisiones que suben" de la holarquía muestra su camino, pero **no se puede abrir una propuesta**: no se ve quién la presenta, qué problema resuelve, en qué fase está ni qué se discutió. El 27-oct-2026 Gus aprobó el boceto de la gobernanza fractal (`NS_platform/Documentation/mockup/gobernanza-fractal-boceto.html`), que suma "Abrir la propuesta": ficha, fases, discusión con concerns y lo que cada persona puede hacer **según cuánto la implica la decisión**, no según un cargo fijo. Este cambio lo lleva al prototipo.

Está **inspirado en Formal Consensus, pero no al pie de la letra**: toma las fases, los concerns con principio y el bloqueo con razón, y deja afuera lo que el boceto no pide.

**Reemplaza a `fogon-consenso-formal`**, que Gus no aprobó (nota 21 G1, backlog D32). Esa carpeta **no se borra**: queda como antecedente y no se implementa. Lo que se reusa de ella (registros de solo agregar, la facilitación que nunca decide, la red sin texto de la deliberación) se reescribe acá.

## What Changes

- **"Abrir la propuesta"**: un botón en cada tarjeta de decisión del Fogón (`/fogon`) y en el panel de la lente "Decisiones que suben" (`/fogon/gobernanza`), solo para las decisiones que tienen una propuesta de ejemplo. Lleva a `/fogon/propuestas/[id]`.
- **Página de la propuesta**, con su ficha: quién presenta, el problema, lo que se propone, el tiempo, en qué acuerdo se apoya, la plata (monto y fuente, simulada; "sin dato" si falta) y los principios que toca.
- **Fases**, en dos recorridos (B1–B3):
  - **decisión simple**: presentación, 3 días para objetar, cierre;
  - **decisión importante**: borrador, presentación, preguntas para aclarar, discusión abierta, concerns (nombrarlos y clasificarlos por tema), resolver concerns, llamado al consenso, cierre;
  - plazo por defecto de 7 días, configurable por holón; participación mínima para cerrar.
- **Discusión con tipos**: pregunta, respuesta, comentario, concern (con nombre, principio, tema y estado), propuesta de resolución (contrapropuesta), sugerencia del Guardián y cierre. Más: sumarse a un concern, **clasificar los concerns por tema en la fase de concerns** (C1), hacerse a un lado, bloquear citando un principio de la **lista de principios del Lighthouse** (C2), decidir si un bloqueo es legítimo (lo decide el grupo, C3), nuevas versiones con historial.
- **Principios del Lighthouse (C2)**: una lista inicial con la regeneración y la vida en el centro, tomando como referencia la Declaración Universal de los Derechos de la Madre Tierra y principios regenerativos de comunidades de referencia (que no se nombran). Vive en datos de ejemplo marcada "borrador, a ratificar por el común", detrás de una **costura** para leerla del manifiesto de la meta-tribu Lighthouse cuando exista esa spec.
- **Permisos por nivel de implicación (A3)**: la matriz del boceto (15 acciones × 7 niveles: visita, red, del común, del ámbito, afectada, rol de proceso, quien presenta) como **datos tipados en un solo lugar**, con tests, más la disponibilidad de cada acción por fase. Dos cambios respecto del boceto, decididos por Gus: **sin cuenta no se ve nada de la propuesta** (A2: la columna visita es toda "no" y la página invita a abrir una cuenta) y **quien presenta puede levantar concerns, sumarse y bloquear su propia propuesta** (C4: puede cambiar de opinión al escuchar), pero sigue sin decidir la legitimidad de los concerns sobre su pedido (F3). Un selector "Mirá la propuesta como…" simula cada nivel. La tabla completa también se ve en la página.
- **Declararse afectada** con un motivo de una línea; el grupo puede objetarlo (A1).
- **Cierre**: consenso, consenso con personas que se hacen a un lado, bloqueo, o **sin consenso al vencer** (se pausa y vuelve con cambios; si es urgente, sube al nivel de arriba, D1). Reabrir solo con un nuevo consenso (D3). Evaluación del proceso breve y opcional (dos preguntas, F4).
- **Mecanismos para priorizar o repartir (D2)**: en la propuesta y en cada contrapropuesta hay un lugar para **sugerir** un mecanismo (voto cuadrático, puntos, voto por convicción u otro), lo sugiera una persona participante o Hifa (simulada). La sugerencia queda visible con "sirve para priorizar o repartir; no reemplaza al consenso". El voto cuadrático enlaza a las consultas que ya existen; los otros mecanismos **no se construyen**.
- **Hifa facilitadora, simulada**: resume, sugiere temas para clasificar concerns, recuerda reglas y plazos, propone pasar de fase y puede sugerir un mecanismo; una persona confirma. Nunca decide, cierra ni declara ilegítimo un bloqueo.
- **Guardián (arquetipo de IA, simulado; E1 y F1)**: no es un rol humano. Antes de aprobar, **sugiere** el posible impacto o la posible ilegitimidad de una decisión cuando ve una contradicción con los principios del Lighthouse o con una decisión tomada antes. La sugerencia queda visible; una persona puede **respaldarla como concern**; si nadie la respalda, la propuesta sigue su curso. Nunca decide ni declara nada ilegítimo.
- Todo en el navegador, con datos de ejemplo. Textos es/en (ADR-004). Términos con peso legal nuevos con ⚖ y `borrador: true`. Accesible con teclado y con la auditoría de axe en verde.
- **Cuatro noches**, con cortes (ver tasks): 1) modelo, permisos, principios, ficha y fases de solo lectura; 2) discusión con acciones, clasificación de concerns y permisos en vivo; 3) bloqueo, afectadas, cierre y evaluación; 4) Hifa, Guardián y mecanismos sugeridos.

**Valores de gobernanza.** Gus respondió los bloques A–F el 29-oct-2026 (design §1). Todos viven en datos o constantes (`lib/fogon/propuestas/reglas.ts` y `permisos.ts`), así que cambiar uno no obliga a reescribir pantallas.

**Fuera de alcance:**
- Base de datos: todo vive en el navegador (clave nueva que "Borrar todo" borra).
- IA real o conexión con la API de Claude: Hifa y el Guardián son guionados y están marcados como simulados. La IA real necesita su propia decisión de privacidad (nota 21 G5).
- Notificaciones reales: "Recibir avisos" está en la matriz y se muestra como permiso, pero no manda nada.
- Firmas o constancias en cadena (EAS): los registros tienen la forma de constancia de ADR-012, sin firmar ni publicar.
- Abrir la página sin cuenta: por A2 no se abre nunca sin cuenta; el nivel "visita" solo existe en el selector para mostrar la invitación a abrir una cuenta.
- El manifiesto de la meta-tribu Lighthouse y la ratificación de los principios: spec aparte. Acá solo la lista inicial y la costura.
- Construir los mecanismos nuevos (puntos, voto por convicción u otros) o votar dentro de la propuesta: solo se sugieren; el voto cuadrático ya existe en las consultas.
- Consenso perezoso con Semillas en juego (Colony): posibilidad de diseño futura para D1 (backlog D35). No se diseña.
- Delegación de voz (F2): queda para el backlog.
- Qué tipo de decisión va por consenso y cuál por voto cuadrático (nota 21 G2, backlog D32).
- Ponderar la voz con contexto (nota 21 G4).
- Las decisiones del fideicomiso (asamblea de beneficiarios): su regla la fija el contrato y **no** tienen propuesta de consenso.
- Crear propuestas nuevas desde la pantalla: solo las de ejemplo.
- Consulta abierta previa (backlog D25): otro cambio.

## Capabilities

### New Capabilities
- `fogon-propuestas`: la página de cada propuesta del Fogón (ficha, fases, discusión con concerns clasificados, cierre y evaluación), los permisos por nivel de implicación como datos, la lista de principios del Lighthouse con su costura, los mecanismos sugeridos para priorizar o repartir, la facilitación simulada y el Guardián simulado (que sugieren y nunca deciden) y los botones "Abrir la propuesta" desde el Fogón y desde la lente Decisiones.

### Modified Capabilities
<!-- ninguna: los botones de entrada se especifican dentro de `fogon-propuestas` -->

## Impact

- Nuevo: `lib/fogon/propuestas/` (tipos, reglas con los valores A–F, matriz de permisos, fases y plazos, registros de solo agregar y estado derivado, fuente de principios, mecanismos, propuestas de ejemplo, guion de Hifa y del Guardián; con tests), `app/fogon/propuestas/[id]/` (página y componentes), `lib/idioma/textos/fogon-propuestas.ts`.
- Se toca: `app/fogon/fogon-cliente.tsx` y `app/fogon/gobernanza/lentes/panel-decisiones.tsx` (botón), `lib/demo/claves.ts` (clave `lh-fogon-propuestas`), `lib/legal/terminos.ts` (⚖ nuevos en borrador), e2e nuevo `e2e/fogon-propuestas.spec.ts` y `e2e/accesibilidad.spec.ts`.
- Sin dependencias nuevas, sin tablas, sin pedidos de red, sin integraciones. Toca **permisos** (de una decisión, no de la plataforma: no cambia `lib/permisos/`) y **plata simulada**: pide revisión del agente `arquitecto` (ya revisó la versión del 28-oct; las respuestas A–F cambian la matriz y suman el Guardián de IA, así que pide una segunda mirada).
- `fogon-consenso-formal` queda **reemplazado** por este cambio (no se borra ni se implementa).
- Depende de lo que ya está en `dev`: `fogon-gobernanza-holarquia` (lente Decisiones, `caminos.ts`, parámetros de decisión), la holarquía con roles y las consultas con voto cuadrático (`/fogon/consultas`).
