# Noche 2026-11-26-m — ux-bien-comun
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/229 (base `agente/ux-celular`) · **Preview:** no hay (ver abajo)

## En una línea
La pantalla Bien común quedó ordenada con índice, secciones plegables y una sola capa de cajas; pasa todo en local, pero no se pudo probar en el preview de Vercel porque nunca apareció.

## Lo que falló o quedó sin verificar (primero)
- **No hay preview de Vercel.** `scripts/preview-url.sh agente/ux-bien-comun` esperó 15 minutos y salió con error ("No apareció el preview… ¿Está conectado el repo a Vercel?"). El tester probó con un build local del commit f2bf0f8, no contra el preview real.
- **No se corrieron:** la suite e2e completa tras las correcciones, el tema oscuro ni axe (accesibilidad) sobre este cambio.
- **Dos fallas ajenas** en la suite completa de la primera corrida: `consentimiento-alta` (re-consentimiento desde Entrar) y axe de `/pactos` con un cambio enviado. Pasaron al correrlas solas. No son de este cambio.
- **Servidores abiertos:** el tester dejó procesos `pnpm start` en los puertos 3022 y 3000 de su sesión (no puede usar kill).
- **Comentario de la 2ª revisión:** lo publicó el orquestador a mano, porque al revisor le rechazaron `pr.sh comentar` (y `pr.sh diff`). Esa revisión miró solo `git show 1c91a1f`.

## Qué quedó hecho (tareas 5/5)
- Índice fijo a la izquierda en compu; en celular, botón "En esta página" que abre una hoja. Marca la sección visible.
- Secciones abiertas: la frase, carriles y puentes, las tres puertas, qué da y qué no tiene FARO, números del barrio.
- Secciones plegadas con resumen de una línea: política, decisiones, qué cambió, Ostrom, parcelas comunes, NFT del lote, preguntas para el abogado. Elegir una plegada desde el índice la despliega.
- Una caja por carril, puente, puerta y regla; un solo aviso legal al principio; cuerpo a 16 px con ancho de 68 caracteres.
- Decisiones y Ostrom son tablas desde 640 px; en celular, filas de dos líneas.
- Textos nuevos en es y en; `docs/idioma/revisar-nativo.md` actualizado.
- Altura a 390 px: unos 5.399 px plegado (la auditoría tenía ~8.200); 10.963 px desplegado entero. En compu, 3.431 px plegada y 6.455 desplegada.
- `pnpm verificar` (201 archivos, 2853 tests), `pnpm build` y `openspec validate --strict` en verde.

## Qué decidir a la mañana
1. **Etiquetas "idea" de Ostrom** pasaron al chip "En discusión", porque `ChipEstado` no tiene "idea". Acción: aceptarlo, o pedir que se agregue el estado "idea".
2. **Estado "abierta"** ahora se lee "Abierta". Acción: confirmar el texto.
3. **Aviso e índice quedan en 14 px** (vienen de ux-base) y están exentos del piso de 16 px en el e2e. No se tocó la calculadora del barrio. Acción: decidir si se sube a 16 px en otro cambio.
4. **El ⚖ se movió de lugar:** el del NFT del lote pasó del título al primer párrafo (un botón dentro de otro botón no es válido), y el de "En una frase" también se movió, cosa que el PR no decía. Acción: mirar que sigan donde corresponde.
5. **Preview de Vercel:** revisar la conexión repo-Vercel o si se generan previews para ramas cuya base es `agente/*`. Acción: arreglarlo antes de mirar el PR en pantalla.
6. **Fallas ajenas** de consentimiento-alta y axe de `/pactos`: conviene un cambio aparte.
7. **Merge:** este PR apunta a `agente/ux-celular`, no a `dev`. Nadie mergeó nada.

## Revisor: veredicto y hallazgos
Tres pasadas. Veredicto final: listo para revisión humana, sin hallazgos nuevos. Cubre los 4 requirements de la spec. Verificó `pnpm verificar` y e2e de bien-comun 35/35.
- **1ª pasada (con observaciones):** [media] el índice marcaba una sección de más arriba al elegir las últimas; [baja] ancla mal formada (`#%E0`) tiraba la pantalla de error; [baja] el resumen contaba todas las decisiones y no solo las abiertas; [baja] la línea "decidida el… por…" estaba en 14 px. Corregidos en 1c91a1f.
- **2ª pasada (con observaciones, 0 altas):** [media] cualquier tecla (incluso Tab) soltaba la sección elegida; [baja] no se soltaba al arrastrar la barra de scroll; [baja] "1 decisiones abiertas" y sin texto para 0. Corregidos en f2bf0f8, la última vuelta permitida.
- **3ª pasada (ok):** nota que no cuenta como hallazgo: si la sección elegida ya está a la vista no hay scroll, y durante 1,5 s se ignora el scroll de la persona. Se corrige solo con el siguiente movimiento.

## Tester: resultado
Pasó en local, **no contra el preview**. Commit f2bf0f8, build de producción local: `e2e/bien-comun.spec.ts` en chromium, 35/35 (índice en compu y celular, secciones, caja única y 16 px, sin scroll horizontal a 390 px, `?lang=en`, números del barrio con sesión). Su primer intento con `BASE_URL` dio 401 masivo (servidor sin modo de prueba) y el reintento de la suite completa superó el tiempo máximo. No hubo fallas, así que no hubo vuelta de corrección.

## Para la próxima noche
- Correr la suite e2e completa, axe y tema oscuro sobre este cambio cuando haya preview.
- Cambio aparte para las dos fallas ajenas.
- Si se decide, subir aviso e índice a 16 px y agregar el estado "idea" a `ChipEstado`.
- Las capturas están en `.noches/tmp/bc-*.png` (ignoradas por git, no están en el PR).
