# Design

## Context

- Parte de `congreso-tema-evento`: `obtenerEvento()` (async, contenido de ejemplo), `lib/congreso/formatos.ts`, `app/congreso/tema-evento.css` (tokens `--evento-*` bajo `.tema-evento`), piezas base en `app/congreso/evento/` (tema, botón, barra, chip, cuenta regresiva, tarjeta de entrada, eclipse) y los tests de guarda (colores, selectores, contraste, portabilidad).
- El layout de NetX pone el único `<main>`, la barra superior (`sticky top-0`, 3rem), el rail (4rem en móvil), Hifa (botón fijo abajo a la derecha) y "Reportar" (fijo a la derecha, a media altura). `/congreso` pide nivel `explorador` (`lib/permisos/niveles.ts`); sin sesión, la puerta lleva a `/sumarte?volver=/congreso`.
- `RegistroTicket` guarda el código en `localStorage` (`CLAVES.congreso`) y tiene e2e que dependen de sus textos ("Código de tu ticket", "Registrar", "Modo demostración…", "Genesis pendiente", "Quitar ticket").
- Los UTM se capturan solo en la portada (`app/page.tsx` → `GuardarOrigen`), y la portada ya entiende `?camino=congreso`.

## Goals / Non-Goals

**Goals:**
- Que la página se arme componiendo piezas, sin lógica de contenido en `page.tsx`.
- Que las secciones del evento se puedan llevar a una página externa sin tocar su código.
- Que lo que aporta NetX se vea claramente como "de NetX" (modo de origen).

**Non-Goals:**
- Lógica nueva de ticket, presencia o Genesis.
- Cambiar permisos de `/congreso` o la captura de origen.

## Decisions

### 1. Dos carpetas: evento (portable) y NetX (enchufable)
```
app/congreso/
  page.tsx                    // server: await obtenerEvento() y compone
  evento/secciones/           // portables: heroe, cifras, encuentro, recorrido, voces, ejes,
                              //   entradas, preguntas, cierre, barra-compra-movil
  netx/                       // de NetX: vista-fuentes (cinta + modo), bloque-fuente, territorio,
                              //   tribus, ticket-netx (pasos + RegistroTicket + sello Genesis),
                              //   dialogo-demo, boton-demo
  registro-ticket.tsx         // el de hoy, con apariencia del evento
```
- Las secciones del evento son server components sin estado. Reciben el trozo de `Evento` que usan y **huecos** para lo que pone NetX: `Entradas` recibe `accion: (tipo) => ReactNode` (NetX pasa el botón de demo; una página externa pasaría un enlace al checkout); `Cierre` recibe `accionSecundaria?: ReactNode` (la página oficial); `Recorrido` y `Encuentro` reciben las marcas ⚖ como `ReactNode` opcionales por id de parada o por párrafo. Así el ⚖ no queda atado a la pieza, aunque `TerminoLegal` sigue permitido por el test de portabilidad.
- Las piezas de NetX pueden usar sesión, almacenamiento, `next/link` y tokens de NetX. Se dibujan **dentro** de `.tema-evento` para heredar tipografía y fondo de sección, y usan clases `ev-*` para verse como el resto.
- El test de portabilidad de `congreso-tema-evento` se amplía para cubrir `app/congreso/evento/secciones/`.
- **Alternativa descartada:** una sola carpeta con props `enNetx`. Mezcla las dos cosas y hace imposible llevar las secciones afuera sin arrastrar NetX.

### 2. Modo "de dónde viene"
- `netx/vista-fuentes.tsx` (cliente) dibuja la cinta (con "Prototipo interno · datos de ejemplo" y el botón con `aria-pressed`) y envuelve todo el contenido en un `div` con `data-ver-fuentes="si|no"`.
- `netx/bloque-fuente.tsx` (server) envuelve cada sección con `data-fuente="unityhub" | "netx"` y un `<span class="ev-fuente">Viene de UnityHub · agenda</span>`, oculto con `display: none` cuando el modo está apagado (así no lo lee el lector de pantalla). El borde violeta usa `--evento-uh`; el verde, el token de NetX `--color-green`.
- Mapa de orígenes (texto del mock-up): héroe y cifras → UnityHub · ficha del evento; encuentro → UnityHub · descripción; recorrido → UnityHub · agenda; voces → UnityHub · speakers; ejes → UnityHub · temas; entradas → UnityHub · tickets y Stripe; preguntas → UnityHub · FAQ; territorio → NetX · mapa del territorio; tribus → NetX · tribus; ticket → NetX · ticket vinculado y presencia.
- Visible para todas las personas del prototipo (pregunta abierta: dejarlo solo para super admin).

