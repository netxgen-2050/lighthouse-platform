# Proposal

## Why

Issue #67 de Gus y backlog L11: hoy la política de privacidad y los términos del prototipo se aceptan **después** de tener cuenta. Privy crea la identidad al entrar y la pantalla de consentimiento (`components/sesion/pantalla-consentimiento.tsx`) aparece recién en la primera página no pública o en Sumarte. Mientras tanto, si la persona entró desde "Entrar" en una página pública (portada, tribus, territorio, Congreso), esas páginas **anotan la bitácora y el origen con su id** sin que haya aceptado nada.

Las buenas prácticas (RGPD art. 7 y considerando 32, Ley 25.326 art. 5 y 6, guías del EDPB 05/2020 y de la AAIP, citadas en `design.md`) piden lo contrario: informar y pedir el consentimiento **en el alta**, con casillas sin marcar, separando lo obligatorio de lo opcional, con un resumen en capas y pudiendo demostrar qué versión se aceptó y cuándo. Este cambio entra en una noche y no depende de la plataforma bilingüe.

## What Changes

- **Aceptar en el alta, en Sumarte.** Sin sesión, al elegir un plan (o "Pedir invitación" o "Pedir una charla") se abre primero el paso **"Crear tu cuenta"**: el resumen en palabras simples (primera capa), enlaces a la política completa y a los términos (segunda capa) y **dos casillas sin marcar y separadas**: política de privacidad y términos de uso del prototipo. Recién con las dos marcadas se abre el login (Privy, o "Entrar como…" en modo de prueba). La aceptación queda guardada en la pestaña y se registra a nombre de la persona apenas existe la sesión, **sin volver a mostrar la pantalla**.
- **Después de cualquier login sin consentimiento vigente, la pantalla aparece en cualquier página** (no solo en las que piden sesión), salvo `/privacidad`, que tiene que poder leerse. Es el caso de quien entra desde "Entrar" en la barra superior.
- **Sesión sin consentimiento = persona anónima.** Hasta que acepta, la plataforma no escribe nada con su identidad: la bitácora no anota, el origen de la visita y cualquier otro dato del navegador se guardan como sin sesión (sin su prefijo), y no se muestran Hifa, Reportar ni la campanita (Hifa y Reportar ya estaban ocultos). El menú de la persona solo ofrece "Salir".
- **Constancia completa**: el registro guarda versión, fecha y hora, qué se aceptó y **por qué camino** (`alta` en Sumarte, `al-entrar` después del login o `nueva-version`). Mis datos muestra "Aceptaste la versión … el … (al crear tu cuenta)".
- **Re-consentimiento claro**: cuando cambia `VERSION_POLITICA`, la pantalla dice qué versión habías aceptado y cuándo, y **qué cambió** en palabras simples (lista corta por versión en el catálogo de la política). Las casillas vuelven a estar sin marcar.
- **Privy muestra los enlaces** a la política y a los términos en su ventana de login (configuración `legal` del SDK; es solo información, no reemplaza las casillas).
- Compatible con `base-neon`: el registro sigue pasando por las mismas funciones de `lib/privacidad/consentimiento.ts`; el design dice cómo se guarda en la tabla `consentimientos`.

### Fuera de alcance

- **Revisión legal** de la política, los términos y el resumen (siguen como borrador; R14 y C14, con Gabriel).
- **Política y pantalla en inglés** (L10): las traduce como borrador `idioma-legal`; su revisión es L10/R14.
- **Consentimientos opcionales nuevos** (por ejemplo, recibir novedades por email): el cambio deja la regla de que van aparte y sin marcar, pero no agrega ninguno (pregunta para Gus).
- Verificar la edad mínima, consentimiento de menores y doble opt-in por email.
- Mudar el consentimiento a la base: lo hace `datos-en-la-nube` (o `base-neon` si llega antes; ver design).
- Cambiar el consentimiento específico de datos sensibles del KYC (sigue igual, ya está separado).
- Banner de cookies: el prototipo no usa cookies de seguimiento ni analítica.

## Capabilities

### New Capabilities
- `consentimiento-alta`: aceptación de la política y los términos dentro del flujo de alta, persona anónima hasta aceptar, constancia con camino, versión y fecha, y re-consentimiento con lo que cambió.

### Modified Capabilities
- (ninguna en `openspec/specs/`: `privacidad-consentimiento` todavía no está archivada. El design anota qué cambia de su requisito "Consentimiento al entrar": la pantalla ya no se limita a las páginas que piden sesión.)

## Impact

- Código: `components/sesion/paso-alta.tsx` (nuevo), `components/sesion/pantalla-consentimiento.tsx` (re-consentimiento con cambios), `components/sesion/puerta.tsx` y `components/sesion/proveedor-sesion.tsx` (pantalla en cualquier página, persona activa solo con consentimiento), `components/sesion/privy-puente.tsx` (`legal`), `components/barra-superior.tsx` / `components/menu-persona.tsx` (solo "Salir" sin consentimiento), `app/sumarte/sumarte-cliente.tsx` (abre el paso antes de `entrar()`), `lib/privacidad/consentimiento.ts` (clave con id explícito, `canal`, aceptación previa), `lib/privacidad/politica.ts` (`CAMBIOS_POR_VERSION`), `app/mis-datos/mis-datos-cliente.tsx` (constancia).
- Tests: unitarios de `consentimiento.ts` (aceptación previa, vencimiento, canal, registros viejos sin canal); e2e `e2e/consentimiento-alta.spec.ts`; ajustes en `e2e/privacidad.spec.ts` (el orden pantalla → plan sigue valiendo para quien entra sin pasar por el alta).
- **Toca datos personales y permisos: pendiente de revisión del agente arquitecto** (en esta corrida no hubo forma de invocarlo; ver resumen). Sin integraciones nuevas, sin plata.
- Independiente de `idioma-base` y de los cambios del Congreso. Si `base-neon` ya está implementado, ver design §7.
