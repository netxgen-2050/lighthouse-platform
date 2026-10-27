# Proposal

## Why

El 27-oct-2026 Gus decidió que el Mercado de compromisos se va a llevar fuera de la plataforma. La página `/compromisos`, su formulario, su Mercado y sus textos quedan como están, pero la plataforma deja de ofrecerla: no aparece en la navegación principal, no manda avisos que lleven a ella, no pide preferencias sobre ella y la política de privacidad deja de nombrarla. Gus pidió además dejar una nota para poder volver atrás más adelante ("ajustá todo para quitar los compromisos, y dejá una nota por si hay que volver más adelante").

## What Changes

- **Navegación.** `lib/navegacion.ts` gana una marca para **ocultar un destino de la navegación** sin dejar de declararlo: el destino sigue en la lista única (`DESTINOS`), sigue con `existe: true` y el test que compara `existe` con las páginas de `app/` sigue pasando. **Compromisos** se marca como oculto: desaparece del grupo "Participar" del rail, en la computadora y en el celular. Participar queda con Pactos, Semillas, Fogón y Congreso. La barra superior y el menú del avatar tampoco lo muestran (hoy ya no lo muestran, y se deja escrito).
- **Avisos.** Los eventos de actividad que llevan a `/compromisos` (tipo `mercado`, "Publicaste en el mercado: …", y tipo `interes-oferta`, "Alguien se interesó en tu oferta") **dejan de listarse y de contarse** en la bandeja, la campanita y Mi recorrido. El código que los genera (`EVENTOS.publicasteEnMercado`, `EVENTOS.interesEnOferta`) no se borra: si alguien publica desde `/compromisos` por la URL, se siguen guardando, y los que ya estaban guardados en el navegador se filtran al listar.
- **Configuración.** La preferencia de aviso "Mercado" (y "Market" en inglés) deja de mostrarse en `/configuracion`. El tipo `mercado` sigue existiendo en el código y lo que la persona tenía guardado se conserva.
- **Política de privacidad.** El borrador deja de nombrar los compromisos: el resumen, la fila "Votos y Compromisos" (pasa a "Votos") y las finalidades. La versión (`VERSION_POLITICA`) **no se sube**: el cambio solo saca una categoría de datos, no agrega ni datos, ni finalidades, ni encargados (ver `design.md`, decisión 6).
- **`/compromisos` intacta.** Sigue respondiendo igual entrando por su URL, con el mismo permiso (pide ser Miembro, `lib/permisos/niveles.ts` no cambia) y la misma accesibilidad. En esa página ningún ítem del rail se marca como actual.
- **Nota para volver.** Se crea `docs/notas/compromisos-en-pausa.md`: por qué se sacó, qué quedó en el código y los pasos exactos para volver a activarlo.
- **Tests.** Se ajustan los que esperaban el enlace, la preferencia o los avisos: `lib/navegacion.test.ts`, `lib/actividad/actividad.test.ts`, `lib/configuracion/preferencias.test.ts`, `lib/privacidad/privacidad.test.ts` si hace falta, y los e2e `marco`, `descubrir-publico`, `sumarte-acceso`, `compromisos`, `idioma-fogon-mercado`, `bandeja` y el comentario de `fixtura.ts`.

**Fuera de alcance:**
- Borrar o cambiar `/compromisos`, su Mercado, sus textos (`lib/idioma/textos/compromisos.ts`), su clave de demo o su lógica (`lib/compromisos/`).
- Borrar el código que genera los eventos del Mercado (`lib/actividad/eventos.ts`), sus textos en el diccionario `bandeja` o el tipo de aviso `mercado` de `lib/configuracion/preferencias.ts`.
- Borrar del navegador los eventos o los compromisos ya guardados, y cambiar lo que exporta `/mis-datos` (sigue exportando todo lo que la persona tiene guardado).
- Subir la versión de la política de privacidad o pedir de nuevo el consentimiento.
- Los permisos de Participar que nombran `/compromisos` (`lib/permisos/niveles.ts`, `lib/idioma/textos/sumarte.ts`): solo se ven entrando por la URL y se dejan como están.
- Los "compromisos" de los manifiestos de tribu y de los pactos: son otro concepto y no se tocan.
- Actualizar el backlog (D6) en `NS_platform`: es documentación de producto, fuera de este repo.
- Retirar `/congreso` del rail (podría usar la misma marca, pero no está decidido).

## Capabilities

### New Capabilities
- `rail-destinos-ocultos`: un destino puede existir y seguir accesible por su URL sin aparecer en la navegación principal, y la plataforma deja de ofrecerlo desde avisos, configuración y política; Compromisos es el primero.

### Modified Capabilities

(ninguna: el rail, la bandeja, la configuración y la política no tienen todavía una spec archivada en `openspec/specs/` que cubra estos puntos.)

## Impact

- Código: `lib/navegacion.ts`, `lib/actividad/actividad.ts`, `lib/configuracion/preferencias.ts`, `lib/privacidad/politica.ts`.
- Tests: `lib/navegacion.test.ts`, `lib/actividad/actividad.test.ts`, `lib/configuracion/preferencias.test.ts`, `lib/privacidad/privacidad.test.ts` (si alguno nombra los textos), e2e `marco`, `descubrir-publico`, `sumarte-acceso`, `compromisos`, `idioma-fogon-mercado`, `bandeja` y el comentario de `fixtura.ts`.
- Documentación: `docs/notas/compromisos-en-pausa.md` (nuevo).
- `components/rail.tsx`, `components/campanita.tsx`, `app/bandeja/`, `app/panel/recorrido.tsx` y `app/configuracion/` no deberían necesitar cambios (toman todo de `lib/`).
- Sin tablas, sin migraciones, sin integraciones y sin cambios de permisos. **Toca datos personales** solo en el texto de la política (borrador) y en qué eventos guardados en el navegador se muestran; no cambia qué se guarda ni dónde.
