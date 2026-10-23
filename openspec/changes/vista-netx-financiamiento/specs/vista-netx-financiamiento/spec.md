# Spec Delta

## Purpose

Que la Vista NetX cuente, en una reunión con Franz y Vagner, cómo se financia NetX sin vender lotes: un relato en pestañas con números de partida, rangos de riesgo y supuestos a la vista, más las herramientas del equipo (simulador, comunidad y embudo) en el mismo lugar.

## ADDED Requirements

### Requirement: Pestañas de la Vista NetX
La Vista NetX SHALL mostrar, arriba del contenido de cada pestaña, una navegación con nombre "Secciones de la Vista NetX" con los enlaces "Resumen" (`/netx`), "Simulador" (`/netx/simulador`) y "Comunidad y embudo" (`/netx/comunidad`), en ese orden. El enlace de la pestaña abierta MUST estar marcado como página actual (no solo con color). La navegación MUST usarse con teclado y no desbordar a 390 px.

#### Scenario: Pestaña actual
- **WHEN** el super admin abre `/netx/comunidad`
- **THEN** ve las tres pestañas y "Comunidad y embudo" está marcada como página actual; "Resumen" no lo está

#### Scenario: Con teclado
- **WHEN** el super admin llega con Tab a "Simulador" y aprieta Enter
- **THEN** se abre `/netx/simulador` y esa pestaña queda marcada como página actual

### Requirement: Solo super admin en todas las pestañas
Cada pestaña de la Vista NetX SHALL mostrarse solo al super admin; a cualquier otra persona le MUST mostrar "No tenés acceso a esta vista", sin mostrar números ni pestañas.

#### Scenario: Persona sin permiso
- **WHEN** una persona con rol "persona" abre `/netx/simulador`
- **THEN** ve "No tenés acceso a esta vista" y no ve el simulador

### Requirement: Un título por pestaña, sin el hito del Congreso
Cada pestaña SHALL tener un único título de nivel 1 propio y el aviso "Prototipo interno · datos de ejemplo". Ninguna pestaña MUST usar el Congreso ni "febrero" como hito de venta: el texto "¿Vamos a vender en febrero?" desaparece.

#### Scenario: Títulos
- **WHEN** el super admin recorre las tres pestañas
- **THEN** ve un solo h1 en cada una: "¿Cómo se financia NetX sin vender lotes?", "Simulador de la tokenomics (diseño B)" y "Comunidad y embudo"
- **AND** en ninguna aparece "¿Vamos a vender en febrero?"

### Requirement: Comunidad y embudo conserva lo actual
La pestaña "Comunidad y embudo" SHALL mostrar los indicadores, el embudo con conversión, el cumplimiento con sus medidores y alertas, la tabla "Tribus por proyecto", el panel de personas, las postulaciones de comunidades y la bandeja de pedidos, con el mismo comportamiento que hoy tienen en `/netx`.

#### Scenario: Embudo en su pestaña
- **WHEN** el super admin abre `/netx/comunidad`
- **THEN** ve el embudo con "186" en "En una tribu" y "45% de la etapa anterior", y la bandeja de pedidos

### Requirement: Simulador como pestaña
El simulador de la tokenomics SHALL vivir en `/netx/simulador` con el encabezado de la Vista NetX y el mismo comportamiento que tenía en el Fogón. `/fogon/simulador` MUST llevar a `/netx/simulador`, y el Fogón MUST dejar de enlazarlo.

#### Scenario: Dirección vieja
- **WHEN** el super admin abre `/fogon/simulador`
- **THEN** termina en `/netx/simulador` y ve el resultado de partida del viñedo ("USD 306.970" para el procomún)

#### Scenario: Fogón sin simulador
- **WHEN** una persona abre `/fogon`
- **THEN** no ve ningún enlace al simulador

### Requirement: Resumen en una frase
La pestaña Resumen SHALL abrir con el h1 "¿Cómo se financia NetX sin vender lotes?" y una respuesta corta: NetX es la empresa que diseña, gestiona y opera la plataforma; cobra por su trabajo, no por vender tierra; la tierra es de la Fundación y la plata de los proyectos entra por series.

#### Scenario: Respuesta corta
- **WHEN** el super admin abre `/netx`
- **THEN** lee, debajo del título, que NetX cobra por su trabajo y no por vender tierra

### Requirement: Avisos de valores de partida
La pestaña Resumen SHALL mostrar, antes de cualquier número, el aviso del simulador del catálogo legal ("valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado") y la fuente y versión de los modelos que usa.

#### Scenario: Avisos y fuente
- **WHEN** el super admin abre `/netx`
- **THEN** ve el aviso de valores de partida arriba de los números y, al pie, las fuentes con su versión (por ejemplo "series_waterfall_sim.py v0.1, 17-oct-2026")

### Requirement: Tres bolsillos
El Resumen SHALL mostrar tres bloques que no se mezclan, cada uno con qué recibe, de dónde y en qué plazo: "NetX · la empresa", "Procomún · Fundación" e "Inversores de las series". El Pase Fundador MUST aparecer en el procomún con el texto de que no es plata de NetX.

