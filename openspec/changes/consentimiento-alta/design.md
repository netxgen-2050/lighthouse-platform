# Design

## Context

- `lib/privacidad/consentimiento.ts` guarda el registro en el navegador con la clave `u:<id>:lh-consentimiento`, armada con `clave()`, que depende de la persona activa (`establecerPersona`). `VERSION_POLITICA = "2026-10-14-borrador"`.
- `components/sesion/proveedor-sesion.tsx` llama `establecerPersona(idPersona)` apenas `/api/sesion` responde 200, **antes** de saber si hay consentimiento, y guarda `lh-ultima-persona` con el id.
- `components/sesion/puerta.tsx` muestra `PantallaConsentimiento` solo si `rutaPideConsentimiento(ruta)` (rutas no públicas y `/sumarte`). En las públicas, una persona con sesión y sin consentimiento ve la página y `anotarEnBitacora` (que solo mira `personaEnSesion()`) anota con su prefijo; `GuardarOrigen` también guarda con su prefijo.
- Sumarte sin sesión: elegir un plan guarda el pedido en `sessionStorage` (`guardarPendiente`, vigencia `VIGENCIA_PENDIENTE_MS` = 5 min) y llama `entrar()` (Privy o, sin Privy, el panel "Entrar como…").
- Privy 2.x acepta `config.legal.{termsAndConditionsUrl, privacyPolicyUrl}` (los muestra como enlaces en el pie de su ventana) y tiene un ajuste del panel, `require_users_accept_terms`, con su propia pantalla de aceptación (verificado en los tipos de `@privy-io/react-auth`, 14-oct-2026).
- `base-neon` (aprobado, sin implementar) crea la tabla `consentimientos` (persona, tipo, versión, fecha) y deja la mudanza de datos para `datos-en-la-nube`.

## Goals / Non-Goals

**Goals:**
- La persona acepta antes (o en el mismo paso) de crear la cuenta, sin pasos repetidos.
- Nada con su identidad antes de aceptar.
- Poder demostrar qué versión aceptó, cuándo y por qué camino.

**Non-Goals:**
- Textos legales definitivos, inglés, consentimientos opcionales nuevos, base de datos.

## Buenas prácticas y fuentes

Fuentes citadas de memoria (esta corrida no tuvo acceso a internet): Gabriel las verifica con R14.

| Práctica | Cómo la aplica este cambio | Fuente |
|---|---|---|
| Consentimiento libre, específico, informado e inequívoco, con un acto afirmativo claro | Casillas que la persona marca; el botón no acepta solo | RGPD art. 4.11 y considerando 32; Ley 25.326 art. 5 (libre, expreso e informado) |
| Casillas premarcadas o el silencio no son consentimiento | Las dos casillas arrancan sin marcar, también en el re-consentimiento | RGPD considerando 32; TJUE *Planet49* (C-673/17, 1-oct-2019); EDPB Directrices 05/2020 sobre el consentimiento §3.4 |
| El pedido de consentimiento se distingue de otros asuntos y no se agrupa | Política y términos en casillas separadas; los opcionales, aparte y no obligatorios; el KYC sigue con su consentimiento propio | RGPD art. 7.2; EDPB 05/2020 §3.1.3 (granularidad) y §3.1.2 (no condicionar) |
| Informar al momento de recoger los datos, en lenguaje claro y en capas | Primera capa: resumen de 5 líneas en el paso del alta; segunda capa: `/privacidad` completa con índice | RGPD arts. 12 y 13; Grupo del Art. 29, Directrices de transparencia WP260 rev.01 (capas); Ley 25.326 art. 6 (información previa: finalidad, destinatarios, responsable, derechos) |
| Poder demostrar el consentimiento | Registro con versión, fecha y hora, qué y camino | RGPD art. 7.1; EDPB 05/2020 §5.1 |
| Retirarlo tan fácil como darlo | Se mantiene "Retirar mi consentimiento" en Mis datos | RGPD art. 7.3; Ley 25.326 art. 5 (revocable) |
| Volver a pedirlo si cambia lo que se informó | Re-consentimiento con "Qué cambió" | EDPB 05/2020 §5.2; WP260 (cambios a la información) |
| Transferencia a un país sin nivel adecuado | El resumen ya dice que los datos van a Estados Unidos; se acepta antes de tener cuenta | Ley 25.326 art. 12; Decreto 1558/2001 |
| Criterios de la autoridad argentina | Mismo enfoque de información previa y consentimiento expreso | AAIP, Resolución 4/2019 (criterios orientadores de la Ley 25.326) |

