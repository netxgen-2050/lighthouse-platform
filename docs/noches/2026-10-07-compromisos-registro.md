# Noche 2026-10-07 — compromisos-registro
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/10 (base `agente/territorio-ficha`) · **Preview:** https://lighthouse-platform-gj5zzq2z1-net-xg-en.vercel.app

## En una línea
Quedó lista la página `/compromisos`, donde se registran ofertas y necesidades de tiempo y bienes, guardadas solo en el navegador. No falló nada. Hay una decisión tuya pendiente y una pregunta legal para Gabriel.

## Qué quedó hecho (tareas 7/7)
- Lógica en `lib/compromisos/`: validación, estado, formato y 13 tests propios. La "clase" solo admite Tiempo o Bienes, sin plata.
- Página `/compromisos` con formulario, lista, "Quitar" y "Borrar todo". Guarda en `localStorage` y no manda nada al servidor. Muestra el aviso de modo demostración y el de datos de ejemplo.
- Enlace "Compromisos" en el encabezado.
- Pruebas end-to-end (e2e) de todos los escenarios de la spec.
- La revisión pasó por tres rondas. Se corrigieron tres cosas: el lector de pantalla no anunciaba el segundo registro seguido, aparecía un "Todavía no registraste compromisos." falso al recargar, y el id fallaba fuera de HTTPS.

## Qué decidir a la mañana
1. **Tribus vacantes en "Para quién" (media).** El selector ofrece "Barrio 3" y "Barrio 8" (vienen de `lib/tribus/datos.ts`). La proposal dice que no se mencionan barrios. Acción sugerida: filtrar las tribus con `estado === "vacante"`. Es un cambio de una línea, pero es decisión tuya: sacarlas o aceptarlas.
2. **Leyenda legal "no vinculante" (pregunta abierta).** La spec no la incluye y se dejó afuera a propósito, porque ningún agente redacta textos legales. Acción sugerida: consultar a Gabriel antes de guardar datos reales de personas.
3. **Descripción libre sin filtro de montos (riesgo declarado en el design).** Una persona podría escribir un monto en la descripción. Acción sugerida: aceptar el riesgo mientras sea solo demostración, y revisarlo si se pasa a datos reales.
4. **Merge.** El PR #10 está sin mergear. Va apilado sobre `agente/territorio-ficha`, así que conviene mergear primero ese. Solo vos mergeás.

## Revisor: veredicto y hallazgos
Veredicto final: listo para revisión humana (3 rondas).
- Ronda 1 (con observaciones):
  - [media] El aviso del lector de pantalla no anunciaba el segundo registro. Corregido.
  - [baja] Aparecía un estado vacío falso al recargar. Corregido.
  - [baja] `crypto.randomUUID` solo existe en contextos seguros. Corregido con un id de respaldo.
  - [media] Tribus vacantes en el selector. **Sigue abierto, ver arriba.**
- Ronda 2 (con observaciones): la primera corrección alternaba un espacio al final del texto, y eso no llega al lector de pantalla. El e2e miraba el DOM y no lo detectaba.
- Ronda 3 (listo): la región se vacía y 50 ms después se repone "Compromiso registrado.". El e2e usa un `MutationObserver` para comprobarlo. Sin hallazgos nuevos.
- No se encontraron textos legales, montos, lotes, secretos ni pedidos al servidor.

## Tester: resultado
Pasa.
- `pnpm test:e2e` contra el preview: 41 pasaron, 0 fallaron.
- Guion manual de 8 pasos, todos OK. El paso 1 se verificó con `curl` y los pasos 2 a 8 con los escenarios e2e corridos contra el preview.
- Limitación: el tester no pudo correr un test temporal de Playwright fuera de `e2e/` por falta de aprobación. Por eso no hubo recorrido visual propio. El archivo `.noches/tmp/guion.spec.ts` quedó sin ejecutar.

## Para la próxima noche
- Cuando decidas lo de las tribus vacantes, un cambio chico lo resuelve.
- Definir con Gabriel la leyenda "no vinculante" antes de pasar de demostración a datos reales.
- Considerar un recorrido visual del flujo (capturas o prueba manual tuya en el preview), que esta noche no se hizo.
