# Design

## Contexto

- `lib/tribus/datos.ts` guarda `busca: BilingueConOriginal[]` por tribu. Se usa en `/tribus` (listado), en `/tribus/[id]` (tarjeta "Lo que busca", con `Etiquetas`) y en el mapa (`app/territorios/[id]/ficha-lateral.tsx`).
- Los roles de `/pactos` viven en `lib/pactos/datos.ts` (`ROLES`, `ClaveRol`, `textoDeRol`).
- Los círculos de ejemplo salen de `lib/gobernanza/datos.ts`: `circulosDe(tribuId)` (ids `<tribu>-<n>`, o `avelan-area-<n>` para las áreas de Avelan Kerum) y `circulosTransversales()` (`comunicacion-comun`, con `tribus: ["valle", "taller"]`).

## Decisiones

### 1. Módulo `lib/tribus/necesidades.ts`

```ts
type TipoNecesidad = "diseno" | "campo";
type EstadoNecesidad = "abierta" | "tomada" | "hecha";
type NecesidadBilingue = {
  id: string;                 // "<tribu>-<slug>", estable: lo usa el ancla y, después, el pacto puntual
  tribuId: string;
  titulo: BilingueConOriginal; // igual a una etiqueta de `busca` de la tribu
  que: BilingueConOriginal;
  horas: number | null;        // aproximadas; null = sin dato
  tipo: TipoNecesidad;
  paraCuando: string | null;   // "AAAA-MM-DD"; null = sin dato
  habilidad: ClaveRol;
  habilidadOtra?: BilingueConOriginal; // solo si habilidad === "otro"
  estado: EstadoNecesidad;     // de ejemplo: "abierta" suma personas; "tomada" ya no suma más
  circuloId?: string;
  tope: TopePorPersona | null; // lo pone el holón; null = sin máximo
};
type TopePorPersona = { unidad: "horas" | "semillas"; valor: number }; // entero positivo
```

### 1 ter. Varias personas y máximo por persona (decisión de Gus, 28-oct)

- Una necesidad la pueden tomar **varias personas**. Cada una recibe Semillas **por sus propias horas verificadas** (`pacto-puntual-verificacion`); acá solo se modela el dato.
- `tope` es el **máximo por persona** que pone quien administra el holón, en horas o en Semillas. Función pura, que usa `pacto-puntual-verificacion`:

```ts
function aplicarTope(horas: number, tope: TopePorPersona | null, valorHora: number):
  { horasConSemillas: number; horasSinSemillas: number; semillas: number };
// sin tope: todas cuentan; semillas = round(horas × valorHora)
// en horas: horasConSemillas = min(horas, tope.valor); semillas = round(horasConSemillas × valorHora)
// en Semillas: semillas = min(round(horas × valorHora), tope.valor);
//              horasConSemillas = min(horas, floor(tope.valor / valorHora)) — entero, del lado prudente
```

- Ejemplo (con `HOUR_REF_USD = 7049 / 1400`, unas 5,03 por hora): `valle-solar` tope 10 h → con 12 h, 10 h con Semillas (50), 2 h sin Semillas; `agua-plomeria` tope 60 Semillas → con 16 h, 60 Semillas, 11 h con Semillas y 5 h sin Semillas. El resto, sin máximo.
- La ficha muestra "Máximo por persona: 10 h · las horas de más no generan Semillas" (o "60 Semillas"); sin tope, la línea no aparece (no es "sin dato": no tener máximo es una decisión del holón).

### 1 quater. Máximo total y quién administra los transversales (decisiones de Gus, 28-oct)

- `topeTotal: TopeTotal | null` (misma forma que `tope`): máximo de horas o de Semillas **sumando a todas las personas**, que fija quien administra el holón. Función pura `repartirConTopeTotal(personas, tope, topeTotal, valorHora)`: recorre a las personas en el orden en que se verificaron sus horas, aplica el máximo de cada una (`aplicarTope`) y después lo que queda del total. Lo que pasa del total no genera Semillas. Si Gus prefiere prorratear en vez de ir por orden, cambia solo esta función. Ejemplos: `valle-solar` 10 h por persona y 20 h en total; `agua-plomeria` 60 Semillas por persona y 150 en total; `monte-bioconstruccion` 40 h en total.
- `administradorDe(holon)`: los círculos transversales los administra y facilita **Hifa** (la IA); en el prototipo es simulado y experimental, con el super admin como respaldo humano si Hifa no está disponible. Los demás holones, personas. La ficha lo dice en las necesidades de un círculo transversal. La decisión definitiva depende de probar que Hifa sea estable y fiable. Esto reemplaza lo que decía "Holón de un círculo transversal" en Riesgos (lo avalaba el común): ahora lo administra Hifa, actuando por el círculo (el aval sigue afirmando `circulo:<id>`). Quién responde en la práctica lo resuelve `pacto-puntual`.
- Nombres: "Semillas pendientes" y "Semillas"; nunca "brotes" ni "germinar". Las decisiones sobre pasar de horas variables a fijas con Semillas pendientes (se reciben solo si el círculo las valida; si no, se pierden) y sobre los meses confirmados después del mínimo (se reciben al confirmarse) viven en `pactos-horas-variables`, donde se aplicó la spec; no se programan en este cambio.

