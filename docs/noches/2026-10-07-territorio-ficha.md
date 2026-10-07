# Noche 2026-10-07 — territorio-ficha
**PR:** no hay (ver abajo) · **Preview:** https://lighthouse-platform-km433rgl2-net-xg-en.vercel.app (commit a6eb838)
**Rama:** `agente/territorio-ficha` (pusheada, sale de `agente/territorios-modelo`)

## En una línea
La ficha del territorio quedó construida y el tester la aprobó, pero **el PR no se abrió** y **el revisor no corrió**: falta que vos autorices o hagas el PR.

## Qué falló (primero)
- **Sin PR.** El implementador no pudo escribir `.noches/tmp/pr-territorio-ficha.md` (permiso denegado) y no esquivó la denegación. Falta solo este comando:
  `gh pr create --base agente/territorios-modelo --head agente/territorio-ficha`
- **El revisor no corrió**, porque no hay PR. Queda pendiente.
- El reporte del tester no se pudo dejar como comentario en un PR; está resumido más abajo.

## Qué quedó hecho (tareas 5 de 7)
- 1.1 Ficha `app/territorios/[id]/page.tsx`: título, ubicación, descripción, superficie (o "sin dato"), resumen, los 12 barrios enlazados a `/tribus/[id]` con el estado escrito, bienes comunes por nombre y aviso de datos de ejemplo.
- 1.2 Página de "no encontrado" del territorio.
- 1.3 Sin colores sueltos ni `<main>` duplicado.
- 2.1 Enlace "Territorio" en el encabezado.
- 3.1 Tests e2e en `e2e/territorio.spec.ts`.
- Sin marcar: 0.1 (el prerrequisito `territorios-modelo` todavía no está en `main`; este cambio depende de ese PR) y 4.1 (parcial: build, verificar y e2e en preview hechos; faltan la captura de la ficha y el PR).

## Qué decidir a la mañana
1. **Abrir el PR** (o autorizar que se abra) con el comando de arriba. Base: `agente/territorios-modelo`. Acción sugerida: mergear primero `territorios-modelo` a `main` y después este.
2. **Página "no encontrado" (observación del tester, menor).** Al entrar a `/territorios/no-existe` aparece la página global ("Volver a las tribus") y no la del territorio ("Volver a la portada"). Pasa porque la ruta no admite parámetros fuera de la lista. No se tocó por estar fuera de alcance. Acción sugerida: aceptarlo como está, o pedir un cambio chico que use el mensaje del territorio.
3. **Captura de la ficha** (parte de 4.1): sacarla y agregarla al PR.
4. Cuando el PR exista, **correr el revisor**.

## Revisor: veredicto y hallazgos
No corrió (no hay PR). Sin hallazgos. Vueltas de corrección: ninguna.

## Tester: resultado
Pasa, con una observación menor (la del 404, arriba).
- Playwright sobre el preview: 27 pasaron, 0 fallaron (8 son de `territorio.spec.ts`; el resto, marco, portada y tribus).
- Guion contra la spec, todo bien: `/territorios/lighthouse` responde 200; un solo título "Lighthouse"; superficie "~1.000 ha (ilustrativa)"; resumen 5+5+2 = 12; barrios enlazados con el estado escrito; aviso de ejemplo; 404 con enlace para volver; se recorre con teclado; sin plata ni lotes; un solo `main`.
- Local: `pnpm verificar` y `pnpm build` en verde, e2e locales verdes.

## Para la próxima noche
- Resolver el PR y el revisor de este cambio antes de empezar otro que dependa de él.
- Mergear `territorios-modelo` para poder marcar 0.1.
- Decidir lo del 404 del segmento.
- Tomar la captura de la ficha para cerrar 4.1.
