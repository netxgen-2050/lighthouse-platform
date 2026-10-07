# Noche 2026-10-07 — territorio-ficha
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/12 · **Preview:** https://lighthouse-platform-fwozcvdtk-net-xg-en.vercel.app
**Rama:** `agente/territorio-ficha`

## En una línea
Nada falló: la ficha del territorio está lista, el revisor la dio por buena en la segunda ronda y el tester la aprobó. Quedan tres cosas para que decidas vos, todas chicas.

## Qué decidir a la mañana
1. **Página "no encontrado" del territorio (hallazgo bajo del revisor).** El archivo `app/territorios/[id]/not-found.tsx` nunca se muestra, porque `page.tsx:9` tiene `dynamicParams = false`. Al entrar a `/territorios/no-existe` aparece la página global (con "Volver a las tribus") y no la del territorio (con "Volver a la portada", como pedía la tarea 1.2). La spec se cumple igual: hay 404 y un enlace para volver. Acción sugerida: **borrar el archivo y quedarte con la global** (lo más simple). La otra opción es sacar `dynamicParams = false` para que se use la del territorio, pero eso puede tener efectos en el build y no vale la pena por un texto.
2. **Texto del aviso en el pie (no lo introduce este PR).** CLAUDE.md pide "Prototipo interno · datos de ejemplo", pero `components/pie.tsx:19` dice "Prototipo en desarrollo. Datos de ejemplo." (ya estaba así en `main`). Además, el paso 6 del guion del PR pide confirmar un texto que no existe. Acción sugerida: pedir un cambio aparte que alinee el pie con CLAUDE.md; no bloquea este PR.
3. **Error `NoFallbackError` en el log del servidor durante los e2e.** No hace fallar ningún test y nadie lo investigó. Probablemente viene del mismo `dynamicParams = false` del punto 1. Acción sugerida: si decidís el punto 1, mirar si el error desaparece; si no, pedir que se investigue antes de mergear.

Para mergear: nada más bloquea. Recordá que el merge a `main` lo hacés vos.

## Qué quedó hecho (tareas 9 de 9)
- 0.1 Prerrequisitos confirmados en `main` (navegación base y modelo de territorios).
- 1.1 a 1.3 Ficha en `/territorios/lighthouse`: título, ubicación, superficie (o "sin dato"), resumen que suma 12, los 12 barrios enlazados a su tribu con el estado escrito, bienes comunes por nombre y aviso de datos de ejemplo. Página de "no encontrado" creada (ver punto 1). Sin colores sueltos ni `<main>` duplicado.
- 2.1 Enlace "Territorio" en el encabezado.
- 3.1 Tests e2e en `e2e/territorio.spec.ts`.
- 4.1 `pnpm verificar` y `pnpm build` en verde, y e2e sobre el preview.
- 5.1 y 5.2 Se trajo `main` a la rama sin conflictos (se borró `app/tribus/[id]/not-found.tsx`, así venía de `main`) y se actualizó la descripción del PR.
- No confirmé en el material que recibí que la captura de la ficha esté adjunta al PR; fijate al abrirlo.

## Revisor: veredicto y hallazgos
**Ronda 1: con observaciones.**
- [media] `/territorios/lighthouse` no estaba en la auditoría de accesibilidad (`e2e/accesibilidad.spec.ts`). Corregido: ahora hay 17 rutas, incluidas `/territorios/lighthouse` y `/territorios/no-existe`.
- [baja] La regla "el dato que falta no es cero" no tenía test en la superficie. Corregido: nuevo ayudante `textoSuperficie` en `lib/territorios/datos.ts` ("sin dato" si falta o viene vacía), que la página usa, con test. Ojo: el test prueba el ayudante, no la página dibujada, porque el único territorio tiene superficie.
- [baja] La página "no encontrado" del territorio no se muestra nunca. Sigue abierto: es el punto 1.

**Ronda 2: listo para revisión humana.** Verificó las correcciones leyendo el diff (no corrió tests). Solo queda el punto 1 y la nota del pie (punto 2).

## Tester: resultado
**Pasó.** Playwright sobre el preview: 70 pasaron, 0 fallaron (incluye los 7 de `territorio.spec.ts` y la auditoría de accesibilidad en las dos rutas nuevas). El guion manual dio 6 de 6, cubierto por los e2e. Con curl: `/territorios/lighthouse` responde 200 y `/territorios/no-existe` responde 404.
Limitación: el permiso para inspeccionar el HTML descargado fue denegado, así que no se confirmó a mano el contenido con curl; lo cubren los e2e.
Local (implementador): 165 tests unitarios, build y 25 e2e de la vuelta de corrección en verde.

## Para la próxima noche
- Aplicar lo que decidas en el punto 1 (borrar el archivo o sacar `dynamicParams = false`) y revisar si el `NoFallbackError` desaparece.
- Proponer un cambio chico para alinear el texto del pie con CLAUDE.md.
- Si aparece un segundo territorio, o uno sin superficie, agregar un test sobre la página dibujada de la rama "sin dato".
