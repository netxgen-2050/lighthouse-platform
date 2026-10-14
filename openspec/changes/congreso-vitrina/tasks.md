# Tasks

Requisito previo: `congreso-tema-evento` implementado. La rama `agente/congreso-vitrina` sale de `agente/congreso-tema-evento`. Referencia visual y de textos: `docs/referencia/congreso-unityhub-mockup-v2.html`.

## 1. Datos y textos de NetX

- [ ] 1.1 Agregar `encuentroeducativo` (borrador) a `lib/legal/terminos.ts` con el texto de design §6 y actualizar `lib/legal/terminos.test.ts`. Verificar con `pnpm test`.
- [ ] 1.2 Crear `lib/congreso/tribus-con-ticket.ts` (ejemplo `valle`, `agua`, `taller`; cruza con `buscarTribu`, total = `roles.cubiertos`, omite ids inexistentes) y su test: tres tribus, `conTicket ≤ total`, ninguna con total 0, marca de ejemplo. Verificar con `pnpm test`.

## 2. Secciones portables del evento

- [ ] 2.1 Crear en `app/congreso/evento/secciones/` `heroe.tsx`, `cifras.tsx`, `encuentro.tsx`, `recorrido.tsx`, `voces.tsx`, `ejes.tsx`, `entradas.tsx`, `preguntas.tsx`, `cierre.tsx` y `barra-compra-movil.tsx`, server components con props y huecos según design §1, ids de ancla de la spec y estilos `ev-*` agregados a `app/congreso/tema-evento.css` (portados del mock-up v2, bajo `.tema-evento`). Ampliar `portabilidad.test.ts` a esta carpeta. Verificar con `pnpm test` (portabilidad, colores y selectores en verde).
- [ ] 2.2 Escribir `app/congreso/evento/secciones/secciones.test.tsx` con `renderToStaticMarkup` y el evento de ejemplo: un solo `h1` en el héroe; recorrido como `<ol>` de 4 con la etiqueta visible del día del eclipse; 4 voces con "Por confirmar" e iniciales `aria-hidden`; 8 ejes; 6 precios con "ejemplo"; el hueco de acción de entradas se dibuja por tipo; preguntas como `<details>`; cierre sin botón secundario si no se pasa. Verificar con `pnpm test`.
- [ ] 2.3 Ampliar la tabla de pares de `app/congreso/tema-evento.test.ts` con los pares de design §8 (amanecer por parada, brote, río, entradas, cifras) y ajustar el degradado o el velo hasta que pasen. Verificar con `pnpm test`.

## 3. Piezas de NetX

- [ ] 3.1 Crear `app/congreso/netx/vista-fuentes.tsx` y `bloque-fuente.tsx` (design §2), con "Prototipo interno · datos de ejemplo" en la cinta y los textos de origen. Verificar con un test de `renderToStaticMarkup` de `bloque-fuente` (atributo `data-fuente` y texto de origen) y `pnpm test`.
- [ ] 3.2 Crear `app/congreso/netx/dialogo-demo.tsx` y `boton-demo.tsx` (design §3): `<dialog>` modal, Escape, "Entendido" y foco de vuelta. Verificar con el e2e de la tarea 5.1.
- [ ] 3.3 Crear `app/congreso/netx/territorio.tsx` y `tribus.tsx` (design §5) con "sin dato" donde falte y enlaces a `/territorios/lighthouse` y `/tribus`. Verificar con un test de `renderToStaticMarkup`: "N de M van" en texto, "ejemplo" y los dos enlaces.
- [ ] 3.4 Sumar a `app/congreso/registro-ticket.tsx` las props `apariencia` y `alCambiar` (design §4) sin cambiar lógica ni textos, y crear `app/congreso/netx/ticket-netx.tsx` con los 5 pasos (`<ol>`, quién hace cada uno en texto), `RegistroTicket` con `apariencia="evento"` y el sello Genesis con ⚖ `presencia`. Verificar con `pnpm test` y con los e2e de registro existentes en verde.

## 4. Página

- [ ] 4.1 Rehacer `app/congreso/page.tsx`: `await obtenerEvento()`, `TemaEvento` > `VistaFuentes` > barra del evento + secciones en el orden de la spec, cada una dentro de su `BloqueFuente`; ⚖ `obra` en "Manos en la tierra", ⚖ `encuentroeducativo` en El encuentro, ⚖ `ticket` en Entradas; botón secundario de página oficial (design §3); `metadata.title` con el nombre del evento. Sin `<main>` propio. Verificar en `pnpm dev`: la página se ve como el mock-up v2 dentro del rail, en claro y en tema oscuro de NetX, y a 390 px.

## 5. Pruebas de punta a punta y accesibilidad

- [ ] 5.1 Reescribir `e2e/congreso.spec.ts` según design §10: borrar los tests de agenda y "sin montos", mantener los de registro y almacenamiento, y agregar los escenarios de la spec (orden de secciones y rail "Congreso"; un `h1`; modo de origen con `aria-pressed` y textos; 6 precios con "ejemplo"; "Comprar pase completo" abre el diálogo, Escape lo cierra, el foco vuelve y la URL no cambia, sin pedidos a otros dominios; página oficial de ejemplo abre el diálogo; Genesis "Pendiente del primer check-in" al registrar `LH27-8F3K-2Q`; pregunta que se abre con Enter; `/congreso#ticket` con el título visible bajo las barras; a 390 px barra fija clickeable y `scrollWidth ≤ clientWidth`; con "reducir animaciones" la luna sin animación activa). Verificar con `pnpm test:e2e e2e/congreso.spec.ts`.
- [ ] 5.2 Sumar `/congreso` a `e2e/accesibilidad.spec.ts` (31 rutas, actualizar el test que cuenta) y una prueba con el modo de origen activo y el diálogo abierto. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 6. Integración

- [ ] 6.1 `pnpm verificar` y `pnpm build` en verde. PR desde `agente/congreso-vitrina` (base: `agente/congreso-tema-evento`) con guion de prueba para Gus: abrir `/congreso`, activar "¿Qué viene de UnityHub?", apretar un "Comprar …", registrar `LH27-8F3K-2Q`, probar a 390 px y con "reducir animaciones"; y el enlace a la tabla de enlaces de vuelta (design §9).
