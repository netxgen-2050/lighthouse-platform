# Proposal

## Why

El Congreso de febrero 2027 se canceló el 23-oct-2026 (Backlog D16). El 2-nov-2026 Gus decidió reemplazar la sección Congreso por una página de **Eventos**: encuentros, mingas, jornadas, talleres y visitas al territorio, primero del Lighthouse VRN y más adelante de la red. Es la salida al mercado que propone la nota 20 de `NS_platform` (muchos eventos chicos en vez de uno grande).

Este cambio construye la página. El reemplazo del Congreso (rail, redirecciones, enlaces y textos) va en el cambio siguiente, `eventos-reemplaza-congreso`, para que cada uno entre en una noche y este se pueda probar sin tocar lo que ya funciona.

## What Changes

- **Página `/eventos`**, bilingüe (es/en, en una sola dirección) y pública como lo era `/congreso`: lista eventos de ejemplo, con los próximos primero y los que ya pasaron aparte.
- **Cada evento muestra:** nombre, tipo, fecha, lugar (en el territorio o fuera), quién organiza (círculo o tribu), cupo, qué se pide, qué se recibe y "Quiero ir". Lo que falta dice "sin dato".
- **"Quiero ir"** es una intención guardada en el navegador de la persona. Pide cuenta y política vigente, igual que el ticket del Congreso. **No reserva lugar, no descuenta cupo y no da Semillas.**
- **Semillas:** un evento puede decir que da Semillas por asistir o por ayudar, sin cantidad y aclarando que las confirma quien organiza.
- **Conexión con las convocatorias de la red (D26):** cada evento puede indicar su formato (voluntariado, jornada o minga, actividad puntual) y la página anuncia con un bloque breve que las convocatorias de otros nodos llegan más adelante. No se pueden publicar ni responder.
- **Legal:** nuevo ⚖ en borrador "Encuentro educativo" para eventos (es/en), sin nombrar al Congreso. Las mingas y jornadas usan el ⚖ `obra` que ya existe, y las Semillas el ⚖ `semillas`.
- **Privacidad:** "a qué eventos querés ir" es un dato nuevo. Se suma a la política (borrador) y, por ADR-017, sube `VERSION_POLITICA`: **todas las personas vuelven a aceptar la política**. La descarga de `/mis-datos` lo incluye sin cambios de código, porque recorre todas las claves.
- **Mi recorrido:** anotarse deja una línea en la actividad, sin notificación.
- **Reutiliza de la vitrina:** el tema del evento, las piezas portables que sirven y el manejo de bilingüe (ver `design.md`). No mueve ni cambia nada de `app/congreso/`, salvo sumar clases a su hoja de estilos.

**Fuera de alcance (se anota para más adelante):**
- Venta de entradas o cualquier cobro, aunque sea simulado.
- UnityHub: ni lectura de eventos, ni inscripción, ni chat. `obtenerEventos()` queda como la costura, igual que `obtenerEvento()` en el Congreso.
- Check-in, confirmación de presencia, constancias y emisión de Semillas por asistir (D31, nota 20 §5).
- Presencia Genesis y su re-anclaje (D16, `NS_Tokenomics` I-15).
- Convocatorias completas de la red: constructor de acuerdos, publicación por nodo, asistente de IA y mapa (D26, D27, D28). Tampoco el piloto de La Abuela Beba, que Gus no decidió.
- Eventos de otros nodos: el modelo los admite, pero la lista de ejemplo trae solo Lighthouse VRN.
- Crear o editar eventos desde la plataforma, detalle por evento, filtros, lista de asistentes, conteo de lugares libres y recordatorios.
- Guardar "Quiero ir" en la base: sigue la misma regla que el resto del prototipo.
- Rail, redirección de `/congreso`, portada, Mi recorrido, Pasaporte, Semillas y Sumarte: los toca `eventos-reemplaza-congreso`.

## Capabilities

### New Capabilities
- `eventos-pagina`: la página que lista los eventos de comunidad, con sus datos, sus marcas de ejemplo y sus textos en dos idiomas.
- `eventos-quiero-ir`: la intención de ir a un evento: quién puede anotarse, qué se guarda, qué no produce y cómo figura en la política de privacidad.

### Modified Capabilities

(ninguna: las specs vigentes en `openspec/specs/` no cubren esta zona.)

## Impact

- Código nuevo: `app/eventos/`, `lib/eventos/`, `lib/idioma/textos/eventos.ts`.
- Código que cambia: `lib/sesion/rutas-publicas.ts`, `lib/idioma/rutas.ts`, `lib/idioma/textos.ts`, `lib/idioma/revision-nativa.ts`, `lib/idioma/textos/bandeja.ts`, `lib/actividad/actividad.ts`, `lib/actividad/eventos.ts`, `lib/demo/claves.ts`, `lib/legal/terminos.ts`, `lib/privacidad/politica.ts`, `lib/privacidad/consentimiento.ts`, `app/congreso/tema-evento.css` (solo se agregan reglas).
- Tests: unitarios de `lib/eventos/`, rutas públicas, rutas traducidas, claves, privacidad; e2e `e2e/eventos.spec.ts` (nuevo) y `e2e/accesibilidad.spec.ts`.
- **Permisos:** agrega una ruta pública. **Datos personales:** agrega un dato en el navegador y sube la versión de la política. Sin tablas, sin migraciones y sin integraciones. **Pide revisión del arquitecto.**
- ADR-002 ("tema encerrado en `/congreso`") se extiende: el tema también se usa en `/eventos`. Se deja una nota en el ADR.
