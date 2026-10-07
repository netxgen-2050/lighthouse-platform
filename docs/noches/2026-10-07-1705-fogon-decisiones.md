# Noche 2026-10-07-1705 — fogon-decisiones
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/19 · **Preview:** https://lighthouse-platform-hgoewnw4f-net-xg-en.vercel.app

## Estado general
Listo para tu revisión. La pantalla `/fogon` está terminada, el revisor la dio por buena (✅) y el tester pasó. No hay hallazgos altos. Hay un bloqueo menor de herramientas y un test intermitente (abajo). Nadie mergea: el merge es tuyo.

## En una línea
La pantalla Fogón (`/fogon`) muestra las 5 decisiones del mock-up, con filtros y una votación simulada que se guarda en el navegador.

## Qué decidir a la mañana
Puntos del revisor que son tuyos (numeración del revisor):

1. **Punto 5 (media): actas.** La spec pide "un acta por decisión cerrada", pero ninguna de las 5 decisiones está cerrada. El implementador muestra un acta de ejemplo por cada voto propio. Es un texto nuevo que no sale del mock-up. Acción sugerida: aceptarlo como ejemplo del prototipo (y marcarlo como borrador si hace falta) o pedir que se quite hasta tener decisiones cerradas.
2. **Punto 6 (baja): conteos de votos inventados.** Los números de votos son de ejemplo. Acción sugerida: dejarlos, ya que el aviso "datos de ejemplo" está visible, o pedir que se muestre "sin dato".
3. **Punto 7 (baja): selector "Persona de ejemplo" (Lucía/Lucas).** No está en la spec; se agregó para probar quién puede votar. Acción sugerida: dejarlo para el prototipo o sacarlo y agregarlo a la spec si lo querés.
4. **Punto 8 (baja): `lh-fogon` no está en `lib/demo/claves.ts`.** Por eso "borrar demo" no limpia los votos de Fogón (pasa igual con `lh-sumarte`). Acción sugerida: sumar ambas claves en un cambio chico aparte.

## Bloqueos y pendientes
- **Comentario perdido del revisor (2ª vuelta).** `gh pr comment` se colgó más de 120 s (posible espera de permisos) y ese comentario no se publicó. No se perdió contenido importante: el revisor publicó después un comentario consolidado en la 3ª vuelta. Solo queda registrado como bloqueo de herramientas.
- **Test intermitente.** `e2e/fogon.spec.ts:33` falló una vez porque registró un POST de la barra de Vercel (`vercel.live/login/validate`), no de la app. Pasó en el reintento. Acción sugerida: que el test ignore `vercel.live` cuando corre contra un preview.
- **`setTimeout` de 50 ms sin cancelar (baja).** Si se cambia de persona justo en esos 50 ms, reaparece la confirmación del voto anterior. Es muy raro. Acción sugerida: cancelar el temporizador al desmontar o cambiar de persona.
- **Lector de pantalla.** El anuncio del voto no se verificó con un lector de pantalla real, solo con tests automáticos.

## Qué quedó hecho (tareas 3/3)
- 1.1 `lib/fogon/`: las 5 decisiones del mock-up, regla de quién vota, filtro, conteo, lectura de lo guardado, con tests. Se copiaron 5 ⚖ al catálogo (art32, art35, art44, fidasamblea, estatuto), sin borrador porque vienen del mock-up.
- 2.1 `app/fogon/page.tsx` y `fogon-cliente.tsx`: filtros Todas/Tribu/Asamblea/Fideicomiso, votación simulada en `localStorage` (`lh-fogon`), motivo visible si no se puede votar, aviso de prototipo. El rail ahora lleva Fogón a `/fogon`.
- 2.2 `e2e/fogon.spec.ts` y `/fogon` sumada a la auditoría de axe (20 rutas).
- 3.1 `pnpm verificar` y `pnpm build` en verde.

## Revisor: veredicto y hallazgos
Veredicto final (3ª vuelta): ✅ listo para revisión humana. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/19#issuecomment-6042023799. 0 altas, 1 media, 4 bajas. Sin regresiones. Se usaron las dos vueltas de corrección permitidas.

Vuelta 1 (⚠️, 8 hallazgos), lo corregido:
- Los votos se guardaban por decisión y no por persona (Lucas votaba, se cambiaba a Lucía y veía el voto de Lucas). Corregido con migración del formato viejo.
- Faltaba un test del cambio de persona. Agregado, unitario y e2e.
- Se perdía el foco al votar. Ahora queda en "Cambiar voto".
- El aviso `role="status"` no se anunciaba. Ahora hay uno solo y persistente.

Vuelta 2: apareció un hallazgo bajo (al elegir la misma opción el anuncio no se oía). Corregido vaciando el anuncio y escribiéndolo 50 ms después, con un test e2e nuevo.

Queda abierto: el punto 5 (media), los puntos 6, 7 y 8 (bajas, ver arriba) y el `setTimeout` sin cancelar (baja).

## Tester: resultado
Pasa. Playwright: 137 pasaron, 0 fallaron, 1 intermitente (ver arriba). Guion manual de 6 pasos ✅, verificado con e2e y curl, sin recorrido visual aparte. Sin bloqueos. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/19#issuecomment-6042048156.

## Para la próxima noche
- Decidir los puntos 5 a 8 y, según tu respuesta, ajustar actas, conteos y selector.
- Sumar `lh-fogon` y `lh-sumarte` a `lib/demo/claves.ts`.
- Hacer que el e2e ignore `vercel.live` contra un preview.
- Cancelar el temporizador del anuncio al cambiar de persona.
- Probar el anuncio del voto con un lector de pantalla real.
