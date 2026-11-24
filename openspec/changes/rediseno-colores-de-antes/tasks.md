# Tasks

Primero de los cuatro cambios de corrección del rediseño (24-nov-2026). Va sobre `integracion/2026-11-24-0204`.

## 1. Paleta

- [ ] 1.1 Restaurar en `app/globals.css` los tokens de color de antes (`git show 1b6ed24^:app/globals.css`) en el tema claro y el oscuro, sin tocar las fuentes; dar valores de esa paleta a `regen-1..5` y al vidrio. **Verifica:** `pnpm test lib/tema-contraste` en verde.
- [ ] 1.2 Tema por defecto "sistema" en `lib/configuracion/preferencias.ts` y `lib/configuracion/script-apariencia.ts`, con sus tests. **Verifica:** `pnpm test lib/configuracion` en verde.

## 2. E2E

- [ ] 2.1 Adaptar `e2e/configuracion.spec.ts` y `e2e/marco.spec.ts` al defecto "sistema"; axe en los dos temas. **Verifica:** `pnpm test:e2e e2e/configuracion.spec.ts e2e/accesibilidad.spec.ts e2e/marco.spec.ts` en verde.

## 3. Cierre

- [ ] 3.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate rediseno-colores-de-antes --strict` pasa; suite e2e completa en verde.
