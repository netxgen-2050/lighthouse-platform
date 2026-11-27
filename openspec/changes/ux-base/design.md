# Design

Contexto: auditoría UX del 25-nov-2026 (hallazgos H1, H2, H5, H8, H10, H13, H14) y elección de Gus "B + C" del mismo día. Este documento es la referencia de estilo para los otros siete cambios `ux-*`: cuando dicen "según `ux-base`", es esto.

## 1. Principios de la dirección B · Territorio vivo

- **Primero el territorio:** foto, mapa o dibujo arriba; los números después.
- **Aire en lugar de bordes:** las secciones se separan con espacio y un título, no con una caja. Una caja (borde o fondo `surface`) marca **un** objeto que se puede tocar o que es distinto del resto (una tarjeta de lote, un panel de números). Nunca una caja dentro de otra caja con borde.
- **Una acción principal por pantalla**, con `Boton` principal. El resto, secundario o texto.
- **Celular primero:** todo se diseña a 390 px y después se abre a dos columnas.
- **Honestidad igual que hoy:** cada número dice de dónde sale, lo que falta dice "sin dato", nada se comunica solo con color.

## 2. Tokens

En `@theme static` de `app/globals.css`, sin tocar ningún color existente:

| Token | Valor | Uso |
|---|---|---|
| `--radius-s` | 8px | chips, campos, botones `s` |
| `--radius-m` | 14px | botones `m`, tarjetas, paneles |
| `--radius-l` | 20px | hojas, héroe, diálogos |
| `--sombra-1` | `0 1px 2px` del `ink` al 8 % | tarjeta en reposo |
| `--sombra-2` | `0 4px 16px` del `ink` al 10 % | hover, hoja |
| `--sombra-3` | `0 12px 32px` del `ink` al 14 % | diálogo, menú abierto |
| `--dur` / `--curva` | 180ms / `cubic-bezier(.2,.8,.2,1)` | toda transición |

En oscuro las sombras usan negro al 40 %. Con `data-movimiento="reducido"` (y `prefers-reduced-motion`) las transiciones duran 0.

Escala de espaciado: la de Tailwind (múltiplos de 4 px). Entre secciones de una página, 48 px en compu y 32 px en celular; dentro de una sección, 16 o 24 px.

Tipografía: no cambia (Fraunces, Inter Tight, JetBrains Mono). La mono queda **solo para montos y cifras**; las volantas pasan a Inter Tight, mayúscula chica con `tracking` de 0,08em (hallazgo H16, se aplica a medida que cada cambio toca su página).

## 3. Rail en los dos temas

- Fondo: `surface` con borde derecho `line` (hoy `bg-deep text-on-deep`).
- Ítem: ícono 20 px y etiqueta 12 px en `muted`; hover con fondo `surface-2`.
- Ítem activo: píldora `deep` detrás del ícono con el ícono en `on-deep`, etiqueta en `ink` y negrita, `aria-current="page"`. Así el activo se distingue por forma y peso, no solo por color.
- Resultado: en oscuro el rail es verde casi negro, no menta.

## 4. Aviso, cinta y estado administrativo

`Aviso` (`components/ui/aviso.tsx`): bloque con ícono de línea a la izquierda (lucide `Info`, `TriangleAlert`, `Scale`), texto y, opcional, un enlace. Fondo `surface-2` (info), `warn-bg` (atención y legal), borde sólido de 1 px `line`, radio `--radius-m`. **Sin borde punteado** en ningún aviso de la app. `role="note"` cuando es una nota; el estado administrativo mantiene `section` con `aria-label` (lo exigen los e2e).

`CintaPrototipo` (`components/ui/cinta-prototipo.tsx`): una franja angosta, siempre visible, arriba de la barra superior (o dentro de ella a la izquierda en compu), con el texto actual del marco (`t.aviso`, "Prototipo interno · datos de ejemplo") y, en las rutas de venta, `t.avisoVenta`. Fondo `ink`, texto `bg`, 12 px. Va en `app/layout.tsx`, así que las páginas **dejan de renderizar `SelloPrototipo`**. Si un test o una regla exige el sello dentro de una página concreta, se cambia el test para que busque la cinta (el texto es el mismo).

