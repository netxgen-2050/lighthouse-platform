# Design

## Context

- `lib/privacidad/consentimiento.ts` guarda el registro en el navegador con la clave `u:<id>:lh-consentimiento`, armada con `clave()`, que depende de la persona activa (`establecerPersona`). `VERSION_POLITICA = "2026-10-14-borrador"`.
- `components/sesion/proveedor-sesion.tsx` llama `establecerPersona(idPersona)` apenas `/api/sesion` responde 200, **antes** de saber si hay consentimiento, y guarda `lh-ultima-persona` con el id.
- `components/sesion/puerta.tsx` muestra `PantallaConsentimiento` solo si `rutaPideConsentimiento(ruta)` (rutas no públicas y `/sumarte`). En las públicas, una persona con sesión y sin consentimiento ve la página y `anotarEnBitacora` (que solo mira `personaEnSesion()`) anota con su prefijo; `GuardarOrigen` también guarda con su prefijo.
- Sumarte sin sesión: elegir un plan guarda el pedido en `sessionStorage` (`guardarPendiente`, vigencia `VIGENCIA_PENDIENTE_MS` = 5 min) y llama `entrar()` (Privy o, sin Privy, el panel "Entrar como…").
- Privy 2.x acepta `config.legal.{termsAndConditionsUrl, privacyPolicyUrl}` (los muestra como enlaces en el pie de su ventana) y tiene un ajuste del panel, `require_users_accept_terms`, con su propia pantalla de aceptación (verificado en los tipos de `@privy-io/react-auth`, 14-oct-2026).
- `base-neon` (aprobado, sin implementar) crea la tabla `consentimientos` y deja la mudanza de datos para `datos-en-la-nube`. Por decisión de Gus (15-oct-2026), su primera migración ya la crea con la forma completa de §7.1.

## Goals / Non-Goals

**Goals:**
- La persona acepta **antes de cualquier login** (pedido de Gus, 15-oct-2026: "be sure PR71 will make consent a requirement to log in"): al crear la cuenta y también al entrar. El email no llega a Privy por el camino normal sin las casillas marcadas.
- Nada con su identidad antes de aceptar.
- Poder demostrar qué versión aceptó, cuándo y por qué camino.

**Non-Goals:**
- Textos legales definitivos, inglés, base de datos, mandar emails de verdad, otros opcionales además de las novedades.

## Buenas prácticas y fuentes

Fuentes citadas de memoria (esta corrida no tuvo acceso a internet): Gabriel las verifica con R14.

| Práctica | Cómo la aplica este cambio | Fuente |
|---|---|---|
| Consentimiento libre, específico, informado e inequívoco, con un acto afirmativo claro | Casillas que la persona marca; el botón no acepta solo | RGPD art. 4.11 y considerando 32; Ley 25.326 art. 5 (libre, expreso e informado) |
| Casillas premarcadas o el silencio no son consentimiento | Las dos casillas arrancan sin marcar, también en el re-consentimiento | RGPD considerando 32; TJUE *Planet49* (C-673/17, 1-oct-2019); EDPB Directrices 05/2020 sobre el consentimiento §3.4 |
| El pedido de consentimiento se distingue de otros asuntos y no se agrupa | Política y términos en casillas separadas; los opcionales, aparte y no obligatorios; el KYC sigue con su consentimiento propio | RGPD art. 7.2; EDPB 05/2020 §3.1.3 (granularidad) y §3.1.2 (no condicionar) |
| Informar al momento de recoger los datos, en lenguaje claro y en capas | Primera capa: resumen de 5 líneas en el paso del alta; segunda capa: `/privacidad` completa con índice | RGPD arts. 12 y 13; Grupo del Art. 29, Directrices de transparencia WP260 rev.01 (capas); Ley 25.326 art. 6 (información previa: finalidad, destinatarios, responsable, derechos) |
| Poder demostrar el consentimiento | Registro con versión, fecha y hora, qué y camino | RGPD art. 7.1; EDPB 05/2020 §5.1 |
| Retirarlo tan fácil como darlo | Se mantiene "Retirar mi consentimiento" en Mis datos; las novedades por email se dan o se retiran con un clic en Mis datos | RGPD art. 7.3; Ley 25.326 art. 5 (revocable) |
| Lo opcional no condiciona el servicio | Novedades por email: casilla aparte, sin marcar, no hace falta para crear la cuenta | RGPD art. 7.4; EDPB 05/2020 §3.1.2; Ley 25.326 art. 27 (publicidad: derecho a pedir la baja) |
| Volver a pedirlo si cambia lo que se informó | Re-consentimiento con "Qué cambió" | EDPB 05/2020 §5.2; WP260 (cambios a la información) |
| Transferencia a un país sin nivel adecuado | El resumen ya dice que los datos van a Estados Unidos; se acepta antes de tener cuenta | Ley 25.326 art. 12; Decreto 1558/2001 |
| Criterios de la autoridad argentina | Mismo enfoque de información previa y consentimiento expreso | AAIP, Resolución 4/2019 (criterios orientadores de la Ley 25.326) |

