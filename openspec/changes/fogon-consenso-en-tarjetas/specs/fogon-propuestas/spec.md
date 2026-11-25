## ADDED Requirements

### Requirement: Estado del consenso en la propuesta
La página de una propuesta SHALL mostrar, debajo de su título, el mismo bloque "Estado del consenso" que la tarjeta de esa decisión, calculado con el mismo estado que el resto de la página. El nivel de visita MUST NOT verlo. La página MUST NOT ofrecer votar la propuesta ni mostrar un conteo de votos; un mecanismo solo aparece si fue sugerido, con la nota de que no reemplaza al consenso.

#### Scenario: Mismo estado en la ficha
- **WHEN** una persona abre la propuesta de la bomba solar el 30 de octubre de 2026
- **THEN** el bloque dice "Resolver concerns", 3 concerns abiertos, 0 acuses de 7 y quórum de 4 personas, igual que su tarjeta

#### Scenario: Visita
- **WHEN** la persona elige "Visita (sin cuenta)" en "Mirá la propuesta como…"
- **THEN** no ve el bloque y lee que para ver las propuestas hay que abrir una cuenta

## MODIFIED Requirements

### Requirement: Abrir la propuesta
Toda decisión del Fogón que tiene una propuesta de ejemplo SHALL mostrar un enlace "Abrir la propuesta" en su tarjeta de `/fogon` y en el panel de la decisión elegida en la lente "Decisiones que suben". El enlace MUST llevar a `/fogon/propuestas/<id de la decisión>`. Las decisiones sin propuesta, por ejemplo las que decide un órgano legal o las copias llevadas al consejo, MUST NOT mostrarlo y MUST decir en su estado del consenso que todavía no tienen propuesta.

#### Scenario: Desde el Fogón
- **WHEN** una persona toca "Abrir la propuesta" en la tarjeta "Pedido de Valle Solar al Fondo Común para la bomba solar"
- **THEN** llega a la página de esa propuesta con su título como encabezado

#### Scenario: Desde la lente Decisiones
- **WHEN** la persona elige "Cisterna compartida entre Agua Clara y Valle Solar" en la lente "Decisiones que suben" y activa "Abrir la propuesta" con el teclado
- **THEN** llega a la página de esa propuesta

#### Scenario: Decisión sin propuesta
- **WHEN** la persona mira la tarjeta "Presupuesto 2027 del Fondo Común"
- **THEN** no ve "Abrir la propuesta" y lee que todavía no tiene propuesta

#### Scenario: Propuesta que no existe
- **WHEN** alguien abre `/fogon/propuestas/no-existe`
- **THEN** ve la página de "no encontrada" del sitio, sin errores
