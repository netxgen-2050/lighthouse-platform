# Spec Delta

## ADDED Requirements

### Requirement: Consulta por un lote de Lighthouse VRN
La bandeja SHALL aceptar el motivo "Consulta por un lote de Lighthouse VRN", en español e inglés, con destino "Equipo NetX", y el formulario "Hablar con alguien" de la ficha MUST registrarlo. El destino "BioPueblo, vía NetX como agencia" vale solo para las consultas por lotes de Chacras de Soluna, que junto con los pedidos ya guardados MUST seguir leyéndose como hasta ahora.

#### Scenario: Pedido nuevo
- **WHEN** una persona envía "Hablar con alguien" desde la ficha del lote 7
- **THEN** la bandeja de `/admin` muestra "Consulta por un lote de Lighthouse VRN", la referencia "Lote 7" y el destino "Equipo NetX"

#### Scenario: Pedido viejo de Soluna
- **WHEN** el navegador tiene guardado un pedido "Consulta por un lote" de una finca de Soluna
- **THEN** se sigue mostrando con destino "BioPueblo, vía NetX como agencia"
