# Proposal

## Why

Una persona puede tener Semillas en varias comunidades. Y la ronda de reconocimiento tiene que ser solo entre quienes tienen un pacto aceptado, en las dos direcciones y con una parte cualitativa. Decisiones de Gus del 8-oct-2026 (dictado sobre la app en producción). Fase de prototipo interno (ver `CLAUDE.md`).

## What Changes

- **Panel por comunidad** arriba de `/semillas`: una tarjeta por cada comunidad donde la persona es **miembro** (Lighthouse y tribus, de `lib/membresia/`), con sus Semillas de tiempo, de plata y de presencia, más un total. Si no es miembro de ninguna, explica cómo empezar.
- Debajo, el detalle de la comunidad elegida (lo que hoy muestra la página) y "Lo que te abre" tal como está.
- **Ronda de reconocimiento** solo en las comunidades donde la persona tiene un **pacto aceptado**:
  - **Dar reconocimiento** a compañeras y compañeros de esa comunidad (datos de ejemplo), en dos criterios de 1 a 5 con su explicación:
    - **Rol:** "Cómo cumple con las responsabilidades de su trabajo."
    - **Aporte al grupo:** "Su apertura, su energía y cómo sus comportamientos se alinean con la cultura del grupo." (reemplaza "cultura").
  - Por cada puntuación, una **explicación cualitativa obligatoria**: "¿Por qué le das esta puntuación?".
  - **Cómo te reconocieron:** lo que otros le dieron a la persona (ejemplo), con sus puntuaciones y sus explicaciones.
- Usa el tooltip económico 🌱 en "Semillas".
- El factor de evaluación sigue fijo en 1,0.

**Fuera de alcance:** "lo que te abre" en detalle y las utilidades de cada comunidad (backlog).

## Capabilities

### New Capabilities
- `semillas-v2`: ver specs.

### Modified Capabilities

## Impact

`app/semillas/`, `lib/semillas/`, e2e de semillas. Lee `lib/membresia/` y los pactos aceptados de `lib/pactos/`.
