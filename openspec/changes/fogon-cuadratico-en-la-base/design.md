# Design

## Context

- `fogon-cuadratico` deja: el motor puro en `lib/cuadratico/`, los tipos y reglas en `lib/fogon/consultas/`, la interfaz `RepositorioConsultas` con su implementación del navegador y `fuente.ts`, y las pantallas que solo hablan con el repositorio.
- `base-neon` deja: Drizzle con migraciones en `drizzle/`, `db()` (Neon con `DATABASE_URL`; PGlite sin ella, fuera de producción), `personas` con `privy_id`, email y rol, el panel de roles y el patrón de triggers de solo agregar escritos a mano (`drizzle-kit generate --custom`).
- `consentimiento-en-la-base` deja: `exigirConsentimiento(sesion)` → `personaId` o 403.
- El cliente ya sabe mandar las cabeceras de sesión a `/api` (token de Privy o modo de prueba, `components/sesion/contexto.ts`).
- ADR-001: votos en columnas reales, libros de solo agregar, garantías en la base. ADR-005: nada con la identidad de la persona sin consentimiento vigente.

## Goals / Non-Goals

**Goals:** que el equipo vote de verdad con garantías en la base; que el servidor entregue votos ajenos solo según la regla de la consulta (abierto: con nombre y sin email; secreto: nunca); probar Neon y Privy reales de punta a punta.

**Non-Goals:** pantalla de administración (`fogon-consultas-panel`), consultas por tribu, Ronda 0, notificaciones.

## Decisions

### 1. Tablas (una migración nueva)

| Tabla | Columnas | Garantías |
|---|---|---|
| `consultas` | `id uuid`, `slug text unique` (para la URL), `titulo`, `descripcion` nula, `modo` enum (`prioridades`, `presupuesto`), `ambito` enum (`equipo`, `tribu`, `asamblea`), `estado` enum (`abierta`, `cerrada`) default `abierta`, `cierre_at timestamptz not null`, `cerrada_at` nula, `cerrada_por → personas` nula, `creditos int not null default 100`, `votos_en_contra bool not null default false`, `resultado_visible` enum (`al-votar`, `al-cierre`) default `al-cierre`, `voto` enum (`abierto`, `secreto`) `not null` default `abierto` (ADR-007; hoy solo hay consultas de Equipo, cuyo defecto es abierto), `monto_centavos bigint` nulo, `moneda` enum (`USD`, `ARS`) nula, `monto_nota text` nula (por ejemplo "Sugerencia del equipo: lo decide Franz"), `creada_por → personas not null`, `creada_at` | `check (creditos = 100)` (regla 6); `check ((estado = 'cerrada') = (cerrada_at is not null))`; `check ((modo = 'presupuesto') = (moneda is not null))`; `check (modo = 'presupuesto' or (monto_centavos is null and monto_nota is null))`; `check (monto_centavos is null or monto_centavos >= 0)` |
| `consulta_opciones` | `id uuid`, `consulta_id`, `orden int`, `etiqueta`, `tope_centavos` y `piso_centavos` nulos | `unique (consulta_id, orden)`; `unique (consulta_id, id)` (para la foránea compuesta); topes y pisos ≥ 0 y piso ≤ tope |
| `consulta_padron` | `consulta_id`, `persona_id → personas`, `agregado_at` | `primary key (consulta_id, persona_id)`; `on delete restrict` |
| `consulta_envios` (libro) | `id uuid`, `consulta_id`, `persona_id`, `registrado_at timestamptz default now()`, `orden bigint generated always as identity` | foránea `(consulta_id, persona_id) → consulta_padron` (**solo vota el padrón**); `unique (consulta_id, id)`; índice `(consulta_id, persona_id, registrado_at desc, orden desc)` |
| `consulta_envio_votos` (libro) | `envio_id`, `consulta_id`, `opcion_id`, `votos smallint` | `primary key (envio_id, opcion_id)`; foráneas `(consulta_id, envio_id) → consulta_envios (consulta_id, id)` y `(consulta_id, opcion_id) → consulta_opciones (consulta_id, id)` (**la opción es de la misma consulta**); `check (votos between -10 and 10 and votos <> 0)` (solo se guardan las opciones con votos; un envío sin filas = "todo en 0") |

