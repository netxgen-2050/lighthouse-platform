# Proposal

## Why

El botón Reportar tiene buena ubicación (borde derecho, a media altura) pero tiene que ser más visible y coherente con el botón de Hifa. Decisiones de Gus del 9-oct-2026. Fase de prototipo interno, sin cuentas: las preferencias se guardan en el navegador (ver `CLAUDE.md`).

## What Changes

- El botón pasa a ser un **círculo del mismo tamaño que el botón de Hifa**, con **solo el ícono del bicho** (más grande que hoy), sin la palabra "Reportar".
- Fondo: el **mismo verde** que usa hoy el botón. Alrededor, un **anillo de circunferencia negra punteada** (línea discontinua), separado del círculo por un pequeño espacio, para que se note en cualquier fondo.
- Sigue **pegado al borde derecho, a media altura**, fijo al navegar.
- Nombre accesible: "Reportar un problema o una idea", y un **tooltip** con "Reportar" al pasar el mouse o con el foco.
- El contraste del ícono sobre el verde y del anillo sobre el fondo cumple WCAG AA (3:1 para elementos gráficos).

**Fuera de alcance:** cambios en el diálogo de reporte.

## Capabilities

### New Capabilities
- `reportar-circulo`: ver specs.

### Modified Capabilities

## Impact

`components/boton-reportar.tsx` y sus tests.
