# Proposal

## Why

Un barrio vacante tiene que invitar a que una comunidad se postule, en lugar de mostrar una ficha de tribu vacía. Decisiones de Gus del 8-oct-2026 (dictado sobre la app en producción). Fase de prototipo interno (ver `CLAUDE.md`).

## What Changes

- En la ficha del mapa y en `/tribus/<id>` de un barrio vacante, el botón pasa a ser **"Proponer una comunidad"** → `/tribus/<id>/postular`.
- **Formulario de postulación** (simulado, guardado en el navegador), con preguntas de ejemplo que Gus ajustará:
  1. Nombre de la comunidad y persona que lidera la postulación (nombre y contacto).
  2. Quiénes son: cuántas personas y hogares, y desde cuándo se conocen o trabajan juntos.
  3. Qué van a producir o aportar en el barrio (foco) y qué roles ya tienen y cuáles buscan.
  4. Qué aportarían al pozo común del Lighthouse.
  5. Forma jurídica actual o prevista (asociación civil, SAS, cooperativa, fundación, todavía ninguna).
  6. Cómo toman decisiones y cuál sería su ritual de entrada.
  7. Su relación con la regeneración de la tierra y experiencia previa en proyectos colectivos.
  8. Compromiso inicial de tiempo de la comunidad durante la fase de formación.
- Antes del formulario, una caja **"Requisitos para postular"** (ejemplo): un grupo de al menos 3 hogares, una persona responsable de la postulación, adherir al Pacto de convivencia del Lighthouse y a la regeneración de la tierra, y disponibilidad para una llamada con el equipo.
- Al enviar: "Recibimos tu postulación (simulado). Un administrador del Lighthouse la va a revisar." y el botón **"Agendar una llamada"** que abre `https://calendly.com/netx-ejemplo/postulacion` (enlace de ejemplo) en otra pestaña.
- Las postulaciones simuladas se cuentan en la Vista NetX (`/netx`) como "Postulaciones de comunidades".

**Fuera de alcance:** aprobación real por un administrador (llega con los roles), envío por mail, Calendly real.

## Capabilities

### New Capabilities
- `barrio-vacante-postulacion`: ver specs.

### Modified Capabilities

## Impact

`app/tribus/[id]/postular/`, `lib/postulaciones/`, la ficha de barrio vacante en `app/territorios/[id]/`, `/netx`, e2e.