- **Triggers (SQL propio en la misma migración, probado con PGlite):**
  - `consulta_envios` y `consulta_envio_votos`: solo agregar (`BEFORE UPDATE OR DELETE` por fila y `BEFORE TRUNCATE` por sentencia), igual que `consentimientos` en `base-neon`.
  - `consulta_envios` `BEFORE INSERT`: la consulta tiene que estar `abierta` y `now() < cierre_at`; si no, error `consulta-cerrada`.
  - `consulta_envio_votos` **constraint trigger `DEFERRABLE INITIALLY DEFERRED`** (se evalúa al confirmar la transacción, cuando ya están todas las filas del envío): `sum(votos²) <= creditos` y, si `votos_en_contra` es falso, ningún voto negativo.
  - `consultas` `BEFORE UPDATE`: no se puede volver de `cerrada` a `abierta`; si la consulta tiene envíos, no cambian `modo`, `creditos`, `votos_en_contra`, `monto_centavos`, `moneda`, `monto_nota`, `resultado_visible` ni `voto` (nadie vota creyendo que es secreto y se encuentra con que es abierto, ni al revés). `consulta_opciones` `BEFORE INSERT OR UPDATE OR DELETE`: rechaza si la consulta ya tiene envíos.
<!-- arquitecto: tres huecos de los triggers de arriba. (1) El "solo agregar" impide UPDATE/DELETE pero no impide AGREGAR filas de votos a un envío viejo, ni después del cierre: con eso se cambia un voto ya contado. (2) Mover `cierre_at` al futuro reabre una consulta que cerró por fecha, sin tocar `estado`. (3) Cambiar el título o las etiquetas después de votar cambia qué se votó. -->
  - **Los votos de un envío solo entran en la misma transacción que el envío.** El `BEFORE INSERT` de `consulta_envios` fuerza `new.registrado_at := now()` (la hora la pone la base, aunque el insert traiga otra) y `consulta_envio_votos` `BEFORE INSERT` rechaza con `envio-cerrado` si el `registrado_at` de su envío no es `now()` (en Postgres, `now()` es la hora de inicio de la transacción, igual en toda ella y en sus savepoints). Así nadie suma un voto a un envío viejo ni a uno de una consulta ya cerrada: corregir un reparto es siempre un envío nuevo.
  - `consultas` `BEFORE UPDATE`, además: si la consulta tiene envíos, tampoco cambian `titulo`, `descripcion`, `ambito` ni `cierre_at`; y si `now() >= old.cierre_at` (cerró por fecha), `cierre_at` no cambia nunca, ni con cero envíos (si no, moverla al futuro la reabre). El cierre a mano solo puede pasar `estado` a `cerrada` y llenar `cerrada_at` y `cerrada_por`.
  - `consulta_padron` `BEFORE INSERT OR DELETE`: rechaza si la consulta está efectivamente cerrada (el "votaron X de N" del acta no cambia después del cierre). Borrar del padrón a alguien con envíos ya lo impide la foránea.
  - **Todas las foráneas de estas tablas son `on delete restrict`** (ninguna `cascade`): una consulta con padrón o envíos no se puede borrar. `TRUNCATE ... CASCADE` desde `consultas` o `personas` lo frena el trigger por sentencia de los libros (como en `base-neon`).
- **Por qué dos tablas para los votos y no un `jsonb`:** ADR-001 pide votos en columnas reales; así la base garantiza que cada opción existe y es de la consulta, y el resultado se suma en SQL si hace falta.
- **Por qué el estado y la fecha:** el cierre por fecha no necesita ningún proceso (no hay cron): el estado efectivo es `cerrada` si `estado = 'cerrada'` **o** `now() >= cierre_at`, y el trigger de inserción mira las dos cosas. `estado`/`cerrada_at` solo registran el cierre a mano.
- **Alternativa descartada: un único "voto vigente" por persona con `unique (consulta, persona)` y `UPDATE`.** Es más simple de leer, pero rompe el libro (un cambio de voto borra el anterior) y ADR-001 lo pide de solo agregar.