## Decisions

### 1. Todo login pasa antes por el paso con las casillas
- **Una sola puerta.** Hoy `entrar()` del contexto (`components/sesion/proveedor-sesion.tsx`) llama directo a `privy.login()` o, sin Privy, lleva a "Entrar como…" de Sumarte, y lo usan "Entrar" de la barra superior (`components/menu-persona.tsx`, dentro de `components/barra-superior.tsx`) y Sumarte (`app/sumarte/sumarte-cliente.tsx`). Con este cambio, **`entrar()` ya no abre el login: abre el paso**. El proveedor monta el paso (un solo `<dialog>` para toda la app) y guarda adentro una función privada `abrirLogin()` (lo que hoy hace `entrar()`), que **solo** llama el paso al aceptar. `privy.login` deja de estar en el valor del contexto. Así cualquier botón o enlace, presente o futuro, que llame `entrar()` pasa por las casillas sin que cada pantalla lo tenga que recordar.
- Firma: `entrar(opciones?: { modo?: "alta" | "entrar"; alAceptar?: () => void })`. Por defecto `modo: "entrar"`. `alAceptar` corre después de `guardarAceptacionPrevia` y antes de `abrirLogin()` (Sumarte lo usa para `guardarPendiente`). Al cancelar no corre nada y el foco vuelve al elemento que tenía el foco al abrir (el botón "Entrar", el plan, etc.).
- La decisión "¿se puede abrir el login?" es una función pura en `lib/privacidad/consentimiento.ts`, `puedeAbrirLogin(almacen, ahora)` = hay aceptación previa de la versión vigente y dentro del plazo (§2, sin consumirla). Es la única condición: el paso, al aceptar, guarda la aceptación y recién entonces `abrirLogin()` la comprueba y abre. Con test unitario (con un `login` falso: sin aceptación no se llama; con aceptación vigente se llama una vez; con aceptación vencida o de otra versión no se llama).
- `components/sesion/paso-alta.tsx` (cliente; el nombre se mantiene porque ya lo citan `idioma-legal` e `idioma-portada-sumarte`): `<dialog>` modal (mismo patrón que `components/kyc-dialogo.tsx`: `showModal`, Escape cierra, el foco vuelve). Dos modos, **mismo bloque y mismos textos de casillas**:
  - `alta` (Sumarte): título "Crear tu cuenta", botón "Aceptar y crear mi cuenta". Debajo: "¿Ya tenés cuenta? Usá "Entrar" arriba".
  - `entrar` (barra superior y cualquier otro `entrar()`): título "Entrar", botón "Aceptar y entrar", y una línea: "Antes de entrar, aceptá la política y los términos. Te lo pedimos cada vez que entrás porque, hasta que entres, no sabemos quién sos." Si la versión vigente no es la primera, muestra "Versión de la política: X" y su lista "Qué cambió" (§5) en un `<details>` abierto. Debajo: "¿Todavía no tenés cuenta? Elegí un plan en Sumarte" (enlace a `/sumarte`).
  - Los dos: aviso de prototipo, botón "Cancelar", error con `role="alert"` si falta una casilla (el foco va a la primera sin marcar).
