# Design

## Context

Hoy `accionesDeLote` devuelve solo `consultar` para cualquier proyecto y la spec `estado-administrativo` prohíbe comprar o reservar sin aprobación. El único proyecto es Chacras de Soluna. La decisión de producto y las reglas que cambia están en ADR-028; los valores de plata no entran acá (los trae `lib/lotes/modelo.ts` en `lote-ficha-y-compra`).

## Goals / Non-Goals

**Goals:**
- Habilitar la venta simulada sin que ningún dato diga que el municipio aprobó.
- Que los agentes lean la regla nueva donde ya miran (`CLAUDE.md`).
- Dejar el menú de fase 1 y una nota para volver al Congreso.

**Non-Goals:**
- Pantallas de lotes, precios, flujo de compra.
- Cambiar qué página pide qué nivel de acceso.

## Decisions

### 1. `ventaSimulada` es un dato aparte de `aprobacionMunicipal`
```ts
export type IdProyecto = "soluna" | "lighthouse-norte";

export type EstadoAdministrativo = {
  proyecto: string;
  /** Si falta, la vista escribe "sin dato". */
  titular?: string;
  estado: string;
  norma: string;
  normaCorta: string;
  expediente?: string;
  aprobacionMunicipal: boolean;
  /** Habilita reservar y comprar SOLO simulados (ADR-028). Nunca implica aprobación. */
  ventaSimulada?: true;
  /** Texto que reemplaza a "aprobada/pendiente" cuando se trabaja con un supuesto. */
  supuestoDeTrabajo?: string;
  /** Fecha de la aprobación. Si falta, "sin dato". */
  fechaAprobacion?: string;
  actualizado: string;
  en?: { proyecto: string; estado: string; norma: string; normaCorta: string; supuestoDeTrabajo?: string };
};
```
`accionesDeLote(p)` devuelve `["consultar", "reservar", "comprar"]` si `ventaSimulada`, y `["consultar"]` si no. **No lee `aprobacionMunicipal`.** El test viejo "con aprobación sigue siendo solo consultar" sigue pasando para Soluna.

*Alternativa descartada:* poner `aprobacionMunicipal: true` en Norte para reutilizar la condición. Sería un dato falso, y la bitácora guardaría "aprobada".

*Alternativa descartada:* un `if (proyecto === "lighthouse-norte")` dentro de la función. Esconde la regla en vez de dejarla en el dato.

### 2. Registro de `lighthouse-norte`
| Campo | es | en |
|---|---|---|
| `proyecto` | Lighthouse VRN · sector norte | Lighthouse VRN · north sector |
| `estado` | Loteo provisorio | Provisional subdivision |
| `norma` / `normaCorta` | Ord. 173/2026 de Mainqué / Ord. 173/2026 | Ord. 173/2026 of Mainqué / Ord. 173/2026 |
| `supuestoDeTrabajo` | Aprobación municipal: supuesto de trabajo, no otorgada | Municipal approval: working assumption, not granted |

Sin `titular`, `expediente` ni `fechaAprobacion`: se muestran "sin dato". `actualizado: "2026-11-02"`, `aprobacionMunicipal: false`, `ventaSimulada: true`.

### 3. El componente
`EstadoAdministrativo` suma la prop `idioma` (por defecto `es`) y dos funciones puras en `lib/legal/estado-administrativo.ts`: `textoTitular(e)` y `textoFechaAprobacion(e)`, que devuelven "sin dato" si falta.

- **Versión completa de Norte:** `Lighthouse VRN · sector norte · Loteo provisorio · Ord. 173/2026 de Mainqué ⚖` y debajo `Titular: sin dato · Expediente: sin dato · Aprobación municipal: supuesto de trabajo, no otorgada · Fecha: sin dato`.
- **Versión compacta de Norte:** `Loteo provisorio · Aprobación municipal: supuesto de trabajo, no otorgada ⚖`.
- **Soluna:** idéntica a hoy, en palabras y en ⚖ `loteo`.
- `AnotarExposicion` anota exactamente lo que se ve, también en Norte.

En este cambio ninguna página muestra todavía el estado de Norte: lo monta `loteo-norte-7a`. Se comprueba con un test de componente, como `components/donut.test.tsx`.

### 4. ⚖ `loteonorte` (`borrador: true`)
- **Título:** "Loteo provisorio de Lighthouse VRN" / "Provisional subdivision of Lighthouse VRN".
- **es:** "Este prototipo simula la venta de lotes en el sector norte de Lighthouse VRN. Trabaja con el supuesto de que el loteo se va a aprobar: hoy la aprobación municipal no está otorgada y no tiene fecha (sin dato). La Ordenanza 173/2026 de Mainqué no permite ofrecer, publicitar ni reservar parcelas sin aprobación, así que esto solo vale como prueba dentro del equipo: no es una oferta, no se cobra nada y no reserva ningún lote de verdad. A verificar con abogado."
- **en:** "This prototype simulates selling lots in the north sector of Lighthouse VRN. It works on the assumption that the subdivision will be approved: today municipal approval has not been granted and has no date (no data). Mainqué Ordinance 173/2026 does not allow offering, advertising or reserving plots without approval, so this only counts as a test inside the team: it is not an offer, nothing is charged and no lot is really reserved. To be verified with a lawyer."

