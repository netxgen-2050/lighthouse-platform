# Proposal

## Why

Al revisar el PR #144 en Railway (30-oct-2026), Gus vio que el Fogón tiene dos mundos separados: `/fogon` es una lista de decisiones con filtros por ámbito (Todas, Círculo, Tribu, Lighthouse, Consejo, Fideicomiso) y la holarquía vive aparte en `/fogon/gobernanza`. Pero el alcance de una decisión **es** un lugar de la holarquía: los filtros repiten con botones lo que la holarquía ya muestra con zoom. Además, muchos círculos aparecen **sin nombre** en el dibujo, y la página de una propuesta se abre "suelta", sin decir en qué círculo se decide ni cómo volver al lugar donde estaba la persona. Este cambio hace de la holarquía la portada del Fogón y pone las propuestas al lado, según el holón que se navega.

## What Changes

- **Dependencia:** se apila sobre lo que trae el PR #144 (`fogon-propuestas` y `manifiesto-lighthouse-vrn`), además de `fogon-gobernanza-holarquia` que ya está en `dev`. La implementación parte de `dev` **con el PR #144 integrado**; si no está, frenar y reportar.
- **`/fogon` abre con "Cómo decidimos"** (la holarquía con zoom, migas, lentes, panel, leyenda y lista accesible de `fogon-gobernanza-holarquia`, sin cambiar su comportamiento). `/fogon/gobernanza` pasa a redirigir a `/fogon`, conservando el holón y la lente.
- **Propuestas al lado de la holarquía**: una sección "Propuestas en {holón}" adyacente al dibujo (a la derecha en pantallas anchas, debajo del dibujo en 390 px) que lista las decisiones de ejemplo del holón enfocado, en dos grupos: **"Se decide acá"** y **"Nace o pasa por acá"** (las que suben o se derivan cruzando ese holón, según su camino de ejemplo). Un botón **"Ver también lo de los círculos de adentro"** (con `aria-expanded` y la cantidad), **cerrado por defecto en todos los holones** (Gus, 1-nov), agrega las de los holones de adentro, cada una con su lugar. Se reusa la tarjeta de decisión de hoy: votar, "Llevar al consejo", parámetros y "Abrir la propuesta" siguen igual.
- **Lente "Desde mí" con tus propuestas al lado** (Gus, 1-nov): con esa lente, la sección adyacente pasa a ser "Tus propuestas": las decisiones donde la persona participa (sus círculos y tribus, el común si adhirió, y donde se declaró afectada), en cualquier holón, **ordenadas por lo que necesita su acción**: firmar el acuse, responder (un concern suyo con resolución en juego; el desafío del Guardián cuando exista), sugerir o votar, y al final las que solo sigue.
- **BREAKING (de pantalla):** se **sacan los filtros por ámbito** de `/fogon`. La persona elige el alcance navegando la holarquía (dibujo, migas o lista).
- **Cada decisión de ejemplo tiene su holón** (`holonId`): un dato en `lib/fogon/datos.ts`, coherente con el `holonId` de su propuesta. Todas están en la holarquía.
- **Sin ámbito "fideicomiso" en el Fogón** (Gus, 1-nov): en el diseño legal B (NS_Tokenomics, doc 25 §6) no hay un fideicomiso único con asamblea por persona; las asambleas de cada serie votan por capital y fuera de la plataforma. El Fogón es el espacio **consultivo** del procomún. Se saca `fideicomiso` de `Ambito`, el requisito `pase` del voto y el grupo aparte. El "Presupuesto de obra 2027 del macrolote" se reubica como **"Presupuesto 2027 del Fondo Común"**, una decisión del común con **destino**: "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación" (⚖ nuevo, borrador). Toda decisión que la toma un órgano legal muestra ese destino.
- **Pase Fundador: influencia en el Fondo Común** (Gus, 1-nov): deja de dar "voto en el Fideicomiso". La puerta `voto-fideicomiso` pasa a `influencia-fondo-comun` con la etiqueta "Influencia en el Fondo Común (próximamente: conviction voting)" en Pasaporte, Sumarte y la tabla de puertas, y su ⚖ se reescribe (borrador). El conviction voting **no** se construye.
- **El Guardián (IA) defiende la Voz de la Tierra; nadie que no sea persona pausa ni decide** (Gus, 1-nov): su ⚖ y sus textos lo presentan como quien desafía lo que dañe la tierra, el agua o la vida, sin pausar, frenar ni decidir. Cómo "da batalla" sin bloquear queda **propuesto en el design, a definir por Gus**, y no se construye en este cambio.
- **El lugar en la holarquía vive en la dirección** (`/fogon?holon=valle-0&lente=decisiones`): se puede compartir, recargar y volver sin perderlo. Un holón que no existe vuelve al común sin romper nada.
- **La propuesta se abre en el contexto del holón**: "Abrir la propuesta" lleva a `/fogon/propuestas/<id>?desde=<holón>`. La página muestra las migas del holón donde se decide (**Lighthouse VRN › tribu › círculo › propuesta**, cada miga lleva a ese holón en `/fogon`), una tarjeta corta "Dónde se decide" (tipo de holón, "Decide sobre" y camino de ejemplo si existe) y un enlace "Volver a {holón}" que devuelve al holón y la lente de donde vino la persona.
- **Todo círculo con nombre**: en la lista, en el panel, en la lista adyacente y en las migas siempre se ve el nombre completo. En el dibujo se rotulan también los círculos del nivel de adentro cuando hay lugar, con un **nombre corto** de datos cuando el completo no entra (nunca "…"); al pasar el mouse cada círculo muestra su nombre completo. Se revisan los datos de ejemplo para que ningún círculo, tribu ni lugar quede sin nombre legible en es y en.
- **Entradas reubicadas**: las consultas cuadráticas (`/fogon/consultas`) y el simulador (ya en `/netx/simulador`) quedan como una fila de "Otras herramientas" debajo de la holarquía; las páginas no cambian. Los enlaces que hoy apuntan a `/fogon/gobernanza` (ficha del común, lente Decisiones, e2e) pasan a `/fogon`.
- **Adhesión automática a Lighthouse VRN**: adherir al manifiesto de Lighthouse VRN deja a la persona como **miembro** al instante, sin pedido ni aceptación simulada de nadie; una adhesión guardada como "pedido" se lee como miembro. Las tribus siguen con pedido y aceptación. El aval con constancias EAS (backlog D37) solo se **anota** como costura en el código, sin diseño.
- Textos por los diccionarios es/en (ADR-004). Accesible con teclado, auditoría de axe en verde, 390 px sin scroll horizontal, registro extensible de lentes sin cambios.
- **Tres noches**, con cortes (ver tasks): 1) portada, lista adyacente, holón en la dirección, filtros y fideicomiso fuera, redirección; 2) propuesta en contexto, nombres de los círculos, adhesión automática; 3) "Tus propuestas" en la lente Desde mí, Pase Fundador, textos del Guardián y e2e de accesibilidad.

