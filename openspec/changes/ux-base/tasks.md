# Tasks

Primero de los ocho cambios `ux-*` (dirección B + C, elegida por Gus el 25-nov-2026). Va sobre `dev`.

## 1. Tokens y rail

- [x] 1.1 Sumar a `app/globals.css` los radios, sombras, duración y curva de design §2, sin tocar colores; transiciones en 0 con movimiento reducido. **Verifica:** `pnpm test lib/tema-contraste lib/sin-colores-sueltos` en verde.
- [x] 1.2 Rail con fondo `surface` y activo en píldora `deep` (design §3), en `components/rail.tsx` y `components/rail-enlaces.tsx`; dorado de "Sumarte" ajustado en oscuro. **Verifica:** `pnpm test components/rail` y contraste AA de los pares nuevos en `lib/tema-contraste.test.ts`.

## 2. Avisos

- [x] 2.1 Crear `components/ui/aviso.tsx` y `components/ui/cinta-prototipo.tsx` (design §4), con tests de rol, texto y tono. **Verifica:** `pnpm test components/ui`.
- [ ] 2.2 Poner la cinta en `app/layout.tsx` y sacar `SelloPrototipo` de las páginas; `AvisoEjemplo` pasa a `Aviso` tono `info` y solo donde hay comunidades o personas de ejemplo. **Verifica:** `grep -rn "SelloPrototipo" app` solo devuelve la cinta; `grep -rn "border-dashed" app components` no devuelve avisos.
- [ ] 2.3 `EstadosAdministrativos` agrupa los avisos de cada vista con lotes en un solo bloque `legal`, mismo texto y mismos `aria-label`; `EstadoAdministrativo` compacto con el estilo nuevo. **Verifica:** `pnpm test:e2e e2e/estado-administrativo.spec.ts` en verde sin cambiar sus expectativas de texto.

## 3. Componentes base

- [ ] 3.1 `Boton`, `Pestanas`, `EstadoVacio`, `Esqueleto` y `Seccion` en `components/ui/` (design §5), con tests (variantes, `aria-current`, flechas en `tablist`, `aria-busy`). **Verifica:** `pnpm test components/ui`.
- [ ] 3.2 Usar `Pestanas` en Mi recorrido (`/panel`) y Participa, y `EstadoVacio` en el "Todavía no hay nada" de Mi recorrido. **Verifica:** `pnpm test:e2e e2e/panel*.spec.ts e2e/participa.spec.ts`.

## 4. Pie y textos

- [ ] 4.1 Pie pegado abajo en páginas cortas (design §7). **Verifica:** e2e nuevo en `e2e/marco.spec.ts`: en `/invertir` sin sesión a 390×844, el borde inferior del pie está a 8 px o menos del final del documento y el documento no es más corto que la pantalla.
- [ ] 4.2 Bajadas sin "Todo es…" en es y en (design §6). **Verifica:** `pnpm test lib/idioma` y `grep -rniE "todo es (de ejemplo|una simulaci)" lib/idioma/textos/{explorar,barrios,invertir,mi-tierra}.ts` vacío.

## 5. Cierre

- [ ] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-base --strict` pasa; suite e2e completa en verde, axe sin violaciones en claro y oscuro. Capturas de antes y después de `/`, `/explorar` y `/mi-tierra` en oscuro a 1440 px en el PR.
