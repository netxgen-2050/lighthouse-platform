# Design

## Context

- Parte de `congreso-tema-evento`: `obtenerEvento()` (async, contenido de ejemplo), `lib/congreso/formatos.ts`, `app/congreso/tema-evento.css` (tokens `--evento-*` bajo `.tema-evento`), piezas base en `app/congreso/evento/` (tema, botón, barra, chip, cuenta regresiva, tarjeta de entrada, eclipse) y los tests de guarda (colores, selectores, contraste, portabilidad).
- El layout de NetX pone el único `<main>`, la barra superior (`sticky top-0`, 3rem), el rail (4rem en móvil), Hifa (botón fijo abajo a la derecha) y "Reportar" (fijo a la derecha, a media altura). Hoy `/congreso` pide nivel `explorador` (`lib/permisos/niveles.ts`); sin sesión, la puerta lleva a `/sumarte?volver=/congreso`. Con este cambio pasa a ser pública (decisión 11).
- `capacidadDeRuta()` devuelve `"descubrir"` para toda ruta de `RUTAS_PUBLICAS`, y `rutaPideConsentimiento()` devuelve `false` para las rutas públicas (salvo `/sumarte`). Las dos cosas pasan a valer para `/congreso`.
- `RegistroTicket` guarda el código en `localStorage` (`CLAVES.congreso`, con el prefijo `u:<id>:` de la persona en sesión) y tiene e2e que dependen de sus textos ("Código de tu ticket", "Registrar", "Modo demostración…", "Genesis pendiente", "Quitar ticket").
- Los UTM se capturan solo en la portada (`app/page.tsx` → `leerParametros` + `GuardarOrigen`), y la portada ya entiende `?camino=congreso`. `components/sesion/entrar-para.tsx` exporta `hrefSumarte(volver, para?)`.

## Goals / Non-Goals

**Goals:**
- Que la página se arme componiendo piezas, sin lógica de contenido en `page.tsx`.
- Que las secciones del evento se puedan llevar a una página externa sin tocar su código.
- Que lo que aporta NetX se vea claramente como "de NetX" (modo de origen).
- Que cualquiera pueda ver la vitrina sin cuenta y que el enlace "Vinculá tu ticket" de una página externa funcione sin perder el ancla.

**Non-Goals:**
- Lógica nueva de ticket, presencia o Genesis.
- Vincular el ticket sin cuenta.
- Cambiar la lógica de captura de origen (solo se reutiliza en otra página).

## Decisions

### 1. Dos carpetas: evento (portable) y NetX (enchufable)
```
app/congreso/
  page.tsx                    // server: await obtenerEvento() y compone
  evento/secciones/           // portables: heroe, cifras, encuentro, recorrido, voces, ejes,
                              //   entradas, preguntas, cierre, barra-compra-movil
  netx/                       // de NetX: vista-fuentes (cinta + modo), bloque-fuente, territorio,
                              //   tribus, ticket-netx (pasos + RegistroTicket + sello Genesis),
                              //   dialogo-demo, boton-demo, textos.ts (textos fijos de NetX)
  registro-ticket.tsx         // el de hoy, con apariencia del evento
```
- Las secciones del evento son server components sin estado. Reciben el trozo de `Evento` que usan y **huecos** para lo que pone NetX: `Entradas` recibe `accion: (tipo) => ReactNode` (NetX pasa el botón de demo; una página externa pasaría un enlace al checkout); `Cierre` recibe `accionSecundaria?: ReactNode` (la página oficial); `Recorrido` y `Encuentro` reciben las marcas ⚖ como `ReactNode` opcionales por id de parada o por párrafo. Así el ⚖ no queda atado a la pieza. `Entradas` recibe además `marcaLegal?: ReactNode` para el ⚖ `ticket`. <!-- arquitecto: `TerminoLegal` ya no está permitido en las piezas portables (arrastra la bitácora del navegador y el catálogo legal de NetX); el ⚖ siempre entra por hueco. Ver congreso-tema-evento design §6. -->
- Las piezas de NetX pueden usar sesión, almacenamiento, `next/link` y tokens de NetX. Se dibujan **dentro** de `.tema-evento` para heredar tipografía y fondo de sección, y usan clases `ev-*` para verse como el resto.
- El test de portabilidad de `congreso-tema-evento` se amplía para cubrir `app/congreso/evento/secciones/`.
- **Voseo** (decisión de Gus, 14-oct): los textos fijos de las secciones y de `netx/` se escriben en voseo aunque el mock-up v2 use tuteo ("No vengas solo. Llegá con tu tribu.", "Comprás tu entrada", "Vinculás tu ticket en NetX"). Los textos fijos de `netx/` viven en `netx/textos.ts`; el test de tuteo de `congreso-tema-evento` se aplica también a ese archivo.
- **Alternativa descartada:** una sola carpeta con props `enNetx`. Mezcla las dos cosas y hace imposible llevar las secciones afuera sin arrastrar NetX.

