# Spec Delta

## Purpose

Recomendar en la portada el camino que corresponde al link por el que llegó la persona (por ejemplo, una campaña de inversores o del Congreso) y abrir una puerta directa a la sección de inversores, sin guardar ni enviar el origen.

## ADDED Requirements

### Requirement: Camino recomendado por el link de entrada
La portada SHALL leer el parámetro `camino` del link y, si no está, el parámetro `utm_campaign`, y recomendar como mucho un camino. `camino` MUST aceptar exactamente `explorar`, `tribu`, `congreso` e `inversor`. En `utm_campaign`, sin distinguir mayúsculas, MUST recomendarse: inversor si contiene "invers" o "invert"; Congreso si contiene "congreso"; tribu si contiene "tribu"; explorar si contiene "territorio" o "nodo". Se aplica la primera regla que coincida, en ese orden.

#### Scenario: Parámetro camino
- **WHEN** la persona abre `/?camino=congreso`
- **THEN** la portada recomienda el camino "Congreso · Feb 2027"

#### Scenario: Campaña de HubSpot
- **WHEN** la persona abre `/?utm_source=hubspot&utm_campaign=Inversores-Oct`
- **THEN** la portada trata la visita como de origen inversor

#### Scenario: camino tiene prioridad
- **WHEN** la persona abre `/?camino=tribu&utm_campaign=congreso-2027`
- **THEN** la portada recomienda "Encontrar mi tribu"

#### Scenario: Nodo lleva a explorar
- **WHEN** la persona abre `/?utm_campaign=nodo-valle`
- **THEN** la portada recomienda "Explorar el Lighthouse"

### Requirement: Portada sin origen reconocido
Sin parámetros, o con valores que no coinciden con ninguna regla, la portada SHALL mostrarse igual que antes de este cambio: los tres caminos en el mismo orden, sin "Recomendado para vos" y sin la sección para inversores.

#### Scenario: Sin parámetros
- **WHEN** la persona abre `/`
- **THEN** no ve "Recomendado para vos" ni "¿Venís a invertir?"

#### Scenario: Valor desconocido
- **WHEN** la persona abre `/?camino=cualquiera`
- **THEN** la portada se ve igual que sin parámetros

### Requirement: Marca del camino recomendado
La tarjeta del camino recomendado SHALL incluir el texto "Recomendado para vos" dentro de su enlace, de modo que forme parte de su nombre accesible, y MUST distinguirse también por algo que no sea color. El orden de los tres caminos MUST NOT cambiar.

#### Scenario: Marca accesible
- **WHEN** la persona abre `/?camino=tribu`
- **THEN** el enlace "Encontrar mi tribu" contiene "Recomendado para vos"
- **AND** los tres caminos siguen en el orden Explorar, Encontrar mi tribu, Congreso

### Requirement: Puerta para inversores
Con origen inversor, la portada SHALL mostrar antes de "Por dónde empezar" una sección con el título "¿Venís a invertir?", que nombre las dos puertas (sumarte al proyecto del territorio por invitación, con el ⚖ "Círculo por invitación", e invertir en NetX como empresa) y un enlace "Ver Para inversores" a `/sumarte#inversores`. La sección MUST NOT mostrar montos, lotes ni botones de pago.

#### Scenario: Llegar como inversor
- **WHEN** la persona abre `/?camino=inversor`
- **THEN** ve la sección "¿Venís a invertir?" antes de "Por dónde empezar"
- **AND** el enlace "Ver Para inversores" lleva a la sección "Para inversores" de `/sumarte`

#### Scenario: ⚖ con teclado
- **WHEN** la persona llega con Tab al ⚖ "Círculo por invitación" de esa sección
- **THEN** puede abrir su explicación sin mouse

### Requirement: El origen no se guarda
La plataforma MUST NOT guardar el origen de la visita en el navegador ni enviarlo a ningún servidor. Al volver a la portada sin parámetros, MUST NOT quedar ninguna recomendación.

#### Scenario: Volver sin parámetros
- **WHEN** la persona abre `/?camino=inversor` y después `/`
- **THEN** la segunda portada no muestra "¿Venís a invertir?" ni "Recomendado para vos"