## Decisions

### 1. El alta acepta antes del login (y no después)
- `components/sesion/paso-alta.tsx` (cliente): `<dialog>` modal (mismo patrón que `components/kyc-dialogo.tsx`: `showModal`, Escape cierra, el foco vuelve al botón que lo abrió). Título "Crear tu cuenta", aviso de prototipo, el bloque de consentimiento y los botones "Aceptar y crear mi cuenta" y "Cancelar". Debajo: "¿Ya tenés cuenta? Usá "Entrar" arriba".
- El bloque (resumen `RESUMEN` con sus ⚖, enlaces a `/privacidad` y `/privacidad#terminos` en otra pestaña, `fieldset` con las dos casillas, error con `role="alert"`) se extrae de `PantallaConsentimiento` a `components/sesion/bloque-consentimiento.tsx` y lo usan los dos. Los textos en español quedan iguales a los de hoy (los e2e de `privacidad.spec.ts` siguen valiendo).
- En `app/sumarte/sumarte-cliente.tsx`, todo lo que sin sesión hoy llama `entrar()` (planes, "Pedir invitación", "Pedir una charla") abre el paso. Al aceptar: `guardarPendiente` (si hay plan) + `guardarAceptacionPrevia` + `entrar()`. Al cancelar no se guarda nada.
- Con el modo de prueba (sin Privy), `entrar()` sigue llevando al panel "Entrar como…" de Sumarte: la aceptación previa ya está guardada y se toma al elegir el email.
- **Alternativa descartada: la pantalla de aceptación de Privy** (`require_users_accept_terms`). Es una sola casilla para todo, sin versión ni constancia propia, en inglés, y el registro queda en Privy. Se usa solo `legal` (enlaces informativos en su ventana).
- **Alternativa descartada: aceptar después del login, siempre** (lo de hoy, mejorado). No cumple el pedido de Gus ni "informar al momento de recoger": Privy ya recibió el email.

### 2. Aceptación previa
- `lib/privacidad/consentimiento.ts`: `CLAVE_ACEPTACION_PREVIA = "lh-consentimiento-previo"` en `sessionStorage` (por pestaña, sin prefijo: todavía no hay persona). Valor `{ version, aceptadoEn }`.
- `guardarAceptacionPrevia(almacen, ahora)` y `tomarAceptacionPrevia(almacen, ahora) → { aceptadoEn } | null`: lee, **borra siempre** y devuelve solo si la versión es la vigente y no pasaron `VIGENCIA_PENDIENTE_MS` (5 min, el mismo plazo que el plan; importado de `lib/sesion/nivel.ts`). Si el login tarda más, aparece la pantalla y se acepta ahí (canal `al-entrar`).
- El proveedor de sesión, cuando hay persona y el consentimiento está `pendiente`, llama una vez `tomarAceptacionPrevia` y, si hay, `registrarConsentimiento(..., { canal: "alta", aceptadoEn })`. La fecha registrada es la del momento en que marcó las casillas.
<!-- arquitecto: que una aceptación previa no quede suelta en la pestaña para la persona siguiente. -->
- **La aceptación previa se consume en cualquier inicio de sesión**, no solo cuando el consentimiento está pendiente: apenas `/api/sesion` responde 200 y se conoce el consentimiento (`vigente` o `pendiente`), se llama `tomarAceptacionPrevia` (que la borra siempre) y se registra solo si estaba `pendiente`. Si no, alguien con cuenta y consentimiento vigente que pasó por el paso dejaría la aceptación en la pestaña, y otra persona que entre en esa misma pestaña dentro de los 5 minutos quedaría registrada con canal `alta` sin haber visto las casillas. También se borra al **salir** (`salir()`).

