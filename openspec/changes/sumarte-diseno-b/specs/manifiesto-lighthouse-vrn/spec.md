# Spec Delta

## MODIFIED Requirements

### Requirement: No aparece en Sumarte
The text and the principles of the Lighthouse VRN manifesto, and the button to adhere, SHALL NOT appear in `/sumarte` or in its plans. `/sumarte` MAY name Lighthouse VRN and SHALL show, outside the plan cards, an informative line saying that taking part in decisions asks for the Member plan and adhering to the manifesto, with a link to `/tribus/lighthouse`. Choosing a plan MUST NOT register an adhesion.

#### Scenario: Sumarte
- **WHEN** una persona recorre `/sumarte`
- **THEN** no ve el texto del manifiesto de Lighthouse VRN, sus principios ni el botón "Adherir"
- **AND** ve la línea informativa sobre la adhesión, con el enlace a la ficha

#### Scenario: Explorador que sigue el enlace
- **WHEN** una persona de nivel Explorador sigue el enlace desde `/sumarte`
- **THEN** en la ficha ve "Sumate para adherir"
