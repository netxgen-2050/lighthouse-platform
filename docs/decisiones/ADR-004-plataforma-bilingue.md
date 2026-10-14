# ADR-004 · Toda la plataforma es bilingüe por preferencia (cookie y por persona), con `?lang=` para enlazar y diccionarios propios

- **Estado:** Propuesta
- **Fecha:** 2026-10-14
- **Cambio OpenSpec relacionado:** idioma-base (y los cambios por zona `idioma-*`)

## Contexto
Gus pidió toda la plataforma en español e inglés para inversores y miembros del exterior. El Congreso ya es bilingüe con su propia dirección `/congreso/en` y diccionarios propios (ADR-003), y esa dirección es una promesa pública. Hay que decidir ahora cómo se expresa el idioma en las direcciones del resto de la plataforma y con qué herramienta se manejan los textos, porque cada zona que se traduzca va a seguir esa forma y cambiarla después cuesta varias noches.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Prefijo `/en/...` en todas las páginas (por ejemplo con next-intl) | Una dirección por idioma; mejor para buscadores; cualquier página se enlaza en inglés | Mover todo `app/` a `app/[idioma]/`, reescribir enlaces, rutas públicas, permisos por ruta y e2e; varias noches que chocan con el resto del trabajo; casi todo pide sesión, así que los buscadores ganan poco |
| B · Parámetro `?lang=en` en todas las direcciones | Sin mover archivos | Hay que arrastrarlo en cada enlace; se pierde fácil |
| C · Solo preferencia guardada | Sin cambios de direcciones | No se puede mandar un enlace en inglés |
| D · Preferencia guardada (cookie del navegador y preferencia de la persona) + `?lang=` de un solo uso para enlazar | Direcciones iguales; enlace compartible (`/sumarte?lang=en`); cambio chico y reversible; `/congreso/en` sigue igual | Sin dirección propia por idioma fuera del Congreso; todas las páginas se arman en cada pedido porque el servidor lee la cookie |
| E · No hacer nada todavía (solo el Congreso en inglés) | Cero costo | El inversor del exterior entra al resto en español |

Para los textos: librería (next-intl, i18next, Lingui, Paraglide) o diccionarios propios tipados, como los del Congreso. Comparación completa en `openspec/changes/idioma-base/design.md` §2.

## Decisión
Opción D con diccionarios propios. Es la más chica que cumple el pedido, no mueve archivos, reutiliza lo que ya hizo el Congreso (un solo patrón para los agentes) y TypeScript obliga a que el inglés esté completo. `/congreso/en` se mantiene como la dirección pública del Congreso en inglés: con la preferencia en inglés, `/congreso` lleva a `/congreso/en`; la dirección explícita siempre gana.

## Consecuencias
- Ganamos inglés en toda la plataforma sin reordenar el código, zona por zona, con caída al español visible y tests que atrapan textos sin traducir.
- Aceptamos: páginas sin dirección propia en inglés (salvo el Congreso), renderizado por pedido en todas las páginas, y mantener unas 150 líneas propias en lugar de una librería.
- Este ADR completa a ADR-003: confirma su dirección `/congreso/en` y extiende sus diccionarios a toda la plataforma; si se acepta, ADR-003 sigue vigente.
- Revisar si: (1) hace falta que las páginas públicas aparezcan en buscadores en inglés (se suma un prefijo solo para ellas y `/congreso/en` pasa a redirección permanente); (2) se suma un tercer idioma o traductores externos con una herramienta (se pasa a next-intl; la migración es mecánica porque los textos ya están en diccionarios).

## En palabras simples
La plataforma va a tener un botón "ES | EN" arriba. Lo que elijas queda guardado en tu navegador y en tu cuenta, así que la próxima vez arranca en tu idioma. Las direcciones no cambian: `/tribus` es `/tribus` en los dos idiomas. Para mandarle a un inversor algo en inglés, se agrega `?lang=en` al enlace (por ejemplo, `…/sumarte?lang=en`). La página del Congreso sigue teniendo su dirección propia en inglés, `/congreso/en`, que es la que usan los organizadores.

## Fuentes
- ADR-003 y `openspec/changes/congreso-bilingue/design.md` §4.
- Documentación de next-intl ("App Router setup without i18n routing") y de Next.js (`cookies()`, middleware), consultadas de memoria el 14-oct-2026 sin acceso a internet: verificar versión al implementar.
- Grupo del Artículo 29, Dictamen 04/2012 sobre la exención del consentimiento para cookies (cookies de personalización de la interfaz).
