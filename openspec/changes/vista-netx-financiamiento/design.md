# Design

## Contexto

- **Pedido de Gus (23-oct-2026):** la Vista NetX tiene que convencer a Franz (CEO) y a Vagner (finanzas) de que NetX se financia sin vender lotes, como relato con pestañas; el simulador de la tokenomics sale del Fogón y va como pestaña de `/netx`.
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
  resumen.ts        armarResumen(): junta lo de arriba con correrSerie() de lib/series
  *.test.ts
app/netx/
  layout.tsx        SoloSuperAdmin + aviso de prototipo + <Pestanas/>
  pestanas.tsx      cliente: usePathname, enlaces con aria-current
  page.tsx          Resumen (servidor)
  resumen/…         piezas del Resumen si hace falta partir el archivo
  comunidad/page.tsx  contenido actual de /netx (+ bandeja-pedidos.tsx y postulaciones-comunidades.tsx se quedan donde están o se mueven con él)
  simulador/page.tsx + simulador-cliente.tsx  movidos desde app/fogon/simulador/
app/fogon/simulador/page.tsx   solo redirect("/netx/simulador")
components/barras-reparto.tsx  gráfico de barras horizontales con tabla equivalente
```

`lib/financiamiento/` no importa React, Next ni nada de `app/` (test de fuente, como `lib/series`). Puede importar `@/lib/series`.

## 2. Pestañas

- `app/netx/layout.tsx` envuelve todo en `SoloSuperAdmin` (así ninguna pestaña muestra números a quien no es super admin; cada `page.tsx` deja de envolverse sola). Dentro: contenedor `mx-auto max-w-5xl p-6 sm:p-10`, aviso "Prototipo interno · datos de ejemplo" y `<Pestanas/>`.
- `Pestanas` es un `<nav aria-label="Secciones de la Vista NetX">` con una `<ul>` de `Link`. Activa = **igualdad exacta** de ruta (`usePathname() === href`), no `esActivo` (que marcaría "Resumen" en todas). La activa lleva `aria-current="page"` y además negrita y subrayado (no solo color). `flex flex-wrap gap-2` para que a 390 px baje de línea y no desborde.
- Lista en este cambio: Resumen `/netx`, Simulador `/netx/simulador`, Comunidad y embudo `/netx/comunidad`. Es un arreglo exportado (`PESTANAS_NETX`) para que el cambio 2 sume "Modelo de financiamiento" `/netx/financiamiento` en segundo lugar sin tocar el componente.
- No se usa el patrón ARIA `tablist`: son navegaciones entre páginas, no paneles en la misma página.
- `metadata.title` por página: "Vista NetX · Resumen", "Simulador de la tokenomics", "Vista NetX · Comunidad y embudo".
<!-- arquitecto: límite conocido del control de acceso -->
- **Límite conocido del control de acceso.** `SoloSuperAdmin` es un componente de cliente: oculta el contenido, pero lo que renderiza el servidor (los números del Resumen) viaja igual en la respuesta de la página. Es el mismo patrón que `/netx` tiene hoy y alcanza para el prototipo porque estas pestañas solo muestran números de ejemplo de NS_Tokenomics, sin datos personales. Regla para este cambio y el siguiente: **ninguna pestaña de `/netx` lee datos de personas desde el servidor de la página**; lo que sea de personas sigue pasando por `/api/*`, que verifica el rol en el servidor (como `/api/personas`). Si alguna pestaña necesita datos reales o sensibles, el control pasa al servidor (layout que lee la sesión y responde "No tenés acceso" sin renderizar los hijos) con otro cambio.

## 3. Comunidad y embudo

`app/netx/comunidad/page.tsx` = el `VistaNetx` actual sin `SoloSuperAdmin` (lo pone el layout), sin el aviso de prototipo (lo pone el layout) y con:
- rótulo "Vista NetX · para Franz y Vagner", h1 **"Comunidad y embudo"**, bajada "Embudo, tribus y cumplimiento. Todos los datos de esta vista son de ejemplo." (se conserva el texto que ya prueban los e2e).
- El enlace "← Inicio" pasa al layout.
- Todo lo demás igual (indicadores, embudo, cumplimiento, tribus, `PanelPersonas`, `PostulacionesComunidades`, `BandejaPedidos`).

## 4. Simulador

- Mover `app/fogon/simulador/page.tsx` y `simulador-cliente.tsx` a `app/netx/simulador/` (`git mv`). En la página: quitar "← Fogón", el aviso "Prototipo interno · datos de ejemplo" (lo pone el layout) y el rótulo "Fogón de decisiones"; poner el rótulo "Vista NetX" y el enlace "← Vista NetX" a `/netx` (lo pide el delta de `fogon-simulador`). <!-- arquitecto: alinear con el delta de fogon-simulador, que exige "← Vista NetX" --> Se queda el aviso `TERMINOS.avisosimulador`, el h1 y todo el cliente igual.
- `app/fogon/page.tsx`: borrar el bloque "Simulador de la tokenomics".
- `app/fogon/simulador/page.tsx` nuevo: `import { redirect } from "next/navigation"; export default function () { redirect("/netx/simulador"); }`.
- El rail marca "NetX" solo (`esActivo("/netx", "/netx/simulador")`).
- Permisos: `/netx/*` ya es capacidad `netx` (super admin) en `lib/permisos/niveles.ts`; no se toca.

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
};
```

`gestionAnual` = `netx.recibe / horizonte` (viñedo 128.250 / 15 = 8.550; agrovoltaica 800.000 / 20 = 40.000). En `reparto`, "notas" del viñedo es `null` (la serie no tiene Notas): la tabla dice "no tiene" y el gráfico no dibuja la barra.

## 6. Pantalla del Resumen (`app/netx/page.tsx`)

De arriba hacia abajo, con tokens del tema y `CARTA = "rounded-xl border border-faint bg-surface p-4"` como hoy:

1. Rótulo "Vista NetX · para Franz y Vagner", h1 "¿Cómo se financia NetX sin vender lotes?".
2. Aviso `TERMINOS.avisosimulador.texto` (estilo de aviso, `bg-warn-bg text-warn-ink`).
3. Respuesta corta (doc 30, "In one breath", en castellano): "NetX es la empresa que diseña, gestiona y opera la plataforma. Cobra por su trabajo, no por vender tierra: en el diseño B la tierra queda en una Fundación ⚖ y la plata de los proyectos entra por series ⚖ del programa de fideicomisos." <!-- arquitecto: la Fundación todavía no existe ni recibió la tierra; se dice "en el diseño B" para no presentarlo como hecho ante Franz -->

4. **Tres bolsillos** (`grid md:grid-cols-3`, cada uno `section` con `h2`):
   - "NetX · la empresa": lista con "Ahora · SAFE de la empresa ⚖(`safe`): USD 375.000 a 500.000 (meta) · a confirmar con Vagner"; "Ahora · contrato de diseño con BioPueblo: sin dato (a cotizar)"; "2027–2028 · comisión de desarrollo: 3 a 5 % del capex, una vez (agrovoltaica: USD 120.000 a 200.000)"; "Por año · comisión de gestión: USD 8.550 (viñedo) · USD 40.000 (agrovoltaica)"; "Membresías y Plan Tribu: USD 1.336 por mes al mes 36 (escenario base)" + marca del Congreso.
   - "Procomún · Fundación": "Viñedo: USD 306.970 en 15 años"; "Agrovoltaica: USD 1.357.031 en 20 años" ("canon, regalía y excedente sobre el tope; cobra antes que cualquier inversor"); "Pase Fundador ⚖(`pasefundador`): USD 49.500 · 96.000 · 171.000 (bajo · base · bueno) — va al procomún, no a NetX; el escenario bajo no llega al mínimo de USD 75.000" + marca del Congreso.
   - "Inversores de las series": "Unidades de Regeneración ⚖ del viñedo: 2,66x · TIR 9,2 % en 15 años"; "de la agrovoltaica: 2,84x · TIR 10,3 % en 20 años"; "Notas Verdes ⚖: TIR 7,0 %"; "Primera pérdida ⚖: TIR 4,0 % (viñedo) · 5,0 % (agrovoltaica)". "Supuestos del modelo a confirmar con Vagner".
5. **Gráfico** `BarrasReparto` (§7) con título "¿Adónde va lo que paga cada serie? (valores de partida)".
6. **Rangos de riesgo** (`section`, `h2` "¿Y si sale peor?"): por serie, "TIR de las Unidades en 2.000 futuros simulados: −2,6 % · 8,4 % · 10,8 % (P10 · P50 · P90) · 22 % de los futuros pierden plata". Texto: "Son futuros simulados con heladas, demoras y precios inciertos, no un pronóstico."
7. **Lo que tiene que ser cierto** (`h2`): "El equipo consume USD 31.000 por mes (USD 372.000 por año) · a confirmar con Vagner. Para pagarlo solo con comisiones de gestión hacen falta USD 24,8 M bajo gestión al 1,5 % o USD 37,2 M al 1 %. Hasta llegar ahí, el puente es el SAFE, los contratos de diseño y las comisiones de desarrollo. Las membresías cubren 1,7 % · 4,3 % · 10,2 % del consumo al mes 36: la plataforma vale por lo que trae (miembros, inversores, tribus) y por lo que se puede licenciar, no por sus suscripciones."
8. **¿Y vender lotes?** (`h2`): tres ítems — "No se puede: antes de la aprobación municipal no se ofrecen, reservan ni prometen lotes ⚖(`ordenanza173`)."; "No hace falta: la plata entra por las series y por el trabajo de NetX."; "En el diseño B la tierra del Lighthouse es de la Fundación: no hay lotes de NetX para vender." Sin "reservá", "prioridad" ni precios de lotes.
9. **Fuentes** (`p` chica, `text-muted`): "Fuentes: NS_Tokenomics doc 28, 29 y 30 (v0.1, 17-oct-2026); series_waterfall_sim.py v0.1, 17-oct-2026; platform_revenue_sim.py v0.1, 17-oct-2026; series_montecarlo_sim.py v0.1, 17-oct-2026 (2.000 futuros, semilla 7)." armado desde `VERSIONES` y `VERSION_MODELO`.

Formato: `usd`, `pct` y `multiplo` de `lib/series/formato.ts` ("USD 306.970", "9,2 %", "2,66x", `null` → "sin dato"). Millones: `usdMillones(n)` nuevo en `lib/financiamiento` → "USD 24,8 M" (un decimal, `es-AR`), `null` → "sin dato".

## 7. Gráfico `BarrasReparto`

- Props: `titulo`, `grupos: { id, etiqueta, items: { id, etiqueta, valor: number | null }[] }[]`, `formatoValor`.
- Por grupo (serie): una `figure` con `figcaption` (nombre de la serie y total), y una lista `ol` de barras, una por destino con valor > 0: texto "Procomún · USD 306.970 · 16 %" encima y una barra SVG `aria-hidden` (`viewBox="0 0 100 4"`, `rect` de ancho = porcentaje, `className="fill-deep"`, fondo `fill-surface-2`). Un solo tono para todas: el nombre está en el texto, nada depende del color.
- Porcentajes: `repartoProporcional` de `lib/cuadratico/motor` (suman 100), igual que el donut.
- "Ver como tabla" (`details`): una tabla con `caption`, filas = destinos (Procomún, NetX, Unidades de Regeneración, Primera pérdida, Notas Verdes) y columnas = series; `null` → "no tiene".
- Sin estado: componente de servidor. Sin colores sueltos (lo vigila `lib/sin-colores-sueltos.test.ts`).

## 8. Catálogo legal

Un término nuevo, con `borrador: true` y el comentario "Texto nuevo, no viene del mock-up":
- `ordenanza173` · "Ordenanza 173/2026 de Mainqué": "Hasta que el municipio apruebe un loteo, nadie puede ofrecer, vender, reservar ni dar prioridad sobre esos lotes. Por eso NetX no se financia vendiendo lotes: no puede, y en el diseño B la tierra del Lighthouse queda en una Fundación que no la vende." <!-- arquitecto: "publicitar" no está en la fuente (doc 22 fila 9, doc 30 §3: "no sales, reservations or priority"); la Fundación es propuesta del diseño B -->


Se reusan `safe`, `pasefundador` y los del diseño B que trae `fogon-simulador-parametros`. "Fundación" usa `serieprograma`/texto: si hace falta un ⚖ propio para la Fundación, queda para el cambio 2.

## 9. Tolerancias de los tests

- Plataforma: usuarios y tribus exactos; miembros que pagan ±0,5 (el RESULTS los redondea); ingreso por mes ±0,5 USD; % del consumo ±0,0005; total de 36 meses ±1 USD; meses cubiertos ±0,05. Se prueban las nueve filas (mes 12, 24, 36 de los tres escenarios) y los tres totales, copiados en el test con comentario de fuente y versión.
- Pase: exacto.
- Pista: exacto (±0,01).
- Monte Carlo: igualdad con la tabla escrita en el test (doble entrada: `riesgo.ts` y el test copian `RESULTS_series_montecarlo.md` por separado) y orden P10 ≤ P50 ≤ P90.
- Resumen: montos ±1 USD, múltiplos ±0,01, TIR ±0,0005 (las de `lib/series`).

## Riesgos / trade-offs

- **"Convencer" sin inflar.** El pedido es mostrar un modelo sólido; los números dicen que hoy NetX depende del SAFE y de contratos de diseño hasta tener ~USD 25 M bajo gestión, y que las suscripciones cubren poco. Mitigación: la pantalla lo dice ("Lo que tiene que ser cierto"); esconderlo sería inventar. Lo que sí sostiene el relato: no hay que vender lotes, cada serie paga al procomún antes que a nadie y NetX cobra por trabajo con plazos claros.
- **Dependencia de un PR sin integrar** (#107). Mitigación: el implementador verifica `lib/series` en `dev` y frena si falta.
- **Números del Congreso cancelado.** El modelo de la plataforma y el Pase arrancan en el encuentro de febrero 2027. Mitigación: marca visible en cada uno; re-correr el modelo es trabajo de NS_Tokenomics (I-15), no de este cambio.
- **Monte Carlo copiado.** Si se re-corre en NS_Tokenomics, la tabla queda vieja. Mitigación: versión a la vista y la regla de ADR-010/ADR-014 (un cambio del `.py` = un cambio OpenSpec).
<!-- arquitecto: orden de archivo -->
- **Orden de archivo.** El delta de `fogon-simulador` quita el requisito "Acceso desde el Fogón", que crea `fogon-simulador-parametros` y todavía no está archivado: este cambio se archiva **después** de ese (si no, `openspec archive` lo rechaza).
- **Mover operaciones a `/netx/comunidad`** rompe e2e que abren `/netx` para probar la bandeja o las postulaciones. Mitigación: tarea explícita para actualizar esas rutas; la prueba de "sin acceso" sigue en `/netx`.
