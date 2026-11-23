# Design

## Contexto

- `app/page.tsx` ya usa `public/imagenes/lighthouse-valle.webp` de fondo (4-nov). `portada-vrn` reescribe el contenido de `/` con `lib/portada-vrn.ts` (cifras con fuente obligatoria) y `lib/portada.ts` (tarjetas).
- Los lotes del sector norte viven en los datos del loteo (`lib/territorios/loteo-estados.ts`: `disponible | reservado | vendido`); `lote-token-tierra` suma el estado "En cuotas (simulado)".
- `bien-comun-numeros-barrio` deja `lib/bien-comun/barrio.ts` (cálculo puro del barrio de 21 lotes) y la regla "solo con sesión hasta R14" para sus números.
- `components/sesion/entrar-para.tsx` es el patrón del aviso para entrar.

## Decisiones

### 1. La foto
Se usa la portada de la Memoria Técnica y Masterplan de Martín (3-nov-2026) exportada a WebP en `public/imagenes/valle-memoria.webp`, con `next/image`, `alt=""` y una leyenda visible: "Imagen ilustrativa · Memoria Técnica y Masterplan (3-nov-2026)". **El archivo no está en el repo**: si Gus no lo pasa antes de construir, se usa `lighthouse-valle.webp` con la leyenda "Imagen ilustrativa" sin fuente, y el PR lo dice. Un degradado con tokens (`bg` con opacidad) bajo el título asegura el contraste, y el test de contraste del cambio 1 prueba `ink` sobre ese degradado mezclado con blanco.

### 2. Foto a sangre dentro del contenido
"A sangre" es dentro del área de contenido (a la derecha del rail), no debajo del rail ni de la barra superior: se anula el padding del contenedor solo en el héroe. Alto: 60–70 vh en computadora, menos en celular para que el título y el botón entren en la primera pantalla.

### 3. Un módulo que arma la vista del barrio
`lib/barrios/norte.ts`, puro y testeado:

```ts
export type VistaBarrioNorte = {
  lotesPorEstado: Record<"disponible" | "reservado" | "en-cuotas" | "vendido", number | null>;
  parteParaElComun: number | null;   // de lib/lotes/modelo.ts
  expensa: number | null;            // de lib/lotes/modelo.ts
  versionModelo: string;
  obra: {                            // solo se pasa a la página con sesión
    infraestructura: number | null;  // de lib/bien-comun/barrio.ts
    juntado: number | null;          // siempre null en el prototipo
    mesDevolucion: number | null;    // null = "no en 6 años"
    comunPorAnio: (number | null)[];
    lotesDelModelo: number;          // 21 (doc 34)
    lotesDelPlano: number;           // del loteo
  };
};
```

Si `lotesDelModelo` y `lotesDelPlano` difieren, el panel lo dice ("El cálculo usa N lotes del modelo; el plano tiene M"), como pide la decisión de Gus en `bien-comun-propuesta`.

<!-- arquitecto: un solo resumen de la obra, compartido con Invertir -->
**Un solo dueño para los números de la obra.** `obra` (infraestructura, juntado, mes de devolución, lo que llega al común, lotes del modelo) **no se arma en `lib/barrios/norte.ts`**: sale de una función `resumenObraBarrio()` exportada por `lib/bien-comun/barrio.ts`, que usa también `rediseno-invertir` (allí la "meta" es la misma "infraestructura"). El cambio que llegue primero a `dev` la crea; el otro la reutiliza. Así Inicio, Barrio Norte, Invertir y la calculadora de `/bien-comun` no pueden mostrar dos montos distintos para la misma obra. `lotesDelModelo` también sale de ese módulo, nunca escrito como `21`.

### 4. Sesión del panel de la obra
La página es server component pública. El panel de la obra es un componente cliente que lee `useSesion()`: con sesión dibuja los números; sin sesión, `EntrarPara`. Los números de la obra **no se serializan** en el HTML sin sesión: el cálculo corre en el cliente solo cuando hay sesión (es puro y barato), igual que la calculadora del barrio.

<!-- arquitecto: tapa, no llave (ADR-015) -->
Esto **oculta, no protege** (ADR-015): los parámetros del modelo viajan en el JavaScript de la página y cualquiera que lo lea puede recalcular el monto. Se acepta porque son números de ejemplo sin datos de personas, igual que en "Los números del barrio". La prueba con `curl` vigila solo que el HTML no traiga el monto ya calculado. Antes de R14 se revisa junto con ADR-015.

### 5. Estados y chips
Los totales por estado usan `components/ui/indicador.tsx` y `chip-estado.tsx`. <!-- arquitecto: "en cuotas" no existe en el loteo base --> El loteo base (`lib/territorios/loteo-estados.ts`) solo tiene `disponible | reservado | vendido`; `lote-token-tierra` **no** le suma "en cuotas": su `en-cuotas-tuyo` es un estado de la persona, que sale de sus compras en el navegador, y esta vista no lo usa (spec: las compras del navegador no cambian los totales). Por eso el indicador "En cuotas" dice "sin dato" también después de `lote-token-tierra`, y este cambio **no** agrega un estado nuevo al loteo base ni inventa cuántos lotes van en cuotas.

## Riesgos

- **La imagen de la memoria puede tener derechos o mostrar cosas que no son definitivas.** Va como "Imagen ilustrativa" y se puede cambiar por otra en un solo lugar.
- **Dos números de lotes (21 del modelo y los del plano)** pueden confundir: se muestran los dos con su origen.
