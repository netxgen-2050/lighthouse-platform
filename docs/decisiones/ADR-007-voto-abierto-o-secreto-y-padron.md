# ADR-007 · Cada consulta del Fogón define si el voto es abierto o secreto (abierto por defecto en las de Equipo), los votos se guardan en un libro de solo agregar y vota un padrón explícito por consulta

- **Estado:** Propuesta
- **Fecha:** 2026-10-15 (reescrito el mismo día con las respuestas de Gus al PR #76)
- **Cambio OpenSpec relacionado:** fogon-cuadratico (la regla en las pantallas), fogon-cuadratico-en-la-base (la regla en la base y la API) y fogon-consultas-panel (elegir la regla y cargar el padrón)
- **Nota:** el archivo conserva el nombre `voto-secreto-y-padron` para no romper enlaces; la decisión ahora es "voto abierto o secreto, por consulta".

## Contexto
Con `fogon-cuadratico-en-la-base` el equipo vota de verdad con voto cuadrático, con su identidad de Privy. Son los primeros votos reales en la base. Hay que decidir tres cosas que cuestan revertir con votos adentro: quién puede ver cómo votó cada persona, cómo se guarda un cambio de voto y quién puede votar en cada consulta. Las membresías de tribu todavía no están en la base y el acceso a la plataforma es abierto (`sumarte-acceso`), así que "todas las personas con cuenta" no es "el equipo". La primera versión de este ADR proponía el voto secreto ante la plataforma; Gus pidió (PR #76) que el padrón vea cómo repartió cada quien y quién falta votar.

## Opciones
**Quién ve los votos individuales**

| Opción | A favor | En contra |
|---|---|---|
| A · Nadie en la plataforma, ni el super admin; solo el agregado y el voto propio | Protege la intensidad honesta, que es lo que mide el voto cuadrático | El equipo no ve quién falta ni puede conversar sobre los repartos; es lo contrario de lo que pide Gus |
| B · El super admin ve todo | Auditoría fácil; puede ver quién falta | Asimetría: quien convoca (y vota) ve lo que el resto no |
| C · Separar identidad y voto (registro de "ya votó" + votos sin persona) | Secreto también ante la base | No se puede "vale el último" ni mostrar "tu voto"; más complejo |
| D · Todo el padrón ve todo, siempre, como un acta nominal | Transparencia total, sin asimetrías | No sirve para un reparto delicado (por ejemplo, plata de una persona o un conflicto) |
| E · Regla por consulta: "voto abierto" (el padrón ve el reparto de cada quien y quién falta) o "voto secreto" (A); abierto por defecto en las de Equipo | Da la transparencia que pide Gus para el equipo y deja el secreto para cuando haga falta; misma regla para todo el padrón, sin asimetrías | Una regla más que elegir al crear; dos caminos que probar |

**Cómo se guarda un cambio de voto**

| Opción | A favor | En contra |
|---|---|---|
| F · Libro de solo agregar: cada envío es una fila, vale el último hasta el cierre | Historia completa; nadie puede tocar un voto; ADR-001 | El resultado se calcula (un poco más de SQL) |
| G · Una fila por persona y consulta que se actualiza | Simple | Un cambio borra el anterior; contradice ADR-001 |

**Quién vota**

| Opción | A favor | En contra |
|---|---|---|
| H · Padrón explícito por consulta (emails de personas que ya existen) | Sirve para "Equipo + Martín" (U2); da la base del "votaron X de N" y de "falta votar"; la base lo garantiza con una foránea | Hay que armar el padrón al crear la consulta |
| I · Una marca "equipo" en `personas` | Un solo lugar | No sirve para consultas con invitados; otra columna en `personas` |
| J · Cualquier persona con cuenta | Cero trabajo | Con acceso abierto, cualquiera que se registre votaría en el equipo |

## Decisión
**E + F + H.** Gus quiere que el equipo vea cómo repartió cada quien y quién falta votar: en un equipo chico que está aprendiendo a decidir junto, ver los repartos abre la conversación y evita la asimetría de que solo quien administra sepa quién falta. Como no toda consulta es igual, la visibilidad es una regla de cada consulta, fija desde que se crea, y vale igual para todo el padrón (el super admin no ve más que el resto). El libro de solo agregar mantiene la regla de ADR-001 para los votos. El padrón explícito es la única opción que hoy define bien "quién es el equipo" para cada consulta.

Detalle de la regla:
- **Voto abierto** (por defecto en las consultas de Equipo): cada persona del padrón ve, cuando el resultado es visible, una tabla con el último reparto de cada persona con su nombre, y en todo momento mientras la consulta está abierta, la lista de quiénes del padrón faltan votar. Antes de votar, la pantalla avisa "Tu reparto lo va a ver todo el padrón".
- **Voto secreto**: ninguna respuesta trae el reparto de otra persona ni quién falta; cada quien ve el suyo, el agregado y cuántas personas repartieron (la regla A de la primera versión).
- La regla no cambia una vez que hay votos (la base lo impide), así nadie vota creyendo una cosa y se encuentra con otra.
- Sin mínimo de personas para mostrar el resultado (decisión de Gus).
- Si una persona retira su consentimiento con la consulta abierta, su último reparto sigue contando (decisión de Gus); con voto abierto, su nombre sigue en la tabla de esa consulta.

## Consecuencias
- Ganamos: transparencia para el equipo (quién repartió cómo, quién falta), sin asimetría entre quien administra y el resto; votos que nadie puede tocar; "votaron X de N" con un N real.
- **Riesgo aceptado por Gus (señalado por el arquitecto):** con voto abierto se puede "votar para la foto": repartir pensando en quién lo va a mirar y no en cuánto importa cada opción, que es justo lo que mide el voto cuadrático. Además, quien vota tarde ve los repartos de los demás (si el resultado es "al votar") o al menos sabe quién falta, y puede acomodarse. Se acepta para las consultas de Equipo, que son consultivas. Para mitigarlo: el aviso antes de votar, el resultado "al cierre" por defecto (nadie ve repartos ajenos hasta cerrar) y la opción de voto secreto para lo delicado.
- Aceptamos: en voto secreto, el secreto es **ante la aplicación**, no ante quien administra Neon (Gus, como responsable de los datos), que puede leer las tablas. La pantalla no promete "voto anónimo".
- Aceptamos: en voto secreto y grupos muy chicos el agregado deja adivinar votos (si votan 2, cada una deduce el reparto de la otra), y con la regla "resultado al votar" quien ya votó puede comparar el agregado antes y después de otro envío (revisión del arquitecto, 15-oct-2026). Sin umbral mínimo: decisión de Gus.
- Aceptamos: el reparto con nombre es un dato personal que ve todo el padrón; la persona lo sabe antes de votar (aviso) y cada envío exige consentimiento vigente (ADR-005). La descarga de los votos propios en "Mis datos" queda pendiente (no bloquea).
- La regla "nadie toca un voto" incluye **agregar**: los votos de un envío solo entran en la misma transacción que el envío (trigger), así nadie suma un voto a un envío viejo ni después del cierre.
- Los previews no tienen datos reales: ver ADR-008.
- Revisar cuando: una consulta tenga efecto vinculante o plata real (puede pedir C o un acta congelada), haya consultas por tribu o asamblea con membresías en la base (¿el voto abierto sigue siendo el defecto con 100 personas?), se muestre la plataforma fuera del equipo (R14), o el equipo note que reparte "para la foto".

## En palabras simples
En cada consulta hay una lista de quiénes votan (el padrón). Quien crea la consulta elige si el voto es **abierto** o **secreto**; en las del equipo, por defecto es abierto: todas las personas del padrón ven cómo repartió cada quien y quién falta votar, y la pantalla lo avisa antes de votar ("Tu reparto lo va a ver todo el padrón"). Para algo delicado se elige secreto y cada quien ve solo su voto y el total. Cada vez que alguien guarda su reparto se agrega un renglón nuevo en un libro que no se puede borrar, y cuenta el último antes del cierre. El costo de mirar los votos de los demás es que alguien reparta "para quedar bien"; Gus lo acepta para el equipo.

## Fuentes
- PR #76, respuestas de Gus (15-oct-2026): voto abierto por defecto en Equipo, sin mínimo de personas, el reparto de quien retira el consentimiento sigue contando, descarga de Mis datos pendiente.
- `openspec/changes/fogon-cuadratico-en-la-base/` (design §1 y §5) y `openspec/changes/fogon-cuadratico/` (design §2 y §4).
- ADR-001 (libros de solo agregar, votos en columnas), ADR-005 (consentimiento antes de la identidad), ADR-008 (previews sin datos reales).
- `NS_platform/Documentation/Desarrollo/Ideas/2026-10-15 - Fogón - priorizar con voto cuadrático.md` (mecanismo, "para no arrastrar al resto", casos U1–U4).
- `NS_Tokenomics/AGENTS.md`, regla 6 ("one person, one vote; money never buys that voice").
- Lalley & Weyl, *Quadratic Voting* (2018) [citado en la nota de la idea].
