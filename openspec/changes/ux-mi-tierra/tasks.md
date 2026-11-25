# Tasks

Quinto cambio `ux-*`. Va sobre la rama de `ux-celular`.

## 1. Mi tierra con lote

- [ ] 1.1 Encabezado con número, barra y cuotas, y acciones que ya existen (design §1 y §2). **Verifica:** `pnpm test components/mi-tierra`; test de que no aparece ninguna palabra de rendimiento (APY, rendimiento, ganancia) en es ni en.
- [ ] 1.2 Posiciones en filas (lote, FARO, voz) con mini curva condicional (design §3). **Verifica:** `pnpm test components/mi-tierra`; FARO sin primer pago dice "sin dato".
- [ ] 1.3 Actividad con 8 filas, "Ver toda la actividad" y filtro (design §4). **Verifica:** `pnpm test:e2e e2e/mi-tierra.spec.ts`.

## 2. Mi tierra sin lote

- [ ] 2.1 `EstadoVacio` con dibujo, acción "Explorar los lotes" y vista previa marcada como ejemplo (design §5). **Verifica:** e2e nuevo: sin compras, la acción principal lleva a `/explorar/lotes` y la vista previa dice "Así se va a ver".

## 3. Cierre

- [ ] 3.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-mi-tierra --strict` pasa; suite e2e completa en verde; axe sin violaciones. Capturas con y sin lote a 390 y 1440 px, claro y oscuro, en el PR.
