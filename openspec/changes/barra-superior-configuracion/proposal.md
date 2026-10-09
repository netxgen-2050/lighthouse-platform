# Proposal

## Why

Gus quiere las acciones de la persona arriba a la derecha, como en la mayoría de las aplicaciones web (GitHub, Linear, Notion, Slack): notificaciones, perfil y accesos internos, más una sección de configuración. Decisiones de Gus del 9-oct-2026. Fase de prototipo interno, sin cuentas: las preferencias se guardan en el navegador (ver `CLAUDE.md`).

## What Changes

- **Barra superior** fija, arriba a la derecha (en el celular, una barra superior compacta), con, de izquierda a derecha:
  - **NetX** (ícono con la marca "Interno", enlace a `/netx`; pasará a ser solo para admins con los roles).
  - **Campanita** con el número de no leídas (la de `bandeja-notificaciones`), que lleva a `/bandeja`.
  - **Avatar** (iniciales del perfil o ícono genérico) que abre un menú: **Perfil**, **Pasaporte**, **Mi recorrido**, **Configuración**, y "Salir" (deshabilitado: "llega con el login").
- El **rail** queda solo con la navegación (Descubrir, Participar, Sumarte); se quitan de abajo del rail la campanita, el avatar y NetX.
- **Página `/configuracion`**, con las preferencias guardadas en el navegador y aplicadas al instante:
  - **Apariencia:** tema claro, oscuro o el del sistema (si el tema oscuro no existe todavía, se crea la paleta oscura con tokens); tamaño de texto (normal, grande); reducir animaciones.
  - **Notificaciones:** qué tipos aparecen en la bandeja (comunidades, pactos, rondas, mercado, postulaciones).
  - **Asistente:** mostrar u ocultar el botón de Hifa.
  - **Moneda de referencia:** USD o ARS para mostrar montos (con un tipo de cambio de ejemplo, marcado como tal).
  - **Idioma:** español (inglés, "próximamente", deshabilitado).
  - **Tus datos:** ver la Bitácora (enlace) y "Borrar todo lo guardado en este navegador" (el mismo que hoy está en Mi recorrido, que pasa a vivir acá y en Mi recorrido queda un enlace).
- El menú del avatar y la barra son accesibles por teclado, con `aria-current` cuando la página actual es una de las del menú.

**Fuera de alcance:** preferencias sincronizadas entre dispositivos (llega con las cuentas), idioma inglés real.

## Capabilities

### New Capabilities
- `barra-superior-configuracion`: ver specs.

### Modified Capabilities

## Impact

`components/barra-superior.tsx`, menú del avatar (moverlo desde el rail), `components/rail.tsx`, `app/configuracion/`, `lib/configuracion/` (preferencias, con tests), `app/globals.css` (paleta oscura y tamaño de texto), `lib/actividad/` (filtro por tipo), Hifa (ocultar), montos en Sumarte y Pactos (moneda), e2e.
