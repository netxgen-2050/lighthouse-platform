# Spec Delta

## Purpose

Presenta el Inicio y la vista "Barrio Norte" con la dirección A del rediseño (Valle de noche): primero el territorio, con la foto aérea a sangre y el título encima, y después los números en paneles de vidrio, para quien quiere saber dónde viviría, con quién y cuánto cuesta.

## ADDED Requirements

### Requirement: Foto del valle a sangre en el Inicio
`/` SHALL abrir con la foto aérea del valle ocupando todo el ancho del área de contenido, con el título y el llamado "Ver los lotes" encima, y la leyenda visible "Imagen ilustrativa" con su fuente. La foto MUST ser decorativa para el lector de pantalla (texto alternativo vacío) y el texto encima MUST pasar AA en los dos temas.

#### Scenario: Abrir el Inicio
- **WHEN** una persona abre `/` en una pantalla de 1280 px
- **THEN** ve la foto del valle a todo el ancho del contenido, el título encima, el botón "Ver los lotes" y la leyenda "Imagen ilustrativa"

#### Scenario: Celular
- **WHEN** una persona abre `/` a 390 × 844
- **THEN** la foto, el título y el botón se ven sin scroll horizontal y el botón tiene 44 px de alto o más

### Requirement: Contenido de la portada sin cambios
El Inicio SHALL mostrar los mismos textos, cifras con fuente y tarjetas de "Por dónde empezar" que define la portada de la fase 1, en el mismo orden. Las cifras MUST ir en paneles de vidrio con su fuente visible en texto, y la sección de cifras MUST NOT dibujarse si no hay cifras.

#### Scenario: Cifras en vidrio
- **WHEN** la portada tiene cifras con fuente
- **THEN** cada cifra se ve en un panel de vidrio con su número, su texto y su fuente

#### Scenario: Sello
- **WHEN** una persona abre `/`
- **THEN** ve "Prototipo interno · datos de ejemplo"

### Requirement: Vista Barrio Norte
`/barrios/norte` SHALL ser una página pública y bilingüe que abre con la foto del valle a sangre, el título "Barrio Norte" encima y el sello de venta ("Prototipo interno · datos de ejemplo" y "venta simulada · aprobación municipal pendiente"). La aprobación municipal MUST NOT mostrarse como otorgada.

#### Scenario: Abrir sin sesión
- **WHEN** una persona sin sesión abre `/barrios/norte`
- **THEN** ve el título "Barrio Norte" sobre la foto y el sello con "venta simulada · aprobación municipal pendiente"

#### Scenario: En inglés
- **WHEN** la persona abre `/barrios/norte` en inglés
- **THEN** el título, los estados y los avisos se ven en inglés

### Requirement: Lotes del barrio por estado
La vista SHALL mostrar cuántos lotes del barrio hay en cada estado (disponible, reservado, en cuotas, vendido), calculados de los datos del loteo, cada uno como indicador con su chip de estado, y un enlace a `/lotes`. Un estado que el modelo todavía no tiene MUST mostrar "sin dato", nunca 0. Las compras simuladas guardadas en el navegador de la persona MUST NOT cambiar estos totales.

#### Scenario: Estados con texto
- **WHEN** una persona mira la sección de lotes
- **THEN** cada total lleva el nombre del estado en texto y su ícono, y el enlace "Ver los lotes" lleva a `/lotes`

#### Scenario: Estado sin dato
- **WHEN** el modelo de lotes no tiene todavía el estado "en cuotas"
- **THEN** ese indicador dice "sin dato"

### Requirement: Lo que va al bien común
La vista SHALL mostrar qué parte de cada pago de un lote va al común y la expensa de referencia, leídas del módulo de lotes con su versión, en paneles de vidrio, con un enlace a `/bien-comun`. MUST NOT hablar de rendimiento, precio ni venta de FARO.

#### Scenario: Parte para el común
- **WHEN** una persona mira la sección del bien común
- **THEN** ve la parte de cada pago que va al común y la expensa, con la versión del modelo, y el enlace a `/bien-comun`

### Requirement: Panel de la obra del barrio solo con sesión
Con sesión, la vista SHALL mostrar un panel de vidrio con la infraestructura del barrio que financiaría el Token Inversor, cuánto se juntó (con una barra de avance; "sin dato" mientras no haya plata real), cómo se devuelve (a medida que entran las cuotas, con el mes calculado) y lo que le llega al común por año, todo calculado por el módulo del barrio. Sin sesión, en su lugar MUST aparecer un aviso corto con el enlace para entrar y ningún número de la obra.

#### Scenario: Con sesión
- **WHEN** una persona con sesión abre `/barrios/norte`
- **THEN** ve el monto de la infraestructura, la barra de lo juntado con "sin dato", el mes en que se terminaría de devolver al inversor y lo que le llega al común por año

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión abre `/barrios/norte`
- **THEN** ve el aviso para entrar en lugar del panel y la página no contiene el monto de la infraestructura

#### Scenario: Sin rendimiento
- **WHEN** se lee el panel
- **THEN** dice plazo y forma de devolución y no aparece ningún rendimiento anual ni ganancia

### Requirement: Sin números escritos en Explorar
Ningún número del modelo SHALL estar escrito en las páginas, componentes o diccionarios de Inicio y Barrio Norte: todos salen de los módulos con versión de lotes, del bien común o de la portada. El test que vigila números escritos MUST recorrer los archivos nuevos.

#### Scenario: Número escrito a propósito
- **WHEN** alguien escribe el precio de un lote en `app/barrios/norte/page.tsx`
- **THEN** el test de números escritos falla

### Requirement: Calidad de Explorar
Inicio y Barrio Norte SHALL pasar axe en los dos idiomas y los dos temas, ser usables solo con teclado, no tener scroll horizontal a 390 px, tener áreas tocables de 44 px y respetar la reducción de movimiento (sin parallax ni animación de la foto cuando se pide).

#### Scenario: Axe
- **WHEN** corre la auditoría de axe sobre `/` y `/barrios/norte` en español, en inglés, en tema oscuro y en tema claro
- **THEN** no hay violaciones
