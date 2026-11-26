# Spec Delta

## Purpose

Mi tierra se lee como una billetera de tierra: un número que manda, tus posiciones y tu actividad, sin prometer rendimientos (dirección C, Gus, 25-nov-2026).

## ADDED Requirements

### Requirement: Número principal de Mi tierra
Con al menos una compra, Mi tierra SHALL abrir con lo pagado de sus lotes como número principal, junto a una barra de avance con su porcentaje en texto y la cuota actual. Mi tierra MUST NOT mostrar rendimientos, APY ni ganancias.

#### Scenario: Persona con un lote en cuotas
- **WHEN** una persona con un lote reservado y cuotas pagadas abre `/mi-tierra`
- **THEN** ve lo pagado como número principal, el porcentaje del total en texto y "cuota N de M"

#### Scenario: Sin rendimientos
- **WHEN** se renderiza Mi tierra en español o en inglés
- **THEN** no aparece ninguna cifra de rendimiento, APY ni ganancia

### Requirement: Posiciones
Mi tierra SHALL listar las posiciones de la persona (cada lote, FARO y su voz) en filas con nombre, detalle y valor. Un valor que falta MUST mostrarse como "sin dato".

#### Scenario: FARO sin primer pago
- **WHEN** una persona reservó un lote pero todavía no pagó
- **THEN** la fila de FARO muestra "sin dato" con la explicación

### Requirement: Actividad resumida
La actividad SHALL mostrar los últimos ocho movimientos y permitir desplegar el resto y filtrarlos por tipo. En el celular MUST NOT necesitar scroll horizontal.

#### Scenario: Ver todo
- **WHEN** una persona con más de ocho movimientos toca "Ver toda la actividad"
- **THEN** ve todos los movimientos y puede filtrarlos por pago, reserva o FARO

### Requirement: Estado vacío con próximo paso
Sin compras, Mi tierra SHALL mostrar un estado vacío con un dibujo, una acción principal a la lista de lotes y una vista previa marcada como ejemplo de cómo se verá con un lote.

#### Scenario: Persona sin lote
- **WHEN** una persona sin compras abre `/mi-tierra`
- **THEN** ve "Todavía no reservaste un lote", la acción "Explorar los lotes" y una vista previa con la etiqueta "Así se va a ver"
