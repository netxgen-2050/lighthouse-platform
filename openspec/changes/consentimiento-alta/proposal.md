# Proposal

## Why

Issue #67 de Gus, backlog L11 y pedido de Gus del 15-oct-2026 ("be sure PR71 will make consent a requirement to log in"): hoy la política de privacidad y los términos del prototipo se aceptan **después** de tener cuenta. Privy crea la identidad al entrar y la pantalla de consentimiento (`components/sesion/pantalla-consentimiento.tsx`) aparece recién en la primera página no pública o en Sumarte. Mientras tanto, si la persona entró desde "Entrar" en una página pública (portada, tribus, territorio, Congreso), esas páginas **anotan la bitácora y el origen con su id** sin que haya aceptado nada.

Las buenas prácticas (RGPD art. 7 y considerando 32, Ley 25.326 art. 5 y 6, guías del EDPB 05/2020 y de la AAIP, citadas en `design.md`) piden lo contrario: informar y pedir el consentimiento **en el alta**, con casillas sin marcar, separando lo obligatorio de lo opcional, con un resumen en capas y pudiendo demostrar qué versión se aceptó y cuándo. Este cambio entra en una noche y no depende de la plataforma bilingüe.

## What Changes

- **Aceptar antes de crear la cuenta** (pedido de Gus, 15-oct-2026: que el consentimiento sea requisito para entrar). Todo lo que abre el login pasa antes por un paso con el bloque de consentimiento: el resumen en palabras simples (primera capa), enlaces a la política completa y a los términos (segunda capa), **dos casillas sin marcar y separadas** (política de privacidad y términos de uso del prototipo) y, aparte, el grupo opcional de novedades. Recién con las dos obligatorias marcadas se abre el login (Privy, o "Entrar como…" en modo de prueba). Vale para:
  - **Sumarte**: al elegir un plan (o "Pedir invitación" o "Pedir una charla"), el paso se titula **"Crear tu cuenta"**.
  - **"Entrar" de la barra superior** y cualquier otro botón o enlace que llame `entrar()`: el paso se titula **"Entrar"**, con el mismo bloque y los mismos textos de casillas.
  - **El panel "Entrar como…"** del modo de prueba: sin aceptación previa vigente, elegir un email abre primero el paso.
  - `entrar()` deja de abrir el login directamente: abre el paso, y el login de Privy solo se llama desde el paso al aceptar. Así **la plataforma nunca manda a Privy el email de alguien que no marcó las casillas**. La aceptación queda guardada en la pestaña y se registra a nombre de la persona apenas existe la sesión, **sin volver a mostrar la pantalla**.
  - **Transitorio (flujo que Gus aprobó el 15-oct-2026, issue #67):** en este cambio el servidor todavía no sabe si un email ya tiene cuenta (el consentimiento vive en el navegador), así que el paso aparece en todo login. **No es el flujo final:** `entrar-por-email` (después de `consentimiento-en-la-base`) pone un formulario de email antes y muestra las casillas **solo a los emails nuevos**; quien ya tiene cuenta entra directo. `entrar()`, el paso y `abrirLogin()` quedan armados para que ese cambio solo sume el email delante. Se recomienda que `dev` no pase a `main` entre los dos (pregunta abierta para Gus).
- **La pantalla de consentimiento queda como red de seguridad**: si hay sesión sin aceptación vigente registrada (la aceptación del paso venció antes de terminar el login, Privy restauró una sesión de antes, el login terminó en otra pestaña, o cambió la versión de la política), la pantalla aparece en cualquier página (no solo en las que piden sesión), salvo `/privacidad`, que tiene que poder leerse.
- **Sesión sin consentimiento = persona anónima.** Hasta que acepta, la plataforma no escribe nada con su identidad: la bitácora no anota, el origen de la visita y cualquier otro dato del navegador se guardan como sin sesión (sin su prefijo), y no se muestran Hifa, Reportar ni la campanita (Hifa y Reportar ya estaban ocultos). El menú de la persona solo ofrece "Salir".
- **Constancia completa**: el registro guarda versión, fecha y hora, qué se aceptó y **por qué camino** (`alta` en Sumarte, `al-entrar` desde el paso "Entrar" o la pantalla, o `nueva-version` si había aceptado otra versión). Mis datos muestra "Aceptaste la versión … el … (al crear tu cuenta)".
- **Re-consentimiento claro**: cuando cambia `VERSION_POLITICA`, la pantalla dice qué versión habías aceptado y cuándo, y **qué cambió** en palabras simples (lista corta por versión en el catálogo de la política). Las casillas vuelven a estar sin marcar. Mientras el paso "Entrar" aparezca en todo login (transitorio), muestra la versión vigente y su "Qué cambió"; con `entrar-por-email`, quien ya tiene cuenta con una versión vieja entra y ve esta pantalla antes de cualquier otra cosa.
- **Una sola subida de versión para este cambio y para `idioma-legal`** (decisión de Gus, 15-oct-2026): la versión nueva `2026-10-15-borrador` sale con este cambio e informa de una vez las tres novedades: aceptar al crear la cuenta, la cookie de idioma `lh-idioma` (fila nueva en "Qué datos tratamos") y las novedades por email opcionales. `idioma-legal` traduce esa misma versión al inglés **sin volver a subirla**. El equipo acepta una sola vez.
- **Consentimiento opcional "Quiero recibir novedades por email"** (decisión de Gus): una casilla aparte, en su propio grupo "Opcional", **sin marcar**, que no hace falta para crear la cuenta. Aparece siempre en los pasos "Crear tu cuenta" y "Entrar" (sin marcar, nunca pisa una elección anterior) y en la pantalla de consentimiento (si la persona todavía no decidió). Se puede dar o **retirar desde Mis datos** en cualquier momento; cada cambio deja constancia con versión, fecha y hora y camino. Retirar el consentimiento general también lo retira. En el prototipo **no se manda ningún email**: solo se guarda la elección.
- **Privy muestra los enlaces** a la política y a los términos en su ventana de login (configuración `legal` del SDK; es solo información, no reemplaza las casillas).
- Compatible con `base-neon`: el registro sigue pasando por las mismas funciones de `lib/privacidad/consentimiento.ts`; el design (§7.1) define la tabla `consentimientos` completa, que **va en la primera migración de `base-neon`** (decisión de Gus; `base-neon` ya está actualizado).

### Fuera de alcance

- **Revisión legal** de la política, los términos y el resumen (siguen como borrador; R14 y C14, con Gabriel).
- **Política y pantalla en inglés** (L10): las traduce como borrador `idioma-legal`; su revisión es L10/R14.
- **Mandar emails de novedades** de verdad: lista de correo, proveedor de envío, doble opt-in, enlace de baja dentro del email. Este cambio solo guarda la elección.
- Otros consentimientos opcionales además de las novedades.
- **Borrar de Privy el usuario que quedó sin aceptación** (solo en los casos de red de seguridad: sesión restaurada, aceptación vencida, "No acepto, salir" ante una versión nueva): queda pendiente (pide la API de servidor de Privy con su secreto). Se anota para R29 (design §7.3).
- No pedirle las casillas en cada login a quien ya tiene cuenta: lo hace `entrar-por-email` (el servidor averigua por el email si ya tiene cuenta; design §1). Este cambio no "adivina" por el navegador (`lh-ultima-persona`), que fallaría en una computadora compartida.
- Lo que haga Privy fuera de la plataforma (su panel, otra app con el mismo `appId`).
- Verificar la edad mínima y el consentimiento de menores.
- Mudar el registro del navegador a la base: lo hace `datos-en-la-nube`. La tabla ya la crea `base-neon` con la forma de design §7.1.
- Cambiar el consentimiento específico de datos sensibles del KYC (sigue igual, ya está separado).
- Banner de cookies: el prototipo no usa cookies de seguimiento ni analítica.

## Capabilities

### New Capabilities
- `consentimiento-alta`: aceptación de la política y los términos dentro del flujo de alta, persona anónima hasta aceptar, constancia con camino, versión y fecha, re-consentimiento con lo que cambió y consentimiento opcional de novedades por email.

### Modified Capabilities
- (ninguna en `openspec/specs/`: `privacidad-consentimiento` todavía no está archivada. El design anota qué cambia de su requisito "Consentimiento al entrar": la pantalla ya no se limita a las páginas que piden sesión.)

## Impact

- Código: `components/sesion/paso-alta.tsx` (nuevo, modos "Crear tu cuenta" y "Entrar"), `components/sesion/pantalla-consentimiento.tsx` (re-consentimiento con cambios), `components/sesion/puerta.tsx` y `components/sesion/proveedor-sesion.tsx` (`entrar()` abre el paso y solo el paso abre el login; pantalla en cualquier página; persona activa solo con consentimiento), `components/sesion/contexto.ts` (firma de `entrar`), `components/sesion/entrar-como.tsx` (pasa por el paso sin aceptación previa), `components/sesion/privy-puente.tsx` (`legal`), `components/barra-superior.tsx` / `components/menu-persona.tsx` ("Entrar" abre el paso; solo "Salir" sin consentimiento), `app/sumarte/sumarte-cliente.tsx` (`entrar({ modo: "alta" })`), `lib/privacidad/consentimiento.ts` (clave con id explícito, `canal`, aceptación previa), `lib/privacidad/politica.ts` (`VERSIONES_POLITICA` con la versión nueva, fila de la cookie de idioma y finalidad de las novedades), `lib/privacidad/novedades.ts` (nuevo), `lib/privacidad/exportar.ts` (suma novedades), `app/mis-datos/mis-datos-cliente.tsx` (constancia y novedades).
- Tests: unitarios de `consentimiento.ts` (aceptación previa, vencimiento, canal, registros viejos sin canal); e2e `e2e/consentimiento-alta.spec.ts`; ajustes en `e2e/privacidad.spec.ts`, `e2e/login.spec.ts`, `e2e/sumarte-acceso.spec.ts` y `e2e/descubrir-publico.spec.ts` (donde aprietan "Entrar" o "Entrar como…", ahora pasan por el paso).
- **Toca datos personales y permisos.** El arquitecto revisó el cambio el 14-oct-2026 (ajustes en design §2 y §7, ADR-005). **Pendiente de su revisión:** lo sumado el 15-oct (consentimiento de novedades, tipo `novedades` y camino `mis-datos` en la tabla). Sin integraciones nuevas, sin plata.
- Independiente de `idioma-base` y de los cambios del Congreso (si llega antes que `idioma-base`, la política ya describe la cookie de idioma "cuando elegís un idioma"; ver design §5). Si `base-neon` ya está implementado, ver design §7.
