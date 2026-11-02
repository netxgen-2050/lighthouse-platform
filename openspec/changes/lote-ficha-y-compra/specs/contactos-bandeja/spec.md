# Spec Delta

## ADDED Requirements

### Requirement: Consulta por un lote de Lighthouse VRN
La bandeja SHALL aceptar el motivo "Consulta por un lote de Lighthouse VRN", en español e inglés, con destino "Equipo NetX". Las consultas por lotes de Chacras de Soluna y los pedidos ya guardados MUST seguir leyéndose como hasta ahora, con su destino de siempre.

#### Scenario: Pedido nuevo
- **WHEN** una persona envía una consulta desde la ficha del lote 7
- **THEN** la bandeja de `/netx` muestra "Consulta por un lote de Lighthouse VRN", la referencia "Lote 7" y el destino "Equipo NetX"

#### Scenario: Pedido viejo de Soluna
- **WHEN** el navegador tiene guardado un pedido "Consulta por un lote" de una finca de Soluna
- **THEN** se sigue mostrando con destino "BioPueblo, vía NetX como agencia"
