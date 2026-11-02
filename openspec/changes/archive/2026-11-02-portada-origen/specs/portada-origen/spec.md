# Spec Delta

## Purpose

Recomendar un camino de la portada según el link por el que llega la persona y guardar de qué campaña vino, para verlo junto a cada pedido de contacto en la Vista NetX.

## ADDED Requirements

### Requirement: Camino recomendado por link
Si la portada se abre con el parámetro `camino` igual a `tribus`, `perfil` o `congreso`, el sistema SHALL marcar la tarjeta correspondiente de "Por dónde empezar" con el texto visible "Recomendado para vos" y un borde destacado, sin cambiar el orden de las tarjetas. Con otro valor o sin el parámetro, ninguna tarjeta se marca.

#### Scenario: Link al Congreso
- **WHEN** la persona abre `/?camino=congreso`
- **THEN** la tarjeta "Congreso · Feb 2027" muestra "Recomendado para vos"
- **AND** las otras dos tarjetas no lo muestran

#### Scenario: Valor desconocido
- **WHEN** la persona abre `/?camino=lotes`
- **THEN** ninguna tarjeta muestra "Recomendado para vos" y la página no falla

### Requirement: Guardar el primer origen
Si la portada se abre con `utm_source`, `utm_medium` o `utm_campaign`, el sistema SHALL guardar en el navegador, con la clave `lh-origen`, la fuente, el medio, la campaña, el camino válido (si hay) y la fecha. Si ya hay un origen guardado, MUST conservar el primero y no pisarlo.

#### Scenario: Primera visita con campaña
- **WHEN** la persona abre `/?utm_source=newsletter&utm_medium=email&utm_campaign=congreso-2027&camino=congreso`
- **THEN** `lh-origen` guarda fuente "newsletter", medio "email", campaña "congreso-2027" y camino "congreso"

#### Scenario: Segunda visita con otra campaña
- **WHEN** ya hay un origen guardado y la persona abre `/?utm_source=telegram`
- **THEN** `lh-origen` sigue teniendo el primer origen

#### Scenario: Sin parámetros de campaña
- **WHEN** la persona abre `/` o `/?camino=perfil` sin ningún `utm_*`
- **THEN** no se guarda nada en `lh-origen`

### Requirement: Solo parámetros permitidos, con su valor tal cual
El sistema MUST guardar únicamente `utm_source`, `utm_medium`, `utm_campaign` y `camino`, y MUST descartar cualquier otro parámetro de la URL. Los valores de los `utm_` SHALL guardarse tal como vienen, sin filtros (decisión de Gus, 13-oct-2026): solo se sacan los espacios de los bordes y se corta a 200 caracteres; un valor vacío se trata como faltante. `camino` solo vale si es uno de los caminos de la portada.

#### Scenario: Parámetro no permitido
- **WHEN** la persona abre `/?utm_source=ig&email=ana@ejemplo.com`
- **THEN** `lh-origen` guarda fuente "ig" y no contiene "ana@ejemplo.com"

#### Scenario: Valor sin filtros
- **WHEN** la persona abre `/?utm_source=ana@ejemplo.com&utm_campaign=Promo%20Feb`
- **THEN** `lh-origen` guarda fuente "ana@ejemplo.com" y campaña "Promo Feb"

#### Scenario: Valor con caracteres raros
- **WHEN** la persona abre `/?utm_campaign=<script>Promo Feb</script>`
- **THEN** la campaña guardada solo tiene letras, números, `-`, `_` o `.`, y nada se pinta como HTML

### Requirement: Origen en los pedidos de contacto
Cada pedido de contacto nuevo SHALL copiar el origen guardado (fuente, medio y campaña) si existe. Un pedido sin origen MUST guardarse igual, sin ese dato.

#### Scenario: Pedido después de una campaña
- **WHEN** la persona llegó con `utm_source=newsletter&utm_campaign=congreso-2027` y después pide una charla en `/sumarte`
- **THEN** el pedido guardado en `lh-contactos` tiene fuente "newsletter" y campaña "congreso-2027"

### Requirement: Columna Origen en la Vista NetX
La tabla "Pedidos de contacto" de `/netx` SHALL sumar la columna "Origen" con "fuente · medio · campaña". Cada parte que falte MUST mostrarse como "sin dato"; un pedido sin origen MUST mostrar "sin dato".

#### Scenario: Origen incompleto
- **WHEN** un pedido tiene fuente "newsletter", sin medio, y campaña "congreso-2027"
- **THEN** la columna "Origen" muestra "newsletter · sin dato · congreso-2027"

#### Scenario: Pedido sin origen
- **WHEN** un pedido no tiene origen
- **THEN** la columna "Origen" muestra "sin dato"

### Requirement: Borrar el origen
"Borrar todo lo de este navegador" SHALL quitar también `lh-origen`, y un valor guardado inválido en `lh-origen` MUST leerse como "sin origen" sin que la pantalla falle.

#### Scenario: Borrar todo
- **WHEN** hay un origen guardado y la persona usa "Borrar todo lo de este navegador" y confirma
- **THEN** `lh-origen` ya no existe

### Requirement: Calidad
La marca "Recomendado para vos" MUST leerse como texto (no solo color ni borde), las tarjetas MUST seguir siendo enlaces usables con teclado, la página MUST usar solo tokens del tema y un único `<main>`, y `/?camino=congreso` y `/netx` con un pedido con origen MUST pasar la auditoría de axe sin violaciones `serious` ni `critical`.

#### Scenario: Lector de pantalla
- **WHEN** la persona llega con Tab a la tarjeta recomendada
- **THEN** el nombre accesible del enlace incluye "Recomendado para vos"
