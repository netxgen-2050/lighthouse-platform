## 1. Rail

- [ ] 1.1 Agregar `lucide-react`, crear `lib/navegacion.ts` (lista única de destinos con ruta, etiqueta e ícono; filtra los que no existen comprobando las rutas de `app/`) y `components/rail.tsx`. Integrarlo en `app/layout.tsx` con el contenido a la derecha; simplificar `components/encabezado.tsx` (la marca pasa al rail). Solo tokens del tema. Verificar en `pnpm dev` a 1280 px y a 390 px.

## 2. Tests

- [ ] 2.1 Actualizar `e2e/marco.spec.ts` y los e2e que buscaban enlaces en el encabezado, y agregar los escenarios de la spec (subruta, celular 390 × 844 sin scroll horizontal, Tab). Correr la auditoría de accesibilidad. Verificar con `pnpm test:e2e`.

## 3. Integración

- [ ] 3.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba en computadora y en celular.
