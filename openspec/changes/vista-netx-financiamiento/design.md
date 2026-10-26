# Design

## Contexto

- **Pedido de Gus (23-oct-2026):** la Vista NetX tiene que mostrar al equipo directivo (Franz, CEO; Vagner, finanzas) que NetX se financia sin vender lotes, como relato con pestañas; el simulador de la tokenomics sale del Fogón y va como pestaña de `/netx`.
- **Respuestas de Gus al PR #108 (26-oct-2026):**
  1. Los números incómodos quedan visibles en "Lo que tiene que ser cierto", cada uno con la **palanca** que lo movería (§5.7). "Estamos a tiempo de cambiar las asunciones y parámetros de diseño": las palancas lo dicen como texto, sin números nuevos y sin editar NS_Tokenomics.
  2. La vista trabaja bajo las asunciones legales del diseño definidas hasta ahora (excepción de prototipo interno a D9). Lo legal lleva ⚖ y "a verificar con abogado".
  3. Dónde van las operaciones del super admin: decisión de diseño abierta, Gus quiere ver alternativas gráficas (§3.1). Por defecto, en "Comunidad y embudo".
  4. Lenguaje: **Juego A** (el camino conocido: vender tierra) contra **Juego B** (procomún). Tono respetuoso, sin acusar a nadie (§5.6). "Diseño B" solo al citar doc 28.
  5. Instrumentos (SAFU, oferta privada, tokenización CNV): alcanza con ⚖ y "a verificar con abogado"; no hay presupuesto para consultoría legal.
  6. El relato es para toda persona con sesión; las operaciones, solo super admin (§2).
