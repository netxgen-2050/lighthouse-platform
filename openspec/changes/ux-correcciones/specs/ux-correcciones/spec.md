# Spec Delta

## Purpose

Cerrar los detalles que quedaron de la cadena `ux-*` después de la integración #234 (Gus, 27-nov-2026).

## ADDED Requirements

### Requirement: Filtro de lotes sin abrir la hoja
En `/explorar/lotes` a 390 px, el filtro por estado SHALL verse y poder usarse con el teclado y con el dedo sin abrir la hoja de la lista. El filtro elegido MUST seguir reflejándose en la URL, y el aviso de estado administrativo MUST seguir visible completo antes del mapa.

#### Scenario: Filtrar en el celular
- **WHEN** una persona abre `/explorar/lotes` a 390 px y, sin abrir la hoja, toca "Disponible"
- **THEN** el botón queda marcado, la URL lleva el filtro y el mapa muestra solo los lotes disponibles

### Requirement: Estado idea en los principios de Ostrom
La tabla de los principios de Ostrom en `/bien-comun` SHALL mostrar el estado de cada principio como "Idea", con texto e ícono propios, y MUST NOT mostrarlo como "En discusión".

#### Scenario: Tabla de Ostrom
- **WHEN** una persona abre `/bien-comun` y llega a "Inspirado en Elinor Ostrom"
- **THEN** cada uno de los ocho principios dice "Idea"

### Requirement: Pie al final en páginas cortas
En una página más corta que la pantalla, el pie SHALL quedar al final de la pantalla y no a mitad de ella.

#### Scenario: Invertir sin sesión en el celular
- **WHEN** una persona sin sesión abre `/invertir` a 390×844
- **THEN** el borde inferior del pie está a 8 px o menos del final del documento
