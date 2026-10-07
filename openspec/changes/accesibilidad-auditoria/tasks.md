## 1. Auditoría

- [x] 1.1 Agregar `@axe-core/playwright` como dependencia de desarrollo y crear `e2e/accesibilidad.spec.ts` que audite las 15 rutas (las 12 tribus salen de `listarTribus()`). Correrlo y anotar las violaciones encontradas en el PR. Verificar con `pnpm test:e2e`.
- [x] 1.2 Corregir todas las violaciones `serious` y `critical`. Verificar con `pnpm test:e2e` en verde.

## 2. ⚖

- [x] 2.1 En `components/termino-legal.tsx`: Escape desde el panel y clic afuera cierran la explicación; el foco vuelve al ⚖. Agregar los escenarios a `e2e/tribus.spec.ts`, incluido el recorrido con Tab real y la apertura con Space. Verificar con `pnpm test:e2e`.

## 3. Limpieza y cobertura

- [ ] 3.1 Hacer que el test "sin plata ni avales" recorra las 12 tribus y borrar `app/tribus/[id]/not-found.tsx`. Verificar con `pnpm test:e2e` (el 404 sigue mostrando "Volver a las tribus").

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con la lista de violaciones encontradas y cómo se corrigió cada una.

## 5. Correcciones (7-oct)

- [ ] 5.1 Traer `main` a la rama: `git fetch origin` y `git merge --no-edit origin/main`, conservando lo de `main` en los conflictos. Verificar con `pnpm verificar`.
- [ ] 5.2 Terminar la tarea 3.1: `git rm "app/tribus/[id]/not-found.tsx"` (ahora está permitido) y marcar 3.1 y 4.1 cuando pasen `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.
- [ ] 5.3 **No** cambiar el comportamiento del ⚖ (Escape, clic afuera, panel que tapa): lo rehace el cambio siguiente, `termino-legal-tooltip`, por decisión de Gus. Anotarlo en la descripción del PR.
