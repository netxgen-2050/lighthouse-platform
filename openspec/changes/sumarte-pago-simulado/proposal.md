# Proposal

## Why

El prototipo tiene que dejar claro que la plataforma **va a servir para captar plata de usuarios e inversores**, con pagos simulados (`CLAUDE.md`, decisión de Gus del 7-oct). Hoy `/sumarte` muestra los planes, pero "Hacerme miembro" y "Quiero el Pase …" activan el plan con un clic, sin mostrar **cuánto se paga ni a quién va la plata**.

La nota 18 (§4.1 y §5) define justo eso como "la regla hecha interfaz": **el pago simulado deja claro quién cobra**. La membresía es ingreso de NetX (plata tipo A); el Pase Fundador es una venta del Guardián del Fondo Común que la plataforma procesa con **pagos divididos** (tipo B): el Guardián recibe su parte y NetX solo su tarifa de servicio. La plata de inversión (tipo C: círculo del Lote 7, SAFE) nunca pasa por la plataforma. El roadmap pone la pasarela con pagos divididos en It.2 (sandbox); este cambio adelanta **solo la interfaz**, sin pasarela, para que el equipo vea el modelo de ingresos en la demo.

## What Changes

- **Paso de confirmación antes de activar.** "Hacerme miembro" y "Quiero el Pase {nivel}" ya no activan al instante: abren un **"Resumen del pago (simulado)"** con el concepto, el total y **quién recibe cada parte**. Botones "Confirmar pago simulado" y "Cancelar".
  - **Membresía:** total USD 10 (mensual) o USD 100 (anual), según el selector. Recibe: **NetX, 100 %** ("ingreso de la plataforma").
  - **Pase Fundador:** total = precio del nivel. Recibe: **Guardián del Fondo Común** el total menos la tarifa; **NetX** la tarifa de servicio. La tarifa es un valor **de ejemplo** (5 %, ver design), marcado "tarifa de ejemplo".
  - Leyenda "La plataforma procesa el pago pero no se queda con la plata del Guardián: la pasarela la deposita directo en su cuenta." con ⚖ nuevo `pagodividido` (**borrador**).
  - Leyenda del derecho de arrepentimiento con ⚖ nuevo `arrepentimiento` (**borrador**): 10 días corridos para arrepentirte de una compra a distancia.
  - Aviso fijo: "Pago simulado: no se cobra nada y no te pedimos datos de tarjeta."
- **Comprobantes.** Confirmar aplica la acción que ya existe (plan `miembro` o `pase`) y guarda un comprobante en `lh-pagos` (clave nueva en `lib/demo/claves.ts`, con prefijo por persona). En `/sumarte`, una sección **"Tus pagos simulados"** lista fecha, concepto, total y reparto; sin pagos dice "Todavía no hiciste pagos simulados."
- **Moneda:** los montos se guardan en USD y se muestran con el mismo formateador y moneda que ya usa `/sumarte` (configuración de la persona).
- Lógica pura en `lib/sumarte/pago.ts` (reparto, comprobantes, lectura segura), separada de la página.

## Fuera de alcance

- Pasarela real o sandbox (MercadoPago Marketplace, Stripe Connect), suscripciones recurrentes y facturación electrónica (ARCA).
- Pase en cuotas, devoluciones funcionales ("arrepentirme" con reembolso) y créditos sobre licencia o canon: dependen de decisiones abiertas de la nota 18 §7.
- Plan Tribu (sigue con su aviso "simulado"), estadías y productos del marketplace.
- **Plata de inversión (tipo C):** "Sumarte al proyecto del Lote 7" y "Invertir en NetX" siguen siendo pedidos de contacto; nunca abren un resumen de pago.
- Totales de ingresos en la Vista NetX.
- Cambiar los precios: se usan los de `lib/sumarte/datos.ts` (mock-up v6).

## Capabilities

### New Capabilities
- `sumarte-pago-simulado`: resumen de pago simulado con reparto entre NetX y el Guardián, comprobantes en el navegador y textos legales de borrador.

### Modified Capabilities

## Impact

`lib/sumarte/pago.ts` (nuevo, con su test), `lib/demo/claves.ts`, `app/sumarte/sumarte-cliente.tsx`, `lib/legal/terminos.ts` (dos claves nuevas con `borrador: true`) y su test, `e2e/sumarte.spec.ts`, `e2e/accesibilidad.spec.ts`. Los e2e que hoy activan un plan o un pase con un clic (sumarte, canales, semillas, pasaporte, si los hay) pasan a confirmar el pago simulado. Sin dependencias npm nuevas.
