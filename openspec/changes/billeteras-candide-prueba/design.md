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

### 4. La política de gas, en dos capas
- **En Candide (Gus, en el panel):** una política de patrocinio para Base Sepolia que solo permite los contratos `EAS` y `SchemaRegistry`, con un tope diario bajo (por ejemplo 50 operaciones). Si el panel da un id de política, va en `CANDIDE_SPONSORSHIP_POLICY_ID` (opcional).
- **En nuestro servidor:** la función pura `validarPolitica(callData, red)` decodifica el `callData` de la Safe en sus dos formas (`executeUserOp` con una sola llamada, o `executeUserOp` con `delegatecall` a MultiSend con un lote). Acepta solo llamadas con valor 0 a `EAS.attest` o a `SchemaRegistry.register`, y como mucho dos. Cualquier otra forma, destino, selector, valor o `delegatecall` que no sea a MultiSend se rechaza. Tiene tests unitarios sin red.

### 5. Passkey en el navegador, sin librería nueva
- Crear: `navigator.credentials.create` con `pubKeyCredParams: [{ type: "public-key", alg: -7 }]` (ES256 = P-256), `authenticatorSelection: { residentKey: "preferred", userVerification: "required" }`, `rp.id` = host de la página y un `user.id` aleatorio (no el email ni el id de la persona). Tiene que llamarse directo desde el clic (Safari lo exige).
- Llave pública: `response.getPublicKey()` (SPKI DER) → `x`, `y` con una función pura que valida el prefijo SPKI de P-256 y el punto sin comprimir (`0x04`). Si `getPublicKey` no existe, la página dice que el navegador no se soporta (y queda anotado para el reporte), sin leer CBOR a mano.
- Se guarda en `localStorage` (`lh-prueba-candide`): `{ idCredencial, x, y, creadaEn }`. Son datos públicos. "Empezar de nuevo" borra la entrada (la passkey queda en el dispositivo; el guion explica cómo borrarla del llavero).
- **El rp id cambia con el dominio:** una passkey creada en un preview no sirve en otro preview. El guion usa siempre la URL fija de la rama.

### 6. Prueba EIP-1271 fuera de la cadena
- El servidor arma la constancia fuera de la cadena de EAS (tipado EIP-712 `Attest`, dominio `{ name: "EAS", version: <leída de EAS.version()>, chainId, verifyingContract: EAS }`) con el mismo schema, `recipient` = la Safe y `time` = ahora. Calcula su hash EIP-712 y el UID fuera de la cadena (fórmula de la versión 1 de EAS offchain).
- Como dueño de una Safe, la passkey no firma ese hash directo: firma el **hash de SafeMessage** (EIP-712 con el dominio de la Safe, `SafeMessage(bytes message)` con `message = abi.encode(hashConstancia)`), que es lo que verifica el `CompatibilityFallbackHandler` de la Safe. El servidor devuelve ese hash como `hashAFirmar`.
- `verificar-firma`: el servidor arma la firma de Safe con la firma WebAuthn y hace `eth_call` a `isValidSignature(bytes32 hashConstancia, bytes firma)` de la Safe desplegada. Resultado: `0x1626ba7e` = válida; cualquier otra cosa o un revert = no válida, con el detalle.
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
- Todas las rutas: `dynamic = "force-dynamic"`, `Cache-Control: no-store`, 404 si no está habilitada, después super admin (como `exigirSuperAdmin` de `/api/personas`), después validación del cuerpo. Los errores de Candide se reducen a un mensaje sin URL (un `sanear()` puro, testeado).

### 8. Dependencias
- `abstractionkit`, **versión exacta** (0.4.3 o la última al implementar). Es la pieza central de ADR-011.
- `viem`, **versión exacta**, solo si `abstractionkit` no exporta lo necesario para codificar y decodificar ABI y para el hash EIP-712. Se usa solo en el servidor y en la lógica pura. Si `abstractionkit` alcanza, no se agrega.

### 9. Pruebas
- **Unitarias (Vitest, sin red):** `habilitada`, `passkey` (con un vector SPKI y una firma DER fijos), `eas` (UID del schema contra un valor calculado una vez y anotado; calldata), `politica` (casos que pasan y que no), `tiempos`, `sanear`, y las rutas con el puerto mock (404 apagada, 404 en Production, 403 sin super admin, 400 por política y por llave inválida).
- **e2e (Playwright, Chromium, local):** autenticador virtual de WebAuthn por CDP (`WebAuthn.addVirtualAuthenticator`, ctap2, internal, con verificación de usuario) y Candide simulado. Recorre los cinco pasos, corre axe y comprueba 404 para quien no es super admin. Contra un preview (`BASE_URL`) se salta si la página responde 404.
- **Manual (Gus):** guion con la testnet real en Safari (macOS o iOS) y Chrome.

## Risks / Trade-offs

- [La API de `abstractionkit` 0.4.x no coincide con los nombres de este documento] → el implementador se guía por los tipos instalados; si una pieza no existe (por ejemplo, la firma WebAuthn para Safe o el patrocinio), frena y lo reporta en lugar de escribir criptografía a mano.
- [Los agentes no tienen clave de Candide] → toda la verificación nocturna es con el mock. La prueba real queda en el guion de Gus y se anota en el PR como pendiente.
- [La passkey depende del dominio] → el guion fija una URL de preview estable.
- [Una Safe con una sola passkey y sin recuperación] → aceptable solo en testnet. Queda escrito como requisito de `billeteras-safe`.
- [Safari y `getPublicKey()`] → si falta, se reporta como resultado de la prueba y no se parchea en esta noche.
- [Abuso de la política de gas] → doble capa (panel y servidor) más super admin y Production apagada. El tope diario del panel limita el daño en testnet (de todas formas, sin plata real).

## Migration Plan

No hay datos ni migraciones. Para apagar la prueba, se borra `LH_PRUEBA_CANDIDE` en Vercel. Para retirarla después del reporte, un cambio aparte borra `app/netx/billetera-prueba/` y las rutas. `lib/integraciones/candide/` y `lib/billetera-prueba/` quedan como base para `billeteras-safe`.

## Open Questions

- ¿Gus tiene ya cuenta en dashboard.candide.dev? ¿El plan gratis pide clave también para testnet? (lo resuelve el guion).
- ¿El id de política de patrocinio hace falta en `abstractionkit` 0.4.x o alcanza con la política por defecto del proyecto?
- ¿Cuál es la versión del dominio EIP-712 de EAS en Base Sepolia? (se lee de `version()`; no se fija a mano).
