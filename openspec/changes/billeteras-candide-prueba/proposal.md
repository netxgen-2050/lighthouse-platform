# Proposal

## Why

ADR-009 (punto 2) dejó el proveedor de billeteras para una prueba de una noche en noviembre, con revisión el 15-nov-2026. ADR-011 (Propuesta, PR #105) propone Candide: una cuenta Safe por persona con una passkey como dueña, gas pagado por nosotros y todo lo de Candide detrás del servidor. ADR-012 (Propuesta) deja una pregunta abierta: ¿valida la firma de una Safe con passkey (EIP-1271) como constancia de EAS fuera de la cadena? Gus quiere probarlo ya, antes de aceptar los dos ADR y antes de especificar `billeteras-safe`.

Esta prueba recorre de punta a punta el camino "sin saber de cripto" de ADR-011 en una **red de prueba** (sin plata real, sin base de datos y sin nada visible para el resto). Al final, la prueba tiene que responder cuatro preguntas con datos: si la passkey anda en Safari y en Chrome, cuánto tarda cada paso, si la firma EIP-1271 sirve para EAS fuera de la cadena y qué falta para producción.

## What Changes

- **Red: Base Sepolia** (testnet de Base, chain id 84532). Tiene la verificación barata de passkeys (precompilado P-256, RIP-7212) y EAS ya instalado en direcciones fijas. Base es la red que nombra `NS_Tokenomics` (doc 04 §6), y Candide la soporta. Cambiar a OP Sepolia es cambiar un archivo de configuración (ver design).
- **Página interna `/netx/billetera-prueba`**, solo para el super admin. Está apagada por defecto: sin `LH_PRUEBA_CANDIDE=1` devuelve 404, y en Production siempre devuelve 404. El rail y `/netx` no la enlazan.
- **Paso 1 · passkey:** el botón "Usar tu huella o tu cara" crea una passkey (WebAuthn) en el navegador. La llave pública y el id de la credencial (datos públicos) se guardan solo en el navegador (`localStorage`). La llave privada nunca sale del dispositivo.
- **Paso 2 · dirección:** el servidor calcula la dirección de la Safe (con `abstractionkit`, la passkey como única dueña) y dice si ya está desplegada. La cuenta no se despliega hasta la primera operación.
- **Paso 3 · primera operación:** el servidor arma una UserOperation con el gas pagado por el paymaster de Candide. La operación despliega la Safe y emite **una constancia de EAS en la cadena** con un schema de prueba sin datos personales (`string prueba,uint64 creada_en`, "prueba de Candide"), con la propia Safe como destinataria. Si el schema todavía no está registrado, la misma operación lo registra antes. La persona firma con la passkey y el servidor la manda.
- **Paso 4 · estado:** la pantalla muestra la dirección, el estado ("sin desplegar", "enviada", "incluida", "falló"), los enlaces al explorador (Safe y transacción en Basescan, constancia en EASScan) y el tiempo de cada paso.
- **Paso 5 · firma fuera de la cadena (pregunta de ADR-012):** con la Safe ya desplegada, la passkey firma una constancia de EAS fuera de la cadena (EIP-712, mismo schema). El servidor pregunta a la Safe `isValidSignature` (EIP-1271) y muestra si es válida o no.
- **Todo lo que habla con Candide pasa por rutas del servidor** (`/api/netx/billetera-prueba/…`), que exigen super admin y la variable encendida. Las URL de bundler y paymaster llevan la clave y son secretas (ADR-011 punto 5). El navegador nunca manda datos de llamada: el servidor arma la operación y vuelve a validar la política antes de enviarla.
- **Política de gas en dos capas:** (a) en el panel de Candide, una política de patrocinio que solo cubre los contratos de EAS y de SchemaRegistry de Base Sepolia (la configura Gus); (b) en nuestro servidor, una validación que rechaza cualquier operación cuyas llamadas no vayan a esos dos contratos con esas dos funciones.
- **Modo simulado** (`LH_PRUEBA_CANDIDE_SIMULADO=1`): un adaptador sin red, para los e2e y para ver la página sin clave. La página lo dice con un aviso visible.
- **Guion manual** para Gus (`docs/guiones/billeteras-candide-prueba.md`): cómo crear la clave y la política en dashboard.candide.dev, cargarla en Vercel solo en Preview y Development, correr la prueba en Safari y Chrome, y la plantilla del reporte con las cuatro preguntas.

**Fuera de alcance:**
- **Recuperación con guardianes** (ADR-011 punto 3). Queda como **requisito obligatorio del cambio siguiente `billeteras-safe`** y de cualquier Safe en red real. En esta prueba, una Safe con una sola passkey se acepta porque está en testnet y no guarda nada de valor.
- Tabla `billeteras` en la base, migraciones y cualquier escritura en Neon.
- Vincular la Safe a `personas.id`, la billetera propia (caminos "Web3 con Safe" y "Web3 sin Safe" de ADR-011), SIWE.
- Red real (Base u Optimism mainnet), Semillas reales, constancias reales del producto ("nos conocemos", Genesis Presence), llave de NetX en un KMS.
- Elegir la red definitiva (D10 del backlog): esta prueba usa Base Sepolia solo para probar.
- Versión en inglés de la página (es interna, como `/netx`), enlace desde el rail o desde `/netx`.
- Aceptar ADR-011 o ADR-012: eso lo decide Gus con el reporte.

## Capabilities

### New Capabilities
- `billetera-prueba-candide`: página interna y rutas del servidor que crean una passkey, calculan la Safe, mandan la primera operación con gas pagado a EAS en Base Sepolia y prueban la firma EIP-1271 fuera de la cadena.

### Modified Capabilities

## Impact

- Código nuevo: `app/netx/billetera-prueba/`, `app/api/netx/billetera-prueba/` (rutas), `lib/integraciones/candide/` (tipos, puerto, mock, adaptador real, índice), `lib/billetera-prueba/` (lógica pura: passkey, política, armado de llamadas a EAS, tiempos) y sus tests, `e2e/billetera-prueba.spec.ts`.
- Dependencias nuevas: `abstractionkit` (versión exacta) y `viem` (versión exacta, solo para codificar llamadas y hashes EIP-712 si `abstractionkit` no alcanza).
- Configuración: `.env.example` (variables nuevas, sin valores), `playwright.config.ts` (enciende la página en modo simulado para el e2e local).
- Documentación: `docs/guiones/billeteras-candide-prueba.md`.
- Externo: cuenta de Candide (Gus), clave de testnet y política de patrocinio. Sin plata real.
- Revisión del agente arquitecto: obligatoria (integración externa, secretos y permisos).
