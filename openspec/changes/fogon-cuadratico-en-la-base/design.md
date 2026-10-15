# Design

## Context

- `fogon-cuadratico` deja: el motor puro en `lib/cuadratico/`, los tipos y reglas en `lib/fogon/consultas/`, la interfaz `RepositorioConsultas` con su implementación del navegador y `fuente.ts`, y las pantallas que solo hablan con el repositorio.
- `base-neon` deja: Drizzle con migraciones en `drizzle/`, `db()` (Neon con `DATABASE_URL`; PGlite sin ella, fuera de producción), `personas` con `privy_id`, email y rol, el panel de roles y el patrón de triggers de solo agregar escritos a mano (`drizzle-kit generate --custom`).
- `consentimiento-en-la-base` deja: `exigirConsentimiento(sesion)` → `personaId` o 403.
- El cliente ya sabe mandar las cabeceras de sesión a `/api` (token de Privy o modo de prueba, `components/sesion/contexto.ts`).
- ADR-001: votos en columnas reales, libros de solo agregar, garantías en la base. ADR-005: nada con la identidad de la persona sin consentimiento vigente.

## Goals / Non-Goals

**Goals:** que el equipo vote de verdad con garantías en la base; que el servidor nunca entregue votos ajenos; probar Neon y Privy reales de punta a punta.

**Non-Goals:** pantalla de administración (`fogon-consultas-panel`), consultas por tribu, Ronda 0, notificaciones.

## Decisions

### 1. Tablas (una migración nueva)

| Tabla | Columnas | Garantías |
|---|---|---|
| `consultas` | `id uuid`, `slug text unique` (para la URL), `titulo`, `descripcion` nula, `modo` enum (`prioridades`, `presupuesto`), `ambito` enum (`equipo`, `tribu`, `asamblea`), `estado` enum (`abierta`, `cerrada`) default `abierta`, `cierre_at timestamptz not null`, `cerrada_at` nula, `cerrada_por → personas` nula, `creditos int not null default 100`, `votos_en_contra bool not null default false`, `resultado_visible` enum (`al-votar`, `al-cierre`) default `al-cierre`, `monto_centavos bigint` nulo, `moneda` enum (`USD`, `ARS`) nula, `creada_por → personas not null`, `creada_at` | `check (creditos = 100)` (regla 6); `check ((estado = 'cerrada') = (cerrada_at is not null))`; `check ((modo = 'presupuesto') = (moneda is not null))`; `check (modo = 'presupuesto' or monto_centavos is null)`; `check (monto_centavos is null or monto_centavos >= 0)` |
| `consulta_opciones` | `id uuid`, `consulta_id`, `orden int`, `etiqueta`, `tope_centavos` y `piso_centavos` nulos | `unique (consulta_id, orden)`; `unique (consulta_id, id)` (para la foránea compuesta); topes y pisos ≥ 0 y piso ≤ tope |
| `consulta_padron` | `consulta_id`, `persona_id → personas`, `agregado_at` | `primary key (consulta_id, persona_id)`; `on delete restrict` |
| `consulta_envios` (libro) | `id uuid`, `consulta_id`, `persona_id`, `registrado_at timestamptz default now()`, `orden bigint generated always as identity` | foránea `(consulta_id, persona_id) → consulta_padron` (**solo vota el padrón**); `unique (consulta_id, id)`; índice `(consulta_id, persona_id, registrado_at desc, orden desc)` |
| `consulta_envio_votos` (libro) | `envio_id`, `consulta_id`, `opcion_id`, `votos smallint` | `primary key (envio_id, opcion_id)`; foráneas `(consulta_id, envio_id) → consulta_envios (consulta_id, id)` y `(consulta_id, opcion_id) → consulta_opciones (consulta_id, id)` (**la opción es de la misma consulta**); `check (votos between -10 and 10 and votos <> 0)` (solo se guardan las opciones con votos; un envío sin filas = "todo en 0") |

- **Triggers (SQL propio en la misma migración, probado con PGlite):**
  - `consulta_envios` y `consulta_envio_votos`: solo agregar (`BEFORE UPDATE OR DELETE` por fila y `BEFORE TRUNCATE` por sentencia), igual que `consentimientos` en `base-neon`.
  - `consulta_envios` `BEFORE INSERT`: la consulta tiene que estar `abierta` y `now() < cierre_at`; si no, error `consulta-cerrada`.
  - `consulta_envio_votos` **constraint trigger `DEFERRABLE INITIALLY DEFERRED`** (se evalúa al confirmar la transacción, cuando ya están todas las filas del envío): `sum(votos²) <= creditos` y, si `votos_en_contra` es falso, ningún voto negativo.
  - `consultas` `BEFORE UPDATE`: no se puede volver de `cerrada` a `abierta`; si la consulta tiene envíos, no cambian `modo`, `creditos`, `votos_en_contra`, `monto_centavos`, `moneda` ni `resultado_visible`. `consulta_opciones` `BEFORE INSERT OR UPDATE OR DELETE`: rechaza si la consulta ya tiene envíos.
