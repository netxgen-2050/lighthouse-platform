# Tasks

**Corte por noche: noche 4b.** Apilado sobre `modelo-hibrido-procomun`: rama `agente/bien-comun-tokens` desde la rama de ese cambio. Textos y valores en `design.md`.

## 1. Datos
- [x] 1.1 Crear `lib/bien-comun/modelo.ts` con los valores y las funciones de design §1, y su test (reparto 100 %, tramos 30 %, cruce de tramo, monto mínimo, FARO por m²).
- [x] 1.2 Sumar los ⚖ de design §5 y reescribir `retribucionraiz` (design §3), con `borrador: true` y `en`. Actualizar `lib/legal/terminos.test.ts`.

## 2. Página
- [x] 2.1 Crear `app/bien-comun/page.tsx` con las 9 secciones de design §2 y `lib/idioma/textos/bien-comun.ts` (es/en). Sumar la ruta a las públicas y traducidas.
- [x] 2.2 Calculadora de tramos accesible, sin estado guardado. Verificar con el teclado en `e2e/bien-comun.spec.ts`.
- [x] 2.3 Destino "Bien común" en el rail y enlaces desde `/lotes`, `/lotes/hibrido`, la ficha y Sumarte (design §4).

## 3. Ficha y boleto
- [x] 3.1 Tarjeta "NFT del lote (simulado)", campo `faro` opcional en `vio`, línea en el boleto y nota provisoria sin "RAIZ" (design §3). Actualizar `e2e/lotes.spec.ts`.

## 4. Calidad e integración
- [x] 4.1 Sumar `/bien-comun` a `e2e/accesibilidad.spec.ts` y al test de números escritos; 390 px sin scroll horizontal; `?lang=en` sin español suelto; ninguna aparición de "ganancia", "retorno" ni "valorización".
- [ ] 4.2 `pnpm verificar`, `pnpm build` y los e2e tocados en verde. Abrir el PR con `scripts/pr.sh` hacia la rama base, aclarando que es una simulación y que rompe la regla 5 a pedido de Gus (R42).