**Fuera de alcance:**
- Cambiar las lentes, el zoom, los roles o el panel de detalle de la holarquía (se reusan tal cual).
- Cambiar las fases, la discusión, los permisos o el selector "Mirá la propuesta como…" de `fogon-propuestas`; solo cambian su cabecera (migas, "Dónde se decide", volver) y la dirección del enlace de entrada.
- Cambiar las consultas cuadráticas o el simulador: solo se mueve el lugar de sus enlaces.
- Crear propuestas o decisiones nuevas desde la pantalla, o sumar decisiones de ejemplo nuevas.
- Un índice de todas las propuestas del Lighthouse en una lista larga (el común con "Ver también lo de los círculos de adentro" cumple ese papel).
- El sistema de aval ("vouching") con constancias EAS para la adhesión (backlog D37): solo una nota en el código; necesita base de datos y su propia spec.
- Aceptación o rechazo de la adhesión a una tribu: sigue como hoy (simulada).
- Base de datos, pedidos de red o firmas reales: todo sigue en el navegador.
- Fogón con muchas tribus reales (backlog D5): este cambio ayuda, pero no lo cierra.
- Consenso Formal (`fogon-consenso-formal`), que Gus no aprobó.
- El conviction voting del Fondo Común y cualquier cámara o voto del Pase Fundador: solo cambia la etiqueta y el ⚖.
- El mecanismo para que el Guardián "dé batalla" (desafío destacado y respuesta por escrito): queda propuesto en el design, a definir por Gus, en un cambio propio.
- Un veto suspensivo de la Voz de la Tierra: el diseño legal B lo tiene y la plataforma no (diferencia anotada para revisar con NS_Tokenomics).
- Las asambleas de las series y el Consejo de la Fundación como pantallas: el Fogón solo dice a quién le lleva la recomendación.
- Actualizar la spec de `pase-fundador-gobernanza` (queda desactualizada en el voto en el Fideicomiso; ver design §8).

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `fogon`: `/fogon` deja de ser una lista con filtros por ámbito y pasa a ser la holarquía con las propuestas del holón al lado; cada decisión tiene su holón; sin ámbito fideicomiso y con el destino de lo que decide un órgano legal; "Tus propuestas" con la lente Desde mí; el lugar vive en la dirección; entradas a consultas y simulador reubicadas.
- `gobernanza-fractal`: la holarquía se muestra en `/fogon` (y `/fogon/gobernanza` redirige); todo círculo muestra su nombre o su nombre corto cuando hay lugar, y siempre el completo en la lista y el panel.
- `fogon-propuestas`: la propuesta se abre en el contexto de su holón (migas de la holarquía, "Dónde se decide", volver al holón de origen); el Guardián se presenta como defensor de la Voz de la Tierra y ningún agente pausa ni decide.
- `gobernanza-adhesion` (creada por `manifiesto-lighthouse-vrn`): la adhesión a Lighthouse VRN es automática (miembro al adherir); la costura para el aval con EAS queda anotada.

