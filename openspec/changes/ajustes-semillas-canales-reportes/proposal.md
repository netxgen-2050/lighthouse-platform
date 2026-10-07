# Proposal

## Why

Decisiones de Gus del 7-oct-2026 sobre pendientes de la segunda revisión (R19, R20) y sobre la privacidad de los reportes.

## What Changes

- **Semillas (R19):** el factor de evaluación entre pares es **1,0 fijo**, como en el mock-up (se quita el factor calculado); la frase "un servicio que no suma semillas" lleva el ⚖ `pasefundador`; solo un pacto **de tiempo** aceptado cuenta como Semillas de tiempo (los de plata o convivencia no).
- **Canales en el celular (R20):** por debajo de 640 px de ancho, las puertas de `/canales` se muestran como **tarjetas apiladas** (nombre, estado en texto, motivo y qué la abre) en lugar de la tabla.
- **Reportes (privacidad):** el diálogo de reporte avisa, junto al campo de contacto: "Tu reporte, y tu contacto si lo dejás, lo ve el equipo de NetX."

**Fuera de alcance:** cambios de diseño en otras pantallas.

## Capabilities

### New Capabilities
- `ajustes`: ajustes de Semillas, Canales y Reportes decididos el 7-oct.

### Modified Capabilities

## Impact

`lib/semillas/`, `app/semillas/`, `app/canales/`, `components/boton-reportar.tsx` y sus tests.
