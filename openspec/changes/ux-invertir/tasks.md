# Tasks

Sexto cambio `ux-*`. Va sobre la rama de `ux-mi-tierra`.

## 1. Invertir

- [x] 1.1 Encabezado tipo pool y aviso legal único (design §1). **Verifica:** `pnpm test components/invertir`; la página tiene un solo aviso legal y ningún `SelloPrototipo`.
- [x] 1.2 Pestañas Cómo funciona / Curva / Libro con la elegida en la URL; prima objetivo en Cómo funciona (design §2 y §4). **Verifica:** `pnpm test:e2e e2e/invertir.spec.ts`; flechas del teclado mueven entre pestañas.
- [x] 1.3 Libro con 8 filas, "Ver todo el libro" y filtro (design §3). **Verifica:** e2e: el libro muestra 8 filas; "Ver todo" muestra todas; filtrar "Va al común" deja solo esas.
- [x] 1.4 Estado sin sesión con `EstadoVacio` (design §5). **Verifica:** el e2e de hoy que comprueba que no hay montos sin sesión sigue en verde.

## 2. Cierre

- [ ] 2.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-invertir --strict` pasa; suite e2e completa en verde; axe sin violaciones. Capturas de cada pestaña a 390 y 1440 px, claro y oscuro, en el PR.
