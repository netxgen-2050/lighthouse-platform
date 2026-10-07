# Tasks

## 1. Traducción del origen

- [ ] 1.1 Agregar `id` a cada camino en `caminosDePortada()` y crear `origenDeVisita` en `lib/portada.ts` según el design. Verificar con casos nuevos en `lib/portada.test.ts`: cada valor válido de `camino`; `camino` inválido sin UTM → `null`; `utm_campaign` "Inversores-Oct", "invertir2026", "CONGRESO-2027", "tribus-valle", "nodo-valle", "territorio" y "otra" → `null`; prioridad de `camino`; arreglo de valores; orden de reglas ("congreso-inversores" → inversor).

## 2. Portada

- [ ] 2.1 Leer `searchParams` en `app/page.tsx` y marcar la tarjeta recomendada con "Recomendado para vos" y borde doble, sin cambiar el orden. Verificar en `pnpm dev` con `/?camino=tribu` y `/` (sin cambios visibles).
- [ ] 2.2 Agregar la sección "¿Venís a invertir?" con el ⚖ `circulo` y el enlace a `/sumarte#inversores`, solo con origen inversor. Verificar en `pnpm dev` con `/?utm_campaign=inversores`: la sección aparece antes de "Por dónde empezar" y el enlace baja a "Para inversores".
- [ ] 2.3 Agregar a `e2e/portada.spec.ts` los escenarios de la spec: `camino`, campaña de HubSpot, prioridad, nodo, sin parámetros, valor desconocido, marca dentro del enlace y orden fijo, sección de inversores y su enlace, ⚖ con teclado, volver sin parámetros. Los tests actuales siguen pasando sin cambios. Verificar con `pnpm test:e2e e2e/portada.spec.ts`.

## 3. Integración

- [ ] 3.1 Correr `pnpm verificar`, `pnpm build` y `pnpm test:e2e e2e/accesibilidad.spec.ts` sumando `/?camino=inversor` a las páginas auditadas. Verificar que los tres terminan en verde.
