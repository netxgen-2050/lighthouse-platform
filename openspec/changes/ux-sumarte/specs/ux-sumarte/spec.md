# Spec Delta

## Purpose

Sumarte entra en el celular: primero la pregunta de cada público, después un plan a la vez, y la comparación sin tablas cortadas (dirección B, Gus, 25-nov-2026).

## ADDED Requirements

### Requirement: Caminos por público en Sumarte
Sumarte SHALL abrir con tres caminos (vivir, invertir, cuidar el bien común) que llevan a la parte de la página que corresponde a cada uno.

#### Scenario: Quiero vivir
- **WHEN** una persona toca el camino de vivir
- **THEN** llega a "Comprar un lote"

### Requirement: Selector de planes
Los planes SHALL elegirse con un selector de cuatro opciones operable con el teclado que muestra un plan por vez con su precio, para quién es, lo que incluye y su acción. El plan elegido MUST reflejarse en la URL. Las acciones de cada plan MUST funcionar igual que antes.

#### Scenario: Elegir Fundador
- **WHEN** una persona elige Fundador
- **THEN** ve el Pase Fundador con sus niveles y la URL incluye `plan=fundador`

### Requirement: Comparación legible en el celular
A 390 px, la comparación de planes SHALL mostrarse como una lista dentro del plan elegido, con texto y no solo símbolos, y la página MUST NOT tener scroll horizontal.

#### Scenario: Celular
- **WHEN** una persona abre `/sumarte` a 390 px
- **THEN** no ve una tabla cortada y lee qué incluye su plan en una lista

### Requirement: Panel de prueba aparte
El panel "Entrar como…" del modo de prueba SHALL mostrarse solo con el modo de prueba activo, plegado al final de la página y fuera del contenido principal.

#### Scenario: Modo de prueba activo
- **WHEN** una persona abre `/sumarte` con el modo de prueba activo
- **THEN** ve "Modo de prueba" plegado al final y, al abrirlo, el panel "Entrar como…"
