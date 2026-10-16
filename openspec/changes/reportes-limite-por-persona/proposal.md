# Proposal

## Why

Viene del ítem **L9 del backlog** ("Límite de reportes por persona": con el acceso abierto, cualquiera que se registre puede crear issues; agregar un límite por persona y por hora, "con la base de datos (Neon)"). Hoy `POST /api/reportes` limita solo los reportes **sin cuenta** (por IP, en memoria, `reportes-sin-cuenta`); con una sesión válida **no hay ningún límite**, y como el acceso es abierto (`sumarte-acceso`) una cuenta nueva puede llenar el repositorio de issues con el token de NetX. Con `base-neon` en camino ya hay dónde contar envíos por persona de forma que no se pierda al reiniciarse la función.

## What Changes

- **Límite con cuenta: 10 reportes válidos por persona por hora** (ventana móvil; el número es de ejemplo, ver preguntas). Pasado el límite, 429 con `Retry-After`, sin llamar a GitHub, y el diálogo muestra el mismo mensaje que hoy sin cuenta.
- **Dónde se cuenta:**
  - Persona que está en `personas` con consentimiento vigente en la base → tabla nueva `reportes_envios` (persona y hora, nada más). Sobrevive a reinicios y vale para todas las instancias.
  - Sesión válida pero sin fila en `personas` o sin consentimiento vigente (ADR-005: nada se guarda con su identidad) → límite en memoria con la misma cifra, con clave = hash con sal de la cuenta de login, igual que el límite por IP.
- **Lo que no llegó a GitHub no consume cupo** (se borra la fila), como ya pasa sin cuenta.
- **Minimización:** la tabla no guarda el texto, el tipo ni el número del issue; al registrar un envío se borran los de esa persona con más de 24 horas. No es un libro: es un contador.
- Los reportes sin cuenta siguen exactamente igual (por IP, en memoria).

**Fuera de alcance:**
- Mover a la base el límite sin cuenta (implicaría guardar algo derivado de la IP).
- Excepciones por rol (el super admin también tiene límite), límites configurables desde `/netx`, límite por día.
- "Mis reportes" o ver los issues propios; guardar el número del issue.
- Moderar o borrar issues en GitHub.

## Capabilities

### New Capabilities

### Modified Capabilities
- `reportes`: los reportes con sesión pasan a tener un límite por persona y por hora.

## Impact

Depende de `base-neon` (Drizzle, `personas`, `db()` con transacciones) y de `consentimiento-en-la-base` (lectura del consentimiento vigente). Archivos: `lib/db/schema.ts` y una migración nueva en `drizzle/` (`reportes_envios`), `lib/reportes/limite.ts` (límite en memoria por cuenta) y un módulo nuevo `lib/reportes/limite-persona.ts` (contador en la base), `app/api/reportes/route.ts`, el diálogo de reportes (mensaje 429 también con cuenta), `e2e/reportes.spec.ts`. Toca una tabla con migración y un dato personal nuevo (cuándo reportó cada persona): revisión de arquitectura antes de aprobar.