### 2. Modo "de dónde viene"
- `netx/vista-fuentes.tsx` (cliente) dibuja la cinta (con "Prototipo interno · datos de ejemplo" y el botón con `aria-pressed`) y envuelve todo el contenido en un `div` con `data-ver-fuentes="si|no"`.
- `netx/bloque-fuente.tsx` (server) envuelve cada sección con `data-fuente="unityhub" | "netx"` y un `<span class="ev-fuente">Viene de UnityHub · agenda</span>`, oculto con `display: none` cuando el modo está apagado (así no lo lee el lector de pantalla). El borde violeta usa `--evento-uh`; el verde, el token de NetX `--color-green`.
- Mapa de orígenes (texto del mock-up): héroe y cifras → UnityHub · ficha del evento; encuentro → UnityHub · descripción; recorrido → UnityHub · agenda; voces → UnityHub · speakers; ejes → UnityHub · temas; entradas → UnityHub · tickets y Stripe; preguntas → UnityHub · FAQ; territorio → NetX · mapa del territorio; tribus → NetX · tribus; ticket → NetX · ticket vinculado y presencia.
- Visible para todas las personas, con o sin cuenta (decisión de Gus, 14-oct). No usa `SoloSuperAdmin` ni lee la sesión.

### 3. Compra y página oficial: un único diálogo de demo
- `netx/dialogo-demo.tsx` (cliente) usa `<dialog>` nativo con `showModal()`: el navegador vuelve inerte el resto (el foco no sale) y Escape lo cierra. Al cerrar, devuelve el foco al disparador guardado. Título y texto por props.
- `netx/boton-demo.tsx`: `<button type="button">` que abre el diálogo con el texto que corresponde. Los botones "Comprar …" son siempre `<button>`, nunca `<a>`.
- **Texto del diálogo de compra, sin decir quién cobra** (decisión de Gus, 14-oct; quién cobra es pregunta abierta para Gabriel): título "Acá se abriría la compra del ticket"; texto "En la versión real, este botón abriría la compra del pase elegido. Al terminar, te llegaría un email con tu entrada y su código." y "Prototipo: no se cobra nada ni se abre otra página." No nombra a UnityHub, Stripe ni NetX como quien cobra. Los textos del diálogo viven en `netx/textos.ts` (un solo lugar para cuando Gabriel responda).
- Página oficial: si `evento.paginaOficial` existe y `esEjemplo`, botón de demo "Página oficial del evento" → diálogo "Acá se abriría la página oficial del evento". Si existe y no es ejemplo, `<a href={url} rel="noopener noreferrer">` con variante "línea clara" (la URL ya viene validada como `https://`, spec `congreso-contenido-evento`). Si no existe, nada.
<!-- arquitecto: rel con noreferrer (skill revision-seguridad-datos) y garantía explícita de que no hay camino de cobro. -->
- **Ningún camino de cobro:** el diálogo y el botón de demo no hacen `fetch`, no tienen `<form>` que envíe, no usan server actions ni rutas `app/api`, y no guardan nada en el navegador. "Comprar …" no depende de `esEjemplo`: aunque algún día los precios sean reales, en este cambio siempre abre el diálogo. Conectar un checkout real es otro cambio, con su ADR y revisión del arquitecto.

