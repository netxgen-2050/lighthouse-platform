# Proposal

## Why

Con `fogon-cuadratico-en-la-base` las consultas viven en la base, pero crearlas y cerrarlas a mano solo se puede llamando a la API. Para que el equipo empiece a votar U1–U4, Gus necesita una pantalla mínima en `/netx` (solo super admin) para cargar esas consultas con el padrón del equipo, ver cuántas personas votaron y cerrar una a mano.

## What Changes

- **Sección "Consultas del Fogón" en `/netx`**, visible solo para el super admin (verificado en el servidor por la API):
  - Lista de consultas con estado, cierre, tipo de voto ("Voto abierto" / "Voto secreto") y participación ("votaron 4 de 7"). La lista no trae votos ni nombres: quién repartió cómo y quién falta se ven en el detalle de la consulta, con la misma regla que para el resto del padrón (ADR-007).
  - **"Nueva consulta"**: formulario con plantilla (U1, U2, U3, U4 o en blanco) que completa título, modo, opciones y textos; Gus ajusta la fecha de cierre, la regla del resultado (al votar / al cierre, por defecto al cierre), el **tipo de voto** (abierto / secreto, por defecto abierto, con la explicación de cada uno), los votos en contra (apagados por defecto), en presupuesto el monto, la moneda y la nota del monto (vacío = "sin dato") y topes o pisos por opción. La plantilla U4 trae **USD 20.000** con la nota "Sugerencia del equipo: lo decide Franz".
  - **Padrón**: lista de las personas de la base con casillas (y sumar un email existente); al menos una persona. La plantilla U2 avisa "Sumá a Martín (invitado) si ya tiene cuenta"; si no tiene cuenta, no se lo puede sumar (el padrón solo acepta personas que existen).
  - **"Cerrar ahora"** con confirmación ("No se puede volver a abrir").
  - Una vez creada, la consulta no se edita (la base lo impide si ya tiene votos; la pantalla no ofrece editar).
- Usa la API de creación y cierre de `fogon-cuadratico-en-la-base` y la lista de personas de `base-neon` (`GET /api/personas`).

**Fuera de alcance:** editar, duplicar o borrar consultas; consultas de tribu o asamblea y líderes que crean consultas; ver en el panel quién votó o quién falta (eso está en el detalle de cada consulta con voto abierto, igual para todo el padrón); crear la cuenta de Martín o invitarlo desde el panel; recordatorios por email; importar el backlog (U7) como opciones; la Ronda 0.

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: suma la administración de consultas por el super admin en `/netx`.

## Impact

Depende de `fogon-cuadratico-en-la-base` y de `base-neon` (panel de `/netx`, `GET /api/personas`). Archivos: `app/netx/` (sección nueva y su cliente), `lib/fogon/consultas/plantillas.ts` (ya existe, se usa), `lib/fogon/consultas/formulario.ts` (validación pura que comparte con el servidor), `e2e/fogon-panel.spec.ts`, `e2e/accesibilidad.spec.ts`. Sin migraciones ni rutas nuevas. Toca permisos (super admin) y montos: revisión de arquitectura.
