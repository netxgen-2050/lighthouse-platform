# Tasks

**Corte por noche: noche 1, el segundo del carril** (`pnpm noche venta-lotes-regla,loteo-norte-7a`). Parte de la rama `agente/venta-lotes-regla` y su PR apunta a esa rama. Si la noche se queda sin tiempo, primero van las secciones 1 a 3 (capa y lista, lo que se ve el lunes) y el importador (sección 4) puede quedar para la noche 2, avisándolo en el reporte.

**Antes de empezar:** comprobar que `accionesDeLote("lighthouse-norte")` existe; si no, frenar y reportar.

## 1. Datos

- [x] 1.1 Copiar `openspec/changes/loteo-norte-7a/datos/loteo-norte-boceto.geojson` a `lib/territorios/loteo-norte.json` y crear `lib/territorios/loteo.ts` (design §1). <!-- arquitecto: separa los tests del archivo de los del boceto, design §9 --> Verificar con `lib/territorios/loteo.test.ts`: siempre, ids únicos; sin sector, `sectorNorte()` da `null`; y, dentro de `describe.runIf(fuenteDelLoteo() === "ilustrativa")`, 25 lotes, mínimo 1.344 m², máximo 2.200 m², ids `lote-1` a `lote-25`, sector de 102 ha y una zona de cada tipo. `pnpm test lib/territorios`.
- [x] 1.2 Crear `lib/territorios/loteo-estados.ts` (design §3). Verificar en el mismo test: un id sin lote se ignora, y, solo con el boceto, `lote-5` reservado, `lote-13` vendido, `lote-1` disponible y cada id de `ESTADOS_EJEMPLO` existe en `listarLotes()`. `pnpm test lib/territorios`.

## 2. Vista y capa

- [x] 2.1 En `lib/territorios/vistas.ts`, sumar la vista `lotes` primera, y `VISTA_POR_DEFECTO = "lotes"` (design §5). En `lib/territorios/vistas.test.ts`: la vista por defecto, `?vista=red` abre Lotes, `?sel=agua-cuenca` sin vista abre Ahora, `?sel=barrio-6` sin vista abre Visión, y `lote-7` es elegible solo en Lotes. `pnpm test lib/territorios`.
- [x] 2.2 En `app/territorios/[id]/capas.ts`, sumar `estiloLote` con tokens y el grupo `loteo-norte`. Dibujar sector, zonas y lotes en `mapa-leaflet.tsx`, con `fitBounds` al entrar. Usar `VISTA_POR_DEFECTO` en `vitrina-territorio.tsx`. Verificar con `lib/sin-colores-sueltos.test.ts` y `pnpm verificar`.
- [x] 2.3 Sumar los textos es/en a `lib/idioma/textos/territorio.ts` (design §6), la entrada de la vista en la leyenda con los tres estados y "Estados de ejemplo", y el mensaje de Etapa. Verificar con `pnpm verificar` (los tipos obligan a tener los dos idiomas) y `lib/territorios/textos.test.ts`.

## 3. Lista, panel y estado

