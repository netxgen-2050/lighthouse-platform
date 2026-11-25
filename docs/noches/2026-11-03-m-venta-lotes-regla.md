# Noche 2026-11-03-m — venta-lotes-regla
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/164 · **Preview:** no hay (el deploy de Vercel terminó en "Error")

## En una línea
El código del cambio quedó hecho y revisado, pero hay dos problemas: Vercel falla en la rama (no hay preview) y el tester encontró 3 tests de Playwright que fallan, aunque no tocan lo que cambió este PR y no se confirmó que los cause.

## Qué falló o quedó bloqueado
- **Vercel no desplegó la rama.** El deploy del PR terminó en "Error" y no hay URL de preview. El build local pasa, así que hay que mirar el log del deploy en Vercel antes de mergear. `scripts/preview-url.sh` esperó 10 y 15 minutos sin recibir URL.
- **Tarea 4.2 sin hacer** (verificar contra el preview de Vercel), por lo mismo.
- **Tester ❌ por 3 tests** (probado en local, build de producción, puerto 3100): pasaron 1085 de 1088.
  - `e2e/fogon-propuestas.spec.ts:71`: esperaba la fase "Resolver concerns" y la página marca "Cierre · ahora". Falla siempre.
  - `e2e/fogon-propuestas.spec.ts:133`: falta el ítem "Pasar de fase" con "Falta responder el desafío del Guardián". Falla siempre.
  - `e2e/pacto-puntual.spec.ts:385`: axe en `/pactos`. Intermitente, pasó sola.
  - El diff no toca Fogón ni pacto puntual, pero **no se comparó contra `dev`**, así que no se sabe si ya fallaban allí. Por eso no se hizo vuelta de corrección.
- **Paso 1 del guion manual** (rail en la portada con "Lo que viene") no se pudo verificar con curl; hay que repetirlo contra un preview. Los pasos 2 a 6 salieron bien.
- **Proceso suelto:** quedó un `pnpm start` corriendo en el puerto 3000 del carril m1 (el tester no tenía permiso para matarlo).

## Qué quedó hecho (tareas 10 hechas, 1 pendiente: la 4.2)
- Tareas 1.1 a 4.1 hechas:
  - `CLAUDE.md`: línea de encabezado, sección "Fase 1" y frase en "Plata e inversión". Nota nueva en `docs/notas/congreso-en-pausa.md`.
  - Estado administrativo: el proyecto `lighthouse-norte` tiene acciones de lote (consultar, reservar, comprar) según `ventaSimulada`, sin leer la aprobación. La aprobación municipal figura como "supuesto de trabajo, no otorgada"; titular, expediente y fecha dicen "sin dato". Soluna solo permite consultar. Nuevo ⚖ `loteonorte` (borrador, es/en) y componente `EstadoAdministrativo` con test.
  - Menú: grupo "Lo que viene" (Tribus, Pactos, Semillas, Fogón), `Lotes` marcado como que todavía no existe y Congreso oculto. Se ajustaron los tests de navegación y e2e.
  - Noindex en todas las páginas (`robots: { index: false, follow: false }` en `app/layout.tsx`), sin `robots.txt`, con e2e.
- Cambio no pedido: se regeneró `docs/idioma/revisar-nativo.md` con `pnpm idioma:pendientes` porque el snapshot fallaba.
- Corrección tras el revisor (commit 5a32346): el componente decide por el dato (`!!base.supuestoDeTrabajo`) y no por el nombre del proyecto, y muestra "sin dato" si falta; se sumó el test del ⚖ en versión completa y compacta, es/en.
- `pnpm verificar` y `pnpm build` pasan. Warning ajeno al PR: `'_' is defined but never used` en `app/territorios/[id]/vistas/paneles.tsx:82`.

## Qué decidir a la mañana
1. **Título "Lo que viene" no se ve en celular (hallazgo 3, baja).** A 390 px los títulos de grupo del rail ya estaban ocultos (`sm:block`, `rail-enlaces.tsx:53`, `e2e/marco.spec.ts:168`). La spec no lo exige; el design decía "si no entra, se parte en dos líneas". Acción sugerida: dejarlo así si no importa en celular, o pedir un cambio chico para mostrarlo.
2. **Por qué Vercel falla en la rama.** Acción: mirar el log del deploy en Vercel; no mergear hasta entenderlo.
3. **Tests de Fogón y axe de `/pactos`.** Acción: correr esos tres tests contra `dev`. Si fallan allí, no son de este PR; si no, hay que corregir.
4. **Tarea 4.2 y paso 1 del guion.** Acción: cuando haya preview, correr `BASE_URL=<url> pnpm test:e2e e2e/marco.spec.ts` y mirar el rail de la portada.
5. **Proceso en el puerto 3000 del carril m1.** Acción: matarlo a mano.

## Revisor: veredicto y hallazgos
- **1ª vuelta:** con observaciones. 0 altas, 0 medias, 3 bajas.
  1. El componente decidía por nombre de proyecto y usaba cadena vacía si faltaba el supuesto. Resuelto.
  2. Ningún test comprobaba el ⚖ `loteonorte`. Resuelto.
  3. Título "Lo que viene" no visible en celular. Queda para Gus (arriba).
- **2ª vuelta:** con observaciones, 1 baja (la 3, que decide Gus). `verificar`: 2205 tests, 0 errores de lint, 1 warning ajeno; build OK. Avisó que el deploy de Vercel terminó en "Error".
- Comentarios: pull/164#issuecomment-6602153172 y pull/164#issuecomment-6602563782.

## Tester: resultado
- ❌ Playwright en local: 1085 pasaron, 3 fallaron de 1088 (detalle arriba). Los e2e que cambió el PR pasan.
- Guion manual: paso 1 no verificable sin preview; pasos 2 a 6 bien.
- Comentario: pull/164#issuecomment-6604107579.

## Para la próxima noche
- Si Gus confirma que las fallas de Fogón y axe también ocurren en `dev`, abrir un cambio aparte para arreglarlas.
- Si no ocurren en `dev`, una vuelta de corrección en este PR.
- Cerrar la tarea 4.2 cuando exista preview.
- Si se decide mostrar "Lo que viene" en celular, hacerlo en un cambio chico.
- El warning de `paneles.tsx:82` es ajeno; se puede limpiar en otro momento.
