# Spec Delta

## Purpose

Prueba interna, en una red de prueba, del camino "sin saber de cripto" de ADR-011: passkey como dueña de una cuenta Safe de Candide, primera operación con gas pagado que emite una constancia de EAS, y verificación de la firma EIP-1271 fuera de la cadena que pide ADR-012.

## ADDED Requirements

### Requirement: La prueba está apagada por defecto y nunca corre en Production
La página `/netx/billetera-prueba` y sus rutas del servidor SHALL existir solo si `LH_PRUEBA_CANDIDE` vale `1` y el entorno no es Production. En cualquier otro caso MUST responder 404, como si no existieran. Ningún enlace del rail ni de otras páginas MUST apuntar a ella.

#### Scenario: Variable apagada
- **WHEN** `LH_PRUEBA_CANDIDE` está vacía o vale otra cosa que `1`
- **THEN** `GET /netx/billetera-prueba` responde 404 y cada ruta `/api/netx/billetera-prueba/…` responde 404

#### Scenario: Production
- **WHEN** `VERCEL_ENV` es `production`, aunque `LH_PRUEBA_CANDIDE` valga `1`
- **THEN** la página y las rutas responden 404

#### Scenario: Nada visible para el resto
- **WHEN** la prueba está encendida y alguien recorre el rail o `/netx`
- **THEN** no hay ningún enlace a `/netx/billetera-prueba`

### Requirement: Solo el super admin usa la prueba
Con la prueba encendida, la página SHALL mostrar el contenido solo al super admin. Las rutas del servidor MUST verificar en el servidor que la sesión es de un super admin y rechazar al resto con 401 o 403, sin llamar a Candide.

#### Scenario: Persona sin rol de super admin
- **WHEN** una persona con rol `persona` o `admin-tribu` abre la página
- **THEN** ve "No tenés acceso a esta vista" y ningún botón de la prueba

#### Scenario: Ruta llamada sin ser super admin
- **WHEN** una sesión que no es de super admin llama a cualquier ruta de la prueba
- **THEN** la ruta responde 403 (o 401 sin sesión) y no hace ningún pedido a Candide ni a la red

### Requirement: La página dice qué es y que no tiene valor
La página SHALL mostrar el aviso "Prototipo interno · datos de ejemplo", el nombre de la red de prueba ("Base Sepolia, red de prueba: nada de esto tiene valor") y, en modo simulado, el aviso "Modo simulado: no se habla con Candide ni con la red".

#### Scenario: Avisos visibles
- **WHEN** el super admin abre la página encendida
- **THEN** ve el aviso de prototipo y el de red de prueba, y hay un solo `<main>`

#### Scenario: Aviso de modo simulado
- **WHEN** `LH_PRUEBA_CANDIDE_SIMULADO` vale `1`
- **THEN** la página muestra "Modo simulado: no se habla con Candide ni con la red"

### Requirement: Falta de configuración se dice, no se simula
Si la prueba está encendida en modo real y falta la URL del bundler o la del paymaster, la página SHALL decir "Falta configurar Candide (ver el guion)" y desactivar los pasos que hablan con Candide. MUST NOT pasar sola al modo simulado.

#### Scenario: Sin clave de Candide
- **WHEN** la prueba está encendida, no está en modo simulado y falta `CANDIDE_BUNDLER_URL` o `CANDIDE_PAYMASTER_URL`
- **THEN** la página muestra "Falta configurar Candide (ver el guion)" y el botón de la primera operación está deshabilitado

### Requirement: Crear la passkey en el navegador
El botón "Usar tu huella o tu cara" SHALL crear una passkey WebAuthn (curva P-256, verificación de usuario requerida) para el dominio de la página. La llave pública y el id de la credencial SHALL guardarse solo en el navegador; la llave privada MUST NOT salir del dispositivo y nada de la passkey MUST guardarse en la base.

#### Scenario: Passkey creada
- **WHEN** el super admin toca "Usar tu huella o tu cara" y confirma en su dispositivo
- **THEN** la página muestra "Passkey creada" con el tiempo que tardó y pasa al paso de la dirección

#### Scenario: La persona cancela o el navegador no soporta passkeys
- **WHEN** la persona cancela el diálogo o el navegador no ofrece WebAuthn
- **THEN** la página dice "No se creó la passkey" con el motivo en palabras simples y deja reintentar, sin guardar nada

#### Scenario: Volver a la página
- **WHEN** el super admin vuelve a abrir la página en el mismo navegador
- **THEN** la página reconoce la passkey guardada y ofrece "Empezar de nuevo" para olvidarla

### Requirement: Calcular la dirección de la Safe sin desplegarla
Con la llave pública de la passkey, el servidor SHALL calcular la dirección de una cuenta Safe cuyo único dueño es esa passkey, e informar si ya está desplegada. Calcular la dirección MUST NOT mandar ninguna operación ni gastar gas.

#### Scenario: Dirección de una passkey nueva
- **WHEN** el navegador manda la llave pública de una passkey recién creada
- **THEN** el servidor devuelve la dirección de la Safe y el estado "sin desplegar", y la página muestra la dirección completa, su versión abreviada y el enlace a la dirección en el explorador de Base Sepolia

#### Scenario: Misma passkey, misma dirección
- **WHEN** el navegador manda dos veces la misma llave pública
- **THEN** el servidor devuelve las dos veces la misma dirección

#### Scenario: Llave pública inválida
- **WHEN** el navegador manda una llave que no es un punto válido de P-256
- **THEN** el servidor responde 400 "Llave pública inválida" sin llamar a Candide

