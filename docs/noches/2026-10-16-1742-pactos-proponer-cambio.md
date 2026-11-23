# Noche 2026-10-16-1742 — pactos-proponer-cambio
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/85 · **Preview:** no disponible (el deploy de Vercel falló)

## En una línea
El cambio quedó hecho y revisado, pero el tester no pudo probarlo en el preview porque el deploy de Vercel falla en los dos últimos commits.

## Qué falló (primero)
- **El deploy de preview de Vercel falló** para el commit `f202d0f` (el último). El tester no pudo recorrer los 9 pasos del guion manual contra el preview.
- El revisor vio que también falla en `61bea53` y que salió bien en la base `37c75af`. O sea, algo de este cambio rompe el deploy (o algo del entorno de Vercel); no se sabe cuál.
- Local todo anda: `pnpm verificar` (988 tests) y `pnpm build` pasan, y Playwright local dio 566 pasaron, 0 fallaron. Pero el build local no reproduce el fallo de Vercel.
- Detalle del deploy: https://vercel.com/net-xg-en/lighthouse-platform/Hq5QJx8LDocERYwPD1xiZmhATZD5
- Logs: `npx vercel inspect dpl_Hq5QJx8LDocERYwPD1xiZmhATZD5 --logs`
- No se hizo vuelta de corrección del tester porque el bloqueo es del deploy y no una falla de la app.

## Qué quedó hecho (tareas 3/3)
- 1.1 Estado de pactos: retirar un pacto enviado, proponer cambios a uno aceptado, versión real e historial.
- 2.1 Pantalla y eventos: botones, bloque "Cambio propuesto", aviso de rechazo, historial plegable y tres eventos nuevos en Mi recorrido.
- F.1 Verificación y PR abierto (Closes #50).

Incidente menor: los dos primeros commits cayeron por error en la rama local `agente/pasaporte-identidad-destacada`. El implementador los pasó a la rama nueva y devolvió la local a `37c75af`. Esa rama no se pusheó.

## Qué decidir a la mañana
1. **Mirar los logs de Vercel** (comando arriba) y decidir si el fallo es de este cambio o del entorno. Acción sugerida: revisar primero; si es del cambio, abrir una noche de corrección.
2. **Probar a mano el guion de 9 pasos** una vez que el deploy ande (está en la descripción del PR). Nadie lo recorrió contra el preview.
3. **Investigar `Error: Internal: NoFallbackError`**: apareció en el servidor durante el Playwright local sin hacer fallar ningún test. No se investigó. Acción sugerida: ver si ocurre también en la base; si es nuevo, puede estar relacionado con el fallo de Vercel.
4. **El PR apunta a `agente/pasaporte-identidad-destacada`, no a `dev`.** Acción sugerida: decidir el orden de merge (primero la base, después este).
5. **Dato para el guion de prueba:** en /semillas el total es trimestral (10 h/mes = 150 semillas, 20 h/mes = 303); en /pactos se ve por mes (50 y 101). No es un error, pero puede confundir.
6. **Semillas no recalcula el pasado**: usa la versión vigente. Quedó fuera de alcance a propósito.
7. La aprobación real por parte del admin queda para `aprobaciones-admin`.

## Revisor: veredicto y hallazgos
- **1ª revisión:** con observaciones (0 altas, 1 media, 3 bajas). Cubría los 8 requisitos de la spec; sin problemas de CLAUDE.md ni de seguridad.
  - Media: el aviso de rechazo podía no ser anunciado por lectores de pantalla.
  - Baja: el aviso de rechazo se veía también en la pestaña de plata.
  - Baja: la lectura del historial no descartaba versiones repetidas ni mayores a la vigente.
  - Baja: ningún test revisaba el enlace `/pactos?comunidad=<id>` del evento.
- **Corrección:** el implementador arregló los 4 y pusheó.
- **2ª revisión:** listo para revisión humana, 0 hallazgos nuevos. Corrió verificar (988 tests), build y e2e de pactos (26/26). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/85#issuecomment-6221203286

Nota: tras la corrección, el implementador corrió completo el e2e de pactos (26/26) según su resumen, pero el último ajuste lo probó solo con su test; el revisor después confirmó 26/26.

## Tester: resultado
**Bloqueado.** `scripts/preview-url.sh` informó que el deploy de Vercel falló para `f202d0f`. No se revisó el deploy de `61bea53`. Los 9 pasos del guion manual quedaron sin recorrer.
Lo único que se corrió fue Playwright local (no es el preview): 566 pasaron, 0 fallaron. Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/85#issuecomment-6221250529

## Para la próxima noche
- Resolver el fallo del deploy y volver a correr al tester contra el preview.
- Investigar el `NoFallbackError`.
- Cambio relacionado pendiente: `aprobaciones-admin` (aprobación real del cambio).
- Posible mejora: recalcular Semillas hacia atrás cuando cambia una versión (hoy fuera de alcance).
