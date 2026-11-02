# Proposal

> 🔴 **Estado al 23-oct-2026: evento cancelado.** El Congreso de febrero 2027 no se hace (anunciado en la llamada con UnityHub del 23-oct). Este cambio ya está implementado: el tema y las piezas portables de `/congreso` quedan como **vitrina de ejemplo, a reutilizar** para eventos de comunidad (`NS_platform` nota 20) **o retirar**. Decisión pendiente de Gus.

## Why

Gus quiere mostrarle al CEO y a un inversor cómo se vería el Congreso de febrero 2027 como **página de evento con fuerza de marketing**, al estilo de las páginas de evento de UnityHub, dentro del marco de NetX. Antes de rehacer la página (cambio `congreso-vitrina`), hace falta la base: el contenido del evento tipado y en un solo lugar, una identidad visual propia que no rompa la regla de "solo tokens del tema", y las piezas visuales reutilizables. Además, los organizadores podrían querer su propia página fuera de NetX: por eso las piezas del evento tienen que ser **portables** desde el principio.

Fuentes: brief `NS_platform/Documentation/integraciones/UnityHub/04 - Brief para el especificador · Congreso × UnityHub.md` (v3), mock-up `NS_platform/Documentation/mockup/congreso-unityhub-mockup.html` (v2; copia para las noches en `docs/referencia/congreso-unityhub-mockup-v2.html`) y la guía `01 - Guía de arquitectura (cómo planear integraciones).md` (secciones 1 y 2: el dueño de la ficha del evento es el organizador/UnityHub; para el mock-up, datos nativos de ejemplo).

## What Changes

- **Contenido del evento tipado y de ejemplo.** Tipos del evento (`Evento`, `Parada`, `Voz`, `Eje`, `TipoEntrada`, `Pregunta`, enlace opcional a la página oficial) y un único archivo de contenido de ejemplo, marcado como ejemplo. Las pantallas lo leen **solo** con `obtenerEvento()`, que es la costura donde más adelante entra la integración con UnityHub.
- **Voseo en todos los textos** (decisión de Gus, 14-oct: el público es argentino). El contenido de ejemplo y los textos fijos de las piezas se escriben en voseo, aunque el mock-up v2 esté en tuteo. Un test atrapa las formas de tuteo más comunes.
- **Voces reales marcadas "Por confirmar"** (decisión de Gus, 14-oct): las cuatro voces principales son Roxanne Meadows, Michel Bauwens, Michael Reynolds y Bill Reed, con su afiliación del mock-up, todas en estado `por-confirmar`, sin fotos ni citas atribuidas.
- **Tema del evento con alcance.** Tokens `--evento-*` definidos solo dentro del contenedor `.tema-evento`, en un único archivo de estilos del Congreso. El tema oscuro de NetX no cambia los colores del evento. Es una **excepción explícita** a "solo tokens del tema": se propone como **ADR-002 (Propuesta)**.
- **Tipografía del evento:** Unbounded (títulos) y Hanken Grotesk (texto), cargadas solo en la ruta del Congreso.
- **Tests de guarda:** los colores literales y los tokens `--evento-*` solo pueden aparecer en `app/congreso/`; todo selector del tema está bajo `.tema-evento`; las combinaciones de texto y fondo del tema cumplen contraste AA; las piezas portables no importan nada del marco de NetX.
- **Componentes base portables del evento:** contenedor del tema, botones (corona, línea, línea clara), barra flotante con anclas, chip de fechas, cuenta regresiva, tarjeta de tipo de entrada y la ilustración del eclipse (se anima una sola vez; quieta con "reducir animaciones"). Reciben todo por props.
- `/congreso` **no cambia** en este cambio: la página nueva llega con `congreso-vitrina`.

### Fuera de alcance

- Rehacer la página `/congreso` (cambio `congreso-vitrina`).
- **Integración con UnityHub:** nada de puertos, adaptadores, variables de entorno, rutas `app/api` ni pedidos de red. `obtenerEvento()` devuelve el contenido de ejemplo, y es donde después entra el puerto según la skill `integracion-externa` (requiere su propio ADR y revisión del arquitecto).
- Datos reales del Congreso: todo es de ejemplo; se cambian en un solo archivo cuando el organizador los comparta (backlog L3).
- Servir la vitrina fuera de NetX (ruta sin marco, dominio propio, export estático, iframe): queda anotado como opción futura en el ADR-002 y sigue como pregunta abierta (Gus todavía lo está evaluando).
- Inglés: lo agrega el cambio `congreso-bilingue` (apilado sobre `congreso-vitrina`). Este cambio deja el contenido solo en español (voseo).

## Capabilities

### New Capabilities
- `congreso-contenido-evento`: contenido del evento tipado, de ejemplo y leído por una única función de acceso; reglas sobre precios, voces y enlace a la página oficial.
- `congreso-tema-evento`: identidad visual propia del evento con alcance limitado a `/congreso` (tokens, tipografía, contraste, movimiento) y las piezas base portables que la usan.

### Modified Capabilities
- (ninguna: no hay specs vigentes del Congreso en `openspec/specs/`)

## Impact

- Código nuevo: `lib/congreso/evento.ts`, `lib/congreso/evento-ejemplo.ts`, `lib/congreso/formatos.ts` (fechas, precios y cuenta regresiva, puros), `app/congreso/tema-evento.css`, `app/congreso/evento/*` (piezas portables) y sus tests.
- Test existente ajustado: `lib/sin-colores-sueltos.test.ts` (excluye solo el archivo del tema del Congreso, que pasa a tener su propio test).
- Dependencias: ninguna nueva (`next/font/google` ya se usa en el layout).
- Documentación: `docs/decisiones/ADR-002-tema-propio-del-congreso.md` (Propuesta) y su línea en `docs/decisiones/README.md` (se entregan con este cambio de spec).
- Sin cambios en base de datos, permisos, sesión, datos personales ni pagos.
