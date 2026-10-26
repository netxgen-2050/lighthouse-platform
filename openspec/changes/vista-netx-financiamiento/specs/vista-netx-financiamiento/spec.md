# Spec Delta

## Purpose

Que la Vista NetX cuente al equipo de NetXGen cómo se financia NetX sin vender lotes: un relato en pestañas que contrasta el Juego A (vender tierra) con el Juego B (procomún), con números de partida, rangos de riesgo, supuestos a la vista y la palanca que movería cada número incómodo, más las herramientas del equipo (simulador) y las operaciones del super admin en el mismo lugar.

## ADDED Requirements

### Requirement: Pestañas de la Vista NetX
La Vista NetX SHALL mostrar, arriba del contenido de cada pestaña, una navegación con nombre "Secciones de la Vista NetX" con los enlaces "Resumen" (`/netx`), "Simulador" (`/netx/simulador`) y "Comunidad y embudo" (`/netx/comunidad`), en ese orden. "Comunidad y embudo" MUST aparecer solo para el super admin. El enlace de la pestaña abierta MUST estar marcado como página actual (no solo con color). La navegación MUST usarse con teclado y no desbordar a 390 px.

#### Scenario: Pestaña actual
- **WHEN** el super admin abre `/netx/comunidad`
- **THEN** ve las tres pestañas y "Comunidad y embudo" está marcada como página actual; "Resumen" no lo está

#### Scenario: Con teclado
- **WHEN** una persona con sesión llega con Tab a "Simulador" y aprieta Enter
- **THEN** se abre `/netx/simulador` y esa pestaña queda marcada como página actual

#### Scenario: Persona sin rol de super admin
- **WHEN** una persona con rol "persona" abre `/netx`
- **THEN** ve las pestañas "Resumen" y "Simulador" y no ve "Comunidad y embudo"

### Requirement: El relato es para toda persona con sesión
Las pestañas del relato (Resumen y Simulador) SHALL mostrarse a toda persona con sesión, de cualquier nivel. A quien no tiene sesión, la plataforma MUST llevarlo a Sumarte como en cualquier página personal, sin mostrar el contenido. El enlace "NetX" de la barra superior SHALL aparecer para toda persona con sesión.

#### Scenario: Persona con sesión
- **WHEN** una persona con rol "persona" abre `/netx`
- **THEN** ve el h1 "¿Cómo se financia NetX sin vender lotes?" y los tres bolsillos

#### Scenario: Enlace en la barra
- **WHEN** una persona con rol "persona" entra a la plataforma
- **THEN** ve el enlace "NetX" en la barra superior y la lleva a `/netx`

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión abre `/netx`
- **THEN** termina en Sumarte con la vuelta a `/netx` y no ve el Resumen

### Requirement: Las operaciones son solo del super admin
La pestaña "Comunidad y embudo", que contiene el panel de personas y roles, las postulaciones de comunidades y la bandeja de pedidos, SHALL mostrarse solo al super admin; a cualquier otra persona le MUST mostrar "No tenés acceso a esta vista", sin mostrar datos. Las lecturas y escrituras de personas MUST seguir verificando el rol en el servidor.

#### Scenario: Persona sin permiso
- **WHEN** una persona con rol "persona" abre `/netx/comunidad`
- **THEN** ve "No tenés acceso a esta vista" y no ve el embudo, el panel de personas, las postulaciones ni la bandeja

#### Scenario: El servidor también controla
- **WHEN** una persona con rol "persona" pide `/api/personas`
- **THEN** recibe 403

### Requirement: Un título por pestaña, sin el hito del Congreso
Cada pestaña SHALL tener un único título de nivel 1 propio y el aviso "Prototipo interno · datos de ejemplo". Ninguna pestaña MUST usar el Congreso ni "febrero" como hito de venta: el texto "¿Vamos a vender en febrero?" desaparece.

#### Scenario: Títulos
- **WHEN** el super admin recorre las tres pestañas
- **THEN** ve un solo h1 en cada una: "¿Cómo se financia NetX sin vender lotes?", "Simulador de la tokenomics" y "Comunidad y embudo"
- **AND** en ninguna aparece "¿Vamos a vender en febrero?"

### Requirement: Juego A y Juego B
El Resumen SHALL contar el modelo como un contraste entre el **Juego A** (el camino conocido: vender la tierra en lotes, lo que hace la mayoría) y el **Juego B** (procomún: lo que es de todos y se cuida entre todos; la tierra queda en una Fundación, la regeneración y la vida en el centro, y NetX sigue teniendo ingresos por su trabajo). El Juego A MUST presentarse con respeto y con sus costos en datos (Ordenanza 173, la plata entra una sola vez, la tierra se va); el Juego B, como una opción que suma. Ningún texto de la Vista NetX MUST usar "capitalista", "extractivista" ni "colonialista", ni nombrar a una persona como defensora del Juego A. La expresión "diseño B" MUST NOT aparecer en la pantalla salvo cuando se cita el documento técnico (NS_Tokenomics doc 28).

