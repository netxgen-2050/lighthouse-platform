# Proposal

## Why

Gus quiere un asistente de IA presente en toda la experiencia, como una alegoría de lo que hace la red de micelio con las plantas y los seres del suelo: conectar a todos. Todavía no hay IA real, así que el asistente tiene que ser honesto y simpático sobre eso. Decisiones de Gus del 9-oct-2026 sobre "Mi lugar" (Perfil, Pasaporte, Mi recorrido, bandeja y rail). Fase de prototipo interno, sin cuentas todavía: todo se guarda en el navegador (ver `CLAUDE.md`).

## What Changes

- **Hifa** (por las hifas, los filamentos del micelio que conectan raíces y llevan agua, nutrientes y señales): botón fijo **abajo a la derecha** en todas las páginas, con su **avatar placeholder** en SVG (un círculo solar dorado con filamentos de micelio verdes que bajan y se ramifican, estilo solarpunk, con tokens del tema) y el texto accesible "Hablar con Hifa".
- Al activarlo se abre una **ventana de chat** (diálogo no modal, anclado abajo a la derecha, que se puede cerrar con Escape o con su botón y no tapa el rail).
- **Conversación simulada**, guionada en `lib/hifa/guion.ts`, cálida y con humor, en español rioplatense:
  - Saludo: se presenta como un brote de micelio digital que todavía está creciendo.
  - Atajos: "Tengo una idea", "Necesito algo", "Tengo una pregunta", "¿Qué sos?".
  - La persona puede escribir libremente. Hifa responde con frases del guion (varias por tipo, elegidas al azar), siempre **honesta**: todavía no sabe leer ni entender de verdad, no puede pensar ni coordinar por nadie, pero guarda lo que le contaron como una semilla y **invita a imaginar** cómo será cuando funcione como el micelio: conectando a quien necesita con quien ofrece, avisando cuando algo está seco, llevando información entre comunidades.
  - Ejemplos de tono: "Te escucho, aunque todavía soy más hongo que cerebro 🍄" / "No entendí ni una palabra, pero la guardo como quien guarda una semilla de tomate criollo" / "Imaginate que soy las hifas debajo del bosque: hoy apenas toco dos raíces, mañana te conecto con la vecina que tiene la herramienta que buscás".
  - Al final de una idea o una necesidad, ofrece: "¿Querés que se lo pase al equipo de NetX?" → si dice que sí, lo envía con `/api/reportes` como tipo "idea" (o "pregunta"), y confirma con el número.
- La conversación se guarda en el navegador y se puede borrar.
- **Mover el botón "Reportar"**: queda fijo **pegado al borde derecho, a media altura** de la pantalla (como una pestaña vertical, con el ícono del bicho y el texto "Reportar" en vertical o compacto), para no chocar con Hifa. Accesible por teclado y sin tapar contenido importante en el celular.

**Fuera de alcance:** IA real, conexión con la API de Claude, voz.

## Capabilities

### New Capabilities
- `asistente-hifa`: ver specs.

### Modified Capabilities

## Impact

`components/hifa/` (botón, avatar SVG, ventana de chat), `lib/hifa/` (guion y estado, con tests), `components/boton-reportar.tsx` (nueva posición), `app/layout.tsx`, e2e.
