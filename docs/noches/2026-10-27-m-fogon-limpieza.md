# Noche 2026-10-27-m — fogon-limpieza
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/111 · **Preview:** no hay (el deploy de Vercel falló)

## En una línea
El código está hecho y revisado (el revisor lo dio por listo), pero **ninguna prueba e2e se corrió en toda la noche**: ni el implementador, ni el revisor, ni el tester pudieron. No se puede asegurar que /fogon funcione en el navegador.

## Qué falló (primero)
- **Los e2e nunca se corrieron.** Causa: el proyecto pide pnpm 12.4.2 y en el entorno de la noche `pnpm` falla con "Failed to switch pnpm to v12.4.2". Además el Node local es 20 y el proyecto pide 22 o más.
- **El preview de Vercel falla en ~1 segundo** en los tres commits del PR (último: `80449915`) y también en el PR #110 (`agente/sumarte-periodo-coherente`), mientras que `dev` despliega bien. Parece un problema de Vercel/pnpm con las ramas de agentes, no del código de este cambio.
- **El tester quedó BLOQUEADO:** sin preview no probó nada de su guion.
- Lo que sí pasó: `pnpm verificar` y `pnpm build` en verde (la primera vez `verificar` falló por un timeout ajeno en `lib/db/guarda.test.ts`; pasó al reintentar).

## Qué quedó hecho (tareas 2/6 marcadas en tasks.md, ver nota)
- /fogon queda con tres decisiones (huerta, presupuesto, facilitador/a) y filtros Todas / Tribu / Fideicomiso.
- Las decisiones de bomba solar y animales pasaron a `EJEMPLOS_COMUN` en `lib/fogon/datos.ts`, con su regla y su ⚖, a la espera de `fogon-gobernanza-fractal`.
- Salió el párrafo de residencia fiscal y el motivo "Solo residentes" ya no se muestra. El requisito `residente` sigue en `lib/permisos` y `motivoSinVoto`, como pide el alcance.
- `leer` ignora votos de decisiones que ya no existen (test con un voto en `bomba`).
- Se reescribió `e2e/fogon.spec.ts` y se agregó `e2e/reportar-en-todas.spec.ts` (ahora incluye `/fogon/simulador`) con una prueba propia del caso "Sin eventos".
- Marcadas: 1.1 y 1.2. **Sin marcar: 2.1, 2.2, 3.1 y 4.1**. El código de 2.1, 2.2 y 3.1 está escrito, pero las tareas piden verificarlas con e2e, que no corrieron. 4.1 exige los e2e en verde.
- Los textos de /fogon no pasan por los diccionarios es/en: solo se quitó texto, no se agregó.

## Qué decidir a la mañana
1. **Arreglar el entorno y el build de Vercel de la rama** (versión de pnpm / Node 22). Acción: revisar por qué falla el deploy en ramas de agentes (también el #110) y correr `pnpm test:e2e e2e/fogon.spec.ts e2e/reportar-en-todas.spec.ts e2e/accesibilidad.spec.ts`. No mergear antes de eso.
2. **Hallazgo 4 del revisor (baja, tuyo):** /fogon/simulador sigue mostrando "Asamblea de residentes + Consejo, después de la aprobación municipal" (`lib/series/escenarios.ts:67`, `e2e/fogon-simulador.spec.ts:131`). El PR cumple la spec, que solo saca la Asamblea de /fogon. Acción sugerida: decidir si se cambia en un cambio aparte o se deja hasta `fogon-gobernanza-fractal`.
3. **Marcar las tareas 2.1, 2.2, 3.1 y 4.1** cuando los e2e estén en verde.

## Revisor: veredicto y hallazgos
- Ronda 1: con observaciones. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/111#issuecomment-6441746309
  1. [media] `e2e/fogon.spec.ts:21`: `toHaveText` exacto fallaría por el "✓" oculto del botón activo. **Corregido.**
  2. [baja] `reportar-en-todas` no incluía `/fogon/simulador`. **Corregido.**
  3. [baja] Faltaba prueba propia del caso "Sin eventos". **Corregido.**
  4. [baja, fuera del diff] Texto del simulador (ver arriba). **Abierto, para Gus.**
- Ronda 2: listo para revisión humana, sin hallazgos nuevos; los 4 requisitos de la spec están cubiertos. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/111#issuecomment-6441898873. Tampoco pudo correr pnpm en su entorno.

## Tester: resultado
**BLOQUEADO, nada probado.** `scripts/preview-url.sh` falló porque el deploy de Vercel del commit `80449915` está fallido. Local, `pnpm --version` falla y Node es v20.11.1. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/111#issuecomment-6441915410.
Quedaron sin probar los 4 pasos del guion: tres decisiones y filtros; el voto en huerta persiste al recargar; la nota del Fideicomiso sin Pase con enlace a Sumarte; el botón Reportar en el rail y en /fogon/consultas con Enter. No hubo vuelta de corrección porque no hubo fallas de código, solo de entorno.

## Para la próxima noche
- Dejar andando pnpm 12.4.2 y Node 22 en el entorno de la noche, y el deploy de Vercel para ramas `agente/*`. Sin eso, los e2e y el tester no sirven.
- Con eso resuelto, volver a correr los e2e y el guion del tester sobre este PR y marcar las tareas pendientes.
- Después, retomar `fogon-gobernanza-fractal` para las decisiones de la asamblea (bomba solar y animales).
