# Spec Delta

## Purpose

Mostrar en una sola pantalla, de solo lectura, lo que una persona tiene en la red (su Pase, sus créditos, su presencia, sus Semillas y su voz), para que se vea qué obtiene quien se suma o paga el Pase Fundador.

## ADDED Requirements

### Requirement: Página Mi Raíz
La plataforma SHALL tener la página `/mi-raiz` con el título "Mi Raíz", el ⚖ `miraiz` y cinco bloques con encabezado: "Tu pase", "Créditos comunes y de estadía", "Presencia", "Semillas" y "Tu voz". Cada bloque MUST tener un enlace a la pantalla donde se cambia ese dato.

#### Scenario: Estructura
- **WHEN** una persona abre `/mi-raiz`
- **THEN** ve el título "Mi Raíz" y los cinco encabezados en ese orden
- **AND** "Tu pase" enlaza a `/sumarte`, "Presencia" a `/congreso`, "Semillas" a `/semillas` y "Tu voz" a `/canales`

### Requirement: Solo lectura y no es plata
La página SHALL leer solo lo que ya guardan otras pantallas en el navegador y MUST NOT guardar nada. MUST mostrar el aviso "Mi Raíz no es una cuenta de plata: nada de lo que ves acá se vende, se transfiere ni da rendimiento."

#### Scenario: Aviso visible
- **WHEN** se abre `/mi-raiz`
- **THEN** se lee el aviso de que no es una cuenta de plata

### Requirement: Tu pase
"Tu pase" SHALL mostrar el plan actual (Explorador o Miembro) y el Pase Fundador activo con su nivel, o "Sin Pase Fundador" con el enlace "Conocé el Pase Fundador".

#### Scenario: Sin nada guardado
- **WHEN** se abre `/mi-raiz` sin datos guardados
- **THEN** "Tu pase" dice "Explorador" y "Sin Pase Fundador"

#### Scenario: Con Pase Brote
- **WHEN** la persona activó el Pase Brote en `/sumarte`
- **THEN** "Tu pase" dice "Miembro" y "Pase Fundador · Brote"

### Requirement: Créditos sin inventar
Con Pase, "Créditos comunes y de estadía" SHALL mostrar el total asignado del nivel ("USD 90", "USD 450" o "USD 1.500", "en 3 años") con el ⚖ `creditos`, y "Disponible hoy: sin dato" y "Vencimientos: sin dato". Sin Pase, MUST decir "Los créditos vienen con el Pase Fundador". Nunca MUST mostrar "USD 0" como saldo.

#### Scenario: Pase Raíz
- **WHEN** la persona tiene el Pase Raíz
- **THEN** el bloque dice "USD 1.500 en 3 años", "Disponible hoy: sin dato" y "Vencimientos: sin dato"

#### Scenario: Sin Pase
- **WHEN** la persona no tiene Pase
- **THEN** el bloque dice "Los créditos vienen con el Pase Fundador" y no aparece "USD 0"

### Requirement: Presencia
"Presencia" SHALL mostrar, con el ⚖ `presencia`: "Sin ticket registrado"; o "Ticket {código} · Genesis pendiente"; o "Genesis · N de 5 días", según lo guardado en `/congreso`.

#### Scenario: Con Genesis
- **WHEN** la persona tiene ticket y 2 días de check-in
- **THEN** "Presencia" dice "Genesis · 2 de 5 días"

#### Scenario: Ticket sin check-in
- **WHEN** la persona tiene ticket y ningún check-in
- **THEN** "Presencia" dice "Genesis pendiente"

### Requirement: Semillas
"Semillas" SHALL mostrar, con el ⚖ `semillas`, las Semillas de tiempo de 3 meses del pacto de tiempo aceptado con el mismo número que muestra `/semillas`, o "sin dato" con "Todavía no tenés un pacto de tiempo aceptado". El Pase MUST NOT sumar Semillas.

#### Scenario: Mismo número que Semillas
- **WHEN** la persona tiene un pacto de tiempo aceptado
- **THEN** el número de Semillas en `/mi-raiz` es igual al de `/semillas`

#### Scenario: Sin pacto
- **WHEN** la persona no tiene pacto de tiempo aceptado
- **THEN** "Semillas" dice "sin dato"

### Requirement: Tu voz
"Tu voz" SHALL listar "Voz en tu tribu", "Voz en el Fondo Común" y "Voto en la Asamblea de residentes" con el mismo estado en texto y los mismos motivos que muestra `/canales` para la situación real de la persona. Con voz en el Fondo Común y presencia Genesis, MUST decir "Refuerzo por presencia: a decidir" sin número.

#### Scenario: Pase con Genesis
- **WHEN** la persona tiene Pase Raíz y un check-in
- **THEN** "Voz en el Fondo Común" figura "Abierta · 1 voz" con "Refuerzo por presencia: a decidir"
- **AND** no aparecen "×1,5" ni "×2"

#### Scenario: Explorador
- **WHEN** la persona es Explorador sin Pase ni presencia
- **THEN** las tres filas figuran "Cerrada" con lo que las abre

### Requirement: Navegación
El rail SHALL incluir "Mi Raíz" (`/mi-raiz`) entre "Sumarte" y "Mi recorrido", y `/panel` SHALL tener el enlace "Ver Mi Raíz".

#### Scenario: Desde el rail
- **WHEN** una persona activa "Mi Raíz" en el rail
- **THEN** llega a `/mi-raiz` y el ítem figura como página actual

### Requirement: Texto legal nuevo como borrador
El ⚖ `miraiz` SHALL vivir en el catálogo único de términos con `borrador: true` y una explicación en palabras simples.

#### Scenario: Catálogo
- **WHEN** se consulta el catálogo de términos
- **THEN** `miraiz` existe y es borrador

### Requirement: Accesibilidad y estilo
`/mi-raiz` SHALL ser usable solo con teclado, comunicar cada estado en texto, pasar axe sin violaciones `serious` ni `critical`, usar solo tokens del tema, no agregar un `<main>` y mostrar el aviso "Prototipo interno · datos de ejemplo" como las demás páginas.

#### Scenario: Auditoría
- **WHEN** se corre axe sobre `/mi-raiz` sin datos y con Pase y Genesis
- **THEN** no hay violaciones `serious` ni `critical`
