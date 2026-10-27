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
  estado: EstadoNecesidad;     // de ejemplo
  circuloId?: string;
};
```

Funciones puras: `necesidadesDe(tribuId, idioma)`, `buscarNecesidad(id, idioma)`, `circuloDeNecesidad(n, idioma)` (nombre del círculo o `undefined`) y `validarNecesidades(lista)` (devuelve los errores; los tests la usan sobre los datos y sobre casos armados a mano).

`busca` **no se deriva** de las necesidades: queda como está para no tocar el listado ni el mapa. El test de cobertura (una necesidad por etiqueta, en los dos idiomas) evita que se desincronicen.

### 2. Datos de ejemplo

| id | Título | Qué es | h | Tipo | Para cuándo | Habilidad | Estado | Círculo |
|---|---|---|---|---|---|---|---|---|
| `semilla-riego` | Riego | Diseñar el riego por goteo de la huerta intensiva | 20 | diseño | 2026-12-15 | permacultura | abierta | `semilla-1` (Huerta intensiva) |
| `barda-riego` | Riego | Instalar las mangueras de goteo en la hilera nueva de olivos | 12 | campo | 2026-11-30 | jardineria | abierta | `barda-0` (Olivos y aceite) |
| `monte-bioconstruccion` | Bioconstrucción | Levantar el muro de quincha del galpón de herramientas | 24 | campo | 2027-01-20 | bioconstruccion | abierta | `monte-1` (Bioconstrucción) |
| `monte-maquinaria` | Maquinaria | Mover tierra con un tractor prestado para la cortina forestal | 8 | campo | sin dato | otro: "Manejo de tractor" | tomada | `monte-0` (Forestación) |
| `agua-plomeria` | Plomería | Conectar la cisterna nueva con la red del núcleo común | 16 | campo | 2026-12-05 | otro: "Plomería" | abierta | `agua-0` (Toma y cisterna) |
| `agua-tratamiento` | Tratamiento de aguas | Diseñar el humedal que trata las aguas grises del barrio | 30 | diseño | 2027-02-28 | permacultura | abierta | `agua-1` (Tratamiento de aguas) |
| `valle-solar` | Energía solar | Montar dos paneles solares en el techo del salón común | 10 | campo | 2026-11-21 | otro: "Electricidad" | abierta | `valle-3` (Energía solar) |
| `valle-bioconstruccion` | Bioconstrucción | Revocar con barro las paredes de la casa 3 | 16 | campo | 2026-12-12 | bioconstruccion | hecha | `valle-1` (Arquitectura) |
| `valle-eventos` | Eventos y comunidad | Organizar la jornada de puertas abiertas del barrio | sin dato | campo | 2026-12-19 | coordinacion | abierta | `comunicacion-comun` (transversal) |
| `taller-textil` | Textil | Coser las fundas de los almohadones del salón de reparaciones | 6 | campo | sin dato | otro: "Costura" | abierta | `taller-2` (Reparación) |
| `avelan-alimentos` | Producción de alimentos | Diseñar el plan de huerta del núcleo | 20 | diseño | 2027-03-01 | permacultura | abierta | `avelan-area-0` (Nutrición) |
| `puerto-marketing` | Marketing | Armar la difusión del mercado mensual | 12 | diseño | 2026-11-28 | comunicacion | abierta | `puerto-1` (Mercado) |

El inglés lo escribe quien implementa y se lista en `lib/idioma/revision-nativa.ts`. Los datos son de ejemplo: se pueden ajustar sin tocar la spec, salvo los que usan los escenarios.

### 3. Pantalla

- En `app/tribus/[id]/page.tsx`, para tribus activas y en formación, `<Etiquetas items={t.busca} />` de "Lo que busca" se reemplaza por una `<ul>` de `<details id="necesidad-<id>">`. El `<summary>` lleva título, tipo ("De diseño" / "De campo") y estado ("Abierta" / "Tomada" / "Hecha"), en texto. Adentro, una `<dl>`: qué es, horas ("~20 h" o "sin dato"), para cuándo (fecha larga con `LOCALES` del idioma, o "sin dato"), habilidad (`textoDeRol`, o `habilidadOtra`), círculo (si hay) y la marca "ejemplo".
- La explicación del tipo va en el texto visible de la ficha abierta (no en un `title`).
- Abrir por ancla: un componente cliente chico que, al montar, lee `location.hash` y pone `open` en el `<details>` que corresponde. Sin JavaScript, el ancla igual lleva a la necesidad.
- La tarjeta de barrios vacantes no cambia.

## Riesgos

- **Duplicar "lo que busca".** Hay dos fuentes (etiquetas y necesidades). El test de cobertura lo controla; cuando haya base, las etiquetas se derivan de las necesidades abiertas.
- **"De diseño" sin aval.** Puede leerse como que cualquiera puede tomar una tarea de diseño. Es justo lo que D19 tiene que decidir; acá solo se etiqueta.