### 2. Servidor (`lib/fogon/consultas/servidor.ts`)
- `ultimoRepartoPorPersona(consultaId)`: `select distinct on (persona_id) … order by persona_id, registrado_at desc, orden desc` con sus votos. **Nunca sale de este módulo con `persona_id` ni email**: se pasa a `agregar` del motor y, solo para voto abierto, a `bloquePadron` (abajo). Un test de fuente impide importar esta función desde `app/`.
- `vista(consulta, personaId, esSuperadmin)` → lo que espera `VistaConsulta` de `fogon-cuadratico`: consulta y opciones (con `voto` y `monto_nota`), `miReparto` (último envío propio), `participantes` (`{ repartieron, padron }`, contando solo envíos con algún voto), `estado` efectivo, `puedeCerrar` (super admin y abierta), `resultado` según `resultadoVisible` del módulo de reglas (el mismo que usa la pantalla) y `padron`.
- <!-- especificador: voto abierto, respuesta de Gus al PR #76 --> `bloquePadron(consulta, resultadoVisible)` arma `padron` de la vista con **una sola regla para todo el padrón** (el super admin, si no está en el padrón, ve lo mismo):
  - `voto = 'secreto'` → `null` (como en la primera versión: ningún reparto ajeno ni quién falta).
  - `voto = 'abierto'` → `{ faltan, repartos }`: `faltan` = personas del padrón sin envío con algún voto; `repartos` = `null` mientras el resultado no sea visible, y después el último reparto de cada persona con algún voto. Cada persona sale como `{ id, nombre }`: `id` es un identificador opaco **por consulta** (por ejemplo, el orden en el padrón), nunca `persona_id`; `nombre` es el nombre visible de la persona (`personas.nombre` si `base-neon` lo trae; si no, la parte del email antes de la "@"). **El email completo nunca sale.** La fila propia se marca con `esVos: true`.
  - Quien retiró su consentimiento con la consulta abierta (decisión de Gus): su último reparto sigue contando en el agregado y, en voto abierto, sigue en `repartos` con su nombre. No puede abrir la consulta (403) hasta volver a aceptar.
<!-- arquitecto: `base-neon` deja abierto "neon-http (o neon-serverless si hacen falta transacciones)". Este cambio es el primero que las necesita, y PGlite no lo detecta: con PGlite `db.transaction` funciona y con `neon-http` falla recién en el preview. -->
- **Transacciones en Neon:** `neon-http` no tiene transacciones interactivas (`db.transaction` falla). `db()` en Vercel usa `drizzle-orm/neon-serverless` (`Pool` por WebSocket) para todo lo que escribe en más de una tabla; si `base-neon` ya lo dejó así, no hay nada que hacer. Si se prefiere quedarse con `neon-http`, la alternativa es generar el `uuid` del envío en el servidor y mandar envío y votos en un `db.batch([...])` (que corre en una sola transacción); el constraint diferido de créditos funciona igual en los dos caminos. Elegir uno en la tarea 1.3 y anotarlo en el PR (los dos cumplen la regla "votos en la misma transacción que su envío"); la prueba del preview (§6) es la que lo confirma contra Neon.
- `guardarReparto`: valida con `validarReparto` del motor (422 con motivos); en una transacción inserta el envío y sus votos; traduce los errores de la base (`consulta-cerrada` → 409, foránea del padrón → 404, constraint de créditos → 422) por si alguien saltea la validación.
- `crearConsulta` (super admin): valida con una función pura (título, al menos 2 opciones, cierre futuro, montos, moneda y nota del monto solo en presupuesto, piso ≤ tope, `voto` abierto o secreto (si no viene, `abierto`), padrón de emails existentes en `personas` <!-- arquitecto -->con al menos una persona, `ambito` solo `equipo` (la base acepta los tres valores para el futuro, pero hoy nadie puede crear una de tribu o asamblea)); inserta consulta, opciones y padrón en una transacción; `slug` derivado del título con sufijo si se repite.
- `cerrarConsulta` (super admin): `update consultas set estado = 'cerrada', cerrada_at = now(), cerrada_por = …` si estaba abierta <!-- arquitecto -->**y** `now() < cierre_at`; si ya cerró por fecha responde 409 (si no, el acta mostraría una hora de cierre posterior a la real).
<!-- arquitecto: el panel (`fogon-consultas-panel`) necesita "votaron X de N" en la lista y no puede sumar rutas. -->
- `listar` devuelve en cada `ResumenConsulta` sus `participantes` (`{ repartieron, padron }`), el mismo dato que ya ve el padrón en la vista; así la lista del panel sale de `GET /api/fogon/consultas` sin otra ruta.

### 3. Rutas
| Ruta | Quién | Respuestas |
|---|---|---|
| `GET /api/fogon/consultas` | sesión + consentimiento | lista (`ResumenConsulta[]`): las del padrón; super admin, todas |
| `GET /api/fogon/consultas/[slug]` | sesión + consentimiento + padrón (o super admin) | `VistaConsulta`; 404 si no está en el padrón |
| `POST /api/fogon/consultas/[slug]/reparto` | sesión + consentimiento + padrón | 201 con la vista nueva; 404, 409, 422 |
| `POST /api/fogon/consultas` | super admin + consentimiento | 201 con el slug; 403, 422 |
| `POST /api/fogon/consultas/[slug]/cierre` | super admin + consentimiento | 200; 403, 409 si ya estaba cerrada |

