# Spec Delta

## Purpose

Invertir muestra cada barrio en financiamiento como un pool: un número que manda, un solo aviso legal y el detalle en pestañas, sin prometer rendimientos (dirección C, Gus, 25-nov-2026).

## ADDED Requirements

### Requirement: Encabezado del barrio
Con sesión, cada barrio en financiamiento SHALL abrir con su meta de obra como número principal y una fila con lo juntado, el mes en que se terminaría de devolver y la parte que va al común. Un dato que falta MUST decir "sin dato". La página MUST NOT mostrar rendimientos anuales.

#### Scenario: Barrio Norte
- **WHEN** una persona con sesión abre `/invertir`
- **THEN** ve la meta de Barrio Norte como número principal y "sin dato" en lo juntado

### Requirement: Un solo aviso legal
La página SHALL mostrar el estado de la propuesta y que no es una oferta en un único aviso legal con sus ⚖, en lugar de varias etiquetas apiladas.

#### Scenario: Arriba de la página
- **WHEN** una persona abre `/invertir` con sesión
- **THEN** ve un único aviso "Propuesta v0.1 en discusión · no es una oferta" y no tres etiquetas seguidas

### Requirement: Pestañas de detalle
El detalle del barrio SHALL organizarse en pestañas Cómo funciona, Curva y Libro, operables con el teclado, con la pestaña elegida reflejada en la URL.

#### Scenario: Compartir la curva
- **WHEN** una persona abre `/invertir?ver=curva`
- **THEN** ve la pestaña Curva elegida

### Requirement: Libro paginado
El libro del barrio SHALL mostrar ocho movimientos y permitir ver todos y filtrarlos por motivo.

#### Scenario: Ver todo el libro
- **WHEN** una persona toca "Ver todo el libro"
- **THEN** ve todos los movimientos del caso de ejemplo

### Requirement: Invertir sin sesión
Sin sesión, la página SHALL mostrar un estado vacío con una acción para sumarse y MUST NOT incluir ningún monto del barrio en el HTML.

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión abre `/invertir`
- **THEN** ve "Invertir se ve con una cuenta" y la acción "Sumate para ver el barrio", sin montos
