# Proposal

## Why

Hoy las decisiones del Fogón son una tarjeta con votos de ejemplo, y la lente "Decisiones que suben" de la holarquía muestra su camino, pero **no se puede abrir una propuesta**: no se ve quién la presenta, qué problema resuelve, en qué fase está ni qué se discutió. El 27-oct-2026 Gus aprobó el boceto de la gobernanza fractal (`NS_platform/Documentation/mockup/gobernanza-fractal-boceto.html`), que suma "Abrir la propuesta": ficha, fases, discusión con concerns y lo que cada persona puede hacer **según cuánto la implica la decisión**, no según un cargo fijo. Este cambio lo lleva al prototipo.

Está **inspirado en Formal Consensus, pero no al pie de la letra**: toma las fases, los concerns con principio y el bloqueo con razón, y deja afuera lo que el boceto no pide.

**Reemplaza a `fogon-consenso-formal`**, que Gus no aprobó (nota 21 G1, backlog D32). Esa carpeta **no se borra**: queda como antecedente y no se implementa. Lo que se reusa de ella (registros de solo agregar, la facilitación que nunca decide, la red sin texto de la deliberación) se reescribe acá.

## What Changes

- **"Abrir la propuesta"**: un botón en cada tarjeta de decisión del Fogón (`/fogon`) y en el panel de la lente "Decisiones que suben" (`/fogon/gobernanza`), solo para las decisiones que tienen una propuesta de ejemplo. Lleva a `/fogon/propuestas/[id]`.
- **Página de la propuesta**, con su ficha: quién presenta, el problema, lo que se propone, el tiempo, en qué acuerdo se apoya, la plata (monto y fuente, simulada; "sin dato" si falta) y los principios que toca.
- **Fases**, en dos recorridos (valores B1–B3, propuestas a confirmar por Gus):
  - **decisión simple**: presentación, 3 días para objetar, cierre;
  - **decisión importante**: borrador, presentación, preguntas para aclarar, discusión abierta, concerns (listar y agrupar), resolver concerns, llamado al consenso, cierre;
  - plazo por defecto de 7 días, configurable por holón; participación mínima para cerrar.
- **Discusión con tipos**: pregunta, respuesta, comentario, concern (con principio y estado), propuesta de resolución y cierre. Más: sumarse a un concern, hacerse a un lado, bloquear citando un principio de la **lista de principios del Lighthouse** (borrador, a ratificar por el común), decidir si un bloqueo es legítimo (lo decide el grupo), nuevas versiones con historial.
- **Permisos por nivel de implicación**: la matriz del boceto (15 acciones × 7 niveles: visita, red, del común, del ámbito, afectada, rol de proceso, quien presenta) como **datos tipados en un solo lugar**, con tests, más la disponibilidad de cada acción por fase. Un selector "Mirá la propuesta como…" simula cada nivel. La tabla completa también se ve en la página.
- **Declararse afectada** con un motivo de una línea; el grupo puede objetarlo (A1).
- **Cierre**: consenso, consenso con personas que se hacen a un lado, bloqueo, o **sin consenso al vencer** (se pausa y vuelve con cambios; si es urgente, sube al nivel de arriba). Reabrir solo con un nuevo consenso. Evaluación del proceso breve y opcional (dos preguntas).
- **Hifa facilitadora, simulada**: resume, agrupa concerns, recuerda reglas y plazos y propone pasar de fase; una persona confirma. Nunca decide, cierra ni declara ilegítimo un bloqueo. Sus textos son guionados y dicen que son una simulación.
- **Guardián de la tierra** en círculos de tierra y agua: su concern cuenta como de principio (F1).
- Todo en el navegador, con datos de ejemplo. Textos es/en (ADR-004). Términos con peso legal nuevos con ⚖ y `borrador: true`. Accesible con teclado y con la auditoría de axe en verde.
- **Tres noches**, con cortes (ver tasks): 1) modelo, permisos, ficha y fases de solo lectura; 2) discusión con acciones y permisos en vivo; 3) cierre, afectadas, guardián, Hifa simulada y evaluación.

**Valores de gobernanza.** Gus todavía no respondió los bloques A–F. Este cambio usa los **valores propuestos** que dio el pedido y el design marca cada uno como "propuesta, a confirmar por Gus" con su letra. Todos viven en datos o constantes (`lib/fogon/propuestas/reglas.ts` y `permisos.ts`), así que cambiar uno no obliga a reescribir pantallas.

**Fuera de alcance:**
- Base de datos: todo vive en el navegador (clave nueva que "Borrar todo" borra).
- IA real o conexión con la API de Claude: los resúmenes de Hifa son guionados y están marcados como simulados. La IA real necesita su propia decisión de privacidad (nota 21 G5).
- Notificaciones reales: "Recibir avisos" está en la matriz y se muestra como permiso, pero no manda nada.
- Firmas o constancias en cadena (EAS): los registros tienen la forma de constancia de ADR-012, sin firmar ni publicar.
- Hacer pública la página (`/fogon` pide sesión). El nivel "visita" se ve **simulado** con el selector; abrir rutas sin sesión es otro cambio (ADR-006).
- Voto cuadrático dentro de la propuesta (D2: solo como señal, nunca decide). No se construye; queda escrito en la regla.
- Delegación de voz (F2: por ahora no).
- Qué tipo de decisión va por consenso y cuál por voto cuadrático (nota 21 G2, backlog D32).
- Ponderar la voz con contexto (nota 21 G4).
- Las decisiones del fideicomiso (asamblea de beneficiarios): su regla la fija el contrato y **no** tienen propuesta de consenso.
- Crear propuestas nuevas desde la pantalla: solo las de ejemplo.
- Consulta abierta previa (backlog D25): otro cambio.

## Capabilities

### New Capabilities
- `fogon-propuestas`: la página de cada propuesta del Fogón (ficha, fases, discusión con concerns, cierre y evaluación), los permisos por nivel de implicación como datos, la facilitación simulada que nunca decide y los botones "Abrir la propuesta" desde el Fogón y desde la lente Decisiones.

### Modified Capabilities
<!-- ninguna: los botones de entrada se especifican dentro de `fogon-propuestas` -->

## Impact

- Nuevo: `lib/fogon/propuestas/` (tipos, reglas con los valores A–F, matriz de permisos, fases y plazos, registros de solo agregar y estado derivado, principios, propuestas de ejemplo, guion de Hifa; con tests), `app/fogon/propuestas/[id]/` (página y componentes), `lib/idioma/textos/fogon-propuestas.ts`.
- Se toca: `app/fogon/fogon-cliente.tsx` y `app/fogon/gobernanza/lentes/panel-decisiones.tsx` (botón), `lib/demo/claves.ts` (clave `lh-fogon-propuestas`), `lib/legal/terminos.ts` (⚖ nuevos en borrador), e2e nuevo `e2e/fogon-propuestas.spec.ts` y `e2e/accesibilidad.spec.ts`.
- Sin dependencias nuevas, sin tablas, sin pedidos de red, sin integraciones. Toca **permisos** (de una decisión, no de la plataforma: no cambia `lib/permisos/`) y **plata simulada**: pide revisión del agente `arquitecto`.
- `fogon-consenso-formal` queda **reemplazado** por este cambio (no se borra ni se implementa).
- Depende de lo que ya está en `dev`: `fogon-gobernanza-holarquia` (lente Decisiones, `caminos.ts`, parámetros de decisión) y la holarquía con roles.
