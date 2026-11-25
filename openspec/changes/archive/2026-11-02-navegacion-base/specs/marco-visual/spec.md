## ADDED Requirements

### Requirement: Encabezado y navegación
The system SHALL show on every page a header with the brand "NetX" and the tagline "Tribus · Territorios regenerativos", and a `nav` landmark labelled "Principal" with links Inicio (`/`) and Tribus (`/tribus`). The link of the current section MUST carry `aria-current="page"`.

#### Scenario: Navegar a Tribus
- **WHEN** una persona está en `/` y hace clic en "Tribus"
- **THEN** llega a `/tribus` y el enlace "Tribus" tiene `aria-current="page"`

#### Scenario: Página de una tribu
- **WHEN** una persona está en `/tribus/valle`
- **THEN** el enlace "Tribus" tiene `aria-current="page"`

### Requirement: Saltar al contenido
The system SHALL provide a "Saltar al contenido" link as the first focusable element, visible on focus, that moves focus to the `main` landmark.

#### Scenario: Teclado
- **WHEN** una persona aprieta Tab al cargar cualquier página
- **THEN** el primer foco es "Saltar al contenido" y al activarlo el foco pasa al contenido principal

### Requirement: Pie común
The system SHALL show on every page a footer with "Prototipo en desarrollo. Datos de ejemplo." and the current year.

#### Scenario: Pie visible
- **WHEN** una persona abre `/`, `/tribus` o `/tribus/grano`
- **THEN** ve el pie con el aviso

### Requirement: Paleta y tipografías del mock-up
The system SHALL use the mock-up v6 palette and fonts through shared design tokens; pages MUST NOT use raw hex colors or default Tailwind palette colors for brand surfaces, text or buttons. Text contrast MUST meet WCAG AA.

#### Scenario: Sin colores sueltos
- **WHEN** se busca en `app/` y `components/` un color hexadecimal o una clase de paleta por defecto (`emerald-`, `stone-`, `amber-`) en elementos de marca
- **THEN** no aparece ninguno fuera de `app/globals.css`

### Requirement: Portada
The system SHALL show at `/` the headline "Encontrá tu tribu." with "Construí en común." and a primary button "Ver las tribus" to `/tribus`.

#### Scenario: Portada
- **WHEN** una persona abre `/`
- **THEN** ve el titular y el botón, y el botón lleva a `/tribus`
