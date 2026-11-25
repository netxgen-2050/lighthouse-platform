# Spec Delta

## Purpose

Que la ficha de cada tribu muestre lo que le falta en plata y en personas, quién la avala, con qué derecho usa su barrio y cómo sumarse, como en `V.tribu` del mock-up v6.

## ADDED Requirements

### Requirement: Plata y roles con el número escrito
La ficha de una tribu activa o en formación SHALL mostrar dos medidores, "Plata comprometida" con "USD <comprometida> de USD <meta> · <porcentaje>%" y "Roles cubiertos" con "<cubiertos> de <necesarios> · <porcentaje>%", con los valores de `cap` y `hum` del mock-up v6 y el mismo formato que los medidores de `/sumarte`. La barra MUST ser decorativa (`aria-hidden`) y el dato MUST estar en el texto.

#### Scenario: Valle Solar
- **WHEN** se abre `/tribus/valle`
- **THEN** el medidor "Plata comprometida" dice "USD 310.000 de USD 480.000 · 65%"
- **AND** el medidor "Roles cubiertos" dice "9 de 14 · 64%"

#### Scenario: Avelan Kerum
- **WHEN** se abre `/tribus/avelan`
- **THEN** el medidor "Plata comprometida" dice "USD 140.000 de USD 650.000 · 22%"

### Requirement: Red de confianza
La ficha de una tribu activa o en formación SHALL mostrar la tarjeta "Red de confianza" con "<N> personas de la red avalan a esta tribu" y la marca de dato de ejemplo. Los avatares MUST ser decorativos.

#### Scenario: Valle Solar avalada
- **WHEN** se abre `/tribus/valle`
- **THEN** se ve "5 personas de la red avalan a esta tribu"

### Requirement: Licencia de uso y adhesión
"Cómo se entra" SHALL decir que la tribu usa su barrio con una licencia de uso ⚖ y que es adherente al proyecto del Lote 7 ⚖. Los textos de `licencia` y `adherente` MUST copiarse textualmente del `LEGAL` del mock-up v6 al catálogo `lib/legal/terminos.ts`.

#### Scenario: ⚖ de licencia con teclado
- **WHEN** en `/tribus/valle` se activa con teclado el ⚖ de "licencia de uso"
- **THEN** se ve el título "Licencia de uso" y el texto que dice que la tribu no compra tierra

### Requirement: Acciones de la ficha
La ficha de una tribu activa o en formación SHALL ofrecer "Ver su barrio en el mapa" (enlace a `/territorios/lighthouse`), "Entrar a la sala" (simulado) y, solo si `/pactos` figura con `existe: true` en `lib/navegacion.ts`, "Proponer mi pacto" (enlace a `/pactos`). "Entrar a la sala" MUST anunciar en una región `aria-live="polite"` que en el producto real se abriría la sala de la tribu en Telegram y que se puede salir cuando se quiera, sin navegar ni guardar nada.

#### Scenario: Sala simulada
- **WHEN** en `/tribus/valle` se activa "Entrar a la sala"
- **THEN** aparece un texto que menciona Telegram y "Podés salir cuando quieras"
- **AND** la URL sigue siendo `/tribus/valle`

#### Scenario: Ver el barrio
- **WHEN** en `/tribus/valle` se activa "Ver su barrio en el mapa"
- **THEN** se llega a `/territorios/lighthouse`

### Requirement: Barrio vacante
La ficha de un barrio vacante SHALL mostrar el texto del mock-up con licencia ⚖ y adhesión ⚖, los medidores "Plata para arrancar" ("USD 0 de USD <meta> · 0%") y "Roles" ("0 de <necesarios> · 0%"), y la tarjeta "¿Tenés una tribu?" con el botón "Proponer mi tribu". El botón MUST anunciar que el formulario es simulado. La ficha vacante MUST NOT mostrar "Red de confianza".

#### Scenario: Barrio 3
- **WHEN** se abre `/tribus/grano`
- **THEN** el medidor "Plata para arrancar" dice "USD 0 de USD 260.000 · 0%"
- **AND** no se ve "Red de confianza"

#### Scenario: Proponer tribu simulado
- **WHEN** en `/tribus/grano` se activa "Proponer mi tribu"
- **THEN** aparece un texto que dice que es simulado

### Requirement: El listado sigue sin montos
El listado `/tribus` SHALL seguir sin mostrar montos en USD ni avales.

#### Scenario: Listado
- **WHEN** se abre `/tribus`
- **THEN** el texto no contiene "USD" ni "avales"

### Requirement: Accesibilidad y estilo
Las 12 fichas SHALL ser usables solo con teclado, pasar axe sin violaciones `serious` ni `critical`, no agregar un `<main>` propio, usar solo tokens del tema y mostrar el aviso "Prototipo interno · datos de ejemplo".

#### Scenario: Auditoría de las fichas
- **WHEN** se corre axe sobre `/tribus/valle` y `/tribus/grano`
- **THEN** no hay violaciones `serious` ni `critical`
