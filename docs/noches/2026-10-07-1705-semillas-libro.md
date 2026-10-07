# Noche 2026-10-07-1705 — semillas-libro
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/23 · **Preview:** https://lighthouse-platform-jamordm2c-net-xg-en.vercel.app (commit 7c1771f)

Nadie mergeó. El PR está apilado sobre `agente/pactos-tribu` (su base), así que conviene mergear primero ese.

## En una línea
La pantalla `/semillas` está lista y pasa todas las pruebas (145 de 145 en el preview), pero hay tres decisiones tuyas pendientes, sobre todo el factor de evaluación, que inventó el implementador.

## Qué quedó hecho (tareas 4/4)
- 1.1 Datos y cálculo en `lib/semillas/` (datos, cálculo, estado), con tests. El ⚖ art32 se copió del mock-up al catálogo.
- 2.1 Pantalla `/semillas`: tres tarjetas de origen, escalera de cinco pasos con el estado escrito en texto, medidor de 120 semillas y ronda de reconocimiento simulada. "Semillas" está en el rail. Lee pacto aceptado, Pase y ticket del navegador; lo que falta se muestra como "sin dato".
- 2.2 `e2e/semillas.spec.ts` con los escenarios de la spec, y `/semillas` sumada a la auditoría de accesibilidad (21 rutas).
- 3.1 `pnpm verificar` (250 tests) y `pnpm build` en verde.

Las dos vueltas de corrección (revisor y tester) quedaron resueltas.

## Qué decidir a la mañana
**Decisiones que dejó el revisor (siguen abiertas):**

- **A (media). El factor de evaluación.** El mock-up solo muestra "1,0", sin fórmula. El implementador inventó una de ejemplo: promedio de las 4 notas que Lucía pone a sus compañeros, dividido 3. Con 3 de 5 da 1,0; con todo 5 da 1,67. Ese factor multiplica las semillas de Tiempo de la propia Lucía: con todo 5 pasa de 150 a 252. Está aclarado en pantalla como ejemplo. Acción sugerida: decidí qué factor se muestra y si las notas que uno da a otros deben mover sus propias semillas. Si no, lo más seguro es mostrar un 1,0 fijo, como el mock-up.
- **B (media). La frase "un servicio que no suma semillas"** (sobre el Pase activo). La agregó el implementador. Tiene peso legal, no lleva ⚖, no está en el mock-up ni en la spec. Acción sugerida: sacarla, o dejarla con ⚖ `pasefundador` (ya existe en el catálogo, marcada como borrador).
- **C (baja). Un pacto aceptado en cualquier pestaña cuenta como pacto de tiempo.** `/pactos` guarda una sola aceptación para las tres pestañas (Tiempo, Plata, Convivencia). Por eso un pacto aceptado en Plata o Convivencia suma 75 semillas de Tiempo con horas por defecto. Acción sugerida: aceptarlo por ahora (es prototipo) y arreglarlo cuando `/pactos` guarde la pestaña, o pedir un cambio aparte.

**Cosas a confirmar que marcó el implementador:**

- (a) La fórmula del factor: es la misma pregunta que la decisión A.
- (b) Solo hay 2 compañeros a evaluar (Martina y Joaquín), como pide la spec. Sol queda afuera. Confirmá que está bien.
- (c) Presencia solo muestra el ticket, sin check-ins ni "Genesis · n/5". Confirmá o pedí sumarlos.
- (d) Plata siempre dice "No disponible por residencia fiscal". Confirmá que es lo que querés.
- (e) `lh-sumarte` sigue fuera de `lib/demo/claves.ts`, así que "Borrar la demo" no la limpia. Es anterior a este cambio. Acción sugerida: un cambio chico aparte.

**Detalle menor:** un pacto aceptado guardado sin horas ahora toma 10 h por defecto en vez de "sin dato". Es igual que hace `/pactos`. Si querés que respete la regla de "el dato que falta no es cero", habría que cambiar las dos pantallas.

## Revisor: veredicto y hallazgos
- **Vuelta 1:** con observaciones (0 altos, 2 medios, 4 bajos). Los cuatro escenarios de la spec tenían código y tests, y se cumplían las reglas de CLAUDE.md. Cuatro cosas se corrigieron: el Pase mostraba "Pase raiz" en vez de "Pase Fundador Raíz"; Presencia aceptaba cualquier ticket (por ejemplo "1234"); un pacto aceptado no limitaba horas ni porcentaje (valores absurdos o negativos daban semillas absurdas); y el factor se veía "1" en vez de "1,0".
- **Vuelta 2:** con observaciones, solo las tres decisiones abiertas (A, B, C). Los cuatro hallazgos quedaron resueltos sin regresiones. Corrió `pnpm verificar` (bien). **No corrió los e2e**; eso lo cubrió el tester.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/23#issuecomment-6042148050 y https://github.com/netxgen-2050/lighthouse-platform/pull/23#issuecomment-6042186114

## Tester: resultado
- **Corrida 1:** falló 1 de 145 (`e2e/semillas.spec.ts:96`, "no manda datos a un servidor"). La causa no era la app: la barra de comentarios de Vercel, inyectada en los previews, hizo 2 pedidos a `vercel.live`. El implementador ajustó el test para ignorar solo pedidos no-GET a ese host exacto (commit 7c1771f); cualquier otro pedido sigue contando como falla.
- **Corrida 2** (commit 7c1771f): pasa, 145 de 145, sin bloqueos. Verificó a mano el paso 5 del guion: tras enviar la ronda con todo 5 y recargar, siguen "Ronda enviada (simulado)", factor 1,67 y Tiempo en 252. Los cuatro ⚖ muestran su explicación al pasar el mouse. **No se confirmó aparte** que se vea al llegar con Tab (el test lo ejecuta pero no comprueba el tooltip).
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/23#issuecomment-6042227290 y https://github.com/netxgen-2050/lighthouse-platform/pull/23#issuecomment-6042285235

## Para la próxima noche
- Según lo que decidas en A, B y C, un cambio chico de ajuste sobre `/semillas` (factor, frase del Pase, pestaña del pacto).
- Agregar al test el chequeo de que el ⚖ se ve con Tab.
- Sumar `lh-sumarte` a `lib/demo/claves.ts`.
- Si querés Presencia completa, abrir una spec con check-ins y "Genesis · n/5".
- Nota de proceso: los commits del implementador cayeron primero en la rama local `agente/pactos-tribu`. Los movió a `agente/semillas-libro` y devolvió la local a `origin/agente/pactos-tribu`. No hubo push a esa rama.