#### Scenario: Los dos juegos
- **WHEN** una persona con sesión abre `/netx`
- **THEN** lee "Juego A" como "el camino conocido" con "la tierra se va" y la Ordenanza 173, y "Juego B" con "procomún" explicado como "lo que es de todos y se cuida entre todos" y "la tierra queda"

#### Scenario: Palabras que no van
- **WHEN** se lee todo el texto de `/netx` y `/netx/simulador`
- **THEN** no aparece "capitalista", "extractivista", "colonialista" ni "Franz"
- **AND** "diseño B" aparece solo junto a "doc 28"

### Requirement: Comunidad y embudo conserva lo actual
La pestaña "Comunidad y embudo" SHALL mostrar los indicadores, el embudo con conversión, el cumplimiento con sus medidores y alertas, la tabla "Tribus por proyecto", el panel de personas, las postulaciones de comunidades y la bandeja de pedidos, con el mismo comportamiento que hoy tienen en `/netx`.

#### Scenario: Embudo en su pestaña
- **WHEN** el super admin abre `/netx/comunidad`
- **THEN** ve el embudo con "186" en "En una tribu" y "45% de la etapa anterior", y la bandeja de pedidos

### Requirement: Simulador como pestaña
El simulador de la tokenomics SHALL vivir en `/netx/simulador` con el encabezado de la Vista NetX y el mismo comportamiento que tenía en el Fogón. `/fogon/simulador` MUST llevar a `/netx/simulador`, y el Fogón MUST dejar de enlazarlo.

#### Scenario: Dirección vieja
- **WHEN** una persona con sesión abre `/fogon/simulador`
- **THEN** termina en `/netx/simulador` y ve el resultado de partida del viñedo ("USD 306.970" para el procomún)

#### Scenario: Fogón sin simulador
- **WHEN** una persona abre `/fogon`
- **THEN** no ve ningún enlace al simulador

### Requirement: Resumen en una frase
La pestaña Resumen SHALL abrir con el h1 "¿Cómo se financia NetX sin vender lotes?" y una respuesta corta: NetX es la empresa que diseña, gestiona y opera la plataforma; cobra por su trabajo, no por vender tierra; en el Juego B, la tierra queda en una Fundación y la plata de los proyectos entra por series.

#### Scenario: Respuesta corta
- **WHEN** una persona con sesión abre `/netx`
- **THEN** lee, debajo del título, que NetX cobra por su trabajo y no por vender tierra, y "en el Juego B, la tierra queda en una Fundación"

### Requirement: Avisos de valores de partida
La pestaña Resumen SHALL mostrar, antes de cualquier número, el aviso del simulador del catálogo legal ("valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado") y la fuente y versión de los modelos que usa.

#### Scenario: Avisos y fuente
- **WHEN** una persona con sesión abre `/netx`
- **THEN** ve el aviso de valores de partida arriba de los números y, al pie, las fuentes con su versión (por ejemplo "series_waterfall_sim.py v0.1, 17-oct-2026")

### Requirement: Tres bolsillos
El Resumen SHALL mostrar tres bloques que no se mezclan, cada uno con qué recibe, de dónde y en qué plazo: "NetX · la empresa", "Procomún · Fundación" e "Inversores de las series". El Pase Fundador MUST aparecer en el procomún con el texto de que no es plata de NetX.

#### Scenario: NetX
- **WHEN** una persona con sesión mira el bloque de NetX
- **THEN** ve el SAFE de la empresa "USD 375.000 a 500.000 (meta)", la comisión de gestión "USD 8.550 por año" en el viñedo y "USD 40.000 por año" en la agrovoltaica, la comisión de desarrollo "3 a 5 % del capex, una vez" con el ejemplo de la agrovoltaica "USD 120.000 a 200.000", las membresías y el Plan Tribu "USD 1.336 por mes al mes 36 (escenario base)", y el contrato de diseño con BioPueblo "sin dato (a cotizar)"

#### Scenario: Procomún
- **WHEN** una persona con sesión mira el bloque del procomún
- **THEN** ve "USD 306.970 en 15 años" del viñedo, "USD 1.357.031 en 20 años" de la agrovoltaica y el Pase Fundador "USD 49.500 · 96.000 · 171.000 (bajo · base · bueno)" con "va al procomún, no a NetX" y que el escenario bajo no llega al mínimo de USD 75.000

#### Scenario: Inversores
- **WHEN** una persona con sesión mira el bloque de inversores
- **THEN** ve las Unidades de Regeneración del viñedo "2,66x · TIR 9,2 % en 15 años" y de la agrovoltaica "2,84x · TIR 10,3 % en 20 años", y las Notas Verdes "TIR 7,0 %"

### Requirement: Gráfico de adónde va la plata de cada serie
El Resumen SHALL mostrar un gráfico, por serie (viñedo y agrovoltaica), de cómo se reparte lo que paga la serie entre Procomún, NetX, Unidades de Regeneración, Primera pérdida y Notas Verdes (cuando la serie las tiene), con los valores de partida. El dibujo MUST ser decorativo, usar solo tokens del tema y no depender del color: cada parte lleva su nombre y su porcentaje en texto, y hay una tabla equivalente con montos en USD.

