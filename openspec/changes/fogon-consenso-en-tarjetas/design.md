# Design

## Context

- **`dev` al 2-nov-2026:** la tarjeta vive en `app/fogon/fogon-cliente.tsx`, con filtros por ámbito, ámbito Fideicomiso y la puerta `voto-fideicomiso`. La página de la propuesta es de solo lectura (`derivarEstado(p, [], ahora, …)`).
- **PRs abiertos:** `agente/fogon-portada-holarquia` (#150, #151) parte la tarjeta en `tarjeta-decision.tsx`, `usar-fogon.ts` y `propuestas-del-holon.tsx`, saca el Fideicomiso y agrega la recomendación con opciones. `agente/fogon-desde-mi-y-guardian` (#152) agrega `respuestas` en los desafíos, `desafiosSinRespuesta` en `fases.ts` y `influencia-fondo-comun`. En esa rama **todavía no existen** `lib/fogon/propuestas/mias.ts` ni "Tus propuestas" (sus tareas 3.1 y 3.2 están sin hacer).
- **Decisiones con propuesta de ejemplo:** `consejo-bomba`, `regalia`, `siembra`, `cisterna-compartida` y `huerta`. **Sin propuesta:** `facilitador`, `cisterna`, `bomba`, `animales`, el presupuesto y las copias llevadas al consejo.

## Goals / Non-Goals

**Goals:**
- Que ninguna superficie de decisiones del Fogón hable de votos.
- Que la tarjeta y la página de la propuesta digan lo mismo, porque salen de la misma derivación.
- Dejar corregida la spec del Pase Fundador.

**Non-Goals:**
- Nuevos mecanismos, nuevas propuestas de ejemplo o acciones nuevas en la propuesta.

## Decisions

### 1. Sobre qué se implementa
Primer paso de la implementación: `git grep -l "desafiosSinRespuesta" origin/dev -- lib/fogon/propuestas/fases.ts`.

- **Camino A (hay resultado):** `fogon-desde-mi-y-guardian` ya está en `dev`. Se hace todo como dice este documento.
- **Camino B (sin resultado):** se parte igual de `dev`, como pidió Gus, sin rehacer lo que traen los PRs abiertos:
  - La tarjeta es el `<li>` de `fogon-cliente.tsx`. No hay lista adyacente: sus escenarios quedan sin correr y se reportan.
  - Los desafíos dicen "Desafíos del Guardián: sin dato", porque en `dev` no hay registro de respuestas. No se inventa el número.
  - Los filtros, el ámbito Fideicomiso y el presupuesto de obra siguen visibles hasta que entre la portada, ya sin votos. Se borran `pase.con`, `pase.sin`, `verPase` y la lectura de la puerta en el Fogón.
  - El renombre de la puerta y del ⚖ queda para #152. Acá solo se aplica el delta de la spec.
  - **Costo:** #150 y #152 van a chocar con este cambio en `fogon-cliente.tsx`, `datos.ts`, `estado.ts` y los e2e, y la tarjeta se va a tener que rehacer sobre `tarjeta-decision.tsx`. Por eso conviene integrar esos PRs antes (pregunta abierta).
  <!-- arquitecto: lo que el camino B deja sin cumplir, para que el PR no parezca completo. -->
  - **Lo que el camino B deja sin cumplir:** el delta describe el camino A. En B quedan sin correr, y el PR los lista uno por uno: "Sin fideicomiso ni asamblea de residentes", "Propuestas del holón al lado de la holarquía", "El Fogón recomienda a los órganos legales", "Tus propuestas en la lente Desde mí", "Influencia en el Fondo Común" y "Texto en Sumarte y ⚖"; y en "Propuesta en resolución", la línea de 1 desafío (en B dice "sin dato"). Además, Pasaporte y Sumarte siguen prometiendo "Voto en el Fideicomiso" cuando el Fogón ya no tiene dónde votar. **B no se archiva ni se entrega a `main`** hasta que #150 y #152 estén en `dev` y esos escenarios corran.

### 2. El resumen es una función pura
`resumenConsenso(propuesta, estado)` en `lib/fogon/propuestas/resumen.ts`, sin React, sin sesión y sin leer el reloj. Recibe el `EstadoPropuesta` ya derivado:

```ts
type ResumenConsenso = {
  fase: Fase;
  resultado: Resultado | null;
  concerns: { abiertos: number; agrupados: number; grupos: number; bloqueos: number };
  acuses: { firmaron: number; ambito: number | null };
  quorum: { minimo: number | null; participaron: number; falta: number | null };
  urgencia: { estado: EstadoUrgencia; faltan: number } | null;
  /** null = sin dato (camino B). No cerrada y sin desafíos pendientes = 0: la línea no se muestra. */
  desafiosSinResponder: number | null;
};
```

- **Concerns abiertos:** los que cumplen `concernAbierto` (la función única de `reglas.ts`), así que los que discuten la urgencia no cuentan: no son oposición a la propuesta. `agrupados` son los abiertos con `grupoId`; `grupos`, los grupos con al menos un abierto. <!-- arquitecto: un bloqueo sobre la urgencia tampoco es oposición (`oposicion` en estado.ts). --> `bloqueos` son los que tienen estado `bloqueo` y no discuten la urgencia (`!sobreUrgencia`).
- **Acuses y quórum se muestran por separado**, porque no miden lo mismo: el quórum cuenta toda la participación (escribir en la discusión o firmar), no solo los acuses.
<!-- arquitecto: una sola fuente para no contar dos veces; `estado.acuses` trae también versiones viejas y otros niveles. -->
- **`acuses.firmaron` y `quorum.participaron`** salen de `estado.participacion` (`acuses` y `cuenta`), no de contar `estado.acuses`, que incluye versiones viejas y otros niveles.
- **Ámbito:** `estado.tamanoAmbito`; en el consejo sale de la lista del board. Si es `null`, ámbito y quórum dicen "sin dato", nunca 0.
- **Un 0 real se muestra como 0:** "0 de 7" es un dato. "Sin dato" es solo lo que no se sabe.
- **Cerrada:** muestra el resultado y omite los desafíos, que ya no se pueden responder.

La derivación es la de la página: `derivarEstado(p, [], ahora, { aplicaAmbitoConsejo })`, con `ahora` leído después de montar y `aplicaAmbitoConsejo` = sesión de super admin. Cuando la página empiece a leer registros del navegador, la tarjeta tiene que pasar los mismos.

`textoResultado`, que hoy es una función interna de `propuesta-cliente.tsx`, se extrae para que la usen los dos lugares.

### 3. El componente
`components/fogon/estado-consenso.tsx` tiene dos partes: `EstadoConsensoVista`, que recibe el resumen (la usa la página de la propuesta, que ya tiene el estado), y `EstadoConsensoDe({ decisionId })`, que lo calcula (la usan la tarjeta y el panel).

Usa un `<dl>` con título "Estado del consenso", una línea por dato. Todo está en texto. La barra es un refuerzo con `aria-hidden`: largo = tamaño del ámbito, tramo fuerte = acuses, tramo suave = participación sin acuse, marca = quórum. No se dibuja si el ámbito es "sin dato". Solo tokens del tema. <!-- arquitecto: las afectadas cuentan y no son del ámbito, así que la participación puede superar el tamaño. --> Las personas afectadas cuentan y no son del ámbito, así que la participación puede superar su tamaño: la barra se recorta al 100 % y el texto sigue diciendo el número real.

| Clave | es | en |
|---|---|---|
| titulo | Estado del consenso | Consensus status |
| fase | Fase: {fase} | Phase: {fase} |
| concerns | Concerns: {n} abiertos ({m} agrupados en {g} grupos) | Concerns: {n} open ({m} grouped in {g} groups) |
| concernsNinguno | Concerns: ninguno abierto | Concerns: none open |
| bloqueos | {n} bloqueos | {n} blocks |
| acuses | Acuses firmados: {n} de {t} del ámbito | Signed acknowledgments: {n} of {t} in the scope |
| acusesSinAmbito | Acuses firmados: {n}. Ámbito: sin dato | Signed acknowledgments: {n}. Scope: no data |
| quorum | Quórum: {m} personas. Participaron {p}: falta {f} | Quorum: {m} people. {p} took part: {f} missing |
| quorumOk | Quórum: {m} personas. Participaron {p}: se alcanzó | Quorum: {m} people. {p} took part: reached |
| quorumSinDato | Quórum: sin dato. Participaron {p} | Quorum: no data. {p} took part |
| desafios | Desafíos del Guardián sin responder: {n} | Guardian challenges unanswered: {n} |
| desafiosSinDato | Desafíos del Guardián: sin dato | Guardian challenges: no data |
| sinPropuesta | Estado del consenso: sin dato. Esta decisión de ejemplo todavía no tiene propuesta. | Consensus status: no data. This sample decision has no proposal yet. |
| sinCuenta | Para ver el estado del consenso, abrí una cuenta. | To see the consensus status, open an account. |

La urgencia reusa los textos de `t.urgencia`, y la fase y el resultado, los de `t.fases.nombres` y `t.resultado`. Con singular y plural correctos en los dos idiomas.

### 4. Quién ve qué
- **Sin cuenta** (`estado === "sin-sesion"`): no se calcula el estado; se muestra `sinCuenta` con enlace a `/sumarte`, por la regla A2 de `fogon-propuestas`. Mientras la sesión carga, nada. El título de la tarjeta se sigue viendo como hoy.
- **Con cuenta, cualquier nivel:** solo cantidades. Ni nombres, ni razones, ni nombres de grupos, porque el nivel "red" lee la propuesta pero no la discusión. Es un criterio derivado de A2 y A3: lo mira el arquitecto.
<!-- arquitecto: corregido contra el código; el hallazgo original no ocurre. -->
- **Hoy nadie sin cuenta llega a esta tarjeta:** `/fogon` y todo lo que cuelga de esa ruta piden nivel Miembro (`PARTICIPAR` en `lib/permisos/niveles.ts`), no están en `RUTAS_PUBLICAS`, y `Puerta` manda a `/sumarte` a quien no tiene sesión o no alcanza el nivel. Por eso una persona sin cuenta tampoco puede tocar "Abrir la propuesta", y A2 se cumple; la página arranca en `red` solo porque ya pasó la puerta. La rama `sinCuenta` del componente queda como defensa por si la ruta se abre más adelante, y se prueba con un test de componente: en un e2e sin sesión se ve Sumarte, no la tarjeta.
- **Ocultar no es proteger (ADR-015):** hoy alcanza porque todo son datos de ejemplo que viajan en el bundle. Cuando las propuestas pasen a la base, el resumen lo arma el servidor con el nivel verificado y al navegador llegan solo las cantidades (ADR-028).

### 5. Sacar el voto
- `datos.ts`: salen `votos`, `requisito`, `Opcion`, `Requisito`, `OPCIONES` y `opciones()`. Quedan `regla`, `base`, `destino` y `holonId`.
- `estado.ts`: salen `votar`, `contar`, `votoPropio`, `motivoSinVoto`, `MotivoSinVoto`, `votos` y `residencia`. `EstadoFogon` queda con `alConsejo`; `Condicion`, con `adhirio` y `lidera`.
<!-- arquitecto: se conserva la regla vigente de `persona`; lo de esas personas de ejemplo nunca fue de quien mira. -->
- `leer` ignora `votos` de lo guardado sin error y conserva `alConsejo`, y el próximo guardado ya no los escribe. Un formato con `persona` sigue dando `INICIAL`, como hoy (`estado.ts`, y sus tests siguen valiendo salvo por el campo `votos`): era de personas de ejemplo, no de quien mira. Sin migración: eran simulados y del navegador.
- `usar-fogon.ts`: salen `abierta`, `elegir` y la lectura de residencia. Queda `llevar` con su anuncio y su foco.
- La tarjeta queda: título, lugar, regla con ⚖, destino, origen, parámetros, estado del consenso, "Abrir la propuesta" y "Llevar al consejo".
- **Órgano legal:** el presupuesto sigue diciendo "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación", sin opciones. Como no tiene propuesta, dice `sinPropuesta`. Cómo se arma esa recomendación queda para cuando tenga propuesta.
- **Textos con voto** que cambian: la introducción de `/fogon`, `votanRepresentantes` (sale) y los ⚖ `adhesiongobernanza` ("Para participar en una propuesta, repartir créditos o llevar una decisión al consejo…"), `destinoconsejofundacion` ("Lo que se acuerda acá es una recomendación…") y `consejo` ("cómo decide el consejo…"), los tres en es y en, y marcados `borrador: true`.
<!-- arquitecto: textos que hablan de votar y no estaban en el inventario; `git grep` en dev. -->
- **Otros textos con voto, también en es y en:** `votan` de `lib/idioma/textos/gobernanza.ts` (se muestra en `app/fogon/gobernanza/panel-nodo.tsx`: "En la versión real votan los representantes"), que sale, y `errorAlmacenamiento` de `lib/idioma/textos/fogon.ts` ("el voto no se puede guardar"), que pasa a hablar de "lo que llevaste al consejo". El ⚖ `art35` y la regla "2/3 de los votos" vienen del mock-up y del reglamento: no se tocan acá (pregunta abierta).

### 6. Aviso de adhesión
Sin voto, la mayoría de las tarjetas no tiene ninguna acción, y repetir el aviso en cada una sería ruido. `AvisoAdhesion` se muestra una vez, arriba de la sección de propuestas (arriba de la lista en el camino B), con la misma regla única (`useParticipacion`) y el mismo texto si la versión está desactualizada.

### 7. Tus propuestas
La categoría `sugerir-o-votar` pasa a `aportar`: "Podés aportar" / "You can contribute", con la acción "Aportar a la discusión" / "Join the discussion". Una decisión sin propuesta siempre va a "Las seguís". Si `mias.ts` todavía no existe, esta parte la toma quien implemente las tareas 3.1 y 3.2 de `fogon-desde-mi-y-guardian`, leyendo el delta de este cambio.

### 8. Consultas
| Lugar | es | en |
|---|---|---|
| Etiqueta, `modo: prioridades` | Consulta para priorizar | Consultation to prioritize |
| Etiqueta, `modo: presupuesto` | Consulta para repartir | Consultation to split |
| Nota fija | No es una decisión: orienta a quien decide. | Not a decision: it guides whoever decides. |
| `h1` de `/fogon/consultas` | Consultas para priorizar o repartir | Consultations to prioritize or split |
| Sobretítulo | Fogón · consultas | Fireside · consultations |
| "Otras herramientas" en `/fogon` | Consultas para priorizar o repartir: no son decisiones, orientan a quien decide. | Consultations to prioritize or split: they are not decisions, they guide whoever decides. |
| Descripción de U1 | Ordenar qué importa más cuando hay que elegir. El resultado alimenta la Decisión A del modelo híbrido, que se toma aparte. | Rank what matters most when a choice has to be made. The result feeds Decision A of the hybrid model, which is made separately. |

La introducción de `/fogon/consultas` y la página de cada consulta siguen explicando el reparto cuadrático: ahí sí corresponde nombrarlo. La fila "Otras herramientas" ya no lo nombra.

### 9. Pase Fundador
El delta reemplaza la voz y la cámara de fundadores por "Influencia en el Fondo Común". El renombre de código lo hace #152; acá se limpia lo que deja: la clave `t.fundador.fideicomiso` y un comentario. Las pruebas negativas ("no hay ámbito Fideicomiso", "No es un voto en ningún fideicomiso") se quedan a propósito.

## Risks / Trade-offs

- [Choque con #150 y #152 si se implementa antes] → design §1; recomendación y pregunta abierta para Gus.
- [Las propuestas de ejemplo vencen] → con el reloj real, la huerta venció el 31-oct y las otras vencen entre el 2 y el 4-nov. Desde entonces todas las tarjetas con propuesta van a decir "Cierre". Los e2e fijan el reloj en 2026-10-30; la demo real necesita una decisión (pregunta abierta). <!-- arquitecto: calculado con derivarEstado al 10-nov. --> Calculado al 10-nov: cuatro de las cinco dicen "pausada" y solo la siembra cerró por consenso, así que el Fogón se ve detenido justo en la pantalla que este cambio pone al frente.
<!-- arquitecto: la tarjeta junta dos fechas que hoy no se ven lado a lado. -->
- [La tarjeta se contradice con su plazo] → `ParametrosDecision` sigue en la tarjeta con `plazo.cierra`: la bomba dice "Cierra el: 15 de noviembre" (lo fija `e2e/fogon.spec.ts:343`) y su propuesta vence el 2-nov; la regalía dice 1-dic y vence el 3-nov. Con el bloque nuevo, la misma tarjeta muestra "Fase: Cierre" y un cierre futuro. Se resuelve junto con las fechas de ejemplo (pregunta abierta), no por separado.
- [En una decisión del común, la participación puede dar 0] → `pasada` solo cuenta los niveles `ambito` y `afectada`, y en el común se participa con nivel `comun`: la regalía dice "Participaron 0" con dos personas que escribieron, y su quórum no se alcanza nunca. La tarjeta lo deja a la vista. No se cambia acá: es una regla de `fogon-propuestas` (pregunta abierta). <!-- arquitecto: es un cero falso y la regla del repo lo prohíbe; ajuste listo en tasks 1.4 si Gus lo aprueba. --> Es un cero que no es cierto, y el bloque lo lleva a la portada del Fogón. La tarea 1.4 lo corrige si Gus lo aprueba.
- [Se pierde el "voto" guardado en el navegador] → eran simulados; se descartan sin aviso.
- [El presupuesto del Fondo Común se queda sin forma de recomendar] → es consecuencia directa de sacar el voto de todas las decisiones; se ve como `sinPropuesta`.
- ["Influencia… (próximamente)" figura como "Abierta" en el Pasaporte] → lo trae #152; se anota, no se cambia acá.
- [Archivar] → este delta modifica requisitos de cambios sin archivar. Antes de archivarlo hay que archivar `fogon-decisiones`, `fogon-limpieza`, `fogon-gobernanza-fractal`, `pase-fundador-gobernanza`, `manifiesto-lighthouse-vrn`, `idioma-fogon-mercado`, `fogon-cuadratico`, `fogon-propuestas`, `fogon-portada-holarquia` y `fogon-desde-mi-y-guardian`.

## Migration Plan

Sin datos en servidor. `lh-fogon` se lee con tolerancia al formato viejo. Volver atrás es revertir el PR: los votos descartados no vuelven, y eran de ejemplo.
