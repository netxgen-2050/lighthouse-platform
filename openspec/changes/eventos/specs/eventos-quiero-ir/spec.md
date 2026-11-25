# Spec Delta

## Purpose

Permite que una persona con cuenta diga que quiere ir a un evento, sin que eso reserve un lugar, confirme su presencia ni le dé Semillas.

## ADDED Requirements

### Requirement: Quiero ir pide cuenta y política vigente
"Quiero ir" SHALL funcionar solo con sesión, nivel Explorador o superior y política vigente. Mientras se verifica el estado MUST NOT mostrar ninguna acción, y sin sesión MUST NOT leer ni escribir nada de esta función en el navegador.

#### Scenario: Sin cuenta
- **WHEN** una persona sin sesión mira un evento próximo
- **THEN** ve un enlace para sumarse, con el nombre del evento en su nombre accesible, y el navegador no guarda nada

#### Scenario: Vuelta desde Sumarte
- **WHEN** esa persona se suma desde el enlace del evento
- **THEN** vuelve a `/eventos#evento-<id>`, con esa tarjeta a la vista y el botón "Quiero ir"

#### Scenario: Política pendiente
- **WHEN** una persona con cuenta todavía no aceptó la política vigente
- **THEN** ve un enlace para aceptarla en lugar del botón

### Requirement: Anotarse y cambiar de idea
Una persona habilitada SHALL poder anotarse a un evento próximo y retirar esa intención. El estado MUST decirse con texto, MUST anunciarse a lectores de pantalla y MUST seguir igual al volver a la página.

#### Scenario: Anotarse
- **WHEN** la persona activa "Quiero ir" con el teclado
- **THEN** la tarjeta dice que anotó que quiere ir, ofrece "Ya no quiero ir" y el anuncio llega a lectores de pantalla

#### Scenario: Volver a la página
- **WHEN** la persona recarga `/eventos`
- **THEN** la tarjeta sigue diciendo que anotó que quiere ir

#### Scenario: Retirar
- **WHEN** la persona activa "Ya no quiero ir"
- **THEN** se borra la intención de ese evento y vuelve el botón "Quiero ir"

#### Scenario: Evento ya pasado
- **WHEN** un evento al que se había anotado ya pasó
- **THEN** la tarjeta dice que había anotado que quería ir y no ofrece ninguna acción

#### Scenario: No se pudo guardar
- **WHEN** el navegador no permite guardar
- **THEN** la tarjeta dice que no se pudo guardar y no muestra a la persona como anotada

### Requirement: Quiero ir no reserva ni da nada
Anotarse MUST NOT reservar un lugar, descontar cupo, confirmar presencia, otorgar sellos ni generar Semillas. La página MUST decirlo con palabras cerca de la acción.

#### Scenario: Aclaración visible
- **WHEN** una persona mira un evento con cupo limitado
- **THEN** lee que anotarse no reserva lugar y que quien organiza confirma la participación

#### Scenario: Sin efectos en Semillas y sellos
- **WHEN** la persona se anota a un evento que da Semillas
- **THEN** sus Semillas y sus sellos del Pasaporte quedan exactamente como estaban, y el cupo mostrado no cambia

### Requirement: Datos de cada persona
La intención MUST guardarse separada por persona y solo en el navegador, y MUST salir en la descarga de `/mis-datos`. Un valor guardado inválido MUST tomarse como que no hay nada anotado.

#### Scenario: Dos personas en un navegador
- **WHEN** otra persona entra en el mismo navegador
- **THEN** no ve las intenciones de la anterior

#### Scenario: Descargar mis datos
- **WHEN** una persona anotada descarga sus datos
- **THEN** el archivo incluye a qué eventos dijo que quiere ir, y la clave sale como `null` si no hay nada

#### Scenario: Valor roto
- **WHEN** lo guardado no se puede interpretar
- **THEN** la página no falla y ningún evento figura como anotado

### Requirement: Rastro en Mi recorrido
Anotarse SHALL dejar un único registro en la actividad de la persona, que enlace al evento, en el idioma actual y sin notificación. Anotarse de nuevo al mismo evento MUST NOT duplicarlo.

#### Scenario: En Mi recorrido
- **WHEN** la persona se anota a un evento y abre Mi recorrido
- **THEN** ve la línea con el nombre del evento y un enlace a `/eventos#evento-<id>`, y la campanita no cuenta nada nuevo

#### Scenario: Anotarse dos veces
- **WHEN** la persona se anota, retira y se anota otra vez al mismo evento
- **THEN** Mi recorrido muestra una sola línea de ese evento

### Requirement: La política nombra el dato nuevo
El borrador de la política SHALL nombrar los eventos a los que la persona dice que quiere ir, en el resumen y en la tabla de datos por pantalla. Como amplía lo descrito, `VERSION_POLITICA` MUST subir (ADR-017).

#### Scenario: Leer la política
- **WHEN** una persona abre `/privacidad`
- **THEN** encuentra la fila "Eventos", que dice que hoy el dato queda solo en su navegador

#### Scenario: Consentimiento anterior
- **WHEN** una persona que aceptó la versión anterior vuelve a una página que pide consentimiento
- **THEN** se le pide aceptar la política nueva
