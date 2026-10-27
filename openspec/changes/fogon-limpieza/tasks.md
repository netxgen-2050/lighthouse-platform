# Tasks

Rama `agente/fogon-limpieza` desde `dev`. Depende de `fogon-decisiones` (ya en `dev`).

## 1. Datos y estado

- [x] 1.1 `lib/fogon/datos.ts`: sacar `asamblea` de `Ambito` y de `AMBITOS`; mover las decisiones `bomba` y `animales` a `EJEMPLOS_COMUN` (design §1). Actualizar `lib/fogon/fogon.test.ts`: `AMBITOS` tiene exactamente `tribu` y `fideicomiso`; `DECISIONES` no tiene ninguna con donde "Asamblea de residentes"; `EJEMPLOS_COMUN` conserva las dos con su ⚖. Verificar con `pnpm test lib/fogon`.
- [x] 1.2 `lib/fogon/estado.ts`: `leer` ignora votos de decisiones que ya no existen (design §2), con un test que lee un estado guardado con un voto en `bomba` y no falla. Verificar con `pnpm test lib/fogon`.

## 2. Pantalla

- [ ] 2.1 `app/fogon/fogon-cliente.tsx`: quitar el párrafo de residencia fiscal y el motivo "Solo residentes"; mantener el aviso del Pase Fundador para el Fideicomiso. Textos por los diccionarios es/en (ADR-004). Verificar con `pnpm verificar` y con el e2e de 2.2.
- [ ] 2.2 `e2e/fogon.spec.ts`: los filtros son "Todas", "Tribu", "Fideicomiso"; no aparece "Asamblea de residentes" ni la bomba solar; votar en el plan de huerta sigue funcionando y persiste al recargar. Verificar con `pnpm test:e2e e2e/fogon.spec.ts`.

## 3. Reportar en todas las páginas

- [ ] 3.1 `e2e/reportar-en-todas.spec.ts` (design §4): para cada destino con `existe: true` de `lib/navegacion.ts` y para `/fogon/consultas`, el botón "Reportar un problema o una idea" es visible y abre el diálogo con Enter. Verificar con `pnpm test:e2e e2e/reportar-en-todas.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar`, `pnpm build` y `pnpm test:e2e e2e/fogon.spec.ts e2e/reportar-en-todas.spec.ts e2e/accesibilidad.spec.ts` en verde; PR a `dev` con `scripts/pr.sh`, aclarando que el reporte de bugs no se movió (ya era global) y que las decisiones de la asamblea esperan a `fogon-gobernanza-fractal`.