Funciones puras: `necesidadesDe(tribuId, idioma)`, `buscarNecesidad(id, idioma)`, `circuloDeNecesidad(n, idioma)` (nombre del círculo o `undefined`), `holonDe(n)`, `avalDe(n)`, `tomable(n)` y `validarNecesidades(lista, avales)` (devuelve los errores; los tests la usan sobre los datos y sobre casos armados a mano).

### 1 bis. Holón y aval (D19, decisión de Gus del 28-oct)

```ts
type Holon =
  | { tipo: "circulo"; id: string; transversal: boolean } // círculo de la tribu o transversal en el que participa
  | { tipo: "tribu"; id: string }
  | { tipo: "comun" };                                    // previsto; sin necesidades de ejemplo en este cambio
function holonDe(n: NecesidadBilingue): Holon;            // su círculo si tiene; si no, su tribu
function idDeHolon(h: Holon): string;                     // "circulo:<id>" | "tribu:<id>" | "comunidad:lighthouse"

type AvalNecesidad = Omit<Registro, "esquema"> & { esquema: "avala-necesidad" };
// id: "ejemplo-aval-<necesidadId>"; afirma: idDeHolon(holonDe(n)); sobre: "necesidad:<id>";
// apuntaA: null; cuando: ISO; datos: { por: "ejemplo" }
const AVALES_DE_EJEMPLO: readonly AvalNecesidad[];
function avalDe(n, avales = AVALES_DE_EJEMPLO): AvalNecesidad | null; // solo si `afirma` es SU holón
function tomable(n, avales = AVALES_DE_EJEMPLO): boolean; // abierta && (campo || con aval)
```

- **Por qué el holón más chico.** Es el patrón de la holarquía: cada círculo decide dentro de su dominio ("Decide sobre") y lo que no le toca sube. Una tarea que vive en un círculo la avala el círculo; una que no tiene círculo, la tribu. Un círculo transversal cuelga del común, así que su aval lo da el común **actuando por ese círculo** (afirma igual `circulo:<id>`).
- **Quién administra cada holón**, en el prototipo, lo resuelve `pacto-puntual` (es el que tiene sesión y respuestas). Acá el aval es de ejemplo y no nombra a nadie: `datos.por = "ejemplo"`, y la ficha dice "Avalada por <holón> (ejemplo)".
- **Forma.** Se copia la forma de `Registro` (`lib/gobernanza/tipos.ts`: `id`, `esquema`, `afirma`, `sobre`, `apuntaA`, `cuando`, `datos`), que ya es la forma EAS de ADR-012 que usa la gobernanza. No se suma `"avala-necesidad"` al `Esquema` de gobernanza ni se guarda en `localStorage`: los avales viven en el código. Cuando haya un botón "Avalar", se guardan en el registro compartido de constancias que deja `pactos-dos-partes` y un aval se retira con un `revoca`, como el resto.
- Un aval cuyo `afirma` no es el holón de su necesidad no cuenta (`avalDe` lo ignora y la validación lo marca como error).

`busca` **no se deriva** de las necesidades: queda como está para no tocar el listado ni el mapa. El test de cobertura (una necesidad por etiqueta, en los dos idiomas) evita que se desincronicen.

### 2. Datos de ejemplo