- El bloque (resumen `RESUMEN` con sus ⚖, enlaces a `/privacidad` y `/privacidad#terminos` en otra pestaña, `fieldset` con las dos casillas, grupo opcional de novedades de §9) se extrae de `PantallaConsentimiento` a `components/sesion/bloque-consentimiento.tsx` y lo usan el paso y la pantalla. Los textos en español quedan iguales a los de hoy (los e2e de `privacidad.spec.ts` siguen valiendo).
- En `app/sumarte/sumarte-cliente.tsx`, todo lo que sin sesión hoy llama `entrar()` (planes, "Pedir invitación", "Pedir una charla") pasa a `entrar({ modo: "alta", alAceptar })`.
- **Modo de prueba (sin Privy):** `abrirLogin()` sigue llevando al panel "Entrar como…" de Sumarte (con `volver`). El panel también es un punto de login: `entrarComo(email)` primero mira `puedeAbrirLogin`; si no hay aceptación previa vigente (por ejemplo, alguien abrió `/sumarte#entrar-como` directo, o pasaron más de 5 minutos), abre el paso en modo `entrar` y, al aceptar, entra con el email elegido. Si la hay, entra directo (la persona ya marcó las casillas antes de llegar al panel).
- **Costo aceptado (consecuencia del pedido de Gus del 15-oct-2026):** quien ya tiene cuenta marca las dos casillas cada vez que entra, aunque su consentimiento esté vigente: antes del login no se sabe quién es, y mirar el navegador para "adivinarlo" (`lh-ultima-persona`) fallaría en una computadora compartida. Son dos clics por login; las sesiones de Privy duran, así que no pasa en cada visita. Para quien ya tenía consentimiento vigente, la aceptación del paso se consume y no se registra otra fila (§2); solo cuenta la casilla de novedades según §9.
- **Alternativa descartada: la pantalla de aceptación de Privy** (`require_users_accept_terms`). Es una sola casilla para todo, sin versión ni constancia propia, en inglés, y el registro queda en Privy. Se usa solo `legal` (enlaces informativos en su ventana).
- **Alternativa descartada: aceptar después del login, siempre** (lo de hoy, mejorado). No cumple el pedido de Gus ni "informar al momento de recoger": Privy ya recibió el email.
- **Alternativa descartada: paso solo en Sumarte y "Entrar" directo al login, con la pantalla después** (lo que decía la primera versión de este design). Gus pidió que el consentimiento sea requisito para entrar (15-oct-2026): con "Entrar" directo, Privy recibía el email antes de las casillas.

### 2. Aceptación previa
- `lib/privacidad/consentimiento.ts`: `CLAVE_ACEPTACION_PREVIA = "lh-consentimiento-previo"` en `sessionStorage` (por pestaña, sin prefijo: todavía no hay persona). Valor `{ version, aceptadoEn, modo: "alta" | "entrar", novedades: boolean }` (`modo`: desde qué paso aceptó; `novedades`: si marcó la casilla opcional, §9).
- `guardarAceptacionPrevia(almacen, ahora, { modo, novedades })`, `puedeAbrirLogin(almacen, ahora) → boolean` (mira sin borrar: versión vigente y dentro del plazo; §1) y `tomarAceptacionPrevia(almacen, ahora) → { aceptadoEn, modo, novedades } | null`: lee, **borra siempre** y devuelve solo si la versión es la vigente y no pasaron `VIGENCIA_PENDIENTE_MS` (5 min, el mismo plazo que el plan; importado de `lib/sesion/nivel.ts`). Si el login tarda más, aparece la pantalla (red de seguridad, §3) y se acepta ahí.
- El proveedor de sesión, cuando hay persona y el consentimiento está `pendiente`, llama una vez `tomarAceptacionPrevia` y, si hay, `registrarConsentimiento(..., { canal, aceptadoEn })` con `canal` = `alta` si `modo` es `alta`; si `modo` es `entrar`, `nueva-version` cuando había un registro de otra versión y `al-entrar` si no había ninguno. La fecha registrada es la del momento en que marcó las casillas.
<!-- arquitecto: que una aceptación previa no quede suelta en la pestaña para la persona siguiente. -->
- **La aceptación previa se consume en cualquier inicio de sesión**, no solo cuando el consentimiento está pendiente: apenas `/api/sesion` responde 200 y se conoce el consentimiento (`vigente` o `pendiente`), se llama `tomarAceptacionPrevia` (que la borra siempre) y el consentimiento general se registra solo si estaba `pendiente`; las novedades se tratan según §9 en los dos casos (con `vigente` también, porque ahora todo login pasa por el paso). Si no se consumiera, alguien con cuenta y consentimiento vigente que pasó por el paso dejaría la aceptación en la pestaña, y otra persona que entre en esa misma pestaña dentro de los 5 minutos quedaría registrada con canal `alta` sin haber visto las casillas. También se borra al **salir** (`salir()`).

