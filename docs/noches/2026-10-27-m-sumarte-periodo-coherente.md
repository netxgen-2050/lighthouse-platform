# Noche 2026-10-27-m — sumarte-periodo-coherente
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/110 (base `dev`, rama `agente/sumarte-periodo-coherente`) · **Preview:** no disponible (el deploy de Vercel falló)

## Lo que bloquea o queda pendiente (leer primero)
- **El preview de Vercel falla** en los commits 2972029 y 00686b2, aunque `dev` despliega bien y `pnpm build` local da verde. Nadie pudo ver el log del deploy, así que la causa no está diagnosticada. Por eso el tester no pudo probar contra el preview. Hay que abrir el log en Vercel (https://vercel.com/net-xg-en/lighthouse-platform/5yd9JLYZSWCxFYvXVyX74ZoXaY98) antes de dar el PR por bueno.
- **La tarea 0.1 sigue sin marcar:** esperan tu confirmación dos supuestos que se implementaron igual (ver "Qué decidir a la mañana").
- **Orden de archivado:** hay que archivar `sumarte-planes` antes que este cambio; si no, `openspec archive` lo rechaza.
- Un detalle menor del proceso: en la primera ronda el revisor no pudo comentar en el PR (`scripts/pr.sh comentar` fue rechazado por permisos). Revisó con `git diff` y desde la segunda ronda sí pudo comentar. No quedó nada sin registrar.

## En una línea
En `/sumarte`, el selector Mensual/Anual ahora cambia el precio de Miembro y de Plan Tribu a la vez, el Pase Fundador dice "pago único · de por vida", y el código está listo; faltan tus dos confirmaciones y que el preview despliegue.

## Qué quedó hecho (tareas 8/9)
Se corrige la confusión de Bertrand del 23-oct (con Anual, Miembro pasaba a USD 100/año pero Tribu seguía en USD 60/mes y el Pase parecía anual).
- Mensual: Miembro USD 10/mes, Plan Tribu USD 60/mes, sin "2 meses gratis".
- Anual: Miembro USD 100/año, Plan Tribu USD 600/año, ambas con "2 meses gratis" y ninguna dice "/mes".
- Pase Fundador: "pago único · de por vida" (en inglés "one-time payment · lifetime"), con letra de tamaño normal (16 px o más), igual en Mensual y Anual.
- Con pesos (ARS) y Anual: Miembro ARS 140.000/año, Tribu ARS 840.000/año; en Mensual, ARS 84.000/mes.
- Hechas: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2. **Pendiente: 0.1** (tu confirmación).
- `pnpm verificar` (1303 tests) y `pnpm build` en verde. En el primer intento, dos tests de base de datos (PGlite, ajenos al cambio) dieron timeout por carga y pasaron al repetir.

## Qué decidir a la mañana
1. **Hallazgo media: "de por vida" para el Pase Fundador.** Es una promesa de duración con posible peso legal. Convive con "1 año de membresía incluida", y el texto del ⚖ `pasefundador` dice "una membresía" (no se tocó, como pide el proposal). Además el texto vive fuera del catálogo legal (`lib/legal/terminos.ts`). Acción sugerida: confirmar que "de por vida" es lo que querés; si sí, pedir que pase al catálogo con `borrador: true` y que el ⚖ quede coherente; si no, pedir otro texto.
2. **Hallazgo media: Plan Tribu anual a USD 600.** Es un supuesto (10 veces el mensual, igual que Miembro). Acción sugerida: confirmar o dar el precio correcto; cambiarlo es una línea en `lib/sumarte/datos.ts:20` (`PLAN_TRIBU = { mensual: 60, anual: 600 }`) más ajustar spec y tests.
3. **Deploy de Vercel fallando.** Acción sugerida: mirar el log del deploy; si es un problema de entorno, volver a lanzarlo; si es del código, abrir un cambio para arreglarlo.
4. Anotar tu respuesta sobre 1 y 2 en el PR para poder marcar la tarea 0.1.

## Revisor: veredicto y hallazgos
Veredicto final (tercera ronda): **con observaciones**, quedan solo las dos decisiones tuyas.
- Ronda 1: 4 hallazgos (0 alta, 2 media, 2 baja). Las 2 medias son las de arriba. Las 2 bajas: faltaba test con pesos y Anual (resuelto), y el e2e no comprobaba que Miembro no diga "/año" en Mensual ni el tamaño del texto del pase (resuelto).
- Ronda 2: confirmó esos dos arreglos y encontró uno bajo nuevo: el e2e del nivel Raíz no verificaba "de por vida". Resuelto en el commit 00686b2.
- Ronda 3: todos los requisitos y escenarios de la spec están cubiertos por código y e2e. Sin cambios de seguridad ni fuera de alcance; cumple las reglas de CLAUDE.md (sin cobros reales, solo tokens del tema, el "2 meses gratis" se dice con texto).
- Comentarios en el PR: segunda y tercera ronda publicadas.

## Tester: resultado
Pasa en local, **pero no contra el preview** (el deploy falló y `scripts/preview-url.sh` no devolvió URL). Probó con un build de producción propio en localhost:3013.
- Suite completa de Playwright: 715 pasan, 1 falla: `e2e/tribus.spec.ts:32` ("listado: tarjetas distintas por estado", el clic en "Proponer una comunidad" se quedó en /tribus). Al repetirlo junto con `sumarte.spec.ts` pasaron los 43; se toma como intermitente y ajeno (el PR no toca tribus).
- Guion manual de 5 pasos: los cinco figuran como correctos, pero verificados con los e2e del PR en local, no a mano en un preview. Los otros niveles del Pase (aparte del de por defecto y Raíz) no tienen aserción propia.
- Reporte completo en el PR. No hizo falta vuelta extra del tester.

## Para la próxima noche
- Diagnosticar el deploy de Vercel de la rama (primero, porque impide la prueba real).
- Con tu respuesta, cerrar la tarea 0.1 y, si cambian los supuestos, actualizar spec, proposal, datos y tests.
- Evaluar llevar "de por vida" al catálogo legal como borrador y alinear el ⚖ `pasefundador`.
- Opcional: agregar aserciones de "de por vida" para los demás niveles del Pase.
- Revisar si `tribus.spec.ts:32` es realmente intermitente (otro carril o un problema de carga).
- Archivar `sumarte-planes` y después este cambio.
