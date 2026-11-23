## ADDED Requirements

### Requirement: Adhesión automática a Lighthouse VRN
Adherir al manifiesto de Lighthouse VRN SHALL dejar a la persona como miembro de `lighthouse` en ese momento, sin pedido pendiente ni aceptación de nadie (decisión de Gus, 30-oct-2026). Una adhesión a `lighthouse` guardada como "pedido" MUST leerse como miembro. Las pantallas MUST NOT mostrar para Lighthouse VRN "tu pedido llegó" ni la acción simulada "la comunidad me acepta". Las tribus MUST seguir con pedido y aceptación como hoy.

#### Scenario: Adherir
- **WHEN** una persona Miembro adhiere al manifiesto de Lighthouse VRN
- **THEN** la ficha de Lighthouse VRN la muestra como parte ("Ya sos parte de Lighthouse VRN") sin botón de aceptar, y puede votar en el Fogón

#### Scenario: Pedido guardado antes
- **WHEN** el navegador tiene guardada la membresía de `lighthouse` como "pedido" con la versión vigente del manifiesto
- **THEN** la persona se ve como miembro de Lighthouse VRN y no ve "Simular: la comunidad me acepta"

#### Scenario: Tribu
- **WHEN** la persona adhiere al manifiesto de Valle Solar
- **THEN** sigue viendo que su pedido llegó y la acción simulada de aceptación, como hoy

#### Scenario: Cambio de versión
- **WHEN** el manifiesto de Lighthouse VRN cambió de versión desde que la persona adhirió
- **THEN** tiene que volver a adherir para participar, como hoy, y al hacerlo queda miembro al instante

### Requirement: Costura para el aval con constancias
El punto donde se resuelve la adhesión a Lighthouse VRN SHALL quedar marcado en el código como el lugar donde, más adelante, un aval de otras personas con constancias EAS (backlog D37) podrá condicionar la membresía. Este cambio MUST NOT construir ese aval ni mostrar nada de él en pantalla.

#### Scenario: Sin aval en pantalla
- **WHEN** la persona adhiere al manifiesto de Lighthouse VRN
- **THEN** no ve ningún pedido de aval ni de constancia