### 3. Persona anónima hasta aceptar (red de seguridad)
- Con §1, el camino normal llega al login con la aceptación previa ya guardada y la persona pasa a activa en el mismo instante en que se registra. Lo de esta sección cubre los casos en que **hay sesión sin aceptación vigente registrada**: aceptación del paso vencida (más de 5 minutos hasta terminar el login), sesión de Privy que se restaura sola al abrir la página (sin pasar por el paso), login terminado en otra pestaña (la aceptación vive en `sessionStorage` de la pestaña donde se dio) y versión nueva de la política con la sesión abierta. En todos ellos, la pantalla de consentimiento aparece en cualquier página y la persona sigue anónima hasta aceptar.
- La clave del consentimiento se arma con el id explícito: `claveConsentimientoDe(id)` = `u:<id>:lh-consentimiento`. `leerConsentimiento`, `registrarConsentimiento`, `registrarConsentimientoSensible` y `retirarConsentimiento` reciben `idPersona`. `useConsentimiento(idPersona)` ya lo recibe.
- En `proveedor-sesion.tsx`: `establecerPersona(consentimiento === "vigente" ? idPersona : null)` y `lh-ultima-persona` se escribe solo con consentimiento vigente. Así, mientras está pendiente, `clave()` devuelve los nombres sin prefijo (como sin sesión), `anotarEnBitacora` no anota (ya mira `personaEnSesion()`) y `GuardarOrigen` guarda como visita anónima. No hace falta tocar cada pantalla.
- El nivel (lo elegido en Sumarte) se vuelve a leer cuando la persona pasa a activa: el efecto que hoy depende de `idPersona` pasa a depender de la persona activa.
- `SoloConSesion` alrededor de la campanita y de `AplicarPreferencias` pasa a pedir consentimiento vigente (`SoloConConsentimiento`). `MenuPersona` sin consentimiento muestra solo "Salir".
- `rutaPideConsentimiento(ruta)` pasa a ser `!esPrivacidad(ruta)`: todas menos `/privacidad`. La puerta, con sesión y consentimiento `cargando`, muestra "Cargando…" también en las públicas (un instante).

### 4. Camino del consentimiento
- `Consentimiento` suma `canal?: "alta" | "al-entrar" | "nueva-version"`. `registrarConsentimiento` recibe `{ canal, aceptadoEn? }`; la pantalla y la aceptación previa del paso "Entrar" calculan `nueva-version` si había un registro de otra versión y `al-entrar` si no había ninguno; el paso "Crear tu cuenta" registra `alta` (§2). No hace falta un camino nuevo: los cuatro valores de la tabla de §7.1 alcanzan.
- `leerConsentimiento` acepta registros sin `canal` (anteriores a este cambio) y descarta el registro si `canal` está presente y no es uno de los tres (se rechaza lo que sobra).
- Para guardar la versión anterior en el re-consentimiento, la pantalla lee el registro viejo **antes** de pisarlo (ya lo hace `useConsentimiento`).

### 5. Re-consentimiento con lo que cambió
- `lib/privacidad/politica.ts`: `VERSIONES_POLITICA: readonly { version: string; fecha: string; cambios: readonly string[] }[]` en orden. La primera (`2026-10-14-borrador`) sin cambios; un test exige que la última sea `VERSION_POLITICA` y que toda versión después de la primera tenga al menos un cambio.
- Este cambio **sube la versión** a `2026-10-15-borrador`, porque cambia lo informado. **Es la única subida para este cambio y para `idioma-legal`** (decisión de Gus, 15-oct-2026): la versión nueva ya incluye todo lo que `idioma-legal` iba a sumar en español, e `idioma-legal` solo la traduce. Cambios listados (tres):
  1. "Ahora aceptás la política y los términos antes de entrar o de crear tu cuenta, cada vez que entrás. Mientras no aceptes, no guardamos nada a tu nombre." (`BASE_LEGAL` pasa de "que das al entrar por primera vez" a "que das antes de entrar o de crear tu cuenta").
  2. "Si elegís un idioma, lo guardamos en tu navegador para mostrarte la plataforma en ese idioma." Fila nueva en `DATOS_POR_PANTALLA`: "Configuración y barra superior · El idioma que elegís, en una cookie del navegador (`lh-idioma`) y en tus preferencias. No lleva tu identidad. · Hoy, en tu navegador. Con la base, en Neon."
  3. "Podés pedir que te mandemos novedades por email. Es opcional y lo podés retirar cuando quieras desde Mis datos." Finalidad nueva en `FINALIDADES` (novedades por email, base: tu consentimiento opcional) y una línea en "Tus derechos" (dar de baja las novedades desde Mis datos).
