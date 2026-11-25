# Noche 2026-11-23-m — rediseno-invertir
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/206 · **Preview:** https://lighthouse-platform-git-agente-red-4cd87b-netxgen-2030-projects.vercel.app (ver el aviso de abajo: el tester no lo pudo usar)

## En una línea
Quedó hecha la página nueva Invertir (`/invertir`), con las 9 tareas cerradas y todo en verde en local. **Lo que no se pudo hacer:** probarla en el preview de Vercel. El tester esperó 15 minutos y no encontró ningún despliegue. Hay una decisión tuya pendiente (dos textos legales casi iguales) y una base del PR que no es `dev`.

## Qué quedó hecho (tareas 9/9)
Es el quinto y último cambio del rediseño. Qué hay ahora:
- Página `/invertir` con el barrio Norte en financiamiento. Es pública, pero sin sesión solo muestra un aviso para entrar. Con sesión se calculan los números en el navegador (el HTML no los lleva; esto oculta, no protege, como dice ADR-015).
- Indicadores: meta de la obra, lo juntado ("sin dato"), mes de devolución o "no en 6 años", y la parte de cada pago que va al común.
- Prima objetivo con su etiqueta "no es una promesa".
- "Cómo funciona" con los ⚖ de Token Inversor y fideicomiso del barrio.
- Curva de devolución dibujada a mano (SVG), con una tabla equivalente por trimestre.
- Libro del barrio por trimestre.
- Cuatro sellos antes del primer número. No hay ningún botón de invertir ni cobro.
- Término legal nuevo `nooferta` ("No es una oferta"), marcado como borrador, en español e inglés.
- Menú: Invertir pasa a existir, así que el menú tiene cinco destinos. Se actualizaron tests y `e2e/marco.spec.ts`.
- Los números salen de `resumenObraBarrio()`. Se sumó `serieMensualDelBarrio` en `lib/bien-comun/barrio.ts`, sin cambiar resultados ni tests anteriores.

Verificaciones del implementador: `pnpm verificar` (2757 tests), `pnpm build` y `openspec validate rediseno-invertir --strict` pasan.

## Qué decidir a la mañana
1. **Bloqueo: no hay prueba en el preview.** El tester corrió `scripts/preview-url.sh agente/rediseno-invertir`, esperó 15 minutos y no apareció ningún despliegue para el commit `d50f1e7`. La API de GitHub devolvió 0 despliegues. Además, el PR apunta a `agente/rediseno-mi-tierra` y no a `dev`; el tester sospecha que Vercel no despliega esa rama.
   - Dato que contradice al tester: en el PR hay un comentario del bot de Vercel con un despliegue "Ready" (actualizado 2026-11-24 01:31 UTC) y esta URL de preview: https://lighthouse-platform-git-agente-red-4cd87b-netxgen-2030-projects.vercel.app. El nombre de la rama aparece cortado ("agente-red"), así que es posible que el script no lo encontrara por eso. No lo pude confirmar y no sé si ese despliegue corresponde al último commit.
   - Acción sugerida: abrir esa URL y mirar a ojo lo que ningún test cubre (los dos últimos puntos de "Tester"). Si es el preview de este PR, el bloqueo era un falso negativo del script. Si no lo es, revisar la conexión del repo con Vercel.
