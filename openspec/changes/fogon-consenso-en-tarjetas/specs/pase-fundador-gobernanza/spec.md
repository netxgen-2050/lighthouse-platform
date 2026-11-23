## ADDED Requirements

### Requirement: Influencia en el Fondo Común
El Pase Fundador, en cualquiera de sus niveles, SHALL dar "Influencia en el Fondo Común": la distribución de grandes sumas, que se va a decidir con conviction voting más adelante. El mecanismo MUST NOT construirse en este cambio ni presentarse como disponible. El Fogón MUST NOT tener un ámbito Fideicomiso, y el Pase MUST NOT dar ningún voto en un fideicomiso, en las series ni en una decisión del Fogón.

#### Scenario: Sin voto en el Fogón
- **WHEN** una persona Fundadora recorre `/fogon`
- **THEN** no ve ningún ámbito Fideicomiso, ni opciones de voto, ni ninguna acción extra por tener el Pase

#### Scenario: Sin Pase
- **WHEN** una persona Miembro sin Pase mira las decisiones de `/fogon`
- **THEN** ve lo mismo que una persona Fundadora, sin "Votan quienes tienen el Pase Fundador"

## MODIFIED Requirements

### Requirement: Nivel Fundador
El sistema SHALL tratar a una persona con el Pase Fundador, de cualquier nivel, como el nivel Fundador: todo lo que habilita Miembro, más la Influencia en el Fondo Común y el canal de fundadores.

#### Scenario: Comprar el Pase
- **WHEN** una persona Miembro activa el Pase Brote en Sumarte (simulado)
- **THEN** queda con nivel Fundador y el Pasaporte muestra "Influencia en el Fondo Común (próximamente: conviction voting)" en lo que abre el sello

### Requirement: Texto en Sumarte y ⚖
La tarjeta del Pase Fundador SHALL decir que da influencia en el Fondo Común y que la distribución de grandes sumas se va a decidir con conviction voting (próximamente), con el ⚖ en borrador `influenciafondocomun`. MUST NOT decir que da voz o voto en las decisiones de un fideicomiso.

#### Scenario: Tarjeta
- **WHEN** una persona mira el Pase Fundador en `/sumarte`
- **THEN** lee "Influencia en el Fondo Común: la distribución de grandes sumas se va a decidir con conviction voting (próximamente)", con su ⚖ marcado como borrador, y no lee "fideicomiso"

#### Scenario: En inglés
- **WHEN** la persona mira el Pase Fundador en `/sumarte?lang=en`
- **THEN** lee "Influence in the Common Fund: the distribution of large sums will be decided with conviction voting (coming soon)"

## REMOVED Requirements

### Requirement: Voto en el Fideicomiso
**Reason**: Gus (1-nov y 2-nov-2026): el Fideicomiso salió del Fogón con el diseño legal B y en las decisiones del Fogón no se vota. Reemplazado por "Influencia en el Fondo Común".
**Migration**: la puerta `voto-fideicomiso` pasa a `influencia-fondo-comun` y el ⚖ `gobernanzafideicomiso`, a `influenciafondocomun` (lo hace `fogon-desde-mi-y-guardian`). Lo que queda se lista en `tasks.md` §5 de este cambio.