### 5. Menú de fase 1
```
Descubrir:    Inicio · Territorio · Lotes (existe: false hasta lote-ficha-y-compra)
Sumarte:      Sumarte (destacado, como hoy)
Lo que viene: Tribus · Pactos · Semillas · Fogón
Oculto:       Compromisos · Congreso
```
- `IdGrupo` cambia `participar` por `viene`, con títulos "Lo que viene" y "Coming next". `GRUPOS_RAIL` queda `descubrir`, `sumarte`, `viene`: el orden del rail es el orden de `GRUPOS_RAIL`.
- `clave: "lotes"` con "Lotes" y "Lots" en `GLOSARIO`, ícono `LandPlot` de `lucide-react`.
- **Los permisos no cambian:** Tribus sigue público, y Pactos, Semillas y Fogón siguen deshabilitados sin cuenta ("Sumate para participar").
- El orden de `DESTINOS` sigue la tabla, y `lib/navegacion.test.ts` lo fija.
- Congreso: `oculto: true`. El comentario del campo `oculto` nombra los dos casos. `esActivo("/congreso", …)` no cambia, pero sin enlace no hay nada que marcar.

*Alternativa descartada:* dejar el id `participar` con otro título. El id mentiría, porque Tribus no está en "Participar" y nada de ese grupo se ofrece como principal.

### 6. Texto para `CLAUDE.md`
Línea del encabezado, después de "pactos y semillas.": **"Fase 1 (desde el 2-nov-2026): venta simulada de lotes privados en Lighthouse VRN más el modelo híbrido con el procomún (ADR-028)."**

Sección nueva, justo antes de "Fase de prototipo interno":

```markdown
## Fase 1: venta de lotes privados (desde el 2-nov-2026, decisión de Franz)
Decidió Franz (CEO) en la llamada del 2-nov; Gus lo aceptó. **No se vuelve a discutir** en specs, revisiones ni PRs: el riesgo legal y comercial queda a cargo de Franz (confirmación escrita pedida, sin respuesta todavía). Detalle en `docs/decisiones/ADR-028-fase-1-venta-de-lotes-simulada.md`.
- **Se puede, solo simulado:** en `lighthouse-norte`, ofrecer lotes, mostrar precio, reservar, pago simulado y boleto de ejemplo. Si la nota 19, el backlog T7, doc 30 o una spec vieja dicen lo contrario, manda ADR-028.
- **No cambia:** ningún cobro real, pasarela ni KYC real; la aprobación municipal nunca se muestra como otorgada (es un supuesto de trabajo, fecha "sin dato"); `accionesDeLote("soluna")` devuelve solo `consultar`; ningún pase, ticket ni token da prioridad sobre un lote.
- **Foco solo en VRN:** nada de Lighthouse SMA ni del deck de inversores (USD 111M, TIR, recupero). No usar la nota de las "300 razones" (`NS_permacultura` 17).
- **Los números de lotes** salen de un solo módulo con versión (`lib/lotes/modelo.ts`), nunca escritos en pantallas. Infraestructura, casa y parte del dueño: "sin dato".
- **Congelado, ni se toca ni se propone:** `fogon-desde-mi-y-guardian`, `fogon-consenso-en-tarjetas`, `fogon-consenso-formal`, `semillas-constancias`, `liderar-varias-tribus`, billeteras, Mi Raíz, EAS, smart contracts, red de nodos. `procomun-tickets` está bloqueado hasta el sí de Franz.
- **Abrirlo afuera es otro paso** (R14).
```

En "Plata e inversión", después de "los pagos son simulados.", se suma: "Vale también para los lotes (ver Fase 1)."

### 7. Nota `docs/notas/congreso-en-pausa.md`
Sigue la forma de `docs/notas/compromisos-en-pausa.md`: qué pasó y por qué (menú de fase 1, 2-nov; relacionado con D16 y la cancelación del 23-oct), qué quedó (página, `/congreso/en`, registro del ticket, rutas públicas), qué marca lo deja en pausa (`oculto: true`), y pasos para volver (quitar la marca, ajustar `lib/navegacion.test.ts` y los e2e del rail).

## Risks / Trade-offs

- [Un agente lee "aprobación: supuesto de trabajo" y lo toma como aprobado] → El dato sigue en `false` y el texto dice "no otorgada". Un test impide que Norte use la palabra "aprobada" sin esa negación.
- [`/lotes` no aparece en el menú hasta la noche 2] → Es lo pedido: `existe` tiene que coincidir con el disco, y lo vigila `lib/navegacion.test.ts`.
- [La portada sigue enlazando al Congreso hasta `portada-vrn`] → Se acepta: Congreso solo se oculta del menú.
- [El título "Lo que viene" no entra en el rail angosto] → Se comprueba a 390 px; si no entra, se parte en dos líneas, como los otros títulos.
- [Sin la confirmación escrita de Franz, el ADR registra lo que informó Gus] → Queda dicho en el ADR, y su estado lo pasa Gus.

## Migration Plan

No hay datos guardados que migrar. Volver atrás es revertir el PR; la nota explica cómo devolver el Congreso al menú sin revertir nada más.
