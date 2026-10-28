# ADR-013 · UnityHub es la capa de comunicación y convocatoria (red, chat, calendario, docs); NetX sigue siendo la casa de la identidad, los pactos, las Semillas, las constancias, la gobernanza y la plata

- **Estado:** Propuesta
- **Fecha:** 2026-10-23
- **Cambio OpenSpec relacionado:** ninguno por ahora (experimento sin código de integración). Se apoya en ADR-009 (la identidad es nuestra), ADR-005 (consentimiento antes de la identidad), ADR-012 (constancias con forma de EAS) y en la skill `integracion-externa`.

## Contexto
El primer alcance acordado con UnityHub era vender y hacer check-in del Congreso de febrero de 2027. **El Congreso se canceló** (llamada del 23-oct-2026 con Bart, Jono y Josu). En la misma llamada, UnityHub propuso otro primer paso:
- un **espacio de red** para las ~1.000 ha, con un mapa donde la zona que arranca (las 36 ha) está activa y las otras 11 aparecen en gris;
- dentro de esa zona, un espacio de comunidad con chat, calendario, eventos, docs y tableros, con permisos por rol;
- integrar después por API lo que NetX ya tiene, en lugar de reconstruirlo.

UnityHub ya tiene funcionando mucho de lo que NetX no conviene construir desde cero (chat, calendario, eventos con QR, docs). Pero su producto se superpone con el nuestro (perfiles "qué traigo / qué necesito", matching, membresías, mapa), y si no se reparte explícitamente quién hace qué, la comunidad queda dividida entre dos apps.

## Lo que se verificó (23-oct-2026)
Fuente: archivos públicos de `app.unityhub.life` (rutas `.well-known`, listado de herramientas del MCP, términos y privacidad) y el sitio `unityhub.life`. Análisis completo en `NS_platform/Documentation/integraciones/UnityHub/05 - Análisis de la estrategia de integración (2026-10-23).md`.
- **Servidor MCP con 85 herramientas.** Usa OAuth 2.1 o un token personal, y actúa **con todos los permisos del usuario**: no hay modo solo lectura.
- **No hay API pública ni webhooks.** Su presentación a inversores los anuncia para octubre-noviembre de 2026.
- **Asistentes y check-ins: no se pueden leer.**
- **Exportación de datos: existe** (Manage → Data, en CSV: miembros, posts, bases, tablero, miembros pagos). Los asistentes y check-ins de un evento se exportan en CSV desde la app, no por API. En espacios privados ni los admins de UnityHub leen el contenido (guía del producto, consultada por el MCP el 23-oct).
- **Login:** email o Google. "UnityHub ID" es una credencial verificable (sd-jwt / OID4VCI), sin blockchain.
- **Términos bajo ley de Perú.** La privacidad no dice la región de alojamiento ni de quién son los datos de la comunidad.
- **Empresa:** pre-seed, 3 fundadores, una sola persona escribió todo el código.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No usar UnityHub | Cero dependencia | Construir chat, calendario y eventos nosotros, con un equipo chico y código hecho con IA (riesgo de que se rompa) |
| **B · UnityHub como capa de comunicación y convocatoria; NetX como casa del valor** | Aprovechamos lo que ya funciona; experimento barato y reversible; sirve para salir al mercado con eventos de comunidad sin el Congreso | Dos apps para la persona; hay que cuidar no duplicar funciones ni datos |
| C · Mudar la comunidad entera a UnityHub (perfiles, tribus, matching, membresías) | Una sola app de comunidad | La lista de personas deja de ser nuestra (contra ADR-009); datos personales en un proveedor sin región declarada; ley de Perú; dependemos de una sola persona |

## Decisión (propuesta)
**B.** Reparto:

