# Proposal

## Why

Gus revisó el 16-oct-2026 las consultas del Fogón (`fogon-cuadratico`) y dejó cinco respuestas; el 23-oct sumó la regla "un voto sin dato implica que la votación no ha empezado". Este cambio se escribió antes de que entraran a `dev` la limpieza del Fogón, la gobernanza fractal y la holarquía, la Vista NetX (con el simulador) y las traducciones del Fogón. El 28-oct se rehízo sobre el Fogón actual: de los cinco ajustes, dos ya no piden código, uno queda solo en la spec y dos siguen haciendo falta.

| Ajuste | Estado en `dev` (28-oct) | Qué queda en este cambio |
|---|---|---|
| (a) Donut: sin número dentro de las porciones de menos del 5 % | El código (`components/donut.tsx`, `a.pct >= 5`) y su test ("solo las porciones de 5 % o más llevan el número dibujado") **ya están**. La spec no lo dice. | Solo el delta de la spec. |
| (b) Frase consultiva aprobada como está | Igual en `dev`. | Nada; la frase no cambia (con su inglés nuevo, ver (c)). |
| (c) ⚖ de "consultivo" con una explicación propia | **Sigue faltando.** El ⚖ repite la misma frase. Además, la entrada `consultivo` **no tiene inglés**: en inglés el acta muestra la frase en español con `lang="es"` y el ⚖ dice "Only available in Spanish". | Frase y explicación separadas, en español y en inglés (borrador). |
| (d) Acta y avisos de voto se quedan | Igual en `dev`, ya en los dos idiomas (`lib/idioma/textos/fogon-consultas.ts`). | Nada. |
| (e) "Con tu reparto irían": "sin dato" sin votos, "USD 0" desde el primer voto | Con votos a favor ya da "USD 0"; **con solo votos en contra da "sin dato"** aunque la persona ya empezó, y la regla no está escrita en la spec. | Regla en `repartoEnPlata` + spec + tests. |

## What Changes

- **⚖ de "consultivo"** (`lib/legal/terminos.ts`): la entrada `consultivo` separa dos textos:
  - la **frase** que se ve en el acta, sin cambios (aprobada por Gus): "El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.";
  - la **explicación** del ⚖, nueva y en palabras simples (voseo): orienta pero no obliga, decide quien tiene esa facultad según el contrato o el estatuto, y votar no cuesta plata ni la consulta mueve fondos.
  - Las dos suman su **inglés** (`en: { titulo, texto, frase }`), borrador como toda versión en inglés. En inglés el acta muestra la frase en inglés y el ⚖ la explicación en inglés con "Draft: text under review".
  - La entrada sigue con `borrador: true` hasta R14.
- **"Con tu reparto irían"** (`lib/fogon/consultas/reparto.ts`, regla de Gus del 23-oct):
  - si la persona **todavía no empezó a repartir** (ningún voto distinto de 0), cada opción muestra "sin dato": la votación no empezó;
  - desde **el primer voto** (a favor o, si la consulta lo admite, en contra), las opciones con 0 votos a favor muestran "USD 0";
  - si el monto falta, siempre "sin dato".
  - Si la persona saca todos sus votos, vuelve a "sin dato" (un 0 no queda guardado).
- **Donut**: la spec dice la excepción que el código ya aplica. Sin código.

**Se mantiene como está** (respuesta de Gus): el texto del acta, los avisos de voto abierto ("Tu reparto lo va a ver todo el padrón") y de voto secreto, y la frase consultiva.

**Fuera de alcance:**
- El motor (`lib/cuadratico/`): `repartirPresupuesto` sigue devolviendo `null` sin votos a favor; el cambio vive en la cuenta de la pantalla.
- El **resultado del grupo** sin votos sigue diciendo "sin dato" (Gus no lo pidió cambiar).
- El inglés del resto de los ⚖ (`idioma-legal`). Este cambio solo escribe el de `consultivo`; `idioma-legal` lo tiene que dejar como está (ver design §1).
- La gobernanza (`/fogon/gobernanza`, holarquía y fractal) y `/fogon` (limpieza): no usan el donut, `repartoEnPlata` ni el término `consultivo`; no se tocan.
- El simulador (hoy en la Vista NetX): no tiene nada de estos ajustes.
- Base de datos, padrón real y panel de consultas (`fogon-cuadratico-en-la-base`, `fogon-consultas-panel`).
- La revisión legal de los textos borrador (R14) y la revisión nativa del inglés.

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: el donut acepta la excepción de las porciones chicas, "Mi reparto en plata" muestra "sin dato" hasta que la persona empieza a repartir y "USD 0" después (con monto conocido), y se suma la explicación del ⚖ de "consultivo" en los dos idiomas.

## Impact

`lib/legal/terminos.ts` (entrada `consultivo`: `frase`, `texto` nuevo, `en`), `lib/legal/mostrar-termino.ts` (función para la frase en el idioma de la página), `lib/legal/terminos.test.ts`, `lib/legal/mostrar-termino.test.ts`, `app/fogon/consultas/[id]/resultado-grupo.tsx` (`Acta`) y su test, `lib/fogon/consultas/reparto.ts` y su test, `e2e/fogon-consultas.spec.ts`, `e2e/idioma-pendientes.spec.ts`. Sin tablas, sin migraciones, sin integraciones, sin dependencias nuevas, sin pedidos de red, sin datos personales. No hace falta revisión del arquitecto.

**Orden de archivo:** este cambio modifica requisitos de `fogon-consultas`, que todavía vive en `fogon-cuadratico` (completo pero sin archivar). Hay que archivar `fogon-cuadratico` antes que este; si no, `openspec archive` rechaza el delta. No choca con los requisitos que modifican `fogon-cuadratico-en-la-base` ni `fogon-consultas-panel`.
