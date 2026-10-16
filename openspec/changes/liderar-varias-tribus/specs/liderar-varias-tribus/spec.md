# Spec Delta

## Purpose

Permite que una persona con el Plan Tribu lidere más de una tribu del Lighthouse, con un aviso de confirmación cada vez que suma otra (decisión de Gus del 14-oct-2026, backlog L8).

## ADDED Requirements

### Requirement: Lista de tribus lideradas
The system SHALL store the tribes a person leads as a list (no duplicates). Data saved with the previous single-tribe format MUST be read as a list with that one tribe, without losing it.

#### Scenario: Formato anterior
- **WHEN** una persona tenía guardado ser líder de Valle Solar con el formato de una sola tribu
- **THEN** al abrir Sumarte figura como líder de Valle Solar y puede sumar otra tribu

#### Scenario: Sin duplicados
- **WHEN** una persona que lidera Valle Solar intenta sumar Valle Solar otra vez
- **THEN** Valle Solar no aparece entre las opciones para sumar y la lista no cambia

### Requirement: Sumar otra tribu con confirmación
For a person who already leads at least one tribe, the Plan Tribu card SHALL offer "Sumar otra tribu", listing only tribes they do not lead. Confirming a choice MUST open a modal dialog naming the tribes already led and the new one, with "Sí, sumar <tribu>" and "Cancelar", and the note that in the real version the super admin approves it.

#### Scenario: Sumar con confirmación
- **WHEN** una persona que lidera Valle Solar elige Taller Común en "Sumar otra tribu" y aprieta "Sí, sumar Taller Común" en el diálogo
- **THEN** queda como líder de Valle Solar y de Taller Común, y el estado anunciado lo dice

#### Scenario: Cancelar
- **WHEN** en el diálogo aprieta "Cancelar" o la tecla Escape
- **THEN** sigue liderando solo Valle Solar y el foco vuelve al botón que abrió el selector

#### Scenario: Primera tribu sin diálogo
- **WHEN** una persona Miembro elige el Plan Tribu y su primera tribu
- **THEN** queda como líder sin diálogo de confirmación, como hoy

### Requirement: Dejar de liderar una tribu
Each led tribe SHALL have a "Dejar de liderar" action. Leaving the last one MUST leave the person as Miembro, keeping their Pase Fundador if they have one. A tribe assigned by `LH_PERSONAS` MUST NOT offer this action.

#### Scenario: Deja una de dos
- **WHEN** una persona que lidera Valle Solar y Taller Común deja de liderar Taller Común
- **THEN** sigue como líder de Valle Solar

#### Scenario: Deja la última
- **WHEN** deja de liderar su única tribu
- **THEN** queda con el plan Miembro y Pactos, Semillas, Fogón y Compromisos siguen habilitados

### Requirement: Cambiar de plan deja todas
Switching to Miembro or Explorador from Sumarte SHALL end leadership of every tribe chosen in Sumarte.

#### Scenario: Volver a Explorador
- **WHEN** una persona que lidera dos tribus vuelve a Explorador
- **THEN** no lidera ninguna y no ve la marca de admin en ninguna tribu

### Requirement: Precio por tribu
The Plan Tribu card SHALL state that the price is per tribe and, for a leader, show the monthly total as number of tribes × example price, marked as simulated with no charge.

#### Scenario: Dos tribus
- **WHEN** una persona lidera dos tribus y la moneda es USD
- **THEN** la tarjeta muestra "USD 60/mes por tribu" y un total de "USD 120/mes" con la aclaración de cobro simulado

### Requirement: Marca de admin en cada tribu
The "Admin de <tribu>" mark SHALL appear on the page of every tribe the person leads, and the avatar menu MUST list all of them.

#### Scenario: Dos marcas
- **WHEN** una persona lidera Valle Solar y Taller Común
- **THEN** ve la marca de admin en `/tribus/valle` y en `/tribus/taller`, no en `/tribus/semilla`, y el menú del avatar nombra las dos

### Requirement: Una sola tribu nueva pendiente
"Proponer una tribu nueva" SHALL be offered only while the person has no new tribe pending.

#### Scenario: Ya hay una pendiente
- **WHEN** una persona lidera Valle Solar y tiene una tribu nueva por proponer
- **THEN** "Sumar otra tribu" no ofrece "Proponer una tribu nueva"
