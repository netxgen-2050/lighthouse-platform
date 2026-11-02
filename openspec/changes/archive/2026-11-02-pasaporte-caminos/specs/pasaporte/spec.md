# Spec Delta

## Purpose

Mostrar, a partir de los datos que la persona carga (simulado, en el navegador), lo que declara ante el fiduciario y qué caminos tiene abiertos para sumarse al Lighthouse, con el motivo de cada restricción.

## ADDED Requirements

### Requirement: Tus datos
La página `/pasaporte` SHALL mostrar un formulario "Tus datos" (simulado, guardado solo en el navegador, sin KYC real) con: nacionalidad (Argentina u otra, con el país), residencia fiscal (Argentina o exterior, con el país), origen de fondos (texto), tipo de inversor (calificado o no calificado), modalidad de aporte (obra presencial o remoto) y horas por mes. Hasta que la persona complete los datos necesarios, cada camino que dependa de ellos MUST decir "Completá tus datos" en lugar de un estado inventado. Decisión de Gus (7-oct-2026): no hay personas de ejemplo; los primeros usuarios reales llegan con el login.

#### Scenario: Sin datos
- **WHEN** una persona abre `/pasaporte` por primera vez
- **THEN** ve el formulario vacío y los caminos que dependen de los datos dicen "Completá tus datos"

#### Scenario: Recargar
- **WHEN** la persona completa sus datos y recarga
- **THEN** sus datos siguen ahí y los caminos muestran su estado

### Requirement: Caminos con estado en texto
La sección "Tus caminos" SHALL listar cinco caminos (membresía y pase de estadías; tribus, salas y pactos de tiempo; sumarte al proyecto; tu chacra a futuro; horas de obra o aporte remoto) y cada uno MUST mostrar su estado en texto: "Abierto", "Por ahora, no" o "Con condiciones". El estado MUST NOT comunicarse solo con color o ícono.

#### Scenario: Cinco caminos
- **WHEN** se abre `/pasaporte`
- **THEN** hay exactamente 5 caminos y cada uno tiene uno de los tres textos de estado

### Requirement: Sumarte al proyecto según residencia fiscal
El camino "Sumarte al proyecto" SHALL figurar "Abierto" por invitación cuando la residencia fiscal cargada es Argentina, indicando los lugares para no calificados que quedan según `EMISION` de `lib/sumarte/datos.ts`. Si es falso, SHALL figurar "Por ahora, no" con el motivo de residencia fiscal del mock-up.

#### Scenario: Residente fiscal argentino
- **WHEN** la persona carga nacionalidad argentina, residencia fiscal en Argentina, no calificado y obra presencial 60 h/mes
- **THEN** "Sumarte al proyecto" figura "Abierto" y dice que ocupa uno de los 15 lugares para inversores no calificados y que quedan 4

#### Scenario: Residente fiscal en el exterior
- **WHEN** la persona carga nacionalidad noruega, residencia fiscal en Noruega, no calificado y aporte remoto
- **THEN** "Sumarte al proyecto" figura "Por ahora, no" y menciona que su residencia fiscal es del exterior

### Requirement: Chacra y modalidad de aporte
"Tu chacra a futuro" SHALL figurar "Abierto" (sin restricciones por nacionalidad) para nacionalidad argentina y "Con condiciones" (tierra rural ribereña) para nacionalidad extranjera. El quinto camino SHALL ser "Horas de obra" con las horas por mes de la persona si su modalidad es obra, o "Aporte remoto" si es remoto; ambos "Con condiciones".

#### Scenario: Extranjera y remota
- **WHEN** la persona carga nacionalidad noruega, residencia fiscal en Noruega, no calificado y aporte remoto
- **THEN** "Tu chacra a futuro" figura "Con condiciones" y aparece "Aporte remoto"

#### Scenario: Argentino y en obra
- **WHEN** la persona carga nacionalidad argentina, residencia fiscal en Argentina, no calificado y obra presencial 60 h/mes
- **THEN** "Tu chacra a futuro" figura "Abierto" y aparece "Horas de obra" con "60 h/mes"

### Requirement: Cambio en vivo
La página SHALL recalcular los caminos al cambiar los datos, sin recargar.

#### Scenario: Cambiar la residencia fiscal
- **WHEN** en `/pasaporte` la persona cambia su residencia fiscal de Noruega a Argentina
- **THEN** "Sumarte al proyecto" pasa de "Por ahora, no" a "Abierto"

### Requirement: Términos legales
Residencia fiscal, tipo de inversor, membresía, pase de estadías, sumarte al proyecto, círculo por invitación, chacra, tierra ribereña, horas de obra y aporte remoto SHALL llevar su ⚖ con el texto del catálogo `lib/legal/terminos.ts`. Las claves nuevas (`pasaporte`, `calificado`, `pase`, `chacra`, `ribera`, `remoto`) MUST copiarse textualmente del objeto `LEGAL` del mock-up v6.

#### Scenario: ⚖ de tierra ribereña
- **WHEN** con nacionalidad noruega cargada se activa con teclado el ⚖ de "Tu chacra a futuro" sobre tierra ribereña
- **THEN** se ve el título "Tierra ribereña" y el texto que menciona la Ley 26.737

### Requirement: Navegación
El rail SHALL incluir el destino "Pasaporte" → `/pasaporte`.

#### Scenario: Desde el rail
- **WHEN** una persona activa "Pasaporte" en el rail
- **THEN** llega a `/pasaporte` y el destino figura como página actual

### Requirement: Accesibilidad y estilo
`/pasaporte` SHALL ser usable solo con teclado, pasar axe sin violaciones `serious` ni `critical`, no agregar un `<main>` propio, usar solo tokens del tema y mostrar el aviso "Prototipo interno · datos de ejemplo".

#### Scenario: Auditoría
- **WHEN** se corre axe sobre `/pasaporte` vacío y con datos cargados
- **THEN** no hay violaciones `serious` ni `critical`
