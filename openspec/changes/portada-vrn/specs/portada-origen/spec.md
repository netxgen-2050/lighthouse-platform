# Spec Delta

## MODIFIED Requirements

### Requirement: Camino recomendado por link
Si la portada se abre con el parámetro `camino` igual a `lotes`, `territorio` o `tribus`, el sistema SHALL marcar la tarjeta correspondiente de "Por dónde empezar" con el texto visible "Recomendado para vos" y un borde destacado, sin cambiar el orden de las tarjetas. Con otro valor o sin el parámetro, ninguna tarjeta se marca.

#### Scenario: Link a los lotes
- **WHEN** la persona abre `/?camino=lotes`
- **THEN** la tarjeta "Ver los lotes" muestra "Recomendado para vos"
- **AND** las otras dos tarjetas no lo muestran

#### Scenario: Valor desconocido
- **WHEN** la persona abre `/?camino=otro`
- **THEN** ninguna tarjeta muestra "Recomendado para vos" y la página no falla

#### Scenario: Link al Congreso
- **WHEN** la persona abre `/?camino=congreso`, un enlace viejo
- **THEN** ninguna tarjeta muestra "Recomendado para vos" y la página no falla

### Requirement: Guardar el primer origen
Si la portada se abre con `utm_source`, `utm_medium` o `utm_campaign`, el sistema SHALL guardar en el navegador, con la clave `lh-origen`, la fuente, el medio, la campaña, el camino válido (si hay) y la fecha. Si ya hay un origen guardado, MUST conservar el primero y no pisarlo.

#### Scenario: Primera visita con campaña
- **WHEN** la persona abre `/?utm_source=newsletter&utm_medium=email&utm_campaign=lotes-2026&camino=lotes`
- **THEN** `lh-origen` guarda fuente "newsletter", medio "email", campaña "lotes-2026" y camino "lotes"

#### Scenario: Segunda visita con otra campaña
- **WHEN** ya hay un origen guardado y la persona abre `/?utm_source=telegram`
- **THEN** `lh-origen` sigue teniendo el primer origen

#### Scenario: Sin parámetros de campaña
- **WHEN** la persona abre `/` o `/?camino=tribus` sin ningún `utm_*`
- **THEN** no se guarda nada en `lh-origen`

#### Scenario: Origen viejo con un camino que ya no existe
- **WHEN** el navegador tiene un `lh-origen` con `camino: "congreso"`
- **THEN** el origen se sigue leyendo con su fuente y su campaña, sin camino

### Requirement: Calidad
La marca "Recomendado para vos" MUST leerse como texto (no solo color ni borde), las tarjetas MUST seguir siendo enlaces usables con teclado, la página MUST usar solo tokens del tema y un único `<main>`, y `/?camino=lotes` y `/netx` con un pedido con origen MUST pasar la auditoría de axe sin violaciones `serious` ni `critical`.

#### Scenario: Lector de pantalla
- **WHEN** la persona llega con Tab a la tarjeta recomendada
- **THEN** el nombre accesible del enlace incluye "Recomendado para vos"
