# Tasks

Requisito previo: `congreso-vitrina` implementado. La rama `agente/congreso-bilingue` sale de `agente/congreso-vitrina`. Los textos en español siguen en voseo; los en inglés son de ejemplo, como el contenido.

**Si la noche no alcanza:** los grupos 1 y 2 no cambian nada visible (todo con idioma `"es"` por defecto) y se pueden entregar en un primer PR. Los grupos 3 a 5 (ruta `/congreso/en`, selector, ⚖ y e2e) van juntos en un segundo PR: no se abre `/congreso/en` a medio traducir.

## 1. Idioma y contenido

- [x] 1.1 Crear `lib/congreso/idioma.ts` (`Idioma`, `IDIOMAS`, `esIdioma`, `Bilingue`, `NEUTROS`, `resolver`) según design §1 y `lib/congreso/idioma.test.ts`: resolución completa, caída con ruta anotada, `en: ""` cae, ningún `Bilingue` queda tras resolver, `esIdioma("fr") === false`. Verificar con `pnpm test`.
- [x] 1.2 Generizar los tipos de `lib/congreso/evento.ts` (`Evento<Tx = string>` y los demás, solo en campos traducibles) y cambiar `obtenerEvento(idioma = "es")` para que devuelva `EventoEnIdioma` (design §1). Pasar `lib/congreso/evento-ejemplo.ts` a `Evento<Bilingue>` con la traducción al inglés de todos los textos traducibles. Verificar con `pnpm verificar` (lo que llamaba `obtenerEvento()` sigue compilando).
- [x] 1.3 Ampliar `lib/congreso/evento.test.ts`: en `"en"`, `sinTraducir` vacío y textos clave en inglés; todo `es` no vacío; ningún `en === es` fuera de `NEUTROS`; el test de tuteo corre sobre los lados `es`. Verificar con `pnpm test`.
- [x] 1.4 Sumar `idioma` a `rangoFechas` y `textoPrecio` en `lib/congreso/formatos.ts` (design §3) con casos en inglés en `formatos.test.ts` ("February 2027", "USD 1,200", "Price not available"). Verificar con `pnpm test`.

## 2. Textos fijos

- [x] 2.1 Crear `lib/congreso/interfaz.ts` (diccionario `es`/`en` de las piezas portables, design §2) y `interfaz.test.ts` (mismas claves, sin `en === es` fuera de neutros). Pasar las piezas de `app/congreso/evento/` y `evento/secciones/` a recibir `idioma?: Idioma` y leer sus textos fijos de ahí (cuenta regresiva incluida). Sumar `@/lib/congreso/interfaz` y `@/lib/congreso/idioma` a las importaciones permitidas de `portabilidad.test.ts`. Verificar con `pnpm test` (los tests de piezas en español siguen igual).
- [x] 2.2 Pasar `app/congreso/netx/textos.ts` a `es`/`en` con su test (mismas claves, sin copias) y que las piezas de `netx/` reciban `idioma`. Sumar `idioma?: Idioma` a `RegistroTicket` con su diccionario; el español queda idéntico. Verificar con `pnpm test` y con `pnpm test:e2e e2e/congreso.spec.ts` (los e2e en español en verde).
- [x] 2.3 `BloqueFuente` muestra "Part of this section is only available in Spanish." cuando el idioma es `"en"` y alguna ruta de `sinTraducir` corresponde a su sección (design §7). Verificar con un test de `renderToStaticMarkup` con un evento al que le falta una traducción.

## 3. Ruta, selector y preferencia

