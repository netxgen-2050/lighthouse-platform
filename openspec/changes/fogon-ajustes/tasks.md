# Tasks

## 1. Explicación del ⚖ de "consultivo"

- [ ] 1.1 En `lib/legal/terminos.ts`, a la entrada `consultivo` sumarle `frase` con el texto actual sin cambios ("El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.") y reemplazar su `texto` por la explicación de `design.md` §1. Dejar `borrador: true`. **Verifica:** `pnpm verificar` en verde (tipos incluidos).
- [ ] 1.2 En `Acta` (`app/fogon/consultas/[id]/resultado-grupo.tsx`) pintar `TERMINOS.consultivo.frase` en lugar de `TERMINOS.consultivo.texto`. **Verifica:** el test existente de `resultado-grupo.test.tsx` que espera la frase sigue pasando.
- [ ] 1.3 En `lib/legal/terminos.test.ts`, sumar al test "consultivo es borrador": `frase` es exactamente la frase aprobada, `texto` es distinto de `frase`, y `texto` contiene "no obliga", "contrato o el estatuto" y "no te cuesta plata". **Verifica:** `pnpm verificar`.
- [ ] 1.4 En `e2e/fogon-consultas.spec.ts`, en el test del cierre de U1, abrir el ⚖ del acta y comprobar que el tooltip muestra la explicación ("orienta una decisión") y el aviso de borrador, y que el acta sigue con la frase completa. **Verifica:** `pnpm test:e2e e2e/fogon-consultas.spec.ts` en verde.

## 2. "USD 0" con monto conocido

- [ ] 2.1 En `lib/fogon/consultas/reparto.ts`, `repartoEnPlata`: con `montoCentavos` `null`, todas las opciones `null`; si no, cada `null` del motor pasa a `0`. Actualizar el comentario. No tocar `lib/cuadratico/`. **Verifica:** `pnpm verificar`; `lib/cuadratico/motor.test.ts` sigue igual y en verde.
- [ ] 2.2 En `lib/fogon/consultas/reparto.test.ts`, cambiar "sin votos propios: sin dato" por "sin votos propios con monto: todo en 0" (`{}` y un reparto con solo votos en contra o en 0 dan `0` en todas las opciones) y mantener "monto sin cargar: sin dato, nunca 0" (con votos y sin votos). **Verifica:** `pnpm verificar`.
- [ ] 2.3 En `e2e/fogon-consultas.spec.ts`, test (g): sin votos, "Vivero de nativas" muestra "Con tu reparto irían USD 0" y la sección "Mi reparto" no contiene "Con tu reparto irían: sin dato"; renombrar el test. **Verifica:** `pnpm test:e2e e2e/fogon-consultas.spec.ts` en verde.

## 3. Donut

- [ ] 3.1 En `components/donut.test.tsx`, un test con una porción de menos del 5 % (por ejemplo valores 96 y 4): el SVG dibuja el número `1` pero no el `2`, y la leyenda y la tabla muestran "2 · <etiqueta> · 4 %" y su fila. Sin cambios en `components/donut.tsx`. **Verifica:** `pnpm verificar`.

## 4. Cierre

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde, y `pnpm test:e2e e2e/fogon-consultas.spec.ts e2e/accesibilidad.spec.ts` sin fallas. **Verifica:** los tres comandos terminan en verde.
