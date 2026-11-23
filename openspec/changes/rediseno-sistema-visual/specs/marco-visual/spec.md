# Spec Delta

## MODIFIED Requirements

### Requirement: Paleta y tipografías del mock-up
The system SHALL use the palette and fonts of the Lighthouse slide (direcciones A y C del rediseño del 23-nov-2026, con la paleta clara de la dirección B) through shared design tokens; pages MUST NOT use raw hex colors or default Tailwind palette colors for brand surfaces, text or buttons. Text contrast MUST meet WCAG AA in both themes.

#### Scenario: Sin colores sueltos
- **WHEN** se busca en `app/` y `components/` un color hexadecimal o una clase de paleta por defecto (`emerald-`, `stone-`, `amber-`) en elementos de marca
- **THEN** no aparece ninguno fuera de `app/globals.css`

#### Scenario: Paleta oscura
- **WHEN** el tema es oscuro
- **THEN** el fondo es `#0E0F0B`, el texto `#F1EEE6`, el secundario `#B9B49B` y el acento `#D8CC92`

#### Scenario: Paleta clara
- **WHEN** el tema es claro
- **THEN** el fondo es `#F3EFE6`, el texto `#16170F` y el secundario `#57543F`