- **Orden con `idioma-base`:** si este cambio llega a `main` antes, la política ya describe la cookie de idioma en condicional ("si elegís un idioma") aunque el selector todavía no exista: informa de más, no de menos, y evita una segunda subida. Si llega después, la cookie ya existe y la política se pone al día.
- Así el equipo ve el re-consentimiento funcionando una sola vez.
- La pantalla con registro previo muestra "Aceptaste la versión X el <fecha>." y "Qué cambió" (lista), con el enlace "Leer la política completa".
- El paso "Entrar" no sabe quién es la persona: muestra "Versión de la política: X" y la lista "Qué cambió" de la versión vigente (si no es la primera) a todos, con el mismo enlace (§1). Así quien vuelve después de un cambio de versión se entera de qué cambió antes de aceptar, aunque no pase por la pantalla.

### 6. Constancia en Mis datos
- Sección nueva "Tu consentimiento", antes de "Retirar mi consentimiento": "Aceptaste la versión X el 15 de octubre de 2026 a las 21:05, al crear tu cuenta". Caminos: `alta` → "al crear tu cuenta", `al-entrar` → "al entrar", `nueva-version` → "cuando cambió la política", ausente → "sin dato". Fecha con `Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" })` en la zona del navegador. Si dio el de datos sensibles, una línea más con su versión y fecha.
- Debajo, el bloque "Novedades por email" de §9.
- La descarga JSON de Mis datos ya incluye el registro; suma `canal` sin cambios y `exportar.ts` suma el registro de novedades.

### 7. Compatibilidad con `base-neon`
- La interfaz no cambia de lugar: las cuatro funciones del registro siguen siendo la única puerta. Con la base, `registrarConsentimiento` llama a una API (`POST /api/consentimientos`) que escribe **dos filas** en `consentimientos` (tipo `politica` y tipo `terminos`) con la misma versión y fecha.
- El `canal`, el `idioma` y el tipo `novedades` viven en la tabla de §7.1, que **crea la primera migración de `base-neon`** (decisión de Gus, 15-oct-2026; `openspec/changes/base-neon/` ya está actualizado). Este cambio no toca la base.
- Con la base, la fecha la pone el servidor; la del momento de las casillas viaja como dato informativo (`aceptado_en_cliente`). El historial de consentimientos debería ser de solo agregar (ADR-001): retirar suma una fila `retiro` en lugar de borrar.
<!-- arquitecto: esta línea contradecía §7.3; queda alineada con la recomendación de §7.3 y con ADR-005 (opción C). -->
- Con la base, `/api/sesion` **no** crea la fila de `personas` (ni de `cuentas`) de una persona nueva antes de su primer `acepta`: responde con lo que dice el proveedor de login (id externo y email) sin guardarlo, y la fila nace con el primer consentimiento (§7.3). Las personas ya cargadas por el equipo existen de antes. Qué hacer con el usuario de Privy de quien no acepta queda para R29.
<!-- ADR-009 (Aceptada): la identidad es `personas.id`; la persona en sesión se resuelve por `cuentas` (proveedor + id externo), con Privy o con Neon Auth (`base-neon`). Lo que cambia en el paso cuando el login pasa a Neon Auth está en `openspec/changes/login-neon-auth/design.md`. -->
- **La persona en sesión (por `cuentas`).** Todo lo de §7 vale igual con Privy y con Neon Auth: ninguna regla depende de un id de un proveedor en particular.

<!-- arquitecto: §7.1 a §7.5 responden la pregunta abierta sobre `base-neon`. No cambian nada de este cambio (que no toca la base): son el contrato para el cambio que mude el consentimiento. Ver ADR-005 (Propuesta). -->
#### 7.1 Forma de la tabla (recomendada)
**Decisión de Gus (15-oct-2026): la primera migración de `base-neon` crea la tabla con esta forma** (su proposal, spec, design y tasks ya lo dicen), así no hace falta una segunda migración para `canal`, `idioma` (`idioma-legal`) ni `novedades`:

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `uuid` | clave |
| `persona_id` | `uuid not null` → `personas.id` | |
| `tipo` | enum `politica` · `terminos` · `sensibles` · `novedades` | una fila por cosa aceptada (granularidad); `novedades` es el opcional de §9 |
| `evento` | enum `acepta` · `retira` | retirar suma una fila, no borra |
| `version` | `text not null` | `VERSION_POLITICA` |
| `canal` | enum `alta` · `al-entrar` · `nueva-version` · `mis-datos`, **nulo** | `mis-datos` = dado o retirado desde Mis datos; nulo = registro anterior a este cambio |
| `idioma` | enum `es` · `en`, **nulo** | lo suma `idioma-legal`; nulo = `es` |
| `registrado_at` | `timestamptz not null default now()` | **la fecha que vale**, la pone el servidor |
| `aceptado_en_cliente` | `timestamptz` nulo | la hora en que marcó las casillas, informativa (el reloj del navegador puede mentir) |

