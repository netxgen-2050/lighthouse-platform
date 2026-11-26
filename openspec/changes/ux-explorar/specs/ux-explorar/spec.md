# Spec Delta

## Purpose

Explorar muestra los lotes sobre el mapa y en una lista que se usan juntas, como en las apps de alquiler de referencia, sin repetir información ni esconder el estado administrativo (dirección B, Gus, 25-nov-2026).

## ADDED Requirements

### Requirement: Lista y mapa de lotes
La página `/explorar/lotes` SHALL mostrar los lotes en una lista de tarjetas y en un mapa a la vez: en compu en dos columnas con el mapa fijo, y en el celular con el mapa a pantalla completa y la lista en una hoja que se despliega. Elegir un lote en la lista MUST resaltarlo en el mapa, y elegirlo en el mapa MUST resaltar su tarjeta.

#### Scenario: Compu
- **WHEN** una persona abre `/explorar/lotes` a 1440 px y hace scroll en la lista
- **THEN** el mapa queda fijo a la derecha mientras la lista se mueve

#### Scenario: Elegir desde la lista
- **WHEN** una persona pasa el foco a la tarjeta del Lote 535
- **THEN** el Lote 535 se resalta en el mapa

#### Scenario: Celular
- **WHEN** una persona abre `/explorar/lotes` a 390 px y toca "Ver lista"
- **THEN** la hoja sube con las tarjetas de los lotes

### Requirement: Tarjeta de lote
Cada lote SHALL mostrarse en una tarjeta con su plano, su número, su superficie, su estado en texto y, si el modelo lo tiene, su precio marcado como ejemplo. La tarjeta MUST ser un solo enlace a la ficha del lote. El estado MUST NOT comunicarse solo con color.

#### Scenario: Lote reservado
- **WHEN** una persona ve la tarjeta de un lote reservado
- **THEN** la tarjeta dice "Reservado" en texto y el lote en el mapa lleva un patrón distinto al de los disponibles

### Requirement: Filtro de lotes
La lista SHALL poder filtrarse por estado y ordenarse por número o superficie. El filtro y el orden MUST reflejarse en la URL y conservar los parámetros del mapa.

#### Scenario: Filtrar disponibles
- **WHEN** una persona elige solo Disponible
- **THEN** la lista y el mapa resaltan solo los lotes disponibles y la URL incluye `estado=disponible`

### Requirement: Sin lista de lotes repetida
Ninguna página de Explorar SHALL mostrar la lista completa de lotes dos veces. La página de Territorio MUST enlazar a la lista de lotes en lugar de repetirla.

#### Scenario: Territorio
- **WHEN** una persona abre `/explorar/territorio`
- **THEN** ve el mapa y un enlace "Ver los N lotes", y no una lista de todos los lotes

### Requirement: Estado administrativo antes del mapa
Toda página de Explorar con lotes y toda ficha de lote SHALL mostrar el estado administrativo de sus proyectos con el texto completo, antes del mapa y de la lista en el orden de lectura.

#### Scenario: Lotes en el celular
- **WHEN** un lector de pantalla recorre `/explorar/lotes` a 390 px
- **THEN** anuncia el bloque de estado administrativo antes del mapa y de las tarjetas

### Requirement: Ficha del lote clara
La ficha de un lote SHALL mostrar arriba el plano del lote y una fila con superficie, estado y precio de ejemplo (o "sin dato"), y en el celular MUST dejar la acción principal fija abajo.

#### Scenario: Ficha en el celular
- **WHEN** una persona abre la ficha de un lote a 390 px y hace scroll
- **THEN** la acción principal sigue visible abajo, encima de la barra inferior
