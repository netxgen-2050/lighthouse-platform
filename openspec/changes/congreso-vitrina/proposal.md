# Proposal

## Why

Gus le va a mostrar al CEO y a un inversor cómo se vería el Congreso de febrero 2027: una página de evento que dé ganas de ir (al estilo de las páginas de evento de UnityHub) y que, a la vez, deje claro cómo el ticket se conecta con NetX: tribus, ticket vinculado y sello Genesis. La `/congreso` de hoy es una agenda y un formulario; no cumple ese papel. Este cambio la rehace como **vitrina**, sobre la base de `congreso-tema-evento` (contenido tipado, tema propio y piezas portables).

Los organizadores podrían tener su propia página del evento, fuera de NetX. Por eso la vitrina separa las **piezas del evento** (portables, todo por props desde `obtenerEvento()`) de las **piezas de NetX** (ticket vinculado, tribus, territorio, Genesis, cinta de prototipo), que se enchufan solo en nuestra versión, y modela un enlace opcional a la página oficial.

Fuentes: brief `NS_platform/Documentation/integraciones/UnityHub/04 - Brief para el especificador · Congreso × UnityHub.md` (v3), mock-up v2 (copia en `docs/referencia/congreso-unityhub-mockup-v2.html`), guía `01 - Guía de arquitectura (cómo planear integraciones).md` §1–2 y ADR-002 (Propuesta).

## What Changes

- **`/congreso` se rehace** con las secciones del mock-up v2, en orden: cinta de prototipo con "¿Qué viene de UnityHub?", barra flotante del evento, héroe (eclipse, fechas, cuenta regresiva, título, tarjeta de lugar), cifras, El encuentro, Recorrido, Voces, Ejes, El territorio (NetX), Tribus (NetX), Entradas, Tu ticket también abre la puerta a NetX (NetX), Preguntas, Cierre y barra fija de "Entradas" en móvil.
- **Secciones del evento portables** (`app/congreso/evento/secciones/`): no conocen la sesión, el rail ni el almacenamiento; reciben el contenido por props y exponen huecos para lo que enchufa NetX (la acción de "Comprar", el ⚖).
- **Piezas de NetX** (`app/congreso/netx/`): cinta de prototipo y modo "de dónde viene" (con texto de origen en cada bloque, no solo color), territorio con datos del catálogo de territorios, tribus con tickets vinculados (ejemplo), puente de 5 pasos, `RegistroTicket` **reutilizado** con el estilo del evento (sigue guardando solo en el navegador) y el sello Genesis como "pendiente".
- **`/congreso` se abre a visitantes sin cuenta** (decisión de Gus, 14-oct): se suma a `lib/sesion/rutas-publicas.ts` y la vitrina se ve completa sin sesión. **Vincular el ticket sí pide cuenta:** sin sesión (o sin nivel Explorador, o sin la política de privacidad aceptada), el bloque del ticket muestra "Sumate gratis para vincular tu ticket" con un enlace a Sumarte que vuelve a `/congreso#ticket`. Los pasos y el sello Genesis se siguen viendo como explicación.
- **Origen de la visita (UTM) también en `/congreso`** (decisión de Gus, 14-oct): la página guarda `utm_source`, `utm_medium` y `utm_campaign` con la misma lógica de la portada (`lib/origen/origen.ts`: valores crudos, hasta 200 caracteres, se conserva el primero).
- **Modo "¿Qué viene de UnityHub?" visible para todas las personas**, con o sin cuenta (decisión de Gus, 14-oct).
- **Voseo en todos los textos** (decisión de Gus, 14-oct), incluidos los de las piezas de NetX y el diálogo de demo. Las voces principales son las personas reales del mock-up, marcadas "Por confirmar".
- **Comprar es una demo:** cada "Comprar …" abre un diálogo accesible "Acá se abriría la compra del ticket", que **no dice quién cobra** (organizador vía UnityHub o NetX: pregunta abierta para Gabriel). Nunca un pago, nunca un enlace externo.
- **Página oficial del evento (opcional):** si el contenido la trae, aparece como botón secundario en el cierre; si es de ejemplo, abre el diálogo de demo en vez de navegar.
- **Enlaces de vuelta** desde una página externa hacia NetX: documentados en `design.md`, con anclas estables (`#entradas`, `#tribus`, `#ticket`).
- **Textos legales:** ⚖ `ticket` en Entradas, ⚖ `presencia` en Genesis, ⚖ `obra` en "Manos en la tierra" y una clave nueva **borrador** `encuentroeducativo` para "es educativo; los proyectos se presentan aparte y son opcionales".
- **Reemplaza** la "Página del Congreso" del cambio `congreso-registro` (agenda de 5 días y "sin precios"): en la fase de prototipo se pueden mostrar montos (ver `CLAUDE.md`). El requisito "Registro del ticket en modo demostración" se mantiene igual.
- Accesibilidad: un solo `h1`, anclas y diálogo usables con teclado, axe en verde (se suma `/congreso` a la auditoría), contraste AA por sección y 390 px sin scroll horizontal.

