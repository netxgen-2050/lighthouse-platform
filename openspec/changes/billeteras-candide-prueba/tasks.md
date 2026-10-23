# Tasks

> Rama: `agente/billeteras-candide-prueba`. Antes de empezar: leer `proposal.md`, `design.md` y la spec. **Si una pieza de `abstractionkit` no existe o no se entiende con sus tipos, frenar y reportar**: no escribir criptografía a mano ni inventar respuestas de Candide. El grupo 7 (EIP-1271) es el último: si la noche no alcanza, se frena antes y se reporta qué quedó.

## 1. Dependencias y configuración

- [ ] 1.1 Agregar `abstractionkit` con versión exacta (`pnpm add abstractionkit@<versión> --save-exact`). Leer `node_modules/abstractionkit/README.md` y `dist/index.d.mts` y anotar en el PR los nombres reales de: crear la dirección de la Safe con un dueño WebAuthn, crear la UserOperation, patrocinarla con el paymaster de Candide, calcular el hash a firmar, armar la firma WebAuthn, formatearla (con el caso de inicialización), enviarla y esperar el recibo. **Verifica:** `pnpm verificar` en verde y la lista de nombres en el PR.
- [ ] 1.2 Solo si `abstractionkit` no alcanza para ABI y EIP-712: agregar `viem` con versión exacta y decir en el PR por qué. **Verifica:** el PR lo justifica, o no se agregó.
- [ ] 1.3 `.env.example`: agregar `LH_PRUEBA_CANDIDE`, `LH_PRUEBA_CANDIDE_SIMULADO`, `LH_PRUEBA_CANDIDE_RPC`, `CANDIDE_BUNDLER_URL`, `CANDIDE_PAYMASTER_URL` y `CANDIDE_SPONSORSHIP_POLICY_ID`, sin valores y con un comentario: solo Preview y Development, las URL llevan la clave y son secretas. **Verifica:** revisión del diff; ninguna variable con `NEXT_PUBLIC_`.

## 2. Lógica pura (`lib/billetera-prueba/`)

- [ ] 2.1 `red.ts`: Base Sepolia (chain id 84532, RPC por defecto con `LH_PRUEBA_CANDIDE_RPC` para reemplazarlo, `EAS` y `SchemaRegistry` en `0x4200…0021` y `0x4200…0020`, URLs de Basescan y EASScan de Sepolia). Confirmar las dos direcciones en la documentación de EAS y citar la fuente en un comentario. **Verifica:** test que arma las URLs del explorador para una dirección, una transacción y un UID.
- [ ] 2.2 `habilitada.ts`: `pruebaHabilitada(env)` → `true` solo con `LH_PRUEBA_CANDIDE === "1"` y `VERCEL_ENV !== "production"`; `modoSimulado(env)`. **Verifica:** tests con apagada, `"true"`, `"1"` y Production.
- [ ] 2.3 `passkey.ts`: SPKI DER de P-256 → `{ x, y }` (rechaza otro algoritmo o un punto comprimido); validar que `{ x, y }` es un punto de la curva; firma DER → `{ r, s }`; separar los campos de `clientDataJSON` que van después del challenge. **Verifica:** tests con un vector fijo generado una vez (se anota cómo se generó) y con entradas inválidas.
- [ ] 2.4 `eas.ts`: UID del schema `string prueba,uint64 creada_en` (sin resolver, revocable), calldata de `register` y de `attest` (destinataria = Safe, `prueba de Candide`, `creada_en`), tipado EIP-712 de la constancia fuera de la cadena y su UID. **Verifica:** tests; el UID del schema coincide con el que muestra EASScan al buscarlo (si no hay red, se anota en el PR como "a confirmar por Gus").
- [ ] 2.5 `politica.ts`: `validarPolitica(callData, red)` según design §4. **Verifica:** tests que aceptan `attest` solo y `register` + `attest` en lote, y que rechazan otro destino, otro selector, valor > 0, `delegatecall` que no sea a MultiSend, más de dos llamadas y callData basura.
- [ ] 2.6 `tiempos.ts` y `sanear.ts`: segundos con un decimal y "sin dato" para lo no medido (nunca 0); mensaje de error de Candide sin URL ni clave (quita cualquier `https://…` y parámetros de consulta). **Verifica:** tests.

