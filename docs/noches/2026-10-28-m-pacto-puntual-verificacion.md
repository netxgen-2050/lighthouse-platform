# Noche 2026-10-28-m — pacto-puntual-verificacion
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/134 (base `agente/pacto-puntual`, no `dev`) · **Preview:** no hay (el deploy de Vercel falló)

## En una línea
El código está hecho (11 de 11 tareas) y las pruebas pasan en local, pero Vercel no desplegó el preview, dos pruebas heredadas de la base siguen fallando y la última corrección no la volvió a mirar el revisor.

## Qué decidir o desbloquear a la mañana
1. **Vercel no despliega (bloquea la prueba en preview).** El deploy está en Error también para este PR (a55b584, 779928b, 83d5969) y para 7d5f7c6 de la base; `dev` despliega bien. El build local pasa. No se pudo ver la causa. Hipótesis sin confirmar: configuración o variables de entorno, o el paso `tsx scripts/migrar.ts` del build. Acción: alguien con acceso corre `npx vercel inspect dpl_GQ99vhZgGkqB6pjPDcZdH7gCoHMP --logs` o mira el panel (https://vercel.com/net-xg-en/lighthouse-platform/5YWBGjdR7q3rQ1LJTrcCuMQJ4RpV).
2. **«Seeds» o «Semillas» en inglés.** El escenario «En inglés» de la spec pide leer «Seeds», pero el repo no traduce «Semillas» y el código y el e2e muestran «Semillas». Acción: decidir. Lo más simple es corregir la spec para que diga «Semillas».
3. **Dos pruebas fallan, y vienen de la base (no de este PR).** Se confirmó por diff (el PR no toca esos archivos ni `components/`) y el implementador comprobó que también fallan en la base.
   - `e2e/idioma.spec.ts:86`: el enlace del selector de idioma no incorpora `?sel=valle` al acercar el puntero o enfocar. Viene de `dev`; no se halló la causa de fondo. Acción: abrir una tarea aparte para investigarlo.
   - `e2e/idioma-pendientes.spec.ts:105` («cambio rechazado»): el texto cambió en el commit 481b41d a «did not accept the change to your pact» y el regex quedó viejo. Arreglo de una línea en `e2e/idioma-pendientes.spec.ts:113`, no tocado a propósito. Acción: aprobar el arreglo en la base. Es la misma falla que ya figuraba en el reporte de `pacto-puntual`.
4. **Decisiones 1 y 2 del 28-oct: no están en este cambio.** Son de `pactos-horas-variables`: (1) horas variables que pasan a fijas generan Semillas pendientes, que se reciben solo si el círculo las valida y si no se pierden; (2) los meses confirmados tras el mínimo se reciben al confirmarse. Quedaron como traspaso en el proposal y el revisor confirmó que figuran en la spec y el design de ese cambio. Falta: su `tasks.md` 1.3 no prueba el caso de Semillas pendientes validadas o perdidas. Acción: pedir al especificador que lo agregue.
5. **La última corrección (83d5969) no pasó por el revisor.** Se agotaron las dos vueltas de corrección permitidas. Esa corrección resolvió el hallazgo bajo de la tercera revisión (conciliar con el registro tras «ya-marcada») sin un test propio; la cubre el e2e existente. Acción: una mirada humana a `app/pactos/pactos-cliente.tsx` (zona de `marcarHechaDe`).
6. **Guion manual sin recorrer.** Ni el implementador ni el tester probaron a mano los 8 pasos del guion. Acción: repetirlo contra el preview cuando Vercel despliegue.
7. **Discrepancia en el conteo de pruebas.** El implementador y el revisor contaron 14 casos en `e2e/pacto-puntual-verificacion.spec.ts`; el tester contó 11. Todos pasaron. Acción: revisar cuál es el número correcto (puede ser un conteo distinto, por ejemplo con o sin axe).
8. **Re-apuntar la base del PR.** Cuando `agente/pacto-puntual` entre a `dev`, hay que cambiar la base de este PR a `dev`.
9. **Límites conocidos (sin acción esta noche):**
   - Los máximos del reparto hoy se calculan en el navegador; con base real los debe serializar el servidor.
   - Una verificación tardía no recalcula constancias ya emitidas.
   - El error de axe `document-title` apareció una vez de forma intermitente (ya se había visto en la noche anterior).

## Qué quedó hecho (tareas 11 de 11)
- **Marcar la tarea hecha**, con horas, y volver a marcarla después de «Pedir revisar». Retirar lo hecho, también tras «Pedir revisar» (se aplica la respuesta del holón).
- **El holón verifica o pide revisar** (con motivo). Si verifica sus propias horas, responde el super admin.
- **Constancia base solo con la verificación**, con el máximo por persona y el máximo total.
- **Decisiones de Gus del 28-oct aplicadas:**
  - Máximo total por tarea, repartido por orden de verificación. Ejemplo: energía solar con 10 h por persona y 20 h en total, con 10, 12 y 6 h, da 50, 50 y 0 Semillas. Plomería, 3 personas de 16 h, da 60, 60 y 30. La tercera persona ve «El máximo total de la tarea ya se completó».
  - Círculos transversales: «Lo administra y facilita Hifa (experimental, simulado)»; el super admin verifica de respaldo y la constancia lleva `respaldoDeHifa`. Hifa no responde de verdad.
  - Nombres «Semillas pendientes» y «Semillas».
- **Semillas de un puntual se reciben al verificarse**, sin ronda.
- **Necesidad hecha** en la ficha de tribu («Hecha por vos», «La hizo 1 persona» con «Postularme para tomarla»).
- **Eventos en Mi recorrido** (una sola vez, sin el motivo del pedido de revisión).
- Prueba e2e propia: `e2e/pacto-puntual-verificacion.spec.ts`, con axe.

## Revisor: veredicto y hallazgos
**Veredicto de la última revisión: ⚠️ con observaciones.** Hizo tres vueltas y la última corrección quedó sin re-revisar (ver punto 5).
- **Ronda 1 (⚠️, 4 hallazgos):** (alta) tras «Pedir revisar» no se podía volver a marcar hecha; (media) la tercera persona no veía «El máximo total de la tarea ya se completó»; (media) la tarea 2.4 estaba marcada sin ese caso en el e2e; (baja) «Seeds» contra «Semillas». Los tres primeros se corrigieron en e0c11be.
- **Ronda 2 (⚠️, 2 hallazgos):** (media) regresión: Retirar dejaba perder el pedido de revisión del holón; (baja) tomar «ya-marcada» como error podía trabar a la persona. Corregidos en 779928b, con e2e.
- **Ronda 3 (⚠️, 1 hallazgo bajo):** tras «ya-marcada» la pantalla pasaba a «hecha» sin aplicar la verificación del registro. Corregido en 83d5969 (sin re-revisión).
- Sin hallazgos de reglas del CLAUDE.md ni de seguridad. Alcance correcto: las decisiones 1 y 2 quedan como traspaso.

## Tester: resultado
**✅ pasa en local; NO probado en preview** (el deploy de Vercel falló para 83d5969).
- 953 pruebas pasan y 2 fallan, ambas heredadas de la base (punto 3). Fallas propias del PR: ninguna.
- Los casos de `e2e/pacto-puntual-verificacion.spec.ts` pasan, con axe.
- La primera corrida del tester (sobre 779928b) había dado ❌ por esas mismas dos fallas; en esa corrida también falló una vez, de forma intermitente, `e2e/idioma-pendientes.spec.ts:19`.
- Dos arranques del servidor local fallaron por la descarga de Google Fonts (red, no el código).
- No corrió la base: la herencia se confirmó por diff, y el implementador sí la corrió.
- No recorrió el guion manual de 8 pasos.

## Para la próxima noche
- Arreglar el regex de `idioma-pendientes.spec.ts:113` e investigar `idioma.spec.ts:86`.
- Que el especificador sume a `pactos-horas-variables` (tarea 1.3) el caso de Semillas pendientes validadas o perdidas.
- Cuando Vercel despliegue, repetir el guion manual de 8 pasos contra el preview.
- Pasar por el revisor la corrección 83d5969.
- Cuando el servidor valide, serializar allí los máximos del reparto y contemplar la verificación tardía sobre constancias ya emitidas.