- **Libro de solo agregar** (ADR-001): nunca `update` ni `delete`; el estado vigente es la última fila por persona y tipo. Índice `(persona_id, tipo, registrado_at desc)`. La base lo garantiza con un trigger que rechaza `UPDATE` y `DELETE` sobre la tabla (detalle en `base-neon`).
- El estado de `novedades` es su última fila: `acepta` = quiere recibirlas; `retira` o sin filas = no.
- **Borrar la cuenta** = anonimizar `personas` (la fila de consentimientos queda, apuntando a una persona sin email): sigue siendo prueba de que hubo consentimiento.
- Mis datos exporta todas las filas de la persona (también los retiros).

#### 7.2 El servidor verifica el consentimiento
Con la base, la regla "persona anónima hasta aceptar" no puede depender solo del navegador: **toda ruta del servidor que escriba algo a nombre de la persona** (perfil, membresías, pactos, bitácora, origen, reportes con identidad) verifica en `consentimientos` que haya un `acepta` vigente de `politica` y `terminos` y, si no, responde 403 con `{ consentimiento: false }`. Va en una función única (`exigirConsentimiento(sesion)`) junto a `sesionDelPedido`. `/api/sesion` y `POST /api/consentimientos` son las únicas excepciones. Hoy ninguna ruta escribe datos personales (`/api/reportes` no manda la identidad al issue), así que este cambio no lo necesita.

#### 7.3 Identidad antes del consentimiento
- **Privy** crea su usuario (email) al terminar el login. Es el encargado del login (ya listado en la política). Con §1, **por el camino normal el email nunca llega a Privy antes de las casillas**: la plataforma no llama a `privy.login` sin una aceptación previa vigente, sea desde Sumarte, desde "Entrar" o desde cualquier otro `entrar()`. Lo que puede quedar en Privy sin una aceptación registrada son solo los casos de red de seguridad (§3): una sesión que Privy restaura sola, una aceptación que venció antes de terminar el login, o una persona que aceptó en el paso, entró y en la pantalla de una versión nueva aprieta "No acepto, salir". En esos casos el usuario queda en Privy: borrarlo pide la API de servidor de Privy con su secreto, que hoy no tenemos. **Fuera de alcance de este cambio (decisión de Gus, 15-oct-2026: queda pendiente).** Se anota para R29: ¿se borra ese usuario de Privy (y en qué plazo) o se acepta que quede? Lo responden Gus y Gabriel.
- Límite de lo que la plataforma controla: la ventana de Privy es de Privy. Si alguien abre el login de Privy por fuera de la plataforma (otra app con el mismo `appId`, el panel de Privy), este cambio no lo puede impedir; tampoco lo que Privy guarda por su cuenta al cargar su SDK (sin email). Lo que garantiza este cambio es que **la plataforma** no abre el login sin las casillas.
- **`personas`**: recomendación para el cambio que mude el consentimiento: con acceso abierto (`sumarte-acceso`), la fila de una persona **nueva** se crea en la **misma transacción** que su primer `acepta` (`POST /api/consentimientos`), no en `/api/sesion`. Mientras tanto `/api/sesion` responde con lo que dice el proveedor de login (id externo y email), sin guardarlo. La fila de `cuentas` de esa persona nace en la misma transacción. Las personas cargadas por `LH_PERSONAS` ya existen (las cargó el equipo) y solo se les vincula la cuenta en `cuentas` (ADR-009; `base-neon`). Así "nada con su identidad antes de aceptar" vale también en la base.

#### 7.4 Falla
Si `POST /api/consentimientos` falla o no responde: la pantalla muestra "No pudimos guardar tu aceptación. Probá de nuevo." con `role="alert"`, las casillas siguen marcadas y la persona sigue anónima (nunca se la da por aceptada sin confirmación del servidor). Si responde dos veces (doble clic, reintento): la ruta es idempotente por `(persona, tipo, version, evento)` dentro de los últimos segundos, o el cliente manda una `clave_idempotencia`; dos filas iguales no rompen el libro, pero se evitan.

