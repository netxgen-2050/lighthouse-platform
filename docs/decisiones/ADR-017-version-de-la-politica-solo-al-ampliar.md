# ADR-017 · La versión de la política se sube solo cuando amplía lo que se trata; quitar una categoría no pide el consentimiento de nuevo, pero queda anotado

- **Estado:** Propuesta
- **Fecha:** 2026-10-27
- **Cambio OpenSpec relacionado:** rail-sin-compromisos (decisión 6 de su design); toca la regla de `idioma-legal` (design §36) y de `consentimiento-alta` (lista "Qué cambió" por versión)

## Contexto
`rail-sin-compromisos` saca los compromisos del texto de la política (borrador) sin subir `VERSION_POLITICA`, para no volver a pedir el consentimiento a todas las personas (y el de datos sensibles del Pasaporte). Hasta ahora la regla implícita era otra: `idioma-legal` (design §36) dice que "no puede haber dos textos distintos con la misma versión", porque la versión es lo que prueba **qué texto** aceptó cada persona (ADR-005: la constancia tiene que poder demostrar qué se aceptó). Hay que elegir qué significa la versión antes de que el consentimiento pase a la base (`consentimiento-en-la-base`).

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Toda edición del texto sube la versión | La versión identifica un solo texto; constancia exacta | Cada corrección menor pide aceptar de nuevo a todas las personas (y el KYC): fatiga de consentimiento, la gente acepta sin leer |
| B · Se sube solo si amplía (datos, finalidades, encargados o lugares nuevos); quitar o aclarar no la sube y no deja rastro | Nadie acepta de nuevo algo que no le agrega nada | Una misma versión tapa dos textos; si alguien pregunta "¿qué acepté el 20-oct?", no hay respuesta en la plataforma |
| C · Como B, pero cada edición que no sube la versión queda anotada en el mismo archivo de la política (fecha, qué se quitó, cambio OpenSpec) y en git | Nadie acepta de nuevo sin motivo; el texto aceptado se reconstruye con la fecha de aceptación + esa nota + git | La prueba depende del historial de git, no de la constancia sola |
| D · Separar "versión del texto" de "versión que pide consentimiento" (dos campos en la constancia) | Constancia exacta sin pedir de nuevo | Toca `consentimiento.ts`, la forma del registro y la tabla de `base-neon`: más de lo que hace falta hoy |

## Decisión
**C** para el prototipo. Sube la versión todo lo que **amplía** (y, por `idioma-legal`, corregir una traducción ya publicada). Lo que solo **quita** o reduce lo descrito no la sube, y se anota en la cabecera de `lib/privacidad/politica.ts` con fecha, qué se quitó y el cambio que lo hizo. D queda como el camino si Gabriel (R14) pide que la constancia sola alcance, y conviene decidirlo antes de que `consentimiento-en-la-base` cree la tabla.

## Consecuencias
- Ganamos: no se vuelve a pedir el consentimiento por sacar algo que la plataforma ya no ofrece.
- Aceptamos: durante un tiempo la versión `2026-10-14-borrador` corresponde a dos textos (antes y después del 27-oct-2026). Se distinguen por la fecha de aceptación y la nota de la cabecera.
- Aceptamos: si se **vuelve** a nombrar algo que se había quitado (por ejemplo, Compromisos), eso amplía y sí sube la versión (`docs/notas/compromisos-en-pausa.md`).
- Matiza `idioma-legal` design §36 ("no puede haber dos textos con la misma versión"): vale para lo que amplía o corrige; lo que solo quita queda anotado en lugar de versionado.
- Revisar: en la revisión legal R14 con Gabriel, y antes de implementar `consentimiento-en-la-base` (si se elige D, la tabla tiene que nacer con los dos campos).

## En palabras simples
Cuando la política dice que vamos a hacer **más** cosas con tus datos, te pedimos que la aceptes de nuevo. Cuando solo **saca** algo (por ejemplo, ya no habla de Compromisos porque esa parte se llevó afuera), no te molestamos: lo que aceptaste ya cubría eso y más. Para no perder la cuenta, anotamos en la propia política qué se sacó y cuándo, así siempre se puede saber qué texto viste el día que aceptaste.

## Fuentes
- `openspec/changes/rail-sin-compromisos/design.md`, decisión 6.
- `openspec/changes/idioma-legal/design.md` §36; `openspec/changes/consentimiento-alta/design.md` §5 (`VERSIONES_POLITICA` y "Qué cambió").
- ADR-005 (constancia del consentimiento).
- RGPD arts. 7 y 13 (consentimiento informado y deber de informar al cambiar la finalidad), citados de memoria: los verifica Gabriel en R14.
