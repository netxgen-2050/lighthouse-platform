# Proposal

## Why

El 27-oct-2026 Gus decidió que el Mercado de compromisos se va a llevar fuera de la plataforma. No se borra nada (la página `/compromisos`, su formulario, su Mercado y sus textos quedan como están), pero deja de ofrecerse desde la navegación principal: quien no conoce la URL no tiene que encontrarla en el rail.

## What Changes

- `lib/navegacion.ts` gana una marca para **ocultar un destino de la navegación** sin dejar de declararlo: el destino sigue en la lista única (`DESTINOS`), sigue con `existe: true` y el test que compara `existe` con las páginas de `app/` sigue pasando.
- **Compromisos** se marca como oculto: desaparece del grupo "Participar" del rail, en la computadora y en el celular (el rail es el mismo en los dos tamaños). Participar queda con Pactos, Semillas, Fogón y Congreso. Ningún otro menú de navegación principal (barra superior, menú del avatar) lo muestra; hoy ya no lo muestran, y se deja escrito.
- `/compromisos` sigue respondiendo igual entrando por su URL, con el mismo permiso (pide ser Miembro, `lib/permisos/niveles.ts` no cambia) y la misma accesibilidad. En esa página ningún ítem del rail se marca como actual.
- Se ajustan los tests que esperaban el enlace: `lib/navegacion.test.ts` y los e2e `marco`, `descubrir-publico`, `sumarte-acceso`, `compromisos`, `idioma-fogon-mercado` y el comentario de `fixtura.ts`. Las pruebas de la página entran por la URL.

**Fuera de alcance:**
- Borrar o cambiar `/compromisos`, su Mercado, sus textos (`lib/idioma/textos/compromisos.ts`), su clave de demo o su lógica (`lib/compromisos/`).
- Los enlaces y menciones a Compromisos o al Mercado **desde el contenido** (avisos de la bandeja, preferencia "Mercado" en Configuración, política de privacidad, permisos de Participar). Se listan en `design.md` y quedan como pregunta abierta para Gus; no se tocan.
- Los "compromisos" de los manifiestos de tribu y de los pactos: son otro concepto y no se tocan.
- Actualizar el backlog (D6) en `NS_platform`: es documentación de producto, fuera de este repo.
- Retirar `/congreso` del rail (también podría usar la misma marca, pero no está decidido).

## Capabilities

### New Capabilities
- `rail-destinos-ocultos`: un destino puede existir y seguir accesible por su URL sin aparecer en la navegación principal; Compromisos es el primero.

### Modified Capabilities

(ninguna: el rail no tiene todavía una spec archivada en `openspec/specs/`.)

## Impact

`lib/navegacion.ts`, `lib/navegacion.test.ts`, e2e `marco.spec.ts`, `descubrir-publico.spec.ts`, `sumarte-acceso.spec.ts`, `compromisos.spec.ts`, `idioma-fogon-mercado.spec.ts` y el comentario de `fixtura.ts`. `components/rail.tsx` no debería necesitar cambios (toma los destinos de `destinosDeGrupo`). Sin tablas, sin migraciones, sin integraciones, sin cambios de permisos ni de datos personales.