#### 7.5 Aceptación previa con la base
La aceptación previa sigue en `sessionStorage` (todavía no hay persona); al entrar, el cliente la manda una sola vez a `POST /api/consentimientos` con `canal: "alta"` y `aceptado_en_cliente`. El servidor valida versión vigente y que `aceptado_en_cliente` no tenga más de 5 minutos ni esté en el futuro; si no, la descarta y la persona ve la pantalla. <!-- arquitecto --> La regla de novedades de §9 ("la casilla del paso no pisa una elección anterior") la aplica el servidor, que es el que ve la última fila de `novedades`.

### 8. Privy
- `privy-puente.tsx` suma `legal: { privacyPolicyUrl: <origen>/privacidad, termsAndConditionsUrl: <origen>/privacidad#terminos }` (con `window.location.origin`). Es información: la aceptación sigue siendo la de las casillas.

### 9. Novedades por email (opcional, decisión de Gus 15-oct-2026)
- **Dónde aparece:** en `bloque-consentimiento.tsx`, debajo de las dos casillas obligatorias, un `fieldset` aparte con leyenda "Opcional" y una casilla **sin marcar**: "Quiero recibir novedades por email". Ayuda debajo (asociada con `aria-describedby`): "Te escribimos al email de tu cuenta. Lo podés retirar cuando quieras desde Mis datos. Prototipo: todavía no mandamos emails." El error de "marcá las dos" nunca menciona esta casilla y el botón funciona con ella sin marcar.
- La casilla aparece **siempre** en los pasos "Crear tu cuenta" y "Entrar" (antes del login no se sabe si la persona ya decidió) y en la pantalla de consentimiento **solo si la persona todavía no tiene registro de novedades** (nunca decidió). En el re-consentimiento de quien ya decidió no aparece: su elección sigue igual y se cambia en Mis datos. Nunca se muestra marcada por una elección anterior.
- **Registro:** `lib/privacidad/novedades.ts`, clave `u:<id>:lh-novedades` (con id explícito, como §3). Valor: el último evento `{ evento: "acepta" | "retira", version, registradoEn, canal: "alta" | "al-entrar" | "nueva-version" | "mis-datos" }`. Funciones `leerNovedades(id)`, `darNovedades(id, { canal })`, `retirarNovedades(id, { canal })`. Solo se escribe con consentimiento general vigente (en el alta, justo después de registrar el general con la aceptación previa).
- **Sin marcar también es una decisión:** cada vez que la persona acepta el general con la casilla a la vista, se escribe un evento de novedades con el mismo canal: `acepta` si la marcó, `retira` si la dejó sin marcar. Así no se le vuelve a ofrecer en cada pantalla y queda constancia de lo que eligió. Sin registro = nunca vio la casilla = no recibe. (`retira` sin un `acepta` antes se lee "eligió no recibirlas"; no hace falta un tercer evento.)
<!-- arquitecto: el paso "Crear tu cuenta" no sabe quién es la persona, así que siempre muestra la casilla; sin esta regla, una persona con cuenta que ya había pedido novedades y vuelve a pasar por el paso (por ejemplo, con la versión nueva) quedaría dada de baja sin saberlo. -->
- **La casilla de los pasos "Crear tu cuenta" y "Entrar" no pisa una elección anterior.** El paso se muestra antes del login y no sabe si la persona ya decidió, así que siempre trae la casilla. Con el paso también en "Entrar", esta regla pasa a ser el caso común (toda persona con cuenta ve la casilla en cada login). Al tomar la aceptación previa (§2), con el consentimiento general `pendiente` o `vigente`: si la persona **no tiene** registro de novedades, se escribe `acepta` o `retira` según la casilla; si **ya tiene** registro, solo se escribe `acepta` cuando marcó la casilla y su último evento no era `acepta` (marcarla es un acto afirmativo); dejarla sin marcar **no** escribe nada y su elección anterior sigue igual. Lo mismo vale con la base (§7.5).
<!-- arquitecto: novedades es un consentimiento, no un dato de ejemplo. -->
- **`lh-novedades` sigue las reglas de `lh-consentimiento`:** no entra en `NOMBRES_BASE`, así que "Borrar todo" no lo borra e "Importar a mi cuenta" nunca lo copia desde la visita anónima (nunca hay registro de novedades sin persona). Sí entra en la descarga de Mis datos (`exportar.ts`).
- **Mis datos**, bloque "Novedades por email": estado en palabras ("Pediste recibir novedades por email el 15 de octubre de 2026 a las 21:05, al crear tu cuenta." o "No recibís novedades por email.") y un botón "Quiero recibir novedades" / "Dejar de recibir novedades" que registra el evento con canal `mis-datos` y anuncia el cambio con `role="status"`.
- **Retirar el consentimiento general** ("Retirar mi consentimiento") también registra `retira` de novedades (canal `mis-datos`) si estaba en `acepta`. <!-- arquitecto: orden, porque novedades solo se escribe con el general vigente. --> Primero el retiro de novedades y después el del general (con la base, los dos en la misma transacción de `POST /api/consentimientos`): si el segundo falla, la persona queda sin novedades y con el general vigente, nunca al revés.
- **Constancia** con versión de la política vigente, fecha y hora y camino; en la base es el tipo `novedades` de §7.1 (con `idioma`, que suma `idioma-legal`).
- **Nada se manda:** el prototipo no tiene lista de correo ni proveedor de envío; no se comparte el dato con nadie. Mis datos y la descarga JSON muestran la elección.