### 4. Ticket, Genesis y estado compartido
- `RegistroTicket` suma dos props opcionales, sin cambiar su lógica: `apariencia?: "netx" | "evento"` (cambia clases y baja su título a `h3`) y `alCambiar?: (ticket: string | null) => void` (se llama al leer el almacenamiento al cargar, al registrar y al quitar). Con `apariencia="netx"` (por defecto) se ve como hoy.
- `netx/ticket-netx.tsx` (cliente) guarda el ticket en estado y lo pasa al sello Genesis: sin ticket, "Se activa con tu primer check-in en el territorio."; con ticket, la etiqueta visible "Pendiente del primer check-in". El texto del ⚖ `presencia` va junto al sello. No se calcula presencia.
- `ticket-netx` dibuja `RegistroTicket` **solo** si hay sesión, el nivel alcanza la capacidad `congreso` (Explorador) y la política de privacidad está vigente; en cualquier otro caso muestra el llamado a sumarse (decisión 11). Los pasos y el sello Genesis (sin ticket) se ven siempre.
- La sección lleva `id="ticket"` (el mock-up usaba `#presencia`).

### 5. Territorio y tribus leen los catálogos de NetX
- Territorio: `buscarTerritorio("lighthouse")` y `textoSuperficie()` de `lib/territorios/datos.ts`; segundo dato: cantidad de barrios (`tribusDeTerritorio("lighthouse").length`). Lo que falte se muestra "sin dato". La ilustración del valle se porta del mock-up con clases de tokens y `role="img"` con su texto alternativo.
- Tribus: `lib/congreso/tribus-con-ticket.ts` con un arreglo de ejemplo `{ tribuId, conTicket }` para `valle`, `agua` y `taller`, cruzado con `buscarTribu()`; el total es `roles.cubiertos` de la tribu. Si una tribu no existe en el catálogo se omite. Texto visible "N de M van", barra decorativa (`aria-hidden`) y "ejemplo".

### 6. Textos legales
- `encuentroeducativo` en `lib/legal/terminos.ts`, `borrador: true`, con comentario de texto nuevo. Título "Encuentro educativo". Texto borrador: "El Congreso es un encuentro educativo, no una oferta de inversión. Los proyectos que buscan socios se presentan por separado, solo a quien lo pida, y sumarse es siempre opcional. Cualquier aporte pasa por los documentos propios de cada proyecto." Se actualiza el test del catálogo.
- Se reutilizan `ticket`, `presencia` y `obra` tal como están.

### 7. Barras, anclas y móvil
- Barra del evento: `position: sticky; top: 3rem` (debajo de la barra de NetX). `html:has(.tema-evento) { scroll-padding-top: 8.5rem }` para que las anclas no queden tapadas.
- Barra de compra móvil: `position: fixed; bottom: 0; left: 4rem; right: 0`, solo bajo 640 px, con `padding-right` suficiente para no quedar debajo del botón de Hifa. La página suma un margen inferior para que el pie no quede tapado.
- Contenedores con `min-width: 0` y `overflow-x: clip` en el héroe para que el eclipse desbordado no genere scroll horizontal.

### 8. Contraste del amanecer
- El degradado de "El encuentro" se reparte para que manifiesto y columnas queden sobre las paradas oscuras; las paradas claras (corona y `#ffc77a` del mock-up) quedan por debajo del último párrafo, solo como transición. Se agregan a la tabla de contraste del test los pares de texto contra cada parada que queda detrás de texto. Si alguna no llega, el párrafo va sobre un velo `--evento-noche` semitransparente.
- También se suman a la tabla: la tinta sobre `--evento-brote` (tribus), el blanco sobre `--evento-rio` (ejes), `#cfc8ea` sobre `--evento-noche-2` (entradas) y el texto de las cifras sobre noche.

