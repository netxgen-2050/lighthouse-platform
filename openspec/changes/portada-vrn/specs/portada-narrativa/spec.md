# Spec Delta

## Purpose

Que quien llega de cero a la portada entienda la promesa de Lighthouse VRN a 2030, por qué Argentina y qué se regenera, y llegue a ver los lotes, con cada cifra respaldada por su fuente.

## ADDED Requirements

### Requirement: La promesa a 2030
La portada SHALL contar, en español e inglés, la promesa de Lighthouse VRN a 2030: regeneración desde el agua en el corazón de Vaca Muerta, trabajo en industrias regenerativas y comunidad. MUST presentarla como una meta, no como una garantía.

#### Scenario: Leer la promesa
- **WHEN** una persona abre `/`
- **THEN** lee "2030", "agua", "Vaca Muerta", "industrias regenerativas" y "comunidad", y que es una meta y no una garantía

#### Scenario: En inglés
- **WHEN** una persona abre `/?lang=en`
- **THEN** lee la promesa en inglés, sin español suelto

### Requirement: Argentina, seguro y abierto
La portada SHALL presentar a Argentina como un lugar seguro y abierto, sin cifras que no tengan fuente, y con el ⚖ sobre los límites para que una persona extranjera compre tierra rural.

#### Scenario: Leer
- **WHEN** una persona lee esa sección
- **THEN** lee "Argentina, un lugar seguro y abierto" y puede abrir el ⚖ sobre la tierra rural

### Requirement: Los cinco capitales
La portada SHALL listar los cinco capitales de la regeneración, cada uno con una línea en palabras simples, en los dos idiomas. La lista MUST vivir en un solo módulo.

#### Scenario: Leer
- **WHEN** una persona lee "Los cinco capitales de la regeneración"
- **THEN** encuentra cinco elementos, cada uno con su nombre y su explicación

### Requirement: Llamado a ver los lotes
La portada SHALL tener como acción principal "Ver los lotes", que lleve a `/lotes` y se pueda usar con el teclado. La portada MUST NOT mostrar el precio de un lote.

#### Scenario: Ir a los lotes
- **WHEN** una persona llega con Tab a "Ver los lotes" y aprieta Enter
- **THEN** llega a `/lotes`

### Requirement: Cifras con su fuente
Toda cifra de la portada SHALL mostrarse con su fuente al lado, en texto. Una cifra sin fuente MUST NOT poder entrar: lo impide un test. Sin cifras, la sección MUST NOT dibujarse.

#### Scenario: Cifra con fuente
- **WHEN** una persona lee una cifra de la portada
- **THEN** lee su fuente junto a ella

#### Scenario: Cifra sin fuente
- **WHEN** alguien suma una cifra con la fuente vacía
- **THEN** el test falla

#### Scenario: Sin cifras
- **WHEN** la lista de cifras está vacía
- **THEN** la sección no aparece, y no se muestra ningún 0

### Requirement: Solo Lighthouse VRN en la portada
La portada MUST NOT nombrar Lighthouse SMA, San Martín de los Andes ni Atlántico Sur, MUST NOT usar los números del deck de inversores (USD 111M, TIR, recupero), y MUST NOT ofrecer el Congreso.

#### Scenario: Revisar
- **WHEN** se lee todo el texto de `/` en los dos idiomas
- **THEN** no aparece ninguno de esos nombres ni números, y no hay ningún enlace a `/congreso`

### Requirement: Calidad de la portada
La portada SHALL mostrar "Prototipo interno · datos de ejemplo", usar solo tokens del tema, pasar la auditoría de axe en los dos idiomas y no tener scroll horizontal a 390 px.

#### Scenario: Celular
- **WHEN** la página se ve a 390 × 844 px
- **THEN** no hay scroll horizontal y el aviso se lee antes que el héroe
