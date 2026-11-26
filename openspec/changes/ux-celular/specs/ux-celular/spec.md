# Spec Delta

## Purpose

En el celular la app se maneja como una app: los destinos abajo, al alcance del pulgar, y nada flotando encima del contenido (dirección B, Gus, 25-nov-2026).

## ADDED Requirements

### Requirement: Barra inferior en el celular
Por debajo de 768 px de ancho, la app SHALL mostrar una barra inferior fija con Inicio, Explorar, Participa, Invertir, Mi tierra y Más. El destino actual MUST marcarse con `aria-current="page"`, color y negrita. Cada ítem MUST medir al menos 48 px de alto. En compu la barra inferior MUST NOT mostrarse.

#### Scenario: Navegar desde la barra
- **WHEN** una persona en un celular toca Explorar en la barra inferior
- **THEN** llega a Explorar y el ítem Explorar queda marcado como actual

#### Scenario: Compu
- **WHEN** una persona abre la app a 1440 px
- **THEN** no ve la barra inferior y navega con el rail

### Requirement: Hoja Más
El ítem Más SHALL abrir una hoja con los destinos que no están en la barra (Bien común y Sumarte), los de la persona si hay sesión, el idioma, Reportar un error y Admin si es super admin. La hoja MUST atrapar el foco, cerrarse con Escape o deslizando hacia abajo, y devolver el foco a Más al cerrarse.

#### Scenario: Abrir y cerrar
- **WHEN** una persona toca Más y después aprieta Escape
- **THEN** la hoja se abre con el foco adentro y al cerrarse el foco vuelve a Más

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión abre Más
- **THEN** ve Entrar arriba de todo, Bien común, Sumarte, el idioma y Reportar un error

### Requirement: Un solo botón flotante
La app SHALL tener como máximo un botón flotante (la HIFA). Reportar un error MUST abrirse desde la barra superior en compu y desde la hoja Más en el celular. Ningún botón flotante MUST tapar el texto del contenido a 390 px.

#### Scenario: Inicio en el celular
- **WHEN** una persona abre `/` a 390 px
- **THEN** ningún botón flotante se superpone con el título ni con el primer párrafo

#### Scenario: Reportar desde compu
- **WHEN** una persona aprieta Reportar en la barra superior a 1440 px
- **THEN** se abre el mismo formulario de reporte que antes

### Requirement: Idioma fuera de la barra superior
El selector de idioma SHALL estar en el menú del avatar, en la hoja Más y en Configuración, y no como control fijo de la barra superior. Cambiar el idioma MUST seguir guardando la elección y respetar la detección por idioma del navegador cuando no hay elección.

#### Scenario: Cambiar a inglés en el celular
- **WHEN** una persona abre Más y elige English
- **THEN** la app pasa a inglés y la elección se mantiene al recargar
