# Spec Delta

## Purpose

Que cuando una página falla o no existe, la persona entienda qué pasó en palabras simples, pueda seguir usando la plataforma y pueda avisarle al equipo con el código del error, sin que se envíe nada sin su decisión.

## ADDED Requirements

### Requirement: Pantalla de error dentro del marco
Cuando una página falla al dibujarse, la plataforma SHALL mantener el marco (rail, barra superior, pie y aviso de prototipo) y mostrar en el contenido un título "Algo se rompió en esta página", una explicación en palabras simples y las acciones "Probar de nuevo", "Ir al inicio" y "Avisar al equipo". El foco MUST pasar al título.

#### Scenario: Falla una página
- **WHEN** una persona abre una página que falla al dibujarse
- **THEN** ve el título "Algo se rompió en esta página", el rail y la barra superior, y los tres controles, y el foco está en el título

#### Scenario: Probar de nuevo
- **WHEN** la persona aprieta "Probar de nuevo" y la página ya no falla
- **THEN** ve la página normal sin recargar el navegador

#### Scenario: Ir al inicio
- **WHEN** la persona activa "Ir al inicio"
- **THEN** llega a `/`

### Requirement: Código del error sin detalles técnicos
La pantalla de error SHALL mostrar "Código del error:" seguido del identificador que da el servidor, o "sin dato" si no hay. La plataforma MUST NOT mostrar el mensaje técnico ni la traza del error.

#### Scenario: Error del servidor
- **WHEN** falla una página al dibujarse en el servidor
- **THEN** la pantalla muestra "Código del error:" con un identificador no vacío y no muestra el mensaje con el que falló

#### Scenario: Error sin identificador
- **WHEN** falla una página en el navegador y no hay identificador
- **THEN** la pantalla muestra "Código del error: sin dato"

### Requirement: Avisar al equipo con el reporte ya escrito
"Avisar al equipo" SHALL abrir el diálogo de Reportar de siempre con el tipo "Algo no funciona" y "¿Qué pasó?" completado con "Apareció la pantalla de error en <ruta>. Código del error: <código o sin dato>." (ruta sin query ni fragmento). La persona MUST poder editar el texto, y nada se envía hasta que ella aprieta "Enviar reporte".

#### Scenario: Abrir el reporte desde el error
- **WHEN** una persona con sesión y la política aceptada aprieta "Avisar al equipo" en la pantalla de error de `/prueba-error?donde=servidor`
- **THEN** se abre el diálogo de Reportar, con "Algo no funciona" elegido y "¿Qué pasó?" que empieza con "Apareció la pantalla de error en /prueba-error." y no contiene `?donde=servidor`

#### Scenario: Sin sesión en una página pública
- **WHEN** una persona sin sesión abre `/no-existe` y aprieta "Avisar al equipo"
- **THEN** se abre el diálogo de Reportar en modo sin cuenta, con su aviso de publicación, y el texto completado

#### Scenario: Nada se envía solo
- **WHEN** se abre el diálogo desde "Avisar al equipo" y la persona lo cierra sin enviar
- **THEN** no se hizo ningún pedido a `/api/reportes`

#### Scenario: Ya había texto escrito
- **WHEN** la persona tenía texto sin enviar en "¿Qué pasó?" y aprieta "Avisar al equipo"
- **THEN** el diálogo conserva su texto y no lo reemplaza

### Requirement: Error en el marco
Cuando falla el propio marco de la plataforma, SHALL mostrarse una página mínima con un único `<main>`, el aviso "Prototipo interno · datos de ejemplo", el título "Algo se rompió", el código del error, "Volver a cargar", "Ir al inicio" y el texto "Para avisarnos, andá al inicio y usá el botón Reportar con este código.", con los colores del tema.

#### Scenario: Página mínima
- **WHEN** se dibuja la pantalla de error del marco
- **THEN** tiene un solo `<main>`, el aviso de prototipo, el título, el código y los dos controles, y el atributo `lang` del documento corresponde al idioma de la plataforma

### Requirement: Página que no existe
La página de no encontrado global SHALL ofrecer "Ir al inicio", "Ver las tribus" y "Avisar al equipo"; este último abre Reportar con "¿Qué pasó?" completado con "Llegué a una página que no existe: <ruta>." (sin query ni fragmento).

#### Scenario: Ruta inexistente
- **WHEN** una persona abre `/no-existe`
- **THEN** ve "No encontramos esa página" y los enlaces "Ir al inicio" y "Ver las tribus", y "Avisar al equipo" abre Reportar con "Llegué a una página que no existe: /no-existe."

### Requirement: Textos en el idioma de la plataforma
Los textos de las pantallas de error y de no encontrado, y el texto que se completa en Reportar, SHALL mostrarse en inglés cuando la plataforma está en inglés y en español en cualquier otro caso.

#### Scenario: En inglés
- **WHEN** la plataforma está en inglés y una página falla
- **THEN** el título, la explicación, los controles y el texto completado en Reportar están en inglés

### Requirement: Ruta de prueba solo fuera de producción
La plataforma SHALL tener una ruta `/prueba-error` que falla a propósito al dibujarse, en el servidor o en el navegador según su parámetro, solo cuando no corre en producción; en producción MUST responder como página que no existe.

#### Scenario: En producción
- **WHEN** se pide `/prueba-error` con el entorno de producción
- **THEN** responde 404 con la página de no encontrado

### Requirement: Accesible
Las pantallas de error y de no encontrado SHALL usarse solo con teclado y pasar la auditoría de axe sin violaciones serias ni críticas; nada MUST comunicarse solo con color.

#### Scenario: Auditoría
- **WHEN** se audita con axe la pantalla de error de `/prueba-error` y la de `/no-existe`
- **THEN** no hay violaciones serias ni críticas
