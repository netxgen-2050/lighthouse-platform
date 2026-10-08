# Design

## Context

`/sumarte` (cambio `sumarte-planes`) guarda su estado en `localStorage` bajo `CLAVES.sumarte` (`"lh-sumarte"`) con un reductor puro (`lib/sumarte/estado.ts`: `reducir`, `leer`). La acción `{ tipo: "pase" }` activa el Pase y la membresía con un clic. Otras páginas leen esa misma clave: `/canales` (`personaDesdeSumarte`), `/semillas` (`paseActivo`) y el panel. Ver proposal.md para el porqué.

## Goals / Non-Goals

**Goals:**
- Un paso de confirmación reutilizable para dos productos (Pase y membresía) con el reparto de quién cobra.
- Comprobantes y arrepentimiento calculados con funciones puras y testeables (reloj inyectado).
- No romper lo que ya leen `/canales`, `/semillas` y el panel: `plan` y `pase` siguen en el mismo lugar del estado.

**Non-Goals:**
- Modelar una pasarela, estados de pago intermedios (pendiente, rechazado) ni reintentos.
- Mostrar montos de la tarifa de NetX: no hay dato.

## Decisions

1. **Los pagos viven dentro del estado de Sumarte**, como `pagos: Pago[]` en `EstadoSumarte`, en la misma clave. `Pago = { numero, fechaISO, concepto: "pase" | "membresia", nivel?: NivelPase, facturacion?: Facturacion, montoUsd, planPrevio: Plan, arrepentido: boolean }`. *Alternativa:* una clave nueva `lh-pagos`. Se descarta porque el arrepentimiento tiene que tocar `plan` y `pase` en una sola escritura atómica, y porque `borrarDemo` ya limpia `CLAVES.sumarte`.
2. **Acciones nuevas en el reductor:** `{ tipo: "pagar", concepto, numero, fechaISO }` (activa el producto y agrega el comprobante; el número y la fecha llegan desde afuera para que el reductor siga siendo puro) y `{ tipo: "arrepentirse", numero, hoyISO }` (valida el plazo y deshace). La acción `pase` vieja se reemplaza por `pagar` en la interfaz.
3. **Estado de cada comprobante derivado, no guardado:** `estadoPago(pago, estado, hoy)` devuelve `"vigente" | "arrepentido" | "incluida-en-pase" | "dado-de-baja" | "vencido"` y los días restantes. Así "Volver a Explorador" no necesita tocar los comprobantes y no hay estados contradictorios.
4. **Plazo:** 10 días corridos contando desde la fecha del comprobante; vigente mientras `díasPasados < 10` (hoy = día 0 → quedan 10). Se calcula con fechas de calendario (sin horas) en la zona del navegador.
5. **Número de comprobante:** `SIM-` + 6 caracteres de `A-Z0-9` con `crypto.getRandomValues`, generado en el cliente al confirmar. No necesita ser único globalmente: es demo.
6. **Confirmación en línea, no modal:** una sección bajo la tarjeta, con `aria-labelledby` y foco al título. Evita el manejo de trampa de foco de un `dialog` y es más fácil de auditar con axe. "Cancelar" devuelve el foco al botón que abrió (mismo patrón de `PedidoContacto` con `idBoton`).
7. **Textos legales nuevos** (`borrador: true`), redactados para el prototipo:
   - `pagodividido` · "Pago dividido": "Cuando pagás algo que vende otra entidad (como el Pase, que vende el Guardián), la pasarela le deposita la plata directo a esa entidad y a NetX solo su tarifa de servicio. NetX no retiene ni administra la plata del Pase."
   - `arrepentimiento` · "Derecho de arrepentimiento": "Si compraste a distancia, tenés 10 días corridos para arrepentirte sin dar explicaciones y recibir la devolución completa (Ley 24.240 de Defensa del Consumidor, art. 34). En el prototipo la devolución es simulada."

## Risks / Trade-offs

- [Los e2e existentes hacen un clic en "Quiero el Pase …"] → la tarea de tests los actualiza con un helper `confirmarPase(page, nivel)` en `e2e/` para no repetir pasos.
- [Fechas en e2e] → los tests del plazo se cubren con Vitest (reloj inyectado); el e2e solo verifica "te quedan 10 días" el mismo día.
- [Estado viejo con `plan: "miembro"` sin comprobante] → `leer()` pone `pagos: []` y la página lo muestra tal cual (requisito de compatibilidad).

## Migration Plan

No hay migración: `leer()` acepta el formato anterior. Revertir el PR deja el estado con un campo `pagos` que la versión anterior ignora.