### Fuera de alcance

- **Integración con UnityHub** (puerto, adaptadores, variables de entorno, red, checkout real, lectura de tickets o check-ins). `obtenerEvento()` sigue devolviendo el contenido de ejemplo; la integración va en un cambio propio con la skill `integracion-externa`, su ADR y revisión del arquitecto.
- Check-in, cálculo de presencia y otorgamiento real de Genesis (backlog P3 `congreso-checkin-genesis`; tablas `tickets`, `checkins`, `cuentas_vinculadas`).
- **Servir la vitrina fuera de NetX** (ruta sin marco, dominio propio, export estático, iframe): opción futura anotada en ADR-002; sigue como pregunta abierta (Gus todavía lo está evaluando).
- Iframe de la página real de UnityHub.
- Vincular el ticket sin cuenta, y verificar el ticket en el servidor (la vinculación real va con la integración).
- Definir quién cobra el ticket: el diálogo de demo no lo afirma. Los demás textos del mock-up que nombran a UnityHub y Stripe para la compra (nota de entradas, paso 1, pregunta frecuente y pie) quedan como están, en el archivo de contenido de ejemplo, hasta que Gabriel responda.
- Fotos de las voces (no hay permisos) y mapa interactivo dentro de la sección Territorio (se usa la ilustración).
- Inglés: lo agrega el cambio `congreso-bilingue`, apilado sobre este.
- Datos reales del Congreso.

## Capabilities

### New Capabilities
- `congreso-vitrina`: la página `/congreso` como vitrina del evento dentro del marco de NetX: secciones, orden, piezas de NetX enchufadas, compra de demostración, enlaces de entrada y salida, y sus reglas de accesibilidad.

### Modified Capabilities
- (ninguna en `openspec/specs/`: el cambio `congreso-registro` está completo pero sin archivar; ver la nota en `design.md` sobre cómo archivarlos en orden)

## Impact

- Código: `app/congreso/page.tsx` (rehecha, lee `searchParams` para el origen), `app/congreso/evento/secciones/*`, `app/congreso/netx/*`, `app/congreso/registro-ticket.tsx` (apariencia del evento y aviso de cambio, misma lógica), `app/congreso/tema-evento.css` (estilos de las secciones), `lib/congreso/tribus-con-ticket.ts` (ejemplo), `lib/legal/terminos.ts` (+1 clave borrador), `lib/sesion/rutas-publicas.ts` (+`/congreso`).
- Tests: `e2e/congreso.spec.ts` (se reemplazan los tests de agenda y "sin montos"; los de registro siguen; se suman los de visitante sin cuenta y origen), `e2e/accesibilidad.spec.ts` (+`/congreso`), `e2e/descubrir-publico.spec.ts` (Congreso deja de estar deshabilitado en el rail sin sesión), `lib/sesion/rutas-publicas.test.ts`, `lib/permisos/niveles.test.ts` y `lib/privacidad/privacidad.test.ts` (la ruta pasa a "descubrir" y deja de pedir el consentimiento), tests unitarios nuevos.
- Depende de `congreso-tema-evento` (se implementa después, en una rama apilada sobre aquella).
- **Toca permisos y datos personales:** abre una ruta sin cuenta y cambia dónde se pide el consentimiento para guardar el ticket (que queda en el navegador con el prefijo de la persona, como hoy). El arquitecto dejó anotado qué implica (design, "Visitantes sin cuenta"); el ajuste a esta decisión de Gus queda **pendiente de su revisión**. Sin cambios en base de datos ni integraciones. Plata: solo montos de ejemplo y un diálogo de demo; no hay cobro.
