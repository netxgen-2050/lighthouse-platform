# Proposal

## Why

La Vista NetX (`/netx`, solo super admin) responde "¿vamos a vender en febrero?" con un embudo de personas, tribus y cumplimiento, pero **no muestra la plata**: ni lo que junta el Pase Fundador, ni lo que ingresaría NetX, ni los pedidos de inversión. En la fase de prototipo interno la plataforma tiene que dejar claro que va a servir para captar plata de inversores y usuarios, y Franz es quien lo mira (US-15 de la nota 15, "Embudo y señales"). La **nota 18 §4.1** separa tres tipos de plata con tres reglas: **A** ingresos de NetX (membresías, Plan Tribu, tarifa al Guardián), **B** ventas de terceros que la plataforma procesa (el Pase va al Guardián) y **C** inversión que **no pasa** por la plataforma (Lote 7, SAFE). Una sección que muestre la captación agrupada así hace visible el modelo de ingresos y, a la vez, la regla de que NetX no custodia plata de inversión.

No repite `sumarte-pago-simulado` (P4 del backlog, cerrada): aquel era el paso de pago que ve la persona; esto es el tablero interno que ve el equipo, sin flujo de pago.

## What Changes

- **Sección "Captación · a quién va la plata"** en `/netx`, después de los indicadores y antes del embudo, con tres bloques rotulados con su tipo:
  - **A · Ingresos de NetX:** membresía (precio de ejemplo mensual y anual), Plan Tribu (precio de ejemplo por tribu y por mes) y tarifa al Guardián. Cantidades e ingreso total: **"sin dato"** (el prototipo no tiene suscripciones reales). Con los ⚖ `membresia` y `plantribu`.
  - **B · Ventas de terceros que procesa la plataforma:** Pase Fundador, con pases vendidos sobre el cupo de la cohorte y lo recaudado sobre el mínimo para abrir el Fondo Común (dos medidores, los mismos datos que `/sumarte`), la aclaración "lo recibe el Guardián" con el ⚖ `guardian`, y la tarifa de NetX como "sin dato".
  - **C · Inversión (no pasa por la plataforma):** proyecto del Lote 7 con el monto de la emisión de ejemplo y los lugares usados del círculo; SAFE de NetX como conversación privada; y "Fondos recibidos por la plataforma: USD 0" con el ⚖ `caja`.
- **Pedidos de inversión de este navegador:** dentro del bloque C, cuántos pedidos de invitación al círculo y de charla para invertir en NetX hay en la bandeja local de contactos, con un enlace a la bandeja de la misma página. Si no hay ninguno, lo dice en palabras; mientras no se leyó el navegador, "Cargando…".
- La emisión del círculo que hoy está repetida en `lib/vista-netx/datos.ts` pasa a leerse de `lib/sumarte/datos.ts`, para que `/netx` y `/sumarte` no se contradigan.

**Fuera de alcance:**
- Cobros, suscripciones o ingresos reales; cualquier pasarela.
- Monto o tipo de la tarifa de NetX al Guardián (pregunta abierta de Vagner y Gus desde el 9-oct): queda "sin dato".
- Proyecciones de ingresos o metas de captación por mes.
- Pedir un monto orientativo en los pedidos de inversión (sería dato personal financiero nuevo; otro cambio, con revisión del arquitecto).
- Datos del servidor o de otras personas: los pedidos son solo los de este navegador, como la bandeja actual.
- Cambios en el embudo, el cumplimiento o la tabla de tribus.

## Capabilities

### New Capabilities
- `vista-netx-captacion`: la captación de plata en la Vista NetX, separada en ingresos de NetX, ventas de terceros e inversión, con el dato que falta como "sin dato".

### Modified Capabilities

## Impact

`app/netx/page.tsx` (sección nueva), un componente `app/netx/captacion.tsx` (con una parte cliente para contar pedidos locales), una función pura en `lib/vista-netx/` que arma los tres bloques y cuenta pedidos por motivo, con tests de Vitest, `lib/vista-netx/datos.ts` (deja de duplicar `EMISION`) y `e2e/vista-netx.spec.ts`. Sin dependencias npm nuevas. Solo lee lo que ya existe (precios y cohorte de ejemplo, bandeja local); no agrega datos personales, tablas, permisos ni pagos. La página sigue siendo solo para super admin.
