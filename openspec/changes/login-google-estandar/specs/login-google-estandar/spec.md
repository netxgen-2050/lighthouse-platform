## ADDED Requirements

### Requirement: Google es la primera opción del login

En el paso del email del formulario de login con Neon Auth, el botón de Google SHALL ser el primer control, antes de un separador con la palabra "o" y del campo de email con "Mandame el código". El botón SHALL estar fuera del formulario del código por email y tener su propio nombre accesible.

#### Scenario: Orden de la pantalla
- **WHEN** una persona acepta en el paso del consentimiento y se abre el formulario de login con Neon Auth
- **THEN** ve, de arriba hacia abajo: el botón "Continuar con Google", el separador "o", el campo "Tu email" y el botón "Mandame el código"

#### Scenario: El foco sigue en el email
- **WHEN** se abre el formulario de login
- **THEN** el foco está en el campo "Tu email"
- **AND** con Shift+Tab desde el campo, el foco llega al botón "Continuar con Google"

#### Scenario: Enter en el email no dispara Google
- **WHEN** la persona escribe su email y aprieta Enter
- **THEN** se pide el código por email y no se abre Google

#### Scenario: El botón no es parte del formulario del email
- **WHEN** un lector de pantalla recorre el formulario "Entrar con un código por email"
- **THEN** el botón "Continuar con Google" no está dentro de ese formulario

### Requirement: El botón de Google sigue las pautas de marca de Google

El botón SHALL mostrar el logo "G" oficial de cuatro colores sin modificar y el texto "Continuar con Google", con los colores de las pautas de Google para el tema claro y el oscuro, tomados de tokens del tema. El logo SHALL ser decorativo para los lectores de pantalla.

#### Scenario: Tema claro
- **WHEN** el tema es claro
- **THEN** el botón tiene fondo blanco, borde gris y texto casi negro, con el logo "G" de cuatro colores a la izquierda del texto

#### Scenario: Tema oscuro
- **WHEN** el tema es oscuro
- **THEN** el botón tiene fondo casi negro, borde gris y texto claro, y el logo mantiene sus cuatro colores

#### Scenario: Nombre accesible
- **WHEN** un lector de pantalla llega al botón
- **THEN** anuncia "Continuar con Google", una sola vez, sin leer el logo

#### Scenario: Ocupado
- **WHEN** hay un pedido de login en curso
- **THEN** el botón tiene `aria-disabled="true"` y un segundo clic no hace otro pedido

#### Scenario: Sin violaciones de accesibilidad
- **WHEN** se corre axe sobre el diálogo de login abierto, en el tema claro y en el oscuro
- **THEN** no hay violaciones serias ni críticas

### Requirement: El login con Google funciona igual que antes

Apretar "Continuar con Google" SHALL iniciar el mismo flujo que antes (`signIn.social` con proveedor Google y vuelta a la página actual), con los mismos mensajes de error.

#### Scenario: Inicio del flujo
- **WHEN** la persona aprieta "Continuar con Google"
- **THEN** se llama a `signIn.social` con `provider: "google"` y una `callbackURL` igual a la página actual

#### Scenario: Error del proveedor
- **WHEN** Neon Auth responde con un error al iniciar el flujo de Google
- **THEN** se muestra el mismo mensaje de error que antes, con `role="alert"`

#### Scenario: Otros logins no cambian
- **WHEN** `NEXT_PUBLIC_LH_LOGIN` no es `neon-auth`
- **THEN** el login se ve y funciona como antes de este cambio