### 3. Compra y página oficial: un único diálogo de demo
- `netx/dialogo-demo.tsx` (cliente) usa `<dialog>` nativo con `showModal()`: el navegador vuelve inerte el resto (el foco no sale) y Escape lo cierra. Al cerrar, devuelve el foco al disparador guardado. Título y texto por props.
- `netx/boton-demo.tsx`: `<button type="button">` que abre el diálogo con el texto que corresponde. Los botones "Comprar …" son siempre `<button>`, nunca `<a>`.
- Página oficial: si `evento.paginaOficial` existe y `esEjemplo`, botón de demo "Página oficial del evento" → diálogo "Acá se abriría la página oficial del evento". Si existe y no es ejemplo, `<a href={url} rel="noopener">` con variante "línea clara". Si no existe, nada.

### 4. Ticket, Genesis y estado compartido
- `RegistroTicket` suma dos props opcionales, sin cambiar su lógica: `apariencia?: "netx" | "evento"` (cambia clases y baja su título a `h3`) y `alCambiar?: (ticket: string | null) => void` (se llama al leer el almacenamiento al cargar, al registrar y al quitar). Con `apariencia="netx"` (por defecto) se ve como hoy.
- `netx/ticket-netx.tsx` (cliente) guarda el ticket en estado y lo pasa al sello Genesis: sin ticket, "Se activa con tu primer check-in en el territorio."; con ticket, la etiqueta visible "Pendiente del primer check-in". El texto del ⚖ `presencia` va junto al sello. No se calcula presencia.
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
| "Vinculá tu ticket" | `/congreso#ticket` | Con sesión, va directo al formulario. Sin sesión, la puerta lleva a Sumarte con `volver=/congreso` y el ancla se pierde |
| "Llegá con tu tribu" | `/congreso#tribus` o `/tribus` | Igual que arriba (`/tribus` hoy también pide nivel) |
| "Crear cuenta" | `/sumarte?volver=%2Fcongreso` | Al sumarse vuelve a `/congreso` |

- Limitaciones conocidas (no se arreglan acá): los UTM solo se guardan en la portada, y sin sesión se pierde el ancla. Ver preguntas abiertas.
- En sentido inverso (de NetX a la página oficial): el botón secundario del cierre (decisión 3).

### 10. Tests
- `e2e/congreso.spec.ts`: se borran "agenda de 5 días…" y "sin montos ni USD" (reemplazados por esta spec); se mantienen los cuatro de registro y almacenamiento; se agregan los escenarios de esta spec (héroe y un solo `h1`, orden, modo de origen, precios "ejemplo", diálogo con Escape y foco de vuelta sin cambio de URL ni pedidos a otros dominios, página oficial de ejemplo, Genesis pendiente, preguntas con teclado, móvil 390 px con barra y sin scroll horizontal, `#ticket` visible bajo las barras, reducir animaciones).
- `e2e/accesibilidad.spec.ts`: `/congreso` en la lista (31 rutas) y una prueba extra con el modo de origen activo y el diálogo abierto.

## Risks / Trade-offs

- [Los e2e del registro buscan textos que se mantienen, pero la sección cambia de lugar] → la lógica y los textos de `RegistroTicket` no cambian; solo la apariencia por prop.
- [El diálogo nativo y el foco de vuelta varían entre navegadores] → se guarda y restaura el foco a mano; el e2e lo verifica en Chromium.
- [La página es larga y pesada para un servidor de noche] → todo es server component salvo cinta, cuenta regresiva, diálogo y ticket.
- [El octavo eje y los números de tribus son inventados] → están marcados como ejemplo y viven en un solo archivo cada uno.
- [Reemplazar la página del cambio `congreso-registro`] → al archivar, archivar primero `congreso-registro` y después este; el requisito "Página del Congreso" de aquel queda obsoleto (ver nota).

## Migration Plan

- Se implementa en `agente/congreso-vitrina`, apilada sobre `agente/congreso-tema-evento`.
- Nota para el archivo: al archivar `congreso-registro`, su requisito "Página del Congreso" (agenda de 5 días, sin precios) queda reemplazado por `congreso-vitrina`; conviene archivarlo con ese requisito removido o archivar `congreso-vitrina` con un delta `REMOVED` sobre `congreso`. Lo decide Gus al archivar.
- Volver atrás: revertir el PR; `/congreso` vuelve a la versión anterior y la base de `congreso-tema-evento` queda sin uso.
