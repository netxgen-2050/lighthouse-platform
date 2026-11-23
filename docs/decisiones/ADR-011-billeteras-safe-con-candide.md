# ADR-011 · Cada persona tiene una cuenta inteligente Safe (con Candide) cuyo dueño es una passkey; el login sigue en Neon Auth y quien quiera experiencia web3 trae su billetera

- **Estado:** Propuesta
- **Fecha:** 2026-10-23
- **Revisión 2026-11-12 (solo referencia desde el 19-nov):** se estudió qué cambiaría si la tokenización fuera por Hadron (Tether). **No es una decisión:** Hadron fue una posibilidad que salió en una llamada y hoy está parada (Gus, 19-nov; R44 de Segunda revisión, backlog D44 abierto). Las reglas de este ADR no cambian. Ver la sección "Revisión del 12-nov-2026: Hadron (referencia)".
- **Nota 2026-11-19 sobre el login:** este ADR da por decidido Neon Auth, pero el login sigue abierto entre Privy y Neon Auth (R17 de Segunda revisión). La billetera **no necesita integrarse con el OAuth** de ninguno de los dos: la passkey no es un login y Candide no consume nuestro token. Se une por `personas.id`, que el servidor saca de la sesión, sea cual sea el proveedor. Si queda Privy, la opción B (Privy con cuentas Safe) vuelve a competir con la A.
- **Cambio OpenSpec relacionado:** ninguno todavía (`billeteras-safe` a especificar si se acepta). Completa el punto 2 de ADR-009 ("el proveedor de billeteras se elige en noviembre con una prueba"); no cambia el login de `login-neon-auth`.

## Contexto
ADR-009 separó el login (Neon Auth, ya decidido) de la billetera (a elegir en noviembre). En la consultoría del 23-oct-2026 con Bertrand (desarrollador web3) aparecieron tres requisitos nuevos:
1. **Cuenta inteligente, no billetera embebida simple.** Una cuenta inteligente (smart account, estándar ERC-4337; la más usada es Safe) es un contrato con dueños que se pueden cambiar. Si cambiamos de proveedor, se cambia el dueño y **la dirección se queda igual** (con sus Semillas y attestations). Una billetera embebida simple (EOA) es una llave: cambiar de proveedor obliga a mudar todo a otra dirección.
2. **Estándares, no lo propio:** login estándar (OAuth2/OpenID Connect, passkeys/WebAuthn) y componentes auditados.
3. **Que no se note el web3** para quien no sabe de cripto, pero **sin sacarle la opción** a quien sí quiere usar su billetera (decisión de Gus, 23-oct).

Gus prefiere Candide (23-oct). Este ADR lo compara con las alternativas y fija cómo se combina con Neon Auth.

