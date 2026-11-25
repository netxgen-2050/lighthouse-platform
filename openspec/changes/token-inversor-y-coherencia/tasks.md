# Tasks

Requiere `bien-comun-propuesta` y `bien-comun-numeros-barrio` implementados.

## 1. Token Inversor

- [x] 1.1 Crear `app/netx/financiamiento/seccion-token-inversor.tsx` según `design.md` y sumarla al índice de `app/netx/financiamiento/page.tsx` (id `m-token-inversor`, después de "Dinero temprano"). **Verifica:** `pnpm build` en verde; `grep -nE "317|384|0\.1" app/netx/financiamiento/seccion-token-inversor.tsx` sin números del modelo escritos.
- [x] 1.2 Sumar la línea de contexto en las secciones de series y dinero temprano. **Verifica:** e2e de la tarea 4.1.

## 2. Coherencia

- [x] 2.1 Reescribir el texto del resto del costo en `lib/idioma/textos/hibrido.ts` (es/en) y sumar el enlace a `/bien-comun` en `app/lotes/hibrido/page.tsx`. **Verifica:** `pnpm test lib/idioma` y `lib/lotes/sin-numeros-escritos` en verde.
- [x] 2.2 Enlace a `/bien-comun` en la tarjeta "Bien común" de `app/netx/page.tsx`. **Verifica:** e2e de la tarea 4.1.
- [x] 2.3 Línea del Token Inversor en `invertir` de `lib/idioma/textos/sumarte.ts` (es/en), sin números y diciendo que todavía no se ofrece <!-- arquitecto: Sumarte es pública -->, y nuevo texto de `enlace` en `lib/idioma/textos/bien-comun.ts`. **Verifica:** `pnpm test lib/idioma` en verde.

## 3. Barrido

- [x] 3.1 Test nuevo `lib/bien-comun/sin-venta-de-faro.test.ts`: recorre `app/`, `components/`, `lib/idioma/textos/` y `lib/legal/terminos.ts`, y falla si aparece, como palabra entera y sin distinguir mayúsculas, "tramo(s)", "tranche(s)", "staking", "precio de FARO" o "FARO price" fuera de la clave `cambios` del diccionario del bien común (con palabra entera: "mostramos" no cuenta; los comentarios de rutas en `lib/sesion/` y `lib/idioma/rutas.ts` quedan fuera del recorrido). **Verifica:** `pnpm test lib/bien-comun` en verde, y falla al agregar a propósito "staking" en `hibrido.ts` (probar y revertir).

## 4. E2E

- [ ] 4.1 Actualizar el nombre del enlace en `e2e/bien-comun.spec.ts` y `e2e/lotes.spec.ts`; sumar casos: sección Token Inversor con monto, cobertura a 12 y 24 meses (esperados calculados con `lib/bien-comun/barrio.ts`) y "sin dato" para el plazo; línea de contexto en series; híbrido con "FARO no levanta capital" y enlace; enlace en `/netx`; Sumarte con "Token Inversor". **Verifica:** `pnpm test:e2e e2e/bien-comun.spec.ts e2e/lotes.spec.ts e2e/accesibilidad.spec.ts` y los e2e de la Vista NetX en verde.

## 5. Cierre

- [x] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate token-inversor-y-coherencia --strict` pasa.
