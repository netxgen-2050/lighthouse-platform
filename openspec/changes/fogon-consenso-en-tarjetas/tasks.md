# Tasks

**Base (design §1):** correr `git grep -l "desafiosSinRespuesta" origin/dev -- lib/fogon/propuestas/fases.ts`. Con resultado es el **camino A** (`fogon-desde-mi-y-guardian` ya está en `dev`); sin resultado es el **camino B**: se parte igual de `dev`, sin rehacer lo de #150 y #152, y el PR avisa que va a chocar con ellos. Rama `agente/fogon-consenso-en-tarjetas`; el PR apunta a `dev`.

**Una noche.** **Corte:** si la noche termina después de la sección 2, abrir el PR como borrador con la tarjeta sin votos y reportar.

## 1. El estado del consenso

- [ ] 1.1 `lib/fogon/propuestas/resumen.ts`: `resumenConsenso` pura (design §2). Tests con el reloj en 2026-10-30T15:00Z: bomba en "resolver", 3 abiertos, 2 agrupados en 1 grupo, 0 acuses de 7, quórum 4, 5 participaron, urgencia "pedida" con 1 faltante, 1 desafío sin responder; huerta en "objetar", ninguno abierto, 2 de 4, quórum 3, falta 1; siembra cerrada por consenso, 1 de 12, quórum 6 alcanzado, sin línea de desafíos; cisterna con 0 de 7 y 1 desafío; una propuesta de prueba con `tamanoAmbito: null` da ámbito y quórum `null`, nunca 0; un concern sobre la urgencia no suma a `abiertos`. En el camino B, `desafiosSinResponder` es `null` y los tests de desafíos se ajustan a eso. Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 1.2 Extraer `textoResultado` de `propuesta-cliente.tsx` a un módulo compartido, sin cambiar lo que muestra la página. Verificar con `pnpm test lib/fogon/propuestas` y `pnpm exec tsc --noEmit`.
- [ ] 1.3 `components/fogon/estado-consenso.tsx` (design §3 y §4) y textos es/en de design §3 en `lib/idioma/textos/fogon-propuestas.ts`, con singular y plural. Test de componente: `<dl>` con cada línea en texto; barra con `aria-hidden` y sin barra si el ámbito es "sin dato"; sin sesión no calcula y muestra la invitación con enlace a `/sumarte`; cargando no muestra nada; decisión sin propuesta muestra `sinPropuesta`. Solo tokens del tema. Verificar con `pnpm test components/fogon`.

## 2. Las decisiones sin votos

- [ ] 2.1 `lib/fogon/datos.ts` y `lib/fogon/estado.ts` (design §5): sacar el voto del modelo. `leer` con formato viejo (`votos`, `persona`) no falla y conserva `alConsejo`. Actualizar `lib/fogon/fogon.test.ts`, `lib/fogon/parametros.test.ts`, `lib/gobernanza/lentes.test.ts`, `lib/gobernanza/caminos.test.ts` y `lib/gobernanza/usar-participacion.test.tsx` si los usan. Test: ninguna decisión tiene `votos`. Verificar con `pnpm test lib/fogon lib/gobernanza`.
- [ ] 2.2 Tarjeta (`app/fogon/tarjeta-decision.tsx` y `usar-fogon.ts`; en el camino B, `fogon-cliente.tsx`): sin botones, conteos, "Tu voto", acta ni recomendación; con `EstadoConsensoDe`, "Abrir la propuesta" y "Llevar al consejo". Quedan el anuncio y el foco de "Llevar al consejo". Verificar con `pnpm verificar`.
- [ ] 2.3 Aviso de adhesión una vez por sección (design §6) en `app/fogon/propuestas-del-holon.tsx`; en el camino B, arriba de la lista de `fogon-cliente.tsx`. Verificar con `pnpm verificar`.
- [ ] 2.4 `app/fogon/gobernanza/lentes/panel-decisiones.tsx`: bloque del estado junto a "Abrir la propuesta" en la decisión elegida; sin propuesta, `sinPropuesta`. `app/fogon/propuestas/[id]/propuesta-cliente.tsx`: `EstadoConsensoVista` debajo del título, solo con un nivel que no sea visita. Verificar con `pnpm verificar`.
- [ ] 2.5 Textos (design §5): sacar de `lib/idioma/textos/fogon.ts` lo que quede sin uso (`opciones`, `motivos` salvo `manifiesto`, `votar`, `cambiarVoto`, `votoAria`, `votosDeEjemplo`, `tuVoto`, `acta`, `anuncioVoto`, `votanRepresentantes` y los de recomendación; en B también `pase` y `verPase`). Reescribir la introducción de `/fogon`, es y en. ⚖ `adhesiongobernanza`, `consejo` y, en A, `destinoconsejofundacion`, en `lib/legal/terminos.ts`, con `borrador: true`. Actualizar `lib/idioma/revision-nativa.ts`. Verificar con `pnpm test lib/legal lib/idioma` y `git grep -n -E "votosDeEjemplo|recomendacionesDeEjemplo|motivoSinVoto|votoPropio|cambiarVoto|votanRepresentantes|tuRecomendacion" -- app lib e2e` sin resultados.

## 3. Tus propuestas

- [ ] 3.1 Solo si `lib/fogon/propuestas/mias.ts` existe: categoría `aportar` y decisión sin propuesta en `seguir` (design §7), con sus textos es/en y tests. Si no existe, anotarlo en el PR como pendiente de `fogon-desde-mi-y-guardian` 3.1 y 3.2. Verificar con `pnpm test lib/fogon/propuestas` o con `git ls-files lib/fogon/propuestas/mias.ts` vacío.

## 4. Consultas para priorizar o repartir