## Lo que se verificó (23-oct-2026)
| Tema | Fuente | Dato |
|---|---|---|
| Qué es Candide | docs.candide.dev (`llms.txt`, AbstractionKit, passkeys, recovery, pricing) | SDK `abstractionkit` para cuentas Safe ERC-4337; dueño por passkey (WebAuthn: huella, cara o llave de seguridad); módulo de recuperación con guardianes; pago del gas por nosotros (paymaster "InstaGas"); bundler Voltaire de código abierto. **No da login ni sesiones**: solo la cuenta y la firma |
| Precio Candide | candide.dev/pricing | Starter gratis: 2.500 operaciones en red real **en total** (no por mes), 1.000 con gas pagado por nosotros, 2 redes, **testnet ilimitada**. Launch US$ 333/mes, Grow US$ 749/mes. Gas al costo, sin recargo |
| Quién es Candide | gov.optimism.io, propuesta RetroPGF | Equipo chico, sin capital de riesgo: subsidios de Optimism (~190k OP), Ethereum Foundation (US$ 75k, para Voltaire) y Gitcoin. Contratos auditados (Ackee, Nethermind, Certora), licencia GPL-3.0 |
| Privy | privy.io/pricing | Gratis hasta **499** usuarios activos por mes (antes 1.000); Core US$ 299/mes. Soporta cuentas Safe y Kernel con dueño rotable |
| Dynamic | dynamic.xyz/pricing y docs "bring your own auth" | **Sin plan gratis en producción**; Growth US$ 249/mes (5.000 usuarios). Usar nuestro login (JWT externo) es **solo Enterprise**, y no está confirmado que acepte las firmas EdDSA de Neon Auth |
| MetaMask Embedded (ex Web3Auth) | metamask.io/developer/embedded-wallets | Gratis hasta 1.000 billeteras activas por mes; pensado para billeteras embebidas |
| Pimlico | pimlico.io/pricing | Infraestructura ERC-4337 (bundler + paymaster), pago por uso, 10 % de recargo sobre el gas pagado en red real. Alternativa a la parte de infraestructura de Candide |
| Neon Auth | neon.com/docs/auth | Emite JWT verificable (JWKS en `/.well-known/jwks.json`, EdDSA, 15 min). Google y código por email sí; **passkeys no** en la versión administrada |

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| **A · Candide: Safe por persona, dueño = passkey, login en Neon Auth** | Estándar Safe (el más auditado); dirección estable aunque cambiemos de proveedor; testnet gratis e ilimitada; sin costo por usuario de login; bundler y paymaster intercambiables (ERC-7677) | Ellos no dan login: hay que unir sesión de Neon y passkey nosotros; passkey sola sin respaldo = cuenta perdida (hay que diseñar recuperación); plan gratis chico en red real (2.500 operaciones totales); equipo chico |
| B · Privy con cuentas Safe/Kernel | Login + billetera + cuenta inteligente integrados; ya está instalado | Vuelve a dejar la lista de personas en Privy (contra ADR-009); gratis solo hasta 499 usuarios; el dueño es una llave de Privy |
| C · Dynamic con ZeroDev | Muy completo, multicadena | Sin plan gratis; usar nuestro login exige Enterprise y no está probado con Neon Auth |
| D · MetaMask Embedded / Web3Auth | 1.000 billeteras gratis | Centrado en billetera embebida; cuenta inteligente como agregado; mismo problema de unir el login |
| E · No decidir hasta diciembre | Cero trabajo ahora | Igual que ADR-009 opción D: se elige con las Semillas encima |

## Decisión (propuesta)
**A · Candide**, probándolo en testnet (Base Sepolia u OP Sepolia, gratis) en la prueba de una noche de noviembre que ya prevé ADR-009. Reglas:
1. **El login no cambia:** Neon Auth (código por email y Google) según `login-neon-auth`. La passkey **no es un login**: solo firma lo que va a la blockchain. La única identidad sigue siendo `personas.id`.
2. **Tres caminos para la billetera, sin sacar ninguno** (decisión de Gus, 23-oct):
   - **Sin saber de cripto (por defecto):** al primer uso, la persona crea una passkey ("Usar tu huella o tu cara") y la plataforma calcula su Safe. No se despliega hasta su primera operación, y el gas lo pagamos nosotros.
   - **Web3 con Safe:** quien quiera conecta su billetera propia como dueña de su Safe.
   - **Web3 sin Safe:** quien prefiera usa directamente su dirección propia, vinculada con una firma que verifica el servidor (lo de ADR-009, punto 3).
3. **Nunca una Safe con una sola passkey y sin respaldo.** Candide lo desaconseja: si se pierde la passkey, se pierde la cuenta. Mínimo: módulo de recuperación con guardianes (por ejemplo, un guardián de NetX en el servidor más un segundo dispositivo o el guardián por email de Candide), con 2 de 3 firmas y una espera de al menos 2 días en la que la persona puede cancelar. El diseño exacto va en la spec.
4. **Tabla `billeteras` (amplía ADR-009, punto 2), un libro de solo agregar:** persona, dirección de la cuenta, red, tipo (`safe` | `propia`), dueño (`passkey` | `billetera-propia`), id de la credencial y llave pública de la passkey (son datos públicos; nunca la llave privada, que no sale del dispositivo), proveedor (`candide`), desplegada en, verificada en. Cambiar el dueño agrega una fila; la dirección no cambia.
5. **Todo pasa por el servidor:** la URL de la API de Candide lleva la clave adentro y es secreta. El servidor arma la operación, aplica la política de gas (limitada a nuestros contratos y al de EAS, ADR-012) y la manda. El navegador solo firma con la passkey.
6. **Una sola red EVM** para empezar, a elegir en la prueba entre Base y Optimism (baratas y con verificación barata de passkeys). Celo, si se confirma el vínculo con Grassroots Economics (NS_Tokenomics doc 04 §5).
7. **Salida:** si Candide desaparece o sube el precio, cambiamos bundler y paymaster (Pimlico o Voltaire propio). Las cuentas Safe y sus dueños no cambian.

