# Proposal

## Why

La US-05 de la nota 15 (prioridad M, módulo `perfil/` de la It.1 "Explorar") pide que la persona diga **cuánto se quiere involucrar** (solo invertir / visitar / vivir parte del año / mudarme) para que la plataforma le muestre lo relevante. Hoy todas las personas reciben el mismo recorrido: quien llega solo para invertir tiene que hacer la entrevista de tribus antes de enterarse de que existe "Para inversores" en `/sumarte`. En esta fase de prototipo interno (`CLAUDE.md`), la plataforma tiene que dejar claro que **va a servir para captar plata de inversores**, y el gradiente es el lugar natural para abrir ese atajo sin esconder el camino de comunidad.

## What Changes

- **Selector "¿Cuánto te querés quedar?"** arriba de la entrevista en `/perfil`, con cuatro niveles (textos de la nota 15): Solo invertir, Visitar, Vivir parte del año, Mudarme. Cada nivel con una línea que lo explica. Se puede cambiar cuando se quiera y la entrevista sigue igual.
- **Atajo para inversores:** si la persona elige "Solo invertir", aparece un recuadro con el enlace a **Para inversores** (`/sumarte#inversores`) y la aclaración de que la entrevista sigue disponible si quiere encontrar tribu.
- **Guardado en modo demostración:** el nivel elegido se guarda en el navegador con una clave nueva en `lib/demo/claves.ts`, así "Borrar todo" del panel también lo borra.
- **"Mi recorrido" (`/panel`):** una tarjeta "Cuánto te querés quedar" con el nivel elegido o "Sin elegir" (nunca un valor inventado), y una regla nueva de próximo paso: si eligió "Solo invertir" y todavía no completó el perfil, el próximo paso es "Mirá cómo invertir" → `/sumarte#inversores`.

**Fuera de alcance:**
- Reordenar el menú, la portada u otras pantallas según el nivel (la US-05 lo sugiere; queda para cuando haya más pantallas que dependan del nivel).
- Mostrar el nivel en la Vista NetX o en el embudo: otro cambio.
- Usar el nivel para sugerir tribus: lo hace `tribus-sugeridas` solo con la entrevista; combinarlos queda para después.
- Términos ⚖ nuevos: el selector no tiene peso legal (no compromete nada). El recuadro de inversores enlaza a `/sumarte`, que ya tiene sus ⚖.
- Cuentas, servidor, HubSpot: sigue todo en el navegador.
- La anotación en la bitácora de exposición (C11) de este recuadro: queda para cuando `bitacora-exposicion` esté en `main`.

## Capabilities

### New Capabilities
- `perfil-permanencia`: el nivel de involucramiento que elige la persona, su guardado en modo demostración y cómo cambia el próximo paso y el atajo a inversores.

### Modified Capabilities

## Impact

`app/perfil/` (selector y recuadro), `lib/perfil/permanencia.ts` (niveles, lectura segura; puro y con tests), `lib/demo/claves.ts` (clave `permanencia`), `lib/demo/resumen.ts` y `app/panel/resumen.tsx` (tarjeta y regla del próximo paso), `e2e/perfil.spec.ts`, `e2e/panel.spec.ts`. Sin dependencias nuevas. Si `privacidad-consentimiento` ya está en `main`, el guardado pasa por su permiso como las demás pantallas.
