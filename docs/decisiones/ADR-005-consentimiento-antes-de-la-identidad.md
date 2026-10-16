# ADR-005 · Sin consentimiento no hay identidad: se acepta antes de crear la cuenta (solo los emails nuevos marcan las casillas), la sesión sin aceptar es anónima y el registro es un libro de solo agregar

- **Estado:** Propuesta
- **Fecha:** 2026-10-14 (actualizado el 2026-10-16 con el flujo que Gus aprobó el 15-oct-2026)
- **Cambio OpenSpec relacionado:** consentimiento-alta, `entrar-por-email` (casillas solo para emails nuevos), `login-neon-auth` (puerta del servidor) y, para la base, `consentimiento-en-la-base`; `base-neon`; `idioma-legal` suma el idioma

## Contexto
Hoy la política se acepta después de entrar, y mientras tanto las páginas públicas guardan bitácora y origen con el id de la persona. `consentimiento-alta` lo da vuelta en el navegador. Pero con `base-neon` (aprobado, sin implementar) la regla tiene que valer también en el servidor, y la tabla `consentimientos` se crea en la primera migración: elegir ahora su forma y quién puede escribir con la identidad de la persona evita una segunda migración y, sobre todo, datos guardados sin consentimiento que después no se pueden "desguardar".

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Como hoy: aceptar después del login, la sesión es la persona desde el primer momento | Cero trabajo | Se guardan datos a su nombre antes de aceptar; no cumple "informar al recoger" (RGPD art. 13, Ley 25.326 art. 6) |
| B · Aceptar antes de cualquier login (alta y "Entrar") + sesión anónima hasta aceptar, solo en el navegador | Resuelve el prototipo en una noche | Con la base, cualquier ruta del servidor podría escribir igual; la constancia se pierde al retirar (hoy se borra el registro) |
| C · B + en la base: el servidor exige consentimiento en toda escritura, la fila de `personas` nueva nace con el primer consentimiento, y `consentimientos` es un libro de solo agregar con `tipo`, `evento`, `version`, `canal`, `idioma`, hora del servidor y hora del navegador | La regla vale aunque alguien llame la API a mano; se puede demostrar qué se aceptó, cuándo, cómo y en qué idioma, también después de retirar | Más columnas en la primera tabla; una función más (`exigirConsentimiento`) que cada ruta nueva tiene que usar |
| D · Usar la pantalla de aceptación de Privy (`require_users_accept_terms`) | La da el proveedor | Una sola casilla, sin versión ni constancia nuestra, en inglés y guardada en Privy: el dato queda del lado del proveedor |

## Decisión
**C.** `consentimiento-alta` implementa la parte del navegador (B) y deja escrito en su design (§7) el contrato para la base. Lo central: **el consentimiento es un dato de NetX, no de Privy**, **la plataforma no abre el login de un email sin cuenta sin que la persona haya marcado antes las casillas** (en Sumarte, en "Entrar" de la barra superior, en cualquier otro `entrar()` y en "Entrar como…" del modo de prueba; quien ya tiene cuenta entra sin casillas, ver el flujo del 15-oct-2026 abajo), y **nada se escribe con la identidad de una persona hasta que hay una fila `acepta` vigente**.

**Pedido de Gus (15-oct-2026):** "be sure PR71 will make consent a requirement to log in". Por eso el paso con las casillas ya no es solo del alta en Sumarte: `entrar()` abre el paso y solo el paso abre el login (`consentimiento-alta` design §1). Ese mismo día Gus precisó que quien ya tiene cuenta no tiene que marcar las casillas cada vez: ver el flujo de abajo. La pantalla de consentimiento después del login queda como red de seguridad para cuando hay sesión sin aceptación vigente registrada (sesión restaurada por Privy, aceptación del paso vencida, otra pestaña, versión nueva).

