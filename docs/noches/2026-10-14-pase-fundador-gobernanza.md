# Noche 2026-10-14 — pase-fundador-gobernanza
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/65 · **Preview:** https://lighthouse-platform-55fdvjh07-net-xg-en.vercel.app

## En una línea
El Pase Fundador ahora da voto en el Fideicomiso: quien tiene el Pase vota (simulado) y quien no, ve la decisión y el conteo pero no puede votar. Nada falló; hay cinco cosas para decidir.

## Qué quedó hecho (tareas 3/3)
- 1.1 Nivel **Fundador** entre Miembro y Líder, y una puerta nueva `voto-fideicomiso` (solo con Pase).
- 2.1 Pantallas: en el Fogón, el Fideicomiso pide el Pase (antes pedía residencia en Argentina). Sin Pase se ve la decisión, el conteo, el texto "Votan quienes tienen el Pase Fundador" y un enlace a Sumarte, sin botón de votar. Con Pase se vota. La tarjeta del Pase en Sumarte dice que da voz en las decisiones del fideicomiso y del Fondo Común, con el ⚖ `gobernanzafideicomiso` (borrador). El sello Pase Fundador del Pasaporte lista "Voto en el Fideicomiso".
- F.1 `pnpm verificar` (673 tests) y `pnpm build` en verde.
- Hubo una vuelta de corrección (commit 3aca43c): se arregló la lectura del Pase en el Fogón cuando el navegador bloquea el almacenamiento y se agregó un test e2e de "comprar el Pase".

## Qué decidir a la mañana
1. **Qué ⚖ lleva la decisión del Fideicomiso en el Fogón (hallazgo baja del revisor).** La decisión ahora pide el Pase, pero su ⚖ sigue siendo `fidasamblea` ("Asamblea de beneficiarios"). Acción sugerida: pasarlo a `gobernanzafideicomiso`, o aclarar el texto de `fidasamblea`. Es duda para Gabriel (R14). El archivo es `lib/fogon/datos.ts:60`.
2. **Fundador con residencia en el exterior.** Hoy vota en el Fideicomiso, porque la spec no lo excluye y el Fideicomiso ya no mira la residencia. Acción sugerida: confirmarlo con Gabriel (R14), igual que cómo se relaciona el Pase con ser beneficiario del contrato del fideicomiso.
3. **Décima puerta.** `voto-fideicomiso` es una puerta que la nota 18 todavía no tiene (se pasaron los tests de 9 a 10 puertas). Acción sugerida: agregarla a la nota 18 o decir que se saca.
4. **Líder sin Pase.** Fundador es solo una etiqueta de la escalera: quien lidera una tribu figura como Líder, y un líder sin Pase no vota en el Fideicomiso. Acción sugerida: confirmar que está bien así o pedir que liderar también dé voto.
5. **Texto del sello en el Pasaporte.** Con el sello Pase Fundador en "Disponible" (sin Pase), la sección "Qué abriría" lista "Voto en el Fideicomiso · Abierta", y puede leerse como que ya está abierta. Acción sugerida: cambiar la palabra para que sea claro que es a futuro (por ejemplo "se abriría con el Pase").

Otras decisiones menores tomadas por el implementador: el ⚖ no está en el Fogón porque chocaba por nombre con el filtro "Fideicomiso" y rompía un e2e (sí está en Sumarte y en el sello). El refuerzo por presencia sigue a decidir, sin cambios.

## Revisor: veredicto y hallazgos
Dos pasadas, ambas ⚠️ con observaciones, sin hallazgos altos.
- Primera pasada: 1 media (la lectura del Pase en el Fogón quedaba fuera del try y fallaba con almacenamiento bloqueado), 2 bajas (faltaba el e2e de comprar el Pase; el ⚖ `fidasamblea`, ver punto 1). En esa pasada no pudo comentar en el PR y revisó con `git diff`.
- Segunda pasada (3aca43c): las correcciones de la media y del e2e están verificadas, sin regresiones. Queda 1 baja: ningún test cubre que falle la lectura del almacenamiento al abrir el Fogón (`e2e/fogon.spec.ts:151-162` solo cubre el fallo al escribir). El implementador ya intentó ese test y no fue viable (el aviso de privacidad tapaba el Fogón), así que no se hizo tercera vuelta.

## Tester: resultado
**Pasó.** Playwright contra el preview: 494 tests, 483 pasan, 0 fallan, 11 omitidos (ya existentes, no son de este cambio). Guion manual 5/5: Miembro sin Pase no ve Votar; la tarjeta de Sumarte tiene el ⚖ borrador; con Pase se vota y el conteo pasa de 17 a 18; el sello del Pasaporte muestra "Voto en el Fideicomiso · Abierta"; Volver a Explorador quita el voto. Observación menor: el wording del sello (punto 5).

## Para la próxima noche
- Aplicar lo que decidas en los puntos 1 a 5.
- Un test que cubra el fallo de lectura del almacenamiento al abrir el Fogón (hay que resolver antes cómo evitar que el aviso de privacidad tape la pantalla).
- Refuerzo por presencia: sigue a decidir.
