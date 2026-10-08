# Spec Delta

## Purpose

Mostrar en el prototipo cómo se paga el Pase Fundador y la membresía, quién recibe cada peso (pagos divididos) y qué derechos quedan después, sin cobrar nada de verdad.

## ADDED Requirements

### Requirement: Confirmación antes de activar
En `/sumarte`, los botones "Quiero el Pase {nivel}" y "Hacerme miembro" SHALL abrir un paso de confirmación en la misma página en lugar de activar el producto. El paso MUST tener un título, el concepto, el monto en USD, el reparto de quién cobra, una casilla "Entiendo que es un pago simulado" y los botones "Confirmar pago simulado" y "Cancelar".

#### Scenario: Abrir la confirmación del Pase
- **WHEN** una persona elige el nivel Brote y activa "Quiero el Pase Brote"
- **THEN** aparece "Confirmá tu pago simulado" con "Pase Fundador Brote" y "USD 1.500 · pago único"
- **AND** el Pase todavía no figura activo

#### Scenario: Cancelar
- **WHEN** la persona activa "Cancelar" en el paso de confirmación
- **THEN** el paso se cierra, nada queda guardado y el foco vuelve al botón que lo abrió

### Requirement: Quién cobra el Pase
Para el Pase Fundador, el paso de confirmación y el comprobante SHALL decir "El Guardián del Lighthouse recibe USD {precio}" con el ⚖ `guardian`, y "Tarifa de servicio de NetX: sin dato (la define el equipo)" con el ⚖ `pagodividido`. La tarifa MUST NOT mostrarse como un número ni como 0.

#### Scenario: Reparto del Pase Raíz
- **WHEN** se abre la confirmación del Pase Raíz
- **THEN** se lee "El Guardián del Lighthouse recibe USD 5.000"
- **AND** se lee "Tarifa de servicio de NetX: sin dato"
- **AND** no aparece "USD 0" en el reparto

### Requirement: Quién cobra la membresía
Para la membresía, el paso de confirmación y el comprobante SHALL decir "NetX recibe USD {monto}: es un ingreso de la plataforma", con el monto de la facturación elegida (USD 10 mensual o USD 100 anual) y el ⚖ `membresia`.

#### Scenario: Membresía anual
- **WHEN** la facturación es Anual y la persona activa "Hacerme miembro"
- **THEN** la confirmación dice "Membresía de la red · anual" y "NetX recibe USD 100: es un ingreso de la plataforma"

### Requirement: Casilla obligatoria
"Confirmar pago simulado" SHALL exigir la casilla marcada. Sin marcar, MUST mostrar el error "Error: marcá la casilla para confirmar." asociado a la casilla y no guardar nada. Para el Pase, la casilla MUST incluir el texto "No da tierra, lotes, prioridad ni rendimiento, y no se revende".

#### Scenario: Confirmar sin marcar
- **WHEN** la persona activa "Confirmar pago simulado" sin marcar la casilla
- **THEN** ve el error asociado a la casilla y el producto no se activa

### Requirement: Comprobante simulado
Al confirmar, la página SHALL activar el producto (como lo hacía el clic directo) y mostrar un comprobante con número `SIM-` seguido de 6 letras mayúsculas o dígitos, fecha (dd/mm/aaaa), concepto, monto, reparto y el texto "(simulado) · no se cobró nada". El comprobante MUST guardarse solo en el navegador y seguir visible al recargar.

#### Scenario: Confirmar el Pase Brote
- **WHEN** la persona marca la casilla y confirma el Pase Brote
- **THEN** figura "Pase Brote activo (simulado)" y un comprobante "SIM-XXXXXX" de USD 1.500
- **AND** al recargar `/sumarte` el comprobante sigue en "Tus pagos simulados"

### Requirement: Derecho de arrepentimiento
Cada comprobante vigente SHALL mostrar el ⚖ `arrepentimiento`, los días que quedan del plazo de 10 días corridos desde su fecha y el botón "Arrepentirme (simulado)". Vencido el plazo, MUST decir "Plazo de arrepentimiento vencido" y no ofrecer el botón.

#### Scenario: Dentro del plazo
- **WHEN** el comprobante es de hace 3 días
- **THEN** dice "Podés arrepentirte: te quedan 7 días" y ofrece "Arrepentirme (simulado)"

#### Scenario: Fuera del plazo
- **WHEN** el comprobante es de hace 11 días
- **THEN** dice "Plazo de arrepentimiento vencido" y no hay botón

### Requirement: Efecto del arrepentimiento
Arrepentirse de un Pase SHALL quitar el Pase y volver al plan que había antes de ese pago; el comprobante MUST pasar a "Arrepentido". La membresía MUST NOT poder arrepentirse mientras haya un Pase activo: su comprobante dice "Incluida en tu Pase Fundador".

#### Scenario: Arrepentirse del Pase siendo Explorador antes
- **WHEN** una persona Explorador confirma el Pase Semilla y después se arrepiente
- **THEN** el plan actual vuelve a "Explorador", el Pase no figura activo y el comprobante dice "Arrepentido"
- **AND** los medidores de la cohorte vuelven a sus valores de ejemplo

#### Scenario: Membresía con Pase activo
- **WHEN** la persona pagó la membresía y después el Pase
- **THEN** el comprobante de la membresía dice "Incluida en tu Pase Fundador" y no ofrece "Arrepentirme (simulado)"

### Requirement: Comprobantes de productos dados de baja
Si el producto de un comprobante ya no está activo por otra vía (por ejemplo, "Volver a Explorador"), el comprobante SHALL decir "Dado de baja" y no ofrecer el arrepentimiento.

#### Scenario: Volver a Explorador con Pase pagado
- **WHEN** la persona confirmó el Pase Brote y después activa "Volver a Explorador"
- **THEN** el comprobante del Pase dice "Dado de baja"

### Requirement: Compatibilidad con lo guardado
Un estado de `/sumarte` guardado antes de este cambio (sin comprobantes) SHALL seguir leyéndose igual: plan y Pase se conservan y "Tus pagos simulados" dice "Todavía no hiciste pagos simulados". Un comprobante mal formado MUST descartarse sin romper la página.

#### Scenario: Pase activo de antes
- **WHEN** el navegador tiene un Pase Raíz guardado sin comprobantes
- **THEN** la página muestra "Pase Raíz activo (simulado)" y "Todavía no hiciste pagos simulados"

### Requirement: Textos legales nuevos como borrador
Los ⚖ `pagodividido` y `arrepentimiento` SHALL vivir en el catálogo único de términos con `borrador: true` y una explicación en palabras simples.

#### Scenario: Catálogo
- **WHEN** se consulta el catálogo de términos
- **THEN** `pagodividido` y `arrepentimiento` existen y son borrador

### Requirement: Accesibilidad y estilo
El paso de confirmación y la lista de pagos SHALL ser usables solo con teclado: al abrir la confirmación el foco va a su título y los estados de los comprobantes se dicen en texto, no solo con color. `/sumarte` MUST seguir pasando axe sin violaciones `serious` ni `critical` con la confirmación abierta, usar solo tokens del tema y no agregar un `<main>`.

#### Scenario: Auditoría con la confirmación abierta
- **WHEN** se corre axe sobre `/sumarte` con la confirmación del Pase abierta
- **THEN** no hay violaciones `serious` ni `critical`
