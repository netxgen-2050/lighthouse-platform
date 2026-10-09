# Proposal

## Why

Lo que pasa en la plataforma (te aceptaron en una comunidad, aceptaron tu pacto, se abrió una ronda, alguien se interesó en tu oferta) no tiene dónde avisarse. Además Mi recorrido necesita una línea de tiempo de lo que hiciste. Decisiones de Gus del 9-oct-2026 sobre "Mi lugar" (Perfil, Pasaporte, Mi recorrido, bandeja y rail). Fase de prototipo interno, sin cuentas todavía: todo se guarda en el navegador (ver `CLAUDE.md`).

## What Changes

- **Registro de actividad** en `lib/actividad/` (en el navegador): cada evento tiene tipo, texto, fecha, enlace y si es una **notificación** (algo que te pasó) o solo **actividad** (algo que hiciste). Funciones puras para registrar, listar, marcar como leídas y contar no leídas, con tests.
- Las pantallas existentes **registran eventos** al ocurrir:
  - Actividad: adheriste a un manifiesto, propusiste un pacto, publicaste en el mercado, enviaste una postulación, registraste tu ticket, enviaste una ronda.
  - Notificaciones: "<Comunidad> aceptó tu adhesión", "<Comunidad> aceptó tu pacto", "Se abrió una ronda de reconocimiento en <comunidad>" (al tener un pacto aceptado), "Alguien se interesó en tu oferta" (simulado, un rato después de publicar), "Recibimos tu postulación".
- **Campanita**: componente `components/campanita.tsx` con el número de no leídas (en texto accesible: "3 notificaciones sin leer"), que lleva a `/bandeja`. Se monta en el rail (si `rail-v2` ya está en la base, en el lugar que define; si no, arriba del rail).
- **Página `/bandeja`**: las notificaciones de la más nueva a la más vieja, cada una con su enlace; "Marcar todas como leídas". Una sección "Mensajes" con el texto "Pronto vas a poder recibir mensajes de tu comunidad y del equipo".

**Fuera de alcance:** mensajes reales, notificaciones por mail o push, cuentas.

## Capabilities

### New Capabilities
- `bandeja-notificaciones`: ver specs.

### Modified Capabilities

## Impact

`lib/actividad/`, `components/campanita.tsx`, `app/bandeja/`, y una línea de registro en las pantallas que generan eventos (`/tribus/[id]/manifiesto`, `/pactos`, `/compromisos`, `/tribus/[id]/postular`, `/congreso`, `/semillas`).