`AvisoEjemplo` ("Comunidades, personas y cifras de ejemplo") pasa a `Aviso` tono `info`, y solo donde hay comunidades o personas de ejemplo; no se repite al lado de la cinta en páginas que no las tienen.

Estado administrativo: nuevo envoltorio `EstadosAdministrativos` que recibe la lista de proyectos de la vista (de `VISTAS_CON_LOTES`) y los muestra dentro de un único `Aviso` tono `legal`, cada uno en su fila con su `section` y su `aria-label` de hoy ("Estado administrativo · Chacras de Soluna"…). El texto (proyecto, estado, norma, titular, expediente, aprobación, fecha, ⚖) es **exactamente el mismo**: la Ord. 173/2026 pide mostrarlo y `e2e/estado-administrativo.spec.ts` lo verifica. La versión compacta (`compacto`) se queda para fichas, con el nuevo estilo. El bloque sigue antes del mapa.

## 5. Componentes base

- `Boton`: `variante` `principal` (fondo `deep`, texto `on-deep`), `secundario` (fondo `surface`, borde `line`, texto `ink`), `texto` (sin fondo, subrayado al hover); `tamano` `m` (44 px de alto) o `s` (36 px, solo en compu). Radio `--radius-m`. Se puede renderizar como `Link` (`href`) o `button`. Foco visible de 2 px `deep`.
- `Pestanas`: `items` con `href` (navegación: `nav` + `aria-current="page"`) o con paneles (`role="tablist"`, flechas del teclado). Estilo único: texto `muted`, la activa en `ink` con subrayado de 2 px y negrita. Reemplaza los estilos de Mi recorrido (botones llenos), Participa (subrayado propio) y Explorar (`components/explorar/pestanas-explorar.tsx` de #218, cuando llegue).
- `EstadoVacio`: dibujo opcional (SVG en el estilo del mapa de Participa, `aria-hidden`), título en Fraunces, texto, `Boton` principal y una "vista previa" opcional (hijos atenuados al 60 % con la etiqueta "Así se va a ver").
- `Esqueleto`: rectángulos `surface-2` con brillo suave (sin brillo con movimiento reducido), `aria-busy` en el contenedor y texto oculto "Cargando…".
- `Seccion`: `h2` + bajada opcional + hijos, con el espaciado de §2. Sin borde ni fondo.

Los cinco componentes del rediseño que se quedan son `Indicador`, `BarraAvance`, `PanelVidrio`, `TablaLibro` y `ChipEstado`. `SelloPrototipo` se borró: su texto vive ahora en `CintaPrototipo` (cambio anotado en la vuelta de corrección).

## 6. Textos "todo es…"

Cambian (es y en): `explorar.bajada`, `barrios.bajada`, `invertir.bajada`, `mi-tierra.bajada`. Ejemplo para Mi tierra: "Tu lote, tu plan en cuotas, tus FARO, tu voz y lo que fuiste haciendo, en un solo lugar. El pago es simulado: no se cobra nada." Para Explorar e Invertir se saca "Todo es de ejemplo." (lo dice la cinta) y, donde hay números de ejemplo, el número mismo lleva "ejemplo" como hoy. Los textos de Pactos y Semillas (en pausa) no se tocan.

## 7. Pie

`body` ya es `min-h-screen flex`. El contenedor de la columna principal pasa a `min-h-dvh` y el `main` a `flex-1`, así el pie queda abajo. El espaciador de la HIFA (`h-16`) se queda.

## 8. Accesibilidad

axe sin violaciones en los dos temas en todas las rutas de `e2e/accesibilidad.spec.ts`. Contraste AA de los pares nuevos (cinta `bg` sobre `ink`, rail activo `on-deep` sobre `deep`, `muted` sobre `surface`) en `lib/tema-contraste.test.ts`. Áreas táctiles de 44 px como mínimo en celular.
