# Guion: prueba de billeteras con Candide (Base Sepolia)

Para Gus. Cambio: `billeteras-candide-prueba` (`openspec/changes/billeteras-candide-prueba/`). La prueba responde cuatro preguntas para decidir ADR-011 (Safe con passkey y Candide) y ADR-012 (constancias de EAS). Todo pasa en una **red de prueba**: nada tiene valor y no se guarda nada en la base.

## 1. Crear la cuenta y la política en Candide

1. Entrá a dashboard.candide.dev (ya tenés cuenta) y creá un proyecto **solo de testnet**, para que la clave no sirva en una red real.
2. Sacá las dos URL de **Base Sepolia**: la del bundler y la del paymaster. Llevan la clave adentro: son secretas, no las pegues en el repo, en un PR ni en un chat.
3. Creá una política de patrocinio solo para estos dos contratos, con un tope diario bajo (por ejemplo 50 operaciones):
   - `EAS`: `0x4200000000000000000000000000000000000021`
   - `SchemaRegistry`: `0x4200000000000000000000000000000000000020`
4. Mirá en el panel qué filtra de verdad la política: para el paymaster, el destino de la operación es la propia Safe, así que puede no ver las llamadas de adentro. Además, la primera operación incluye dos llamadas que arma la librería (desplegar el verificador de la passkey y cambiar el dueño de la Safe): si el panel solo deja pasar EAS y el registro, tal vez haya que permitir también la fábrica del verificador. **Anotá qué pasó**: va al reporte. La política que garantiza el servidor es la nuestra (solo `attest` y `register`, esas dos llamadas exactas y nada más).
5. Si el panel te da un id de política, anotalo.

## 2. Cargar las variables en Vercel

Solo **Preview** y **Development**, y **no Production**. En Production la cargás vos cuando decidas pasarla, después de ver la prueba andar en dev; el agente no la carga.

En Preview, cargalas **solo para la rama** `agente/billeteras-candide-prueba` (Vercel permite variables por rama), no para todo Preview: las variables de Preview valen para todos los previews, incluidas las ramas de las noches.

| Variable | Valor |
|---|---|
| `LH_PRUEBA_CANDIDE` | `1` |
| `CANDIDE_BUNDLER_URL` | la URL del bundler (secreta) |
| `CANDIDE_PAYMASTER_URL` | la URL del paymaster (secreta) |
| `CANDIDE_SPONSORSHIP_POLICY_ID` | el id de la política, solo si el panel lo dio |
| `LH_PRUEBA_CANDIDE_RPC` | opcional; solo si el RPC público de Base Sepolia (`https://sepolia.base.org`) no alcanza (también es secreta si lleva clave) |

No cargues `LH_PRUEBA_CANDIDE_SIMULADO`: con eso la página no habla con Candide. Ninguna lleva `NEXT_PUBLIC_`. Después de cargarlas hay que volver a desplegar la rama.

## 3. Abrir la página

1. Abrí la URL fija de la rama `agente/billeteras-candide-prueba` (`scripts/preview-url.sh agente/billeteras-candide-prueba`) y entrá como super admin. Siempre la **misma URL**: una passkey creada en un preview no sirve en otro (depende del dominio).
2. Andá directo a `/netx/billetera-prueba`. No hay enlace desde ningún menú.
3. Si ves "Falta configurar Candide (ver el guion)", falta una de las dos URL o hay que volver a desplegar.

## 4. Correr los cinco pasos (Chrome y Safari)

Hacelo en **Chrome** y en **Safari** (macOS y, si podés, iPhone). En cada navegador, tocá "Empezar de nuevo" antes de arrancar y anotá los tiempos de la tabla "Tiempos".

1. **Passkey**: "Usar tu huella o tu cara". Se espera "Passkey creada". Si Safari no tiene `getPublicKey`, la página lo dice: es un resultado para el reporte, no se parchea.
2. **Dirección**: se muestra la dirección de la Safe ("Safe sin desplegar") y un enlace a Basescan.
3. **Primera operación**: "Hacer la primera operación". Firmás con la huella o la cara. Pasa por "Preparando", "Esperando tu firma", "Enviada" y "Incluida" (hasta 60 s; después dice "Todavía sin confirmación").
4. **Resultado**: abrí el enlace a la transacción en Basescan y el de la constancia en EASScan. Comprobá que el UID del schema `string prueba,uint64 creada_en` que muestra EASScan es `0xe67582ba0db910cb244964d59ca08869905d7c05575e047945f7a56b45e627a0` (es el que calcula el servidor; si no coincide, anotalo).
5. **Firma fuera de la cadena**: "Firmar una constancia fuera de la cadena". Resultados posibles: "Válida para la Safe (EIP-1271)"; "No válida" con el valor devuelto; "No válida" porque la Safe no responde EIP-1271 (con el fallback handler que lee del contrato), o "Sin respuesta del nodo". El tercero no es un error de la prueba: es una respuesta a la pregunta de ADR-012. Copiá el detalle técnico tal cual.

## 5. Después de la prueba

- Borrá la passkey de prueba del llavero ("Prueba Candide · NetX"): en macOS, Contraseñas; en Chrome, la configuración de contraseñas y passkeys. "Empezar de nuevo" solo olvida la passkey en la página, no en el dispositivo.
- Apagá la prueba: borrá `LH_PRUEBA_CANDIDE` en Vercel. Sin esa variable, la página y las rutas responden 404.

## Plantilla del reporte

**1. ¿Funcionó la passkey en Safari y en Chrome?**
- Chrome (versión, sistema):
- Safari macOS (versión):
- Safari iPhone (versión, si se probó):
- ¿`getPublicKey` disponible? ¿Algún error?

**2. ¿Cuánto tarda cada paso y en total?**

| Paso | Chrome | Safari |
|---|---|---|
| Crear la passkey | | |
| Preparar la operación | | |
| Firmar con la passkey | | |
| Esperar la inclusión | | |
| Total | | |

**3. ¿La firma de la Safe con passkey (EIP-1271) vale como constancia de EAS fuera de la cadena?**
- Resultado de la Safe (válida / no válida / no responde EIP-1271, con el valor y el fallback handler):
- Resultado del SDK de EAS: el SDK (`eas-sdk` 2.10.0, `dist/lib.commonjs/offchain/typed-data-handler.js`, `verifyTypedDataRequestSignature`) solo recupera una dirección ECDSA de la firma `{ v, r, s }`: **no acepta EIP-1271**. Confirmar con el resultado de la Safe: si es válida, la verificación estándar del SDK igual no la reconoce; la salida que prevé ADR-012 es afirmar en la cadena desde la Safe con gas pagado.

**4. ¿Qué falta para producción?** (lista precargada)
- Recuperación con guardianes (requisito obligatorio de `billeteras-safe`).
- Tabla `billeteras` y vínculo con `personas.id`; guardar la dirección en vez de recalcularla.
- Red real (decisión D10) y plan pago de Candide.
- Llave de NetX en un KMS y política de gas por persona.
- `rp id` fijo en el dominio definitivo antes de la primera Safe real (la passkey queda atada a su dominio para siempre).
- Versiones fijas de los contratos de Safe y del firmante WebAuthn; que el fallback handler soporte EIP-1271 si hace falta.
- Passkey y dirección como dato personal seudónimo en el inventario de datos (no se puede borrar de la cadena; análisis de "borrar = anonimizar", ADR-005).
- ¿Qué filtra de verdad la política del panel de Candide? (paso 1.4 de este guion)
- Otras observaciones:
