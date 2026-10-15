# ADR-005 · Sin consentimiento no hay identidad: se acepta antes de cualquier login, la sesión sin aceptar es anónima y el registro es un libro de solo agregar

- **Estado:** Propuesta
- **Fecha:** 2026-10-14
- **Cambio OpenSpec relacionado:** consentimiento-alta (y, para la base, el cambio que mude el consentimiento; `base-neon`; `idioma-legal` suma el idioma)

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
**C.** `consentimiento-alta` implementa la parte del navegador (B) y deja escrito en su design (§7) el contrato para la base. Lo central: **el consentimiento es un dato de NetX, no de Privy**, **la plataforma no abre ningún login sin que la persona haya marcado antes las casillas** (en Sumarte, en "Entrar" de la barra superior, en cualquier otro `entrar()` y en "Entrar como…" del modo de prueba), y **nada se escribe con la identidad de una persona hasta que hay una fila `acepta` vigente**.

**Pedido de Gus (15-oct-2026):** "be sure PR71 will make consent a requirement to log in". Por eso el paso con las casillas ya no es solo del alta en Sumarte: `entrar()` abre el paso y solo el paso abre el login (`consentimiento-alta` design §1). La pantalla de consentimiento después del login queda como red de seguridad para cuando hay sesión sin aceptación vigente registrada (sesión restaurada por Privy, aceptación del paso vencida, otra pestaña, versión nueva).

**Respuestas de Gus (15-oct-2026)**, que completan la decisión sin cambiarla (el estado sigue en Propuesta hasta que Gus mergee):
- La tabla `consentimientos` completa (forma de `consentimiento-alta` design §7.1) va en la **primera migración de `base-neon`**.
- Se suma un consentimiento **opcional** de novedades por email: tipo `novedades`, sin marcar, nunca obligatorio, que se da o se retira desde Mis datos (camino `mis-datos`).
- Una sola versión nueva de la política para `consentimiento-alta` e `idioma-legal`.
- Borrar en Privy al usuario que no acepta: pendiente, fuera de alcance (R29).

## Consecuencias
- Ganamos: una regla de identidad simple de revisar ("¿esta ruta llama a `exigirConsentimiento`?") y una constancia que sobrevive al retiro y al borrado de la cuenta (que es anonimizar, ADR-001).
- Ganamos: por el camino normal (Sumarte, "Entrar" o "Entrar como…"), **el email ya no llega a Privy antes de las casillas**: la plataforma no llama al login de Privy sin una aceptación previa vigente.
- Aceptamos: quien ya tiene cuenta marca las casillas cada vez que entra (antes del login no se sabe quién es); no se registra otra fila si su consentimiento estaba vigente.
- Aceptamos: en los casos de red de seguridad (una sesión que Privy restaura sola, una aceptación que venció antes de terminar el login, una versión nueva de la política), puede haber un usuario en Privy sin aceptación vigente registrada; si esa persona no acepta, el usuario queda en Privy. Borrarlo con su API de servidor queda pendiente (decisión de Gus, 15-oct-2026); se responde en R29 con Gabriel.
- Aceptamos: la ventana de Privy es de Privy; lo que pase por fuera de la plataforma (su panel, otra app con el mismo `appId`) no lo controla este cambio.
- Aceptamos: la hora del navegador se guarda solo como informativa; la que vale es la del servidor.
- `consentimientos` se suma a la lista de libros de solo agregar de ADR-001.
- Revisar: cuando se mande el primer email de novedades de verdad (lista de correo, enlace de baja en el email, doble opt-in), y cuando se responda R29.

## En palabras simples
Para entrar a la plataforma, primero tenés que aceptar la política y los términos: se pide al crear la cuenta y también cada vez que apretás "Entrar", antes de que se abra la ventana del login, así tu email no viaja a ningún lado sin que hayas aceptado. Si por algún motivo quedaste con la sesión abierta sin una aceptación vigente (por ejemplo, tardaste mucho en poner el código o cambió la política), la plataforma te vuelve a pedir que aceptes y, mientras tanto, te trata como a un visitante sin cuenta. Cada aceptación queda anotada como un renglón en un libro que no se borra: qué versión, cuándo, desde dónde y en qué idioma. Si un día retirás el consentimiento, se agrega otro renglón que lo dice, en vez de borrar el anterior. Recibir novedades por email es aparte y opcional: no hace falta para tener cuenta y lo podés sacar desde Mis datos.

## Fuentes
- `openspec/changes/consentimiento-alta/design.md` (tabla de buenas prácticas y §7).
- ADR-001 (libros de solo agregar, anonimizar en lugar de borrar).
- `openspec/changes/base-neon/` (tabla `consentimientos` con persona, tipo, versión y fecha).
- RGPD arts. 7 y 13; Ley 25.326 arts. 5 y 6; EDPB Directrices 05/2020 (citadas de memoria en el design; las verifica Gabriel con R14).