- **Dependencia:** `fogon-simulador-parametros` (PR #96 spec, PR #107 implementación). Trae `lib/series/` (`correrSerie`, `porMil`, `VERSION_MODELO`, `formato.ts` con `usd`, `pct`, `multiplo`), `app/fogon/simulador/`, los términos ⚖ del diseño B (`unidadesregeneracion`, `notasverdes`, `primeraperdida`, `safu`, `serieprograma`, `avisosimulador`) y ADR-010. Al 23-oct **no está en `dev`**. Si al arrancar la noche `lib/series/modelo.ts` no existe en `dev`, el implementador frena y lo reporta.
- **Fuentes** (todas en `NS_Tokenomics`, rama `main`, leídas el 23-oct-2026; el implementador no necesita abrirlas, este documento copia lo que hace falta):
  - doc 30 "How NetX Gen gets capitalised" (v0.1, 17-oct-2026): tres bolsillos, etapas, SAFE, comisión de desarrollo, consumo, cuenta de la pista y lotes.
  - doc 28 "Tokenomics for design B" (v0.1, 17-oct-2026) y `sim/series_waterfall_sim.py` → `RESULTS_series_waterfall.md` (ya traducido en `lib/series`).
  - `sim/platform_revenue_sim.py` → `RESULTS_platform_revenue.md` (v0.1, 17-oct-2026).
  - doc 29 §5 y `sim/series_montecarlo_sim.py` → `RESULTS_series_montecarlo.md` (v0.1, 17-oct-2026, N = 2.000, semilla 7).
  - `07` I-15: el Congreso se canceló el 23-oct; el modelo de la plataforma y el Pase Fundador todavía lo suponen.
- **No se usa** `RESULTS_value_model.md`: es la tokenomics anterior al diseño B (RAIZ con curva y unidades sobre la tierra), que `NS_Tokenomics` mantiene solo como insumo (AGENTS.md).

## Objetivos / No objetivos

- Objetivo: una estructura de pestañas estable, el simulador en su lugar nuevo, y un Resumen de una pantalla cuyos números salen de funciones puras testeadas contra los RESULTS.
- No objetivo: la pestaña "Modelo de financiamiento" (cambio 2), cambiar el simulador, re-correr o mejorar los modelos.

## 1. Archivos

```
lib/financiamiento/
  fuentes.ts        VERSIONES y constantes con fuente (consumo, SAFE, comisión de desarrollo, contrato de diseño = null)
  plataforma.ts     correrPlataforma(), ESCENARIOS_PLATAFORMA, recaudacionPase(), PASE_ESCENARIOS, redondearComoPython()
  pista.ts          capitalNecesario(), comisionDesarrollo()
  riesgo.ts         MONTE_CARLO (tabla copiada, ADR-014)
  juegos.ts         JUEGO_A, JUEGO_B, PROCOMUN_EN_SIMPLE, PALABRAS_QUE_NO_VAN (§5.6)
  palancas.ts       PALANCAS (§5.7)
  resumen.ts        armarResumen(): junta lo de arriba con correrSerie() de lib/series
  *.test.ts
app/netx/
  layout.tsx        aviso de prototipo + "← Inicio" + <Pestanas/> (sin SoloSuperAdmin: ver §2) + metadata.robots noindex <!-- arquitecto: §2, ADR-015 -->
  pestanas.tsx      cliente: usePathname + useSesion, enlaces con aria-current
  page.tsx          Resumen (servidor)
  resumen/…         piezas del Resumen si hace falta partir el archivo
  comunidad/page.tsx      contenido actual de /netx, envuelto en SoloSuperAdmin
  comunidad/operaciones.tsx  PanelPersonas + PostulacionesComunidades + BandejaPedidos en un solo componente (§3.1)
  simulador/page.tsx + simulador-cliente.tsx  movidos desde app/fogon/simulador/
app/fogon/simulador/page.tsx   solo redirect("/netx/simulador")
components/barras-reparto.tsx  gráfico de barras horizontales con tabla equivalente
lib/permisos/niveles.ts        capacidad nueva "vista-netx" (§2)
components/sesion/enlace-netx.tsx   visible con sesión (§2)
components/sesion/solo-super-admin.tsx  solo cambia el texto de la bajada (§2)
```

`lib/financiamiento/` no importa React, Next ni nada de `app/` (test de fuente, como `lib/series`). Puede importar `@/lib/series`.

## 2. Pestañas

- `app/netx/layout.tsx` **no** envuelve en `SoloSuperAdmin` (cambio del 26-oct). Dentro: contenedor `mx-auto max-w-5xl p-6 sm:p-10`, enlace "← Inicio", aviso "Prototipo interno · datos de ejemplo" y `<Pestanas/>`. La `Puerta` del layout raíz ya decide si la persona entra (ver "Quién ve qué").
- `Pestanas` es un `<nav aria-label="Secciones de la Vista NetX">` con una `<ul>` de `Link`. Activa = **igualdad exacta** de ruta (`usePathname() === href`), no `esActivo` (que marcaría "Resumen" en todas). La activa lleva `aria-current="page"` y además negrita y subrayado (no solo color). `flex flex-wrap gap-2` para que a 390 px baje de línea y no desborde.
- Lista en este cambio: Resumen `/netx`, Simulador `/netx/simulador`, Comunidad y embudo `/netx/comunidad`. Es un arreglo exportado (`PESTANAS_NETX: { href, etiqueta, soloSuperAdmin?: true }[]`) para que el cambio 2 sume "Modelo de financiamiento" `/netx/financiamiento` en segundo lugar sin tocar el componente. "Comunidad y embudo" lleva `soloSuperAdmin: true`: `Pestanas` la filtra con `useSesion()` (`sesion?.rol === "superadmin"`).
- No se usa el patrón ARIA `tablist`: son navegaciones entre páginas, no paneles en la misma página.
- `metadata.title` por página: "Vista NetX · Resumen", "Simulador de la tokenomics", "Vista NetX · Comunidad y embudo".

### Quién ve qué (Gus, 26-oct-2026)

| Qué | Quién | Dónde se controla |
|---|---|---|
| Resumen, Simulador (y Modelo de financiamiento, cambio 2) | Toda persona con sesión (nivel Explorador o más) | `Puerta` del layout raíz con la capacidad `vista-netx` |
| Comunidad y embudo (embudo, panel de personas y roles, postulaciones, bandeja) | Solo super admin | `SoloSuperAdmin` en `app/netx/comunidad/page.tsx` + `/api/personas` (403 en el servidor) |
| Enlace "NetX" de la barra | Toda persona con sesión | `EnlaceNetx` |

- **`lib/permisos/niveles.ts`:** nueva `Capacidad` `"vista-netx"` con `NIVEL_MINIMO` `"explorador"`. `capacidadDeRuta`: `/netx/comunidad` (y lo que cuelgue de ahí) → `"netx"`; el resto de `/netx` → `"vista-netx"`. Sin sesión, `Puerta` lleva a Sumarte con `?volver=/netx` (camino que ya existe para páginas personales). Para `/netx/comunidad` sigue el caso especial de `Puerta` ("NetX no redirige": la página explica que es solo del super admin). `avisoDeRuta("/netx")` pasa a dar el aviso de Explorador; `avisoDeRuta("/netx/comunidad")`, el de super admin.
- **`EnlaceNetx`:** se muestra si `estado === "ok"` y `puedeCapacidad(nivel, "vista-netx")`; el comentario de la barra superior deja de decir "solo super admin". Conserva la marca "interno".
- **`SoloSuperAdmin`:** la bajada pasa a "Esta sección de la Vista NetX es solo para el super admin del prototipo."; el h1 "No tenés acceso a esta vista" no cambia (lo prueban los e2e).
- **¿Con sesión o pública?** Con sesión. Gus dejó la opción abierta ("o para todos si ya es pública") y la vista no es pública hoy: `/netx` no está en `lib/sesion/rutas-publicas.ts`. Razones para no abrirla: (a) Gus dijo que en esta etapa se comparte solo con gente de NetXGen, y una ruta pública queda a un enlace de cualquiera; (b) el relato habla de captar inversión (SAFE, SAFU, Unidades) con textos legales en borrador, y CLAUDE.md pide revisar estas reglas (R14) antes de mostrar la plataforma afuera; (c) con sesión es el camino que la plataforma ya resuelve (Sumarte con vuelta), sin código nuevo de acceso.
- **Ojo: "con sesión" hoy no es "solo NetXGen".** Por defecto el acceso es abierto: quien se registra con un email válido entra como Explorador (`lib/sesion/personas.ts`); solo con `LH_ACCESO=lista` la lista se cierra. Para que la Vista NetX quede de verdad dentro de NetXGen, el entorno que se comparta tiene que tener `LH_ACCESO=lista`. Eso es configuración de Vercel, no código de este cambio: queda como pregunta para Gus.

<!-- arquitecto: límite conocido del control de acceso (actualizado el 26-oct) -->
- **Límite conocido del control de acceso, ahora intencional para el relato.** `Puerta` y `SoloSuperAdmin` son componentes de cliente: ocultan, pero lo que renderiza el servidor viaja igual en la respuesta de la página. Para el relato esto ya no es un riesgo sino lo buscado: los números del Resumen, del simulador y del modelo son de ejemplo, salen de NS_Tokenomics y ahora los ve toda persona con sesión. Lo que sí hay que cuidar: alguien sin sesión que pida la página directamente puede leer esos números en la respuesta. Se acepta para el prototipo (son números ilustrativos, sin datos personales) y queda escrito. Regla que se mantiene para este cambio y el siguiente: **ninguna pestaña de `/netx` lee datos de personas desde el servidor de la página**; las operaciones leen por `/api/*`, que verifica el rol en el servidor (como `/api/personas`), o desde el navegador (bandeja y postulaciones). Si alguna pestaña necesita datos reales o sensibles, o si la vista se muestra fuera de NetXGen, el control pasa al servidor (layout que lee la sesión y no renderiza los hijos) con otro cambio.

<!-- arquitecto: revisión del 26-oct sobre la apertura a toda persona con sesión (ADR-015, Propuesta) -->
- **Qué protege cada capa, dicho sin vueltas** (ADR-015):
  - *Relato* (Resumen, Simulador, Modelo): oculto en el navegador. Quien tenga la dirección puede leer los números en el código de la respuesta aunque no tenga sesión. En la práctica es "público para quien tenga el enlace", no "solo con sesión". Se acepta porque no hay datos de personas y los números son ilustrativos de NS_Tokenomics.
  - *Comunidad y embudo*: el embudo, el cumplimiento y las tribus son constantes de ejemplo (`lib/vista-netx/datos`): mismo caso que el relato. El panel de personas lee por `/api/personas`, que verifica el rol en el servidor (403): **esto es lo único que hoy protege el servidor**. La bandeja de pedidos y las postulaciones leen el almacenamiento de **este navegador** (`leerBandejaDelNavegador`, `leerPostulacionesDelNavegador`): no hay dato del servidor que proteger, y el super admin solo ve lo que se cargó en su propio navegador.
  - **Regla para cuando la bandeja o las postulaciones pasen a la base:** su lectura va por una ruta `/api/*` que use la sesión del servidor y responda 403 a quien no es super admin, igual que `/api/personas`. Ocultarlas con `SoloSuperAdmin` deja de alcanzar en ese momento.
- **Que no la encuentren los buscadores.** `app/netx/layout.tsx` exporta `metadata.robots = { index: false, follow: false }`. Cuesta una línea y evita que una dirección compartida termine indexada mientras el relato es legible sin sesión.
- **Modo de prueba en previews.** Con `LH_AUTH_PRUEBA=1` (previews, nunca producción) cualquiera con la dirección del preview entra como un email `.test`, incluido el super admin de prueba si figura en `LH_PERSONAS` del preview. Ya era así antes de este cambio y los previews no tienen datos reales (ADR-008): no cambia nada, pero "con sesión" en un preview equivale a "con la dirección".
- **Una sola fuente para "es super admin".** `Pestanas` y `SoloSuperAdmin` usan `sesion?.rol === "superadmin"` (el rol que devuelve `/api/sesion`, calculado en el servidor desde `LH_PERSONAS`); `EnlaceNetx` y la `Puerta` usan el nivel, que vale `superadmin` solo con ese mismo rol (`lib/sesion/nivel.ts`). No se agrega otra forma de decidirlo.

## 3. Comunidad y embudo

`app/netx/comunidad/page.tsx` = el `VistaNetx` actual **envuelto en `SoloSuperAdmin`** (la página entera, también el embudo), sin el aviso de prototipo (lo pone el layout) y con:
- rótulo "Vista NetX · solo super admin", h1 **"Comunidad y embudo"**, bajada "Embudo, tribus y cumplimiento. Todos los datos de esta vista son de ejemplo." (se conserva el texto que ya prueban los e2e).
- El enlace "← Inicio" pasa al layout.
- Todo lo demás igual (indicadores, embudo, cumplimiento, tribus). `PanelPersonas`, `PostulacionesComunidades` y `BandejaPedidos` se juntan en `app/netx/comunidad/operaciones.tsx` (`<Operaciones/>`, una `section` con h2 "Operaciones del super admin"), sin cambiar su comportamiento. Así, si Gus elige otra ubicación (§3.1), moverlas es cambiar dónde se importa `<Operaciones/>`.

### 3.1 Decisión de diseño abierta: dónde van las operaciones

Gus (26-oct) quiere ver alternativas gráficas antes de decidir. Este cambio implementa **A** (por defecto). Las demás quedan descritas para que alguien arme las maquetas (fuera de esta noche):

| | Dónde | A favor | En contra |
|---|---|---|---|
| **A · por defecto** | Dentro de "Comunidad y embudo", al final, que entera es solo super admin | Cero rutas nuevas; es lo que hay hoy | El embudo (de ejemplo) queda escondido para el resto del equipo |
| B | Pestaña propia "Operaciones" (`/netx/operaciones`, solo super admin); "Comunidad y embudo" se abre a toda persona con sesión | Separa relato y trabajo; el equipo ve el embudo | Una pestaña más; mover rutas de e2e otra vez |
| C | Fuera de la Vista NetX, en un espacio de administración propio (por ejemplo, desde el menú de la persona) | La Vista NetX queda solo como relato | Página nueva y entrada nueva en la navegación |
| D | Panel desplegable "Operaciones" en el Resumen, visible solo para el super admin | Todo a mano en la reunión | Mezcla el relato con el trabajo diario |

La decisión no cambia las reglas de acceso: las operaciones siguen solo para el super admin y sus datos siguen protegidos en el servidor.

## 4. Simulador

- Mover `app/fogon/simulador/page.tsx` y `simulador-cliente.tsx` a `app/netx/simulador/` (`git mv`). En la página: quitar "← Fogón", el aviso "Prototipo interno · datos de ejemplo" (lo pone el layout) y el rótulo "Fogón de decisiones"; poner el rótulo "Vista NetX" y el enlace "← Vista NetX" a `/netx` (lo pide el delta de `fogon-simulador`). <!-- arquitecto: alinear con el delta de fogon-simulador, que exige "← Vista NetX" --> El h1 pasa de "Simulador de la tokenomics (diseño B)" a **"Simulador de la tokenomics"** y debajo va la bajada "Modelo de NS_Tokenomics doc 28 (diseño B): el Juego B en números." (cita del documento técnico, la única forma permitida de "diseño B"). Se queda el aviso `TERMINOS.avisosimulador` y todo el cliente igual.
- `app/fogon/page.tsx`: borrar el bloque "Simulador de la tokenomics" (es el único otro lugar con "diseño B" en la pantalla).
- `app/fogon/simulador/page.tsx` nuevo: `import { redirect } from "next/navigation"; export default function () { redirect("/netx/simulador"); }`. La redirección corre en el servidor antes de la `Puerta`, así que vale para cualquier nivel; en `/netx/simulador` decide la capacidad `vista-netx`.
- Permisos: el simulador pasa de "participar" (Miembro, en el Fogón) a `vista-netx` (Explorador, con sesión). Ver §2.

## 5. Números (`lib/financiamiento/`)

### 5.1 Fuentes y constantes (`fuentes.ts`)

```ts
export const VERSIONES = {
  capitalizacion: { fuente: "NS_Tokenomics doc 30", version: "v0.1", fecha: "2026-10-17" },
  plataforma: { fuente: "NS_Tokenomics/sim/platform_revenue_sim.py", version: "v0.1", fecha: "2026-10-17" },
  monteCarlo: { fuente: "NS_Tokenomics/sim/series_montecarlo_sim.py", version: "v0.1", fecha: "2026-10-17" },
  // series: VERSION_MODELO de lib/series (v0.1, 2026-10-17)
} as const;

type Supuesto = { valor: number | null; fuente: string; aConfirmar?: string };

CONSUMO_MENSUAL_USD: Supuesto = { valor: 31000, fuente: "doc 30 §2b (doc 12, modelo de Vagner)", aConfirmar: "Vagner" }
META_SAFE_USD = { min: 375000, max: 500000, fuente: "doc 30 §2 (doc 12)", aConfirmar: "Vagner" }
COMISION_DESARROLLO = { min: 0.03, max: 0.05, fuente: "doc 30 §2 (parámetro)", aConfirmar: "Vagner" }
CONTRATO_DISENO_BIOPUEBLO_USD: Supuesto = { valor: null, fuente: "doc 30 §2 (a cotizar)" }
```

### 5.2 Ingresos de la plataforma (`plataforma.ts`), traducción fiel de `platform_revenue_sim.py`

```
MESES = 36; CONSUMO = 31000; PARTE_ANUAL = 0.6
ARPU = PARTE_ANUAL * 100 / 12 + (1 - PARTE_ANUAL) * 10      // 9,00 USD por miembro por mes
PRECIO_TRIBU = 60
ESCENARIOS_PLATAFORMA (clave, etiqueta, inicio, crecimiento, pagan, baja, tribus[12,24,36]):
  bajo  "Bajo"                  300  25  0.03  0.03   (2, 4, 6)
  base  "Base (no optimista)"   500  60  0.05  0.025  (4, 8, 10)
  bueno "Bueno"                 800 120  0.07  0.02   (6, 12, 16)

tribusEn(m, t): m ≤ 12 → r(t0·m/12); m ≤ 24 → r(t0 + (t1−t0)·(m−12)/12); si no → r(t1 + (t2−t1)·(m−24)/12)
correr(p): usuarios = inicio; pagan = usuarios·pagan
  para m de 1 a 36: usuarios += crecimiento; pagan = pagan·(1−baja) + crecimiento·pagan_tasa
                    ingreso = pagan·ARPU + tribusEn(m)·PRECIO_TRIBU; total += ingreso
  devuelve filas { mes, usuarios, pagan, tribus, ingreso, pctConsumo: ingreso / CONSUMO } y total, mesesCubiertos = total / CONSUMO
```

**Redondeo:** `r` es `round()` de Python 3, que redondea la mitad al par (2,5 → 2; 3,5 → 4; 0,5 → 0). `Math.round` daría 3 y cambiaría los totales (unos USD 180 en el bajo, 60 en el base y 360 en el bueno). Se implementa `redondearComoPython(x)`: si `x − floor(x) === 0.5`, el par entre `floor` y `floor + 1`; si no, `Math.round(x)`.

**Pase Fundador** (`PASE_ESCENARIOS`, Semilla USD 300 · Brote 1.500 · Raíz 5.000): bajo (40, 15, 3), base (70, 30, 6), bueno (120, 50, 12); `recaudacionPase` = suma; `alcanzaMinimo` = recaudado ≥ 75.000. Es **plata del procomún**: el tipo lo dice (`destino: "procomun"`) y `armarResumen` no lo suma a NetX.

**Marca del Congreso:** `SUPUESTO_CONGRESO = "Supone el Congreso de febrero 2027 (cancelado el 23-oct-2026): falta re-correr el modelo (NS_Tokenomics I-15)."`. La usan las membresías y el Pase.

### 5.3 Pista (`pista.ts`)

- `capitalNecesario(consumoMensual, tasa)` = `consumoMensual × 12 / tasa`; `null` si algún dato es `null`, no finito, o `tasa ≤ 0`. Con 31.000: 1,5 % → 24.800.000; 1 % → 37.200.000 (doc 30 lo redondea a "≈ USD 25M" y "USD 37M").
- `comisionDesarrollo(capex)` = `{ min: capex × 0,03, max: capex × 0,05 }`; `null` si `capex` no es un número finito positivo. Agrovoltaica: capex = `levantado` de `correrSerie("agrovoltaica", …)` = 4.000.000 → 120.000 a 200.000.

### 5.4 Monte Carlo (`riesgo.ts`) — tabla copiada (ADR-014)

`series_montecarlo_sim.py` sortea con el generador de Python (`random.gauss`, semilla 7); reproducirlo en el navegador obligaría a copiar ese generador bit a bit. Se copia el resultado tal cual, con su versión:

| Serie | TIR Unidades P10 / P50 / P90 | Fundación recibe P10 / P50 / P90 (USD) | Múltiplo 1ª pérdida P10 / P50 / P90 | P(pierden) | P(llegan al tope) | P(1ª pérdida no se recupera) |
|---|---|---|---|---|---|---|
| vinedo | −0,026 / 0,084 / 0,108 | 115.739 / 160.220 / 1.332.549 | 0 / 0 / 1,80 | 0,22 | 0,44 | 0,60 |
| agrovoltaica | 0,012 / 0,085 / 0,140 | 401.326 / 540.348 / 5.948.468 | 0 / 0 / 2,33 | 0,10 | 0,42 | 0,61 |

También: `SUPUESTOS_MONTE_CARLO` en texto (doc 29 §5): viñedo — helada en 15 % de los años (se pierde 60 % de la cosecha), precio del vino ±20 %, costos ±15 %, rendimiento ±15 %, demora de permisos 0 a 2 años; agrovoltaica — precio de la energía ±25 %, producción ±5 %, sobrecosto 5 % ±10 %, demora de conexión 0 a 2 años. Todos "a confirmar con Vagner". El Resumen usa solo TIR y P(pierden); el resto lo usa el cambio 2.

### 5.5 Resumen (`resumen.ts`)

`armarResumen()` corre `correrSerie` para los dos escenarios con sus valores de partida (los de `lib/series/escenarios.ts`) y devuelve:

```ts
type Resumen = {
  netx: { safe: {min,max}; gestionAnual: { vinedo: number; agrovoltaica: number };
          desarrolloAgrovoltaica: {min,max} | null; plataformaMes36: Record<Escenario, {ingreso, pctConsumo}>;
          contratoDiseno: null };
  procomun: { vinedo: { total, anios: 15 }; agrovoltaica: { total, anios: 20 };
              pase: Record<Escenario, { recaudado, alcanzaMinimo }> };
  inversores: { vinedo: { multiplo, tir, anios }; agrovoltaica: { multiplo, tir, anios; notasTir } };
  reparto: Record<Serie, { destino: "procomun"|"netx"|"unidades"|"primeraPerdida"|"notas"; monto: number | null }[]>;
  riesgo: Record<Serie, { p10, p50, p90, pPierden }>;
  pista: { consumoMensual, consumoAnual, capital15, capital10 };
  incomodos: { capital15, capital10, membresiasPct: Record<Escenario, number>,
               primeraNoRecupera: Record<Serie, number>, contratoDiseno: null };
};
```

`gestionAnual` = `netx.recibe / horizonte` (viñedo 128.250 / 15 = 8.550; agrovoltaica 800.000 / 20 = 40.000). En `reparto`, "notas" del viñedo es `null` (la serie no tiene Notas): la tabla dice "no tiene" y el gráfico no dibuja la barra. `incomodos.primeraNoRecupera` sale de `MONTE_CARLO` (0,60 y 0,61); `membresiasPct`, de `plataformaMes36`.

### 5.6 Juego A y Juego B (`juegos.ts`)

Textos como datos, cada uno con `fuente`. Pedido de Gus del 26-oct: el relato contrasta dos juegos, con respeto por el Juego A (hoy Franz, CEO, propone vender tierras: el texto no lo nombra ni lo acusa).

```ts
PROCOMUN_EN_SIMPLE = "Procomún: lo que es de todos y se cuida entre todos, como el agua, el suelo o un camino del barrio."
JUEGO_A = {
  titulo: "Juego A · el camino conocido",
  idea: "Vender la tierra en lotes. Es lo que hace la mayoría y se entiende rápido.",
  costos: [
    "Antes de la aprobación municipal no se puede ofrecer, reservar ni dar prioridad sobre lotes (Ordenanza 173 ⚖).",
    "La plata entra una sola vez, el día de la venta.",
    "La tierra se va: lo que se regenere después lo aprovecha otro.",
  ],
  fuente: "NS_Tokenomics doc 30 §3",
}
JUEGO_B = {
  titulo: "Juego B · el procomún",
  idea: "La tierra queda en una Fundación y se cuida entre todos. La regeneración y la vida van al centro.",
  suma: [
    "Seguimos teniendo ingresos: NetX cobra por diseñar, gestionar y operar.",
    "La tierra queda: nadie la vende y cada serie paga al procomún antes que a cualquier inversor.",
    "El valor crece para todos: la tierra regenerada vale más y ese valor se queda en el procomún.",
  ],
  fuente: "NS_Tokenomics doc 25, doc 28 §1 y doc 30 §1",
}
PALABRAS_QUE_NO_VAN = ["capitalista", "extractivista", "colonialista", "Franz", "diseño B"]
```

- Test: ningún texto de `JUEGO_A`, `JUEGO_B`, `PROCOMUN_EN_SIMPLE` ni `PALANCAS` contiene una palabra de `PALABRAS_QUE_NO_VAN` (sin distinguir mayúsculas). El e2e hace lo mismo sobre el texto de la página.
- "Diseño B" solo puede aparecer en la línea de fuentes, junto a "doc 28" (lo prueba el e2e).
- Elinor Ostrom va solo en la nota de fuentes: "La idea de procomún sigue el trabajo de Elinor Ostrom sobre bienes comunes."

### 5.7 Palancas (`palancas.ts`)

Para cada número incómodo, qué supuesto del diseño lo movería y en qué dirección. **Sin cifras** (test: ningún texto de palanca tiene dígitos; la fuente va en un campo aparte). Cada una cierra con "para discutir, no es una decisión".

```ts
type Palanca = { id: "capital" | "membresias" | "primeraPerdida" | "contratoDiseno";
                 numero: string;   // qué número incómodo explica (texto, sin cifras: la cifra la pone la página)
                 supuesto: string; direccion: string; fuente: string };
```

| id | Supuesto que se puede mover | Dirección | Fuente |
|---|---|---|---|
| capital | El consumo del equipo y la comisión de gestión | Bajar el consumo (empezando por la parte "otros" que todavía no tiene desglose) o subir la comisión dentro del rango del modelo baja el capital bajo gestión necesario; sumar ingresos por trabajo que no dependan de la comisión de gestión (comisión de desarrollo, contratos de operación, licencias del kit a otros proyectos) acorta el tiempo de puente | doc 30 §2 y §2b; `capitalNecesario` |
| membresias | Precios de los planes (son de ejemplo), cuántos pasan a pagar y licenciar la plataforma a otros proyectos | Las suscripciones solas no mueven la cuenta; la palanca que la cambia es licenciar la plataforma y el kit a otros proyectos, cobrando como parte de su presupuesto de desarrollo y no como suscripción. Además, re-correr el modelo sin el Congreso cambia el punto de partida | doc 30 §2b; NS_Tokenomics I-15 |
| primeraPerdida | El lugar de la primera pérdida en la cascada | Ponerla antes del tope de las Unidades (retorno preferente para las Unidades, después la primera pérdida, después el tope) la hace recuperable en más futuros; un seguro o reserva contra heladas y abrir series solo con los permisos dados bajan el riesgo de fondo | doc 29 §5, hallazgos 1 y 3 |
| contratoDiseno | El alcance del primer contrato con BioPueblo | Cotizar primero una parte chica (la hectárea piloto y el primer barrio) da un primer monto sin esperar al plan de todo el territorio | doc 30 §2 y §4 |

La página arma cada fila como: número incómodo (con su cifra desde `armarResumen`) · "Palanca:" + `direccion` · "Fuente: " + `fuente` · "para discutir, no es una decisión".

## 6. Pantalla del Resumen (`app/netx/page.tsx`)

De arriba hacia abajo, con tokens del tema y `CARTA = "rounded-xl border border-faint bg-surface p-4"` como hoy:

1. Rótulo "Vista NetX · para el equipo de NetXGen", h1 "¿Cómo se financia NetX sin vender lotes?".
2. Aviso `TERMINOS.avisosimulador.texto` (estilo de aviso, `bg-warn-bg text-warn-ink`).
3. Respuesta corta (doc 30, "In one breath", en castellano): "NetX es la empresa que diseña, gestiona y opera la plataforma. Cobra por su trabajo, no por vender tierra: en el Juego B, la tierra queda en una Fundación ⚖ y la plata de los proyectos entra por series ⚖ del programa de fideicomisos." <!-- arquitecto: la Fundación todavía no existe ni recibió la tierra; se dice "en el Juego B" (antes "en el diseño B") para no presentarlo como hecho -->
3b. **Juego A y Juego B** (`section`, `h2` "Dos juegos"; `grid md:grid-cols-2`, cada juego un `CARTA` con `h3`): textos de `JUEGO_A` y `JUEGO_B` (§5.6), y debajo `PROCOMUN_EN_SIMPLE`. Los dos con el mismo estilo y el mismo peso visual (ninguno en "rojo" ni tachado): el contraste está en el texto.

4. **Tres bolsillos** (`grid md:grid-cols-3`, cada uno `section` con `h2`):
   - "NetX · la empresa": lista con "Ahora · SAFE de la empresa ⚖(`safe`): USD 375.000 a 500.000 (meta) · a confirmar con Vagner"; "Ahora · contrato de diseño con BioPueblo: sin dato (a cotizar)"; "2027–2028 · comisión de desarrollo: 3 a 5 % del capex, una vez (agrovoltaica: USD 120.000 a 200.000)"; "Por año · comisión de gestión: USD 8.550 (viñedo) · USD 40.000 (agrovoltaica)"; "Membresías y Plan Tribu: USD 1.336 por mes al mes 36 (escenario base)" + marca del Congreso.
   - "Procomún · Fundación": "Viñedo: USD 306.970 en 15 años"; "Agrovoltaica: USD 1.357.031 en 20 años" ("canon, regalía y excedente sobre el tope; cobra antes que cualquier inversor"); "Pase Fundador ⚖(`pasefundador`): USD 49.500 · 96.000 · 171.000 (bajo · base · bueno) — va al procomún, no a NetX; el escenario bajo no llega al mínimo de USD 75.000" + marca del Congreso.
   - "Inversores de las series": "Unidades de Regeneración ⚖ del viñedo: 2,66x · TIR 9,2 % en 15 años"; "de la agrovoltaica: 2,84x · TIR 10,3 % en 20 años"; "Notas Verdes ⚖: TIR 7,0 %"; "Primera pérdida ⚖: TIR 4,0 % (viñedo) · 5,0 % (agrovoltaica)". "Supuestos del modelo a confirmar con Vagner".
5. **Gráfico** `BarrasReparto` (§7) con título "¿Adónde va lo que paga cada serie? (valores de partida)".
6. **Rangos de riesgo** (`section`, `h2` "¿Y si sale peor?"): por serie, "TIR de las Unidades en 2.000 futuros simulados: −2,6 % · 8,4 % · 10,8 % (P10 · P50 · P90) · 22 % de los futuros pierden plata". Texto: "Son futuros simulados con heladas, demoras y precios inciertos, no un pronóstico."
7. **Lo que tiene que ser cierto** (`h2`). Bajada: "Estos números no ayudan al relato y se muestran igual. Estamos a tiempo de cambiar los supuestos del diseño: al lado de cada uno va la palanca que lo movería." Lista `ol` de cuatro ítems; cada uno con el número incómodo, y debajo "Palanca:" + texto de `PALANCAS` (§5.7) + "Fuente: …" + "para discutir, no es una decisión":
   1. "El equipo consume USD 31.000 por mes (USD 372.000 por año) · a confirmar con Vagner. Para pagarlo solo con comisiones de gestión hacen falta USD 24,8 M bajo gestión al 1,5 % o USD 37,2 M al 1 %. Hasta llegar ahí, NetX vive del SAFE, los contratos de diseño y las comisiones de desarrollo." (palanca `capital`)
   2. "Las membresías cubren 1,7 % · 4,3 % · 10,2 % del consumo al mes 36 (bajo · base · bueno): la plataforma vale por lo que trae (miembros, inversores, tribus) y por lo que se puede licenciar, no por sus suscripciones." + marca del Congreso (palanca `membresias`)
   3. "La primera pérdida ⚖ no se recupera completa en el 60 % (viñedo) y el 61 % (agrovoltaica) de los futuros simulados." (palanca `primeraPerdida`)
   4. "El contrato de diseño con BioPueblo, que es el puente que no necesita aprobaciones, está sin dato (a cotizar)." (palanca `contratoDiseno`)
8. **¿Y vender lotes?** (`h2`): tres ítems — "No se puede: antes de la aprobación municipal no se ofrecen, reservan ni prometen lotes ⚖(`ordenanza173`)."; "No hace falta: la plata entra por las series y por el trabajo de NetX."; "En el Juego B, la tierra queda en una Fundación: no hay lotes de NetX para vender." Sin "reservá", "prioridad" ni precios de lotes.
9. **Fuentes** (`p` chica, `text-muted`): "Fuentes: NS_Tokenomics doc 28 (diseño B), 29 y 30 (v0.1, 17-oct-2026); series_waterfall_sim.py v0.1, 17-oct-2026; platform_revenue_sim.py v0.1, 17-oct-2026; series_montecarlo_sim.py v0.1, 17-oct-2026 (2.000 futuros, semilla 7). La idea de procomún sigue el trabajo de Elinor Ostrom sobre bienes comunes." armado desde `VERSIONES` y `VERSION_MODELO`. Es el único lugar de la página con "diseño B".

**Tono** (Gus, 26-oct): el Juego A es "el camino conocido" y "lo que hace la mayoría"; sus costos se dicen con datos, no con adjetivos. Ningún texto nombra a una persona al hablar del Juego A ni usa "capitalista", "extractivista" o "colonialista". Lo legal lleva ⚖ y "a verificar con abogado".

Formato: `usd`, `pct` y `multiplo` de `lib/series/formato.ts` ("USD 306.970", "9,2 %", "2,66x", `null` → "sin dato"). Millones: `usdMillones(n)` nuevo en `lib/financiamiento` → "USD 24,8 M" (un decimal, `es-AR`), `null` → "sin dato".

## 7. Gráfico `BarrasReparto`

- Props: `titulo`, `grupos: { id, etiqueta, items: { id, etiqueta, valor: number | null }[] }[]`, `formatoValor`.
- Por grupo (serie): una `figure` con `figcaption` (nombre de la serie y total), y una lista `ol` de barras, una por destino con valor > 0: texto "Procomún · USD 306.970 · 16 %" encima y una barra SVG `aria-hidden` (`viewBox="0 0 100 4"`, `rect` de ancho = porcentaje, `className="fill-deep"`, fondo `fill-surface-2`). Un solo tono para todas: el nombre está en el texto, nada depende del color.
- Porcentajes: `repartoProporcional` de `lib/cuadratico/motor` (suman 100), igual que el donut.
- "Ver como tabla" (`details`): una tabla con `caption`, filas = destinos (Procomún, NetX, Unidades de Regeneración, Primera pérdida, Notas Verdes) y columnas = series; `null` → "no tiene".
- Sin estado: componente de servidor. Sin colores sueltos (lo vigila `lib/sin-colores-sueltos.test.ts`).

## 8. Catálogo legal

Un término nuevo, con `borrador: true` y el comentario "Texto nuevo, no viene del mock-up":
- `ordenanza173` · "Ordenanza 173/2026 de Mainqué": "Hasta que el municipio apruebe un loteo, nadie puede ofrecer, vender, reservar ni dar prioridad sobre esos lotes. Por eso NetX no se financia vendiendo lotes: no puede, y en el Juego B la tierra del Lighthouse queda en una Fundación que no la vende. A verificar con abogado." <!-- arquitecto: "publicitar" no está en la fuente (doc 22 fila 9, doc 30 §3: "no sales, reservations or priority"); la Fundación es propuesta del diseño B (doc 25) -->


Se reusan `safe`, `pasefundador` y los del diseño B que trae `fogon-simulador-parametros`. "Fundación" usa `serieprograma`/texto: si hace falta un ⚖ propio para la Fundación, queda para el cambio 2.

## 9. Tolerancias de los tests

- Plataforma: usuarios y tribus exactos; miembros que pagan ±0,5 (el RESULTS los redondea); ingreso por mes ±0,5 USD; % del consumo ±0,0005; total de 36 meses ±1 USD; meses cubiertos ±0,05. Se prueban las nueve filas (mes 12, 24, 36 de los tres escenarios) y los tres totales, copiados en el test con comentario de fuente y versión.
- Pase: exacto.
- Pista: exacto (±0,01).
- Monte Carlo: igualdad con la tabla escrita en el test (doble entrada: `riesgo.ts` y el test copian `RESULTS_series_montecarlo.md` por separado) y orden P10 ≤ P50 ≤ P90.
- Resumen: montos ±1 USD, múltiplos ±0,01, TIR ±0,0005 (las de `lib/series`).

## Riesgos / trade-offs

- **"Convencer" sin inflar.** El pedido es mostrar un modelo sólido; los números dicen que hoy NetX depende del SAFE y de contratos de diseño hasta tener ~USD 25 M bajo gestión, que las suscripciones cubren poco y que la primera pérdida no se recupera en ~60 % de los futuros. Gus (26-oct) decidió mostrarlos con su palanca. Mitigación: la pantalla los dice y propone qué supuesto moverlos, sin números nuevos; esconderlos sería inventar. Lo que sí sostiene el relato: no hay que vender lotes, cada serie paga al procomún antes que a nadie y NetX cobra por trabajo con plazos claros.
- **Las palancas pueden leerse como promesas.** Mitigación: cada una dice "para discutir, no es una decisión", no trae cifras y cita su fuente. Si alguien quiere ver el número con la palanca movida, eso es re-correr el modelo en NS_Tokenomics (otro cambio).
- **El relato contrasta con lo que propone el CEO.** Franz hoy propone vender tierras. Mitigación: el Juego A se presenta con respeto y con datos, nadie aparece nombrado y hay un test de palabras que no van.
- **"Con sesión" no es "solo NetXGen"** mientras el registro sea abierto. Mitigación: queda escrito en §2 y como pregunta para Gus (`LH_ACCESO=lista` en el entorno que se comparta).
<!-- arquitecto: ADR-015 -->
- **El relato se lee sin sesión en el código de la respuesta** (control en el navegador). Mitigación: sin datos de personas en ninguna pestaña (e2e de la tarea 5.2 que lo prueba sin sesión), `noindex` en el layout y ADR-015 con la señal para pasar el control al servidor (R14, datos reales o la primera pestaña con algo que no sea de ejemplo).
- **Dependencia de un PR sin integrar** (#107). Mitigación: el implementador verifica `lib/series` en `dev` y frena si falta.
- **Números del Congreso cancelado.** El modelo de la plataforma y el Pase arrancan en el encuentro de febrero 2027. Mitigación: marca visible en cada uno; re-correr el modelo es trabajo de NS_Tokenomics (I-15), no de este cambio.
- **Monte Carlo copiado.** Si se re-corre en NS_Tokenomics, la tabla queda vieja. Mitigación: versión a la vista y la regla de ADR-010/ADR-014 (un cambio del `.py` = un cambio OpenSpec).
<!-- arquitecto: orden de archivo -->
- **Orden de archivo.** El delta de `fogon-simulador` quita el requisito "Acceso desde el Fogón", que crea `fogon-simulador-parametros` y todavía no está archivado: este cambio se archiva **después** de ese (si no, `openspec archive` lo rechaza).
- **Mover operaciones a `/netx/comunidad`** rompe e2e que abren `/netx` para probar la bandeja o las postulaciones. Mitigación: tarea explícita para actualizar esas rutas; la prueba de "sin acceso" pasa a `/netx/comunidad` (en `/netx` una persona con sesión ahora entra).