## 3. Integración con Candide (`lib/integraciones/candide/`)

- [ ] 3.1 `tipos.ts` y `puerto.ts` en nuestro vocabulario: `calcularDireccion`, `estaDesplegada`, `schemaRegistrado`, `prepararPrimeraOperacion`, `enviarOperacion`, `consultarOperacion`, `prepararFirmaFuera`, `verificarFirma1271`, más un estado "sin configurar". **Verifica:** `pnpm verificar`.
- [ ] 3.2 `mock.ts`: sin red. La dirección se calcula igual que en el real (es sin red); el despliegue y el estado de las operaciones viven en memoria del proceso; los hashes son de ejemplo pero con forma válida; `consultarOperacion` devuelve "enviada" la primera vez e "incluida" la segunda; `verificarFirma1271` devuelve válida si la firma tiene forma correcta. Usa `validarPolitica` igual que el real. **Verifica:** tests del mock.
- [ ] 3.3 `candide.ts`: adaptador real con `abstractionkit`, según design §3 y §6. Lee las URL solo de `process.env` del servidor. Si falta una, devuelve "sin configurar". Pasa todo error por `sanear`. **Verifica:** `pnpm verificar`; no se puede probar sin clave, así que se marca en el PR "pendiente de prueba manual (guion)".
- [ ] 3.4 `index.ts`: elige mock o real según `modoSimulado` y lo anota una vez en el log ("Candide: modo simulado"), sin URLs. **Verifica:** test de la elección.

## 4. Rutas del servidor (`app/api/netx/billetera-prueba/`)

- [ ] 4.1 Una ayuda común: 404 si no está habilitada → super admin verificado en el servidor (como `exigirSuperAdmin` de `app/api/personas/route.ts`) → cuerpo validado. Todas con `force-dynamic` y `no-store`. **Verifica:** tests de ruta: 404 apagada, 404 en Production, 401 sin sesión, 403 con `persona`, y que en esos casos no se llama al puerto (espía en el mock).
- [ ] 4.2 `cuenta`, `preparar`, `enviar` y `operacion`, según design §3. `enviar` vuelve a validar la política y que `sender` sea la dirección de `{ x, y }`. **Verifica:** tests con el mock: recorrido completo; 400 "Llave pública inválida"; 400 "La operación no cumple la política de gas" con un callData alterado; 400 si `sender` no coincide.
- [ ] 4.3 `firma-fuera` y `verificar-firma` (design §6). Si la Safe no está desplegada, responden 409 "Primero hacé la primera operación". **Verifica:** tests con el mock.

## 5. Página `/netx/billetera-prueba`

- [ ] 5.1 `page.tsx` (server): `notFound()` si no está habilitada. Si está, `SoloSuperAdmin` con el cliente adentro. Pasa al cliente si está en modo simulado y si falta configuración. No se agrega a `lib/navegacion.ts` ni a `/netx`. **Verifica:** e2e (grupo 6) y búsqueda de `billetera-prueba` en `lib/navegacion.ts` y `app/netx/page.tsx` sin resultados.
- [ ] 5.2 `prueba-cliente.tsx`: avisos (prototipo, "Base Sepolia, red de prueba: nada de esto tiene valor", modo simulado y "Falta configurar Candide (ver el guion)"); paso 1 "Usar tu huella o tu cara"; paso 2 dirección completa y abreviada (`abreviarDireccion`) con enlace a Basescan; paso 3 "Hacer la primera operación" con sus estados en texto; paso 4 enlaces a la transacción y a la constancia y tabla de tiempos; paso 5 "Firmar una constancia fuera de la cadena" con el resultado; "Empezar de nuevo". Llama a la API con las cabeceras de sesión (como `components/sesion/panel-personas.tsx`). Estados en una región `aria-live="polite"`. Solo tokens del tema, sin colores sueltos y sin `<main>` propio. Consulta el estado cada 2 s, hasta 60 s; después dice "Todavía sin confirmación" con el enlace al explorador. **Verifica:** `pnpm verificar` (incluye el test de colores sueltos) y e2e.