| id | Título | Qué es | h | Tipo | Para cuándo | Habilidad | Estado | Círculo (holón) |
|---|---|---|---|---|---|---|---|---|
| `semilla-riego` | Riego | Diseñar el riego por goteo de la huerta intensiva | 20 | diseño · **con aval** | 2026-12-15 | permacultura | abierta | `semilla-1` (Huerta intensiva) |
| `barda-riego` | Riego | Instalar las mangueras de goteo en la hilera nueva de olivos | 12 | campo | 2026-11-30 | jardineria | abierta | `barda-0` (Olivos y aceite) |
| `monte-bioconstruccion` | Bioconstrucción | Levantar el muro de quincha del galpón de herramientas | 24 | campo | 2027-01-20 | bioconstruccion | abierta | `monte-1` (Bioconstrucción) |
| `monte-maquinaria` | Maquinaria | Mover tierra con un tractor prestado para la cortina forestal | 8 | campo | sin dato | otro: "Manejo de tractor" | tomada | `monte-0` (Forestación) |
| `agua-plomeria` | Plomería | Conectar la cisterna nueva con la red del núcleo común | 16 | campo | 2026-12-05 | otro: "Plomería" | abierta | `agua-0` (Toma y cisterna) |
| `agua-tratamiento` | Tratamiento de aguas | Diseñar el humedal que trata las aguas grises del barrio | 30 | diseño · **con aval** | 2027-02-28 | permacultura | abierta | `agua-1` (Tratamiento de aguas) |
| `valle-solar` | Energía solar | Montar dos paneles solares en el techo del salón común | 10 | campo | 2026-11-21 | otro: "Electricidad" | abierta | `valle-3` (Energía solar) |
| `valle-bioconstruccion` | Bioconstrucción | Revocar con barro las paredes de la casa 3 | 16 | campo | 2026-12-12 | bioconstruccion | hecha | `valle-1` (Arquitectura) |
| `valle-eventos` | Eventos y comunidad | Organizar la jornada de puertas abiertas del barrio | sin dato | campo | 2026-12-19 | coordinacion | abierta | `comunicacion-comun` (transversal) |
| `taller-textil` | Textil | Coser las fundas de los almohadones del salón de reparaciones | 6 | campo | sin dato | otro: "Costura" | abierta | `taller-2` (Reparación) |
| `avelan-alimentos` | Producción de alimentos | Diseñar el plan de huerta del núcleo | 20 | diseño · **con aval** | 2027-03-01 | permacultura | abierta | `avelan-area-0` (Nutrición) |
| `puerto-marketing` | Marketing | Armar la difusión del mercado mensual | 12 | diseño · **sin aval** | 2026-11-28 | comunicacion | abierta | `puerto-1` (Mercado) |

Máximos por persona de ejemplo: `valle-solar` 10 h y `agua-plomeria` 60 Semillas; las demás, sin máximo.

Todas las necesidades de ejemplo tienen círculo, así que su holón es el círculo. `valle-eventos` vive en un círculo transversal (`comunicacion-comun`), que cuelga del común. Los avales de ejemplo afirman `circulo:semilla-1`, `circulo:agua-1` y `circulo:avelan-area-0`; `puerto-marketing` queda sin aval para mostrar "Esperando el aval de Mercado".

El inglés lo escribe quien implementa y se lista en `lib/idioma/revision-nativa.ts`. Los datos son de ejemplo: se pueden ajustar sin tocar la spec, salvo los que usan los escenarios.

### 3. Pantalla

- En `app/tribus/[id]/page.tsx`, para tribus activas y en formación, `<Etiquetas items={t.busca} />` de "Lo que busca" se reemplaza por una `<ul>` de `<details id="necesidad-<id>">`. El `<summary>` lleva título, tipo ("De diseño" / "De campo") y estado ("Abierta" / "Tomada" / "Hecha"), en texto. Adentro, una `<dl>`: qué es, horas ("~20 h" o "sin dato"), para cuándo (fecha larga con `LOCALES` del idioma, o "sin dato"), habilidad (`textoDeRol`, o `habilidadOtra`), círculo (si hay), máximo por persona (si hay), y en las de diseño el aval ("Avalada por el círculo <nombre> (ejemplo)" o "Esperando el aval del círculo <nombre>"), y la marca "ejemplo". En el `<summary>` de una tarea de diseño sin aval, el estado dice "Abierta · esperando aval".
- La explicación del tipo va en el texto visible de la ficha abierta (no en un `title`).
- Abrir por ancla: un componente cliente chico que, al montar, lee `location.hash` y pone `open` en el `<details>` que corresponde. Sin JavaScript, el ancla igual lleva a la necesidad.
- La tarjeta de barrios vacantes no cambia.

## Riesgos

- **Duplicar "lo que busca".** Hay dos fuentes (etiquetas y necesidades). El test de cobertura lo controla; cuando haya base, las etiquetas se derivan de las necesidades abiertas.
- **Avales que nadie puede dar todavía.** En el prototipo una tarea de diseño sin aval queda así para siempre (no hay botón "Avalar"). Es a propósito: muestra la regla. El botón llega con la carga de necesidades por la tribu.
- **Tope en Semillas con horas enteras.** Con un tope en Semillas, `horasConSemillas` se redondea hacia abajo: puede marcar 1 h "sin Semillas" que en parte sí sumó. Es el lado prudente y se ve en la ficha; si Gus prefiere un solo tipo de tope, se borra una rama de `aplicarTope`.
- **Holón de un círculo transversal.** Lo administra y facilita Hifa (experimental, simulado), con el super admin de respaldo (ver 1 quater). Si la prueba de estabilidad sale mal, vuelve a personas y cambia `administradorDe` y `pacto-puntual` (quién responde), no el resto del modelo.
- **Máximo total por orden de verificación.** Quien verifica antes cobra primero; las últimas personas pueden quedar sin Semillas por el total. Es una regla a confirmar con Gus.