### 3. Persona anónima hasta aceptar
- La clave del consentimiento se arma con el id explícito: `claveConsentimientoDe(id)` = `u:<id>:lh-consentimiento`. `leerConsentimiento`, `registrarConsentimiento`, `registrarConsentimientoSensible` y `retirarConsentimiento` reciben `idPersona`. `useConsentimiento(idPersona)` ya lo recibe.
- En `proveedor-sesion.tsx`: `establecerPersona(consentimiento === "vigente" ? idPersona : null)` y `lh-ultima-persona` se escribe solo con consentimiento vigente. Así, mientras está pendiente, `clave()` devuelve los nombres sin prefijo (como sin sesión), `anotarEnBitacora` no anota (ya mira `personaEnSesion()`) y `GuardarOrigen` guarda como visita anónima. No hace falta tocar cada pantalla.
- El nivel (lo elegido en Sumarte) se vuelve a leer cuando la persona pasa a activa: el efecto que hoy depende de `idPersona` pasa a depender de la persona activa.
- `SoloConSesion` alrededor de la campanita y de `AplicarPreferencias` pasa a pedir consentimiento vigente (`SoloConConsentimiento`). `MenuPersona` sin consentimiento muestra solo "Salir".
- `rutaPideConsentimiento(ruta)` pasa a ser `!esPrivacidad(ruta)`: todas menos `/privacidad`. La puerta, con sesión y consentimiento `cargando`, muestra "Cargando…" también en las públicas (un instante).

### 4. Camino del consentimiento
- `Consentimiento` suma `canal?: "alta" | "al-entrar" | "nueva-version"`. `registrarConsentimiento` recibe `{ canal, aceptadoEn? }`; la pantalla calcula `nueva-version` si había un registro de otra versión y `al-entrar` si no había ninguno.
- `leerConsentimiento` acepta registros sin `canal` (anteriores a este cambio) y descarta el registro si `canal` está presente y no es uno de los tres (se rechaza lo que sobra).
- Para guardar la versión anterior en el re-consentimiento, la pantalla lee el registro viejo **antes** de pisarlo (ya lo hace `useConsentimiento`).

### 5. Re-consentimiento con lo que cambió
- `lib/privacidad/politica.ts`: `VERSIONES_POLITICA: readonly { version: string; fecha: string; cambios: readonly string[] }[]` en orden. La primera (`2026-10-14-borrador`) sin cambios; un test exige que la última sea `VERSION_POLITICA` y que toda versión después de la primera tenga al menos un cambio.
- Este cambio **sube la versión** a `2026-10-15-borrador`, porque cambia lo informado: `BASE_LEGAL` pasa de "que das al entrar por primera vez" a "que das al crear tu cuenta". Cambio listado: "Ahora aceptás la política y los términos al crear tu cuenta, antes de entrar. Mientras no aceptes, no guardamos nada a tu nombre." Así el equipo ve el re-consentimiento funcionando.
- La pantalla con registro previo muestra "Aceptaste la versión X el <fecha>." y "Qué cambió" (lista), con el enlace "Leer la política completa".

### 6. Constancia en Mis datos
- Sección nueva "Tu consentimiento", antes de "Retirar mi consentimiento": "Aceptaste la versión X el 15 de octubre de 2026 a las 21:05, al crear tu cuenta". Caminos: `alta` → "al crear tu cuenta", `al-entrar` → "al entrar", `nueva-version` → "cuando cambió la política", ausente → "sin dato". Fecha con `Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" })` en la zona del navegador. Si dio el de datos sensibles, una línea más con su versión y fecha.
- La descarga JSON de Mis datos ya incluye el registro; suma `canal` sin cambios en `lib/privacidad/exportar.ts`.

