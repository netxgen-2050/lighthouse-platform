# Spec Delta

## Purpose

Ordena la navegación de la plataforma en cinco destinos pensados para tres públicos (quien quiere vivir, quien invierte y quien cuida lo común), con una subnavegación para Explorar y un menú desplegable en el celular, sin borrar las páginas en pausa.

## ADDED Requirements

### Requirement: Cinco destinos
La navegación "Principal" SHALL mostrar, en este orden y sin títulos de grupo, los destinos que existen entre Explorar (`/`), Bien común (`/bien-comun`), Invertir (`/invertir`), Sumarte (`/sumarte`) y Mi tierra (`/mi-tierra`). Los nombres MUST salir del glosario, en los dos idiomas (en inglés: Explore, Commons, Invest, Join, My land).

#### Scenario: Con todas las páginas
- **WHEN** existen las cinco páginas y una persona abre la portada en una pantalla de 1280 px
- **THEN** la navegación "Principal" trae Explorar, Bien común, Invertir, Sumarte y Mi tierra, en ese orden

#### Scenario: Página que todavía no existe
- **WHEN** la app no tiene la ruta `/mi-tierra`
- **THEN** la navegación no muestra "Mi tierra"

### Requirement: Explorar marca su sección
El destino Explorar SHALL marcarse como actual (`aria-current="page"` y un realce que no dependa solo del color) en `/` y en cualquier ruta bajo `/territorios`, `/barrios`, `/lotes` y `/tribus`.

#### Scenario: Subpágina de Lotes
- **WHEN** una persona está en `/lotes/hibrido`
- **THEN** "Explorar" tiene `aria-current="page"` y ningún otro destino principal lo tiene

### Requirement: Subnavegación de Explorar
Las páginas de Explorar SHALL mostrar arriba del contenido una navegación con nombre "Explorar" con los enlaces que existen entre Territorio (`/territorios/lighthouse`), Barrios (`/barrios/norte`), Lotes (`/lotes`) y Comunidades (`/tribus`), marcando el actual con `aria-current="page"`. La portada `/` MUST NOT mostrarla. A 390 px MUST NOT generar scroll horizontal en la página.

#### Scenario: En Lotes
- **WHEN** una persona abre `/lotes`
- **THEN** ve la subnavegación con Territorio, Lotes y Comunidades (y Barrios si existe), con "Lotes" marcado

#### Scenario: Comunidades en inglés
- **WHEN** la persona abre `/tribus` en inglés
- **THEN** la subnavegación dice "Communities" y la marca como actual

### Requirement: Menú desplegable en el celular
Por debajo de 768 px de ancho, el rail SHALL ocultarse y la barra superior SHALL mostrar un botón "Menú" (en inglés "Menu") con `aria-expanded` que abre un panel con los mismos destinos principales. El panel MUST cerrarse con Escape, al elegir un destino o al volver a tocar el botón, y el foco MUST volver al botón al cerrar con Escape.

#### Scenario: Abrir y elegir
- **WHEN** una persona en un celular de 390 × 844 toca "Menú" y elige "Sumarte"
- **THEN** llega a `/sumarte` y el panel queda cerrado

#### Scenario: Escape
- **WHEN** el panel está abierto y la persona aprieta Escape
- **THEN** el panel se cierra y el foco vuelve al botón "Menú"

#### Scenario: Computadora
- **WHEN** la página se ve a 1280 px
- **THEN** no hay botón "Menú" y el rail está a la izquierda

### Requirement: Destinos en pausa fuera del menú
Fogón, Pactos, Semillas, Compromisos y Congreso SHALL NOT aparecer en la navegación principal, en el menú del celular, en la subnavegación ni en el menú de la persona. Sus páginas MUST seguir abriéndose por su URL con el mismo contenido y la misma regla de acceso, y en ellas ningún destino principal MUST marcarse como actual.

#### Scenario: Abrir el Fogón por la URL
- **WHEN** una persona con sesión abre `/fogon`
- **THEN** ve el Fogón como antes y ningún enlace de la navegación "Principal" tiene `aria-current="page"`

#### Scenario: Buscar en el menú
- **WHEN** una persona recorre el rail, el menú del celular y el menú del avatar
- **THEN** no encuentra Fogón, Pactos, Semillas, Compromisos ni Congreso

### Requirement: Sin sesión
Sin sesión, los cinco destinos SHALL verse habilitados (cada página decide qué muestra sin sesión) y la barra superior SHALL seguir mostrando "Sumarte" y "Entrar".

#### Scenario: Persona sin cuenta
- **WHEN** una persona sin sesión mira el rail
- **THEN** ve los destinos que existen, ninguno deshabilitado, y "Entrar" en la barra superior
