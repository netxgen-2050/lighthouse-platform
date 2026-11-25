## ADDED Requirements

### Requirement: Sumarte como entrada
`/sumarte` SHALL be public; choosing a plan without a session SHALL open the Privy sign-up/login and, after it, apply the chosen level without leaving the page.

#### Scenario: Sumarse gratis
- **WHEN** una persona sin cuenta elige Explorador en `/sumarte` y se registra
- **THEN** queda con nivel Explorador y ve habilitados Hifa y Congreso

### Requirement: Niveles y lo que habilitan
The system SHALL derive what a person can use from their level: no account (Descubrir and Sumarte), Explorador (+ Hifa, Congreso, personal area, report button), Miembro or Pase Fundador (+ Participar and joining tribes), Líder de tribu via Plan Tribu (+ admin of the chosen tribe), Super admin only via `LH_PERSONAS` (+ NetX).

#### Scenario: Explorador no participa
- **WHEN** una persona Exploradora mira el rail
- **THEN** Pactos, Semillas, Fogón y Compromisos aparecen deshabilitados con "Sumate para participar"

#### Scenario: Miembro participa
- **WHEN** la persona pasa a Miembro desde Sumarte
- **THEN** Pactos, Semillas, Fogón y Compromisos quedan habilitados

#### Scenario: Líder de tribu
- **WHEN** una persona elige el Plan Tribu y elige liderar Valle Solar
- **THEN** queda como admin de Valle Solar y ve la marca de admin en `/tribus/valle`

### Requirement: Sin pantallas de entrada repetidas
Destinations not enabled by the current level SHALL be disabled in the rail (not clickable, `aria-disabled`) with a hint and a visible link to Sumarte; opening one by URL SHALL go to `/sumarte` with a notice of which plan enables it and return there after joining; "Entrá para…" actions SHALL become "Sumate para…" linking to Sumarte.

#### Scenario: Dirección directa
- **WHEN** una persona sin cuenta abre `/pactos`
- **THEN** llega a `/sumarte` con el aviso "Pactos se habilita con el plan Miembro"

#### Scenario: Volver después de sumarse
- **WHEN** esa persona se suma como Miembro
- **THEN** vuelve a `/pactos`

### Requirement: Acceso abierto con ajustes
Any person who signs up with Privy SHALL get at least the Explorador level; `LH_PERSONAS` SHALL only adjust specific emails (for example super admin); `LH_ACCESO=lista` SHALL restore the closed list.

#### Scenario: Persona nueva
- **WHEN** alguien que no está en `LH_PERSONAS` se registra
- **THEN** entra como Explorador

#### Scenario: Super admin
- **WHEN** entra el email marcado como `superadmin` en `LH_PERSONAS`
- **THEN** ve NetX y tiene acceso a todo

### Requirement: Cambiar de nivel
The person SHALL be able to change level from Sumarte (simulated, no payment), and the change SHALL apply immediately.

#### Scenario: Bajar de plan
- **WHEN** una persona Miembro vuelve a Explorador
- **THEN** Participar queda deshabilitado otra vez
