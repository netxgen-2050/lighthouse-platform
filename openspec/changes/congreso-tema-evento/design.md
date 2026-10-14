# Design

## Context

- `/congreso` hoy es una página chica con tokens de NetX (`app/congreso/page.tsx`, `app/congreso/registro-ticket.tsx`, `lib/congreso/ticket.ts`). No se toca en este cambio.
- La regla "solo tokens del tema" la custodia `lib/sin-colores-sueltos.test.ts`: prohíbe hex y nombres de paleta de Tailwind en `app/` y `components/`, salvo `app/globals.css`.
- `app/globals.css` define los tokens de NetX con `@theme` (globales) y el tema oscuro con `:root[data-tema="oscuro"]`. "Reducir animaciones" se marca con `:root[data-movimiento="reducido"]` y ya acorta animaciones a 0,01 ms, pero **no** anula `animation-delay` ni el estado inicial de `animation-fill-mode: both`.
- La barra superior de NetX es `sticky top-0` de 3rem de alto; el rail mide 4rem en móvil (5rem desde `sm`).
- En App Router, el CSS importado por una ruta **queda cargado** al navegar a otra página. Por eso el alcance del tema no puede depender de "solo se carga en /congreso": tiene que depender del selector.
- Los tests de componentes usan `renderToStaticMarkup` de `react-dom/server` con Vitest (ejemplo: `app/pasaporte/sello-billetera.test.tsx`).

## Goals / Non-Goals

**Goals:**
- Que el implementador de `congreso-vitrina` arme la página solo componiendo piezas y leyendo `obtenerEvento()`.
- Que la excepción de estilo quede encerrada y vigilada por tests, no por buena voluntad.
- Que las piezas del evento se puedan llevar a otra página (de los organizadores o de UnityHub) sin arrastrar el marco de NetX.

**Non-Goals:**
- Cambiar `/congreso` (lo hace `congreso-vitrina`).
- Puerto, adaptadores o red hacia UnityHub.
- Un sistema de temas general para otras secciones de NetX.

## Decisions

### 1. Contenido: tipos en `lib/congreso/evento.ts`, datos en `lib/congreso/evento-ejemplo.ts`
- `evento.ts` exporta los tipos y `obtenerEvento(): Promise<Evento>`. Es `async` desde hoy aunque devuelva datos locales: el día que entre el puerto (skill `integracion-externa`), las pantallas no cambian. Los server components la esperan con `await`.
- Tipos (vocabulario nuestro, no el de UnityHub): `Evento`, `Parada` (`id`, `etiquetaCorta`, `cuando`, `titulo`, `texto`, `lugar`, `destacada`), `Voz` (`id`, `nombre`, `afiliacion`, `iniciales`, `estado: "confirmada" | "por-confirmar"`, `tono` para el degradado del retrato), `Eje` (`id`, `titulo`, `texto`, `icono` como unión cerrada de nombres), `TipoEntrada` (`id`, `nombre`, `etiqueta`, `descripcion`, `precio?: { monto: number; moneda: "USD"; unidad?: string }`, `esEjemplo`, `destacado`, `textoBoton`), `Pregunta` (`id`, `pregunta`, `respuesta`), `Cifra` (`valor: string`, `etiqueta`; texto porque hay valores como "7 min"), `EnlaceExterno` (`url`, `etiqueta`, `esEjemplo`).
- `Evento` lleva: `esEjemplo`, `nombre`, `sobreTitulo`, `lema`, `bajada`, `fechas: { inicio, fin }` (fechas ISO sin hora), `momentoClave: { etiqueta, iso }` (con desfase, `2027-02-06T12:00:00-03:00`), `lugar: { detalle, region }`, `cifras`, `encuentro`, `recorrido`, `voces: { principales, regionales, notaHibrido }`, `ejes`, `entradas: { titulo, bajada, tipos, nota }`, `preguntas`, `cierre: { frase, convocan, entradasCon }` y `paginaOficial?: EnlaceExterno`.
- Los textos se copian del mock-up v2. El mock-up muestra 7 ejes bajo el título "Ocho conversaciones": el contenido de ejemplo agrega un octavo eje de ejemplo ("Aprendizaje y oficios") para que el título sea cierto.
- `paginaOficial` de ejemplo: `{ url: "#pagina-oficial", etiqueta: "Página oficial del evento", esEjemplo: true }`. Con `esEjemplo`, la vitrina no navega: abre el diálogo de demo (ver `congreso-vitrina`).
- **Contrato de la costura** (para que la vitrina no tenga que cambiar cuando entre UnityHub):
  <!-- arquitecto: se agrega el contrato de obtenerEvento() y el dueño de cada dato; sin código nuevo hoy. -->
  - `obtenerEvento()` corre **solo en el servidor** (server components) y es la única que puede llamar a un servicio externo. Las piezas cliente reciben datos por props, nunca la llaman.
  - Nunca devuelve un evento a medias inventado: lo que el origen no trae queda ausente en los campos opcionales (`precio`, `paginaOficial`) y la pantalla dice "sin dato". Hoy esos son los únicos opcionales; si UnityHub no garantiza otro campo, el cambio de integración lo vuelve opcional y la vitrina se ajusta en ese mismo cambio.
  - Las marcas `esEjemplo` (evento, tipo de entrada, página oficial) las decide el origen del dato, no la pantalla: la vitrina muestra "ejemplo" **solo** leyendo la marca, nunca con texto fijo.
  - Modos de falla (cuando haya red, no hoy): sin respuesta o respuesta con otra forma → última copia válida con su fecha de sincronización, o el contenido de ejemplo con `esEjemplo: true`; nunca un error que tire la página. Eso, el puerto (`lib/integraciones/eventos/`) y la fecha de sincronización se diseñan en el cambio de integración, con su ADR.
