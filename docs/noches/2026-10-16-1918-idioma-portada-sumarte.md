# Noche 2026-10-16 — idioma-portada-sumarte
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/91 (base: `agente/idioma-base`) · **Preview:** no hay. El deploy de Vercel falló.

## En una línea
La portada y Sumarte quedaron traducidas al inglés y funcionan bien en pruebas locales, pero falta una tarea (2.3) y el preview de Vercel no se pudo desplegar, así que no se probó en un entorno real.

## Qué falló o bloquea (primero)
- **No hay preview.** El deploy de Vercel falla en esta rama y ya fallaba en `idioma-base` (commit 85258fc). En `dev` el deploy anda bien. Posible causa: la rama sale de `idioma-base` y no de `dev`, que ya tiene `base-neon`. Para ver el error: `npx vercel inspect dpl_8bMQMiPBkerNGnngCcUVNKo26jNn --logs`.
- **El tester no pudo probar contra un preview.** Los 667 e2e de Playwright pasan, pero solo contra el servidor local. El guion manual de 9 pasos no se recorrió. Los pasos más importantes sin probar: 1 (`lh-origen` con fuente `deck`), 7 (moneda ARS) y 8 (formulario de invitación).
- **Tarea 2.3 sin hacer** (ver abajo).

## Qué quedó hecho (tareas 5 de 6)
Hechas: 1.1, 2.1, 2.2, 3.1, 3.2. Sin hacer: 2.3.
- Portada y Sumarte completas en inglés: textos, planes, avisos de nivel, comparativa, inversores, formulario de contacto y "Entrar como…".
- Montos con el formato de cada idioma (USD 1,500; pesos con su nota).
- Los términos con ⚖ salen en español con la marca "Only available in Spanish". El diálogo de verificación de identidad y "No es una inversión…" quedan en español, marcados con `lang="es"`.
- `/` y `/sumarte` entran en la lista de rutas traducidas, que revisa el e2e de idioma.
- Estado de tribu y "de/of" de los medidores pasan a textos comunes (los va a reutilizar `idioma-tribus-territorio`).
- Todo el inglés nuevo queda anotado como pendiente de revisión por un nativo.
- Tests unitarios, e2e propio (`e2e/idioma-portada-sumarte.spec.ts`) y axe de `/sumarte` en inglés.
- Corrección posterior (commit 8719dd3): motivos, canales y momentos del pedido de contacto se arman desde el diccionario en español, con una sola fuente. `pnpm verificar` (1218 tests) y `pnpm build` pasan.
- Nota de proceso: el implementador marcó tareas con `sed -i`, que CLAUDE.md prohíbe. Las marcas quedaron bien.

## Qué decidir a la mañana
1. **Tarea 2.3 y orden de merge (media).** El paso de consentimiento antes del login (`paso-alta.tsx`) no existe en esta base: lo trae `consentimiento-alta`, que todavía no está mergeado. Hoy no hay texto sin marcar, pero cuando entre, quien use inglés verá ese paso en español sin `lang="es"`, y el e2e no lo detectaría. Acción sugerida: mergear `consentimiento-alta` primero y completar la tarea en este PR; o envolver el paso en `consentimiento-alta`; o abrir un cambio de seguimiento.
2. **Preview roto.** Acción sugerida: mirar los logs de Vercel y, si es por la base de la rama, rebasar sobre `dev` o esperar a que `idioma-base` se mergee. Hasta entonces, el guion manual no se puede recorrer.
3. **Opción `sinNota` en `components/texto-bilingue.tsx` (baja).** No estaba en la spec. Hace que los datos de ejemplo escritos por la plataforma no lleven la nota "Translated from Spanish". Acción sugerida: confirmar que está bien (el design §10 de `idioma-base` pide la nota para textos de comunidades) o quitarla. La referencia de línea del comentario del revisor está mal: lo real es `165-171` (es) y `343-349` (en).
4. **Nombres de niveles.** El glosario no los trae; se puso Seed, Sprout y Root para Semilla, Brote y Raíz. "Seed" puede confundirse con Semillas. Acción sugerida: confirmar o elegir otros.
5. **Texto de elegibilidad (residencia fiscal en el exterior).** Lo tradujo el agente, pero tiene peso legal parecido a "No es una inversión", que la spec deja en español marcado hasta `idioma-legal`. Acción sugerida: pasarlo también a español marcado.
6. **"Lote 7"** se guarda y se muestra en español también en el formulario en inglés. Acción sugerida: aceptarlo por ahora o pedir que se traduzca al mostrarlo.
7. **Fila "Semillas" de la comparativa** sin `translate="no"` (es un dato bilingüe). Acción sugerida: dejarlo, salvo que se prefiera marcarla.

## Revisor: veredicto y hallazgos
Dos pasadas, ambas "con observaciones". Sin problemas de reglas de prototipo ni de seguridad. Comentarios: [1ª](https://github.com/netxgen-2050/lighthouse-platform/pull/91#issuecomment-6224366847) y [2ª](https://github.com/netxgen-2050/lighthouse-platform/pull/91#issuecomment-6224429055).
- Media: tarea 2.3 (punto 1 arriba). Pendiente de Gus.
- Baja: opción `sinNota` (punto 3 arriba). Pendiente de Gus.
- Baja: lista de motivos, canales y momentos duplicada. **Corregida** en 8719dd3 y verificada en la 2ª pasada, sin regresiones.

## Tester: resultado
667 e2e de Playwright pasan, 0 fallan, pero solo contra el servidor local. **Bloqueado** para el preview: `scripts/preview-url.sh` respondió "El deploy de Vercel falló para 8719dd3". El guion manual no se recorrió. [Comentario del tester](https://github.com/netxgen-2050/lighthouse-platform/pull/91#issuecomment-6224474961).

## Para la próxima noche
- Arreglar el deploy del preview (o rebasar sobre `dev` cuando `idioma-base` esté mergeado) y recorrer el guion manual, empezando por los pasos 1, 7 y 8.
- Completar la tarea 2.3 cuando `consentimiento-alta` esté en la base.
- Aplicar lo que Gus decida sobre niveles, elegibilidad y `sinNota`.
- Pasar el inglés nuevo por revisión nativa (`docs/idioma/revisar-nativo.md`).
