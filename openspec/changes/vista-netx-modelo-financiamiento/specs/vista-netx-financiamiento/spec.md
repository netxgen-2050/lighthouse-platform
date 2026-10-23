# Spec Delta

## MODIFIED Requirements

### Requirement: Pestañas de la Vista NetX
La Vista NetX SHALL mostrar, arriba del contenido de cada pestaña, una navegación con nombre "Secciones de la Vista NetX" con los enlaces "Resumen" (`/netx`), "Modelo de financiamiento" (`/netx/financiamiento`), "Simulador" (`/netx/simulador`) y "Comunidad y embudo" (`/netx/comunidad`), en ese orden. El enlace de la pestaña abierta MUST estar marcado como página actual (no solo con color). La navegación MUST usarse con teclado y no desbordar a 390 px.

#### Scenario: Pestaña actual
- **WHEN** el super admin abre `/netx/financiamiento`
- **THEN** ve las cuatro pestañas en ese orden y "Modelo de financiamiento" está marcada como página actual

#### Scenario: Con teclado
- **WHEN** el super admin llega con Tab a "Simulador" y aprieta Enter
- **THEN** se abre `/netx/simulador` y esa pestaña queda marcada como página actual

## ADDED Requirements

### Requirement: Encabezado del modelo
La pestaña "Modelo de financiamiento" SHALL tener un único h1 "Modelo de financiamiento", el aviso de valores de partida del catálogo legal antes de cualquier número y, al pie, las fuentes con su versión. El Resumen SHALL enlazarla con "Ver el modelo completo".

#### Scenario: Desde el Resumen
- **WHEN** el super admin aprieta "Ver el modelo completo" en `/netx`
- **THEN** se abre `/netx/financiamiento` con el h1 "Modelo de financiamiento" y el aviso arriba de los números

### Requirement: La plata entra por etapas
La pestaña SHALL mostrar las tres etapas de la plata de NetX (Semilla: ahora a marzo 2027; Construir: 2027–2028; Escalar: 2028 en adelante), cada una con qué entra, de qué tamaño y de qué depende, como lista o tabla con encabezados. Lo que no tiene tamaño MUST decir "sin dato".

#### Scenario: Etapa Semilla
- **WHEN** el super admin mira la etapa Semilla
- **THEN** ve el SAFE de la empresa "USD 375.000 a 500.000 (meta)", el Círculo Fundador, el contrato de diseño con BioPueblo "sin dato (a cotizar)" y los subsidios "chicos e inciertos"

#### Scenario: Etapa Construir
- **WHEN** el super admin mira la etapa Construir
- **THEN** ve la comisión de desarrollo "3 a 5 % del capex, una vez" y la comisión de gestión "USD 8.550 por año (viñedo) · USD 40.000 por año (agrovoltaica)"

### Requirement: Quién es quién con la plata
La pestaña SHALL mostrar una tabla con NetX, la Fundación, las series y BioPueblo: qué es cada uno, qué plata tiene y si NetX puede tomar de ahí, con la respuesta en texto (no solo con un ícono).

#### Scenario: Fundación
- **WHEN** el super admin lee la fila de la Fundación
- **THEN** lee que NetX nunca toma un porcentaje, solo una tarifa fija y pública si la Fundación contrata la plataforma

### Requirement: Cómo paga una serie
La pestaña SHALL mostrar, como lista numerada, el orden en que cobra cada uno dentro de una serie, y la lista de series posibles indicando cuáles tienen modelo y cuáles no.

#### Scenario: Orden
- **WHEN** el super admin lee la cascada
- **THEN** ve, en orden: costos de operación, Fundación (canon y regalía), comisión de NetX, Notas Verdes, Unidades hasta el tope, primera pérdida y excedente "80 % procomún · 20 % Unidades"

#### Scenario: Serie sin modelo
- **WHEN** el super admin mira el centro de materia orgánica y biochar
- **THEN** lee "sin modelo todavía" y ningún número

### Requirement: Dinero temprano
La pestaña SHALL mostrar cómo se puede poner plata hoy antes de que existan las series: la escalera del SAFU a la Serie Madre, la tabla de instrumentos (quién emite, para quién, qué recibe y su forma legal marcada "a verificar con abogado") y la conversión de USD 1.000 en SAFU con el descuento de partida.