### 9. Enlaces de vuelta (desde una página externa hacia NetX)
Para cuando los organizadores o UnityHub tengan su propia página. Los enlaces recomendados, con UTM para medir de dónde viene la gente:

| Desde la página externa | Enlace a NetX | Qué pasa hoy |
|---|---|---|
| "Conocé NetX" / "Sumate a la plataforma" | `/?camino=congreso&utm_source=pagina-oficial&utm_medium=enlace&utm_campaign=congreso-2027` | La portada guarda el origen y recomienda el camino del Congreso |
| "Vinculá tu ticket" | `/congreso?utm_source=pagina-oficial&utm_medium=enlace&utm_campaign=congreso-2027#ticket` | Llega a la sección del ticket con o sin cuenta y guarda el origen. Con cuenta, ve el formulario; sin cuenta, "Sumate gratis para vincular tu ticket", que al sumarse la devuelve a `/congreso#ticket` |
| "Llegá con tu tribu" | `/tribus` o `/congreso#tribus` | Las dos son públicas: se ven sin cuenta <!-- arquitecto: corregido; /tribus no pide nivel --> |
| "Ver el Congreso en NetX" | `/congreso?utm_source=pagina-oficial&utm_medium=enlace&utm_campaign=congreso-2027` | Vitrina completa sin cuenta; guarda el origen |
| "Crear cuenta" | `/sumarte?volver=%2Fcongreso` | Al sumarse vuelve a `/congreso` |

- Las dos limitaciones que había (UTM solo en la portada y ancla perdida sin sesión) se resuelven con las decisiones 11 y 12.
- En sentido inverso (de NetX a la página oficial): el botón secundario del cierre (decisión 3).

### 10. Tests
- `e2e/congreso.spec.ts`: se borran "agenda de 5 días…" y "sin montos ni USD" (reemplazados por esta spec); se mantienen los cuatro de registro y almacenamiento; se agregan los escenarios de esta spec (visitante sin cuenta: vitrina completa, sin formulario de ticket, con "Sumate gratis para vincular tu ticket" que lleva a `/sumarte?volver=%2Fcongreso%23ticket&para=explorador`; origen guardado al entrar con UTM y conservado si ya había uno; héroe y un solo `h1`, orden, modo de origen, precios "ejemplo", diálogo con Escape y foco de vuelta sin cambio de URL ni pedidos a otros dominios (el registro de pedidos arranca **justo antes** del clic en "Comprar …" y termina al cerrar el diálogo, para no contar lo que la sesión pide al cargar la página <!-- arquitecto: evita un e2e frágil por los pedidos de Privy al cargar -->), página oficial de ejemplo, Genesis pendiente, preguntas con teclado, móvil 390 px con barra y sin scroll horizontal, `#ticket` visible bajo las barras, reducir animaciones).
- `e2e/accesibilidad.spec.ts`: `/congreso` en la lista (31 rutas) y una prueba extra con el modo de origen activo y el diálogo abierto, más una sin sesión (con el llamado a sumarse en lugar del formulario).
- `e2e/descubrir-publico.spec.ts`: "Congreso" pasa a la lista de destinos habilitados sin sesión en el rail (deja de tener `aria-disabled` y "Sumate gratis para usar esto: Congreso").
- Unitarios: `lib/sesion/rutas-publicas.test.ts` (`/congreso` y `/congreso/` públicas; `/congreso/otra` no), `lib/permisos/niveles.test.ts` (`/congreso` → `"descubrir"`; se ajustan los casos de `avisoDeRuta` y `ayudaDeRuta` que usaban `/congreso`, cambiándolos por otra ruta de Explorador) y `lib/privacidad/privacidad.test.ts` (`/congreso` no pide consentimiento).

