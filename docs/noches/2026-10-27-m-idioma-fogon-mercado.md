# Noche 2026-10-27-m — idioma-fogon-mercado
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/115 · **Preview:** no hay (el deploy de Vercel falló)

## En una línea
El código quedó hecho y el revisor lo dejó con observaciones, pero **no se pudo probar en el preview porque Vercel falla en todos los deploys** (también en la rama base); en local casi todo pasa y 2 pruebas fallaron de forma intermitente.

## Qué bloquea (primero)
- **Vercel no despliega.** El estado dice "Deployment has failed" en menos de 1 segundo. Le pasa a este PR, a la rama base (commit bf2986f) y a más de 15 deploys de la noche (entre 14:34 y 15:48). Parece un problema de infraestructura, no del código. Sin credenciales de Vercel no se ve el motivo (podría ser límite del plan, una variable de entorno o la configuración del proyecto).
- **Por eso el tester no recorrió el guion manual** (pasos 1 a 8 del PR). No se repitió la prueba porque sin preview no había qué probar.

## Qué quedó hecho (tareas 5/5)
- 1.1 Fogón: filtros, votos (In favor / Against / Abstention), motivos para no votar, acta y decisiones de ejemplo en inglés con la nota "Translated from Spanish". Nombres de tribus sin traducir.
- 2.1 Compromisos y Mercado: formulario, validaciones por idioma, formatos, filtros y ofertas de ejemplo bilingües. Lo que escribe la persona se ve tal cual.
- 3.1 Canales: motivos, "se abre con", refuerzo, planes y pase desde el diccionario.
- 4.1 y 4.2 Pruebas: las tres rutas sumadas a las traducidas, e2e nuevo y accesibilidad en inglés.
- Verificación del implementador: `pnpm verificar` (1361 tests), `pnpm build` y `pnpm test:e2e` (744) en verde.

## Qué decidir a la mañana
1. **Vercel (urgente).** Abrir https://vercel.com/net-xg-en/lighthouse-platform/37jw2bZYXFsAqMP5S5kUgE1qLREV o correr `npx vercel inspect dpl_37jw2bZYXFsAqMP5S5kUgE1qLREV --logs` para ver el motivo. Acción: arreglarlo y volver a lanzar el tester sobre el preview.
2. **[media] Campo "Para quién".** La spec lo pide en la validación, pero ese campo ya no existe en la app (hay un e2e que exige que no esté). El código está bien. Acción sugerida: ajustar la spec para quitar ese escenario.
3. **[media] Canales no muestra "se abre con" ni refuerzo.** `/canales` solo redirige a `/pasaporte`; esos textos están traducidos y testeados pero no aparecen en ninguna pantalla. Acción: o se ajusta la spec, o se decide mostrar "se abre con" en el Pasaporte (eso es alcance nuevo, otro cambio).
4. **Dos e2e intermitentes en local** (no se investigaron): `e2e/idioma.spec.ts:86` (esperaba `/tribus?sel=valle&lang=en` y vio `/tribus?lang=en`) y `e2e/pactos.spec.ts:130` (timeout de 30 s en `goto /panel`). Repetidas solas pasan. Acción: decidir si se investigan como fallos ocasionales o por carga de la máquina.
5. **Fuera de alcance, queda en español:** `/fogon/consultas` y `/fogon/simulador` (con aviso de página sin traducir). Acción: decidir si van en un cambio próximo.
6. Todo el inglés nuevo es borrador pendiente de revisión nativa (lista regenerada).

## Revisor: veredicto y hallazgos
Veredicto final (3ª pasada): **con observaciones**. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/115#issuecomment-6446621394
- [media] "Para quién" inexistente en el código (ver punto 2). Abierto, decide Gus.
- [media] "se abre con" y refuerzo no se ven en pantalla (ver punto 3). Abierto, decide Gus.
- [baja] Nombres de tribu del Fogón sin `translate="no"`: corregido (commit d3ed6db).
- [baja] El acta tras votar en Valle Solar sin `translate="no"`: corregido (commit 997aed6, con e2e).
- En las dos primeras pasadas el revisor no pudo publicar el comentario (`pr.sh comentar` rechazado); la tercera sí.

## Tester: resultado
**Bloqueado en el preview, bien en local.** Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/115#issuecomment-6446843981
- Preview: `scripts/preview-url.sh` devolvió "El deploy de Vercel falló para 997aed60…". El guion manual no se recorrió.
- Local: `pnpm build` ok; `pnpm test:e2e` 743 pasaron y 2 fallaron de forma intermitente (punto 4).

## Para la próxima noche
- Resolver Vercel y correr el guion manual sobre el preview.
- Ajustar la spec (puntos 2 y 3) o abrir un cambio para mostrar "se abre con".
- Investigar los dos e2e intermitentes si se repiten.
- Reforzar para el implementador: crear la rama antes del primer commit (esta noche el primer commit cayó en `agente/idioma-pasaporte-semillas-pactos` y se movió a la rama nueva; origin no se tocó) y no usar `sed -i` (se usó en `tasks.md`; inofensivo, pero está prohibido por CLAUDE.md).
- Este PR depende de la rama `agente/idioma-pasaporte-semillas-pactos` (su base): mergear en orden.
