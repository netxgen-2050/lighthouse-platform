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

### 2. Solo con sesión, sin números en el HTML
La página es un server component que dibuja los sellos y un componente cliente que lee `useSesion()`: sin sesión dibuja `EntrarPara`; con sesión calcula y dibuja. El cálculo es puro y corre en el cliente, como la calculadora del barrio, para que el HTML sin sesión no lleve números.

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
- **Depende de dos cambios todavía sin construir.** Va último en el orden.