- **Por qué dos tablas para los votos y no un `jsonb`:** ADR-001 pide votos en columnas reales; así la base garantiza que cada opción existe y es de la consulta, y el resultado se suma en SQL si hace falta.
- **Por qué el estado y la fecha:** el cierre por fecha no necesita ningún proceso (no hay cron): el estado efectivo es `cerrada` si `estado = 'cerrada'` **o** `now() >= cierre_at`, y el trigger de inserción mira las dos cosas. `estado`/`cerrada_at` solo registran el cierre a mano.
- **Alternativa descartada: un único "voto vigente" por persona con `unique (consulta, persona)` y `UPDATE`.** Es más simple de leer, pero rompe el libro (un cambio de voto borra el anterior) y ADR-001 lo pide de solo agregar.

### 2. Servidor (`lib/fogon/consultas/servidor.ts`)
- `ultimoRepartoPorPersona(consultaId)`: `select distinct on (persona_id) … order by persona_id, registrado_at desc, orden desc` con sus votos. **Nunca sale de este módulo con `persona_id`**: se convierte a una lista anónima de repartos y se pasa a `agregar` del motor. Un test de fuente impide importar esta función desde `app/`.
- `vista(consulta, personaId, esSuperadmin)` → lo que espera `VistaConsulta` de `fogon-cuadratico`: consulta y opciones, `miReparto` (último envío propio), `participantes` (`{ repartieron, padron }`, contando solo envíos con algún voto), `estado` efectivo, `puedeCerrar` (super admin y abierta), y `resultado` según `resultadoVisible` del módulo de reglas (el mismo que usa la pantalla).
- `guardarReparto`: valida con `validarReparto` del motor (422 con motivos); en una transacción inserta el envío y sus votos; traduce los errores de la base (`consulta-cerrada` → 409, foránea del padrón → 404, constraint de créditos → 422) por si alguien saltea la validación.
- `crearConsulta` (super admin): valida con una función pura (título, al menos 2 opciones, cierre futuro, montos y moneda solo en presupuesto, piso ≤ tope, padrón de emails existentes en `personas`); inserta consulta, opciones y padrón en una transacción; `slug` derivado del título con sufijo si se repite.
- `cerrarConsulta` (super admin): `update consultas set estado = 'cerrada', cerrada_at = now(), cerrada_por = …` si estaba abierta.

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

### 4. Cliente
- `lib/fogon/consultas/api.ts`: `RepositorioApi` implementa la misma interfaz con `fetch` y las cabeceras de sesión. `fuente.ts` la devuelve siempre. La implementación del navegador y las personas de ejemplo se borran (`git rm`); los textos de U1–U4 quedan en `lib/fogon/consultas/plantillas.ts` para el panel.
- Sin sesión con consentimiento: la pantalla muestra "Las consultas del equipo se ven al entrar" y "Entrar" (que pasa por el paso de `consentimiento-alta`).
- Falla: el reparto queda en el estado del componente, "Sin guardar" y el error con `role="alert"`.

### 5. Voto secreto y super admin (ADR-007)
- **Decisión: el super admin no ve votos individuales en la plataforma.** En el voto cuadrático la información valiosa es la intensidad honesta; si quien convoca (hoy, Gus, que además vota) puede ver cómo repartió cada quien, el equipo reparte "para la foto". El resultado no necesita auditoría por persona: el agregado se recalcula del libro, que nadie puede editar.
- **Límite, dicho en voz alta:** el secreto es **ante la aplicación**, no ante el dueño de la base. Quien tiene acceso a Neon (Gus, como responsable de los datos) puede leer `consulta_envios` con `persona_id`. Separar la identidad del voto (por ejemplo, un registro "ya votó" y votos sin persona) impediría "vale el último" y "tu voto"; queda para cuando haya votos con efecto real.
- **Grupos chicos:** con muy pocas personas, el agregado y "personas que la apoyaron" pueden dejar adivinar votos (si votaron 2, cada una deduce el reparto de la otra). Se acepta para el equipo y queda como pregunta (umbral mínimo).
- **Anonimizar** a una persona (ADR-001) no toca este libro: sus envíos quedan apuntando a la fila anonimizada.

