# ADR-032 · Ver y borrar lo propio pide sesión, no consentimiento

- **Estado:** Propuesta
- **Fecha:** 2026-11-25
- **Cambio OpenSpec relacionado:** lotes-en-la-base

## Contexto
ADR-005 dice que toda ruta que escribe a nombre de una persona llama antes a `exigirConsentimiento`. Hasta hoy las únicas excepciones eran `/api/consentimientos` y `/api/sesion`. Con `lotes-en-la-base` aparecen datos de la persona en la base (reservas, contactos, bitácora y origen) y la persona tiene que poder descargarlos y borrarlos desde Mis datos. Si esas rutas exigieran consentimiento vigente, alguien con la política vencida (salió una versión nueva) o que ya la retiró no podría ver ni borrar lo que hay de ella. Borrar es, además, una escritura: agrega `deshace` al libro de reservas.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada: Mis datos también exige consentimiento | Una sola regla, sin excepciones | Ver y borrar lo propio queda condicionado a aceptar la política de nuevo; contradice el sentido de los derechos de acceso y supresión (Ley 25.326, arts. 14 y 16) **[verificar]** |
| B · Una ruta de derechos, `/api/mis-datos/actividad`, con sesión y sin consentimiento: `GET` descarga y `DELETE` borra lo propio; pasa por `moldeDeEscritura` (JSON y `Origin` propio) | Los derechos no dependen de aceptar; una sola ruta que revisar; la lista de excepciones sigue siendo corta | Una excepción más a ADR-005, que hay que vigilar para que no crezca |
| C · Que cada ruta de recurso (`/api/lotes/reservas`, `/api/contactos`, `/api/bitacora`) acepte leer y borrar sin consentimiento | No suma rutas | La excepción se reparte por todas las rutas y es fácil equivocarse en una; las pantallas no la necesitan |

## Decisión
**B.** Ver y borrar lo propio son derechos de la persona, no usos de la plataforma. Concentrarlos en una ruta deja la regla de ADR-005 intacta para todo lo demás ("¿esta ruta llama a `exigirConsentimiento`? Si no, ¿es `/api/consentimientos`, `/api/sesion` o `/api/mis-datos/actividad`?").

## Consecuencias
- Ganamos: Mis datos funciona aunque la política esté vencida o retirada, y la descarga sale de una sola llamada (si falla, todo sale "sin dato").
- Aceptamos: esta ruta escribe sin consentimiento (el `deshace` y el borrado de contactos). Solo puede quitar o liberar, nunca agregar algo nuevo de la persona.
- Aceptamos: el `DELETE` necesita el chequeo de `Origin` igual que un `POST`, porque con Neon Auth la sesión va en una cookie.
- Gus decidió el 25-nov que al borrar se conserva la bitácora, como constancia **[verificar con abogado]**. El `DELETE` libera los lotes, borra los contactos y el origen, y no toca la bitácora.
- Revisar cuando: se abra la plataforma fuera del equipo (R14 y R29: anonimizar la cuenta), o si aparece otra ruta que quiera saltarse el consentimiento.

## En palabras simples
Para usar la plataforma hay que aceptar la política. Pero ver qué datos tuyos tenemos y pedir que los borremos no es "usar la plataforma": es un derecho. Por eso, desde Mis datos, podés descargar y borrar tus reservas, tus consultas y tu origen (la bitácora de qué textos legales se te mostraron se conserva como constancia) aunque todavía no hayas aceptado la versión nueva de la política. Esa puerta solo sirve para ver y borrar lo tuyo; para reservar o consultar seguís necesitando haber aceptado.

## Fuentes
- `docs/decisiones/ADR-005-consentimiento-antes-de-la-identidad.md` y `ADR-001-modelo-de-datos-hibrido.md` (borrar en un libro es anonimizar).
- `openspec/changes/lotes-en-la-base/` (design §3, specs `contactos-registro`, `lotes-reservas-registro` y `bitacora-registro`), leído el 25-nov-2026.
- `app/api/consentimientos/route.ts` (comentario con las rutas que no exigen consentimiento) y `lib/sesion/molde-escritura.ts`.
- Ley 25.326, arts. 14 (acceso) y 16 (supresión y conservación por obligación legal): **[verificar con abogado]**.
