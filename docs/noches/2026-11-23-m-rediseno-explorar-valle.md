# Noche 2026-11-23-m — rediseno-explorar-valle
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/204 · **Preview:** https://lighthouse-platform-git-agente-red-249fce-netxgen-2030-projects.vercel.app (protegido: responde 302, nadie pudo abrirlo esta noche)

## En una línea
El Inicio quedó con la foto del valle a sangre y existe la nueva vista pública `/barrios/norte`. Todo se probó en local y pasa, pero el preview de Vercel no se pudo probar.

## Qué falló o quedó bloqueado
- **Preview sin probar.** `scripts/preview-url.sh` falló a los 15 minutos ("No apareció el preview… ¿Está conectado el repo a Vercel?"). El bot de Vercel sí marcó el deploy como Ready, pero la URL está protegida (302). En el entorno del tester falta el secreto de bypass, y `scripts/curl-preview.sh` falla con "CABECERAS[@]: unbound variable". Sospecha, no verificada: `preview-url.sh` busca el nombre completo de la rama y el alias de Vercel viene truncado (`agente-red-249fce`).
- **No se hizo el guion manual.** Los pasos 1 a 6 del PR quedan cubiertos solo por los e2e locales.
- **Un test falló una vez en local:** `e2e/idioma-portada-sumarte.spec.ts:49` ("Sumarte en inglés"). Al repetir el archivo pasó 17/17. Parece intermitente y este PR no toca esa zona.
- **Tropiezo del implementador:** el worktree estaba en `agente/rediseno-menu-cinco` y el primer commit cayó ahí. Lo movió a la rama nueva y devolvió la rama local a `origin/agente/rediseno-menu-cinco`. Nada de eso se pusheó.

## Qué decidir a la mañana
1. **Orden de merge (pedido de decisión).** Este PR está apilado sobre `agente/rediseno-menu-cinco` (su base). `tasks.md` pide que ese cambio esté antes en `dev`. Acción sugerida: mergear primero el del menú de cinco destinos y después este, o rebasar este PR sobre `dev`.
2. **Fuente de la leyenda de la foto.** La leyenda dice solo "Imagen ilustrativa", y la spec pide la leyenda "con su fuente" (`components/explorar/heroe-valle.tsx:181`). Acción sugerida: decir de dónde sale la imagen y agregarlo en una tarea chica.
3. **Dos leyendas en el Inicio.** La leyenda nueva convive con la nota existente "Imagen ilustrativa de la Zona A…" al pie (no se tocó el contenido de `portada-vrn`). Acción sugerida: dejar una sola.
4. **Inglés pendiente de revisión nativa** en `lib/idioma/textos/barrios.ts` (anotado en `docs/idioma/revisar-nativo.md`). Acción sugerida: que lo revise alguien que hable inglés antes de mostrarlo afuera.
5. **El panel de la obra oculta los números pero no los protege** (ADR-015: los parámetros viajan en el JavaScript). Sin sesión el HTML no trae el monto, pero alguien técnico podría leerlos. Acción sugerida: aceptarlo mientras sea prototipo con datos de ejemplo, o decidir otra protección más adelante.
6. **Lotes del modelo y del plano.** El modelo usa los del módulo de bien común y el plano trae otro número. Si difieren, el panel lo dice. Acción sugerida: confirmar cuál es el que vale.

## Qué quedó hecho (tareas 11/11 marcadas)
- Inicio `/`: foto del valle a sangre, leyenda "Imagen ilustrativa", título y "Ver los lotes" encima, cifras con fuente en paneles de vidrio, sello de prototipo sobre la foto. El contenido de `portada-vrn` no cambió.
- `/barrios/norte`, pública y en dos idiomas: sello de venta simulada, lotes por estado ("En cuotas" dice "sin dato", porque el loteo base no lo tiene), parte de cada pago que va al bien común y la expensa, con enlaces a `/lotes` y `/bien-comun`.
- Panel de la obra solo con sesión: sin sesión se ve un aviso y ningún monto en el HTML. Con sesión: infraestructura, "Lo juntado: sin dato", mes de devolución y común por año.
- Nueva `resumenObraBarrio()` en `lib/bien-comun/barrio.ts`, reutilizable por Invertir.
- Barrios entra en la subnavegación de Explorar, la ruta es pública y traducida, y se actualizó `docs/idioma/revisar-nativo.md`.
- Se corrigieron `lib/navegacion.test.ts` y `e2e/marco.spec.ts`, y se sumaron e2e nuevos.
- Tras la revisión: ⚖ de "Token Inversor" y "Expensa"; el texto del héroe va sobre su propio fondo para asegurar el contraste, con pruebas en `lib/tema-contraste.test.ts` (4,5:1 el texto, 3:1 el título grande, en el peor caso y en los dos temas); recorridos con Tab y caso de 1280 px.

## Revisor: veredicto y hallazgos
Veredicto final (revisión 2): con observaciones. 0 altos, 0 medios, 1 bajo.
- **Revisión 1:** 2 medios y 3 bajos. Medios: faltaban los ⚖ de Token Inversor y Expensa, y no había prueba de contraste del texto sobre la foto (axe no mide contraste sobre imágenes). Bajos: faltaban recorridos con Tab y el caso de 1280 px, la leyenda sin fuente y el PR apilado. Seguridad sin hallazgos.
- **Revisión 2:** los tres corregibles quedaron resueltos, sin regresiones. Corrió `pnpm verificar` (2697 tests verdes), e2e de barrio-norte y portada (32/32) y axe en `/` y `/barrios/norte` en 2 idiomas y 2 temas (13/13). Hay un aviso de lint en `app/territorios/[id]/vistas/paneles.tsx`, que este PR no toca.
- **Bajo sin corregir:** `e2e/barrio-norte.spec.ts:426`. El nombre del test promete revisar los ⚖ de Expensa y Token Inversor, pero sin sesión solo busca Expensas. Token Inversor sí se prueba en el test con sesión (línea 471). Es solo un nombre engañoso.
- Comentario del revisor: https://github.com/netxgen-2050/lighthouse-platform/pull/204#issuecomment-7115944926. En la revisión 1 no pudo publicarlo (`scripts/pr.sh comentar` pidió aprobación); en la 2 sí.

## Tester: resultado
Pasa con reservas. En local (commit 1cfdce6) Playwright dio 1323 pasaron, 1 falló (intermitente, ver arriba) y 3 omitidas. Los e2e cubren Inicio a 1280 px, 390 px sin scroll horizontal y botón de 44 px, `/barrios/norte` sin sesión, el panel con sesión sin palabras de rendimiento, inglés y temas con axe, y que reservar un lote no cambia los totales. No se probó el preview real. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/204#issuecomment-7116407591.

## Para la próxima noche
- Arreglar el acceso al preview: revisar cómo `scripts/preview-url.sh` arma el nombre del alias (probable truncado), la variable `CABECERAS` en `scripts/curl-preview.sh` y cargar el secreto de bypass en el entorno del tester.
- Renombrar o completar el test de `e2e/barrio-norte.spec.ts:426`.
- Decidir la fuente de la leyenda y cuál de las dos leyendas queda.
- Mirar si `e2e/idioma-portada-sumarte.spec.ts:49` vuelve a fallar; si sí, abrir un cambio para estabilizarlo.
- Reducir el pendiente de revisión nativa del inglés de Barrios.
- Nadie mergeó ni tocó `dev` ni `main`.