| Pieza | Manda | Notas |
|---|---|---|
| Identidad, consentimiento, perfil NetX, tribus, pactos, Semillas, constancias (EAS), gobernanza (Fogón), plata e inversión | **NetX** | ADR-005, 009, 011, 012 |
| Red y mapa de difusión, chat, calendario, convocatoria a eventos, docs y tableros de trabajo | **UnityHub** | Nada con valor ni datos sensibles |
| Presencia en un evento | **Hecho** en UnityHub (check-in con QR) que llega a NetX por el **CSV de check-in que carga el anfitrión** (hoy) o por API/webhook (cuando exista); o confirmación del anfitrión **en NetX** → la **constancia** la emite NetX | ADR-012 |
| Membresías y cobros | NetX deriva al receptor legal (pregunta 23 del abogado, NS_Tokenomics doc 27) | No se cobra por UnityHub nada que se parezca a una inversión |

Reglas:
1. **Primero sin código.** El espacio de red se usa a mano (Josu lo arma y Gus lo administra). El enlace "Sumate en NetX" lleva a la plataforma.
2. **Ningún dato personal de NetX se copia a UnityHub,** ni por el MCP ni a mano, mientras no haya un acuerdo de tratamiento de datos y una región de alojamiento conocida (Ley 25.326).
3. **No se integra por el MCP en producción.** El MCP es para que Gus y sus agentes trabajen. Una integración real espera una credencial de servidor **de solo lectura** o la API v1 (skill `integracion-externa`). Los agentes de la noche nunca usan el MCP ni credenciales reales.
4. **Funciones que se superponen** (matching, perfiles con servicios, membresías): NetX no las duplica en UnityHub ni al revés. La decisión se toma caso por caso con un ADR.
5. **Salida:** si UnityHub no prospera, la red se reemplaza por otra herramienta de comunidad sin tocar NetX, porque nada de valor vive ahí.

## Consecuencias
- Ganamos: convocatoria y comunicación ya funcionando para los eventos de comunidad que reemplazan al Congreso, sin construirlas.
- Ganamos: el alcance de NetX se achica a lo que lo diferencia, y queda menos código para mantener.
- Aceptamos: dos lugares para la persona (UnityHub para charlar y enterarse, NetX para comprometerse y aportar). Hay que contarlo bien en la experiencia de usuario.
- Riesgo: que la comunidad se quede en UnityHub y nunca pase a NetX. La mitigación es que todo lo que da derechos (Semillas, constancias, voz en el Fogón) vive solo en NetX.
- Riesgo: continuidad de un proveedor pre-seed con una sola persona técnica; comisiones de 5 a 10 % desde noviembre de 2026. Mitigación: nada de valor vive ahí.
- Riesgo de reputación: el marketplace de UnityHub lista ceremonias (ayahuasca, San Pedro). Lighthouse no debería aparecer asociado a eso de cara a inversores en Argentina. Hay que pedir que la red de Lighthouse no muestre ese catálogo.
- **Revisar:** cuando UnityHub publique API v1 y webhooks; si aceptan los pedidos de `06 - Pedidos a Josu`; si cambian sus términos o su precio; antes de mostrar la red fuera del equipo.

## En palabras simples
UnityHub va a ser la plaza del pueblo: ahí se charla, se arman los encuentros y se ve el mapa de lo que viene. NetX es el registro del pueblo: ahí quedan tus acuerdos, lo que aportaste, tus Semillas y tu voz. Si Martín organiza una charla de permacultura, la convoca en UnityHub; si Ana se compromete a cuidar la huerta, ese pacto vive en NetX. Si un día cambiamos de plaza, el registro no se pierde.

## Fuentes (consultadas el 23-oct-2026)
- `app.unityhub.life/connect-ai`, `/.well-known/oauth-authorization-server`, `/.well-known/openid-credential-issuer`, `/privacy`, `/terms`; listado `tools/list` del MCP (`app.unityhub.life/mcp`); `unityhub.life`.
- Llamada NetX × UnityHub del 23-oct-2026 (nota en `NS_platform/Documentation/integraciones/UnityHub/`).
- `NS_platform/Documentation/integraciones/UnityHub/` notas 00 a 04 y reuniones del 7, 9 y 14-oct.
