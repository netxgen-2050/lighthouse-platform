# Tasks

## 1. Modelo y datos de ejemplo

- [ ] 1.1 Crear `lib/eventos/tipos.ts` con el modelo de `design.md`, decisión 1. Verificar con `pnpm typecheck`.
- [ ] 1.2 Crear `lib/eventos/datos.ts` con los seis eventos de la decisión 7, bilingües y con `esEjemplo: true`, y `obtenerEventos(idioma)`. Agregar un test que verifique: seis eventos; ids únicos; todos los `organiza.id` existen en `CIRCULOS_DEL_COMUN` o en las tribus; ningún texto cae al español en inglés. Verificar con `pnpm test -- lib/eventos`.
- [ ] 1.3 Crear `lib/eventos/agenda.ts` con `agruparEventos(eventos, hoy)` y `hoyEnArgentina(ahora)`. Tests: evento de hoy en próximos; de ayer en pasados; sin fecha al final de próximos; orden por fecha; a las 22:00 del 28 en Argentina todavía es 28 aunque en UTC ya sea 29. Verificar con `pnpm test -- lib/eventos`.
- [ ] 1.4 Crear `lib/eventos/quiero-ir.ts` (`leer`, `anotar`, `retirar`) y sumar `eventosQuieroIr: "lh-eventos-quiero-ir"` a `NOMBRES_BASE`. Tests: JSON roto o con forma inválida devuelve `{}`; anotar dos veces deja uno; retirar quita solo ese; un almacén que falla se informa. Verificar con `pnpm test -- lib/eventos lib/demo` en verde, incluido el test de nombres de `lib/demo/claves.test.ts` ampliado con la clave nueva.

## 2. Textos, idioma y legal

- [ ] 2.1 Crear `lib/idioma/textos/eventos.ts` (es/en) y registrarlo en `lib/idioma/textos.ts` y en `REVISION_NATIVA`, junto con `lib/eventos/datos.ts` como fuente. Debe incluir "Quiero ir", "Ya no quiero ir", la aclaración de que anotarse no reserva lugar ni da Semillas, los tipos, los formatos y el bloque de la red. Verificar con `pnpm test -- lib/idioma`.
- [ ] 2.2 Sumar `/^\/eventos$/` a `RUTAS_TRADUCIDAS` y a `RUTAS_PUBLICAS`. Agregar casos en `lib/idioma/rutas.test.ts` y `lib/sesion/rutas-publicas.test.ts` (`/eventos`, `/eventos/`, `/eventos?utm_source=x`, `/eventos#evento-minga-agua`; y `/eventos/otra` no pública), y en `lib/permisos/niveles.test.ts` (`/eventos` da `descubrir`). Verificar con `pnpm test -- lib/idioma lib/sesion lib/permisos`.
- [ ] 2.3 Agregar el término `eventoeducativo` a `lib/legal/terminos.ts` con `borrador: true`, `en` y el comentario de borrador (decisión 6). Verificar con `pnpm test -- lib/legal` y con `git diff lib/legal/terminos.ts`, que debe mostrar que `encuentroeducativo` no cambió.

## 3. Página

- [ ] 3.1 Crear `app/eventos/page.tsx` (servidor): `generateMetadata`, `idiomaDelPedido`, `obtenerEventos`, `agruparEventos`; envuelve en `<TemaEvento className="ev-en-netx" lang={idioma}>`, con `<IrAlAncla />`. Tiene un único `h1`, sin `<main>` propio y con secciones `h2` para próximos, pasados y red; la sección de pasados no se dibuja si está vacía. Verificar con `pnpm build` y abriendo `/eventos` con `pnpm dev`.
- [ ] 3.2 Crear `app/eventos/tarjeta-evento.tsx`: artículo con `id="evento-<id>"`, marca "Ejemplo", `ChipFecha` o "sin dato", y una lista con tipo, lugar, organiza (nombre con `translate="no"` si es una tribu), cupo, qué se pide, qué se recibe y formato. Agrega ⚖ `semillas` si tiene Semillas, ⚖ `obra` si es minga o jornada, ⚖ `eventoeducativo` si es educativo. Usa `claseBoton` de `tema-evento.css`. Tests de componente: cada dato faltante dice "sin dato", cupo limitado, cupo abierto, organizador inexistente, y un evento pasado sin "Quiero ir" (el dato "ya pasó" entra por prop). Verificar con `pnpm test -- app/eventos`.
- [ ] 3.3 Crear `app/eventos/quiero-ir.tsx` (cliente) con `queMostrarEnTicket`, `hrefSumarte("/eventos#evento-<id>", "explorador")` y `lib/eventos/quiero-ir`. Sin sesión no llama al almacenamiento. Tests de componente para los cuatro estados, anotar, retirar y fallo al guardar. Verificar con `pnpm test -- app/eventos`.
- [ ] 3.4 Sumar las reglas `.ev-agenda…` a `app/congreso/tema-evento.css` y, si hace falta, sus combinaciones al test de contraste. Verificar con `pnpm test -- app/congreso lib/sin-colores-sueltos` y con `git diff --stat app/congreso`, que debe mostrar solo la hoja y su test.
- [ ] 3.5 Agregar el bloque "Eventos de la red" (decisión 8). Se verifica en la tarea 5.1.

