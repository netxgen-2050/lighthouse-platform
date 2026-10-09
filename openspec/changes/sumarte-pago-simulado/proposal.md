# Proposal

## Why

El prototipo tiene que dejar claro que la plataforma **va a captar plata de usuarios** (decisión de Gus, 7-oct-2026) y, a la vez, **quién cobra cada cosa**. La nota 18 (§4.1 y §5) lo resume en una regla: la membresía es ingreso de NetX; el Pase Fundador lo cobra el Guardián y NetX solo cobra su tarifa de servicio; la plata de inversión nunca pasa por la plataforma. El mock-up v6 lo muestra en el aviso del pago simulado ("el Guardián recibe USD X y NetX, su tarifa de servicio"; "la factura NetX"), pero en `/sumarte` hoy "Quiero el Pase" y "Hacerme miembro" activan el plan con un clic, sin ningún paso que muestre a dónde va la plata. Además, una venta a distancia tiene **derecho de arrepentimiento** de 10 días (Ley 24.240; nota 18 §4.4, respuesta a Marietta), y no aparece en ningún lado.

Es la cara visible de lo que en la It.2 será la pasarela con pagos divididos (roadmap, actualización 6-oct), en modo simulado y sin pasarela.

## What Changes

- **Resumen del pago (simulado)** en línea, antes de activar:
  - "Quiero el Pase <nivel>" abre un resumen con: qué se compra ("Pase Fundador <nivel> · pago único"), el total en USD, y **"Quién recibe la plata"**: "El Guardián del Lighthouse ⚖ recibe USD <precio>" y "NetX cobra su tarifa de servicio: sin dato" (el monto no está definido).
  - "Hacerme miembro" abre un resumen con la membresía elegida (USD 10/mes o USD 100/año) y "Quién recibe la plata: NetX (ingreso de la plataforma)".
  - Cada resumen tiene el ⚖ nuevo `cobro` ("Quién cobra qué"), "Confirmar pago (simulado)" y "Cancelar".
- **Confirmar** hace lo mismo que hoy hace el botón (activa el pase o la membresía) y además guarda la fecha del pago simulado del pase.
- **Arrepentimiento del Pase:** con el pase activo se muestra "Podés arrepentirte hasta el <fecha>" con el ⚖ nuevo `arrepentimiento` y el botón "Arrepentirme (simulado)", que deshace el pase y devuelve el plan que la persona tenía antes. Pasados 10 días se muestra "El plazo para arrepentirte venció el <fecha>". Si no hay fecha guardada (estado viejo), "Fecha del pago: sin dato" y no se ofrece el botón.
- Dos términos nuevos en el catálogo legal, escritos por el agente y marcados `borrador: true`: `cobro` y `arrepentimiento`.

## Fuera de alcance

- Pasarela real, sandbox de MercadoPago o Stripe, facturación electrónica, recibos o comprobantes.
- Cuotas del Pase (decisión pendiente del 12-oct, nota 18 §7.3).
- Arrepentimiento de la membresía (sigue existiendo "Volver a Explorador").
- Resumen de pago para el Plan Tribu y para "Pedir invitación" o "Pedir una charla" (la inversión no se paga en la plataforma).
- Monto o porcentaje de la tarifa de servicio de NetX: se muestra "sin dato".
- Registro del pago en la bandeja, en Mi recorrido o en la Vista NetX.

## Capabilities

### New Capabilities
- `sumarte-pago-simulado`: el paso de confirmación del pago simulado de la membresía y del Pase Fundador, con quién cobra cada parte y el derecho de arrepentimiento del Pase.

### Modified Capabilities

## Impact

`app/sumarte/sumarte-cliente.tsx` (resúmenes y arrepentimiento), `lib/sumarte/estado.ts` (fecha del pago, plan previo, acción de arrepentirse, lectura compatible con lo ya guardado) y su test, una función pura de plazo en `lib/sumarte/`, `lib/legal/terminos.ts` (claves `cobro` y `arrepentimiento`) y su test, `e2e/sumarte.spec.ts`, `e2e/canales.spec.ts` (si activa el pase con un clic) y `e2e/accesibilidad.spec.ts`. Sin dependencias nuevas.