## Impact

- Se toca: `app/fogon/page.tsx` y `fogon-cliente.tsx` (se parte en `tarjeta-decision.tsx` y `propuestas-del-holon.tsx`; se sacan los filtros), `app/fogon/gobernanza/page.tsx` (redirección), `holarquia-cliente.tsx` (holón y lente desde y hacia la dirección; ranura para la lista adyacente), `dibujo.tsx` (rótulos del nivel de adentro, nombre corto, `<title>`), `lib/gobernanza/datos.ts` y `tipos.ts` (`nombreCorto`), `lib/gobernanza/zoom.ts` (elegir rótulo), `lib/fogon/datos.ts` y `estado.ts` (`holonId`; `decisionesDelHolon` reemplaza a `filtrar`), `lib/fogon/propuestas/ejemplos.ts` (`holonId` de la huerta), `app/fogon/propuestas/[id]/propuesta-cliente.tsx` (cabecera en contexto), `app/fogon/gobernanza/lentes/panel-decisiones.tsx` y `app/tribus/[id]/ficha-comun.tsx` (enlaces), `lib/membresia/estado.ts`, `usar-membresia.ts` y `components/membresia-acciones.tsx` (adhesión automática a `lighthouse`), diccionarios `fogon`, `gobernanza`, `fogon-propuestas` y `tribus`, e2e `fogon.spec.ts`, `fogon-gobernanza.spec.ts`, `fogon-propuestas.spec.ts`, `manifiesto-lighthouse-vrn.spec.ts`, `membresia.spec.ts` y `accesibilidad.spec.ts`.
- También (decisiones del 1-nov): `lib/fogon/datos.ts` y `estado.ts` (sin `fideicomiso` ni requisito `pase`; `destino`), `lib/fogon/propuestas/mias.ts` (nuevo, puro: tus propuestas y su orden), `app/fogon/gobernanza/lentes/panel-desde-mi.tsx` o la sección adyacente, `lib/permisos/tipos.ts`, `tabla.ts`, `niveles.ts` y `lib/canales/puertas.ts` (`voto-fideicomiso` → `influencia-fondo-comun`), diccionarios `pasaporte` y `sumarte`, `app/sumarte/sumarte-cliente.tsx`, `lib/legal/terminos.ts` (`gobernanzafideicomiso` → `influenciafondocomun`, `destinoconsejofundacion` y `guardianIA`, todos borrador), guion del Guardián en `lib/fogon/propuestas/ejemplos.ts`, e2e de `pase-fundador` y `sumarte` si nombran el voto en el Fideicomiso.
- Sin dependencias nuevas, sin tablas, sin pedidos de red, sin integraciones externas.
- Toca **la regla de participación** (quién queda como miembro de Lighthouse VRN), la membresía guardada en el navegador y **una puerta de permisos** (la del Pase Fundador): pide revisión del agente `arquitecto`.
