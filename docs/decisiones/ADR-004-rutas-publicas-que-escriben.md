# ADR-004 · Las rutas públicas que escriben se protegen sin base de datos hasta Neon, y los reportes sin cuenta viven solo en issues de un repo privado

- **Estado:** Propuesta
- **Fecha:** 2026-10-15
- **Cambio OpenSpec relacionado:** reportes-sin-cuenta

## Contexto
Gus quiere que cualquiera que pruebe la plataforma pueda reportar sin entrar. Es la primera ruta que **escribe en un servicio externo (GitHub) sin saber quién pide**. No tenemos base de datos ni almacenamiento compartido (llega con Neon, backlog L9), y en Vercel cada instancia tiene su propia memoria. Hay que decidir cómo se frena el abuso y dónde queda el email que deja una persona sin cuenta. Lo que se decida acá va a ser el molde para otras rutas públicas ("me interesa", pedidos de contacto, postulaciones).

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: reportar solo con cuenta | Sin riesgo nuevo | Quien prueba sin entrar no puede avisar; el pedido de Gus queda sin resolver |
| B · Sin base: tipo de contenido JSON + origen propio + tamaño + trampa + límite por IP en memoria (IPv6 por /64, hash con sal) | Sin dependencias ni cuentas nuevas; una noche; se reemplaza por L9 tocando un archivo (`lib/reportes/limite.ts`) | Límite de mejor esfuerzo: se reparte entre instancias y se esquiva cambiando de IP |
| C · B + captcha de terceros (Turnstile) | Frena bots de verdad | Un proveedor externo más que ve a cada visitante (dato personal), clave nueva, más fricción para el equipo |
| D · B + almacén compartido (Upstash/KV) | Límite igual en todas las instancias | Servicio y credencial nuevos que se tiran cuando llegue Neon |

Sobre dónde queda el email: (1) en el issue, con aviso antes de enviar; (2) no pedir email sin cuenta; (3) guardarlo aparte (no hay dónde hasta Neon).

## Decisión
**B, con el email en el issue (1)**, porque es la versión más chica que deja la puerta abierta: el límite vive en una sola función que L9 reemplaza por uno persistente, y si aparece spam real se suma C sin rehacer nada.

## Consecuencias
- Ganamos: reportes de cualquiera desde hoy, sin servicios nuevos, y un molde para las próximas rutas públicas.
- Aceptamos: alguien insistente puede crear bastantes issues antes de que lo frenemos; el corte de emergencia es quitar `REPORTES_GITHUB_TOKEN` en Vercel (corta también los reportes con cuenta).
- Aceptamos: el email de una persona sin cuenta vive en GitHub (un proveedor de afuera), fuera de "Mis datos"; borrarlo es borrar el issue a mano (editarlo deja el historial).
- **Condición:** el repo de los issues tiene que seguir siendo privado. Si se hace público, primero se mueven o borran los issues `sin-cuenta`.
- Revisar cuando: llegue Neon (L9), aparezcan más de 20 issues `sin-cuenta` basura en una semana, o antes de mostrar la plataforma fuera del equipo (R14).

## En palabras simples
Abrimos un buzón de quejas en la puerta, sin pedir documento. Para que nadie lo llene de papeles, el buzón solo acepta sobres de nuestro propio formulario, de tamaño normal, y unos pocos por persona cada rato. No es un candado perfecto (alguien muy insistente puede cambiar de "dirección"), pero alcanza para un prototipo interno. Si alguien deja su email, queda escrito en la carpeta del equipo en GitHub, que solo ve el equipo; por eso se le avisa antes de enviar.

Fuentes: `openspec/changes/reportes-sin-cuenta/` (proposal, design); GitHub Docs, "Rate limits for the REST API" (límites secundarios de creación de contenido), consultado el 15-oct-2026; Vercel Docs, "Request headers" (`x-forwarded-for` lo reescribe Vercel), consultado el 15-oct-2026.
