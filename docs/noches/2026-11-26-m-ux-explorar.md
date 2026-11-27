# Noche 2026-11-26-m — ux-explorar
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/228 (base `agente/ux-celular`, no `dev`) · **Preview:** no verificado (ver abajo)

## En una línea
Hay PR y está listo para que lo mires: la lista y el mapa de lotes, el territorio y la ficha del lote quedaron rehechos, pero el preview de Vercel no se pudo probar y faltan las capturas de pantalla.

## Qué falló o quedó sin hacer (primero lo importante)
- **Preview de Vercel: no se probó.** El tester esperó 15 minutos y no vio ningún despliegue para el último commit (`afc32e2`). Por eso probó una versión de producción armada en su máquina, del mismo commit. Ojo: el bot de Vercel dejó en el PR un comentario con un preview "Ready" (actualizado a las 7:04 UTC, https://lighthouse-platform-git-agente-ux-969e6a-netxgen-2030-projects.vercel.app). No puedo confirmar a qué commit corresponde. Puede ser uno anterior o el último, y conviene que lo mires en el PR. Si la URL anda, el bloqueo del tester era una demora de Vercel y no un repo desconectado.
- **Tarea 3.1 sin marcar:** faltan las capturas a 390 y 1440 px en claro y oscuro. El entorno de la noche no las adjunta. Nadie miró a ojo la portada, el héroe, el mapa ni la hoja del celular.
- **Un test de la suite completa falló una vez** (`consentimiento-alta.spec.ts:111`). Es intermitente, no toca Explorar y pasó al repetirlo. En la revisión también falló una vez `marco.spec.ts:403` (orden de Tab), que pasó sola tres veces.

## Qué quedó hecho (tareas 7/8)
- Hechas las tareas 1.1 a 2.4. Pendiente la 3.1 (capturas).
- Se integró `agente/explorar-paginas` (#218), resolviendo conflictos a favor de sus rutas.
- **Lotes** (`/explorar/lotes`): lista de tarjetas más mapa. En compu van dos columnas con el mapa fijo. En celular el mapa ocupa la pantalla y la lista vive en la hoja de abajo. El filtro por estado y el orden quedan en la URL.
- **Territorio:** mapa ancho, botón "Ver los N lotes" y leyenda compacta.
- **Barrio Norte y héroe:** las cifras van en un panel y el héroe tiene degradado.
- **Ficha del lote:** plano grande, indicadores, estado administrativo antes de la acción, acción fija abajo en celular, y "Costos" y "Qué es tuyo…" como desplegables. No se tocó `compra-cliente.tsx`.
- **Resultado medible:** el alto de `/explorar/lotes` a 390 px bajó de 8.150 a unos 1.800 px (el tester midió 1.820).
- Verde al cierre: `pnpm verificar` (2872 tests), `pnpm build` y e2e (1421 ok, 3 omitidos).

## Qué decidir a la mañana
1. **Si se mergea sin preview verificado o se prueba a mano antes.** Acción sugerida: mirar primero el preview que dejó el bot. Si anda, probar lo que el tester no cubrió (punto de abajo) y mergear a `agente/ux-celular`.
2. **Barrio Norte sin estado administrativo (media).** `/explorar/barrio-norte` muestra lotes por estado pero no tiene el bloque de estado administrativo, y no figura en `lib/legal/vistas-con-lotes.ts`. La spec lo pide en "toda página de Explorar con lotes". Viene de #218. Acción sugerida: decidir si cuenta como página con lotes. Si sí, agregarlo en una tarea chica aparte.
3. **Acción fija en celular (media).** Hoy se fija toda la sección de compra simulada más "Hablar con alguien", con tope del 45 % de la pantalla. Tapa casi media pantalla al leer la ficha. Fijar solo el botón obliga a tocar `compra-cliente.tsx`, que este cambio dejó afuera. Acción sugerida: aceptarlo así por ahora y abrir un cambio chico para fijar solo el botón.
4. **Forma del héroe (baja).** Para arreglar el contraste, el héroe pasó de un degradado de 0 % a 90 % a una franja que se desvanece arriba más una banda pareja al 80 % detrás del texto. La foto solo se ve clara en los primeros 8 rem. Esto también cambia la portada (`app/page.tsx`) y puede chocar con `ux-inicio`. Acción sugerida: mirarlo en el preview y confirmar o pedir otro equilibrio.
5. **Filtro solo con la hoja abierta (baja).** El diseño lo pedía a la vista con la hoja en reposo. Para eso hay que subir el alto de la hoja de `ux-celular`. Acción sugerida: dejarlo y decidirlo junto con `ux-celular`.
6. **Héroe y pestañas sobre el mapa en celular (baja).** El mapa no ocupa la pantalla entera al abrir `/explorar/lotes`, como pide la spec. El diseño no dice qué hacer con el héroe. Acción sugerida: decidir si el héroe se achica o se oculta en esa página.
7. **Pasar el mouse sobre una tarjeta no resalta el lote en el mapa (baja).** Solo resalta al enfocar con teclado, que es lo que pide la spec. Acción sugerida: dejarlo salvo que lo quieras.
8. **"En cuotas" dice "sin dato" en los primeros 4 lotes (baja).** Se sabe que no tienen plan, así que no es un dato que falta. El diseño pedía "sin dato". Acción sugerida: cambiarlo a "No".

## Revisor: veredicto y hallazgos
Tres rondas. Veredicto final: listo para revisión humana.
- **Ronda 1** (⚠️ con observaciones, 0 altas, 5 medias, 12 bajas): 10 hallazgos corregibles y 7 para decidir (los puntos 2 a 8 de arriba). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/228#issuecomment-7183300375
- **Ronda 2** (⚠️, 0 altas, 0 medias, 3 bajas): los 10 corregibles bien resueltos, sin regresiones. Quedaron dos nuevos: el pie tapado por la hoja a 390 px y un test del mapa con espera fija de 1200 ms. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/228#issuecomment-7184523522
- **Ronda 3** (✅ listo para revisión humana, 1 baja): ambos arreglos confirmados (30 de 30 repeticiones). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/228#issuecomment-7185218015
- **Sin corregir (tope de dos vueltas):** en `app/territorios/[id]/mapa-leaflet.tsx:98`, el comentario dice que con `data-elegido` el mapa ya empezó a moverse. Con zoom animado, Leaflet avisa el movimiento un cuadro después (unos 16 ms). El test `e2e/explorar.spec.ts:281` podría dar verde un instante antes de tiempo. En la práctica no falló. Arreglo: poner `data-moviendo` dentro de `resaltar()` antes de mover el mapa, o corregir el comentario.
- Sin hallazgos de seguridad, reglas (tokens, un solo `main`, aviso, textos legales) ni alcance.
- Quedan 3 avisos de lint. Uno es un `eslint-disable` sobrante en `mapa-leaflet.tsx:348` y otro es un `tl` sin usar en `ficha-cliente.tsx:113`. Son avisos, no errores.

## Tester: resultado
**Pasa en local; el preview no se probó.** Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/228#issuecomment-7185904762
- Playwright en local: 1421 ok, 1 falló (intermitente, ver arriba), 3 omitidos.
- Guion manual a 1440 y 390 px, en claro y oscuro: mapa fijo en compu, foco con `sel` en la URL, filtro y orden en la URL, hoja en celular, territorio con "Ver los 25 lotes", Barrio Norte con un solo `main`, ficha con desplegables y la acción sobre la barra inferior.
- **No verificado:** tocar un lote en el mapa y que la lista baje a su tarjeta; reservar con sesión; la versión en inglés; la revisión visual de las capturas (héroe, portada, mapa, hoja).
- Sin fallas propias del PR.

## Para la próxima noche
- Marcar la 3.1 con capturas reales en claro y oscuro, a 390 y 1440 px.
- Arreglar el comentario o la señal `data-moviendo` en `mapa-leaflet.tsx` y sacar el `eslint-disable` sobrante.
- Según lo que decidas: agregar el estado administrativo a Barrio Norte, fijar solo el botón de compra en la ficha, y cambiar "En cuotas" a "No".
- Revisar la conexión de Vercel con el repo si el preview de este commit no aparece.
- Coordinar el héroe nuevo con `ux-inicio`.
