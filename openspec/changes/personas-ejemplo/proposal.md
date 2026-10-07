# Proposal

## Why

La demo de la It.1 (nota Desarrollo/06) es "el recorrido **Lucía/Lucas** hasta el perfil, sobre un preview real". El mock-up v6 permite ver la plataforma "como" Lucía (diseñadora, vive en Oslo, quiere pasar temporadas) o como Lucas (técnico solar de Neuquén, quiere mudarse y construir), y la entrevista se completa con sus respuestas de ejemplo. Hoy `/perfil` exige escribir las seis respuestas a mano: para mostrarle la demo a Franz hay que tipear en vivo, y no hay un test que recorra el camino completo. Este cambio trae las dos personas de ejemplo, **solo** con lo que hace falta para llegar al perfil.

## What Changes

- Un selector "Ver como" con tres opciones: **Sin persona** (por defecto), **Lucía** y **Lucas**, que se guarda solo en el navegador. Aparece en la portada y en `/perfil`.
- En la portada, cuando hay una persona elegida, una tarjeta "Estás viendo la plataforma como Lucía, 38 · Oslo, Noruega" con su descripción corta del mock-up y la marca "Persona de ejemplo".
- En `/perfil`, cuando hay una persona elegida, un botón "Usar la respuesta de ejemplo de Lucía" (o de Lucas) que **completa** el campo con su respuesta del mock-up para la pregunta actual. La persona igual tiene que apretar "Responder", y puede editar el texto antes.
- Si la respuesta enviada es **exactamente** la de ejemplo, la propuesta del perfil es el resumen del mock-up (por ejemplo, "Valle ribereño patagónico"); si no, se mantiene el comportamiento actual.
- Un test e2e del **recorrido de la demo**: portada → elegir Lucía → "Encontrar mi tribu" → seis respuestas de ejemplo → confirmar todo → 6/6 → "Ver las tribus". Y el mismo para Lucas.

**Fuera de alcance:**
- **Plata e inversión:** del objeto `PEOPLE` del mock-up **no** se copian `capUsd`, `funds`, `calif`, `hours`/`pshare` (horas valorizadas) ni nada de Sumarte, Semillas o fideicomiso.
- **Datos con peso legal:** nacionalidad, residencia fiscal (`nat`, `res`, `resAR`, `natAR`), `resident` y `mode` no se copian, porque en el mock-up disparan alertas legales (fideicomiso, tierra ribereña, seguro de obra) cuyos textos no están en `lib/legal/terminos.ts`. Tampoco las banderas "NO"/"AR" del selector.
- Tribus sugeridas y afinidad por persona (`fit` del mock-up): es la It.2.
- Pasaporte, pactos, panel y vista Franz por persona.
- Selector en el encabezado global (en el mock-up está ahí); ver preguntas abiertas.

## Capabilities

### New Capabilities
- `personas-ejemplo`: elegir una persona de ejemplo y recorrer la entrevista con sus respuestas.

### Modified Capabilities

## Impact

Código nuevo en `lib/personas/` y `components/selector-persona.tsx`; cambios en `app/page.tsx`, `app/perfil/entrevista.tsx` y `lib/perfil/propuesta.ts`; `e2e/recorrido-demo.spec.ts`. **Depende de** `perfil-entrevista` en `main` y conviene después de `portada-caminos` (usa el camino "Encontrar mi tribu"). Sin dependencias npm nuevas.
