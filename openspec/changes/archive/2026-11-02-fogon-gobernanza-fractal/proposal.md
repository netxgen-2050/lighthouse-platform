# Proposal

## Why

Gus quiere que el Fogón muestre cómo se gobierna de verdad el Lighthouse: **holocrático y fractal** (consultoría del 23-oct-2026 con Bertrand). Las personas participan en **círculos** dentro de su tribu (por ejemplo marketing, cuidado de la tierra, arquitectura); las **12 tribus** deciden lo suyo; y **Lighthouse, el común**, funciona como meta-comunidad. La validación también es en capas: **el común valida a las tribus y las tribus validan a las personas**. Lo que una tribu no puede resolver sola (por ejemplo, pedir fondos del común) **sube a un consejo con un representante por tribu**, como el consejo de regiones de Celo, donde cada región vota primero adentro y después lleva la propuesta al consejo global. Hoy el Fogón es una lista plana de decisiones con tres ámbitos y no muestra esa estructura.

## What Changes

- **Página nueva `/fogon/gobernanza` ("Cómo decidimos")** con el gráfico de la estructura:
  - Lighthouse (el común) en el centro; alrededor, las 12 tribus con su estado (activa, en formación, busca tribu); dentro de cada tribu, sus círculos;
  - el consejo con un lugar por tribu validada por el común (las tribus que buscan tribu no tienen lugar todavía);
  - flechas o marcas de "quién valida a quién" (común → tribu → persona) y de "qué sube" (tribu → consejo);
  - el mismo contenido como lista anidada accesible (teclado y lector de pantalla), no solo como dibujo.
- **Círculos de ejemplo por tribu** (datos en el repo): cada tribu activa o en formación trae 2 a 4 círculos de ejemplo (por ejemplo "Cuidado de la tierra", "Arquitectura", "Comunicación"); las áreas que ya tiene Fundación Avelan Kerum se usan como sus círculos.
- **Círculos transversales (enmienda del 23-oct-2026, feedback de una usuaria):** un círculo puede abarcar varias tribus o no estar atado a ninguna zona del territorio, para el trabajo que cruza todo el proyecto (por ejemplo "Agua del Lighthouse" o "Comunicación del común"). En el gráfico cuelga del común y muestra qué tribus participan. Datos de ejemplo: un círculo transversal con personas de dos tribus.
- **Ámbitos nuevos en el Fogón:** el filtro pasa a "Todas", "Círculo", "Tribu", "Lighthouse (el común)", "Consejo" y "Fideicomiso". Vuelven las dos decisiones de ejemplo que `fogon-limpieza` sacó de la asamblea, ahora en el ámbito del común, y se suma una decisión de ejemplo de círculo y una de consejo ("Pedido de Valle Solar al Fondo Común para la bomba solar", que viene votado por la tribu).
- **"Llevar al consejo" (simulado):** en una decisión de tribu ya aprobada que pide algo al común, quien lidera la tribu ve "Llevar al consejo"; la decisión aparece en el ámbito Consejo con la marca "Viene de Valle Solar (aprobada en la tribu)". Solo en el navegador.
- **Validaciones visibles (simulado):**
  - en la ficha de cada tribu, "Validada por el común" o "Todavía no validada por el común";
  - en "Mi recorrido" / pasaporte, las tribus que validaron a la persona (lo que ya existe como membresía aceptada, mostrado como validación).
- **Preparado para attestations (ADR-012, en preparación):** cada validación y cada "llevar al consejo" se guardan con la forma de una attestation (quién afirma, sobre quién o qué, a qué registro apunta, cuándo, revocado o no), en el navegador. No hay blockchain, wallets ni firmas en este cambio.
- Textos por los diccionarios es/en (ADR-004). Términos con peso legal (consejo, representante, validación del común) con ⚖ y `borrador: true`.

**Fuera de alcance:**
- Base de datos: todo queda en el navegador, como el resto del Fogón de decisiones. Las consultas cuadráticas en la base (`fogon-cuadratico-en-la-base`) suman el ámbito en su propia enmienda del 23-oct-2026.
- Elegir de verdad al representante de cada tribu (se muestra un nombre de ejemplo o "Sin representante elegido").
- Reglas de quórum o mayoría del consejo más allá de un texto de ejemplo; el reglamento lo define el diseño legal (B) y la tokenomics.
- Pagos reales o movimiento del Fondo Común.
- Attestations reales (EAS u otro): las decide el ADR de attestations.
- La asamblea de residentes (sacada por `fogon-limpieza`).

## Capabilities

### New Capabilities
- `gobernanza-fractal`: la estructura círculo → tribu → común → consejo, quién valida a quién y qué sube al consejo, con su página y su gráfico accesible.

### Modified Capabilities
- `fogon`: el filtro por ámbito suma Círculo, Lighthouse (el común) y Consejo, y las decisiones pueden subir de la tribu al consejo.

## Impact

`app/fogon/gobernanza/` (página y gráfico), `lib/gobernanza/` (datos de círculos, consejo, validaciones con forma de attestation y su estado en el navegador, con tests), `lib/fogon/datos.ts` y `estado.ts` (ámbitos nuevos, `EJEMPLOS_COMUN` de `fogon-limpieza`, "llevar al consejo"), `app/fogon/fogon-cliente.tsx`, la ficha de tribu (`app/tribus/[id]`) y "Mi recorrido" (marca de validación), `lib/demo/claves.ts` (clave nueva, que "Borrar todo" borra), diccionarios es/en, `lib/legal/terminos.ts`, e2e nuevos. Sin dependencias nuevas (gráfico en SVG propio, sin librería). Orden: **después de `fogon-limpieza`**.
