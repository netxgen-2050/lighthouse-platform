# Spec Delta

## Purpose

Deja escrita, donde la leen las personas y los agentes del repo, la regla de la fase 1: la venta de lotes privados en Lighthouse VRN se simula dentro del prototipo, por decisión de Franz aceptada por Gus.

## ADDED Requirements

### Requirement: Decisión registrada
El repo SHALL tener un ADR que registre quién decidió la venta de lotes, qué reglas escritas cambia y qué sigue igual, y que diga que la confirmación escrita de Franz está pendiente. El ADR MUST quedar en estado Propuesta hasta que Gus lo cambie.

#### Scenario: Leer la decisión
- **WHEN** una persona abre `docs/decisiones/README.md`
- **THEN** encuentra ADR-028 en estado Propuesta, y el ADR nombra a Franz como quien decide y a la nota 19, doc 30, T7, `CLAUDE.md` y `sumarte-diseno-b` como reglas que cambian

### Requirement: La regla en CLAUDE.md
`CLAUDE.md` SHALL decir que la fase 1 es la venta simulada de lotes en `lighthouse-norte`, que no se vuelve a discutir, que manda ADR-028 sobre las reglas viejas, y qué queda congelado. MUST seguir diciendo que ningún flujo cobra de verdad y que abrirla afuera es otro paso.

#### Scenario: Un agente lee las reglas
- **WHEN** un agente lee `CLAUDE.md` antes de trabajar en un lote
- **THEN** encuentra que puede simular la reserva y el pago, que no puede cobrar, y que la aprobación municipal no se muestra como otorgada

### Requirement: Solo Lighthouse VRN
Los cambios de la fase 1 SHALL hablar solo de Lighthouse VRN. MUST NOT mostrar Lighthouse SMA ni los números del deck de inversores (USD 111M, TIR, recupero).

#### Scenario: Revisión de textos
- **WHEN** se buscan "SMA", "111", "TIR" y "recupero" en los textos que suma la fase 1
- **THEN** no aparecen
