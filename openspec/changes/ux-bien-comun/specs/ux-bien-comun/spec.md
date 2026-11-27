# Spec Delta

## Purpose

Bien común se puede recorrer: un índice para saltar, lo principal a la vista y lo largo plegado, sin cajas dentro de cajas (dirección B, Gus, 25-nov-2026).

## ADDED Requirements

### Requirement: Índice de la página
La página Bien común SHALL ofrecer un índice de sus secciones que marque la sección visible con `aria-current="location"` y no solo con color: fijo al costado en compu y en una hoja "En esta página" en el celular.

#### Scenario: Compu
- **WHEN** una persona hace scroll hasta "Las tres puertas" a 1440 px
- **THEN** el índice sigue visible y marca "Las tres puertas"

#### Scenario: Celular
- **WHEN** una persona toca "En esta página" a 390 px y elige "Preguntas para el abogado"
- **THEN** la hoja se cierra, la sección se despliega y queda a la vista

### Requirement: Contenido largo plegado
Las secciones largas (política de FARO, lo que hay que decidir, qué cambió, Ostrom, parcelas comunes, NFT del lote y preguntas para el abogado) SHALL mostrarse plegadas con un resumen de una línea, y las secciones centrales MUST quedar abiertas.

#### Scenario: Primera vista
- **WHEN** una persona abre `/bien-comun`
- **THEN** ve abiertas la frase, los carriles y puentes y las tres puertas, y plegadas las secciones largas con su resumen

### Requirement: Una sola capa de cajas
Ninguna caja con borde de la página Bien común SHALL contener otra caja con borde. El texto corrido MUST medir al menos 16 px.

#### Scenario: Carriles
- **WHEN** una persona mira "Dos carriles y tres puentes"
- **THEN** cada carril es una caja y lo que tiene adentro no lleva otra caja con borde

### Requirement: Sin scroll horizontal en el celular
A 390 px la página SHALL NOT tener scroll horizontal; las tablas MUST pasar a filas de dos líneas.

#### Scenario: Tabla de decisiones
- **WHEN** una persona abre "Lo que hay que decidir" a 390 px
- **THEN** cada decisión se lee en dos líneas con su estado, sin mover la pantalla de costado
