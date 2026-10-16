# Proposal

## Why

Gus quiere que el **equipo real** priorice con voto cuadrático en el Fogón y que eso sea, a la vez, la **primera prueba de punta a punta con Neon (base real) y el login real** (Privy hoy; Neon Auth cuando `login-neon-auth` esté mergeado, ADR-009). `fogon-cuadratico` deja el motor y las pantallas con los datos en el navegador detrás de un repositorio; este cambio cambia esa fuente por la base, para que cada persona vote una sola vez con su identidad verificada, vea su propio voto, el resultado del grupo y, en las consultas con voto abierto, cómo repartió cada quien y quién falta, y el resultado no se pueda alterar.

## What Changes

- **Tablas nuevas** (Drizzle, una migración hacia adelante, con SQL propio para los triggers):
  - `consultas` (modo, ámbito, estado, cierre, créditos fijos en 100, votos en contra, cuándo se ve el resultado, **voto abierto o secreto**, monto en centavos, moneda y nota del monto en presupuesto), `consulta_opciones` (con tope y piso en centavos) y `consulta_padron` (quién vota en cada consulta).
  - **Los votos como libro de solo agregar**: `consulta_envios` (cada vez que alguien guarda su reparto, una fila) y `consulta_envio_votos` (los votos de ese envío por opción). Vale el último envío por persona y consulta hasta el cierre; el resultado se calcula, no se guarda.
  - **Garantías en la base**: claves foráneas (una opción solo puede ser de su consulta, solo vota quien está en el padrón), enums de modo, ámbito, estado, regla de resultado y moneda, `check` de créditos = 100 y de votos entre −10 y 10, y triggers que rechazan modificar o borrar envíos, votar con la consulta cerrada, pasarse de los créditos, votar en contra cuando no se permite y cambiar las reglas u opciones de una consulta que ya tiene votos.
- **Rutas de API** (`/api/fogon/consultas…`) con **la persona en sesión (por `cuentas`)** verificada en el servidor, sea cual sea el proveedor de login, y **consentimiento vigente** (`exigirConsentimiento`, ADR-005): listar las consultas de la persona, abrir una (consulta, mi reparto, participación y, si corresponde, el resultado agregado), guardar mi reparto (validado con el mismo motor en el servidor), y, **solo super admin**, crear una consulta con su padrón y cerrarla a mano.
- **Voto abierto o secreto, según la consulta** (ADR-007, decisión de Gus en el PR #76): con **voto abierto** (por defecto en Equipo) la API le da a cada persona del padrón la lista de quién falta votar y, cuando el resultado es visible, el último reparto de cada persona con su nombre (nunca su email); con **voto secreto** ninguna respuesta trae el reparto de otra persona ni quién falta. La regla es la misma para todo el padrón: el super admin no ve más que el resto. Sin mínimo de personas para mostrar el resultado.
- **Consentimiento retirado**: si una persona retira su consentimiento con la consulta abierta, su último reparto sigue contando (decisión de Gus) y, con voto abierto, sigue en la tabla de esa consulta.
- **Cierre** por fecha (automático) o a mano por el super admin. El resultado se ve según la regla de cada consulta (al votar o al cierre).
- **Las pantallas de `fogon-cuadratico` cambian solo la fuente**: el repositorio pasa a hablar con la API; sin sesión con consentimiento, `/fogon/consultas` invita a entrar. Desaparecen las personas de ejemplo y "Simular el cierre".
- **Pruebas**: unitarias con PGlite, e2e local con PGlite y el modo de prueba, y una prueba contra el preview con su rama de Neon. Para el login real: con Privy, una prueba con la **cuenta de prueba de Privy** (si Gus la habilita); con Neon Auth, la persona de prueba de la rama `previews` (`login-neon-auth`); y, siempre, un guion manual para Gus.

**Fuera de alcance:**
- Pantalla para crear consultas, cargar U1–U4 con el padrón del equipo y cerrar a mano (`fogon-consultas-panel`); acá solo la API.
- Que un líder cree consultas para su tribu: las membresías todavía no están en la base (`datos-en-la-nube`). Las consultas de este cambio son de ámbito **Equipo** con padrón explícito.
- Que el super admin vea más que el resto del padrón (en voto secreto tampoco ve quién votó qué ni quién falta).
- Descargar los votos propios desde "Mis datos": queda **pendiente** (decisión de Gus, no bloquea este cambio); la persona ve su último reparto en cada consulta.
- Recordatorios a quien falta votar.
- Financiamiento cuadrático (Ronda 0) y el *gate* del Consejo de Regeneración.
- Editar o borrar una consulta; reabrirla después de cerrada.
- Notificaciones ("se abrió una consulta", "cierra mañana").
- Cobros o fondos reales: los montos son de referencia y el resultado es **consultivo**.

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: las consultas pasan a vivir en la base, con padrón, voto abierto o secreto según la consulta, libro de solo agregar, permisos de super admin y cierre real (sin personas de ejemplo ni cierre simulado).

## Impact

Orden: `base-neon` → `consentimiento-en-la-base` → **`fogon-cuadratico-en-la-base`** → `fogon-consultas-panel`; no depende de `login-neon-auth`. Depende de `fogon-cuadratico` (pantallas, motor, repositorio), `base-neon` (Drizzle, PGlite, `personas`, `cuentas`, `db()`, regla `.test` del modo de prueba) y `consentimiento-en-la-base` (`exigirConsentimiento`). Archivos: `lib/db/schema.ts` y una migración nueva en `drizzle/` (más SQL propio de triggers), `lib/fogon/consultas/servidor.ts` (lecturas y escrituras), `lib/fogon/consultas/api.ts` (repositorio que llama a la API) y `fuente.ts`, `app/api/fogon/consultas/**`, `e2e/fogon-consultas.spec.ts`, `e2e/fogon-preview.spec.ts`, `docs/decisiones/ADR-007-voto-abierto-o-secreto-y-padron.md` y su índice, `docs/guiones/fogon-login-real.md`. Tablas con votos, permisos y datos personales: revisión de arquitectura.