## Consecuencias
- Ganamos: la dirección de cada persona es estable y nuestra, y no depende del proveedor. Es lo que más importa antes de emitir cualquier Semilla o attestation.
- Ganamos: no hay costo por usuario para entrar. Las pruebas son gratis en testnet, y en red real el gas de una operación en una L2 cuesta menos de un centavo.
- Ganamos: la persona sin cripto ve "usar tu huella", no "conectar billetera". La persona web3 conserva su camino.
- Aceptamos: unir sesión y passkey es trabajo nuestro, porque Candide no trae una guía para Next.js. Estimado: 2 a 3 noches entre billeteras, recuperación y política de gas, más la prueba de noviembre.
- Aceptamos: las passkeys se sincronizan dentro de Apple o de Google, pero no entre los dos. Para cambiar de ecosistema hay que agregar una segunda passkey como dueña.
- Riesgo: Candide es un equipo chico financiado con subsidios. Lo mitiga que todo es estándar y que el bundler es de código abierto.
- Riesgo: ningún proveedor de la lista pudo verificarse con Neon Auth en la práctica. Con Candide no hace falta, porque no consume nuestro JWT.
- **Revisar:** con el resultado de la prueba de noviembre (fecha de ADR-009: 15-nov-2026); si Candide cambia el plan gratis o los términos; antes de la primera operación en red real.

## Revisión del 12-nov-2026: Hadron (referencia)
> **19-nov-2026: esta sección es solo referencia.** Hadron fue una posibilidad, no una decisión, y está parada; la intuición de Gus (a confirmar) es que no se va a usar. Nada de lo que sigue se aplica a las reglas de arriba, y la prueba de billetera no depende del sandbox de Hadron. Queda escrito por si la opción vuelve.

**Contexto (12-nov).** Se planteó que lo tokenizable lo emitiera y operara **Hadron**, la plataforma de tokenización de Tether, con Gus a cargo de la UX (backlog D44, R44). Como la plata de las ventas la cobra NetXGen (R43), NetXGen sería el emisor en Hadron **[criterio]**.

**Lo que pide Hadron (documentación pública, consultada el 10-nov-2026):**
| Tema | Dato | Qué implica acá |
|---|---|---|
| Rol de Hadron | Solo da la tecnología. No custodia llaves y no hace el KYC ni el AML por el emisor (términos §3, §4.3) | El emisor (NetXGen) responde por el cumplimiento **[verificar]** |
| Autenticación | Par API-KEY + API-SECRET del emisor que firma cada pedido. Hay sandbox (`api.hadron-beta.tether.to`). Límite: 100 pedidos por minuto | Las claves van **solo en el servidor**, igual que la URL de Candide (regla 5) |
| Billetera de la persona | Dirección EVM `0x…` registrada como "external wallet", por defecto vía WalletConnect. La API **no pide prueba de titularidad** | La prueba la hacemos nosotros (firma verificada en el servidor) antes de registrar la dirección |
| Transferencias | Hadron devuelve un `rawTransaction` (from, to, data, nonce, gas, chainId) para que lo firme la billetera de la persona | Es el formato de una EOA. **Una Safe no lo firma tal cual**: hay que tomar `to` + `data` y mandarlos como operación de la Safe (UserOperation). No está documentado cómo Hadron registra después la transacción **[NC]** |
| Lista blanca | Contrato de permisos y alta de direcciones con propuesta multifirma | La dirección de una Safe se puede agregar aunque todavía no esté desplegada |
| KYC del inversor | `kyc/investor/initiate` devuelve un `kycUrl` del portal de cumplimiento de Hadron | Derivar al portal y guardar solo el resultado (Ley 25.326, R29) |
| Redes | Al lanzar: Ethereum, Avalanche y Liquid; una fuente agrega BSC y TON estaba anunciada **[S]**. Base y Optimism **no aparecen** **[NC]** | Choca con la regla 6 |

