## 1. Datos

- [ ] 1.1 Copiar `docs/referencia/biopueblo-territorios.geojson` a `lib/territorios/biopueblo-territorios.json`, crear tipos y funciones puras (por tipo, por id, conteo de tribus por estado cruzando `tribuId` con `lib/tribus/`) y borrar la geometría ilustrativa anterior. Tests de Vitest (12 barrios con su tribu, 175 fincas, conteos 5/5/2). Verificar con `pnpm test`.

## 2. Mapa y ficha

- [ ] 2.1 Rehacer el mapa de `/territorios/[id]` según el design (fondo satelital con atribución, capas, colores por estado, leyenda con texto, aviso de distribución ilustrativa, encuadre en el Macrolote 7). Verificar en `pnpm dev`.
- [ ] 2.2 Crear la ficha lateral (resumen + panel de conteos; barrio con "Conocer la tribu"; común; finca con "Consultar por este lote" simulado y ⚖ `agencia` borrador; lugar) y la lista "Elegir en el mapa" sincronizada. Quitar el listado completo de tribus de la página. Solo tokens del tema, un único `<main>`. Verificar en `pnpm dev` a 1280 px y 390 px.

## 3. Tests

- [ ] 3.1 Actualizar `e2e/territorio*.spec.ts` con todos los escenarios de la spec (bloqueando las teselas con `page.route`), y mantener `/territorios/lighthouse` en la auditoría de accesibilidad. Verificar con `pnpm test:e2e`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba (elegir un barrio, el común, una finca disponible y una reservada; probar en celular).
