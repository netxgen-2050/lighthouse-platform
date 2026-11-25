# Proposal

## Why

Antes de cualquier pacto, una persona tiene que **pertenecer** a una comunidad: adherir a su manifiesto y ser aceptada por quien administra esa comunidad. Gus quiere que la experiencia se parezca a leer y aceptar los términos de un servicio, pero con un lenguaje que haga conciencia de que se trata de **pertenecer a un grupo de humanos**, con la atención y el cuidado que eso merece. El pacto de convivencia deja de ser un tipo de pacto y pasa a ser este paso. Decisiones de Gus del 8-oct-2026 (dictado sobre la app en producción). Fase de prototipo interno (ver `CLAUDE.md`).

## What Changes

- **Manifiestos de ejemplo** en `lib/manifiestos/`: uno por cada tribu activa o en formación (8) y uno del **Lighthouse** (Pacto de convivencia del Lighthouse). Cada uno con título, una introducción, 5 a 7 compromisos en lenguaje cálido y concreto (cómo se cuidan, cómo deciden, cómo resuelven conflictos, qué aportan a la tierra y al común, cómo se sale) y la fecha de la versión. Los redacta el agente, inspirados en cada tribu (foco, ritual, forma de decidir), marcados como ejemplo.
- **Membresía** en `lib/membresia/` (simulada, en el navegador) por comunidad (`lighthouse` o el id de una tribu), con tres estados: *no miembro*, *pedido enviado* (esperando a la comunidad) y *miembro*.
- **Página de una tribu** (y el resumen del Lighthouse en `/territorios/lighthouse`), si la persona no es miembro: botones **"Leer el manifiesto de la tribu"** y **"Adherir al manifiesto de la tribu"**.
- **Experiencia de lectura y adhesión** (diálogo o página `/tribus/<id>/manifiesto`): el texto completo; el botón de adherir se habilita recién al llegar al final; dos casillas obligatorias con lenguaje consciente, por ejemplo: "Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas" y "Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos".
- Al adherir: "Tu pedido llegó a <tribu>. Quien la administra lo va a revisar." y, para el prototipo, el botón "Simular: la comunidad me acepta". Cuando es miembro, los botones pasan a ser "Proponer mi pacto" (→ `/pactos?comunidad=<id>`) y "Entrar a la sala" (simulado).
- `lib/membresia/` expone las comunidades donde la persona es miembro para que las usen Pactos y Semillas.

**Fuera de alcance:** aprobación real por un administrador (llega con los roles), versionado de manifiestos con firma real.

## Capabilities

### New Capabilities
- `tribu-adhesion-manifiesto`: ver specs.

### Modified Capabilities

## Impact

`lib/manifiestos/`, `lib/membresia/`, `app/tribus/[id]/` (botones y manifiesto), resumen de `/territorios/lighthouse`, e2e.