- Orden de chequeos en todas: `sesionDelPedido` (401) → `exigirConsentimiento` (403 `{ consentimiento: false }`) → rol o padrón → validación → escritura. Cuerpos JSON con tipo de contenido y origen propio (molde de ADR-006).
- **El super admin no está en el padrón por ser super admin**: ve y cierra, pero vota solo si se incluye a sí mismo en el padrón.
- Sin caché: `dynamic = "force-dynamic"` y `Cache-Control: no-store` (son datos por persona).
<!-- arquitecto: cada guardado es una fila para siempre (libro); un doble clic o un script del padrón llenan la tabla sin límite. -->
- **Doble envío y límite:** el botón "Guardar mi reparto" queda deshabilitado mientras espera la respuesta. En el servidor, si la última fila de esa persona en esa consulta es de hace menos de 3 s y tiene los mismos votos, responde 201 con la vista sin escribir otra fila (idempotente); y más de 60 envíos por persona y consulta en una hora responde 429 "Esperá un momento antes de volver a guardar". Ninguno de los dos límites cambia qué voto vale.
- **Logs:** los errores de estas rutas se registran con el código y el `slug`, nunca con el cuerpo del pedido (los votos) ni el email.

### 4. Cliente
- `lib/fogon/consultas/api.ts`: `RepositorioApi` implementa la misma interfaz con `fetch` y las cabeceras de sesión. `fuente.ts` la devuelve siempre. La implementación del navegador y las personas de ejemplo se borran (`git rm`); los textos de U1–U4 quedan en `lib/fogon/consultas/plantillas.ts` para el panel.
- Sin sesión con consentimiento: la pantalla muestra "Las consultas del equipo se ven al entrar" y "Entrar" (que pasa por el paso de `consentimiento-alta`).
- Falla: el reparto queda en el estado del componente, "Sin guardar" y el error con `role="alert"`.

### 5. Voto abierto o secreto (ADR-007, reescrito con las respuestas de Gus al PR #76)
- **Decisión: la visibilidad es una regla de cada consulta**, `voto` = `abierto` (por defecto en Equipo) o `secreto`, fija desde el primer envío (trigger de §1). Con voto abierto todo el padrón ve quién falta y, cuando el resultado es visible, cómo repartió cada quien; con voto secreto, nadie ve repartos ajenos. En los dos casos el super admin ve lo mismo que el resto: no hay asimetría entre quien convoca y quien vota.
- **Riesgo aceptado por Gus (lo señaló el arquitecto):** con voto abierto se puede "votar para la foto": repartir pensando en quién mira y no en cuánto importa cada opción, que es lo que mide el voto cuadrático. Con "resultado al votar", además, quien vota tarde ve los repartos de los demás antes de votar. Mitigación: el aviso "Tu reparto lo va a ver todo el padrón" antes de votar, el resultado "al cierre" por defecto (la tabla con nombres no se ve hasta cerrar) y el voto secreto para lo delicado. "Faltan votar" sí se ve antes del cierre (es lo que pidió Gus); no dice cómo votó nadie.
- **Qué sale y qué no:** el nombre visible y los votos por opción, sí; el email, el `persona_id` y la hora de cada envío, nunca (la hora permitiría cruzar quién votó cuándo y no aporta).
- **Voto secreto, límites dichos en voz alta:** el secreto es **ante la aplicación**, no ante el dueño de la base (Gus, como responsable de los datos, puede leer `consulta_envios` con `persona_id`). En grupos chicos el agregado deja adivinar votos y, con "al votar", comparar el agregado antes y después de un envío deja deducir ese reparto. **Sin mínimo de personas para mostrar el resultado** (decisión de Gus).
- **Consentimiento retirado con la consulta abierta:** su último reparto **sigue contando** (decisión de Gus); el libro no se toca y, con voto abierto, su fila sigue en la tabla. La persona deja de poder abrir la consulta (403) hasta volver a aceptar.
- **Anonimizar** a una persona (ADR-001) no toca este libro: sus envíos quedan apuntando a la fila anonimizada, y en voto abierto la tabla muestra el nombre anonimizado.
- **Datos personales nuevos:** el reparto de cada persona (con su `persona_id` y la hora) es un dato personal nuevo: opinión de la persona, no sensible en el sentido de KYC, que en voto abierto **ve todo el padrón con su nombre**. El PR lo agrega como **pendiente** al inventario (`NS_platform/Documentation/backend/01 - Inventario de datos del POC.md`) diciendo quién lo ve. La descarga de los votos propios en "Mis datos" queda **pendiente** (decisión de Gus, no bloquea): hoy la persona ve su último reparto en cada consulta.