### 11. Visitantes sin cuenta (decisión de Gus, 14-oct)
<!-- arquitecto (nota previa, se mantiene): abrir la ruta es chico; lo que no puede quedar abierto es el registro del ticket. -->
- `lib/sesion/rutas-publicas.ts` suma `/^\/congreso$/` con un comentario: "La vitrina del Congreso se ve sin cuenta; vincular el ticket pide cuenta (decisión de Gus, 14-oct-2026)". Efectos que trae solo: el rail habilita "Congreso" sin sesión; `capacidadDeRuta("/congreso")` pasa a `"descubrir"`; la puerta deja pasar sin sesión; Hifa y "Reportar" no aparecen sin sesión (como en el resto de Descubrir).
- **El registro del ticket no queda abierto.** Como la ruta pública deja de pedir el consentimiento (`rutaPideConsentimiento`), el control pasa a `ticket-netx`, que decide con `useSesion()`:

  | Estado | Qué ve en el bloque del ticket |
  |---|---|
  | Verificando la sesión | Nada en el lugar del formulario (como `EntrarPara`), para no mostrar una acción que no corresponde |
  | Sin sesión, o con sesión sin nivel Explorador | Enlace "Sumate gratis para vincular tu ticket" |
  | Con sesión y nivel, política de privacidad pendiente | Enlace "Aceptá la política de privacidad para vincular tu ticket" (Sumarte pide el consentimiento antes de seguir) |
  | Con sesión, nivel y política vigente | `RegistroTicket` como hoy |
  | Con sesión pero nivel todavía sin leer (`nivelListo` falso) o consentimiento `"cargando"` | Nada (igual que "verificando") |
  | `sin-acceso` o `error` | Nada (la puerta ya muestra su pantalla; la función igual tiene que devolver algo) |

  <!-- arquitecto: la tabla tenía cuatro filas y los estados reales son más (`EstadoSesion` tiene 5 valores y `EstadoConsentimiento` 3). Sin estas dos filas, una persona Explorador con la política aceptada vería un instante "Aceptá la política…" mientras se lee el consentimiento, o el formulario antes de saber si aceptó. Regla: el formulario aparece **solo** con `estado === "ok" && nivelListo && alcanza(nivel, "explorador") && consentimiento === "vigente"`; cualquier estado desconocido o en carga es "nada". -->

- El enlace de los dos llamados es `hrefSumarte("/congreso#ticket", "explorador")` → `/sumarte?volver=%2Fcongreso%23ticket&para=explorador`. `esRutaInterna` acepta el `#`; Sumarte muestra "Esta acción se habilita al sumarte gratis como Explorador." y, cuando el nivel alcanza, hace `router.replace("/congreso#ticket")`. No se usa `EntrarPara` tal cual porque arma la vuelta con `pathname + search` y pierde el ancla, y porque no mira el consentimiento.
- Sin sesión, `RegistroTicket` no se monta: no lee ni escribe `CLAVES.congreso`, así que no queda un ticket sin prefijo de persona.
- Lo del evento es de ejemplo y viaja igual al navegador: abrir la ruta no expone datos de personas. La puerta del navegador no es protección para datos personales: la vinculación real del ticket va a necesitar verificación en el servidor (cambio de integración).
- **Revisada por el arquitecto (14-oct):** el camino de vuelta funciona con el código de hoy: `esRutaInterna` acepta `/congreso#ticket`, `/sumarte` pide el consentimiento antes de dibujarse (`rutaPideConsentimiento`), y con `para=explorador` Sumarte hace `router.replace(volver)` en cuanto el nivel alcanza. La persona con la política pendiente acepta en Sumarte y vuelve sola. Se completaron los estados de carga de la tabla.
- Fuera del ticket, con sesión y política pendiente la página pública igual anota el ⚖ en la bitácora y `GuardarOrigen` guarda el origen (mismo comportamiento que hoy en la portada y en Tribus). No cambia con este cambio; queda como pregunta general para Gus. <!-- arquitecto -->