2. **[Necesita tu decisión] Dos ⚖ casi iguales.** Quedan `nooferta` ("No es una oferta", nuevo, lo pide la spec) y `noesoferta` ("Esto no es una oferta", ya existía en la línea 180 de `lib/legal/terminos.ts`), con explicaciones distintas. Acción sugerida: unificarlos en uno o dejar los dos a propósito. Nadie lo tocó.
3. **El libro del barrio es decisión de diseño del implementador.** Cada trimestre agrupa los meses N-2 a N (el primero, de 0 a 3) y omite las filas sin movimiento. Acción sugerida: confirmar que te sirve así o pedir otro agrupado.
4. **Enlace a `/netx/financiamiento`.** Se muestra con la capacidad `vista-netx`, que hoy tiene cualquier persona con sesión. Acción sugerida: decidir si queda así hasta que existan roles reales.
5. **La base del PR no es `dev`.** Apunta a `agente/rediseno-mi-tierra`. Acción sugerida: mergear los PR del rediseño en orden, o cambiar la base antes de integrar.
6. **La meta no se compara con `lib/barrios/norte.ts`.** Ese módulo no expone la infraestructura; ambos leen `resumenObraBarrio`. Riesgo bajo, pero ningún test lo cubre. Acción sugerida: dejarlo así o pedir que `norte.ts` exponga el dato.
7. **Texto de la spec por ajustar al archivar.** `openspec/changes/rediseno-invertir/specs/invertir/spec.md:50` dice "movimientos del fideicomiso" y "cuotas que entran", menos preciso que el rótulo nuevo. No bloquea.

## Revisor: veredicto y hallazgos
Primera pasada: con observaciones, 4 hallazgos (1 media, 3 bajas). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/206#issuecomment-7119019663
1. [media] El libro rotulaba mal dos montos: la fila de cuotas mostraba solo la parte del fideicomiso, y "Va al común" no pasa por el fideicomiso aunque la nota decía "Movimientos del fideicomiso". **Corregido** en `d50f1e7`: ahora dice "Entra al fideicomiso (su parte de las cuotas)" y la nota aclara que el común sale directo de cada pago (es y en).
2. [baja] Dos textos sin uso (`cargando` y `curva.ejeMonto`); el eje de montos no tenía título. **Corregido**: se borró `cargando` y `ejeMonto` es ahora el título visible del eje (el margen superior del SVG pasó de 16 a 32). El conteo en `docs/idioma/revisar-nativo.md` pasó de 43 a 42.
3. [baja] Ids fijos que se duplicarían con más barrios. **Corregido**: `inv-${b.id}-como/curva/libro`.
4. [baja, necesita tu decisión] `nooferta` frente a `noesoferta`. **Sin tocar** (ver arriba, punto 2).

Segunda pasada: "listo para revisión humana", sin hallazgos nuevos. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/206#issuecomment-7119189923. Verificó las 3 correcciones, sin regresiones (margen del SVG, solo tokens del tema, un único `<main>`). Corrió lint, tipos y tests unitarios (verde). No corrió e2e ni build.

## Tester: resultado
Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/206#issuecomment-7119516677
- **Pasa en local, no probado en el preview** (bloqueo, ver arriba).
- Probó con `pnpm build` y `pnpm start`: Playwright 1353 pasaron, 0 fallaron, 3 omitidos. La primera corrida falló en el build por la descarga de fuentes de Google (red) y pasó al repetir. El implementador vio el mismo problema una vez.
- `e2e/invertir.spec.ts` (8 tests) pasó. Cubre los pasos 1 a 6 del guion del PR: sin sesión sin números, sellos antes del primer indicador, ⚖ "No es una oferta", indicadores y prima, curva con tabla y libro con mes 3, inglés y 390 px sin scroll horizontal. No hubo recorrido manual ni contra el preview.
- **Sin cubrir por ningún test:** los ⚖ de Token Inversor y fideicomiso con su marca de borrador, y el título del eje de montos de la curva (cambió en `d50f1e7`). El implementador tampoco miró el gráfico a ojo. Hay que verlo en el preview.
- Aviso de lint anterior a este cambio en `app/territorios/[id]/vistas/paneles.tsx`; no es de este PR.

## Para la próxima noche
- Resolver el preview de Vercel (bloqueo) y repetir la prueba contra él.
- Decidir `nooferta` frente a `noesoferta` y aplicarlo.
- Ajustar `spec.md:50` al archivar el cambio.
- Si querés, sumar un test que mire los ⚖ de Token Inversor y fideicomiso con borrador, y el título del eje de la curva.
- Rondas de esta noche: 1 vuelta de corrección del revisor (de máximo 2). Nadie mergeó ni tocó `dev` ni `main`.