### Requirement: La primera operación despliega la Safe y emite una constancia de prueba con gas pagado
El servidor SHALL armar una UserOperation que despliega la Safe y llama a `attest` del contrato de EAS de Base Sepolia con el schema de prueba (sin datos personales; la destinataria es la propia Safe), y SHALL pedir al paymaster de Candide que pague el gas. Si el schema no está registrado, la operación SHALL registrarlo antes, en la misma operación.

#### Scenario: Operación preparada
- **WHEN** el super admin toca "Hacer la primera operación"
- **THEN** el servidor devuelve la operación con el gas patrocinado y el hash a firmar, y la página pide la passkey para firmarlo

#### Scenario: Firmada y enviada
- **WHEN** la persona firma con la passkey
- **THEN** el servidor arma la firma de la Safe, manda la operación al bundler y la página pasa a "Enviada" con el hash de la operación

#### Scenario: Incluida en un bloque
- **WHEN** el bundler confirma que la operación entró en un bloque y fue exitosa
- **THEN** la página muestra "Incluida", el enlace a la transacción en Basescan, el enlace a la constancia en EASScan y "Safe desplegada"

#### Scenario: El paymaster no la patrocina o el bundler la rechaza
- **WHEN** Candide rechaza la operación (por política, por clave o por un error)
- **THEN** la página muestra "Falló" con el motivo que devolvió Candide (sin la URL ni la clave) y deja reintentar

#### Scenario: Schema ya registrado
- **WHEN** el schema de prueba ya existe en el registro de EAS
- **THEN** la operación solo llama a `attest`, sin volver a registrar

### Requirement: El servidor solo patrocina llamadas permitidas
Antes de pedir patrocinio y otra vez antes de enviar, el servidor SHALL validar que cada llamada de la operación vaya al contrato de EAS (función `attest`) o al de SchemaRegistry (función `register`) de la red configurada, sin valor en ETH. Si no cumple, MUST rechazarla con 400 sin mandarla a Candide. El navegador MUST NOT poder elegir destino ni datos de llamada.

#### Scenario: Operación alterada en el navegador
- **WHEN** el navegador devuelve para enviar una operación cuyas llamadas apuntan a otro contrato, a otra función o llevan valor
- **THEN** el servidor responde 400 "La operación no cumple la política de gas" y no llama al bundler

#### Scenario: Operación armada por el servidor
- **WHEN** la operación es la que armó el servidor para la primera constancia
- **THEN** la validación de la política la acepta

### Requirement: Lo de Candide pasa solo por el servidor
Las URL de bundler y paymaster (que llevan la clave) SHALL leerse solo en el servidor. MUST NOT aparecer en el código del navegador, en respuestas de la API, en mensajes de error ni en los logs.

#### Scenario: Respuesta de error
- **WHEN** Candide responde con un error
- **THEN** la respuesta de nuestra ruta y el log contienen el motivo pero no la URL ni la clave

#### Scenario: Código del navegador
- **WHEN** se construye la app
- **THEN** ninguna variable de Candide lleva el prefijo `NEXT_PUBLIC_` y el navegador solo habla con `/api/netx/billetera-prueba/…`

### Requirement: Estado y tiempos visibles
La página SHALL mostrar el estado de la Safe y de la operación ("sin desplegar", "preparando", "esperando tu firma", "enviada", "incluida", "falló") en texto, no solo con color, y el tiempo de cada paso en segundos. Un tiempo que no se midió MUST mostrarse como "sin dato".

#### Scenario: Tiempos al final
- **WHEN** la operación quedó incluida
- **THEN** la página muestra el tiempo de crear la passkey, preparar, firmar y esperar la inclusión, y el total

#### Scenario: Paso no hecho
- **WHEN** un paso todavía no se hizo
- **THEN** su tiempo dice "sin dato", nunca 0

### Requirement: Probar la firma EIP-1271 como constancia de EAS fuera de la cadena
Con la Safe desplegada, el botón "Firmar una constancia fuera de la cadena" SHALL hacer que la passkey firme una constancia de EAS fuera de la cadena (EIP-712, mismo schema, sin datos personales). El servidor SHALL preguntar a la Safe con `isValidSignature` (EIP-1271) y la página SHALL mostrar "Válida para la Safe" o "No válida", con el detalle técnico.

#### Scenario: Safe sin desplegar
- **WHEN** la Safe todavía no está desplegada
- **THEN** el botón está deshabilitado con el texto "Primero hacé la primera operación"

#### Scenario: Firma verificada
- **WHEN** la passkey firma la constancia y la Safe responde el valor mágico de EIP-1271
- **THEN** la página muestra "Válida para la Safe (EIP-1271)" y el UID calculado de la constancia fuera de la cadena

#### Scenario: Firma no aceptada
- **WHEN** la Safe no devuelve el valor mágico
- **THEN** la página muestra "No válida" y el valor devuelto, para anotarlo en el reporte

### Requirement: Accesible y con teclado
Todos los pasos SHALL poder hacerse con teclado, los cambios de estado MUST anunciarse a lectores de pantalla y la auditoría de axe MUST pasar en la página.

#### Scenario: Auditoría de axe
- **WHEN** el e2e corre axe en la página encendida en modo simulado
- **THEN** no hay violaciones

#### Scenario: Estado anunciado
- **WHEN** la operación pasa de "enviada" a "incluida"
- **THEN** el cambio se anuncia en una región viva (`aria-live`)
