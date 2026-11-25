# Spec Delta

## Purpose

Base visual del rediseño "DeFi a la tierra": tipografía, escala de regeneración, contraste verificado en los dos temas y seis componentes chicos (indicador, barra de avance, panel de vidrio, tabla tipo libro, sello de prototipo y chip de estado) para mostrar números y estados con claridad, sin comunicar nada solo con color.

## ADDED Requirements

### Requirement: Tipografía de la slide
La plataforma SHALL usar Fraunces para los títulos (`h1` a `h3`), con el eje SOFT alto; Inter Tight para el texto; y JetBrains Mono para los números que lo pidan. Anek Latin y Figtree MUST NOT cargarse más. Las fuentes MUST definirse una sola vez como tokens del tema.

#### Scenario: Título de una página
- **WHEN** una persona abre `/lotes`
- **THEN** el `h1` se dibuja con Fraunces y el párrafo de abajo con Inter Tight

#### Scenario: Fuentes viejas
- **WHEN** se busca "Anek" o "Figtree" en `app/` y `components/`
- **THEN** no aparece ninguna

### Requirement: Escala de regeneración
El tema SHALL declarar cinco tokens de la escala de regeneración, de menos a más avance: terracota, ocre, oliva, salvia y verde, en los dos temas. Cada tono MUST tener contraste de al menos 3:1 contra el fondo y la superficie de su tema.

#### Scenario: Tema oscuro
- **WHEN** el tema es oscuro
- **THEN** la escala vale `#D9774A`, `#E0A640`, `#CFC85A`, `#9DB86E` y `#6FA35A`

#### Scenario: Tema claro
- **WHEN** el tema es claro
- **THEN** cada tono de la escala tiene contraste de 3:1 o más contra el fondo hueso

### Requirement: Contraste verificado
Un test SHALL leer los tokens de `app/globals.css` y comprobar, en los dos temas, que cada par de texto y fondo que la app usa junto pasa AA (4,5:1 para texto normal). La lista de pares MUST vivir en el test y crecer cuando se sume un par nuevo.

#### Scenario: Par que no pasa
- **WHEN** alguien cambia el secundario del tema claro por un tono que no llega a 4,5:1 sobre el fondo
- **THEN** el test falla y nombra el par y el tema

### Requirement: Indicador
El indicador SHALL mostrar un número grande y su etiqueta, con el número en monoespaciada cuando se lo pide. Si el número falta, MUST mostrar "sin dato" (o "no data" en inglés), nunca 0. El lector de pantalla MUST leer la etiqueta junto con el número.

#### Scenario: Con número
- **WHEN** el indicador recibe "Lotes disponibles" y 12
- **THEN** se ve "12" grande con "Lotes disponibles" debajo, y el lector lee los dos juntos

#### Scenario: Sin número
- **WHEN** el indicador recibe la etiqueta y ningún número
- **THEN** se ve "sin dato" en lugar del número

### Requirement: Barra de avance
La barra de avance SHALL mostrar una fracción entre 0 y 1 con el tono de la escala de regeneración que le corresponde por quinto (menos de 20 %, terracota; 80 % o más, verde), siempre con el porcentaje o una etiqueta visible al lado. MUST exponer valor, mínimo y máximo a los lectores de pantalla. Sin fracción, MUST mostrar "sin dato" y ningún relleno.

#### Scenario: Avance del 45 %
- **WHEN** la barra recibe 0,45 y la etiqueta "Obra del barrio"
- **THEN** el relleno usa el tono oliva, se lee "45 %" al lado y el lector anuncia "Obra del barrio, 45 %"

#### Scenario: Sin fracción
- **WHEN** la barra recibe la etiqueta y ninguna fracción
- **THEN** se ve "sin dato" y la barra queda vacía

#### Scenario: Fuera de rango
- **WHEN** la barra recibe 1,3 o un número negativo
- **THEN** muestra "sin dato" en lugar de un relleno

### Requirement: Panel de vidrio
El panel de vidrio SHALL tener un fondo translúcido con desenfoque, pensado para ir sobre una foto. Su fondo MUST ser lo bastante opaco para que el texto pase AA aunque la foto de atrás sea blanca o negra. Con `prefers-reduced-transparency` o si el navegador no desenfoca, MUST usar el fondo sólido de la superficie.

#### Scenario: Sobre una foto clara
- **WHEN** el panel va sobre una zona blanca de la foto
- **THEN** el texto del panel tiene contraste AA contra el color resultante del fondo

#### Scenario: Transparencia reducida
- **WHEN** el sistema pide reducir la transparencia
- **THEN** el panel se ve con fondo sólido

### Requirement: Tabla tipo libro
La tabla tipo libro SHALL ser una tabla con título (`caption`) y encabezados de columna para fecha, motivo y monto, con los montos en monoespaciada y alineados a la derecha. Un monto que falta MUST decir "sin dato". A 390 px MUST NOT generar scroll horizontal en la página: se acomoda en filas apiladas o se desplaza dentro de su propio contenedor con nombre accesible.

#### Scenario: Movimientos
- **WHEN** la tabla recibe tres movimientos
- **THEN** se ven tres filas con fecha, motivo y monto, bajo un título que el lector anuncia

#### Scenario: Celular
- **WHEN** la tabla se ve a 390 × 844
- **THEN** la página no tiene scroll horizontal

### Requirement: Sello de prototipo
El sello de prototipo SHALL decir "Prototipo interno · datos de ejemplo" y, en su variante de venta, sumar "venta simulada · aprobación municipal pendiente". MUST NOT tener una variante que muestre la aprobación municipal como otorgada.

#### Scenario: Variante de venta
- **WHEN** una página con lotes muestra el sello de venta
- **THEN** se lee "Prototipo interno · datos de ejemplo" y "venta simulada · aprobación municipal pendiente"

### Requirement: Chip de estado
El chip de estado SHALL aceptar solo estados de una lista cerrada (abierta, en discusión, decidida, disponible, reservado, en cuotas, vendido, en financiamiento) y mostrar siempre el nombre del estado en texto, con un ícono o forma propia de cada uno además del color. Los nombres MUST salir del diccionario, en los dos idiomas.

#### Scenario: Estado en cuotas
- **WHEN** el chip recibe "en cuotas" con el idioma en inglés
- **THEN** se lee el nombre del estado en inglés con su ícono

#### Scenario: Sin color
- **WHEN** se mira la página en escala de grises
- **THEN** "reservado" y "vendido" se distinguen por su texto y su ícono

### Requirement: Calidad de los componentes base
Los seis componentes SHALL recibir sus textos por props o del diccionario (nunca escritos adentro), usar solo tokens del tema, tener áreas tocables de 44 px cuando son interactivos y respetar la reducción de movimiento. MUST NOT traer datos ni números propios.

#### Scenario: Colores sueltos
- **WHEN** corre el test de colores sueltos
- **THEN** no encuentra colores fuera de `app/globals.css` en `components/ui/`