## Risks / Trade-offs

- [Quien ya tiene cuenta marca las casillas en cada login, aunque su consentimiento esté vigente] → costo aceptado (§1): antes del login no se sabe quién es. No se registra otra fila del general; la línea del paso explica por qué se pide.
- [Un componente nuevo llama a Privy directo y se saltea el paso] → `privy.login` no está en el contexto; solo lo tiene `abrirLogin()` dentro del proveedor. Un test de fuente (como `lib/sin-colores-sueltos.test.ts`) falla si `login` de `usePrivy`/`useLogin` aparece fuera de `components/sesion/privy-puente.tsx` y `proveedor-sesion.tsx`.
- [5 minutos puede ser poco si el código del email tarda] → aparece la pantalla (red de seguridad) y acepta ahí; no se pierde nada salvo un paso más.
- [Sesión de Privy restaurada sin aceptación registrada (por ejemplo, alguien que entró antes de este cambio)] → la pantalla aparece en cualquier página y la persona sigue anónima hasta aceptar (§3).
- [Subir la versión obliga a todo el equipo a volver a aceptar] → es justamente la prueba del re-consentimiento, y es una sola vez para este cambio e `idioma-legal` (§5).
- [Guardar "quiere novedades" sin mandar nada puede crear la expectativa de recibirlas] → la ayuda de la casilla y Mis datos lo dicen como prototipo; el envío real es otro cambio.
- [Con la persona inactiva hasta aceptar, lo que haga en ese rato en páginas públicas queda como anónimo en el navegador] → es lo esperado; "Importar a mi cuenta" sigue ofreciéndose después.

## Migration Plan

- Rama `agente/consentimiento-alta` desde `main`. No depende de los cambios del Congreso ni del bilingüe.
- Registros guardados sin `canal` siguen valiendo; al subir la versión, todos vuelven a aceptar una vez.
- Volver atrás: revertir el PR; los registros con `canal` se siguen leyendo con el código viejo (ignora el campo) pero son de la versión nueva, así que el código viejo volvería a pedir el consentimiento una vez.

## Open Questions

- ~~Revisión del agente arquitecto pendiente~~ <!-- arquitecto: revisado el 14-oct-2026; ajustes en §2 y §7.1 a §7.5; ADR-005 (Propuesta). -->
- ~~Revisión del arquitecto pendiente solo para lo sumado el 15-oct-2026~~ <!-- arquitecto: revisado el 15-oct-2026; ajustes en §7 (fila de `personas`), §7.5 y §9 (la casilla del paso no pisa una elección anterior, `lh-novedades` fuera de `NOMBRES_BASE`, orden del retiro). -->
- Envío real de novedades (fuera de alcance): ¿el `acepta` dado en el prototipo vale para mandar emails de verdad, o se vuelve a pedir con doble opt-in cuando exista el envío? Pregunta para Gus y Gabriel (R14).
- ~~Forma de §7.1 en la primera migración de `base-neon`~~ Gus: sí (15-oct-2026).
- ~~Consentimiento opcional de novedades~~ Gus: sí, §9.
- ~~Una o dos subidas de versión con `idioma-legal`~~ Gus: una sola, §5.
- Usuario de Privy de quien no acepta (§7.3): pendiente, fuera de alcance; pregunta para Gus y Gabriel en R29. Con el paso también en "Entrar", solo aplica a los casos de red de seguridad.
- ~~¿"Entrar" también pasa por las casillas?~~ Gus (15-oct-2026): el consentimiento es requisito para entrar; §1.
- Revisión del arquitecto pendiente para lo cambiado el 15-oct-2026 por el pedido de Gus (§1 "una sola puerta", §2 `modo` y `puedeAbrirLogin`, §3 como red de seguridad, §9 con el general `vigente`).
