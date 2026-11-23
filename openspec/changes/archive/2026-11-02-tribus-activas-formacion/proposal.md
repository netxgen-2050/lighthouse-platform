# Proposal

## Why

Hoy una tribu activa y una en formación se ven casi igual. Gus quiere que la UI diferencie las tribus **activas** (ya tienen compromiso con el Lighthouse y están construyendo) de las que están **en formación** (coordinándose para postularse a un territorio) y de los **barrios vacantes**. Decisiones de Gus del 8-oct-2026 (dictado sobre la app en producción). Fase de prototipo interno (ver `CLAUDE.md`).

## What Changes

- `/tribus` se organiza en **tres secciones**, cada una con un título y una línea que explica qué significa:
  - **Tribus activas:** "Ya tienen un compromiso con el Lighthouse y están construyendo su barrio."
  - **En formación:** "Se están organizando para postularse a un barrio del Lighthouse."
  - **Barrios vacantes:** "Buscan una comunidad. ¿Tenés una?" con el botón "Proponer una comunidad".
- Las tarjetas de cada sección se diferencian también en contenido: las activas muestran hogares y lo que aportan al pozo común; las en formación, en qué etapa están (ejemplo: "Armando su propuesta") y qué roles buscan; las vacantes, qué necesita el barrio.
- La página de una tribu en formación muestra un aviso claro: "Esta comunidad está en formación: todavía no tiene un compromiso firmado con el Lighthouse".

**Fuera de alcance:** el modelo de "varias comunidades postulándose a la misma tierra" (va al backlog para discutir).

## Capabilities

### New Capabilities
- `tribus-activas-formacion`: ver specs.

### Modified Capabilities

## Impact

`app/tribus/page.tsx`, `app/tribus/[id]/page.tsx`, `lib/tribus/` (campo de etapa de ejemplo para las en formación), e2e de tribus.
