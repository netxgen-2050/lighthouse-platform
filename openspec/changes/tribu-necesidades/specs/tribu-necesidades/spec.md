# Spec Delta

## Purpose

Que cada cosa que busca una tribu sea una necesidad con ficha de tarea (qué es, horas, si es de diseño o de campo, para cuándo, qué habilidad pide, su estado, su círculo y su holón), visible en la ficha de la tribu, y que las tareas de diseño lleven el aval de su holón (Backlog D18 y D19, decisión de Gus del 28-oct).

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

### Requirement: Holón de la necesidad
Cada necesidad SHALL tener un holón: su círculo, si tiene, y si no, su tribu. El holón es quien avala, pre-admite y verifica la tarea (el holón más chico que la contiene). El modelo SHALL admitir también el común Lighthouse como holón, aunque este cambio no muestre necesidades del común.

#### Scenario: Con círculo
- **WHEN** se pide el holón de `semilla-riego`
- **THEN** es el círculo `semilla-1`

#### Scenario: Sin círculo
- **WHEN** un test arma una necesidad de `valle` sin círculo y pide su holón
- **THEN** es la tribu `valle`

### Requirement: Aval de las tareas de diseño
Toda necesidad de diseño SHALL necesitar el aval de su holón para poder tomarse. El aval SHALL ser una constancia con la forma de los registros de gobernanza (id, esquema "avala-necesidad", quién afirma, sobre qué necesidad, a qué apunta, cuándo y datos), y MUST contar solo si quien afirma es el holón de esa necesidad. Una tarea de diseño con aval SHALL mostrar "Avalada por <holón>" marcado como ejemplo; una sin aval SHALL mostrar "Esperando el aval de <holón>" y MUST NOT considerarse tomable. Las tareas de campo MUST NOT pedir aval. Una necesidad de diseño tomada o hecha MUST tener aval.

#### Scenario: Tarea de diseño avalada
- **WHEN** se abre en `/tribus/semilla` la necesidad "Riego"
- **THEN** se lee "Avalada por el círculo Huerta intensiva (ejemplo)"

#### Scenario: Tarea de diseño sin aval
- **WHEN** se mira en `/tribus/puerto` la necesidad "Marketing"
- **THEN** junto al título se lee "Abierta · esperando aval", al abrirla "Esperando el aval del círculo Mercado", y no es tomable

#### Scenario: Aval de otro holón
- **WHEN** un test arma un aval de `semilla-riego` que afirma `tribu:valle`
- **THEN** el aval no cuenta y la validación de los datos lo rechaza

#### Scenario: Tarea de campo
- **WHEN** se abre en `/tribus/valle` la necesidad "Energía solar"
- **THEN** no hay ninguna línea de aval y es tomable

### Requirement: Ficha de la tribu con las necesidades
En la ficha de una tribu activa o en formación, la tarjeta "Lo que busca" SHALL listar sus necesidades, cada una como un elemento plegable usable con teclado, con el título, el tipo y el estado a la vista, y el resto de la ficha al abrirla. Cada necesidad SHALL tener el ancla `necesidad-<id>`; al entrar con esa ancla, la necesidad MUST mostrarse abierta. Las áreas de Avelan Kerum SHALL seguir apareciendo debajo, como hoy.

#### Scenario: Abrir con teclado
- **WHEN** en `/tribus/agua` se llega con Tab a "Plomería" y se aprieta Enter
- **THEN** se ve "Conectar la cisterna nueva con la red del núcleo común" y las horas, la fecha, la habilidad y el círculo

#### Scenario: Entrar por el ancla
- **WHEN** se abre `/tribus/agua#necesidad-agua-tratamiento`
- **THEN** la necesidad "Tratamiento de aguas" está abierta

### Requirement: Textos en dos idiomas
Todos los textos nuevos SHALL existir en español (con voseo) y en inglés, y el inglés de las necesidades de ejemplo SHALL quedar listado para revisión nativa. Con la interfaz en inglés, la ficha MUST mostrar el título, el "qué es", el tipo, el estado, la habilidad, el círculo y el aval en inglés, y la fecha con el formato del idioma.

#### Scenario: En inglés
- **WHEN** se abre `/tribus/semilla` con la interfaz en inglés y se despliega "Irrigation"
- **THEN** se lee "Design work", "Open" y "December 15, 2026"

### Requirement: Accesibilidad y estilo
La ficha de la tribu con las necesidades SHALL pasar axe sin violaciones `serious` ni `critical`, MUST NOT agregar un `<main>` propio y SHALL usar solo tokens del tema.

#### Scenario: Auditoría
- **WHEN** se corre axe sobre `/tribus/valle` con una necesidad abierta
- **THEN** no hay violaciones `serious` ni `critical`
