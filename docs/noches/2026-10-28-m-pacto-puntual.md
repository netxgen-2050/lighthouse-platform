# Noche 2026-10-28-m — pacto-puntual
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/133 (base `agente/tribu-necesidades`, no `dev`) · **Preview:** no hay (el deploy de Vercel falló)

## En una línea
El código está hecho y revisado (✅), pero el tester dio ❌: Vercel no desplegó el preview y dos pruebas fallaron en local, una de ellas ya rota antes de este cambio y la otra intermitente.

## Qué decidir o desbloquear a la mañana
1. **Vercel no despliega (bloquea la prueba en preview).** Falla en este PR y también en los commits anteriores de la base (63d7df1, 01c95f0, 532017c), con el mismo mensaje. El build local pasa. No pudimos leer la causa porque los logs piden credenciales de Vercel. Acción: alguien con acceso corre `npx vercel inspect <id> --logs` (deploy de 7d5f7c6: https://vercel.com/net-xg-en/lighthouse-platform/9yi7GU1V1vUURzmobeEuxfGcAKZA).
2. **Decisión 1 de las horas variables: falta definirla.** En `pactos-horas-variables` hoy es una sola oración, sin escenario, diseño ni tarea. Acción: definir quién del círculo valida, con qué constancia y cuándo se pierden las horas, para que el especificador la escriba.
3. **Prueba rota en la base: `e2e/idioma-pendientes.spec.ts:105` («cambio rechazado»).** Busca el texto «did not accept your pact: Not for now», pero el texto real es «Lighthouse did not accept the change to your pact: Not for now…». Quedó viejo desde `pactos-dos-partes` (b4541d1). No es de este PR. Acción: ajustar el regex a «did not accept the change to your pact», en la base o en `pactos-dos-partes`.
4. **Cambio de otra spec: `pacto-puntual-verificacion`.** Se editó su propuesta (decía que el máximo total era una pregunta abierta), pero su diseño, spec y tareas todavía no aplican el máximo total al repartir Semillas. Acción: pedir al especificador que los ajuste.
5. **Nueva revisión del arquitecto sobre el design.** Toca permisos (quién responde una postulación). Acción: pasarlo por el arquitecto antes de aprobar.
6. **Guion manual sin recorrer en navegador.** Acción: repetirlo contra un preview cuando Vercel despliegue (guion en la tarea F.1).
7. **Línea tocada en otra spec.** En la spec de `tribu-necesidades` se cambió una línea («ejemplo» pasó a «simulado») para que el aviso de Hifa sea coherente. Acción: confirmar que está bien.

## Qué quedó hecho (tareas 13 de 14)
Falta solo la tarea F.1, que incluye el guion manual contra el preview y no se pudo cerrar sin él.
- **Postulación** a una necesidad de la tribu con un pacto puntual, para miembros y aspirantes.
- **Pre-admisión** del holón en `/pactos/responder`.
- **Ficha de tribu** con el estado de cada necesidad (por ejemplo «La tomó 1 persona»).
- **Término legal ⚖ «pacto puntual»**, marcado como borrador.
- **Tres eventos nuevos en Mi recorrido**, en español e inglés.
- **Decisiones de Gus del 28-oct:**
  - Máximo total: viaja en la propuesta, se ve al postularse y en `/pactos/responder` con las horas ya sumadas. Pre-admitir no se bloquea por el total.
  - Hifa: simulada y experimental, en transversales. Responde el super admin de respaldo y la constancia lleva `respaldoDeHifa`. **Hifa no responde de verdad.**
  - Nombres: solo «Semillas». Hay un test que comprueba que no aparezcan «brotes» ni «germinar».
  - Horas variables que pasan a fijas, y meses confirmados tras el mínimo: ya viven en `pactos-horas-variables`; acá quedaron fuera de alcance.
- Prueba e2e propia: `e2e/pacto-puntual.spec.ts`.

**Límites a tener presentes:** la verificación de quién puede responder vive en el navegador (en la base la recalcula el servidor). El texto es «Adherir como aspirante» y no «Leer el manifiesto…», por un e2e de `membresia.spec.ts`.

## Revisor: veredicto y hallazgos
**Veredicto final: ✅ listo para revisión humana.**
- **Ronda 1 (⚠️, 8 hallazgos: 1 media, 7 bajos), todos corregidos en e06c85f:** aviso de error oculto para aspirantes (el media); fallas al retirar; el holón de la postulación salía de lo que escribe la persona; aviso de Hifa inconsistente («ejemplo» vs «simulado»); oración entera marcada como español; resultados de responder mal distinguidos; faltaban 3 tests; la spec no tenía el caso `porOtraTribu`.
- **Ronda 2 (✅, 2 hallazgos bajos), corregidos en 7d5f7c6:** `design.md` y un comentario de `constancias.ts` decían `datos.holon`. Queda anotado un pendiente: si una necesidad cambia de holón, las pre-admisiones ya dadas dejan de contar (se resuelve cuando el servidor valide, P9).
- Los cambios posteriores fueron solo de documentación; no hubo tercera ronda.

## Tester: resultado
**❌ Falla / bloqueado.**
- `scripts/preview-url.sh`: «El deploy de Vercel falló para 7d5f7c6». Se probó en local: `pnpm build` ok y Playwright con su propio servidor.
- 941 pruebas, 939 pasaron. `e2e/pacto-puntual.spec.ts`: 21 de 21.
- **Falla 1:** `e2e/idioma-pendientes.spec.ts:19` («Consultas del Fogón en inglés»), error de accesibilidad `document-title`. Es intermitente: pasó en la segunda corrida, y este PR no toca Fogón ni títulos.
- **Falla 2:** `e2e/idioma-pendientes.spec.ts:105` («cambio rechazado»). Ya estaba rota en la base (ver punto 3 arriba).
- Verificado a mano en local: postulación, pre-admisión, máximos por persona y total, Hifa «experimental, simulado» con respaldo del super admin, y ausencia de «brotes»/«germinar».
- No se volvió a correr al tester tras el análisis porque no hubo cambios de código.

## Para la próxima noche
- Arreglar el regex de `idioma-pendientes.spec.ts:105` y mirar si la falla intermitente del título se repite.
- Que el especificador aplique el máximo total en `pacto-puntual-verificacion` y escriba la decisión 1 de `pactos-horas-variables`.
- Cuando Vercel despliegue, repetir el guion manual de F.1 contra el preview y cerrar esa tarea.
- Cuando haya validación en servidor (P9), contemplar el cambio de holón de una necesidad.
