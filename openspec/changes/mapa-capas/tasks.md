# Tasks

## 0. Antes de empezar

- [ ] 0.1 Confirmar que `idioma-tribus-territorio` está en `dev` (`lib/idioma/textos/territorio.ts` tiene `leyenda`). Si no, frenar y reportar. Verificar con `git log --oneline -- lib/idioma/textos/territorio.ts`.

## 1. Lógica pura

- [ ] 1.1 Crear `lib/territorios/capas.ts` con `GRUPOS`, `grupoDe`, `leerOcultos`, `escribirOcultos` y `resolverInicio` (design §2). Verificar con `lib/territorios/capas.test.ts`: `barrio-6` y el común → `lighthouse`; una finca y el contorno de Soluna → `soluna`; un lugar → `lugares`; id desconocido → `null`; `"soluna,otra,soluna"` → `{soluna}`; `escribirOcultos` vacío → `null` y `{lugares, lighthouse}` → `"lighthouse,lugares"`; `resolverInicio({ ocultar: {lighthouse}, sel: "barrio-6" })` deja `ocultar` vacío. `pnpm verificar` en verde.
- [ ] 1.2 Sumar `leyenda.mostrar` y `leyenda.sinCapas` en español y en inglés en `lib/idioma/textos/territorio.ts` (design §6). Verificar con `lib/idioma/diccionarios.test.ts` y `pnpm verificar`.

## 2. Mapa

- [ ] 2.1 En `mapa-leaflet.tsx`, armar los tres `L.layerGroup` con sus polígonos y marcadores, recibir `visibles` y aplicar la diferencia con `addLayer`/`removeLayer` y el orden de pintado (design §1); exponer `data-capas` en el contenedor. `mapa-cliente.tsx` pasa la prop. Verificar en `pnpm dev`: ocultar y mostrar cada grupo, el orden de pintado como hoy, y con el e2e de 3.1.

## 3. Vitrina

- [ ] 3.1 En `vitrina-territorio.tsx`: estado `ocultos`, lectura y escritura de `?ocultar=` junto con `?sel=` (design §3), reglas de selección, `<fieldset>` con casilla por grupo (design §4) y aviso con todo oculto (design §5). Tokens del tema. Verificar con el e2e de 4.1.

## 4. E2E

- [ ] 4.1 En `e2e/territorio-mapa.spec.ts` sumar: (a) al entrar, tres casillas marcadas y `data-capas` con los tres grupos; (b) desmarcar "Mostrar Lugares de interés" deja 0 sellos de lugar y `data-capas` sin `lugares`; (c) con el Barrio 6 elegido, ocultar el Lighthouse vuelve al resumen y saca `sel` de la URL; (d) con Soluna oculta, elegir una finca desde la lista vuelve a marcar Soluna y la ficha muestra la finca; (e) `?ocultar=soluna,otra` deja solo Soluna oculta; (f) `?ocultar=lighthouse&sel=barrio-6` deja el barrio elegido, la casilla marcada y la URL sin `ocultar`; (g) volver a marcar el único grupo oculto saca `ocultar` de la URL; (h) con las tres desmarcadas aparece "No hay capas a la vista. Marcá alguna en la leyenda." y el aviso del estado administrativo sigue visible; (i) todo con teclado (Tab y Espacio); (j) con la cookie `lh-idioma=en`, las casillas dicen "Show …". Verificar con `pnpm test:e2e e2e/territorio-mapa.spec.ts`.
- [ ] 4.2 En `e2e/accesibilidad.spec.ts`, auditar `/territorios/lighthouse?ocultar=soluna` y la página con las tres capas ocultas. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 5. Cierre

- [ ] 5.1 `pnpm verificar`, `pnpm build` y `pnpm test:e2e` completos en verde; con preview, `BASE_URL=<url> pnpm test:e2e e2e/territorio-mapa.spec.ts`.