### 6. Pruebas
- **Vitest con PGlite** (base nueva por archivo): cada trigger y cada `check` (envío con la consulta cerrada por estado y por fecha, 102 créditos, voto en contra apagado, opción de otra consulta, persona fuera del padrón, `UPDATE`/`DELETE`/`TRUNCATE` de envíos, cambiar opciones con envíos, reabrir, créditos ≠ 100); con voto secreto `vista` no incluye datos ajenos (se serializa la respuesta y se busca el id, el email, el nombre y el reparto de la otra persona); con voto abierto trae `faltan` antes del cierre y `repartos` con nombres solo con el resultado visible, y en ningún caso el email ni el `persona_id` de nadie; `voto` no cambia con envíos; quien retiró el consentimiento sigue contando; último envío vale; envío vacío no cuenta como participación; las cinco rutas con sus códigos.
- **E2E local** (PGlite + `LH_AUTH_PRUEBA`): la fixtura crea por la API, como super admin de prueba, una consulta con voto secreto y otra con voto abierto, cada una con tres personas en el padrón; A y B reparten; en la secreta B no ve el reparto de A en la respuesta de red; en la abierta B ve a C en "Faltan votar" y, al cierre, la fila de A, sin el email de A; el resultado aparece según la regla; el super admin cierra y se ve el acta; una persona fuera del padrón ve "No encontramos esta consulta".
<!-- arquitecto: PGlite es Postgres real, pero en un solo proceso y con una sola conexión. -->
- **Lo que PGlite no prueba:** dos transacciones a la vez (dos guardados simultáneos, un guardado contra un cierre) y el driver de Neon. Los tests de PGlite prueban cada regla en secuencia; la concurrencia y el driver se prueban solo en el preview. Decirlo así en el PR, sin prometer más.
- **Preview con su rama de Neon** (`BASE_URL=<preview> pnpm test:e2e e2e/fogon-preview.spec.ts`): si el preview tiene `LH_AUTH_PRUEBA=1`, el mismo recorrido con modo de prueba pero contra Neon (prueba la migración, los triggers en Postgres real y el driver de Neon). Usa un slug con fecha y hora para no chocar; los envíos quedan en la rama del preview (no se pueden borrar; la rama se descarta con el preview).
<!-- arquitecto: ver ADR-008 (Propuesta). La integración de Neon con Vercel crea, por defecto, la rama de cada preview a partir de la rama principal: una copia de producción, con sus personas, emails y votos. Sumado al modo de prueba, cualquiera que abra el preview con la cabecera `x-lh-prueba: <email de una persona real>` sería esa persona y vería su reparto. -->
- **Condiciones para que esta prueba corra (ADR-008):**
  1. La rama de Neon del preview **no sale de producción**: sale de una rama madre sin datos reales (por ejemplo `previews`, con las migraciones y los datos de ejemplo de `scripts/`). Gus lo configura en la integración de Neon con Vercel (a verificar en su panel que se pueda elegir la rama madre; si no se puede, la integración no se usa para previews y esta prueba queda como guion manual).
  2. **El modo de prueba solo acepta emails de dominios `.test`** (reservado, nunca es de una persona real): `resolverSesion` responde 403 con la cabecera de prueba y un email que no termine en `.test`, también en local. Es una línea en `lib/sesion/` con su test; la fixtura de los e2e ya usa `@prueba.test` por defecto. Así, aunque una rama tuviera datos reales, el modo de prueba no puede hacerse pasar por nadie real.
  3. La prueba verifica antes de escribir que el super admin de prueba (`super@prueba.test`) existe en esa base; si no existe (rama sin datos de ejemplo), se salta y lo anota.
