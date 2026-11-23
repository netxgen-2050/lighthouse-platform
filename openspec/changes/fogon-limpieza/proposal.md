# Proposal

## Why

En la consultoría del 23-oct-2026 (con Bertrand, desarrollador web3), Gus recorrió el Fogón y marcó dos cosas que hoy confunden: la **Asamblea de residentes** todavía no existe (no hay residentes ni barrio habitado en esta etapa) y lo que sea **evento** (encuentros, jornadas) no es una decisión y no tiene que vivir en el Fogón. El Fogón tiene que quedar como el lugar de las decisiones y las consultas, listo para recibir la gobernanza por círculos, tribus y el común (`fogon-gobernanza-fractal`).

Gus también aclaró que el **reporte de bugs se queda**, y en toda la experiencia, no solo en el Fogón. Hoy ya es así: el botón circular del bicho (`components/boton-reportar.tsx`, montado en `app/layout.tsx`, specs `reportes` y `reportar-circulo`) aparece en **todas** las páginas. Este cambio no lo toca y agrega una prueba para que no se pierda.

## What Changes

- **Sale el ámbito "Asamblea de residentes" del Fogón:**
  - el filtro "Asamblea de residentes" desaparece (quedan "Todas", "Tribu" y "Fideicomiso");
  - las dos decisiones de ejemplo de la asamblea ("Usar el fondo común para la bomba solar" y "Permitir animales de granja en las chacras") salen de la lista de `/fogon`; se guardan como ejemplos para el ámbito "Lighthouse (el común)" de `fogon-gobernanza-fractal`, que las vuelve a mostrar con su ámbito nuevo;
  - el párrafo de residencia fiscal ("Con tu residencia fiscal en Argentina (simulado) votás en la Asamblea de residentes…") sale de `/fogon`. La residencia fiscal sigue en el Pasaporte, donde se carga;
  - el motivo "Solo residentes" deja de mostrarse en el Fogón (ninguna decisión visible lo usa).
- **Eventos fuera del Fogón:** el Fogón no muestra eventos (encuentros, jornadas, convocatorias con fecha). Hoy el código de `/fogon` no tiene eventos propios; la regla queda escrita para que las próximas pantallas no los pongan ahí. Los eventos viven en `/congreso` (el evento de febrero 2027) y, cuando haya más de uno, en una página de eventos propia (otro cambio, ver Open Questions en design).
- **Reporte de bugs en toda la UX (sin cambios de comportamiento):** una prueba e2e recorre las páginas principales del rail (incluido `/fogon` y `/fogon/consultas`) y confirma que el botón "Reportar un problema o una idea" está en cada una.
- Los textos que cambian pasan por los diccionarios de idioma (ADR-004) en español e inglés.

**Fuera de alcance:**
- La gobernanza por círculos, tribus, el común y el consejo: `fogon-gobernanza-fractal`.
- Borrar del código de permisos el requisito `residente` (`lib/permisos/`): queda para cuando la asamblea exista o se descarte del todo; acá solo deja de mostrarse en el Fogón.
- Una página `/eventos` nueva.
- Cambios al botón de reportes o a su destino (GitHub Issues).

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon`: sin el ámbito Asamblea de residentes ni sus decisiones de ejemplo, sin eventos, y con el reporte de bugs garantizado en sus páginas.

## Impact

`lib/fogon/datos.ts` (ámbitos y decisiones; las dos de la asamblea pasan a un bloque de ejemplos para el común), `lib/fogon/estado.ts` y `lib/fogon/fogon.test.ts`, `app/fogon/fogon-cliente.tsx`, diccionarios de idioma del Fogón, `e2e/fogon.spec.ts`, un e2e nuevo `e2e/reportar-en-todas.spec.ts`. Sin base de datos, sin dependencias nuevas. Depende de `fogon-decisiones` (implementado en `dev`); para archivar este cambio, antes hay que archivar `fogon-decisiones` (este delta modifica su spec).
