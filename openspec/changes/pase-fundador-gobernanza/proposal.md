# Proposal

## Why

En `sumarte-acceso` el Pase Fundador cuenta como Miembro. Gus aclaró (14-oct-2026) que el **Pase Fundador da gobernanza**: es quien vota en la pestaña **Fideicomiso** del Fogón. Así el nivel Fundador se distingue de Miembro y la escalera de Sumarte queda completa.

## What Changes

- **Nivel Fundador** (Pase Fundador Semilla, Brote o Raíz) entre Miembro y Líder de tribu: todo lo de Miembro, más:
  - **Votar en las decisiones del ámbito Fideicomiso** del Fogón (hoy requieren "beneficiario"; pasan a requerir el Pase Fundador);
  - la **voz en el Fondo Común** (cámara de fundadores: 1 persona = 1 voz, el refuerzo por presencia sigue "a decidir") y el **canal de fundadores**, como ya dice la tabla de permisos (nota 18 §3).
- **Fogón**: en la pestaña Fideicomiso, quien no tiene el Pase ve las decisiones y su resultado, y en lugar de "Votar" ve "Votan quienes tienen el Pase Fundador", con un enlace a Sumarte. Quien tiene el Pase vota (simulado, igual que hoy).
- **Sumarte**: la tarjeta del Pase Fundador dice explícitamente que da voz en las decisiones del fideicomiso y del Fondo Común.
- **Pasaporte**: el sello Pase Fundador lista "Voto en el Fideicomiso" entre lo que abre.
- **⚖ `gobernanzafideicomiso`** (borrador): en lenguaje simple, qué decide el fideicomiso y que en la versión real el alcance del voto lo define el contrato del fideicomiso (en el POC, el Pase lo simula).
- El fixture de los e2e puede elegir nivel Fundador.

**Fuera de alcance:** el contrato real del fideicomiso, el peso del voto por nivel de pase (los tres niveles votan igual: "mismo voto en los tres niveles", como dice Sumarte), el refuerzo por presencia.

> **Para revisar con Gabriel (R14):** en la tokenomics, el Pase Fundador es una membresía intransferible con voz en el Fondo Común; ser **beneficiario del fideicomiso** lo define su contrato. En el POC el Pase simula ese voto; antes de mostrarlo fuera del equipo hay que confirmar cómo se relacionan.

## Capabilities

### New Capabilities
- `pase-fundador-gobernanza`: el nivel Fundador y su voto en el Fideicomiso y en el Fondo Común.

### Modified Capabilities

## Impact

`lib/permisos/` (nivel Fundador y puerta "voto-fideicomiso"), `lib/fogon/` (requisito del ámbito Fideicomiso), `app/fogon/`, `app/sumarte/` (texto de la tarjeta), `lib/pasaporte/` (lo que abre el sello), `lib/legal/terminos.ts`, e2e. Depende de `sumarte-acceso` (niveles por persona).
