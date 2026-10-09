# Proposal

## Why

Mi recorrido tiene que responder dos preguntas: qué sigue y qué pasó. Decisiones de Gus del 9-oct-2026 sobre "Mi lugar" (Perfil, Pasaporte, Mi recorrido, bandeja y rail). Fase de prototipo interno, sin cuentas todavía: todo se guarda en el navegador (ver `CLAUDE.md`).

## What Changes

- `/panel` (Mi recorrido) se rehace en tres partes:
  - **Tu próximo paso:** uno solo, calculado según lo que la persona ya hizo, en este orden: completar tu perfil → adherir a una comunidad → proponer un pacto → verificar tu identidad (si quiere invertir) → registrar tu ticket del Congreso. Con su botón.
  - **Tu camino:** la línea de tiempo de la actividad (`lib/actividad/`), de lo más nuevo a lo más viejo, agrupada por día.
  - Pestaña **Bitácora** con lo que hoy está en `/panel/bitacora` ("Lo que te mostramos"); `/panel/bitacora` sigue funcionando y abre esa pestaña.
- Se mantiene "Borrar todo lo guardado en este navegador", ahora también borra la actividad y las notificaciones.
- Lo que hoy repite datos de otras pantallas (avance del perfil, compromisos, ticket) se reemplaza por el próximo paso y la línea de tiempo.

**Fuera de alcance:** convertir Mi recorrido en el inicio de la persona con cuenta (llega con el login).

## Capabilities

### New Capabilities
- `mi-recorrido-v2`: ver specs.

### Modified Capabilities

## Impact

`app/panel/`, `lib/panel/` (cálculo del próximo paso), e2e. Lee `lib/actividad/` (`bandeja-notificaciones`).
