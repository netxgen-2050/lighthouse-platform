# Proposal

## Why

Gus quiere que el **equipo real** priorice con voto cuadrático en el Fogón y que eso sea, a la vez, la **primera prueba de punta a punta con Neon (base real) y Privy (login real)**. `fogon-cuadratico` deja el motor y las pantallas con los datos en el navegador detrás de un repositorio; este cambio cambia esa fuente por la base, para que cada persona vote una sola vez con su identidad verificada, vea solo su propio voto y el resultado del grupo, y el resultado no se pueda alterar.

## What Changes

- **Tablas nuevas** (Drizzle, una migración hacia adelante, con SQL propio para los triggers):
  - `consultas` (modo, ámbito, estado, cierre, créditos fijos en 100, votos en contra, cuándo se ve el resultado, monto en centavos y moneda en presupuesto), `consulta_opciones` (con tope y piso en centavos) y `consulta_padron` (quién vota en cada consulta).
  - **Los votos como libro de solo agregar**: `consulta_envios` (cada vez que alguien guarda su reparto, una fila) y `consulta_envio_votos` (los votos de ese envío por opción). Vale el último envío por persona y consulta hasta el cierre; el resultado se calcula, no se guarda.
  - **Garantías en la base**: claves foráneas (una opción solo puede ser de su consulta, solo vota quien está en el padrón), enums de modo, ámbito, estado, regla de resultado y moneda, `check` de créditos = 100 y de votos entre −10 y 10, y triggers que rechazan modificar o borrar envíos, votar con la consulta cerrada, pasarse de los créditos, votar en contra cuando no se permite y cambiar las reglas u opciones de una consulta que ya tiene votos.
- **Rutas de API** (`/api/fogon/consultas…`) con la sesión de Privy verificada en el servidor y **consentimiento vigente** (`exigirConsentimiento`, ADR-005): listar las consultas de la persona, abrir una (consulta, mi reparto, participación y, si corresponde, el resultado agregado), guardar mi reparto (validado con el mismo motor en el servidor), y, **solo super admin**, crear una consulta con su padrón y cerrarla a mano.
- **Voto secreto ante la plataforma**: ninguna respuesta de la API trae el reparto de otra persona; cada quien ve el suyo y el agregado. **Tampoco el super admin** ve votos individuales (ver design y ADR-007).
- **Cierre** por fecha (automático) o a mano por el super admin. El resultado se ve según la regla de cada consulta (al votar o al cierre).
- **Las pantallas de `fogon-cuadratico` cambian solo la fuente**: el repositorio pasa a hablar con la API; sin sesión con consentimiento, `/fogon/consultas` invita a entrar. Desaparecen las personas de ejemplo y "Simular el cierre".
- **Pruebas**: unitarias con PGlite, e2e local con PGlite y el modo de prueba, y una prueba contra el preview con su rama de Neon. Para Privy real: una prueba con la **cuenta de prueba de Privy** (si Gus la habilita) y, siempre, un guion manual para Gus.

**Fuera de alcance:**
- Pantalla para crear consultas, cargar U1–U4 con el padrón del equipo y cerrar a mano (`fogon-consultas-panel`); acá solo la API.
- Que un líder cree consultas para su tribu: las membresías todavía no están en la base (`datos-en-la-nube`). Las consultas de este cambio son de ámbito **Equipo** con padrón explícito.
- Que el super admin vea quién votó qué o quién falta votar.
- Financiamiento cuadrático (Ronda 0) y el *gate* del Consejo de Regeneración.
- Editar o borrar una consulta; reabrirla después de cerrada.
- Notificaciones ("se abrió una consulta", "cierra mañana").
- Cobros o fondos reales: los montos son de referencia y el resultado es **consultivo**.

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: las consultas pasan a vivir en la base, con padrón, voto secreto, libro de solo agregar, permisos de super admin y cierre real (sin personas de ejemplo ni cierre simulado).

## Impact

Depende de `fogon-cuadratico` (pantallas, motor, repositorio), `base-neon` (Drizzle, PGlite, `personas`, `db()`) y `consentimiento-en-la-base` (`exigirConsentimiento`). Archivos: `lib/db/schema.ts` y una migración nueva en `drizzle/` (más SQL propio de triggers), `lib/fogon/consultas/servidor.ts` (lecturas y escrituras), `lib/fogon/consultas/api.ts` (repositorio que llama a la API) y `fuente.ts`, `app/api/fogon/consultas/**`, `e2e/fogon-consultas.spec.ts`, `e2e/fogon-preview.spec.ts`, `docs/decisiones/ADR-007-voto-secreto-y-padron.md` y su índice, `docs/guiones/fogon-privy-real.md`. Tablas con votos, permisos y datos personales: revisión de arquitectura.