**Cambios a este ADR si se fuera por Hadron (no aplicados):**
1. **Regla 6:** la red ya no se elige entre Base y Optimism. Es la red donde el emisor emita en Hadron. Candide soporta Ethereum, Avalanche, BSC y Plasma (la red de Tether), entre otras.
2. **Adaptador de firma:** el servidor traduce el `rawTransaction` de Hadron a una operación de la Safe. El navegador sigue firmando solo con la passkey.
3. **Los tres caminos siguen.** El de "web3 sin Safe" (billetera propia por WalletConnect) es el que Hadron trae por defecto, así que sale casi sin trabajo.
4. **La prueba del 15-nov se hace en el sandbox de Hadron**, no solo en una testnet: una transferencia de punta a punta firmada desde una Safe con passkey. Si no anda, los planes B son, en orden: una Safe cuya dueña sea una EOA, o una billetera embebida EOA (Privy) solo para los activos de Hadron.
5. **Riesgo nuevo:** si Hadron pide mensajes firmados, una Safe con passkey firma con EIP-1271 + WebAuthn, y muchos servidores solo verifican firmas de EOA. Hay que preguntarlo.

**Preguntas para Hadron (vía Juanpi, solo si la opción vuelve):**
- ¿En qué red se emitiría el activo? ¿Hay Base, Optimism o Plasma?
- ¿Aceptan billeteras de contrato (Safe, ERC-4337) como billetera del inversor? ¿Verifican firmas EIP-1271?
- ¿Cómo se informa la transacción firmada (hash, `PATCH /transactions`)?
- ¿De dónde sale el token `bearerAuth` de las Client APIs? ¿El flujo del inversor puede ser todo marca blanca, o necesita una cuenta en Hadron?
- ¿Quién es responsable de los datos del portal de KYC? ¿Tienen PSAV o un socio registrado en Argentina?

## En palabras simples
Para entrar a la plataforma seguís usando tu email o Google, como ya estaba decidido. Lo nuevo es la "cuenta" donde van a quedar tus Semillas y tus constancias: en vez de una llave que guarda una empresa, es una caja fuerte (Safe) que se abre con tu huella o tu cara. Si perdés el teléfono, hay un mecanismo de recuperación con espera. Si un día cambiamos de proveedor, la caja fuerte es la misma: solo cambia quién tiene la llave. Y si Ana ya usa MetaMask, puede usar la suya.

## Fuentes (consultadas el 23-oct-2026)
- Candide: `docs.candide.dev/llms.txt`, `/wallet/abstractionkit/introduction`, `/wallet/plugins/passkeys`, `/wallet/plugins/recovery-with-guardians`, `/wallet/guides/authentication`, `/wallet/guides/send-gasless-tx`, `/wallet/api/supported-networks`, `/wallet/pricing`; `candide.dev/pricing`; `github.com/candidelabs/candide-contracts`.
- Privy: `privy.io/pricing`, `docs.privy.io/guide/react/wallets/smart-wallets`, `docs.privy.io/wallets/wallets/export`.
- Dynamic: `dynamic.xyz/pricing`, `dynamic.xyz/docs/overview/authentication/bring-your-own-auth`.
- MetaMask Embedded Wallets: `metamask.io/developer/embedded-wallets`. Pimlico: `pimlico.io/pricing`.
- Neon Auth: `neon.com/docs/auth/guides/plugins/jwt`, `/auth/migrate/from-stack-auth`.
- Consultoría con Bertrand, 23-oct-2026 (nota en `NS_platform/Documentation/reuniones/`).
- Revisión del 12-nov (consultado el 10-nov-2026): Hadron API `api-docs.hadron.tether.to` (`llms.txt`, `/docs/requirements-and-limitations`, `/docs/authenticated-endpoints`, `/docs/roles`, `/reference/post_integrations-users-wallets`, `/reference/posttokenclienttransfer`, `/reference/postpermissioncontrolwhitelistuser`, `/reference/post_kyc-investor-initiate`, `/reference/post_transaction`, `/reference/getblockchainsall`); términos `hadron.tether.to/en/terms-of-use`; redes al lanzamiento según CoinDesk y Blockhead (nov-2024); `docs.candide.dev/wallet/api/supported-networks`.