- [x] 3.1 Mover el armado de `app/congreso/page.tsx` a `app/congreso/vitrina.tsx` (`Vitrina({ idioma, parametros })`, con `lang` en `TemaEvento`) y crear `app/congreso/en/page.tsx`; cada página con su `metadata` y `alternates.languages` (design §4). Cambiar la regla de `lib/sesion/rutas-publicas.ts` a `/^\/congreso(\/en)?$/` y ajustar su test (`/congreso/en` pública, `/congreso/fr` no). Verificar con `pnpm test` y en `pnpm dev` que `/congreso/en` se ve en inglés sin sesión.
- [x] 3.2 Sumar a la barra del evento el hueco `selectorIdioma` (sin hueco, indicador fijo del idioma) y crear `app/congreso/netx/selector-idioma.tsx` (design §5) con su test de `renderToStaticMarkup`: dos enlaces, nombres "ES · Español" y "EN · English", `aria-current` en el actual, `lang` y `hreflang`. Verificar con `pnpm test`.
- [x] 3.3 Sumar `idiomaCongreso: "lh-congreso-idioma"` a `NOMBRES_BASE` (`lib/demo/claves.ts`) y ajustar `claves.test.ts`/`borrar.test.ts` si cuentan claves. Crear `app/congreso/netx/preferencia-idioma.tsx` (solo en `/congreso`, espera la sesión, `router.replace` a `/congreso/en` con query y ancla). Verificar con `pnpm test` y con el e2e de 5.1.

## 4. ⚖ y aviso

- [x] 4.1 Sumar `en: { titulo, texto }` (borrador, con su comentario) a `ticket`, `presencia`, `obra` y `encuentroeducativo` en `lib/legal/terminos.ts`, y el caso en `terminos.test.ts`. Sumar `idioma?` a `TerminoLegal` y los textos fijos por props a `TooltipTermino` con los valores en español por defecto (design §8). Verificar con `pnpm test` y que el ⚖ de cualquier otra página se ve igual que antes.
- [x] 4.2 Sumar `idioma?: "es" | "en"` a la entrada `termino-legal` de `lib/demo/bitacora.ts` (opcional, compatible con lo guardado) y anotarla desde `TerminoLegal`. Ampliar `bitacora.test.ts` (acepta la entrada con idioma y la vieja sin él; descarta `idioma: "fr"`). En `TerminoLegal`, `idioma` es el del texto mostrado (un ⚖ sin inglés en `/congreso/en` se anota `"es"`) y toda entrada `"en"` va con `borrador: true` (design §8); cubrirlo con un test de la función que arma la entrada. Verificar con `pnpm test`. <!-- arquitecto -->
- [x] 4.3 En la cinta de prototipo en inglés, mostrar "Internal prototype · sample data" junto a "Prototipo interno · datos de ejemplo" en `lang="es"`; en los enlaces a páginas de NetX en español, el aviso "(in Spanish)" con `hreflang="es"` (design §9). Verificar con el e2e de 5.1.

## 5. Pruebas de punta a punta y accesibilidad

- [x] 5.1 Crear `e2e/congreso-en.spec.ts` con los escenarios de design §10 y de la spec: `lang` de la vitrina y del documento; aviso en los dos idiomas; sin "Comprar", "ejemplo", "Por confirmar", "Preguntas" ni "Sumate" en el texto del contenedor `[lang="en"]` descontando sus descendientes `[lang="es"]` (el marco de NetX queda fuera de la comprobación); selector con teclado ida y vuelta conservando `#tribus`; preferencia EN y vuelta a ES; `/congreso/en#entradas` sin sesión; llamado del ticket con `href` `/sumarte?volver=%2Fcongreso%2Fen%23ticket&para=explorador`; registro de `LH27-8F3K-2Q` con sesión y "Pending first check-in"; ⚖ de entradas en inglés con "Draft"; UTM guardado; diálogo en inglés que se cierra con Escape. Verificar con `pnpm test:e2e e2e/congreso-en.spec.ts`.
- [x] 5.2 Sumar `/congreso/en` a `e2e/accesibilidad.spec.ts` (32 rutas, más la variante con modo de origen y diálogo abierto) y al bucle de tema oscuro de `e2e/configuracion.spec.ts`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts e2e/configuracion.spec.ts`.

## 6. Integración

- [ ] 6.1 `pnpm verificar` y `pnpm build` en verde. PR desde `agente/congreso-bilingue` (base: `agente/congreso-vitrina`) con guion de prueba para Gus: abrir `/congreso/en` sin cuenta, cambiar a ES y volver a EN con el teclado, cerrar y abrir `/congreso` (tiene que volver al inglés), abrir un ⚖ en inglés, y el enlace de ejemplo para los organizadores (`/congreso/en?utm_source=pagina-oficial&utm_medium=enlace&utm_campaign=congreso-2027#entradas`). Avisar en el PR que queda pendiente la revisión del arquitecto (ruta pública, preferencia por persona, campo de bitácora).