## 4. Actividad y privacidad

- [ ] 4.1 Agregar el mensaje `quisisteIr` en `lib/actividad/actividad.ts`, en `lib/idioma/textos/bandeja.ts` (es/en) y en `EVENTOS` (decisión 4). Llamarlo desde la pieza al anotarse. Tests: texto en los dos idiomas; `clave` sin duplicados; `notificacion` ausente. Verificar con `pnpm test -- lib/actividad`.
- [ ] 4.2 Editar `lib/privacidad/politica.ts` y subir `VERSION_POLITICA` (decisión 5). Agregar la nota de la versión a la cabecera de la política. Actualizar `lib/privacidad/privacidad.test.ts:207` y agregar un caso para la fila "Eventos". Agregar un caso en el test de `exportar`: con la clave guardada sale el valor, y sin ella sale `null`. Verificar con `pnpm test -- lib/privacidad`.
- [ ] 4.3 Agregar a ADR-002 una "Nota 2-nov-2026": el tema también se usa en `/eventos`, con las mismas reglas, y `/eventos` depende de `app/congreso/evento/`. Verificar con `git diff docs/decisiones/ADR-002-tema-propio-del-congreso.md`.

## 5. e2e

- [ ] 5.1 Crear `e2e/eventos.spec.ts`, sin depender de la fecha en que corra (ver `design.md`, "Risks"): sin cuenta se ve la lista con seis marcas "Ejemplo", buscando sin distinguir la sección; datos de la minga por nombre; "sin dato" en `encuentro-verano`; no hay precio, "reservá", "lote" ni "token" dentro de `.tema-evento`; el bloque de la red; 390 x 844 sin scroll horizontal. Verificar con `pnpm test:e2e e2e/eventos.spec.ts`.
- [ ] 5.2 En el mismo archivo, cubrir "Quiero ir" con `encuentro-verano`, que no tiene fecha: sin cuenta el enlace lleva a Sumarte y vuelve a `/eventos#evento-encuentro-verano`; con cuenta, anotar con teclado, recargar y retirar; la línea en `/panel` y sin aviso en la campanita; las claves de Semillas y sellos no cambian; `/mis-datos` lo exporta; dos personas no se pisan. Verificar con `pnpm test:e2e e2e/eventos.spec.ts`.
- [ ] 5.3 En `e2e/eventos.spec.ts`, cubrir inglés: con cookie `en`, textos y datos en inglés, `lang="en"` y sin el aviso de página solo en español. Verificar con `pnpm test:e2e e2e/eventos.spec.ts`.
- [ ] 5.4 Sumar `/eventos` a la lista de páginas de `e2e/accesibilidad.spec.ts`, con sesión, sin sesión, en inglés y con un ⚖ abierto. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 6. Integración

- [ ] 6.1 Confirmar que la vitrina no cambió: `git diff --stat` solo incluye `app/congreso/tema-evento.css` y su test dentro de `app/congreso/`, y no incluye `lib/congreso/`, `lib/navegacion.ts`, `lib/portada.ts`, `lib/semillas/`, `lib/pasaporte/` ni `lib/permisos/` salvo el test de la tarea 2.2.
- [ ] 6.2 `pnpm verificar` y `pnpm build` en verde.
- [ ] 6.3 `pnpm test:e2e` completo en verde. La suba de `VERSION_POLITICA` no debe romper las fixturas; si alguna fija la versión a mano, corregirla y anotarlo en el PR.
