# Noche 2026-10-27 (m) — idioma-pendientes
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/122 · **Preview:** no hay (ver bloqueos)

## Bloqueos y cosas que no salieron (leer primero)
- **No hay preview de Vercel.** El tester esperó 15 minutos con `scripts/preview-url.sh` y no apareció ningún preview del commit 6159cfa. Puede ser que el repo no esté conectado a Vercel. Todo se probó solo en local.
- **Los dos comentarios del revisor no se publicaron en el PR.** El permiso de `scripts/pr.sh comentar` y `diff` se denegó las dos veces. El texto completo está más abajo, en la sección del revisor. Además, en la segunda vuelta el revisor no pudo hacer `git fetch` y comparó contra el `origin/dev` local.
- **La suite completa de e2e no se corrió limpia.** Un primer intento contra un servidor propio en localhost:3000 falló por conexión y se descartó. Se corrieron solo los specs relacionados (ver tester).
- **Había un reporte viejo y contradictorio** en esta misma ruta (de una noche bloqueada). El implementador lo borró y este archivo lo reemplaza.

## En una línea
Las consultas del Fogón ya se ven completas en inglés y se fijó la regla de que toda pantalla nueva nace bilingüe. Funciona en local, pero queda una decisión tuya sobre una excepción a la regla y la revisión del inglés por una persona nativa.

## Qué quedó hecho (tareas 13/13)
- **Consultas del Fogón en inglés:** lista, reparto de créditos, padrón, resultado por grupo, acta, dona y mensajes de error. Diccionario nuevo en `lib/idioma/textos/fogon-consultas.ts`.
- **Fechas y montos en formato inglés** (por ejemplo USD 15,000). Las consultas de ejemplo son bilingües y muestran "Translated from Spanish".
- Se tradujo de más, a propósito, para no dejar español suelto: opciones, nota del monto y nombres del padrón.
- Las rutas `/fogon/consultas` y `/fogon/consultas/[id]` quedaron en `RUTAS_TRADUCIDAS`.
- **Cambios a un pacto:** ya estaban traducidos por noches anteriores. Solo se sumó un test unitario de eventos y dos e2e en inglés ("Cambio rechazado" e "Historial").
- **Regla "toda pantalla nueva nace bilingüe":** `lib/idioma/rutas.ts` suma `RUTAS_INTERNAS` y `RUTAS_PENDIENTES`. El test `rutas.test.ts` falla si una página de `app/` no está traducida, ni interna, ni pendiente. La regla está escrita en `docs/agentes.md`.
- Las fuentes nuevas quedaron pendientes de revisión nativa (se regeneró `docs/idioma/revisar-nativo.md`).
- Se corrigieron tres hallazgos del revisor: reporte viejo borrado, test vacío eliminado, y el aviso de pisos ahora sale de un mapa `avisos` tipado (ya no puede mostrar un código interno).
- `pnpm verificar` (1562 tests) y `pnpm build` en verde.

## Qué decidir a la mañana
1. **`RUTAS_PENDIENTES` (media).** Es una tercera salida que la spec no preveía: hoy deja `/mis-datos` y `/privacidad` fuera de la regla hasta que lo resuelva `idioma-legal`. Acción sugerida: aprobarla como excepción temporal, sumarla a la spec y nombrarla en `docs/agentes.md`; o pedir que se saque. Hasta que decidas, el tercer requirement de la spec queda sujeto a este punto.
2. **`docs/agentes.md` no nombra `RUTAS_PENDIENTES` (baja).** Se arregla junto con el punto 1.
3. **Frase legal "consultivo" del acta (informativa).** Sigue en español con `lang="es"`, junto con su ⚖, hasta que `idioma-aviso-legal` o `idioma-legal` la traduzca. Acción: nada ahora; confirmar que `idioma-legal` la tiene en su alcance.
4. **Revisión nativa del inglés.** Los textos nuevos están en `docs/idioma/revisar-nativo.md`. Acción: mandarlos a una persona nativa antes de mostrar fuera del equipo.
5. **Rediseño holocrático.** Sigue solo en spec; se tradujo la versión vigente. Cuando se implemente, habrá que traducir lo nuevo.
6. **Vercel.** Revisar si el repo está conectado; sin eso el tester no puede probar en preview.

## Revisor: veredicto y hallazgos
**Veredicto: con observaciones (⚠️), sin regresiones.** 0 altos, 1 medio, 5 bajos en la primera vuelta; en la segunda quedan abiertos 1 medio, 1 bajo y 1 informativo.

Primera vuelta (292 tests de las carpetas tocadas pasan):
1. Media: `RUTAS_PENDIENTES` no está en la spec (ver decisión 1).
2. Baja: `docs/agentes.md` no la nombra.
3. Baja: reporte viejo contradictorio en `docs/noches`. **Corregido.**
4. Baja: el test "la lista falla si falta una ruta" no simulaba nada. **Corregido** (se eliminó).
5. Baja: el reemplazo `a === "pisos-imposibles" ? r.avisoPisos : a` en `resultado-grupo.tsx` podía mostrar un código interno. **Corregido** (mapa tipado `avisos`).
6. Informativa: frase legal "consultivo" en español con `lang="es"` hasta `idioma-legal`.

Segunda vuelta: correcciones 3, 4 y 5 verificadas; `pnpm verificar` verde (1562 tests). Abiertos: 1, 2 y 6. Cobertura de la spec: los 3 requirements y sus scenarios están cubiertos, el tercero sujeto al punto 1. Limitaciones: no pudo publicar el comentario, no pudo usar `scripts/pr.sh diff` ni `git fetch`.

## Tester: resultado
**Pasa en local; no verificado en preview** (no apareció ninguno en 15 minutos).
- Con `pnpm build` y el servidor de producción de Playwright: **195 pasaron, 0 fallaron** en los specs idioma-pendientes, fogon-consultas, pactos, fogon, accesibilidad e idioma.
- El guion manual (pasos 1 a 6) está cubierto por los e2e, pero nadie lo recorrió a mano en un preview.
- Sin verificar: textos exactos y formatos de fechas y montos a ojo, y el caso "aceptar el cambio y abrir Version history (2)".
- Reporte del tester: https://github.com/netxgen-2050/lighthouse-platform/pull/122#issuecomment-6455254222

## Para la próxima noche
- Cuando tengas preview o corras local, recorré a mano las consultas del Fogón en inglés y el caso de Version history.
- Corrida limpia de la suite completa de e2e.
- Aplicar la decisión sobre `RUTAS_PENDIENTES` (actualizar spec y `docs/agentes.md`, o quitarla).
- Traducir `/mis-datos` y `/privacidad` con `idioma-legal`; al hacerlo, vaciar `RUTAS_PENDIENTES` y traducir la frase consultiva del acta.
- Habilitar que el revisor pueda comentar en el PR (permiso de `scripts/pr.sh comentar` y `diff`).
