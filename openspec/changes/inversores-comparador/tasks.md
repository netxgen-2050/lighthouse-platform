## 1. Lógica y textos

- [ ] 1.1 Función pura en `lib/sumarte/` que, dado un monto, devuelve el nivel de Pase alcanzado (o el más barato si no alcanza) y la porción de la emisión con un decimal (o "menos de 0,1 %"); monto vacío, cero, negativo o no numérico devuelve "sin monto". Usa `PASSES` y `EMISION` de `lib/sumarte/datos.ts`. Verificar con tests de Vitest (2000 → Brote; 100 → Semilla no alcanza y "menos de 0,1 %"; 48000 → 10,0 %; vacío y -5 → sin monto) en `pnpm test lib/sumarte`.
- [ ] 1.2 Término `ilustrativo` en `lib/legal/terminos.ts` con `borrador: true` y texto en palabras simples. Verificar con `pnpm test lib/legal`.

## 2. Interfaz

- [ ] 2.1 Componente `app/sumarte/comparador-inversion.tsx`: tabla "Compará cómo participar" (3 columnas × 7 filas, `th` con `scope`), ⚖ por columna y en "a quién va la plata", campo "Monto de ejemplo (USD)" con etiqueta visible, aviso con el ⚖ `ilustrativo`, columna SAFE sin cifras y con acceso a "Pedir una charla". Monto solo en el estado del componente. Solo tokens del tema; en móvil la tabla se desplaza dentro de su caja. Verificar mirando `/sumarte#inversores` en `pnpm dev` a 1440 y 390 px.
- [ ] 2.2 Montarlo al principio de la sección "Para inversores" en `app/sumarte/sumarte-cliente.tsx`, antes de las dos tarjetas. Verificar con `pnpm verificar`.

## 3. Pruebas de punta a punta

- [ ] 3.1 `e2e/sumarte.spec.ts`: la tabla va antes de las tarjetas; sin monto no aparece "USD 0"; con 2000 muestra Brote y 450 en créditos; con 48000 muestra 10,0 %; la columna SAFE no muestra cifras; al recargar el campo vuelve vacío; auditoría de axe en `/sumarte`. Verificar con `pnpm test:e2e e2e/sumarte.spec.ts`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde. PR desde `agente/inversores-comparador` con guion de prueba (abrir Para inversores → escribir 100, 2000 y 48000 → recargar) y capturas a 1440 y 390 px.
