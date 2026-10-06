## 1. Auditoría

- [x] 1.1 Agregar `@axe-core/playwright` como dependencia de desarrollo y crear `e2e/accesibilidad.spec.ts` que audite las 15 rutas (las 12 tribus salen de `listarTribus()`). Correrlo y anotar las violaciones encontradas en el PR. Verificar con `pnpm test:e2e`.
- [x] 1.2 Corregir todas las violaciones `serious` y `critical`. Verificar con `pnpm test:e2e` en verde.

## 2. ⚖

- [x] 2.1 En `components/termino-legal.tsx`: Escape desde el panel y clic afuera cierran la explicación; el foco vuelve al ⚖. Agregar los escenarios a `e2e/tribus.spec.ts`, incluido el recorrido con Tab real y la apertura con Space. Verificar con `pnpm test:e2e`.

## 3. Limpieza y cobertura

- [ ] 3.1 Hacer que el test "sin plata ni avales" recorra las 12 tribus y borrar `app/tribus/[id]/not-found.tsx`. Verificar con `pnpm test:e2e` (el 404 sigue mostrando "Volver a las tribus").

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con la lista de violaciones encontradas y cómo se corrigió cada una.
