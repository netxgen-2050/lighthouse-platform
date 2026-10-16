# Proposal

## Why

La nota de la idea del Fogón (`Desarrollo/Ideas/2026-10-15 - Fogón - priorizar con voto cuadrático`, §3) lista diez casos de uso; `fogon-consultas-panel` trae plantillas solo para U1 a U4 y deja explícitamente afuera "importar el backlog (U7) como opciones". Para la medida de éxito del dogfooding ("al menos 4 personas votan en al menos 2 consultas reales") ayuda tener consultas listas para cargar, y **U7 ("Prioridades del backlog de producto")** es la que más le sirve a Gus: que el equipo diga con voto cuadrático cuánto le importa cada ítem del backlog antes de que él priorice. U5 (programa del centro comunitario) ya tiene sus opciones en la nota y sale gratis.

## What Changes

- **Plantilla U7 "¿Qué sigue en la plataforma?"** en "Nueva consulta" de `/netx`: modo Prioridades, ámbito Equipo, voto abierto, resultado al cierre, con **una opción por cada ítem abierto del backlog** al 16-oct-2026 (B2 a B6, D1 a D6 y L1 a L10, salvo los que ya tienen spec: L8, L11), cada una con su código y su nombre ("B6 · Aprobaciones de un admin de comunidad"). La descripción dice que el resultado es consultivo y que el orden lo decide Gus.
- **Plantilla U5 "Programa del centro comunitario"**: modo Prioridades, ámbito Equipo, con las cinco opciones de la nota (Restaurante, Cowork, Co-living, Aulas / I+D, Domo de eventos).
- **Quitar opciones antes de crear**: el formulario permite quitar cualquier opción que trae una plantilla (para achicar U7 a los ítems que Gus quiera poner a votación), siempre con al menos dos.
- Las plantillas son texto fijo en el código: si el backlog cambia, se edita la lista en el formulario antes de crear o se actualiza la plantilla en otro cambio.

**Fuera de alcance:**
- Leer el backlog en vivo desde `NS_platform` (es otro repositorio; este repo es solo código).
- U6 (variantes del modelo híbrido H0 a H4): necesita los textos de `NS_Tokenomics/18`, que no están en este repo. U8 a U10 (tribu, vivero, Congreso): son consultas de tribu u organización, todavía no se pueden crear.
- Que el resultado de U7 reordene algo solo (sigue siendo consultivo).
- Cambiar el motor, las pantallas de votación o el acta.

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: suma las plantillas U5 y U7 y la posibilidad de quitar opciones de una plantilla antes de crear la consulta.

## Impact

Orden: después de `fogon-consultas-panel` (usa su formulario y `lib/fogon/consultas/plantillas.ts`). Archivos: `lib/fogon/consultas/plantillas.ts`, `lib/fogon/consultas/formulario.ts` (quitar opción), la sección de `/netx`, sus tests y `e2e/fogon-panel.spec.ts`. Sin migraciones, rutas, permisos nuevos ni datos personales: no necesita revisión de arquitectura.
