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

### 4. Sesión del panel de la obra
La página es server component pública. El panel de la obra es un componente cliente que lee `useSesion()`: con sesión dibuja los números; sin sesión, `EntrarPara`. Los números de la obra **no se serializan** en el HTML sin sesión: el cálculo corre en el cliente solo cuando hay sesión (es puro y barato), igual que la calculadora del barrio.

### 5. Estados y chips
Los totales por estado usan `components/ui/indicador.tsx` y `chip-estado.tsx`. Si el loteo todavía no tiene "en cuotas" (porque `lote-token-tierra` no llegó), el indicador dice "sin dato".

## Riesgos

- **La imagen de la memoria puede tener derechos o mostrar cosas que no son definitivas.** Va como "Imagen ilustrativa" y se puede cambiar por otra en un solo lugar.
- **Dos números de lotes (21 del modelo y los del plano)** pueden confundir: se muestran los dos con su origen.