### 7. Compatibilidad con `base-neon`
- La interfaz no cambia de lugar: las cuatro funciones del registro siguen siendo la única puerta. Con la base, `registrarConsentimiento` llama a una API (`POST /api/consentimientos`) que escribe **dos filas** en `consentimientos` (tipo `politica` y tipo `terminos`) con la misma versión y fecha.
- El `canal` necesita una columna nueva (`canal text null`) en `consentimientos`. **No se agrega en este cambio** (no toca la base); la suma por migración el cambio que mude el consentimiento a la base, y si `base-neon` todavía no se implementó, conviene sumarla ahí directamente (pregunta para el arquitecto).
- Con la base, la fecha la pone el servidor; la del momento de las casillas viaja como dato informativo (`aceptado_en_cliente`). El historial de consentimientos debería ser de solo agregar (ADR-001): retirar suma una fila `retiro` en lugar de borrar.
- Con la base, `/api/sesion` crea la fila de `personas` en el primer login, antes del consentimiento: guarda solo email e id de Privy para el control de acceso. Queda anotado para R29.

<!-- arquitecto: §7.1 a §7.5 responden la pregunta abierta sobre `base-neon`. No cambian nada de este cambio (que no toca la base): son el contrato para el cambio que mude el consentimiento. Ver ADR-005 (Propuesta). -->
#### 7.1 Forma de la tabla (recomendada)
`base-neon` está aprobado pero **sin implementar**, y su spec solo pide "persona, tipo, versión y fecha". Conviene que su **primera migración** ya cree la tabla con esta forma, así no hace falta una segunda migración para `canal` ni para `idioma` (`idioma-legal`):

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `uuid` | clave |
| `persona_id` | `uuid not null` → `personas.id` | |
| `tipo` | enum `politica` · `terminos` · `sensibles` | una fila por cosa aceptada (granularidad) |
| `evento` | enum `acepta` · `retira` | retirar suma una fila, no borra |
| `version` | `text not null` | `VERSION_POLITICA` |
| `canal` | enum `alta` · `al-entrar` · `nueva-version`, **nulo** | nulo = registro anterior a este cambio o un `retira` |
| `idioma` | enum `es` · `en`, **nulo** | lo suma `idioma-legal`; nulo = `es` |
| `registrado_at` | `timestamptz not null default now()` | **la fecha que vale**, la pone el servidor |
| `aceptado_en_cliente` | `timestamptz` nulo | la hora en que marcó las casillas, informativa (el reloj del navegador puede mentir) |

- **Libro de solo agregar** (ADR-001): nunca `update` ni `delete`; el estado vigente es la última fila por persona y tipo. Índice `(persona_id, tipo, registrado_at desc)`. Si Gus no quiere tocar `base-neon`, las columnas se suman después como nulas: es una migración que no rompe nada (dejan valer las filas viejas).
- **Borrar la cuenta** = anonimizar `personas` (la fila de consentimientos queda, apuntando a una persona sin email): sigue siendo prueba de que hubo consentimiento.
- Mis datos exporta todas las filas de la persona (también los retiros).

#### 7.2 El servidor verifica el consentimiento
Con la base, la regla "persona anónima hasta aceptar" no puede depender solo del navegador: **toda ruta del servidor que escriba algo a nombre de la persona** (perfil, membresías, pactos, bitácora, origen, reportes con identidad) verifica en `consentimientos` que haya un `acepta` vigente de `politica` y `terminos` y, si no, responde 403 con `{ consentimiento: false }`. Va en una función única (`exigirConsentimiento(sesion)`) junto a `sesionDelPedido`. `/api/sesion` y `POST /api/consentimientos` son las únicas excepciones. Hoy ninguna ruta escribe datos personales (`/api/reportes` no manda la identidad al issue), así que este cambio no lo necesita.

