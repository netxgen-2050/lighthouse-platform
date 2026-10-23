# Design

## Context

- ADR-009 (aceptada) separa el login (Neon Auth) de la billetera y deja el proveedor para una prueba de una noche, con revisión el 15-nov-2026.
- ADR-011 (Propuesta, PR #105) propone Candide: Safe por persona, passkey como dueña, paymaster nuestro y todo por el servidor. ADR-012 (Propuesta) pide verificar si la firma EIP-1271 de una Safe con passkey sirve para constancias de EAS fuera de la cadena.
- Hoy no hay nada de billeteras en el código: `lib/sesion/billetera.ts` solo abrevia direcciones. Las rutas solo para super admin ya tienen un patrón: `app/api/personas/route.ts` (`sesionDelPedido` y rol `superadmin` verificado en el servidor). La pantalla usa `SoloSuperAdmin` como `/netx`.
- La receta de integraciones (`.claude/skills/integracion-externa`) pide puerto, mock y adaptador real, con las credenciales solo en el servidor.
- `abstractionkit` publicado: 0.4.3 (6-oct-2026), dependencias `@noble/curves` y `@noble/hashes`. No está instalado: los nombres de funciones de este documento salen de la documentación de Candide y **hay que confirmarlos en los tipos de la versión fijada** (`node_modules/abstractionkit/dist/index.d.mts`).

## Goals / Non-Goals

**Goals:**
- Recorrer de punta a punta, en Base Sepolia, passkey → dirección → primera operación patrocinada (despliegue + `attest` de EAS) → estado, desde una página interna.
- Probar la firma EIP-1271 de la Safe sobre una constancia de EAS fuera de la cadena.
- Medir los tiempos y dejar un guion para que Gus repita la prueba en Safari y en Chrome.
- Que todo se apague con una variable y que no quede nada en la base.

**Non-Goals:**
- Recuperación con guardianes (requisito del cambio `billeteras-safe`), tabla `billeteras`, vínculo con `personas.id`, billetera propia, red real, Semillas, llave de NetX en KMS y elegir la red definitiva.

## Ficha del proveedor (Candide)

| Tema | Dato | Fuente / fecha |
|---|---|---|
| Qué ofrece | SDK `abstractionkit` para cuentas Safe ERC-4337 (EntryPoint v0.7 con `SafeAccountV0_3_0`); dueño por passkey (WebAuthn, P-256); bundler y paymaster por URL con clave | ADR-011, docs.candide.dev (23-oct-2026); npm `abstractionkit` 0.4.3 |
| Qué no ofrece | Login, sesiones, guía para Next.js | ADR-011 |
| Autenticación | La clave va dentro de la URL del bundler y del paymaster. **Dueño: Gus** (cuenta en dashboard.candide.dev) | ADR-011 punto 5 |
| Límites | Testnet ilimitada en el plan Starter. Política de patrocinio configurable en el panel (contratos permitidos, topes) | candide.dev/pricing (23-oct-2026) |
| Dueño de los datos | La passkey es de la persona (vive en su dispositivo). La dirección de la Safe la calculamos nosotros y es la misma con cualquier proveedor. Candide no guarda nada nuestro más allá de las operaciones que retransmite | — |
| Si no está | Modo simulado para ver la página; para la prueba real no hay plan B en esta noche (el plan B de ADR-011 es Pimlico o Voltaire propio, que cambia solo el adaptador) | ADR-011 punto 7 |

## Decisions

### 1. Red: Base Sepolia (chain id 84532)
- **Por qué Base y no OP Sepolia:** las dos son OP Stack, con EAS en las mismas direcciones fijas (`EAS` = `0x4200000000000000000000000000000000000021`, `SchemaRegistry` = `0x4200000000000000000000000000000000000020`), con el precompilado P-256 (RIP-7212, que abarata verificar passkeys) y con soporte de Candide. Desempata que Base es la red nombrada en `NS_Tokenomics` doc 04 §6 (junto con Celo) y que EASScan y Basescan tienen exploradores públicos para su testnet. **Esto no elige la red definitiva** (D10 del backlog sigue abierto).
- **Cómo cambiarla:** un solo archivo `lib/billetera-prueba/red.ts` con `chainId`, nombre, RPC público por defecto (`https://sepolia.base.org`, reemplazable con `LH_PRUEBA_CANDIDE_RPC`), direcciones de EAS y del registro, y plantillas de URL de los exploradores. Para OP Sepolia cambian el chain id, el RPC y los exploradores; las direcciones de EAS son las mismas. El implementador **confirma las dos direcciones** leyéndolas en la red (o en la documentación de EAS) antes de fijarlas.

### 2. Qué hace la primera operación: una constancia de EAS de prueba
- Es lo más simple que también sirve para ADR-012: un contrato que ya existe (no desplegamos nada), verificable en EASScan, y prueba justo lo que vamos a usar después.
- **Schema:** `string prueba,uint64 creada_en`, sin resolver (`0x000…0`) y revocable. Su UID es determinístico (keccak de schema, resolver y revocable), así que lo calcula el servidor.
- **Datos:** `prueba = "prueba de Candide"`, `creada_en` = hora del servidor en segundos. **Destinataria:** la propia Safe. Sin datos personales, sin vencimiento y sin `refUID`.
- **Registro del schema:** el servidor lee `getSchema(uid)` del registro. Si no existe, la operación es un lote (MultiSend de Safe): `register` y después `attest`. Si existe, solo `attest`. Así no hace falta que Gus registre nada a mano.
- **Descartado:** una llamada a un contrato no-op (habría que desplegarlo y no prueba nada de EAS) y una transferencia de 0 ETH (no prueba EAS).

### 3. Sin base de datos: la operación viaja y el servidor la vuelve a validar
Las funciones de Vercel no guardan memoria entre pedidos, así que no hay estado en el servidor:
1. `POST /api/netx/billetera-prueba/cuenta` `{ x, y }` → `{ direccion, desplegada }`. La dirección se calcula sin red (CREATE2). `desplegada` se lee con `eth_getCode` (en el mock, siempre `false` hasta la primera operación de esa misma corrida del mock).
2. `POST …/preparar` `{ x, y }` → el servidor arma las llamadas (paso 2), crea la UserOperation (nonce, gas e init code si no está desplegada), pide patrocinio al paymaster, valida la política y devuelve `{ operacion, hashAFirmar }`. Los `bigint` viajan como texto decimal.
3. El navegador firma `hashAFirmar` con la passkey (`navigator.credentials.get`, el challenge es el hash, `allowCredentials` con el id guardado y `userVerification: "required"`).
4. `POST …/enviar` `{ x, y, operacion, firma: { authenticatorData, clientDataJSON, signature } }` → el servidor (a) vuelve a validar la política sobre `operacion.callData`, (b) verifica que `operacion.sender` sea la dirección calculada con `{ x, y }`, (c) arma la firma WebAuthn de Safe (r y s sacados del DER, campos de `clientDataJSON` después del challenge), la formatea para la UserOperation (con el caso de inicialización si el nonce es 0) y (d) la manda al bundler → `{ hashOperacion }`.
5. `GET …/operacion?hash=…` → `{ estado: "enviada" | "incluida" | "fallo", hashTransaccion?, uidConstancia?, motivo? }`, a partir de `eth_getUserOperationReceipt` del bundler. El UID de la constancia sale del evento `Attested` del recibo.
6. `POST …/firma-fuera` y `POST …/verificar-firma` (paso 5, ver decisión 6).

Si el navegador altera la operación, la firma del paymaster deja de valer (cubre los campos de la operación) y además nuestra validación la frena antes de llegar al bundler.

<!-- arquitecto: modos de falla y reintentos (sin base, el estado vive en el navegador) -->
**Modos de falla y reintentos:**
- **Recibo con `success: false`** (la operación entró en un bloque pero se revirtió, por ejemplo `register` de un schema que otro registró en el medio): estado `"fallo"` con el motivo "entró en un bloque pero se revirtió" y el enlace a la transacción. Nunca "incluida".
- **Recibo sin evento `Attested`** o con otra forma: `uidConstancia` queda ausente y la página dice "sin dato" (no se inventa ni se calcula). El adaptador valida la forma del recibo y del resultado de `eth_call`; si no coincide, lo descarta, avisa en el log (sin URL) y responde "fallo" con "respuesta inesperada de la red".
- **Doble clic o reintento:** mientras hay una operación preparándose, esperando firma, enviada o consultándose, el botón está deshabilitado. El navegador guarda en `localStorage` el último `hashOperacion` (dato público). Al volver a la página o al tocar "Reintentar" después de "Todavía sin confirmación", primero se consulta ese hash; solo se prepara una operación nueva si terminó en "fallo".
- **`preparar` nunca usa datos viejos:** vuelve a leer `eth_getCode`, el nonce del EntryPoint y `getSchema` en cada pedido. Así una segunda operación después de una incluida no lleva init code ni un `register` repetido.

**Misma passkey, misma dirección (también entre versiones):** la dirección depende de `{ x, y }` y de las direcciones de los contratos de Safe y del firmante WebAuthn que trae la versión fijada de `abstractionkit`. El navegador guarda la dirección calculada junto a la passkey; si una respuesta posterior de `cuenta` trae otra, la página lo muestra ("La dirección calculada cambió: anotalo en el reporte") y no sigue con la operación. Para `billeteras-safe` esto implica **guardar la dirección** en la tabla, no recalcularla.

### 4. La política de gas, en dos capas
- **En Candide (Gus, en el panel):** una política de patrocinio para Base Sepolia que solo permite los contratos `EAS` y `SchemaRegistry`, con un tope diario bajo (por ejemplo 50 operaciones). Si el panel da un id de política, va en `CANDIDE_SPONSORSHIP_POLICY_ID` (opcional).
- **En nuestro servidor:** la función pura `validarPolitica(callData, red)` decodifica el `callData` de la Safe en sus dos formas (`executeUserOp` con una sola llamada, o `executeUserOp` con `delegatecall` a MultiSend con un lote). Acepta solo llamadas con valor 0 a `EAS.attest` o a `SchemaRegistry.register`, y como mucho dos. Cualquier otra forma, destino, selector, valor o `delegatecall` que no sea a MultiSend se rechaza. Tiene tests unitarios sin red.
- <!-- arquitecto: MultiSend fijo y sin delegatecall adentro --> **"MultiSend" es una dirección fija, no cualquiera:** la de `MultiSendCallOnly` de Safe 1.4.1 en la red (en `red.ts`, confirmada en el despliegue oficial de Safe o en lo que usa `abstractionkit`). Dentro del lote, cada llamada tiene que tener `operation = 0` (llamada normal); un `delegatecall` anidado se rechaza. Si `abstractionkit` arma el lote con otro contrato de MultiSend, se fija ese y se anota en el PR.
- **La política del panel de Candide puede no ver las llamadas de adentro:** para el paymaster, el destino de la operación es la propia Safe (`executeUserOp`). El guion pide confirmar en el panel qué filtra de verdad; la capa que garantiza la política es la nuestra.

### 5. Passkey en el navegador, sin librería nueva
- Crear: `navigator.credentials.create` con `pubKeyCredParams: [{ type: "public-key", alg: -7 }]` (ES256 = P-256), `authenticatorSelection: { residentKey: "preferred", userVerification: "required" }`, `rp.id` = host de la página y un `user.id` aleatorio (no el email ni el id de la persona). <!-- arquitecto: nombre visible de la passkey --> `user.name` y `user.displayName` son textos fijos ("Prueba Candide · NetX"), nunca el email: el sistema los muestra en el llavero y se sincronizan con la cuenta de Apple o de Google. Tiene que llamarse directo desde el clic (Safari lo exige).
- Llave pública: `response.getPublicKey()` (SPKI DER) → `x`, `y` con una función pura que valida el prefijo SPKI de P-256 y el punto sin comprimir (`0x04`). Si `getPublicKey` no existe, la página dice que el navegador no se soporta (y queda anotado para el reporte), sin leer CBOR a mano.
- Se guarda en `localStorage` (`lh-prueba-candide`): `{ idCredencial, x, y, creadaEn }`. Son datos públicos. "Empezar de nuevo" borra la entrada (la passkey queda en el dispositivo; el guion explica cómo borrarla del llavero).
- **El rp id cambia con el dominio:** una passkey creada en un preview no sirve en otro preview. El guion usa siempre la URL fija de la rama.
- <!-- arquitecto: lección para billeteras-safe --> **Para producción esto es irreversible:** la passkey queda atada a su rp id para siempre, y si es la única dueña de una Safe, cambiar de dominio deja la Safe sin quién firme. `billeteras-safe` tiene que fijar el rp id en el dominio definitivo (o un dominio padre estable) antes de crear la primera Safe real. Va precargado en la lista "qué falta para producción" del guion.

### 6. Prueba EIP-1271 fuera de la cadena
- El servidor arma la constancia fuera de la cadena de EAS (tipado EIP-712 `Attest`, dominio `{ name: "EAS", version: <leída de EAS.version()>, chainId, verifyingContract: EAS }`) con el mismo schema, `recipient` = la Safe y `time` = ahora. Calcula su hash EIP-712 y el UID fuera de la cadena (fórmula de la versión 1 de EAS offchain).
- Como dueño de una Safe, la passkey no firma ese hash directo: firma el **hash de SafeMessage** (EIP-712 con el dominio de la Safe, `SafeMessage(bytes message)` con `message = abi.encode(hashConstancia)`), que es lo que verifica el `CompatibilityFallbackHandler` de la Safe. El servidor devuelve ese hash como `hashAFirmar`.
- `verificar-firma`: el servidor arma la firma de Safe con la firma WebAuthn y hace `eth_call` a `isValidSignature(bytes32 hashConstancia, bytes firma)` de la Safe desplegada. Resultado: `0x1626ba7e` = válida; cualquier otra cosa o un revert = no válida, con el detalle.
- <!-- arquitecto: el fallback handler de una Safe 4337 puede no tener EIP-1271 --> **Antes de interpretar el resultado, saber qué contesta:** en las Safe con el módulo 4337, el *fallback handler* (el contrato que atiende las funciones que la Safe no tiene, como `isValidSignature`) suele ser el propio `Safe4337Module`, que puede **no** implementar EIP-1271. En ese caso el `eth_call` revierte por falta de la función, no por una firma mala. `verificar-firma` lee el fallback handler de la Safe (`eth_getStorageAt` en la ranura de Safe `0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5`) y lo devuelve en el detalle. La página distingue tres resultados dentro de lo que pide la spec: "Válida para la Safe (EIP-1271)"; "No válida" con el valor devuelto; y "No válida" con el detalle "la Safe no responde EIP-1271 (fallback handler `0x…`)". El tercero es una respuesta a la pregunta de ADR-012, no un error de la prueba. Si `abstractionkit` documenta cómo firmar mensajes con una Safe con passkey (por ejemplo, otro handler o otro formato de firma), se sigue eso y se anota en el PR.
- **Hipótesis a confirmar en el reporte (no se agrega el SDK de EAS):** la Safe valida su propia firma, pero la verificación estándar de constancias fuera de la cadena del SDK de EAS (`verifyOffchainAttestationSignature`) usa ECDSA y podría no aceptar EIP-1271. El implementador lo confirma **leyendo** el código fuente del SDK (sin instalarlo) y lo anota en el PR. Si no lo acepta, aplica la salida que ya prevé ADR-012: la persona afirma en la cadena desde su Safe con gas pagado.

### 7. Estructura del código
```
lib/billetera-prueba/            // lógica pura, con tests
  red.ts                         // Base Sepolia: chainId, RPC, direcciones, exploradores
  habilitada.ts                  // LH_PRUEBA_CANDIDE y VERCEL_ENV → ¿existe la prueba?
  passkey.ts                     // SPKI → {x,y}; DER → {r,s}; campos de clientDataJSON; validar punto P-256
  eas.ts                         // UID del schema, calldata de register/attest, tipado EIP-712 offchain
  politica.ts                    // validarPolitica(callData, red)
  tiempos.ts                     // segundos con un decimal o "sin dato"
lib/integraciones/candide/
  tipos.ts  puerto.ts  mock.ts  candide.ts  index.ts
app/api/netx/billetera-prueba/{cuenta,preparar,enviar,operacion,firma-fuera,verificar-firma}/route.ts
app/netx/billetera-prueba/page.tsx (server: 404 si no está habilitada) + prueba-cliente.tsx (client)
```
- `index.ts` elige: si `LH_PRUEBA_CANDIDE_SIMULADO=1`, mock; si no, el real. Si falta una URL, el puerto real responde "sin configurar" y la página lo dice (no hay paso silencioso al mock).
- Las pantallas y rutas nunca importan `candide.ts` directo.
- **Variables nuevas** (todas solo del servidor, sin `NEXT_PUBLIC_`): `LH_PRUEBA_CANDIDE`, `LH_PRUEBA_CANDIDE_SIMULADO`, `LH_PRUEBA_CANDIDE_RPC` (opcional), `CANDIDE_BUNDLER_URL`, `CANDIDE_PAYMASTER_URL`, `CANDIDE_SPONSORSHIP_POLICY_ID` (opcional).
- <!-- arquitecto: alcance de las variables en Vercel --> **Alcance en Vercel:** las variables de Preview valen para **todos** los previews (incluidas las ramas de las noches). Por eso `LH_PRUEBA_CANDIDE`, `CANDIDE_BUNDLER_URL`, `CANDIDE_PAYMASTER_URL` y `CANDIDE_SPONSORSHIP_POLICY_ID` se cargan en Preview **solo para la rama** `agente/billeteras-candide-prueba` (Vercel permite variables por rama), nunca para todo Preview. Conviene que el proyecto de Candide sea solo de testnet, para que la clave no sirva en una red real. `LH_PRUEBA_CANDIDE_RPC` también se trata como secreta (los RPC pagos llevan la clave en la URL) y pasa por `sanear`.
- Todas las rutas: `dynamic = "force-dynamic"`, `Cache-Control: no-store`, 404 si no está habilitada, después super admin (como `exigirSuperAdmin` de `/api/personas`), después validación del cuerpo. Los errores de Candide se reducen a un mensaje sin URL (un `sanear()` puro, testeado).

### 8. Dependencias
- `abstractionkit`, **versión exacta** (0.4.3 o la última al implementar). Es la pieza central de ADR-011.
- `viem`, **versión exacta**, solo si `abstractionkit` no exporta lo necesario para codificar y decodificar ABI y para el hash EIP-712. Se usa solo en el servidor y en la lógica pura. Si `abstractionkit` alcanza, no se agrega.

### 9. Pruebas
- **Unitarias (Vitest, sin red):** `habilitada`, `passkey` (con un vector SPKI y una firma DER fijos), `eas` (UID del schema contra un valor calculado una vez y anotado; calldata), `politica` (casos que pasan y que no), `tiempos`, `sanear`, y las rutas con el puerto mock (404 apagada, 404 en Production, 403 sin super admin, 400 por política y por llave inválida).
- **e2e (Playwright, Chromium, local):** autenticador virtual de WebAuthn por CDP (`WebAuthn.addVirtualAuthenticator`, ctap2, internal, con verificación de usuario) y Candide simulado. Recorre los cinco pasos, corre axe y comprueba 404 para quien no es super admin. Contra un preview (`BASE_URL`) se salta si la página responde 404. <!-- arquitecto: el mock guarda estado en memoria --> El recorrido completo se salta **siempre** contra `BASE_URL`: el mock guarda el despliegue y las operaciones en la memoria del proceso, y en Vercel cada pedido puede caer en otra función, así que "enviada → incluida" y "Safe desplegada" no son confiables ahí. En un preview, el modo simulado sirve para mirar la página, no para probar el recorrido.
- **Manual (Gus):** guion con la testnet real en Safari (macOS o iOS) y Chrome.

## Risks / Trade-offs

- [La API de `abstractionkit` 0.4.x no coincide con los nombres de este documento] → el implementador se guía por los tipos instalados; si una pieza no existe (por ejemplo, la firma WebAuthn para Safe o el patrocinio), frena y lo reporta en lugar de escribir criptografía a mano.
- [Los agentes no tienen clave de Candide] → toda la verificación nocturna es con el mock. La prueba real queda en el guion de Gus y se anota en el PR como pendiente.
- [La passkey depende del dominio] → el guion fija una URL de preview estable.
- [Una Safe con una sola passkey y sin recuperación] → aceptable solo en testnet. Queda escrito como requisito de `billeteras-safe`.
- [Safari y `getPublicKey()`] → si falta, se reporta como resultado de la prueba y no se parchea en esta noche.
- [Abuso de la política de gas] → doble capa (panel y servidor) más super admin y Production apagada. El tope diario del panel limita el daño en testnet (de todas formas, sin plata real).
- <!-- arquitecto --> [Super admin "de prueba" en un preview] → si el preview tiene `LH_AUTH_PRUEBA=1` y un super admin `.test` en `LH_PERSONAS`, cualquiera que pase la protección de Vercel puede entrar como super admin con la cabecera de prueba y gastar el cupo. Se acepta en testnet; las variables por rama (decisión 7) lo limitan a un solo preview.
- <!-- arquitecto --> [La Safe 4337 no implementa EIP-1271] → la prueba lo distingue de una firma mala (decisión 6). Si pasa, la respuesta a ADR-012 es "no, con esta configuración", y la salida es la que ya prevé ADR-012 (afirmar en la cadena) o cambiar el fallback handler en `billeteras-safe`.
- <!-- arquitecto --> [La passkey y la dirección de la Safe quedan publicadas para siempre en la red de prueba] → son datos de Gus, en testnet, sin nada que los vincule a su nombre más que él mismo. Para `billeteras-safe` es un dato personal seudónimo que no se puede borrar de la cadena: entra en el inventario de datos y en el análisis de "borrar = anonimizar" (ADR-005).
- <!-- arquitecto --> [Alcance] → seis rutas, lógica pura, mock, adaptador real, página, e2e con autenticador virtual y guion es una noche llena. Orden obligatorio: pasos 1 a 4 de punta a punta (con e2e) antes de empezar el paso 5. Si no alcanza, se frena con los pasos 1 a 4 en verde y se reporta.

## Migration Plan

No hay datos ni migraciones. Para apagar la prueba, se borra `LH_PRUEBA_CANDIDE` en Vercel. Para retirarla después del reporte, un cambio aparte borra `app/netx/billetera-prueba/` y las rutas. `lib/integraciones/candide/` y `lib/billetera-prueba/` quedan como base para `billeteras-safe`.

## Open Questions

- ¿Gus tiene ya cuenta en dashboard.candide.dev? ¿El plan gratis pide clave también para testnet? (lo resuelve el guion).
- ¿El id de política de patrocinio hace falta en `abstractionkit` 0.4.x o alcanza con la política por defecto del proyecto?
- ¿Cuál es la versión del dominio EIP-712 de EAS en Base Sepolia? (se lee de `version()`; no se fija a mano).