#### Scenario: NetX
- **WHEN** el super admin mira el bloque de NetX
- **THEN** ve el SAFE de la empresa "USD 375.000 a 500.000 (meta)", la comisión de gestión "USD 8.550 por año" en el viñedo y "USD 40.000 por año" en la agrovoltaica, la comisión de desarrollo "3 a 5 % del capex, una vez" con el ejemplo de la agrovoltaica "USD 120.000 a 200.000", las membresías y el Plan Tribu "USD 1.336 por mes al mes 36 (escenario base)", y el contrato de diseño con BioPueblo "sin dato (a cotizar)"

#### Scenario: Procomún
- **WHEN** el super admin mira el bloque del procomún
- **THEN** ve "USD 306.970 en 15 años" del viñedo, "USD 1.357.031 en 20 años" de la agrovoltaica y el Pase Fundador "USD 49.500 · 96.000 · 171.000 (bajo · base · bueno)" con "va al procomún, no a NetX" y que el escenario bajo no llega al mínimo de USD 75.000

#### Scenario: Inversores
- **WHEN** el super admin mira el bloque de inversores
- **THEN** ve las Unidades de Regeneración del viñedo "2,66x · TIR 9,2 % en 15 años" y de la agrovoltaica "2,84x · TIR 10,3 % en 20 años", y las Notas Verdes "TIR 7,0 %"

### Requirement: Gráfico de adónde va la plata de cada serie
El Resumen SHALL mostrar un gráfico, por serie (viñedo y agrovoltaica), de cómo se reparte lo que paga la serie entre Procomún, NetX, Unidades de Regeneración, Primera pérdida y Notas Verdes (cuando la serie las tiene), con los valores de partida. El dibujo MUST ser decorativo, usar solo tokens del tema y no depender del color: cada parte lleva su nombre y su porcentaje en texto, y hay una tabla equivalente con montos en USD.

#### Scenario: Tabla equivalente
- **WHEN** el super admin abre "Ver como tabla" del gráfico
- **THEN** ve una tabla con encabezados por serie y por destino, con "USD 306.970" en Procomún del viñedo y "USD 800.000" en NetX de la agrovoltaica

#### Scenario: Serie sin Notas
- **WHEN** el super admin mira el reparto del viñedo
- **THEN** no aparece una parte "Notas Verdes" con 0: la fila dice "no tiene" en la tabla

### Requirement: Rangos de riesgo
El Resumen SHALL mostrar, por serie, el rango de la TIR de las Unidades en 2.000 futuros posibles (P10, P50 y P90) y la probabilidad de perder plata, con el texto de que son futuros simulados, no un pronóstico.

#### Scenario: Rango del viñedo
- **WHEN** el super admin mira los rangos
- **THEN** ve para el viñedo "−2,6 % · 8,4 % · 10,8 %" y "22 % de los futuros pierden plata", y para la agrovoltaica "1,2 % · 8,5 % · 14,0 %" y "10 %"

### Requirement: Lo que tiene que ser cierto
El Resumen SHALL mostrar el consumo del equipo, el capital bajo gestión que hace falta para cubrirlo solo con comisiones de gestión y qué cubre el puente mientras tanto, y cuánto del consumo cubren las membresías en cada escenario.

#### Scenario: Pista
- **WHEN** el super admin mira "Lo que tiene que ser cierto"
- **THEN** ve "USD 31.000 por mes (USD 372.000 por año)", "USD 24,8 M bajo gestión al 1,5 %" y "USD 37,2 M al 1 %", que hasta llegar ahí el puente es el SAFE, los contratos de diseño y las comisiones de desarrollo, y que las membresías cubren "1,7 % · 4,3 % · 10,2 %" del consumo al mes 36

### Requirement: Supuestos marcados
Todo número del Resumen que dependa de un supuesto sin confirmar SHALL llevar la marca en texto: "a confirmar con Vagner" para los supuestos del modelo de series y el consumo, y "supone el Congreso de febrero 2027, cancelado: falta re-correr el modelo" para las membresías y el Pase Fundador.

#### Scenario: Marca del Congreso
- **WHEN** el super admin mira las membresías o el Pase Fundador
- **THEN** ve la marca de que el modelo supone el Congreso cancelado y falta re-correrlo

### Requirement: Vender lotes en tres líneas
El Resumen SHALL mostrar el bloque "¿Y vender lotes?" con tres razones: no se puede antes de la aprobación municipal (Ordenanza 173, con ⚖), no hace falta (la plata entra por series y por el trabajo de NetX), y en el diseño B la tierra del Lighthouse es de la Fundación. El bloque MUST NOT usar "reservá", "prioridad" ni ofrecer lotes.

#### Scenario: Ordenanza 173
- **WHEN** el super admin abre el ⚖ de la Ordenanza 173
- **THEN** lee en palabras simples que antes de la aprobación no se puede ofrecer, reservar ni dar prioridad sobre lotes

### Requirement: El dato que falta no es cero
Todo número de la Vista NetX que no tenga dato SHALL mostrarse como "sin dato", nunca como 0, "NaN" ni "∞".

#### Scenario: Contrato de diseño
- **WHEN** el super admin mira el contrato de diseño con BioPueblo
- **THEN** lee "sin dato (a cotizar)", no "USD 0"

### Requirement: Accesibilidad del Resumen
El Resumen SHALL pasar la auditoría de axe sin violaciones serias ni críticas, usarse completo con teclado, no desbordar a 390 px y tener un único `<main>` (el del layout).

#### Scenario: 390 px
- **WHEN** el super admin abre `/netx` con 390 px de ancho
- **THEN** el ancho del documento no pasa de 390 px y el gráfico y su tabla se leen sin cortar texto
