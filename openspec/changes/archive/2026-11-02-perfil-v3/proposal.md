# Proposal

## Why

El Perfil hoy es una entrevista tipo chat. Gus quiere una página de perfil clásica; el asistente de IA pasa a ser un botón global (`asistente-hifa`). Decisiones de Gus del 9-oct-2026 sobre "Mi lugar" (Perfil, Pasaporte, Mi recorrido, bandeja y rail). Fase de prototipo interno, sin cuentas todavía: todo se guarda en el navegador (ver `CLAUDE.md`).

## What Changes

- `/perfil` se rehace como **página de perfil**:
  - Encabezado: iniciales (o foto en el futuro), nombre, de dónde sos y una frase sobre vos.
  - **Qué sabés hacer y qué ofrecés:** oficios y roles (la misma lista de roles de Pactos), con etiquetas.
  - **Tus comunidades:** las de `lib/membresia/` con su estado (miembro, pedido enviado).
  - **Resumen**: pactos activos y Semillas totales, con enlaces a `/pactos` y `/semillas`.
  - **Cómo decidís y qué no negociás** (lo que preguntaba la entrevista), como campos del perfil.
- **Editar el perfil** con un formulario (en la misma página, modo edición). Los datos que ya existían de la entrevista (`lib/perfil/`) se migran a los campos nuevos.
- Un vínculo secundario "¿Preferís conversar? Hablá con Hifa" que abre el asistente global si existe.
- Al completar los campos básicos se registra la actividad "Completaste tu perfil" (si `lib/actividad/` existe).

**Fuera de alcance:** foto real, perfil público visible para otras personas (llega con cuentas).

## Capabilities

### New Capabilities
- `perfil-v3`: ver specs.

### Modified Capabilities

## Impact

`app/perfil/`, `lib/perfil/` (modelo nuevo y migración), e2e.
