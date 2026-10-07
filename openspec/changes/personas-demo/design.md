# Design

## Context

El layout (`app/layout.tsx`) es: rail a la izquierda y una columna con `<main id="contenido">` y el pie. Los componentes cliente del modo demostración leen `localStorage` después de hidratar (`useEffect` en Sumarte, `useSyncExternalStore` en el pie). El selector tiene que verse en todas las páginas, hidratar sin errores y avisar a cualquier componente que dependa de la persona.

## Decisiones

1. **Datos en `lib/personas/datos.ts`**, tipados (`PersonaId = "lucia" | "lucas"`, `PersonaDemo`), copiados de `PEOPLE` del mock-up v6. Los nombres de campo van en español (`nombre`, `nacionalidad`, `residenciaFiscal`, `residenciaAR`, `nacionalidadAR`, `modalidad: "remoto" | "obra"`, `horas`, `presencia`, `origenFondos`, `calificado`, `residente`, …). `elegibleFideicomiso` vive al lado, pura y con test.
2. **Almacén con `useSyncExternalStore`** (`lib/personas/almacen.ts`): `leerPersona()` valida el valor guardado (cualquier cosa distinta de `"lucas"` es `"lucia"`), `elegirPersona(id)` guarda y emite un evento propio de `window` (`"lh-persona"`), `notificarPersona()` solo emite el evento. `usePersona()` se suscribe a ese evento y a `storage` (otras pestañas). La instantánea del servidor es `"lucia"`, así el HTML estático coincide con el default y no hay error de hidratación.
3. **Borrar sin recargar:** `localStorage.removeItem` no emite `storage` en la misma pestaña, así que `app/panel/resumen.tsx` llama a `notificarPersona()` después de `borrarDemo`. Es el único cambio en una pantalla existente.
4. **Ubicación:** `components/selector-persona.tsx` (cliente) dentro de un `<section aria-label="Persona de ejemplo">` en la columna, **antes** de `<main>`, con fondo `bg-surface-2` y borde inferior de tokens. Así no se duplica `<main>`, axe no marca contenido fuera de landmarks y el enlace "Saltar al contenido" sigue saltando la franja.
5. **Estado visible sin color:** el botón elegido lleva `aria-pressed="true"`, borde más grueso y un "✓" visible antes del nombre. La bandera va como texto ("NO", "AR"), igual que el mock-up.
6. **Anuncio:** un `<p aria-live="polite">` dentro de la franja, vacío al cargar; se llena solo cuando la persona cambia por una acción del usuario (no al hidratar).

## Riesgos

- El Fogón (en integración) tiene su propio selector y su copia de las personas: van a convivir dos selectores hasta que se decida unificarlos (pregunta abierta). Este cambio no toca `lib/fogon/`.
- La franja suma altura en pantallas chicas: en móvil, texto y botones en una sola línea con `text-sm`; verificar a 375 px.
