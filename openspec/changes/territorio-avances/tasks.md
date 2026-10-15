## 1. Datos y lógica

- [ ] 1.1 En `lib/territorios/tipos.ts`, tipo opcional de frente (nombre, estado, porcentaje?, mide?, responsable?, actualizado?) y en `lib/territorios/datos.ts` los frentes Legal y Masterplan del Lighthouse ("En curso", sin porcentaje, con rol y sin fecha). Verificar con `pnpm verificar` (tipos).
- [ ] 1.2 Función pura `frentesDeTerritorio(id)` que devuelve los cuatro frentes en orden: Legal y Masterplan desde los datos; Comunidad calculado con `resumenDeTerritorio` (activas / total); Financiero con `COHORT` de `lib/sumarte/datos.ts` (recaudado / mínimo). Un territorio sin datos devuelve los cuatro con "sin dato" (`undefined`, nunca 0). Verificar con tests de Vitest (orden; Comunidad igual al resumen; Financiero 61 %; Legal sin porcentaje; territorio inexistente o sin frentes sin ceros) en `pnpm test lib/territorios`.

## 2. Interfaz

- [ ] 2.1 Sección "Cómo avanza el proyecto" en `app/territorios/[id]/page.tsx` (o componente `avances-territorio.tsx`) entre `VitrinaTerritorio` y "Bienes comunes": lista de cuatro frentes con estado escrito, porcentaje en texto, barra decorativa (`aria-hidden`) solo si hay porcentaje, línea de qué mide, rol y fecha o "sin dato"; ⚖ `guardian` en Financiero. Solo tokens del tema. Verificar mirando `/territorios/lighthouse` en `pnpm dev` a 1440 y 390 px.

## 3. Pruebas de punta a punta

- [ ] 3.1 `e2e/territorio.spec.ts`: la sección va antes de "Bienes comunes"; orden de los frentes; Legal y Masterplan dicen "sin dato" y no "0 %"; Financiero dice 61 %; Comunidad coincide con el resumen de tribus; auditoría de axe en la ficha. Verificar con `pnpm test:e2e e2e/territorio.spec.ts`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde. PR desde `agente/territorio-avances` con guion de prueba (abrir la ficha → bajar a Cómo avanza → comparar Financiero con la barra de /sumarte) y capturas a 1440 y 390 px.
