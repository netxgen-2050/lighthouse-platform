# Proposal

## Why

Los pactos tenían la lógica de Collabberry, donde quien aporta cobra una parte. Acá no: estamos construyendo **infraestructura de comunes** y en esta fase **solo se da**, tiempo o plata. Además el pacto tiene que empezar por el **rol** que la persona asume, y solo puede proponerlo quien ya es miembro de la comunidad. Decisiones de Gus del 8-oct-2026 (dictado sobre la app en producción). Fase de prototipo interno (ver `CLAUDE.md`).

## What Changes

- `/pactos` muestra primero **en qué comunidad** se hace el pacto, eligiendo entre las comunidades donde la persona es miembro (`lib/membresia/`). Si no es miembro de ninguna: "Para proponer un pacto primero tenés que pertenecer a una comunidad" con enlace a `/tribus`. Acepta `?comunidad=<id>`.
- **Pacto de tiempo:**
  1. **Rol** (lista de ejemplo con descripción de cada uno): facilitación, community manager, culture manager, coordinación o project management, abogacía, economía, jardinería, diseño de permacultura, bioconstrucción, comunicación, y "Otro" con texto libre. Más una **descripción propia** de qué va a hacer.
  2. **Horas por mes.**
  3. **Semillas por mes = horas × valor de referencia de la hora** (el valor actual del mock-up, marcado como "referencia, por ahora").
  - **Se elimina** "parte que aportás como semilla", "en caja" y todo cálculo de cobro.
- **Sumarte con plata** pasa a ser su **propia pestaña o sección**: un aporte en plata (monto en USD) se registra como Semillas (1 USD = 1 Semilla de referencia). Simulado, sin cobro.
- **Se quita la pestaña "Pacto de convivencia"** (ahora es la adhesión al manifiesto).
- **Tooltip económico 🌱**, nuevo y distinto del ⚖: componente `components/termino-economico.tsx` con catálogo `lib/economia/terminos.ts`, mismo comportamiento que el tooltip legal (mouse, teclado, toque) y nombre accesible "Qué significa en la economía de la comunidad: <título>". Primer término, **Semillas**:
  > "Las Semillas registran lo que aportás a una comunidad, en tiempo o en plata. No son dinero ni se venden: son un **potencial de acceso**. Cada comunidad tiene sus propias Semillas. Cuando la comunidad delibere qué valor va a ofrecer en común (hospitalidad, alimentos, talleres, estadías), tus Semillas te van a dar acceso a eso, según las reglas que se definan en la tokenomics."
  (borrador)
- Estado del pacto: Borrador → Enviado a la comunidad → **Aceptado por quien administra la comunidad** (simulado con "Simular: la comunidad acepta"). Los pactos aceptados se guardan por comunidad, para Semillas.

**Fuera de alcance:** valor de la hora propio de cada persona, utilidades por tribu, cálculos finos con evaluación entre pares (van al backlog).

## Capabilities

### New Capabilities
- `pactos-v2`: ver specs.

### Modified Capabilities

## Impact

`app/pactos/`, `lib/pactos/`, `components/termino-economico.tsx`, `lib/economia/`, e2e de pactos. Lee `lib/membresia/` (`tribu-adhesion-manifiesto`).