- [ ] 4.1 Textos de design §8 en `lib/idioma/textos/fogon-consultas.ts` y `lib/fogon/consultas/ejemplo.ts`; etiqueta por `modo` en `app/fogon/consultas/lista-consultas.tsx`; nota fija en `app/fogon/consultas/page.tsx` y en `app/fogon/consultas/[id]/consulta-cliente.tsx`. No cambia el reparto, el resultado ni el acta. Verificar con `pnpm test lib/fogon/consultas` y `pnpm verificar`.
- [ ] 4.2 `/fogon`, fila "Otras herramientas" (`lib/idioma/textos/fogon.ts`; en el camino B, el bloque `pagina.consultas`): el texto de design §8, sin nombrar el voto cuadrático. Verificar con `pnpm verificar` y `git grep -n -i "cuadr" -- app/fogon/page.tsx lib/idioma/textos/fogon.ts` sin resultados.

## 5. Pase Fundador (deuda 6)

- [ ] 5.1 Inventario de lo que todavía nombra el voto en el fideicomiso.
  - **Si #152 ya entró (camino A), queda limpiar:** la clave `fideicomiso` en `lib/idioma/textos/sumarte.ts` (líneas 109 y 289 en la rama) y su uso en `app/sumarte/sumarte-cliente.tsx:393` pasan a `influencia`; el comentario de `lib/fogon/propuestas/ejemplos.ts:383`.
  - **Si #152 no entró (camino B), lo renombra #152, no esta tarea:** `lib/permisos/tipos.ts:23`, `tabla.ts:9,77-79`, `niveles.ts:10-11`, `tabla.test.ts:45`, `README.md`; `lib/canales/puertas.ts:36`, `puertas.test.ts:71-78`; `lib/idioma/textos/pasaporte.ts:177,367`; `lib/idioma/textos/sumarte.ts:109,289`; `app/sumarte/sumarte-cliente.tsx:393-394`; `lib/legal/terminos.ts:278-281`, `terminos.test.ts:57,212-214`; `e2e/pasaporte.spec.ts:57`, `e2e/sumarte.spec.ts:78-82`. Acá solo se saca el uso en el Fogón: `app/fogon/fogon-cliente.tsx:83`, y los textos `pase` de `lib/idioma/textos/fogon.ts:69-70,145-146`. Reportar la lista en el PR.
  - **Se quedan, a propósito:** las pruebas negativas (`e2e/fogon.spec.ts`, `lib/fogon/fogon.test.ts`, `lib/legal/terminos.test.ts`) y todo lo del programa de fideicomisos por series (`app/netx/`, `lib/series/`, `lib/financiamiento/`, `lib/equipos/frentes.ts`, los ⚖ del diseño legal B). Ni `voz-fondo-comun` ni `voto-asamblea-residentes` se tocan.
  - **Fuera de este repo:** `NS_platform/Documentation/Desarrollo/Para el abogado - lista viva (plataforma).md:37` nombra "voto en el Fideicomiso"; avisar al documentador en el PR.
  - Verificar en A con `git grep -n -i -E "voto-fideicomiso|voto en el fideicomiso|gobernanzafideicomiso|fundador\.fideicomiso" -- lib app components e2e` sin resultados. En B, con `git grep -n "voto-fideicomiso" -- app/fogon lib/fogon` sin resultados y `pnpm test lib/permisos lib/canales`.

## 6. Pruebas e integración

- [ ] 6.1 `e2e/fogon.spec.ts`: sacar los tests de voto y residencia, y sumar los escenarios de "Estado del consenso en cada decisión" y "Las decisiones del Fogón no se votan" con `page.clock.setFixedTime(new Date("2026-10-30T15:00:00Z"))`, sin red y solo con teclado. `e2e/fogon-gobernanza.spec.ts`: el panel de la lente. `e2e/fogon-propuestas.spec.ts`: "Estado del consenso en la propuesta". Verificar con `pnpm test:e2e e2e/fogon.spec.ts e2e/fogon-gobernanza.spec.ts e2e/fogon-propuestas.spec.ts`.
- [ ] 6.2 `e2e/manifiesto-lighthouse-vrn.spec.ts` (líneas 146-221 en la rama): "Votar" pasa a "Llevar al consejo" y al aviso por sección. `e2e/idioma-fogon-mercado.spec.ts`: sale el voto, entra el estado en inglés. `e2e/fogon-consultas.spec.ts:30` y `e2e/idioma-pendientes.spec.ts`: `h1` nuevo, etiquetas y nota es/en. Comentarios de `e2e/ayudas.ts` y `lib/gobernanza/participar.ts`. Verificar con `pnpm test:e2e e2e/manifiesto-lighthouse-vrn.spec.ts e2e/idioma-fogon-mercado.spec.ts e2e/fogon-consultas.spec.ts e2e/idioma-pendientes.spec.ts`.
- [ ] 6.3 `e2e/accesibilidad.spec.ts`: `/fogon` con sesión y sin sesión, la lente Decisiones con una decisión elegida, `/fogon/propuestas/consejo-bomba` y `/fogon/consultas`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.
- [ ] 6.4 `pnpm verificar`, `pnpm build` y los e2e tocados en verde. PR con `scripts/pr.sh` aclarando: qué camino se siguió; ninguna decisión del Fogón se vota (Gus, 2-nov); las consultas siguen, como consultas; el Pase da influencia en el Fondo Común y no se construye conviction voting; ⚖ en borrador; votos del navegador descartados; datos de ejemplo. Verificar con `scripts/preview-url.sh agente/fogon-consenso-en-tarjetas` y `BASE_URL=<url> pnpm test:e2e e2e/fogon.spec.ts`.
