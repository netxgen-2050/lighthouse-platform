# Spec Delta

## Purpose

Que cada cosa que busca una tribu sea una necesidad con ficha de tarea (qué es, horas, si es de diseño o de campo, para cuándo, qué habilidad pide, su estado y su círculo), visible en la ficha de la tribu (Backlog D18).

## ADDED Requirements

### Requirement: Ficha de tarea de una necesidad
Cada necesidad SHALL tener: un id estable, la tribu a la que pertenece, un título y un "qué es" en español y en inglés, horas aproximadas (entero positivo, o sin dato), un tipo ("diseño" o "campo"), una fecha para cuándo (`AAAA-MM-DD`, o sin dato), una habilidad (una clave de los roles de `/pactos`; si es "otro", con su texto en es/en) y un estado ("abierta", "tomada" o "hecha"). Un dato que falta MUST mostrarse como "sin dato", nunca como 0 ni como una fecha inventada.

#### Scenario: Necesidad completa
- **WHEN** se abre en `/tribus/semilla` la necesidad "Riego"
- **THEN** se lee "Diseñar el riego por goteo de la huerta intensiva", "~20 h", "De diseño", "15 de diciembre de 2026", la habilidad "Diseño de permacultura" y el estado "Abierta"

#### Scenario: Horas que faltan
- **WHEN** se abre en `/tribus/valle` la necesidad "Eventos y comunidad"
- **THEN** las horas dicen "sin dato" y no "0 h"

#### Scenario: Fecha que falta
- **WHEN** se abre en `/tribus/monte` la necesidad "Maquinaria"
- **THEN** "Para cuándo" dice "sin dato"

### Requirement: Una necesidad por cada etiqueta de lo que busca
Cada etiqueta de `busca` de una tribu activa o en formación SHALL tener exactamente una necesidad de esa tribu con el mismo título en los dos idiomas, y cada necesidad MUST corresponder a una etiqueta de `busca` de su tribu. Los barrios vacantes MUST NOT tener necesidades. El listado `/tribus` y el mapa SHALL seguir mostrando las etiquetas como hoy.

#### Scenario: Valle Solar
- **WHEN** se leen las necesidades de `valle`
- **THEN** son tres, con los títulos "Energía solar", "Bioconstrucción" y "Eventos y comunidad"

#### Scenario: Barrio vacante
- **WHEN** se leen las necesidades de `grano`
- **THEN** la lista está vacía y `/tribus/grano` sigue mostrando "Agricultura extensiva", "Animales" y "Molienda" como etiquetas

### Requirement: Diseño o campo en palabras
El tipo SHALL mostrarse con texto ("De diseño" o "De campo") y una explicación corta accesible ("planificar o diseñar algo para la tribu" / "trabajo con las manos en el lugar"). El tipo MUST NOT comunicarse solo con color o con un ícono.

#### Scenario: De campo
- **WHEN** se mira la necesidad "Energía solar" en `/tribus/valle` sin abrirla
- **THEN** se lee "De campo" junto al título

### Requirement: Estado de ejemplo
El estado SHALL mostrarse con texto ("Abierta", "Tomada" o "Hecha") junto al título y marcado como dato de ejemplo. En este cambio el estado MUST NOT cambiar por nada que haga la persona.

#### Scenario: Una necesidad hecha
- **WHEN** se abre `/tribus/valle`
- **THEN** la necesidad "Bioconstrucción" dice "Hecha" y está marcada como ejemplo

### Requirement: Necesidad dentro de un círculo
Una necesidad MAY pertenecer a un círculo. Si lo tiene, el círculo MUST ser uno de los círculos de su tribu (`circulosDe`) o un círculo transversal en cuyas `tribus` figura su tribu, y la ficha SHALL mostrar "Círculo: <nombre>" en el idioma de la página. Si no tiene, la ficha MUST NOT mostrar la línea del círculo.

#### Scenario: Círculo de la tribu
- **WHEN** se abre en `/tribus/valle` la necesidad "Energía solar"
- **THEN** se lee "Círculo: Energía solar"

#### Scenario: Círculo transversal
- **WHEN** se abre en `/tribus/valle` la necesidad "Eventos y comunidad"
- **THEN** se lee "Círculo: Comunicación del común"

#### Scenario: Círculo de otra tribu
- **WHEN** un test arma una necesidad de `semilla` con el círculo `valle-3`
- **THEN** la validación de los datos la rechaza

### Requirement: Ficha de la tribu con las necesidades
En la ficha de una tribu activa o en formación, la tarjeta "Lo que busca" SHALL listar sus necesidades, cada una como un elemento plegable usable con teclado, con el título, el tipo y el estado a la vista, y el resto de la ficha al abrirla. Cada necesidad SHALL tener el ancla `necesidad-<id>`; al entrar con esa ancla, la necesidad MUST mostrarse abierta. Las áreas de Avelan Kerum SHALL seguir apareciendo debajo, como hoy.

#### Scenario: Abrir con teclado
- **WHEN** en `/tribus/agua` se llega con Tab a "Plomería" y se aprieta Enter
- **THEN** se ve "Conectar la cisterna nueva con la red del núcleo común" y las horas, la fecha, la habilidad y el círculo

#### Scenario: Entrar por el ancla
- **WHEN** se abre `/tribus/agua#necesidad-agua-tratamiento`
- **THEN** la necesidad "Tratamiento de aguas" está abierta

### Requirement: Textos en dos idiomas
Todos los textos nuevos SHALL existir en español (con voseo) y en inglés, y el inglés de las necesidades de ejemplo SHALL quedar listado para revisión nativa. Con la interfaz en inglés, la ficha MUST mostrar el título, el "qué es", el tipo, el estado, la habilidad y el círculo en inglés, y la fecha con el formato del idioma.

#### Scenario: En inglés
- **WHEN** se abre `/tribus/semilla` con la interfaz en inglés y se despliega "Irrigation"
- **THEN** se lee "Design work", "Open" y "December 15, 2026"

### Requirement: Accesibilidad y estilo
La ficha de la tribu con las necesidades SHALL pasar axe sin violaciones `serious` ni `critical`, MUST NOT agregar un `<main>` propio y SHALL usar solo tokens del tema.

#### Scenario: Auditoría
- **WHEN** se corre axe sobre `/tribus/valle` con una necesidad abierta
- **THEN** no hay violaciones `serious` ni `critical`
