# Noche 2026-11-08-m — modelo-hibrido-procomun
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/178 (base: `spec/hibrido-bien-comun`, no `dev`) · **Preview:** sin preview verificado (el secreto de Vercel venció; se probó todo en local)

## En una línea
La página "Qué es tuyo y qué es de todos" y el aviso al reservar un lote quedaron hechos y revisados, pero hay dos cosas del texto y de las cuentas que tenés que decidir vos, y dos cosas sin confirmar (el preview y una falla de test que parece ajena).

## Qué quedó hecho (tareas 13/14)
Falta la tarea 4.2: verificar en el preview de Vercel. El secreto venció, así que no se pudo. Todo se probó en local. `pnpm verificar` y `pnpm build` están en verde (2386 tests; 1 aviso de lint que ya existía en `app/territorios/[id]/vistas/paneles.tsx`).

- **`/lotes/hibrido`** (pública, en español e inglés):
  - Tabla de lo privado y lo común, con quién paga y quién cuidaría (consorcio de propietarios o la Fundación, que todavía no existe).
  - Aporte por lote.
  - Los cuatro resguardos del doc 18, todos con "Todavía no está hecho".
  - Tres escenarios (Arranque, Simulación de octubre, Alternativa alta), cada uno con su fuente y sin ninguna cifra de lo que falta.
  - Calculadora accesible.
  - Preguntas para Vagner.
  - No guarda nada.
- **Ficha de lote:** tarjeta "Lo que compartís y lo que pagás". El botón Reservar queda deshabilitado hasta marcar la casilla. La reserva guarda `vio.hibridoAceptado` y el boleto lo muestra. Un registro viejo muestra "sin dato".
- **`/netx` y `/netx/financiamiento`:** salieron Juego A, Juego B y "¿Y vender lotes?". Entró "El modelo híbrido". `juegos.ts` pasó a `hibrido.ts`.
- **Texto:** "bien común" reemplaza a "procomún" en todo lo que se ve. El ⚖ quedó en borrador, en es y en.
- **Tests:** unitarios y `e2e/hibrido.spec.ts` (19, todos pasan).

## Qué decidir a la mañana
1. **[media] El título no coincide con la cuenta.** El título de la sección es "Por qué la venta sola no alcanza" (`lib/idioma/textos/hibrido.ts:33`). Con los valores de ejemplo, mientras dura la venta (aporte único repartido en 3 años) cubre cerca de 261 % de Arranque, 109 % de la Simulación de octubre y 33 % de la Alternativa alta. Después de la venta solo queda la expensa: cubre cerca de 84 %, 35 % y 10-11 %. Es decir, en dos escenarios la venta sí alcanza mientras dura.
   - Acción sugerida: elegir una de tres. (a) Dejarlo como está. (b) Cambiar el título, lo que cambia la spec. (c) Mostrar solo lo que cubre después de la venta. Mi sugerencia es (b) o (c), para que el título no diga algo que la cuenta contradice.
2. **[media] El escenario Arranque usa un gasto de una sola vez como si fuera anual.** `lib/lotes/escenarios.ts:25-27` toma USD 30.000 del masterplan del primer año como costo anual. Es un gasto único, pero el design §4 lo pide así.
   - Acción sugerida: confirmar que está bien tal cual, o pedir que se rotule como "primer año" y no como "anual".
3. **Archivos de `NS_platform` sin commitear.** Ese repo tiene archivos modificados desde el 7-nov (doc 23 "El bien común · mecanismo" y presentaciones del 9-nov). No son de este PR. Confirmá que son tuyos.
4. **Dato que el implementador deja aclarado: el "0,4 %" del 7A.** Sale del polígono del macrolote 7, que es todo Lighthouse VRN (990 ha). Revisá si es la referencia que querés.
5. **Quedan en "sin dato" a propósito:**
   - Los primeros 4 lotes no entran en las cuentas.
   - Si el aporte va incluido en el precio.
   - Quién cobra la venta.
   - El tope a la parte vendible (doc 18 §4, punto 1). No se muestra por falta de valor.
   - Acción sugerida: pedirle estos datos a Vagner. La página ya trae las preguntas.