- **Dueño de cada dato:**

  | Dato | Manda | ¿Lo copiamos? | Hoy |
  |---|---|---|---|
  | Ficha, fechas, lugar, recorrido, voces, ejes, preguntas, cierre | Organizador (vía UnityHub) | Sí, cuando haya integración (copia con fecha de sincronización) | Ejemplo en el repo |
  | Tipos de entrada y precios | Organizador (UnityHub + Stripe) | Solo nombre, descripción y precio para mostrar; **nunca** datos de pago | Ejemplo en el repo |
  | Página oficial del evento | Organizador | Solo la URL | Ejemplo (`#pagina-oficial`) |
  | Ticket vinculado, presencia, Genesis, tribus con ticket | NetX | — | Navegador / ejemplo (`congreso-vitrina`) |
- **Alternativa descartada:** construir ya `lib/integraciones/eventos/{puerto,mock}.ts`. La skill dice no construir el puerto sin integración en el horizonte cercano; la llamada técnica con UnityHub todavía no pasó.

### 2. Funciones puras de formato en `lib/congreso/formatos.ts`
- `rangoFechas(inicio, fin)` → `{ dias: "5–9", mesAnio: "febrero 2027" }` (si cruzan de mes: "28 ene – 2 feb").
- `tiempoRestante(metaIso, ahora)` → `{ dias, horas, minutos }` o `"paso"`. Sin dependencias de zona horaria del navegador: se compara en milisegundos con el ISO que trae el desfase.
- `textoPrecio(tipo)` → "USD 290", "USD 250 c/u" o "Precio sin dato". Los montos con separador de miles `es-AR`.

### 3. Tema: una hoja `app/congreso/tema-evento.css`, clases con prefijo `ev-`
- Se porta casi tal cual el CSS del mock-up, con dos reglas: todo selector empieza por `.tema-evento` (o lo contiene, como `html:has(.tema-evento)` para el `scroll-padding-top`), y todo color literal vive solo en una declaración `--evento-*` dentro de `.tema-evento { … }`.
- Tokens: los nueve del brief (`--evento-noche #1A1433`, `--evento-noche-2 #251C47`, `--evento-corona #FFB627`, `--evento-corona-2 #FF8A1F`, `--evento-rio #1E7F78`, `--evento-brote #9BD86F`, `--evento-dia #E7F3EE`, `--evento-tinta #141A2E`, `--evento-uh #8E63D8`) más los auxiliares del mock-up (`--evento-noche-3`, `--evento-tinta-2`, `--evento-blanco`, paradas del amanecer, horizonte, textos claros sobre noche como `#cfc8ea` y `#d6d0ee`, y transparencias). Las transparencias se escriben con `color-mix(in srgb, var(--evento-blanco) 92%, transparent)`, no con `rgba()`.
- Los SVG (eclipse, horizonte) usan clases con `fill: var(--evento-…)`, nunca `fill="#…"` en TSX. Los degradados de SVG usan `stop-color` por clase.
- **Alternativa descartada:** utilidades de Tailwind con valores arbitrarios (`bg-[var(--evento-noche)]`). Se vuelven ilegibles con 60 reglas portadas del mock-up y no permiten testear "todo selector bajo `.tema-evento`". También descartado: `@theme` de Tailwind, que haría globales los tokens.
- Las clases del tema conviven con utilidades de Tailwind de layout (grid, gap, padding), que no traen color.

### 4. Tema oscuro y movimiento
- `.tema-evento` fija sus propios colores y `color-scheme: light`; las secciones oscuras ponen `color-scheme: dark` localmente. No hay reglas `[data-tema="oscuro"] .tema-evento`.
- Eclipse: `.tema-evento .ev-luna` y `.ev-corona-halo` animan una vez (`3.2s`, `.4s` de demora, `both`). Con `@media (prefers-reduced-motion: reduce)` **y** con `:root[data-movimiento="reducido"]` se pone `animation: none`, así queda el estado final (la luna centrada) desde el primer cuadro. La regla global de `globals.css` no alcanza por la demora inicial.