### 6. Pruebas
- **Vitest con PGlite** (base nueva por archivo): cada trigger y cada `check` (envío con la consulta cerrada por estado y por fecha, 102 créditos, voto en contra apagado, opción de otra consulta, persona fuera del padrón, `UPDATE`/`DELETE`/`TRUNCATE` de envíos, cambiar opciones con envíos, reabrir, créditos ≠ 100); `vista` no incluye datos ajenos (se serializa la respuesta y se busca el id y el email de la otra persona); último envío vale; envío vacío no cuenta como participación; las cinco rutas con sus códigos.
- **E2E local** (PGlite + `LH_AUTH_PRUEBA`): la fixtura crea por la API, como super admin de prueba, una consulta con dos personas en el padrón; A y B reparten; B no ve el reparto de A en la respuesta de red; el resultado aparece según la regla; el super admin cierra y se ve el acta; una persona fuera del padrón ve "No encontramos esta consulta".
- **Preview con su rama de Neon** (`BASE_URL=<preview> pnpm test:e2e e2e/fogon-preview.spec.ts`): si el preview tiene `LH_AUTH_PRUEBA=1`, el mismo recorrido con modo de prueba pero contra Neon (prueba la migración, los triggers en Postgres real y el driver de Neon). Usa un slug con fecha y hora para no chocar; los envíos quedan en la rama del preview (no se pueden borrar; la rama se descarta con el preview).
- **Privy real**, dos caminos:
  - **A · Cuenta de prueba de Privy por la pantalla** (recomendado): Privy permite habilitar en su panel una cuenta de prueba con un email y un código de un solo uso fijos (a verificar en el panel; no figura en el SDK). `e2e/fogon-privy.spec.ts`, que se salta si faltan `PRIVY_PRUEBA_EMAIL` y `PRIVY_PRUEBA_CODIGO` (solo en el `.env.local` de quien corre, nunca en el repo): pasa por el paso de consentimiento, completa el login de Privy con el código, abre la consulta de prueba y guarda un reparto.
  - **B · Token de prueba desde el servidor**: `@privy-io/server-auth` 1.32.5 trae `getTestAccessToken({ email })`, que da un token de la cuenta de prueba sin pasar por la pantalla. Su documentación dice que **falla si la app tiene orígenes permitidos o dominio base configurados**, que es lo normal en una app con previews; sirve solo con una app de Privy aparte para pruebas. Queda descartado salvo que Gus cree esa app.
  - **Siempre:** `docs/guiones/fogon-privy-real.md`, guion manual para Gus (entrar con su email en el preview, aceptar, votar, entrar con otra cuenta, comparar, cerrar).

## Risks / Trade-offs

- [La cuenta de prueba de Privy habilitada en la app de producción deja entrar a cualquiera que sepa el código, como esa cuenta] → la cuenta no tiene rol ni está en ningún padrón de producción; o mejor, habilitarla solo si previews y producción usan apps de Privy distintas. Decide Gus.
- [El trigger diferido de créditos falla recién al confirmar] → el servidor valida antes con el motor; el trigger es la red para quien escriba por fuera. El test lo cubre con `SET CONSTRAINTS ALL IMMEDIATE` y con una transacción completa.
- [El reloj del servidor y el de la base pueden diferir unos segundos en el cierre por fecha] → manda la base (`now()` en el trigger); la pantalla avisa "cierra hoy a las HH:MM" y no promete precisión de segundos.
- [Resultado calculado al vuelo: si cambia el motor, cambia un acta vieja] → el motor tiene tests de los escenarios; si en el futuro un acta necesita quedar congelada (decisiones con efecto), se agrega una tabla `actas` con el resultado al cierre.
- [Grupos chicos dejan adivinar votos] → ver §5; pregunta para Gus.
- [Plan gratis de Neon: 10 ramas] → los previews de este cambio usan la misma vigilancia que `base-neon`.

## Migration Plan

1. Migración nueva hacia adelante (no toca tablas de `base-neon`). Se aplica en el build del preview con su rama de Neon; en producción, al mergear.
2. Volver atrás: revertir el PR deja las tablas sin uso (no se borran: tienen votos). Si hiciera falta quitarlas, otra migración, con decisión de Gus.
3. Para el dogfooding: con `fogon-consultas-panel` Gus carga U1–U4 con el padrón del equipo; sin el panel, se puede crear una consulta con la API desde el guion manual (pedido `POST` con el token de su sesión).

## Open Questions

- Si el preview tiene `LH_AUTH_PRUEBA=1` (para la prueba contra Neon con modo de prueba) y si previews y producción comparten la app de Privy (para la cuenta de prueba). No cambian el diseño: definen qué pruebas corren y cuáles quedan como guion.
