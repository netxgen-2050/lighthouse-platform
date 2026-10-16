# Proposal

## Why

El plan de dogfooding dice que funcionó si **"el resultado se cierra con acta y se usa en una decisión"** (`NS_platform/Documentation/Desarrollo/2026-10-15 - Estrategia - dogfooding del Fogón.md`). Hoy el acta de una consulta se calcula cada vez que alguien la abre. El propio diseño de `fogon-cuadratico-en-la-base` anota el riesgo: **si cambia el motor, cambia un acta vieja**, y propone sumar una tabla `actas` cuando un acta tenga que quedar fija. Si el equipo va a usar U1–U4 para decidir, el acta tiene que quedar registrada tal como estaba al cierre, poder copiarse para llevarla a una minuta o a la documentación, y encontrarse desde el Fogón.

## What Changes

- **Acta registrada al cierre**: una tabla nueva `consulta_actas`, de solo agregar, con una fila por consulta cerrada: fecha de cierre, quién la cerró o "por fecha", participantes ("repartieron X de N"), la regla, el resultado ordenado (votos, %, personas que apoyaron y, en presupuesto, monto y fondos sin asignar) y la versión del motor. Se escribe en la misma transacción que el cierre a mano. Cuando la consulta cierra por fecha, se escribe la primera vez que alguien la lee después del cierre. La base impide modificarla o borrarla.
- **La pantalla muestra el acta registrada**, no la recalcula: el título pasa de "Acta, ejemplo" a "Acta", con "Registrada el <fecha y hora>". Si una consulta cerrada todavía no tiene acta (por ejemplo, si falló la escritura), la pantalla dice "El acta todavía no está registrada" y muestra el resultado calculado, marcado como tal.
- **"Copiar el acta"**: copia el acta como texto simple (título, fecha, regla, participantes, resultado ordenado y la frase de que es consultiva) y avisa "Acta copiada". Si el navegador no deja copiar, muestra el texto seleccionable. El acta copiada lleva **solo el agregado**, sin nombres, también en voto abierto.
- **Actas en el Fogón**: `/fogon` suma la sección "Actas de consultas", con las consultas cerradas del padrón de la persona (o todas, para el super admin), su fecha de cierre y un enlace a cada una.
- La versión del navegador de `fogon-cuadratico` sigue calculando el acta (no hay base). La sección "Actas de consultas" usa el mismo repositorio.

**Decisiones por defecto** (Gus las puede cambiar): el acta copiada no lleva nombres aunque el voto sea abierto; el texto copiado es texto simple y no un PDF; se guarda la versión del motor para poder explicar diferencias en el futuro.

**Fuera de alcance:**
- PDF, firma, sello de tiempo externo o publicación on-chain del acta.
- Que el acta tenga efectos: sigue siendo **consultiva** y no reemplaza decisiones que el contrato o el estatuto reservan a otro órgano.
- Editar, anular o reabrir un acta o una consulta.
- Pasar las actas de las decisiones viejas de `/fogon` (`fogon-decisiones`) a la base.
- Exportar los repartos individuales (en voto abierto se siguen viendo solo dentro de la plataforma) y descargar los votos propios desde "Mis datos" (pendiente, decisión de Gus).
- Avisar que salió un acta (ver `fogon-consultas-pendientes` y `avisos-en-la-base`).

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: el acta de una consulta cerrada queda registrada en la base al cierre, se puede copiar y se lista en el Fogón.

## Impact

Depende de `fogon-cuadratico` y de `fogon-cuadratico-en-la-base` (tablas `consultas` y libro de votos, `cerrarConsulta`, `vista`, `listar`). Archivos: `lib/db/schema.ts` y una migración nueva en `drizzle/` (con SQL propio para los triggers), `lib/fogon/consultas/servidor.ts` (escritura del acta al cerrar y al leer una cerrada por fecha), `lib/fogon/consultas/acta.ts` (armado del acta y del texto copiable, puro), los tipos `VistaConsulta` y `ResumenConsulta`, `app/fogon/` (sección de actas y botón copiar), `e2e/fogon-actas.spec.ts` y `e2e/accesibilidad.spec.ts`. Sin rutas ni dependencias nuevas. **Toca tablas y migraciones: necesita la revisión del arquitecto antes de aprobarse.**
