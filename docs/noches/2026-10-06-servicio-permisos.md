# Noche 2026-10-06 — servicio-permisos
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/3 · **Preview:** https://lighthouse-platform-md6eg0pb4-net-xg-en.vercel.app

## En una línea
Salió bien: el servicio que decide quién puede entrar a qué puerta quedó hecho, revisado y probado. No falló nada, pero hay 4 decisiones de producto que te tocan a vos antes de mergear.

## Qué quedó hecho (tareas 5/5)
- 1.1 Tipos y tabla de la nota 18 §3 como datos (`lib/permisos/tipos.ts`, `tabla.ts`). Hecha.
- 2.1 Cálculo (`calcularPermisos(persona)` y `puede(persona, puerta, tribuId?)`), sin efectos secundarios. Hecha.
- 2.2 Test de todas las celdas: 6 columnas × 9 puertas, más los 3 pases por separado. Hecha.
- 3.1 README con la tabla y lo que está "a decidir". Hecha.
- 4.1 `pnpm verificar` (134 tests) y `pnpm build` en verde. Hecha.

Nota: el refuerzo de voz por presencia en el Fondo Común sale como `"a decidir"`, nunca como número, y solo aparece si hay pase.

Avisos menores:
- La descripción del PR dice 77 tests. Es un número viejo; hoy son 134. No es una falla.
- No hubo vuelta extra del tester; no hizo falta.
- El revisor usó las 2 vueltas de corrección máximas (3 rondas en total).

## Decisiones que necesitan a Gus
1. **Voz de tribu acotada a "su tribu"** (`tabla.ts:56`). La nota dice "✓ (según estatuto)" sin aclarar "su tribu"; el código la limita a la propia tribu. Acción sugerida: confirmar si es lo que querés o abrirla a cualquier tribu. Además, el README la presenta como si viniera de la nota; conviene aclararlo.
2. **Qué grado gana cuando dos fuentes abren la misma puerta** (`calcular.ts:4-11`). Hoy gana el que va primero en un orden interno que no sale de la nota. Ejemplo: un residente aceptado en una tribu, consultando voz de tribu, obtiene "según estatuto" y no "abierta". Acción sugerida: decir cuál debería ganar, o aprobar el orden actual.
3. **Residente en sala de tribu** (`tabla.ts:47`). La nota pone ✓ sin "(su tribu)"; está transcripto literal, así que el residente entra a la sala de cualquier tribu. Acción sugerida: confirmar o restringirlo a su tribu.
4. **Fila "Descuentos y prioridad en estadías y eventos"** de la nota 18: no está en la spec y no se implementó (la spec lo permite). Si la querés, va en un cambio aparte con revisión humana, porque toca plata y lotes. Acción sugerida: decidir si se abre ese cambio.

Ya resuelto con tu confirmación: son 6 columnas, no 7 (la spec decía 7; se corrigió `tasks.md`).

## Revisor: veredicto y hallazgos
Veredicto final (ronda 3): con observaciones, 0 hallazgos alta/media/baja pendientes. La tabla coincide celda por celda con la nota 18 §3 y se respetan las reglas de producto.

- Ronda 1 (0 alta, 2 media, 4 baja): sin `tribuId` se daba acceso completo a sala de tribu de más; el test de tabla dejaba unas 11 celdas sin verificar; faltaba verificar el refuerzo de voz en Fondo Común; `tasks.md` decía 7 columnas. Todo corregido.
- Ronda 2 (0 alta, 1 media, 1 baja): `tribusPropias` devolvía una tribu ajena como propia; el README no avisaba que `calcularPermisos(persona)` sin `tribuId` muestra cerradas sala y voz de tribu. Todo corregido (commit bcb623b).
- Ronda 3: sin regresiones, nada corregible. Quedan solo las decisiones de arriba.

## Tester: resultado
Pasó. Playwright: 8 pasaron, 0 fallaron (el cambio no tiene pantalla; solo confirma que el preview no se rompió). `pnpm test lib/permisos`: 126 tests; repo completo: 134. `tabla.ts` coincide con la nota 18 §3 (9×6), sin la fila de descuentos. El paso opcional de mutación no se corrió porque el tester no modifica código; se revisó leyendo.

## Para la próxima noche
- Cuando decidas los 4 puntos, un cambio chico ajusta `tabla.ts`, `calcular.ts` y el README.
- Actualizar la descripción del PR (77 tests a 134).
- Si querés los descuentos de estadías y eventos, especificarlos como cambio aparte (plata y lotes: revisión humana obligatoria).
- Los tests de "solo esa fuente" parten del plan Explorador; tenerlo presente si cambian los planes.