- [x] 3.1 Sumar la lista de lotes como botones, con "Lote N · superficie · estado", y el panel del lote (design §7). Elegir escribe `sel=lote-N` en la URL. Verificar con `e2e/loteo-norte.spec.ts`, nuevo: la vista Lotes está marcada por defecto; se llega a un lote con Tab, se elige con Enter, y el panel muestra superficie, estado y "Loteo provisorio, ilustrativo"; `?sel=lote-13` muestra "Vendido"; el panel no tiene botones de comprar ni reservar. <!-- arquitecto: design §9 --> El resumen esperado se calcula con `listarLotes()`, y los casos de un lote puntual se saltean si la fuente no es `ilustrativa`. `pnpm test:e2e e2e/loteo-norte.spec.ts`.
- [x] 3.2 En `app/territorios/[id]/page.tsx`, sumar el `EstadoAdministrativo` completo de `lighthouse-norte`, bilingüe, sin `EnEspanol`, y dejar el de Soluna como está. Las dos regiones no pueden llamarse igual: el componente arma su `aria-label` como "Estado administrativo · Chacras de Soluna" y "Estado administrativo · Lighthouse VRN", también en inglés con su propio texto. Verificar en `e2e/estado-administrativo.spec.ts`, que hoy busca una sola región: pasar sus selectores al nombre completo y sumar que la región de Norte dice "supuesto de trabajo, no otorgada". `pnpm test:e2e e2e/estado-administrativo.spec.ts`.
- [x] 3.3 Pasar a `?vista=ahora` los e2e que asumían Ahora por defecto: `e2e/territorio-vistas.spec.ts`, `e2e/territorio.spec.ts`, `e2e/territorio-mapa.spec.ts`, `e2e/descubrir-publico.spec.ts` y lo que marque la corrida. El único cambio de conducta que se acepta es el de la vista por defecto. Verificar con `pnpm test:e2e e2e/territorio-vistas.spec.ts e2e/territorio.spec.ts e2e/territorio-mapa.spec.ts e2e/descubrir-publico.spec.ts`.
- [x] 3.4 Accesibilidad y celular: en `e2e/loteo-norte.spec.ts`, a 390 × 844 px no hay scroll horizontal; el nombre accesible del mapa dice "Lotes"; en inglés se lee "Provisional, illustrative subdivision" y "Sold". Sumar `?vista=lotes` a `e2e/accesibilidad.spec.ts`. `pnpm test:e2e e2e/loteo-norte.spec.ts e2e/accesibilidad.spec.ts`.

## 4. Importador

- [ ] 4.1 Crear `lib/territorios/importar-loteo.ts` con la lectura de KML y la clasificación (design §8), y la función de superposición en `lib/territorios/geometria.ts`. Verificar con `lib/territorios/importar-loteo.test.ts` y un KML de prueba escrito en el test: lee nombres y polígonos; `L-12` da `lote-12`; un `Placemark` desconocido da error con su nombre. `pnpm test lib/territorios`.
- [ ] 4.2 Sumar `validarLoteo` (design §8). Verificar con tests: **el archivo vigente pasa sin errores**, con vecinos que comparten lados; un lote fuera del 7A da error con su id; dos lotes superpuestos dan error con los dos ids; un id repetido da error; <!-- arquitecto --> dos caminos con el mismo id de zona dan error; sin sector hay aviso; un id que falta respecto del archivo anterior da aviso; el aviso de la franja del río siempre está. `pnpm test lib/territorios`.
- [ ] 4.3 Crear `scripts/importar-loteo.ts` y `docs/notas/importar-loteo.md`. <!-- arquitecto: `zip` no está permitido en la noche; la prueba corre dentro de Vitest, design §9 --> Verificar con `scripts/importar-loteo.test.ts`, que corre el comando con `execFileSync` sobre un KML escrito en una carpeta de `os.tmpdir()`, con `--salida` en esa misma carpeta: con `--comprobar` no crea la salida y sale con 0; sin `--comprobar` la escribe, con `area_ha` en el sector; con un lote fuera del 7A sale con 1 y no la crea. El caso `.kmz` arma el archivo con `zip` desde el test, con `it.skipIf` si `zip` no está instalado. Comprobar con `git status` que `lib/territorios/loteo-norte.json` no cambió. La salida del importador se lee con `lib/territorios/loteo.ts` sin cambiar pantallas: comprobarlo en un test con una salida de ejemplo, con `fuenteDelLoteo()` en `martin`. `pnpm test scripts/importar-loteo`.

## 5. Integración

- [ ] 5.1 `git diff --name-only origin/dev` no incluye `lib/permisos/` ni `package.json`. `pnpm verificar` y `pnpm build` en verde.
- [ ] 5.2 Abrir el PR con `scripts/pr.sh`, apuntando a `agente/venta-lotes-regla`, aclarando: que los datos son un boceto improvisado que no considera inundación, costa ni relieve; que los estados son de ejemplo; y que no hay precios ni acciones todavía. Verificar con `scripts/preview-url.sh agente/loteo-norte-7a` y `BASE_URL=<url> pnpm test:e2e e2e/loteo-norte.spec.ts`.
