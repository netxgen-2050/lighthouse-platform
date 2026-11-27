# Tasks

Tercer cambio `ux-*`. Va sobre la rama de `ux-celular`, con `origin/agente/explorar-paginas` (PR #218) mergeado primero (design §0).

## 1. Piezas

- [x] 1.1 Mergear `origin/agente/explorar-paginas` si #218 no está en `dev`; resolver conflictos a favor de las rutas de #218. **Verifica:** `pnpm test:e2e e2e/explorar.spec.ts` en verde antes de cambiar nada.
- [x] 1.2 `PlanoLote` (SVG desde el polígono del loteo) y `TarjetaLote` (design §3), con tests de texto, chip y enlace único. **Verifica:** `pnpm test components/explorar`.
- [x] 1.3 `MapaLotes` sobre el mapa Leaflet existente, con resaltado, centrado, tarjeta flotante y patrón por estado (design §4). **Verifica:** `pnpm test components/explorar`; `grep` muestra que no se duplicó la definición de capas.

## 2. Páginas

- [x] 2.1 `/explorar/lotes` con lista + mapa en compu y hoja persistente en el celular, filtro y orden en la URL (design §1, §2, §5). **Verifica:** e2e en `e2e/explorar.spec.ts`: filtrar Reservado deja solo lotes reservados; tocar una tarjeta resalta el lote en el mapa; a 390 px "Ver lista" abre la hoja.
- [x] 2.2 `/explorar/territorio` con mapa ancho, enlace "Ver los N lotes" y leyenda compacta (design §6). **Verifica:** `pnpm test:e2e e2e/territorio*.spec.ts e2e/explorar.spec.ts`; la página no repite la lista de lotes.
- [x] 2.3 `/explorar/barrio-norte` y héroe sin caja translúcida (design §8). **Verifica:** `pnpm test:e2e e2e/barrio-norte.spec.ts`.
- [x] 2.4 Ficha del lote rehecha sin cambiar la lógica de compra (design §7). **Verifica:** `pnpm test:e2e e2e/lotes*.spec.ts e2e/estado-administrativo.spec.ts`.

## 3. Cierre

- [ ] 3.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-explorar --strict` pasa; suite e2e completa en verde; axe sin violaciones. En el PR: alto de `/explorar/lotes` a 390 px antes y después, y capturas a 390 y 1440 px en claro y oscuro.
