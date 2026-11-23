# Proposal

## Why

Deuda señalada por Gus el 2-nov-2026: en Formal Consensus no se vota, pero las tarjetas de decisiones del Fogón todavía muestran "Votar" y "Votos de ejemplo: A favor · En contra · Abstención", una herencia de `fogon-decisiones` de principios de octubre. La tarjeta dice una cosa y la página de la propuesta (`fogon-propuestas`), otra. Además queda la deuda 6: la spec de `pase-fundador-gobernanza` todavía promete un "voto en el Fogón Fideicomiso" que ya no existe. En `openspec/specs/` no hay ninguna spec que la haya absorbido: la vigente sigue siendo la del cambio `pase-fundador-gobernanza`.

## What Changes

- **Ninguna decisión del Fogón se vota.** Salen el botón "Votar", "Cambiar voto", el conteo "Votos de ejemplo", "Tu voto", la recomendación con opciones de `fogon-portada-holarquia` y el modelo que los sostiene (`votos` en cada decisión, opciones, `votar`, `contar`, requisito de residencia).
- **Estado del consenso en su lugar**, en la lista adyacente a la holarquía, en el panel de la lente Decisiones y en la página de la propuesta, con los datos de `fogon-propuestas`: fase actual (y resultado si cerró), concerns abiertos y agrupados, acuses firmados sobre el tamaño del ámbito con el quórum marcado, la urgencia si la hay y los desafíos del Guardián sin responder. Sale de la misma derivación que usa la página, así que los dos lugares dicen lo mismo. Lo que no se sabe dice "sin dato", nunca 0.
- **"Abrir la propuesta"** sigue siendo la acción de la tarjeta. Una decisión sin propuesta de ejemplo dice "Estado del consenso: sin dato" y no ofrece el enlace.
- **Sin cuenta no se ve el estado** (regla A2 de `fogon-propuestas`): la tarjeta invita a abrir una cuenta. Con cuenta se ven solo cantidades, sin nombres ni razones de concerns.
- **"Llevar al consejo" sigue igual**, con la adhesión como requisito. Como cada tarjeta ya no tiene una acción de voto, el aviso de adhesión se muestra una vez por sección, no en cada tarjeta.
- **Consultas U1–U4: siguen, y se presentan como consultas para priorizar o repartir, no como decisiones**: una etiqueta en cada tarjeta, el título y la introducción de `/fogon/consultas`, la página de cada consulta y la fila "Otras herramientas" de `/fogon`. La descripción de U1 deja de decir que es la "Decisión A".
- **Mecanismos de votación:** en la portada y en las decisiones del Fogón no se nombran. Aparecen solo cuando alguien o Hifa los sugiere en una propuesta (`fogon-propuestas`, D2) y en las páginas de las consultas, que explican cómo se reparte.
- **Deuda 6, Pase Fundador:** un delta deja dicho que da "Influencia en el Fondo Común" (la distribución de grandes sumas, con conviction voting, más adelante) y que no hay ámbito Fideicomiso en el Fogón. El inventario de código y textos que todavía lo nombran está en `tasks.md` §5.
- Textos es/en por los diccionarios (ADR-004). Accesible con teclado y con la auditoría de axe en verde. **Una noche**, con un corte (ver tasks).

**Base del cambio.** Va apilado sobre `fogon-desde-mi-y-guardian` si ya está en `dev`; si no, sobre `dev`. El 2-nov **no está**: la portada (#150, #151) y el Guardián (#152) siguen en PRs abiertos, así que esta spec se escribió sobre `dev`. Las tareas dicen qué hacer en cada caso (design §1).

**Fuera de alcance:**
- Construir conviction voting (backlog D38), puntos o cualquier mecanismo nuevo, o votar dentro de una propuesta.
- Crear propuestas de ejemplo para las decisiones que no tienen, o crear propuestas desde la pantalla.
- Las acciones de la página de la propuesta y la lectura de registros del navegador (tareas pendientes de `fogon-propuestas`): el estado usa la misma derivación que la página hoy.
- Las consultas en sí: el reparto, el resultado, el acta y `fogon-cuadratico-en-la-base` no cambian.
- La puerta `voz-fondo-comun` ("Voz en el Fondo Común · 1 voz", Ronda 0) y la puerta `voto-asamblea-residentes`: no son decisiones del Fogón y no se tocan (pregunta abierta sobre la primera).
- Los textos del programa de fideicomisos por series, que siguen siendo correctos (`/netx`, el simulador, `lib/series`, `lib/financiamiento`, "Papeles y fideicomiso", ⚖ del diseño legal B).
- Cambiar las reglas de ejemplo de las tarjetas, como "2/3 de los votos" (pregunta abierta), y correr las fechas de las propuestas de ejemplo (pregunta abierta).
- Actualizar `NS_platform`: "voto en el Fideicomiso" sigue en la lista viva para el abogado (lo hace el documentador).
- Base de datos, pedidos de red o integraciones.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `fogon`: las decisiones no se votan; muestran el estado del consenso. Cambian la lista adyacente, los órganos legales, "Tus propuestas", "Otras herramientas" y las decisiones con su base; sale "Votación simulada".
- `fogon-propuestas`: "Abrir la propuesta" deja de nombrar el fideicomiso y la página muestra el mismo estado del consenso.
- `fogon-consultas`: se presentan como consultas para priorizar o repartir, no como decisiones.
- `pase-fundador-gobernanza`: el Pase da influencia en el Fondo Común; sale el voto en el Fideicomiso.
- `gobernanza-adhesion`: participar ya no incluye votar decisiones; el aviso va una vez por sección.
- `idioma-fogon-mercado`: el Fogón en inglés sin opciones de voto.

## Impact

- **Nuevo:** `lib/fogon/propuestas/resumen.ts` (puro, con tests) y `components/fogon/estado-consenso.tsx`.
- **Se toca:** `lib/fogon/datos.ts`, `lib/fogon/estado.ts`, la tarjeta y su estado (`app/fogon/tarjeta-decision.tsx` y `usar-fogon.ts`, o `fogon-cliente.tsx` si la portada no entró), `app/fogon/propuestas-del-holon.tsx`, `app/fogon/gobernanza/lentes/panel-decisiones.tsx`, `app/fogon/propuestas/[id]/propuesta-cliente.tsx`, `app/fogon/page.tsx`, `app/fogon/consultas/`, `lib/fogon/consultas/ejemplo.ts`, `lib/fogon/propuestas/mias.ts` si ya existe, `lib/legal/terminos.ts`, los diccionarios `fogon`, `fogon-propuestas`, `fogon-consultas` y `sumarte`, `lib/idioma/revision-nativa.ts` y los tests y e2e listados en tasks.
- **Datos del navegador:** `lh-fogon` deja de guardar `votos`; el formato viejo se lee sin error y los votos guardados se descartan. La clave sigue por "Llevar al consejo".
- **Permisos:** cambia qué ve una persona sin cuenta en la tarjeta y la spec de una puerta del Pase. Pide revisión del agente `arquitecto`, que este flujo corre en un paso aparte.
- Sin dependencias nuevas, sin tablas, sin pedidos de red, sin integraciones externas.
