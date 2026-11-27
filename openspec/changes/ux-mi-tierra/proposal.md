# Proposal

## Why

Gus eligió el 25-nov-2026 la dirección **C · DeFi solar** para Mi tierra e Invertir: la claridad de una billetera web3 (Rainbow, Uniswap) al servicio de quien compra tierra. La visión del 23-nov ya traducía "Portafolio → Mi tierra: tu lote, las cuotas pagadas, los FARO acreditados y tu voz, en una sola vista".

La auditoría del 25-nov (hallazgo H8) mostró que hoy Mi tierra sin lote es una tarjeta con un botón de contorno y sin próximo paso, y que con lote es una pila de secciones con cajas, sin un número que mande.

Quinto cambio de la serie `ux-*`. Va apilado sobre `ux-celular`.

## What Changes

- **Encabezado tipo billetera:** un número grande (lo pagado de tu lote o tus lotes, en mono), debajo cuánto representa del total con una `BarraAvance` y "cuota N de M". Si no hay pago, el número es "USD 0" con "Todavía no pagaste ninguna cuota" (no "sin dato": acá el dato existe y es cero).
- **Acciones rápidas** debajo del número: solo las que ya existen en la app (por ejemplo "Ver mi lote", "Pagar la próxima cuota" si el flujo simulado de pago lo permite desde la ficha, "Actividad"). Ninguna acción nueva de dinero.
- **Tus posiciones:** una lista de filas (no tarjetas) con ícono, nombre, detalle y valor a la derecha en mono: cada lote (m², estado, cuotas), FARO (acreditados o "sin dato" si falta el primer pago, como hoy) y Tu voz (estado del manifiesto y de la decisión 5). Tocar una fila abre su detalle.
- **Actividad** como un explorador: las últimas 8 filas del libro con fecha, motivo y monto; "Ver toda la actividad" despliega el resto, con filtro por tipo.
- **Estado vacío** con `EstadoVacio` de `ux-base`: dibujo de un lote en el estilo del mapa de Participa, "Todavía no reservaste un lote", acción principal "Explorar los lotes" y una vista previa atenuada de cómo se ve Mi tierra con un lote ("Así se va a ver").
- Bajada nueva (de `ux-base`): "El pago es simulado: no se cobra nada."

## Fuera de alcance

- La lógica de compras, cuotas y FARO (`lib/lotes/compra.ts` y afines): solo cambia la presentación.
- El tema oscuro como tema por defecto: Mi tierra se ve en el tema que eligió la persona; en oscuro se cuida especialmente porque es donde más luce la dirección C.
- Billetera real, Safe o Candide (PR #219).

## Capabilities

### New Capabilities
- `ux-mi-tierra`: Mi tierra como billetera de tierra, con número principal, posiciones, actividad y estado vacío.

## Impact

- **Cambia:** `app/mi-tierra/mi-tierra-cliente.tsx`, `app/mi-tierra/page.tsx`, `lib/idioma/textos/mi-tierra.ts` (es/en).
- **Nuevo:** `components/mi-tierra/` (encabezado, fila de posición, actividad) y un dibujo SVG para el estado vacío, tests.
- **Tests:** `e2e/mi-tierra.spec.ts`, `e2e/accesibilidad.spec.ts`, tests de unidad de Mi tierra.
- **Sin** tablas, datos personales ni dependencias nuevas.
