# Noche 2026-11-23 — bien-comun-numeros-barrio
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/193 (base `agente/bien-comun-propuesta`, no `dev`) · **Preview:** no verificado (ver abajo)

## En una línea
La calculadora "Los números del barrio" quedó hecha, revisada y probada en local, pero la prueba contra el preview no se pudo hacer y 18 pruebas ajenas al cambio fallan (casi seguro por fechas de ejemplo vencidas en el Fogón).

## Qué falló o quedó bloqueado (leer primero)
- **Sin prueba en el preview.** El script `scripts/preview-url.sh` no devolvió ninguna URL en 15 minutos, ni para esta rama ni para la base. El tester probó en local (build propio y servidor de Playwright). El comentario de Vercel en el PR sí dice "Ready" para esta rama (13:57 UTC, https://lighthouse-platform-git-agente-bie-ea7f97-netxgen-2030-projects.vercel.app), pero nadie recorrió el guion manual ahí.
- **Tester: falla (18 pruebas), ninguna es de este cambio.** Todo `e2e/bien-comun.spec.ts` pasa. Resultado local: 1190 pasaron, 18 fallaron, 1 omitida.
- **Esta noche no hubo vuelta de corrección después del tester.** Lo decidió el orquestador: las fallas están en rutas que el cambio no toca (el Fogón está congelado por CLAUDE.md) y no hay nada que corregir dentro del alcance. Queda sin tocar.
- **El revisor de la vuelta 1 no pudo publicar su comentario:** `scripts/pr.sh` quedó esperando aprobación de permiso y no se esquivó. Sus hallazgos se conocen por el resumen y por la vuelta 2, que sí quedó publicada. Las vueltas 2 y 3 se publicaron bien.

## Qué quedó hecho (tareas 12/12)
Todas las tareas de `openspec/changes/bien-comun-numeros-barrio/tasks.md` están marcadas hechas (1.1, 1.2, 2.1, 3.1 a 3.3, 4.1, 5.1, 5b.1, 6.1). `pnpm verificar` (2449 tests), `pnpm build` y `openspec validate --strict` pasaron.
- Parámetros del barrio y su fuente en `lib/bien-comun/modelo.ts` (`BARRIO`, `VERSION_SIM_BARRIO`).
- Cálculo en `lib/bien-comun/barrio.ts`, traducido de `barrio_stack_sim.py` v0.1. Sus tests reproducen `RESULTS_barrio_stack.md` (317.200; mes 48; 384.382; 40.000 a mes 29; 1 por trimestre "no en 6 años"; contado a mes 27; 21 % y 53 %; 0,68).
- Calculadora con cinco campos en `components/bien-comun/calculadora-barrio.tsx`, textos es/en, sección después de la política de FARO en `/bien-comun`.
- Solo con sesión (tu decisión del 23-nov): sin sesión hay un aviso con el enlace para entrar y ningún número.
- Test de números escritos ampliado (27.500, 317.200, 384.382) y `docs/idioma/revisar-nativo.md` actualizado.
- Tarea 1.2: `lotesDelSector()` da 21, igual que el doc 34, así que no hizo falta la línea de aviso.

## Qué decidir a la mañana
1. **Ocultar sin sesión solo en el cliente (revisor, decisión tuya).** En pantalla se cumple: sin sesión no se ve ningún número. Pero los valores de partida viajan en el payload de la página y en el bundle público. Acción sugerida: si es un prototipo interno y alcanza con que no se vean, aceptarlo. Si querés que no salgan del servidor sin sesión, pedir un cambio aparte (hoy el servidor solo ve la cookie de prueba y la de admin).
2. **`BARRIO.fechaFijaMeses` = 12 (revisor, decisión tuya).** Es un parámetro que el implementador sumó y que `design.md` no lista; sale del simulador y evita escribir el 12 en el texto. Acción sugerida: confirmar el valor y su fuente en `lib/bien-comun/modelo.ts`, o sumarlo a `design.md`.
3. **Las 18 pruebas que fallan en la base (tester).** Acción sugerida: decidir si se renuevan las fechas de ejemplo del Fogón (`lib/fogon/consultas/ejemplo.ts`) en un cambio aparte. Es una inferencia, no se corrió en la base: U1 y U2 cierran el 2026-11-15 (ya cerraron) y U3 y U4 el 2026-11-30, así que esas probablemente fallen igual desde el 30. Mientras tanto, estas fallas pueden confundir la revisión de cualquier PR.
4. **Preview de Vercel (tester).** Acción sugerida: revisar por qué `preview-url.sh` no encontró la URL aunque Vercel marcó el despliegue como Ready, y recorrer el guion manual del PR (pasos 1 a 7) sobre el preview antes de aprobar.
5. **Sin tope a valores absurdos (implementador).** La spec no lo pide; un precio de 8 cifras se calcula igual. Acción sugerida: dejarlo, salvo que quieras un tope.

## Revisor: veredicto y hallazgos
Veredicto final (vuelta 3): con observaciones; nada impide pasar a revisión humana. 0 altas, 0 medias. Se agotaron las dos vueltas de corrección. Los 8 requisitos de la spec están cubiertos.
- **Vuelta 1** (comentario no publicado por permiso): 3 medias (⚖ faltantes en términos legales; axe de `/bien-comun?lang=en` sin la calculadora cargada; ocultamiento solo en el cliente) y 4 bajas (región en vivo muy larga; "le quedan 68 %" con entradas inválidas; `27.500,50` rechazado; `fechaFijaMeses` fuera de `design.md`). Corregidos en 5d750e2 todos menos los dos de decisión tuya.
- **Vuelta 2:** las 5 correcciones bien. Nuevos: 1 media (⚖ de Token Inversor dentro de la región en vivo), 2 bajas (⚖ de la prima dentro del label; test del campo vacío sin comprobar "sin dato" en las dos líneas del fideicomiso). Corregidos en 8677feb.
- **Vuelta 3, lo que queda:** 1 baja opcional (el ⚖ de Token Inversor está solo en un párrafo, sin el nombre del término al lado; se puede arreglar en cualquier momento) y las 2 decisiones tuyas de arriba.

## Tester: resultado
Falla, pero por pruebas ajenas al cambio. Probado en local, no en preview.
- Pasan: sin sesión, con sesión, inglés con teclado, 390 px de ancho, y los pasos 1 a 7 del guion en versión automática.
- Fallan (18): `accesibilidad.spec.ts:442` (`/fogon/consultas/u1` abierta); `fogon-consultas.spec.ts` (a), (b), (c), (d), (e), (f), (g2), (h), (i); `idioma-pendientes.spec.ts` líneas 23, 46, 62, 107; `manifiesto-lighthouse-vrn.spec.ts` líneas 189, 206, 218; `pacto-puntual.spec.ts:385` (axe, `document-title`; se vio en una de dos corridas, no se sabe si es estable).
- Causa probable de las del Fogón: fechas de cierre ya vencidas. El diff no toca Fogón, consultas ni pactos.
- No cubierto por e2e: cuotas 0 (mes 27) y los seis montos exactos de la tabla del común; solo los cubren tests unitarios. Guion manual sin recorrer en un preview.

## Para la próxima noche
- Cambio aparte para renovar las fechas de ejemplo de las consultas del Fogón (hoy hay 18 pruebas rojas que tapan otras señales).
- Averiguar por qué no aparece el preview para `preview-url.sh`.
- Opcional: sumar un e2e para cuotas 0 y los seis montos de la tabla del común; poner el nombre del término junto al ⚖ de Token Inversor.
- Si decidís mover el ocultamiento al servidor, abrir un cambio nuevo.
- Antes de mergear el PR #193 hay que resolver la base: apunta a `agente/bien-comun-propuesta`, no a `dev`.
