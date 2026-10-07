# Proposal

## Why

La actualización del roadmap del 6-oct suma a la It.1 un **registro de compromisos básico** (nota 18, §1 punto 6 y §6 punto 6): de octubre a enero, personas y tribus registran **necesidades** y **ofertas** sin mover plata, como primera pieza del MVP de febrero. Es lo que después alimenta el pozo común de cada tribu y la Ronda 0. Queremos validar la experiencia de registrar "qué ofrezco / qué necesito" en el preview, en **modo demostración** y **solo con tiempo y bienes**, antes de tener cuentas y base de datos.

## What Changes

- Página `/compromisos` con un formulario corto para registrar un compromiso:
  - **Tipo:** "Ofrezco" o "Necesito".
  - **Clase:** "Tiempo", "Bienes" o "Plata" (monto orientativo en USD, opcional; desde la vuelta de corrección del 7-oct, fase de prototipo).
  - **Descripción** (obligatoria, hasta 140 caracteres).
  - **Cantidad orientativa:** para Tiempo, horas por mes (entero de 1 a 160); para Bienes, texto libre opcional (por ejemplo "20 kg por mes"). Si no se completa, se muestra "sin dato".
  - **Para quién:** "El Lighthouse en general" o una tribu de ejemplo.
- Lista "Tus compromisos" con lo registrado, cada uno con un botón "Quitar", y un botón "Borrar todo".
- Todo queda **solo en el navegador**, con el aviso "Modo demostración: lo que registres queda solo en este navegador." Nada se envía a ningún servidor.
- Lógica pura en `lib/compromisos/` (validación y reducer), separada de la página para que mañana se conecte a la base sin reescribirla.
- La página usa **solo los tokens de color del tema** y **no** anida un `<main>`.

**Fuera de alcance:**
- **Cobros reales y rangos de aporte:** la clase "Plata" solo guarda un monto orientativo; no hay rangos de aporte ni pagos. El "rango de compromiso en plata" de la nota 18 queda para cuando haya revisión humana y criterio legal.
- **Textos legales nuevos:** no se agrega ningún ⚖ ni leyenda de "no vinculante"; el aviso es solo técnico (dónde quedan los datos). Ver preguntas abiertas.
- Cuentas, base de datos, HubSpot, envío a la tribu, notificaciones.
- Compromisos **de tribus** (registrados por la tribu como entidad) y el **pozo común** con lo entregado: otro cambio.
- Lotes y territorio: el selector "Para quién" no menciona lotes ni barrios a reservar.
- Emparejar ofertas con necesidades.

## Capabilities

### New Capabilities
- `compromisos-registro`: registrar, ver y quitar ofertas y necesidades de tiempo y bienes (modo demostración).

### Modified Capabilities

## Impact

`app/compromisos/`, `lib/compromisos/`, enlace "Compromisos" en el encabezado global, `e2e/compromisos.spec.ts`. **Depende de** `navegacion-base` (tokens y encabezado). Usa `listarTribus()` de `lib/tribus/`. Sin dependencias npm nuevas.
