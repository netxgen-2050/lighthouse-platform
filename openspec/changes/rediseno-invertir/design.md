# Design

## Contexto

- `bien-comun-numeros-barrio` deja `lib/bien-comun/barrio.ts`: cálculo puro del barrio de 21 lotes (fiel a `sim/barrio_stack_sim.py` v0.1) con lo que trae el Token Inversor, el mes en que se le termina de devolver si cobra con las cuotas, lo que recibe y lo que le llega al común por año.
- `token-inversor-y-coherencia` suma la sección del Token Inversor a `/netx/financiamiento` y los ⚖ `tokeninversor` y `fideicomisobarrio` (de `bien-comun-propuesta`).
- `components/sesion/entrar-para.tsx` es el patrón del aviso para entrar.

## Decisiones

### 1. Un módulo de Invertir sobre el cálculo del barrio
`lib/invertir/barrios.ts`, puro:

```ts
export type BarrioEnFinanciamiento = {
  id: "norte";
  meta: number | null;              // infraestructura total (barrio.ts)
  juntado: null;                    // nunca hay plata real en el prototipo
  mesDevolucion: number | null;     // null → "no en 6 años"
  parteParaElComun: number | null;  // lib/lotes/modelo.ts
  curva: { mes: number; devuelto: number; aportado: number }[];
  libro: { mes: number; motivo: "cuotas" | "devolucion" | "comun"; monto: number | null }[]; // por trimestre
  version: string;                  // versión del simulador
};
export function barriosEnFinanciamiento(): BarrioEnFinanciamiento[];
```

Si `barrio.ts` no expone la serie mensual que necesita la curva, se le suma una función que la devuelva (sin cambiar sus resultados ni sus tests) en este cambio.

<!-- arquitecto: un solo resumen de la obra, compartido con Barrio Norte -->
**Un solo dueño para los números de la obra.** `meta`, `mesDevolucion` y `parteParaElComun` no se recalculan acá: salen de `resumenObraBarrio()` en `lib/bien-comun/barrio.ts`, la misma función que usa el panel de la obra de `rediseno-explorar-valle` (allí `meta` se llama "infraestructura"). El cambio que llegue primero a `dev` la crea; el otro la reutiliza. `barriosEnFinanciamiento()` solo suma la curva y el libro. Un test compara la meta de Invertir con la infraestructura de Barrio Norte (si `lib/barrios/norte.ts` ya existe) y con la calculadora de `/bien-comun`: tienen que dar el mismo número.

### 2. Solo con sesión, sin números en el HTML
La página es un server component que dibuja los sellos y un componente cliente que lee `useSesion()`: sin sesión dibuja `EntrarPara`; con sesión calcula y dibuja. El cálculo es puro y corre en el cliente, como la calculadora del barrio, para que el HTML sin sesión no lleve números.

<!-- arquitecto: la puerta manda a Sumarte si la ruta no es pública -->
**`/invertir` se suma a `RUTAS_PUBLICAS`** (`lib/sesion/rutas-publicas.ts`). Si no, `Puerta` redirige a `/sumarte?volver=/invertir` a quien no tiene sesión (`capacidadDeRuta` → `personal`), el aviso de `EntrarPara` nunca se ve y el escenario "Sin sesión" de la spec no se puede cumplir. Que la ruta sea pública no abre números: el componente cliente los dibuja solo con sesión. Es el mismo criterio que `/bien-comun` y lo que pide `rediseno-menu-cinco` ("cada página decide qué muestra sin sesión"). La página sigue sin indexarse (ADR-030).

Esto **oculta, no protege** (ADR-015): los parámetros del modelo viajan en el JavaScript y quien lo lea puede recalcular la meta. Se acepta porque son números de ejemplo sin datos de personas. Antes de R14 se revisa junto con ADR-015.

### 3. Curva en SVG propio
Sin librerías de gráficos. `<svg role="img" aria-labelledby>` con `<title>` y `<desc>`; lo devuelto en trazo continuo con relleno de la escala de regeneración, lo aportado en línea punteada; ejes con etiquetas en texto. Debajo, `<details>` con la tabla equivalente por trimestre (`TablaLibro` o una tabla simple con `caption`). Sin animación con `data-movimiento="reducido"`.

### 4. Libro por trimestre y "mes N"
El simulador trabaja por mes sin fecha de inicio real; inventar fechas sería un dato falso. Se agrupa por trimestre y se rotula "mes 3", "mes 6"… Montos en JetBrains Mono, alineados a la derecha.

### 5. Prima del inversor
El cálculo usa la prima anual del inversor como parámetro. Invertir **no la muestra** como porcentaje ni como "rendimiento": muestra la meta, el plazo, la forma de devolución y la curva. Si Gus quiere mostrar la prima objetivo (como hace `/netx/financiamiento`), es una pregunta abierta.

### 6. Test de sin rendimiento
`lib/invertir/sin-rendimiento.test.ts`: recorre `app/invertir/`, `lib/invertir/` y `lib/idioma/textos/invertir.ts`, y falla con `rendimiento|APY|TIR|IRR|ganancia|profit|yield|recupero|payback|valorizaci[oó]n|appreciation` (palabra entera, sin distinguir mayúsculas). Por eso los textos de Invertir tampoco dicen "sin rendimiento": dicen "plazo y forma de devolución".

## Riesgos

- **La curva puede leerse como promesa.** Mitigación: sellos antes de los números, "caso de ejemplo" en el título de la curva y sin prima a la vista.
- <!-- arquitecto: la curva deja ver la prima --> **La curva muestra la prima sin nombrarla.** Si lo devuelto termina por encima de lo aportado, la diferencia entre las dos líneas *es* la prima: el test de palabras no la atrapa. Cortar la curva en lo aportado, o mostrar las dos líneas completas, es una decisión de producto que queda para Gus. El implementador no la resuelve por su cuenta: construye la curva completa y lo anota en el PR.
- **Depende de dos cambios todavía sin construir.** Va último en el orden.