6. **Fuera de alcance (anotado):** el Fogón sigue diciendo "Parámetros del Juego B" (`lib/gobernanza/datos.ts`). Acción sugerida: cambio aparte si querés que desaparezca.
7. **Dos cosas para destrabar:** el PR apunta a `spec/hibrido-bien-comun` y no a `dev`, así que decidí si se reapunta o se integra primero la spec. Y hay que renovar el secreto de Vercel para cerrar la 4.2.

## Revisor: veredicto y hallazgos
Tres pasadas. Veredicto final: **listo para revisión humana**, con 0 hallazgos nuevos. Solo quedan abiertos A y B (los puntos 1 y 2 de arriba).
- **1.ª pasada** ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/178#issuecomment-6725171891)): con observaciones, 0 altos, 4 medios, 5 bajos. Verificó que no hay cifras de lo que falta, que cada escenario tiene fuente, que se dice "bien común", que no se guarda nada fuera de la versión aceptada (no hay campo faro ni textos de ganancia, retorno o valorización; el PR no trae código de bien-comun-tokens), la accesibilidad, el "sin dato" y que no se editaron otros repos. Los corregibles eran:
  - Las lecciones decían "presupuesto común de USD 72.000" y la nota dice "no es un presupuesto" (media).
  - Ítem vacío si una lección no tiene valor.
  - Escenario marcado con monto viejo al editar el costo.
  - Porcentajes chicos que se leían "0 %".
  - "De ejemplo" estaba fuera del diccionario.
  - Faltaba el e2e de la línea 2 del resumen de la ficha.
- **2.ª pasada** ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/178#issuecomment-6725376905)): los seis resueltos. Quedaba una baja: una fracción menor a 0,0005 % se leía "0,000 %".
- **3.ª pasada** ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/178#issuecomment-6725483709)): todo resuelto. Ahora se muestra "menos de 0,001 %" (y "less than 0.001%").

## Tester: resultado
Pasa para este cambio ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/178#issuecomment-6725557161)). Fue en local, sin preview.
- **Playwright completo:** 1174 pasaron, 2 fallaron, 1 salteado. Los 19 de `e2e/hibrido.spec.ts` pasan.
- **Falla 1, sin confirmar si ya existía:** `e2e/fogon-propuestas.spec.ts:154` ("cambiar de nivel cambia las acciones: en preguntas el ámbito no ve levantar un concern"). Falla igual al repetir: esperaba "Hacer preguntas para aclarar" y la región solo muestra Leer la propuesta, Leer la discusión, Recibir avisos y Evaluar el proceso. No se pudo probar contra la base porque no dejaron crear un worktree. Hay indicios fuertes de que no es del PR: el diff solo toca un comentario en `lib/gobernanza/datos.ts` y `holarquia.test.ts`, y ese e2e no está en el PR. Falta confirmarlo corriendo ese test en la base.
- **Falla 2, intermitente:** `e2e/pacto-puntual.spec.ts:385`, axe `document-title` en `/pactos` y `/pactos/responder`. Pasó al repetir. No es del PR.
- **Guion manual, 9 pasos OK:** casilla con Space y Tab, boleto `hibrido-v0.1`, `?lang=en` sin español suelto, 390 px sin scroll horizontal, `/netx` sin Juego A/B ni "procomún".
- **axe:** 0 violaciones en `/lotes/hibrido` (es y en), `/lotes/lote-1`, `/netx` y `/netx/financiamiento`.
- Un primer arranque falló por la descarga de la fuente de Google. Al repetir levantó.

## Para la próxima noche
- Cerrar la tarea 4.2 apenas se renueve el secreto de Vercel: probar en el preview y marcarla.
- Correr `fogon-propuestas.spec.ts:154` en la base (`dev` o `spec/hibrido-bien-comun`) para confirmar que ya fallaba.
- Aplicar lo que decidas en A (título o cuenta) y B (rótulo del costo de Arranque).
- Con las respuestas de Vagner, completar los datos que hoy dicen "sin dato".
- Cambio aparte, si querés: sacar "Parámetros del Juego B" del Fogón.

Nadie mergeó ni tocó `dev` ni `main`.