- **Privy real**, dos caminos:
  - **A · Cuenta de prueba de Privy por la pantalla** (recomendado): Privy permite habilitar en su panel una cuenta de prueba con un email y un código de un solo uso fijos (a verificar en el panel; no figura en el SDK). `e2e/fogon-privy.spec.ts`, que se salta si faltan `PRIVY_PRUEBA_EMAIL` y `PRIVY_PRUEBA_CODIGO` (solo en el `.env.local` de quien corre, nunca en el repo): pasa por el paso de consentimiento, completa el login de Privy con el código, abre la consulta de prueba y guarda un reparto.
  - **B · Token de prueba desde el servidor**: `@privy-io/server-auth` 1.32.5 trae `getTestAccessToken({ email })`, que da un token de la cuenta de prueba sin pasar por la pantalla. Su documentación dice que **falla si la app tiene orígenes permitidos o dominio base configurados**, que es lo normal en una app con previews; sirve solo con una app de Privy aparte para pruebas. Queda descartado salvo que Gus cree esa app.
  - **Siempre:** `docs/guiones/fogon-privy-real.md`, guion manual para Gus (entrar con su email en el preview, aceptar, votar, entrar con otra cuenta, comparar, cerrar).

## Risks / Trade-offs

- [La cuenta de prueba de Privy habilitada en la app de producción deja entrar a cualquiera que sepa el código, como esa cuenta] → la cuenta no tiene rol ni está en ningún padrón de producción; o mejor, habilitarla solo si previews y producción usan apps de Privy distintas. Decide Gus. <!-- arquitecto --> Recomendación (ADR-008): una app de Privy aparte para los previews (`NEXT_PUBLIC_PRIVY_APP_ID` y `PRIVY_APP_SECRET` con alcance "Preview" en Vercel). Con eso la cuenta de prueba nunca existe en producción y, si esa app no tiene orígenes permitidos, también sirve el camino B (`getTestAccessToken`).
- [Una persona retira su consentimiento con la consulta abierta] → sus envíos quedan en el libro (no se borran), su último reparto sigue contando (decisión de Gus) y la persona deja de poder abrir la consulta (403) hasta volver a aceptar.
- [Con voto abierto el equipo reparte "para la foto"] → riesgo aceptado por Gus (ADR-007); ver §5.
- [La migración del preview corre contra la base equivocada si `DATABASE_URL` de producción queda con alcance "Preview" por error] → al configurar, revisar en Vercel que `DATABASE_URL` de producción tenga solo alcance "Production"; es parte de los pasos para Gus del PR.
- [El trigger diferido de créditos falla recién al confirmar] → el servidor valida antes con el motor; el trigger es la red para quien escriba por fuera. El test lo cubre con `SET CONSTRAINTS ALL IMMEDIATE` y con una transacción completa.
- [El reloj del servidor y el de la base pueden diferir unos segundos en el cierre por fecha] → manda la base (`now()` en el trigger); la pantalla avisa "cierra hoy a las HH:MM" y no promete precisión de segundos.
- [Resultado calculado al vuelo: si cambia el motor, cambia un acta vieja] → el motor tiene tests de los escenarios; si en el futuro un acta necesita quedar congelada (decisiones con efecto), se agrega una tabla `actas` con el resultado al cierre.
- [En voto secreto, grupos chicos dejan adivinar votos] → aceptado, sin mínimo de personas (decisión de Gus); ver §5.
- [Plan gratis de Neon: 10 ramas] → los previews de este cambio usan la misma vigilancia que `base-neon`.

## Migration Plan

1. Migración nueva hacia adelante (no toca tablas de `base-neon`). Se aplica en el build del preview con su rama de Neon; en producción, al mergear.
2. Volver atrás: revertir el PR deja las tablas sin uso (no se borran: tienen votos). Si hiciera falta quitarlas, otra migración, con decisión de Gus.
3. Para el dogfooding: con `fogon-consultas-panel` Gus carga U1–U4 con el padrón del equipo (en U2, también Martín como invitado si ya tiene cuenta; U4 con USD 20.000 y la nota "Sugerencia del equipo: lo decide Franz"); sin el panel, se puede crear una consulta con la API desde el guion manual (pedido `POST` con el token de su sesión).

## Open Questions

- Si el preview tiene `LH_AUTH_PRUEBA=1` (para la prueba contra Neon con modo de prueba) y si previews y producción comparten la app de Privy (para la cuenta de prueba). No cambian el diseño: definen qué pruebas corren y cuáles quedan como guion.
- <!-- arquitecto --> De dónde sale la rama de Neon de cada preview (ADR-008): con una copia de producción, la prueba del preview no corre y el modo de prueba queda limitado a `.test`.
- Respondidas por Gus en el PR #76 (ya integradas): voto abierto por defecto en Equipo, sin mínimo de personas, el reparto de quien retira el consentimiento sigue contando, descarga de Mis datos pendiente.
