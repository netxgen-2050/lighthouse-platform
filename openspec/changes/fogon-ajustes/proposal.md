# Proposal

## Why

Gus revisó el 16-oct-2026 las consultas del Fogón ya integradas en `dev` (`fogon-cuadratico`) y dejó cinco respuestas. Tres piden ajustes chicos: la spec del donut tiene que decir la excepción que el diseño ya aplica (las porciones de menos del 5 % no llevan número adentro), el ⚖ de "consultivo" hoy repite la misma frase que acompaña en vez de explicarla, y "Con tu reparto irían" no tenía una regla escrita para cuando la persona todavía no puso votos. Gus respondió el 23-oct-2026: "un voto sin dato implica que la votación no ha empezado". Las otras dos aprueban textos como están.

## What Changes

- **Donut**: la spec dice que el número dentro de la porción va solo en las de 5 % o más; las más chicas llevan número igual en la leyenda y en la tabla. Es lo que ya hace `components/donut.tsx`: solo se corrige la spec y se suma un test que lo fije.
- **⚖ de "consultivo"**: la entrada `consultivo` de `lib/legal/terminos.ts` separa dos textos:
  - la **frase** que se ve en la página y en el acta, que queda tal cual (aprobada por Gus): "El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.";
  - la **explicación** del ⚖, nueva y en palabras simples: qué quiere decir "consultivo" para la persona (orienta pero no obliga), quién decide y que votar no mueve plata.
  Las dos siguen con `borrador: true` hasta R14.
- **"Con tu reparto irían" en Presupuesto** (regla de Gus del 23-oct):
  - si la persona **todavía no empezó a repartir** (ningún voto distinto de 0 en ninguna opción), cada opción muestra "sin dato": la votación no empezó;
  - en cuanto puso **al menos un voto** en alguna opción (a favor o, si la consulta lo admite, en contra), las opciones con 0 votos muestran "USD 0";
  - si el monto falta, siempre "sin dato".
  Hoy la pantalla ya hace esto con votos a favor; el cambio fija la regla en la spec y en los tests, y cubre el caso de quien solo puso votos en contra (hoy daría "sin dato" aunque ya empezó). Si la persona saca todos sus votos, vuelve a "sin dato" (un 0 no queda guardado, así que es igual a no haber empezado).

**Se mantiene como está** (respuesta de Gus): el texto del acta, los avisos de voto abierto ("Tu reparto lo va a ver todo el padrón") y de voto secreto, y la frase consultiva.

**Fuera de alcance:**
- El motor (`lib/cuadratico/`): `repartirPresupuesto` sigue devolviendo `null` sin votos a favor; el cambio vive en la cuenta de la pantalla (`lib/fogon/consultas/reparto.ts`).
- El **resultado del grupo** sin votos sigue diciendo "sin dato" (Gus no lo pidió cambiar).
- La versión en inglés del término `consultivo` (es de `idioma-legal` / `idioma-fogon-mercado`).
- Base de datos, padrón real y panel de consultas (`fogon-cuadratico-en-la-base`, `fogon-consultas-panel`).
- La revisión legal de los textos borrador (R14).

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: el donut acepta la excepción de las porciones chicas, "Mi reparto en plata" muestra "sin dato" hasta que la persona empieza a repartir y "USD 0" después (con monto conocido), y se suma la explicación del ⚖ de "consultivo".

## Impact

`lib/legal/terminos.ts` (entrada `consultivo`: campo nuevo `frase`, `texto` nuevo), `lib/legal/terminos.test.ts`, `app/fogon/consultas/[id]/resultado-grupo.tsx` (el acta usa la frase), `app/fogon/consultas/[id]/resultado-grupo.test.tsx`, `lib/fogon/consultas/reparto.ts` y su test, `app/fogon/consultas/[id]/consulta-cliente.tsx` (si hace falta), `components/donut.test.tsx` y `e2e/fogon-consultas.spec.ts`. Sin tablas, sin migraciones, sin integraciones, sin dependencias nuevas, sin pedidos de red.

**Orden de archivo:** este cambio modifica requisitos de `fogon-consultas`, que todavía vive en `fogon-cuadratico` (completo pero sin archivar). Hay que archivar `fogon-cuadratico` antes que este; si no, `openspec archive` rechaza el delta.
