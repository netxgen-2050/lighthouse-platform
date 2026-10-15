# ADR-007 · Los votos de las consultas del Fogón son secretos ante la plataforma (también para el super admin), se guardan en un libro de solo agregar y vota un padrón explícito por consulta

- **Estado:** Propuesta
- **Fecha:** 2026-10-15
- **Cambio OpenSpec relacionado:** fogon-cuadratico-en-la-base (y fogon-consultas-panel para cargar el padrón)

## Contexto
Con `fogon-cuadratico-en-la-base` el equipo vota de verdad con voto cuadrático, con su identidad de Privy. Son los primeros votos reales en la base. Hay que decidir tres cosas que cuestan revertir con votos adentro: quién puede ver cómo votó cada persona, cómo se guarda un cambio de voto y quién puede votar en cada consulta. Las membresías de tribu todavía no están en la base y el acceso a la plataforma es abierto (`sumarte-acceso`), así que "todas las personas con cuenta" no es "el equipo".

## Opciones
**Quién ve los votos individuales**

| Opción | A favor | En contra |
|---|---|---|
| A · Nadie en la plataforma, ni el super admin; solo el agregado y el voto propio | Protege la intensidad honesta, que es lo que mide el voto cuadrático; regla simple de revisar | Nadie puede auditar "por persona" desde la app; el dueño de la base igual puede leerlos |
| B · El super admin ve todo | Auditoría fácil; puede ver quién falta | Quien convoca (y vota) ve cómo repartió cada quien: el equipo reparte "para la foto" |
| C · Separar identidad y voto (registro de "ya votó" + votos sin persona) | Secreto también ante la base | No se puede "vale el último" ni mostrar "tu voto"; más complejo |
| D · Todo público, como un acta nominal | Transparencia total | No es lo que se busca en una priorización consultiva; arrastra |

**Cómo se guarda un cambio de voto**

| Opción | A favor | En contra |
|---|---|---|
| E · Libro de solo agregar: cada envío es una fila, vale el último hasta el cierre | Historia completa; nadie puede tocar un voto; ADR-001 | El resultado se calcula (un poco más de SQL) |
| F · Una fila por persona y consulta que se actualiza | Simple | Un cambio borra el anterior; contradice ADR-001 |

**Quién vota**

| Opción | A favor | En contra |
|---|---|---|
| G · Padrón explícito por consulta (emails de personas que ya existen) | Sirve para "Equipo + Martín" (U2); da la base del "votaron X de N"; la base lo garantiza con una foránea | Hay que armar el padrón al crear la consulta |
| H · Una marca "equipo" en `personas` | Un solo lugar | No sirve para consultas con invitados; otra columna en `personas` |
| I · Cualquier persona con cuenta | Cero trabajo | Con acceso abierto, cualquiera que se registre votaría en el equipo |

## Decisión
**A + E + G.** El valor del voto cuadrático es que cada quien diga cuánto le importa algo sin mirar de reojo; si quien convoca puede ver los repartos, ese valor se pierde. El libro de solo agregar mantiene la regla de ADR-001 para los votos. El padrón explícito es la única opción que hoy define bien "quién es el equipo" para cada consulta.

## Consecuencias
- Ganamos: una regla simple ("ninguna respuesta trae votos ajenos") que se prueba con un test; votos que nadie puede tocar; "votaron X de N" con un N real.
- Aceptamos: el secreto es **ante la aplicación**, no ante quien administra Neon (Gus, como responsable de los datos), que puede leer las tablas. Se dice así en el PR y en la pantalla no se promete "voto anónimo".
- Aceptamos: en grupos muy chicos el agregado deja adivinar votos (si votan 2, cada una deduce el reparto de la otra).
- Aceptamos: el super admin no sabe quién falta votar; solo cuántas personas votaron.
- Revisar cuando: una consulta tenga efecto vinculante o plata real (puede pedir C o un acta congelada), haya consultas por tribu con membresías en la base (el padrón podría salir de ahí), o el equipo pida ver quién falta.

## En palabras simples
En cada consulta hay una lista de quiénes votan (el padrón). Cada vez que alguien guarda su reparto se agrega un renglón nuevo en un libro que no se puede borrar, y cuenta el último antes del cierre. La plataforma le muestra a cada persona su propio voto y el resultado del grupo, pero nunca cómo votó otra persona: tampoco a Gus como administrador. Así nadie reparte sus créditos pensando en quién lo va a mirar. Quien administra la base técnicamente podría verlo, y lo decimos así.

## Fuentes
- `openspec/changes/fogon-cuadratico-en-la-base/` (design §1 y §5).
- ADR-001 (libros de solo agregar, votos en columnas), ADR-005 (consentimiento antes de la identidad).
- `NS_platform/Documentation/Desarrollo/Ideas/2026-10-15 - Fogón - priorizar con voto cuadrático.md` (mecanismo, "para no arrastrar al resto", casos U1–U4).
- `NS_Tokenomics/AGENTS.md`, regla 6 ("one person, one vote; money never buys that voice").
- Lalley & Weyl, *Quadratic Voting* (2018) [citado en la nota de la idea].
