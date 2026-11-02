# Proposal

## Why

Después de esta noche hay tres pantallas en **modo demostración** que guardan cosas en el navegador (perfil, compromisos y ticket del Congreso), pero nada las junta: quien terminó la entrevista no sabe qué sigue, y en la demo hay que abrir cada página para mostrar el estado. La US-14 de la nota 15 ("Mi panel": mi estado y mis próximos pasos, para no perderme) cierra el recorrido "Explorar" de la It.1. Además, cada pantalla define su clave de `localStorage` adentro del componente y con estilos distintos (`lh-perfil-entrevista`, `lighthouse.compromisos.v1`, `lh-congreso-ticket`), lo que hace frágil leerlas desde otro lado.

## What Changes

- Página `/panel` ("Mi recorrido") con tres tarjetas, cada una con su estado **en texto** y un enlace:
  - **Perfil:** "N de 6 datos confirmados" o "Todavía no empezaste la entrevista" → `/perfil`.
  - **Compromisos:** "N ofrecés · M necesitás" o "Todavía no registraste compromisos" → `/compromisos`.
  - **Congreso:** "Ticket LH27-… registrado · Genesis pendiente" o "Sin ticket registrado" → `/congreso`.
- Un bloque **"Tu próximo paso"** que sugiere lo primero que falta, en el orden perfil → compromisos → Congreso; si no falta nada: "Ya recorriste todo lo que hay por ahora."
- Aviso "Modo demostración: este panel lee lo que guardaste en este navegador." y un botón "Borrar todo lo de este navegador" (con confirmación) que borra las tres claves.
- Las claves de `localStorage` pasan a un solo módulo (`lib/demo/`), **con los mismos valores** que hoy para no perder lo que ya guardó alguien en el preview.
- Enlace "Mi recorrido" en el encabezado global.

**Fuera de alcance:**
- **Plata:** nada de plan, Pase Fundador, Sumarte, fideicomiso ni montos (las filas "Macrolote · fideicomiso" y "Red NetX · Plan" del panel del mock-up no van). Los compromisos se cuentan, no se suman horas.
- **Textos legales:** las **alertas** del mock-up (residencia fiscal, tierra ribereña, seguro de obra) dependen de ⚖ que no están en `lib/legal/terminos.ts`; no van.
- **Lotes y Ordenanza 173:** el panel no muestra el estado del loteo ni la alerta "el 7A obtuvo aprobación preliminar" de la US-14; por eso no lleva el banner.
- Pactos, tribu propia, roles por proyecto, próxima llamada, notificaciones: no existen todavía.
- Cuentas y datos en servidor: sigue todo en el navegador.

## Capabilities

### New Capabilities
- `panel-recorrido`: el resumen en un solo lugar de lo que la persona hizo en modo demostración y su próximo paso.

### Modified Capabilities

## Impact

Código nuevo en `app/panel/` y `lib/demo/`; cambio de una línea (importar la clave) en `app/perfil/entrevista.tsx`, `app/compromisos/formulario.tsx` y `app/congreso/registro-ticket.tsx`; un enlace en `components/encabezado.tsx`; `e2e/panel.spec.ts`. **Depende de** `perfil-entrevista`, `compromisos-registro` y `congreso-registro` en `main`. Independiente de `portada-caminos` y de `personas-ejemplo` (si `personas-ejemplo` ya está, "Borrar todo" también borra la persona elegida). Sin dependencias npm nuevas.
