# Spec Delta

## Purpose

Que todo el prototipo se pueda recorrer como Lucía o como Lucas, las dos personas de ejemplo del mock-up v6, con una sola fuente de datos y un solo selector.

## ADDED Requirements

### Requirement: Fuente única de personas de ejemplo
El sistema SHALL tener en `lib/personas/` exactamente dos personas de ejemplo, `lucia` y `lucas`, con los datos de `PEOPLE` del mock-up v6 copiados sin cambios. Un dato que no esté en el mock-up MUST NOT inventarse.

#### Scenario: Datos de Lucía
- **WHEN** se lee la persona `lucia`
- **THEN** su nombre es "Lucía", su residencia fiscal es "Noruega", no es calificada y no es residente

#### Scenario: Datos de Lucas
- **WHEN** se lee la persona `lucas`
- **THEN** su nombre es "Lucas", su residencia fiscal es "Argentina (Neuquén)", su modalidad es "obra" y es residente

### Requirement: Elegibilidad para el fideicomiso
`elegibleFideicomiso(persona)` SHALL devolver `true` solo si la persona tiene residencia fiscal argentina, como `eligibleFid` del mock-up.

#### Scenario: Lucía no es elegible
- **WHEN** se evalúa a Lucía
- **THEN** devuelve `false`

#### Scenario: Lucas es elegible
- **WHEN** se evalúa a Lucas
- **THEN** devuelve `true`

### Requirement: Selector global de persona
Todas las páginas SHALL mostrar, antes de `<main>`, una franja con el texto "Ves la plataforma como:" y dos botones, "Lucía (NO)" y "Lucas (AR)", con `aria-pressed` en el elegido. La persona elegida MUST indicarse también con texto o forma, no solo con color.

#### Scenario: Por defecto Lucía
- **WHEN** una persona abre cualquier página por primera vez
- **THEN** el botón "Lucía (NO)" tiene `aria-pressed="true"` y "Lucas (AR)" tiene `aria-pressed="false"`

#### Scenario: Un solo main
- **WHEN** se abre cualquier página
- **THEN** sigue habiendo exactamente un `<main>` y la franja está fuera de él

### Requirement: La elección se recuerda y se comparte
Al elegir una persona, el sistema SHALL guardarla en el navegador con la clave `CLAVES.persona` y actualizar al instante todo componente que use `usePersona()`, sin recargar. Un valor guardado inválido MUST tratarse como Lucía.

#### Scenario: Cambio y navegación
- **WHEN** la persona elige "Lucas (AR)" y navega a otra página
- **THEN** "Lucas (AR)" sigue con `aria-pressed="true"`

#### Scenario: Recarga
- **WHEN** la persona eligió Lucas y recarga la página
- **THEN** la plataforma sigue mostrando a Lucas

#### Scenario: Valor corrupto
- **WHEN** el valor guardado es `"franz"`
- **THEN** la plataforma muestra a Lucía

### Requirement: Anuncio del cambio
Al cambiar de persona, el sistema SHALL anunciar "Ahora ves la plataforma como <nombre>" en una región `aria-live="polite"`.

#### Scenario: Anuncio
- **WHEN** la persona elige "Lucas (AR)"
- **THEN** aparece el texto "Ahora ves la plataforma como Lucas"

### Requirement: Borrar datos de prueba
"Borrar todo lo de este navegador" en `/panel` SHALL quitar también la persona elegida, y el selector MUST volver a Lucía sin recargar.

#### Scenario: Borrar
- **WHEN** la persona eligió Lucas, va a `/panel`, usa "Borrar todo lo de este navegador" y confirma
- **THEN** el botón "Lucía (NO)" queda con `aria-pressed="true"`

### Requirement: Accesibilidad y estilo
El selector SHALL ser usable solo con teclado, usar solo tokens del tema y no introducir violaciones `serious` ni `critical` de axe en ninguna página auditada.

#### Scenario: Auditoría
- **WHEN** se corre `e2e/accesibilidad.spec.ts`
- **THEN** no hay violaciones `serious` ni `critical`
