# Spec Delta

## Purpose

Lo que habilita cada nivel con los planes de la fase 1 (Gus, 27-nov-2026): la voz y el trabajo piden cuenta, no un plan pago.

## ADDED Requirements

### Requirement: Niveles de la fase 1
The system SHALL derive what a person can use from their level, each including the previous one. No account: Descubrir pages and Sumarte. Explorador (free account): also the personal area, Mi tierra, Hifa and simulated lot reservation. Amigo: also the Amigo utilities. Fundador: also the Génesis registry and the guided visit. Super admin only via `LH_PERSONAS`.

#### Scenario: Amigo ve sus utilidades
- **WHEN** una persona elige Amigo en Sumarte
- **THEN** la bitácora, las sesiones y el FARO de prepago figuran como parte de su plan

### Requirement: La voz y el trabajo no se compran
Adhering to the manifesto and joining a Participa team SHALL require only an account (Explorador), never a paid plan. Invertir MUST NOT depend on any plan: an Explorador sees the same numbers as an Amigo or a Fundador.

#### Scenario: Explorador se suma a un equipo
- **WHEN** una persona Exploradora, con cuenta y sin plan pago, aprieta sumarse en un equipo de `/participa`
- **THEN** puede adherir al manifiesto y pedir sumarse sin que se le pida un plan

#### Scenario: Explorador adhiere
- **WHEN** una persona Exploradora abre el manifiesto de Lighthouse VRN
- **THEN** ve el botón para adherir, no "Sumate para adherir"

#### Scenario: Invertir sin plan
- **WHEN** una persona Exploradora abre `/invertir`
- **THEN** ve los números del barrio igual que alguien con Amigo o Fundador

## REMOVED Requirements

### Requirement: Niveles y lo que habilitan
**Reason**: Pedía Miembro o Pase Fundador para adherir y sumarse a una tribu, y nombraba el Plan Tribu, que sale de Sumarte. Gus, 27-nov-2026: la voz y el trabajo no se compran.
**Migration**: Reemplazado por "Niveles de la fase 1". Pactos, Semillas, Fogón y Compromisos (en pausa) siguen pidiendo el nivel interno `miembro`, que ahora se llama Amigo.