#### Scenario: SAFU
- **WHEN** el super admin mira el dinero temprano
- **THEN** ve "USD 1.000 en SAFU se convierten en USD 1.250 de Unidades de la Serie Madre (descuento 20 %)"

### Requirement: Recorridos de inversores
La pestaña SHALL mostrar dos recorridos: "Invierto hoy y en 10 años vivo acá" (valor a 10 años de USD 10.000 en la Serie Madre a 3, 6 y 9 % anual, la entrada a la vivienda como "sin dato" y que no hay prioridad ni reserva antes de la aprobación municipal) y "USD 1.000 en el vino" (lo que recibe cada año, el total, la TIR y el camino del vino en botellas).

#### Scenario: Vivir acá
- **WHEN** el super admin mira el recorrido A
- **THEN** ve "USD 13.439 · 17.908 · 23.674" y "Entrada a la vivienda: sin dato"

#### Scenario: Vino
- **WHEN** el super admin mira el recorrido B
- **THEN** ve "USD 2.663 en 15 años (TIR 9,2 %)" y "unas 302 botellas más USD 850 el año 15"

### Requirement: Riesgo completo
La pestaña SHALL mostrar, por serie, la tabla completa del Monte Carlo (P10, P50 y P90 de la TIR de las Unidades, de lo que recibe la Fundación y del múltiplo de la primera pérdida, y las tres probabilidades), los supuestos de incertidumbre y los tres hallazgos que cambian el diseño, incluido que la primera pérdida no se recupera completa en alrededor del 60 % de los futuros.

#### Scenario: Primera pérdida
- **WHEN** el super admin lee el riesgo de la agrovoltaica
- **THEN** ve "61 % de los futuros: la primera pérdida no se recupera completa" y el hallazgo de que su lugar en la cascada tiene que cambiar

### Requirement: Gráfico de rangos
La pestaña SHALL mostrar un gráfico de la TIR de las Unidades por serie con el rango P10–P90 y la marca de P50, decorativo, con tokens del tema, con los valores en texto junto a cada serie y una tabla equivalente.

#### Scenario: Tabla del gráfico
- **WHEN** el super admin abre "Ver como tabla" del gráfico de rangos
- **THEN** ve una fila por serie con P10, P50 y P90 ("1,2 %", "8,5 %", "14,0 %" en la agrovoltaica)

### Requirement: Vender lotes o este modelo
La pestaña SHALL mostrar una tabla comparativa con filas Ley, Diseño B, Tierra y agua, Comisión y Quién vende, y columnas "Vender lotes ahora" y "Lo que proponemos", con la Ordenanza 173 ⚖ y la propuesta para quien quiere vender. MUST NOT invitar a reservar ni ofrecer lotes ni prioridad.

#### Scenario: Comisión
- **WHEN** el super admin lee la fila Comisión
- **THEN** lee que NetX no puede cobrar comisión por vender lotes sin matrícula de corredor y que cobra por diseño y regeneración

### Requirement: Supuestos a confirmar
La pestaña SHALL listar todos los supuestos sin confirmar que usa la Vista NetX, agrupados por quién los confirma, con su valor de partida o "sin dato".

#### Scenario: Vagner
- **WHEN** el super admin mira el grupo "A confirmar con Vagner"
- **THEN** ve el consumo "USD 31.000 por mes", la comisión de gestión "1 a 1,5 % anual", el múltiplo de salida "6 veces (viñedo) · 3 veces (agrovoltaica)" y el retorno de la Serie Madre "3 · 6 · 9 %"

#### Scenario: Vivienda
- **WHEN** el super admin mira el grupo de Martín y Franz
- **THEN** ve "Entrada y canon anual de la vivienda: sin dato (después de la aprobación)"

### Requirement: Accesibilidad del modelo
La pestaña SHALL pasar la auditoría de axe sin violaciones serias ni críticas, usarse completa con teclado, no desbordar a 390 px (las tablas anchas con desplazamiento propio) y tener títulos h2 por sección.

#### Scenario: 390 px
- **WHEN** el super admin abre `/netx/financiamiento` con 390 px de ancho
- **THEN** el ancho del documento no pasa de 390 px
