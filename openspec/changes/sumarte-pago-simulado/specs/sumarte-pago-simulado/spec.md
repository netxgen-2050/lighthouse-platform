# Spec Delta

## Purpose

Mostrar en `/sumarte`, con pagos simulados, cuánto se paga por la membresía o el Pase Fundador y a quién va cada parte (nota 18 §4.1 y §5), y dejar un comprobante de ejemplo.

## ADDED Requirements

### Requirement: Resumen antes de activar
Los botones "Hacerme miembro" y "Quiero el Pase {nivel}" de `/sumarte` SHALL abrir un "Resumen del pago (simulado)" en lugar de activar el plan o el pase. El resumen MUST mostrar el concepto, el total y quién recibe cada parte, y los botones "Confirmar pago simulado" y "Cancelar". Hasta confirmar, el plan y el pase de la persona MUST quedar como estaban.

#### Scenario: Abrir el resumen del Pase
- **WHEN** la persona elige el nivel Brote y pulsa "Quiero el Pase Brote"
- **THEN** ve "Resumen del pago (simulado)" con total USD 1.500
- **AND** su pase todavía no figura como activo

#### Scenario: Cancelar
- **WHEN** la persona abre el resumen y pulsa "Cancelar"
- **THEN** el resumen se cierra, nada cambia en su plan y el foco vuelve al botón que lo abrió

### Requirement: Quién recibe la plata
En el resumen de la membresía, el sistema SHALL mostrar que NetX recibe el 100 % del total (USD 10 mensual o USD 100 anual, según el selector), con el texto "ingreso de la plataforma". En el resumen del Pase Fundador, SHALL mostrar dos partes: "Guardián del Fondo Común" recibe el total menos la tarifa y "NetX" recibe la tarifa de servicio, calculada con la tarifa de ejemplo de la plataforma y rotulada "tarifa de ejemplo". Las partes MUST sumar exactamente el total.

#### Scenario: Reparto del Pase Raíz
- **WHEN** la persona abre el resumen del Pase Raíz (USD 5.000)
- **THEN** ve "Guardián del Fondo Común" con USD 4.750 y "NetX" con USD 250 y la etiqueta "tarifa de ejemplo"

#### Scenario: Membresía anual
- **WHEN** el selector está en "Anual" y la persona pulsa "Hacerme miembro"
- **THEN** el resumen muestra total USD 100 y NetX recibe USD 100

#### Scenario: Cambiar el nivel con el resumen abierto
- **WHEN** el resumen del Pase Brote está abierto y la persona elige Semilla
- **THEN** el resumen pasa a total USD 300, Guardián USD 285 y NetX USD 15

### Requirement: Sin datos de pago reales
El resumen MUST mostrar el aviso "Pago simulado: no se cobra nada y no te pedimos datos de tarjeta." y MUST NOT tener campos para número de tarjeta, código de seguridad, vencimiento, CBU ni ningún otro dato de pago. Los montos SHALL mostrarse en la moneda elegida por la persona, con el mismo formato que el resto de `/sumarte`.

#### Scenario: Ningún campo de tarjeta
- **WHEN** el resumen está abierto
- **THEN** no hay ningún campo de texto dentro del resumen

### Requirement: Textos legales de borrador
El resumen del Pase SHALL incluir la leyenda "La plataforma procesa el pago pero no se queda con la plata del Guardián: la pasarela la deposita directo en su cuenta." con el ⚖ `pagodividido`, y todo resumen SHALL incluir una mención del derecho de arrepentimiento con el ⚖ `arrepentimiento`. Las dos claves MUST vivir en `lib/legal/terminos.ts` con `borrador: true`.

#### Scenario: Términos en el catálogo
- **WHEN** se corre el test del catálogo legal
- **THEN** `esBorrador("pagodividido")` y `esBorrador("arrepentimiento")` son verdaderos

#### Scenario: Explicación con teclado
- **WHEN** la persona llega con Tab al ⚖ de `pagodividido` y lo activa
- **THEN** ve la explicación en palabras simples

### Requirement: Confirmar deja un comprobante
"Confirmar pago simulado" SHALL activar la membresía o el pase como hoy (con el texto "(simulado)") y guardar un comprobante en el navegador con la clave `lh-pagos` (con prefijo por persona): fecha, concepto, total en USD y las partes del reparto. `/sumarte` SHALL mostrar la sección "Tus pagos simulados" con cada comprobante (fecha, concepto, total y reparto), el más nuevo primero; sin comprobantes MUST mostrar "Todavía no hiciste pagos simulados." Volver a Explorador MUST NOT borrar los comprobantes.

#### Scenario: Pagar el Pase Semilla
- **WHEN** la persona confirma el pago simulado del Pase Semilla
- **THEN** ve "Pase Semilla activo (simulado)"
- **AND** en "Tus pagos simulados" aparece un comprobante de USD 300 con Guardián USD 285 y NetX USD 15

#### Scenario: Comprobante guardado roto
- **WHEN** `lh-pagos` tiene un comprobante válido y uno mal formado
- **THEN** la sección muestra solo el válido y la página no falla

#### Scenario: Borrar todo
- **WHEN** la persona usa "Borrar todo lo de este navegador" y confirma
- **THEN** `lh-pagos` ya no existe y la sección dice "Todavía no hiciste pagos simulados."

### Requirement: La inversión no pasa por acá
"Pedir invitación" (círculo del Lote 7) y "Pedir una charla" (invertir en NetX) MUST NOT abrir un resumen de pago ni generar comprobantes; siguen siendo pedidos de contacto.

#### Scenario: Pedir invitación
- **WHEN** la persona pulsa "Pedir invitación"
- **THEN** no aparece ningún "Resumen del pago (simulado)" y `lh-pagos` no cambia

### Requirement: Calidad
El resumen MUST recibir el foco al abrirse, todo MUST ser usable con teclado, el reparto MUST leerse como texto (no solo con color ni barras), la página MUST usar solo tokens del tema y no anidar otro `<main>`, y `/sumarte` con un resumen abierto y con un comprobante MUST pasar la auditoría de axe sin violaciones `serious` ni `critical`.

#### Scenario: Foco al abrir
- **WHEN** la persona pulsa "Hacerme miembro" con el teclado
- **THEN** el foco pasa al resumen y "Confirmar pago simulado" se alcanza con Tab
