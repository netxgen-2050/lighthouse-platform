# Tasks

Una noche. Va antes de `territorio-vistas`. Rama `agente/tribus-equipos` desde `dev`.

## 1. Datos

- [x] 1.1 `lib/territorios/fases.ts`: `Fase`, `FASES` (es/en), `FASE_ACTUAL = 0`, `esFase` y `vigenteEn` (design §1). La fase 2 no lleva año.
  - **Verifica:** `fases.test.ts` cubre que la fase actual es 0, que `vigenteEn({desde:1}, 0)` da `false`, que `vigenteEn({desde:1}, 2)` da `true` y que `esFase(3)` da `false`.
- [x] 1.2 Si `comun-contratistas` no está en `CIRCULOS_DEL_COMUN`, agregarlo con los datos de `manifiesto-lighthouse-vrn` design §6, y ajustar los tests de la holarquía que cuentan los círculos del común.
  - **Verifica:** un test afirma que `comun-contratistas` existe con propósito `economia`, y `pnpm verificar` pasa en verde.
- [x] 1.3 Punto-en-polígono puro (en `lib/territorios/`, si no existe ya).
  - **Verifica:** un test con un cuadrado da un punto adentro, uno afuera y uno sobre el borde, con un resultado definido y documentado.
- [x] 1.4 `lib/equipos/frentes.ts`: los 8 frentes de la tabla del design §2, con sus 6 puntos elegidos dentro del Macrolote 7, más `frentesDe` y `validarFrentes`. El inglés de los datos va a `lib/idioma/revision-nativa.ts`.
  - **Verifica:** `frentes.test.ts` comprueba que `validarFrentes()` devuelve `[]`. Con listas armadas a mano, también reporta cada error por separado: círculo inexistente, id repetido, punto fuera, texto vacío en `faltan` y puntos a menos de ~300 m.
- [x] 1.5 `lib/equipos/equipos.ts`: `listarEquipos`, `leerPedidos`, `pedir` y `estadoSumarme` (design §3).
  - **Verifica:** el test comprueba que Agua, Permacultura y Contratistas van antes que Tokenomics. También que `pedir` es idempotente y descarta `valle` y `__proto__`, y que `leerPedidos` tolera JSON roto. `estadoSumarme` se prueba en sus cinco ramas, en el orden del design.
  <!-- arquitecto: regla única de adhesión y freno en la acción -->
  - Además: `estadoSumarme` recibe `adhirio` calculado con `puedeParticiparEnGobernanza` (si `lib/gobernanza/participar.ts` no existe en `dev`, crearlo solo con esa función pura, design §3), y `confirmarPedido` devuelve `null` sin escribir si el estado no es `puede`.
  - **Verifica:** un test comprueba que `confirmarPedido` sin sesión, sin capacidad o sin adhesión devuelve `null`, y que con `puede` devuelve el pedido. `lib/equipos/equipos.ts` no lee `membresia.lighthouse` por su cuenta.
- [x] 1.6 `lib/demo/claves.ts`: `equipos: "lh-equipos"`.
  - **Verifica:** pasan `claves.test.ts` y un test de `exportar` que incluye `equipos`. <!-- arquitecto --> Un test de `borrarDemo` comprueba que también quita `lh-equipos` con el prefijo de la persona.

## 2. Pantalla

- [x] 2.1 Textos es/en en `lib/idioma/textos/tribus.ts`: pestañas, explicación de equipos, "Más adelante · fase N", "Sin frentes abiertos por ahora", "Sin lugar en el mapa", "En el mapa del Lighthouse (ilustrativo)", "Un equipo puede volverse una tribu más adelante; el proceso está por definir", los avisos de sumarse y la marca y el aviso "Ejemplo, a definir".
  - **Verifica:** pasa el test de diccionarios completos que ya existe.
- [x] 2.2 `components/sumarme-equipo.tsx` (design §5).
  - **Verifica:** lo cubre el e2e de 3.1. A mano: con el teclado se abre la confirmación, Cancelar devuelve el foco y no hay salto al hidratar.
- [x] 2.3 `/tribus` con las pestañas y la pestaña Equipos (design §6). El contenido de hoy pasa a `?ver=tribus` con el aviso y la marca en cada tarjeta.
  - **Verifica:** `/tribus` muestra los equipos y `/tribus?ver=tribus` las 12 tribus marcadas. `/tribus?ver=xyz` muestra los equipos.
- [x] 2.4 La marca "Ejemplo · a definir" en el encabezado de `/tribus/[id]`.
  - **Verifica:** se ve en `/tribus/valle` y en una vacante (`/tribus/grano` o la que corresponda).

## 3. Pruebas y cierre

- [x] 3.1 `e2e/tribus-equipos.spec.ts`, con los escenarios de las dos specs:
  - pestaña por defecto;
  - cambiar de pestaña con el teclado;
  - Agua con su frente;
  - Legal "Sin lugar en el mapa";
  - "Primer obrador" en "Más adelante · fase 1";
  - "Línea de base" con "sin dato";
  - sin sesión;
  - sin adhesión;
  - pedir sumarse y que siga después de recargar, sin cambiar la membresía;
  - inglés a 390 px.

  Para la adhesión se usa el helper que escribe `lighthouse: "pedido"` si ya existe; si no, se crea en `e2e/ayudas.ts`.
  - **Verifica:** `pnpm test:e2e e2e/tribus-equipos.spec.ts` pasa en verde, 3 veces seguidas.
- [x] 3.2 Ajustar `e2e/tribus.spec.ts` (las secciones de tribus ahora están en `?ver=tribus`) y sumar las dos pestañas a `e2e/accesibilidad.spec.ts`.
  - **Verifica:** los dos e2e pasan en verde y axe no marca violaciones.
- [x] 3.3 Escenario "Mis datos": un e2e o un test unitario de `exportar` con un pedido guardado.
  - **Verifica:** la descarga incluye `equipos`.
- [x] 3.4 Cierre: `pnpm verificar` y `pnpm build` en verde. El PR a `dev` se abre con `scripts/pr.sh` y en el cuerpo dice si se agregó `comun-contratistas` o ya estaba. <!-- arquitecto --> También dice si se creó `lib/gobernanza/participar.ts` o ya estaba, y deja la línea para el inventario de datos del POC: "`lh-equipos` · a qué círculos del común pidió sumarse la persona · navegador · pendiente".
  - **Verifica:** los comandos salen en verde y el PR está abierto.
