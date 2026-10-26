## 1. Datos

- [x] 1.1 Generar `lib/territorios/alternativa-permacultura.json` con el script del vault (`NS_permacultura/sources/masterplan-permacultura/disenio.py`): GeoJSON con `id`, `capa`, `nombre`/`zona`/`descripcion` en es y en, `marca`, `area_ha` (solo polígonos) y metadatos de fuente y método. Verificar que todos los elementos quedan dentro del contorno del Macrolote 7.
- [x] 1.2 Crear `lib/territorios/permacultura.ts` con `listarElementosPermacultura()`, `buscarElementoPermacultura(id)`, `resumenPermacultura()` (proporción ecológica, cuenca, total) y textos por idioma. Verificar con `lib/territorios/permacultura.test.ts`: ids únicos y con prefijo `pc-`, textos es/en no vacíos y distintos, proporción ecológica ≥ 50 %, sin superficie = `undefined`.

## 2. Pantalla

- [x] 2.1 Textos es/en del selector, la leyenda, la lista, la ficha y los avisos en `lib/idioma/textos/territorio.ts`.
- [x] 2.2 Selector de vista en `vitrina-territorio.tsx`, con `aria-pressed` y `?vista=permacultura` en la URL; leyenda y lista según la vista.
- [x] 2.3 Capas en `mapa-leaflet.tsx`: grupo de barrios y grupo de permacultura, que se muestran según la vista sin rehacer el mapa; sellos con teclado para la primera hectárea, el núcleo y los clusters; estilos con tokens; resaltado al elegir.
- [x] 2.4 Ficha de la alternativa (elemento y resumen) sin botones de compra ni de consulta.
- [x] 2.5 Muestras de la leyenda en `app/globals.css`, solo con tokens.

## 3. Tests

- [x] 3.1 `e2e/territorio-alternativa-permacultura.spec.ts` con los escenarios de la spec (selector, URL, sellos, teclado, lista, resumen, cluster sin compra, inglés, sin teselas).
- [x] 3.2 `pnpm verificar` y `pnpm build` en verde; `e2e/territorio-mapa.spec.ts` sigue en verde. También se sumó `?vista=permacultura` a la auditoría de axe (`e2e/accesibilidad.spec.ts`).

## 4. Integración

- [ ] 4.1 PR desde `agente/alternativa-permacultura` hacia `dev`, con guion de prueba y captura.