### 12. Origen de la visita en `/congreso` (decisión de Gus, 14-oct)
- `page.tsx` recibe `searchParams`, hace `leerParametros(await searchParams)` y dibuja `<GuardarOrigen origen={…} />`, igual que la portada. Misma lógica: valores crudos (solo `trim`), hasta 200 caracteres, se guarda solo si hay fuente, medio o campaña, y se conserva el primero (`guardarSiNoHay`). Funciona con y sin sesión.
- `GuardarOrigen` es de NetX (`components/`): se dibuja en la página, nunca dentro de las secciones portables.
- Leer `searchParams` vuelve la página dinámica (se arma en cada pedido). Con contenido local es barato; queda anotado en Riesgos.

## Risks / Trade-offs

- [Los e2e del registro buscan textos que se mantienen, pero la sección cambia de lugar] → la lógica y los textos de `RegistroTicket` no cambian; solo la apariencia por prop.
- [El diálogo nativo y el foco de vuelta varían entre navegadores] → se guarda y restaura el foco a mano; el e2e lo verifica en Chromium.
- [La página es larga y pesada para un servidor de noche] → todo es server component salvo cinta, cuenta regresiva, diálogo y ticket.
- [El octavo eje y los números de tribus son inventados] → están marcados como ejemplo y viven en un solo archivo cada uno.
- [Abrir `/congreso` saca el consentimiento de la puerta] → `ticket-netx` exige sesión, nivel y política vigente antes de montar `RegistroTicket` (decisión 11), con e2e del visitante sin cuenta.
- [Las voces son personas reales] → solo nombre, afiliación e iniciales, todas "Por confirmar"; sin fotos ni citas.
- [Leer `searchParams` hace la página dinámica] → contenido local y server components; si molesta, el origen se puede leer en el cliente con `useSearchParams` dentro de `GuardarOrigen`.
- [Reemplazar la página del cambio `congreso-registro`] → al archivar, archivar primero `congreso-registro` y después este; el requisito "Página del Congreso" de aquel queda obsoleto (ver nota).

## Migration Plan

- Se implementa en `agente/congreso-vitrina`, apilada sobre `agente/congreso-tema-evento`.
- Nota para el archivo: al archivar `congreso-registro`, su requisito "Página del Congreso" (agenda de 5 días, sin precios) queda reemplazado por `congreso-vitrina`; conviene archivarlo con ese requisito removido o archivar `congreso-vitrina` con un delta `REMOVED` sobre `congreso`. Lo decide Gus al archivar.
- Volver atrás: revertir el PR; `/congreso` vuelve a la versión anterior y la base de `congreso-tema-evento` queda sin uso.

## Open Questions

- **Para Gabriel: ¿quién cobra el ticket?** ¿El organizador vía UnityHub (con Stripe) o NetX? El diálogo de demo no lo afirma (§3). Si la respuesta es NetX, cambian estos textos, todos en un solo archivo cada uno: en `lib/congreso/evento-ejemplo.ts`, la nota de entradas ("Pago seguro con Stripe en UnityHub…"), el paso 1 ("Comprás tu entrada… UnityHub"), la respuesta a "¿Necesito una cuenta en NetX para ir?" y el pie ("Entradas y check-in con UnityHub"); en `app/congreso/netx/`, el texto de origen "UnityHub · tickets y Stripe"; y en `RegistroTicket`, "Lo vende el organizador del Congreso".
- **Sigue abierta (Gus la está evaluando): servir la vitrina fuera de NetX** (ruta sin marco, dominio propio, export estático o iframe). Fuera de alcance; anotada en ADR-002.

Resueltas por Gus el 14-oct y ya integradas: `/congreso` sin cuenta (§11), modo "¿Qué viene de UnityHub?" para todas las personas (§2), voseo en todos los textos, UTM al entrar directo (§12), voces reales "Por confirmar" y texto del diálogo sin decir quién cobra (§3).
