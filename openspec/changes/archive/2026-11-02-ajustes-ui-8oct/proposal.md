# Proposal

## Why

Ajustes chicos que Gus pidió al recorrer la app. Decisiones de Gus del 8-oct-2026 (dictado sobre la app en producción). Fase de prototipo interno (ver `CLAUDE.md`).

## What Changes

- **Botón Reportar** con el ícono de un bicho (`Bug` de `lucide-react`) además del texto, para que se entienda que es para reportar problemas.
- **Inicio:** el botón principal del héroe pasa a ser **"Explorar el Lighthouse"** → `/territorios/lighthouse` (el secundario sigue siendo "Elegí cómo sumarte"). En "Por dónde empezar", la tarjeta de "Descubrir" pasa a ser **"Ver las tribus"** → `/tribus`; las otras dos (Encontrar mi tribu, Congreso) quedan.
- **Distribución de tribus** (datos de ejemplo en `lib/tribus/`): **3 activas, 5 en formación y 4 vacantes**.
  - Activas: Semilla Viva (1), Valle Solar (6), Taller Común (7).
  - En formación: Barda Productiva (2), Monte Nuevo (4), Agua Clara (5), Fundación Avelan Kerum (10), Puerto Trueque (11).
  - Vacantes: Barrio 3, Barrio 8, Barrio 9 y Barrio 12 (Escuela de la Tierra y Guardianes del Monte pasan a vacantes: sin nombre de tribu, sin declaración ni pozo, con lo que el barrio necesita).
- **Mapa del territorio, colores y leyenda en tres grupos con paletas distintas** (que no se repitan dentro y fuera del Lighthouse):
  - *Lighthouse · Macrolote 7:* tribu activa, tribu en formación, barrio vacante, terreno común.
  - *Chacras de Soluna · venta privada:* finca disponible, reservada, cantera.
  - *Lugares de interés.*
- **Sin personas de ejemplo:** quitar Lucía y Lucas (y cualquier "persona de ejemplo" que represente a quien mira) de `lib/fogon/`, `lib/pactos/` y `lib/semillas/` y de sus pantallas. La pantalla habla de "vos" y usa lo que la persona cargó en el navegador; los miembros de una tribu que aparecen como compañeros siguen siendo datos de ejemplo.

**Fuera de alcance:** cambios de lógica de pactos y semillas (van en `pactos-v2` y `semillas-v2`).

## Capabilities

### New Capabilities
- `ajustes-ui-8oct`: ver specs.

### Modified Capabilities

## Impact

`components/boton-reportar.tsx`, `app/page.tsx`, `lib/tribus/datos.ts` y todos los tests que cuentan estados, `app/territorios/[id]/` (estilos y leyenda), `lib/fogon/`, `lib/pactos/`, `lib/semillas/` y sus pantallas y tests.
