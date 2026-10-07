# Spec Delta

## Purpose

Mostrar, para la persona de ejemplo elegida, lo que declaró ante el fiduciario y qué caminos tiene abiertos para sumarse al Lighthouse, con el motivo de cada restricción.

## ADDED Requirements

### Requirement: Lo que declaraste
La página `/pasaporte` SHALL mostrar, para la persona elegida en el selector global, identidad, nacionalidad, residencia fiscal, origen de fondos, tipo de inversor y presencia, tomados de `lib/personas/`. La identidad MUST llevar la marca de dato de ejemplo.

#### Scenario: Lucía
- **WHEN** la persona elegida es Lucía y se abre `/pasaporte`
- **THEN** se ve "Noruega" como residencia fiscal, "Transferencia desde un banco de Noruega" como origen de fondos y "No calificado" como tipo de inversor

#### Scenario: Lucas
- **WHEN** la persona elegida es Lucas y se abre `/pasaporte`
- **THEN** se ve "Argentina (Neuquén)" como residencia fiscal y "Full-time desde marzo" como presencia

### Requirement: Caminos con estado en texto
La sección "Tus caminos" SHALL listar cinco caminos (membresía y pase de estadías; tribus, salas y pactos de tiempo; sumarte al proyecto; tu chacra a futuro; horas de obra o aporte remoto) y cada uno MUST mostrar su estado en texto: "Abierto", "Por ahora, no" o "Con condiciones". El estado MUST NOT comunicarse solo con color o ícono.

#### Scenario: Cinco caminos
- **WHEN** se abre `/pasaporte`
- **THEN** hay exactamente 5 caminos y cada uno tiene uno de los tres textos de estado

### Requirement: Sumarte al proyecto según residencia fiscal
El camino "Sumarte al proyecto" SHALL figurar "Abierto" por invitación cuando `elegibleFideicomiso` es verdadero, indicando los lugares para no calificados que quedan según `EMISION` de `lib/sumarte/datos.ts`. Si es falso, SHALL figurar "Por ahora, no" con el motivo de residencia fiscal del mock-up.

#### Scenario: Lucas por invitación
- **WHEN** la persona elegida es Lucas
- **THEN** "Sumarte al proyecto" figura "Abierto" y dice que ocupa uno de los 15 lugares para inversores no calificados y que quedan 4

#### Scenario: Lucía no por ahora
- **WHEN** la persona elegida es Lucía
- **THEN** "Sumarte al proyecto" figura "Por ahora, no" y menciona que su residencia fiscal es del exterior

### Requirement: Chacra y modalidad de aporte
"Tu chacra a futuro" SHALL figurar "Abierto" (sin restricciones por nacionalidad) para nacionalidad argentina y "Con condiciones" (tierra rural ribereña) para nacionalidad extranjera. El quinto camino SHALL ser "Horas de obra" con las horas por mes de la persona si su modalidad es obra, o "Aporte remoto" si es remoto; ambos "Con condiciones".

#### Scenario: Lucía extranjera y remota
- **WHEN** la persona elegida es Lucía
- **THEN** "Tu chacra a futuro" figura "Con condiciones" y aparece "Aporte remoto"

#### Scenario: Lucas argentino y en obra
- **WHEN** la persona elegida es Lucas
- **THEN** "Tu chacra a futuro" figura "Abierto" y aparece "Horas de obra" con "60 h/mes"

### Requirement: Cambio de persona en vivo
La página SHALL actualizarse al cambiar la persona en el selector global, sin recargar.

#### Scenario: De Lucía a Lucas
- **WHEN** en `/pasaporte` la persona pasa de "Lucía (NO)" a "Lucas (AR)"
- **THEN** "Sumarte al proyecto" pasa de "Por ahora, no" a "Abierto"

### Requirement: Términos legales
Residencia fiscal, tipo de inversor, membresía, pase de estadías, sumarte al proyecto, círculo por invitación, chacra, tierra ribereña, horas de obra y aporte remoto SHALL llevar su ⚖ con el texto del catálogo `lib/legal/terminos.ts`. Las claves nuevas (`pasaporte`, `calificado`, `pase`, `chacra`, `ribera`, `remoto`) MUST copiarse textualmente del objeto `LEGAL` del mock-up v6.

#### Scenario: ⚖ de tierra ribereña
- **WHEN** con Lucía elegida se activa con teclado el ⚖ de "Tu chacra a futuro" sobre tierra ribereña
- **THEN** se ve el título "Tierra ribereña" y el texto que menciona la Ley 26.737

### Requirement: Navegación
El rail SHALL incluir el destino "Pasaporte" → `/pasaporte`.

#### Scenario: Desde el rail
- **WHEN** una persona activa "Pasaporte" en el rail
- **THEN** llega a `/pasaporte` y el destino figura como página actual

### Requirement: Accesibilidad y estilo
`/pasaporte` SHALL ser usable solo con teclado, pasar axe sin violaciones `serious` ni `critical`, no agregar un `<main>` propio, usar solo tokens del tema y mostrar el aviso "Prototipo interno · datos de ejemplo".

#### Scenario: Auditoría
- **WHEN** se corre axe sobre `/pasaporte` con Lucía y con Lucas
- **THEN** no hay violaciones `serious` ni `critical`
