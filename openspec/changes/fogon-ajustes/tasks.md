# Tasks

## 1. Explicación del ⚖ de "consultivo"

- [ ] 1.1 En `lib/legal/terminos.ts`, a la entrada `consultivo` sumarle `frase` con el texto actual sin cambios ("El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.") y reemplazar su `texto` por la explicación de `design.md` §1. Dejar `borrador: true`. **Verifica:** `pnpm verificar` en verde (tipos incluidos).
- [ ] 1.2 En `Acta` (`app/fogon/consultas/[id]/resultado-grupo.tsx`) pintar `TERMINOS.consultivo.frase` en lugar de `TERMINOS.consultivo.texto`. **Verifica:** el test existente de `resultado-grupo.test.tsx` que espera la frase sigue pasando.
- [ ] 1.3 En `lib/legal/terminos.test.ts`, sumar al test "consultivo es borrador": `frase` es exactamente la frase aprobada, `texto` es distinto de `frase`, y `texto` contiene "no obliga", "contrato o el estatuto" y "no te cuesta plata". **Verifica:** `pnpm verificar`.
- [ ] 1.4 En `e2e/fogon-consultas.spec.ts`, en el test del cierre de U1, abrir el ⚖ del acta y comprobar que el tooltip muestra la explicación ("orienta una decisión") y el aviso de borrador, y que el acta sigue con la frase completa. **Verifica:** `pnpm test:e2e e2e/fogon-consultas.spec.ts` en verde.

## 2. "sin dato" hasta empezar a repartir, "USD 0" después

- [ ] 2.1 En `lib/fogon/consultas/reparto.ts`, `repartoEnPlata`, siguiendo `design.md` §2: con `montoCentavos` `null`, todas las opciones `null`; si ninguna opción tiene un voto distinto de 0, todas `null`; si no, cada `null` del motor pasa a `0`. Actualizar el comentario de la función con la regla ("sin votos, la votación no empezó"). No tocar `lib/cuadratico/`. **Verifica:** `pnpm verificar`; `lib/cuadratico/motor.test.ts` sigue igual y en verde.
- [ ] 2.2 En `lib/fogon/consultas/reparto.test.ts`, dentro de "mi reparto en plata (U4)":
  - renombrar "sin votos propios: sin dato" a "sin votos propios: la votación no empezó, sin dato" y sumarle un reparto con todo en 0 (`{ vivero: 0 }`), que también da `null` en todas;
  - nuevo "primer voto: USD 20.000 y el resto en 0": `{ vivero: 1 }` da `2_000_000` en `vivero` y `0` en las otras cuatro (ninguna `null`);
  - nuevo "solo votos en contra: ya empezó, todo en 0": con `{ ...u4, votosEnContra: true }` y `{ vivero: -1 }`, las cinco opciones dan `0`;
  - nuevo "sacar todos los votos vuelve a sin dato": `mover(u4, { vivero: 1 }, "vivero", -1)` pasado a `repartoEnPlata` da `null` en todas;
  - "monto sin cargar: sin dato, nunca 0": sumar el caso sin votos (`{}`) además del de 3 votos; las dos dan `null` en todas las opciones.
  **Verifica:** `pnpm verificar` en verde con los tests nuevos.
- [ ] 2.3 En `e2e/fogon-consultas.spec.ts`, test (g): mantener que sin votos "Vivero de nativas" muestra "Con tu reparto irían: sin dato" y sumar que "Línea de base y monitoreo" también y que la sección no contiene "USD 0"; después de los 3 + 1 votos, lo que ya comprueba. Sumar al final: quitar los votos hasta 0 y comprobar que "Vivero de nativas" vuelve a "Con tu reparto irían: sin dato". Renombrar el test a "(g) U4: monto sugerido y 'Con tu reparto irían': sin dato hasta empezar a repartir, USD 0 después". **Verifica:** `pnpm test:e2e e2e/fogon-consultas.spec.ts` en verde.

## 3. Donut

- [ ] 3.1 En `components/donut.test.tsx`, un test con una porción de menos del 5 % (por ejemplo valores 96 y 4): el SVG dibuja el número `1` pero no el `2`, y la leyenda y la tabla muestran "2 · <etiqueta> · 4 %" y su fila. Sin cambios en `components/donut.tsx`. **Verifica:** `pnpm verificar`.

## 4. Cierre

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde, y `pnpm test:e2e e2e/fogon-consultas.spec.ts e2e/accesibilidad.spec.ts` sin fallas. **Verifica:** los tres comandos terminan en verde.