**Flujo de entrada que Gus aprobó el 15-oct-2026** (issue #67, con ADR-009 opción C), que reemplaza "casillas antes de cualquier login, cada vez que entrás" (a Gus no le gusta que quien ya tiene cuenta marque casillas en cada login). No cambia el fondo de C: sigue sin escribirse nada a nombre de nadie sin consentimiento vigente.
1. Un solo formulario propio de email, desde "Entrar" y desde "Crear tu cuenta" (`entrar-por-email`).
2. El servidor averigua si ese email ya tiene cuenta: una persona con ese email y al menos un `acepta` de la política en `consentimientos` (de cualquier versión). No se pregunta a Neon Auth ni a Privy.
3. Email nuevo: ve las casillas (sin marcar, obligatorias aparte del opcional) y no puede pedir el código sin marcarlas. Recién entonces se manda el código y se crea la cuenta. Con Neon Auth, el servidor lo hace cumplir: su manejador no deja pedir el código sin una cookie firmada de la consulta (`login-neon-auth` §3.1).
4. Email con cuenta y consentimiento vigente: pide el código y entra directo, sin casillas.
5. Cuenta con una versión vieja o con el consentimiento retirado: entra y, antes de cualquier otra cosa, ve "Qué cambió" y acepta (la red de seguridad de `consentimiento-alta`).
6. Nada se guarda a nombre de nadie sin consentimiento vigente.
7. Modo de prueba: el mismo flujo con "Entrar como…".

**Saber si un email tiene cuenta (enumeración).** Con este flujo, la pantalla que sigue al email ya dice si tiene cuenta (casillas o no), así que igualar la respuesta y el tiempo de la consulta no la esconde. Opciones:

| Opción | A favor | En contra |
|---|---|---|
| A · Mitigar: límite de consultas por IP y total, la respuesta dice un solo dato, sin caché, sin el email en los logs, solo desde nuestro origen | Cumple el flujo tal cual, una noche, sin servicios nuevos | Con muchas IP se puede averiguar, de a poco, si un email tiene cuenta |
| B · Verificar el email primero (código para todos, casillas después para los nuevos) | Respuesta igual para todos | Rompe el punto 3: el email nuevo llega al proveedor y se pide el código antes de aceptar |
| C · Un email en los dos casos (código o enlace para seguir con las casillas) | Esconde del todo la existencia | Necesita emails propios (ADR-009 punto 5) y escribe a alguien que no aceptó nada |
| D · No hacer nada | Cero trabajo | Cualquiera prueba miles de emails |

**Se elige A** (`entrar-por-email` design §2). Se revisa con Gabriel antes de mostrar la plataforma fuera del equipo (R14); la salida es C, cuando existan los emails propios.

**Privy mientras conviva:** el email se escribe en nuestro formulario y la ventana de Privy se abre con ese email puesto (`prefill`) y, si tiene cuenta, con las altas bloqueadas (`disableSignup`, en los tipos de `@privy-io/react-auth` 3.48.1; su comportamiento se verifica en el preview). Si no bloquea, con Privy se siguen pidiendo las casillas a todos y la salida es pasar Production a `neon-auth` (ADR-009, con la regla de ADR-008).

**Respuestas de Gus (15-oct-2026)**, que completan la decisión sin cambiarla (el estado sigue en Propuesta hasta que Gus mergee):
- La tabla `consentimientos` completa (forma de `consentimiento-alta` design §7.1) va en la **primera migración de `base-neon`**.
- Se suma un consentimiento **opcional** de novedades por email: tipo `novedades`, sin marcar, nunca obligatorio, que se da o se retira desde Mis datos (camino `mis-datos`).
- Una sola versión nueva de la política para `consentimiento-alta` e `idioma-legal`.
- Borrar en Privy al usuario que no acepta: pendiente, fuera de alcance (R29).

## Consecuencias
- Ganamos: una regla de identidad simple de revisar ("¿esta ruta llama a `exigirConsentimiento`?") y una constancia que sobrevive al retiro y al borrado de la cuenta (que es anonimizar, ADR-001).
- Ganamos: por el camino normal (Sumarte, "Entrar" o "Entrar como…"), **el email de una persona nueva no llega al proveedor de login antes de las casillas**.
- Ganamos: **quien ya tiene cuenta no vuelve a marcar las casillas** (decisión de Gus del 15-oct-2026; antes figuraba acá como costo aceptado y se quitó). Mientras `entrar-por-email` no esté en `dev`, `consentimiento-alta` pide las casillas en todo login de manera transitoria.
- Aceptamos: alguien puede averiguar, con esfuerzo, si un email tiene cuenta (opción A de arriba); se revisa en R14.
- Aceptamos: con Neon Auth, si alguien empieza Google desde su email y elige en Google otra cuenta sin aceptación, queda un usuario en `neon_auth` sin nada nuestro (la persona sigue anónima); borrarlo es una consulta nuestra que queda para R29.
- Aceptamos: en los casos de red de seguridad (una sesión que Privy restaura sola, una aceptación que venció antes de terminar el login, una versión nueva de la política), puede haber un usuario en Privy sin aceptación vigente registrada; si esa persona no acepta, el usuario queda en Privy. Borrarlo con su API de servidor queda pendiente (decisión de Gus, 15-oct-2026); se responde en R29 con Gabriel.
- Aceptamos: la ventana de Privy es de Privy; lo que pase por fuera de la plataforma (su panel, otra app con el mismo `appId`) no lo controla este cambio.
- Aceptamos: la hora del navegador se guarda solo como informativa; la que vale es la del servidor.
- `consentimientos` se suma a la lista de libros de solo agregar de ADR-001.
- Revisar: cuando se mande el primer email de novedades de verdad (lista de correo, enlace de baja en el email, doble opt-in), cuando se responda R29, antes de mostrar la plataforma fuera del equipo (enumeración, R14) y antes del Congreso (el límite de consultas por IP puede quedar corto con mucha gente detrás de la misma red).

## En palabras simples
Para entrar, escribís tu email. Si es la primera vez, antes de mandarte el código te pedimos que aceptes la política y los términos, así tu email no llega al servicio de login sin que hayas aceptado. Si ya tenés cuenta, te mandamos el código y entrás, sin volver a marcar nada. Por ejemplo: Ana se suma hoy y marca las dos casillas; mañana escribe su email y entra directo. Si por algún motivo quedaste con la sesión abierta sin una aceptación vigente (por ejemplo, tardaste mucho en poner el código o cambió la política), la plataforma te vuelve a pedir que aceptes y, mientras tanto, te trata como a un visitante sin cuenta. Cada aceptación queda anotada como un renglón en un libro que no se borra: qué versión, cuándo, desde dónde y en qué idioma. Si un día retirás el consentimiento, se agrega otro renglón que lo dice, en vez de borrar el anterior. Recibir novedades por email es aparte y opcional: no hace falta para tener cuenta y lo podés sacar desde Mis datos.

## Fuentes
- `openspec/changes/consentimiento-alta/design.md` (tabla de buenas prácticas y §7).
- ADR-001 (libros de solo agregar, anonimizar en lugar de borrar).
- `openspec/changes/base-neon/` (tabla `consentimientos` con persona, tipo, versión y fecha).
- RGPD arts. 7 y 13; Ley 25.326 arts. 5 y 6; EDPB Directrices 05/2020 (citadas de memoria en el design; las verifica Gabriel con R14).