## 6. e2e (`e2e/billetera-prueba.spec.ts`)

- [ ] 6.1 `playwright.config.ts`: agregar `LH_PRUEBA_CANDIDE: "1"` y `LH_PRUEBA_CANDIDE_SIMULADO: "1"` al `env` del servidor local. **Verifica:** el resto de los e2e sigue en verde.
- [ ] 6.2 Recorrido como super admin con el autenticador virtual de WebAuthn (CDP: `WebAuthn.enable` y `WebAuthn.addVirtualAuthenticator` con `ctap2`, `internal`, `hasResidentKey`, `hasUserVerification` e `isUserVerified`): passkey creada → dirección `0x…` (40 hex) → primera operación → "Incluida" con los dos enlaces → firma fuera de la cadena "Válida para la Safe (EIP-1271)" → tiempos sin "0 s" y con "sin dato" donde corresponda → "Empezar de nuevo". Todo con teclado (Tab y Enter). **Verifica:** `pnpm test:e2e e2e/billetera-prueba.spec.ts` en verde.
- [ ] 6.3 Persona sin rol de super admin: ve "No tenés acceso a esta vista"; `POST /api/netx/billetera-prueba/cuenta` responde 403. Avisos visibles, un solo `<main>`, axe sin violaciones. Contra `BASE_URL`, el archivo se salta si la página responde 404. **Verifica:** e2e en verde.

## 7. Firma EIP-1271 y EAS fuera de la cadena (pregunta de ADR-012)

- [ ] 7.1 Leer, sin instalarlo, el código de `verifyOffchainAttestationSignature` del SDK de EAS (`@ethereum-attestation-service/eas-sdk`, con `pnpm view` o el repositorio público) y anotar en el PR si acepta firmas EIP-1271 o solo ECDSA, con el archivo y la línea. **Verifica:** la nota en el PR, con la fuente.

## 8. Guion y cierre

- [ ] 8.1 `docs/guiones/billeteras-candide-prueba.md`, para Gus: (a) crear la cuenta y el proyecto en dashboard.candide.dev, sacar las URL de bundler y paymaster de **Base Sepolia** y crear la política de patrocinio solo para `EAS` y `SchemaRegistry` con un tope diario; (b) cargar `CANDIDE_BUNDLER_URL`, `CANDIDE_PAYMASTER_URL`, `CANDIDE_SPONSORSHIP_POLICY_ID` (si aplica) y `LH_PRUEBA_CANDIDE=1` en Vercel **solo en Preview y Development**, nunca en Production; (c) abrir la URL fija de la rama `agente/billeteras-candide-prueba` como super admin; (d) correr los cinco pasos en Chrome y en Safari (macOS y, si se puede, iPhone), tomando los tiempos de la tabla; (e) borrar la passkey de prueba del llavero; (f) apagar la prueba borrando `LH_PRUEBA_CANDIDE`. Termina con la **plantilla del reporte**: ¿funcionó la passkey en Safari y en Chrome?, ¿cuánto tarda cada paso y en total?, ¿la firma de la Safe con passkey (EIP-1271) valida como constancia de EAS fuera de la cadena (resultado de la Safe y del SDK, tarea 7.1)?, ¿qué falta para producción? (con la lista precargada: recuperación con guardianes, tabla `billeteras`, vínculo con `personas.id`, red real, plan pago de Candide, llave de NetX en KMS y política de gas por persona). **Verifica:** revisión del documento; ninguna clave ni URL con clave en el texto.
- [ ] 8.2 `pnpm verificar`, `pnpm build` y `pnpm test:e2e` en verde. PR a `dev` con `scripts/pr.sh`, que diga: la prueba real está pendiente del guion de Gus, la lista de nombres de `abstractionkit` (1.1) y la nota sobre el SDK de EAS (7.1). **Verifica:** los tres comandos en verde y el PR creado.
