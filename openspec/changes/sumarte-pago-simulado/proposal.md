# Proposal

## Why

Hoy en `/sumarte` el Pase Fundador y la membresía se activan con un solo clic, sin ver cuánto se paga, a quién ni qué derechos hay después. El prototipo tiene que mostrar que la plataforma **va a captar plata de usuarios** (decisión de Gus del 7-oct) y la nota 18 (§4.1 y §5) pide que "el pago simulado deje claro quién cobra": el Guardián recibe el pago del Pase, NetX cobra la membresía como ingreso propio y su tarifa de servicio aparte (pagos divididos). Es la regla de los "tres tipos de plata" hecha interfaz, y la pieza de It.2 "pasarela con pagos divididos (sandbox)" en versión simulada.

## What Changes

- **Paso de confirmación de pago simulado** antes de activar el Pase Fundador ("Quiero el Pase …") o la membresía ("Hacerme miembro"): resumen de lo que se compra, monto, **quién recibe la plata** (pago dividido), una casilla de "entiendo" obligatoria y los botones "Confirmar pago simulado" y "Cancelar".
- **Quién cobra:**
  - Pase Fundador: "El Guardián del Lighthouse recibe USD {precio}" y "Tarifa de servicio de NetX: sin dato (la define el equipo)". No se inventa la tarifa.
  - Membresía: "NetX recibe USD {monto}: es un ingreso de la plataforma".
- **Comprobante simulado** al confirmar: número de operación con prefijo `SIM-`, fecha, concepto, monto y reparto. El aviso "(simulado) · no se cobró nada" queda siempre visible.
- **"Tus pagos simulados"**: lista de comprobantes guardados en el navegador, con el **derecho de arrepentimiento** (10 días corridos) y el botón "Arrepentirme (simulado)" mientras esté vigente; al usarlo se deshace lo comprado y el comprobante pasa a "Arrepentido".
- Dos ⚖ nuevos en `lib/legal/terminos.ts`, con `borrador: true`: `pagodividido` y `arrepentimiento`.
- **BREAKING (solo e2e):** activar el pase o la membresía ahora pide confirmar; los tests e2e que hacían un solo clic se actualizan.

**Fuera de alcance:** pasarela real (MercadoPago, Stripe) ni sandbox de una pasarela, datos de tarjeta, facturación electrónica (ARCA), Pase en cuotas (decisión pendiente del 12-oct), monto de la tarifa de NetX (Vagner), pago del Plan Tribu y de la invitación al círculo (siguen como pedidos), reintegros reales, cupones y descuentos.

## Capabilities

### New Capabilities
- `pago-simulado`: el paso de confirmación, el reparto de quién cobra, el comprobante y el arrepentimiento simulados para el Pase Fundador y la membresía.

### Modified Capabilities
(ninguna: `openspec/specs/` todavía está vacío; el comportamiento nuevo de `/sumarte` queda en `pago-simulado`)

## Impact

`app/sumarte/sumarte-cliente.tsx` (y un componente nuevo de confirmación), `lib/sumarte/estado.ts` (pagos guardados, compatibles con lo ya guardado), un módulo nuevo `lib/sumarte/pagos.ts`, dos claves nuevas en `lib/legal/terminos.ts` y su test, y los e2e que activan el pase (`e2e/sumarte.spec.ts`, `e2e/canales.spec.ts` y cualquier otro que haga clic en "Quiero el Pase"). Sin dependencias nuevas. Misma clave de `localStorage` (`CLAVES.sumarte`).