#### Scenario: Tabla equivalente
- **WHEN** una persona con sesión abre "Ver como tabla" del gráfico
- **THEN** ve una tabla con encabezados por serie y por destino, con "USD 306.970" en Procomún del viñedo y "USD 800.000" en NetX de la agrovoltaica

#### Scenario: Serie sin Notas
- **WHEN** una persona con sesión mira el reparto del viñedo
- **THEN** no aparece una parte "Notas Verdes" con 0: la fila dice "no tiene" en la tabla

### Requirement: Rangos de riesgo
El Resumen SHALL mostrar, por serie, el rango de la TIR de las Unidades en 2.000 futuros posibles (P10, P50 y P90) y la probabilidad de perder plata, con el texto de que son futuros simulados, no un pronóstico.

#### Scenario: Rango del viñedo
- **WHEN** una persona con sesión mira los rangos
- **THEN** ve para el viñedo "−2,6 % · 8,4 % · 10,8 %" y "22 % de los futuros pierden plata", y para la agrovoltaica "1,2 % · 8,5 % · 14,0 %" y "10 %"

### Requirement: Lo que tiene que ser cierto, con sus palancas
El Resumen SHALL mostrar, en "Lo que tiene que ser cierto", los cuatro números incómodos del modelo sin esconder ninguno: (1) el consumo del equipo y el capital bajo gestión que hace falta para cubrirlo solo con comisiones de gestión, y que hasta llegar ahí el puente es el SAFE, los contratos de diseño y las comisiones de desarrollo; (2) cuánto del consumo cubren las membresías en cada escenario; (3) en qué parte de los futuros la primera pérdida no se recupera completa; (4) que el contrato de diseño con BioPueblo no tiene dato. Junto a cada uno SHALL mostrar **la palanca que lo movería**: qué supuesto o parámetro del diseño habría que cambiar y en qué dirección, como texto informativo. Las palancas MUST NOT traer números nuevos ni presentarse como decisiones tomadas.

#### Scenario: Pista
- **WHEN** una persona con sesión mira "Lo que tiene que ser cierto"
- **THEN** ve "USD 31.000 por mes (USD 372.000 por año)", "USD 24,8 M bajo gestión al 1,5 %" y "USD 37,2 M al 1 %", que hasta llegar ahí el puente es el SAFE, los contratos de diseño y las comisiones de desarrollo, que las membresías cubren "1,7 % · 4,3 % · 10,2 %" del consumo al mes 36, que la primera pérdida no se recupera completa en "60 %" (viñedo) y "61 %" (agrovoltaica) de los futuros, y el contrato con BioPueblo "sin dato (a cotizar)"

#### Scenario: Palancas
- **WHEN** una persona con sesión lee la palanca de cada número incómodo
- **THEN** ve cuatro palancas con el rótulo "Palanca", cada una dice qué supuesto cambiar y en qué dirección (por ejemplo, para el capital bajo gestión: bajar el consumo del equipo o sumar ingresos por trabajo que no dependan de la comisión de gestión) y la marca "para discutir, no es una decisión"
- **AND** el texto de las palancas no tiene cifras

### Requirement: Supuestos marcados
Todo número del Resumen que dependa de un supuesto sin confirmar SHALL llevar la marca en texto: "a confirmar con Vagner" para los supuestos del modelo de series y el consumo, y "supone el Congreso de febrero 2027, cancelado: falta re-correr el modelo" para las membresías y el Pase Fundador. Los textos con peso legal SHALL llevar ⚖ y "a verificar con abogado".

#### Scenario: Marca del Congreso
- **WHEN** una persona con sesión mira las membresías o el Pase Fundador
- **THEN** ve la marca de que el modelo supone el Congreso cancelado y falta re-correrlo

### Requirement: Vender lotes en tres líneas
El Resumen SHALL mostrar el bloque "¿Y vender lotes?" con tres razones: no se puede antes de la aprobación municipal (Ordenanza 173, con ⚖), no hace falta (la plata entra por series y por el trabajo de NetX), y en el Juego B la tierra queda en una Fundación. El bloque MUST NOT usar "reservá", "prioridad" ni ofrecer lotes.

#### Scenario: Ordenanza 173
- **WHEN** una persona con sesión abre el ⚖ de la Ordenanza 173
- **THEN** lee en palabras simples que antes de la aprobación no se puede ofrecer, reservar ni dar prioridad sobre lotes

### Requirement: El dato que falta no es cero
Todo número de la Vista NetX que no tenga dato SHALL mostrarse como "sin dato", nunca como 0, "NaN" ni "∞".

#### Scenario: Contrato de diseño
- **WHEN** una persona con sesión mira el contrato de diseño con BioPueblo
- **THEN** lee "sin dato (a cotizar)", no "USD 0"

### Requirement: Accesibilidad del Resumen
El Resumen SHALL pasar la auditoría de axe sin violaciones serias ni críticas, usarse completo con teclado, no desbordar a 390 px y tener un único `<main>` (el del layout).

#### Scenario: 390 px
- **WHEN** una persona con sesión abre `/netx` con 390 px de ancho
- **THEN** el ancho del documento no pasa de 390 px y el gráfico y su tabla se leen sin cortar texto
