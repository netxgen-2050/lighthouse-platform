# Proposal

> **REEMPLAZADO por `fogon-propuestas` (28-oct-2026).** Gus no aprobó este cambio. No se implementa: queda como antecedente. Ver `openspec/changes/fogon-propuestas/proposal.md`.

## Why

Gus no confía en el voto como forma principal de decidir (llamada con UnityHub del 23-oct-2026): el problema de la gobernanza colectiva es que la gente no se escucha. Quiere que las **decisiones** del Lighthouse se tomen por **Consenso Formal** (Formal Consensus), con una **IA que facilita la escucha**: resume posiciones, muestra las preocupaciones sin resolver, devuelve lo que se dijo y marca el ruido. La IA nunca decide (la misma regla que la "Voz de la Tierra": observa, informa, pregunta y marca; deciden las personas). El **voto cuadrático no se reemplaza**: sigue siendo la herramienta para **repartir recursos, priorizar y curar** (decisión de Gus del 23-oct-2026); qué herramienta usa cada tipo de consulta se define más adelante.

## What Changes

- **Propuestas por Consenso Formal en el Fogón** (simulado, en el navegador), con sus etapas en orden:
  1. **Presentación**: quien propone explica la propuesta y por qué.
  2. **Preguntas aclaratorias**: solo preguntas para entender, sin opinar todavía.
  3. **Preocupaciones**: cada participante puede registrar una preocupación (con su razón).
  4. **Resolver o modificar**: se trabaja cada preocupación; la propuesta puede cambiar (nueva versión, la anterior queda en el historial).
  5. **Cierre**: **consenso**, **consenso con personas que se apartan** (registran su desacuerdo sin bloquear) o **bloqueo** (con su razón; la propuesta no se adopta).
- **Facilitación por IA, guionada** (como Hifa, `asistente-hifa`): en cada etapa, un panel "Facilitación" muestra resúmenes, preocupaciones abiertas, "¿lo entendí bien?" y marcas de ruido o de "fuera de tema", sacados de textos de ejemplo. Siempre dice que es una simulación y que **no decide**. No hay IA real en este cambio.
- **Quién participa según el ámbito** (`fogon-gobernanza-fractal`): círculo, tribu, el común o el consejo. Cada propuesta muestra su ámbito y quiénes pueden participar.
- **"Voz con contexto"**: cada participante muestra el contexto validado que tiene en ese ámbito (pacto activo, presencia, pertenencia a la tribu o al círculo). En este cambio **solo se muestra**: no habilita ni pondera nada. Los criterios de credibilidad son una pregunta abierta.
- **Reducción de ruido** como requisito explícito: una sola preocupación abierta por persona y por versión, preguntas y preocupaciones separadas, y la marca de "fuera de tema" de la facilitación (que la persona puede discutir).
- **Convivencia con el voto cuadrático**: el Fogón distingue dos tipos de consulta. **Propuesta (consenso)** sirve para decidir. **Reparto o prioridad (voto cuadrático)** sirve para repartir recursos, priorizar y curar, y sigue funcionando como en `fogon-cuadratico` (ADR-007). Ninguno reemplaza al otro.
- Registros de solo agregar (preocupaciones, versiones, cierres) con la forma de constancia de ADR-012, en el navegador.
- Textos por los diccionarios es/en (ADR-004). Términos con peso legal (bloqueo, consenso, apartarse) con ⚖ y `borrador: true`.

**Fuera de alcance:**
- IA real o conexión con la API de Claude. Será un cambio aparte, con su decisión de privacidad sobre qué texto de la deliberación se manda al proveedor y con qué consentimiento.
- Base de datos (todo en el navegador, como el resto del Fogón de decisiones).
- Pesos o umbrales de credibilidad ("voz con contexto" que habilita o pondera).
- Definir qué tipos de decisión van por consenso y cuáles por voto cuadrático.
- Cambios en el voto cuadrático o en `fogon-cuadratico-en-la-base`.

## Capabilities

### New Capabilities
- `fogon-consenso`: propuestas decididas por Consenso Formal con facilitación (simulada) que ayuda a escuchar, participación por ámbito, voz con contexto visible, reducción de ruido y convivencia con el voto cuadrático.

### Modified Capabilities

## Impact

`app/fogon/propuestas/` (lista y detalle con etapas), `lib/fogon/consenso/` (modelo de etapas, registros de solo agregar, guion de facilitación, con tests), `app/fogon/fogon-cliente.tsx` (tipo de consulta), `lib/demo/claves.ts` (clave nueva que "Borrar todo" borra), diccionarios es/en, `lib/legal/terminos.ts`, e2e. Sin dependencias nuevas. Orden: **después de `fogon-gobernanza-fractal`** (usa sus ámbitos).