### 5. Fuentes
- `app/congreso/evento/fuentes.ts` declara `Unbounded` y `Hanken_Grotesk` con `next/font/google`, `variable: "--evento-fuente-titulos"` y `"--evento-fuente-texto"`, `display: "swap"`. Solo las importa `TemaEvento`, que aplica las variables en su contenedor. Next solo precarga fuentes de los módulos de la ruta que las usa.
- Nota de portabilidad: `next/font` ata a Next; si algún día la vitrina se sirve fuera de Next, este archivo es el único a reemplazar (por un `<link>` a Google Fonts).

### 6. Piezas portables en `app/congreso/evento/`
- `tema-evento.tsx` (contenedor `.tema-evento` + fuentes), `boton.tsx` (`variante: "corona" | "linea" | "linea-clara"`, `href?` → `<a>`, si no `<button type="button">`), `barra-evento.tsx`, `chip-fecha.tsx`, `cuenta-regresiva.tsx` (cliente; arranca en "—" con texto accesible "Calculando la cuenta regresiva", calcula en `useEffect` y refresca cada 30 s), `tarjeta-entrada.tsx` (recibe `alComprar?: () => void` o un `accion?: ReactNode`), `eclipse.tsx` (SVG decorativo con `aria-hidden`).
- Importaciones permitidas en `app/congreso/evento/`: `react`, `next/font/google` (solo en `fuentes.ts`), `@/lib/congreso/evento` y `@/lib/congreso/formatos`, y archivos de la misma carpeta. Un test lo verifica leyendo los `import` de cada archivo.
<!-- arquitecto: se saca `@/components/termino-legal` de la lista. Importa `@/lib/demo/bitacora` y `@/lib/demo/anotar-en-bitacora` (almacenamiento del navegador de NetX) y `@/lib/legal/terminos` (catálogo de NetX): permitirlo rompía la portabilidad por la puerta de atrás. El ⚖ entra como `ReactNode` por props (huecos), igual que en `congreso-vitrina` §1. -->
- El ⚖ **no** se importa en las piezas: la pieza expone un hueco (`ReactNode` opcional, por ejemplo `marcaLegal` en la tarjeta o en la sección) y quien compone la página (NetX) pasa `<TerminoLegal clave="…" />`. Una página externa pasa su propio aviso o nada.
- Lo que es de NetX (ticket vinculado, tribus, Genesis, sesión, cinta de prototipo) **no** va acá: lo agrega `congreso-vitrina` en `app/congreso/netx/`.

### 7. Tests de guarda
- `lib/sin-colores-sueltos.test.ts`: excluye `app/congreso/tema-evento.css` (igual que hoy excluye `globals.css`) y agrega: "`--evento-` no aparece fuera de `app/congreso/`".
- `app/congreso/tema-evento.test.ts`: (a) todo selector contiene `.tema-evento`; (b) colores literales solo en declaraciones `--evento-*`; (c) pares de contraste. La tabla de pares vive en el test (texto, fondo, tamaño "normal" | "grande" | "borde") y se calcula con la fórmula de luminancia relativa de WCAG leyendo los valores de los tokens de la hoja. Para el amanecer se declara un par por cada parada del degradado que queda detrás de texto. `congreso-vitrina` amplía la tabla.
- `app/congreso/evento/portabilidad.test.ts`: importaciones permitidas (decisión 6).
- `lib/congreso/evento.test.ts` y `lib/congreso/formatos.test.ts`: forma, precios, voces, fechas, cuenta regresiva.
- Componentes: `renderToStaticMarkup` para botón, barra, chip, tarjeta y eclipse.

## Risks / Trade-offs

- [El CSS del Congreso queda cargado al salir de `/congreso`] → todo selector bajo `.tema-evento` y test que lo exige; fuera de esa clase no aplica nada.
- [Dos sistemas de estilo en el repo] → excepción acotada por ADR-002 (Propuesta) y por tests; si Gus la rechaza, se borra una hoja y una carpeta.
- [El degradado del amanecer pasa por tonos claros donde el texto blanco no llega a AA] → los pares del test lo detectan; la vitrina debe ubicar el texto sobre la parte oscura o con un velo. Axe no evalúa degradados, por eso el test propio.
- [Fuentes de Google en el build] → ya ocurre con las fuentes de NetX; sin cambio de riesgo.
- [`obtenerEvento()` async obliga a server components] → la página ya es server component; las piezas cliente reciben datos por props.

## Migration Plan

Sin migración: archivos nuevos y un test ajustado. Para volver atrás, se borran `app/congreso/evento/`, `app/congreso/tema-evento.*`, `lib/congreso/evento*.ts` y `lib/congreso/formatos*.ts`, y se revierte el test de colores.

## Open Questions

- Si la vitrina se sirve algún día fuera de NetX (ruta sin marco, dominio propio, export estático o iframe): no cambia este diseño; las piezas ya son portables. Queda en el ADR-002 como opción futura.