#### 7.3 Identidad antes del consentimiento
- **Privy** crea su usuario (email) al terminar el login, antes de las casillas si la persona usó "Entrar". Es el encargado del login (ya listado en la política). Si la persona aprieta "No acepto, salir", el usuario queda en Privy: borrarlo pide la API de servidor de Privy con su secreto, que hoy no tenemos. **Pregunta para Gus y Gabriel** (R29): ¿se acepta para el prototipo o se borra?
- **`personas`**: recomendación para el cambio que mude el consentimiento: con acceso abierto (`sumarte-acceso`), la fila de una persona **nueva** se crea en la **misma transacción** que su primer `acepta` (`POST /api/consentimientos`), no en `/api/sesion`. Mientras tanto `/api/sesion` responde con lo que dice el token de Privy (id y email), sin guardarlo. Las personas cargadas por `LH_PERSONAS` ya existen (las cargó el equipo) y solo se les completa el `privy_id`. Así "nada con su identidad antes de aceptar" vale también en la base.

#### 7.4 Falla
Si `POST /api/consentimientos` falla o no responde: la pantalla muestra "No pudimos guardar tu aceptación. Probá de nuevo." con `role="alert"`, las casillas siguen marcadas y la persona sigue anónima (nunca se la da por aceptada sin confirmación del servidor). Si responde dos veces (doble clic, reintento): la ruta es idempotente por `(persona, tipo, version, evento)` dentro de los últimos segundos, o el cliente manda una `clave_idempotencia`; dos filas iguales no rompen el libro, pero se evitan.

#### 7.5 Aceptación previa con la base
La aceptación previa sigue en `sessionStorage` (todavía no hay persona); al entrar, el cliente la manda una sola vez a `POST /api/consentimientos` con `canal: "alta"` y `aceptado_en_cliente`. El servidor valida versión vigente y que `aceptado_en_cliente` no tenga más de 5 minutos ni esté en el futuro; si no, la descarta y la persona ve la pantalla.

### 8. Privy
- `privy-puente.tsx` suma `legal: { privacyPolicyUrl: <origen>/privacidad, termsAndConditionsUrl: <origen>/privacidad#terminos }` (con `window.location.origin`). Es información: la aceptación sigue siendo la de las casillas.

## Risks / Trade-offs

- [Quien entra con "Entrar" (no por Sumarte) acepta después del login, con Privy ya creado] → es la cuenta existente en la mayoría de los casos; la pantalla aparece enseguida en cualquier página y nada se guarda a su nombre hasta aceptar. Hacer pasar "Entrar" también por el paso duplicaría la aceptación a quien ya tiene cuenta.
- [5 minutos puede ser poco si el código del email tarda] → aparece la pantalla y acepta ahí; no se pierde nada salvo un paso más.
- [Subir la versión obliga a todo el equipo a volver a aceptar] → es justamente la prueba del re-consentimiento; si Gus prefiere no subirla, se deja la versión y el cambio de texto queda para la próxima (pregunta).
- [Con la persona inactiva hasta aceptar, lo que haga en ese rato en páginas públicas queda como anónimo en el navegador] → es lo esperado; "Importar a mi cuenta" sigue ofreciéndose después.

## Migration Plan

- Rama `agente/consentimiento-alta` desde `main`. No depende de los cambios del Congreso ni del bilingüe.
- Registros guardados sin `canal` siguen valiendo; al subir la versión, todos vuelven a aceptar una vez.
- Volver atrás: revertir el PR; los registros con `canal` se siguen leyendo con el código viejo (ignora el campo) pero son de la versión nueva, así que el código viejo volvería a pedir el consentimiento una vez.

## Open Questions

- ~~Revisión del agente arquitecto pendiente~~ <!-- arquitecto: revisado el 14-oct-2026; ajustes en §2 y §7.1 a §7.5; ADR-005 (Propuesta). -->
- ¿Se suma la forma de §7.1 a la primera migración de `base-neon` (recomendado) o se agrega después?
- ¿Qué pasa con el usuario de Privy de quien no acepta (§7.3)?
