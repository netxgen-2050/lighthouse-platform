# Design

## Context

Ya existen: `lib/territorios/loteo.ts` y `loteo-estados.ts` (`loteo-norte-7a`), `accionesDeLote("lighthouse-norte")` (`venta-lotes-regla`), `PedidoContacto`, `EntrarPara`, `usd` y `SIN_DATO` en `lib/series/formato.ts`, y el patrón de `lib/series/escenarios.ts` (`VERSION_MODELO`).

**Fuente de los números:** `NS_Tokenomics` `main`, doc 31 y `sim/lot_sale_sim.py` v0.2 (2-nov-2026), con sus resultados en `sim/RESULTS_lot_sale.md`. Gus corrigió el precio después del pedido: lotes de USD 15–40K (llamada sin registro) y casas, infraestructura y parte del dueño como estimaciones provisorias. ADR-010 dice que NS_Tokenomics manda sobre los modelos, y que si el `.py` cambia se abre otro cambio.

## Goals / Non-Goals

**Goals:**
- Recorrer el flujo de punta a punta en una demo, sin cobrar y sin pedir datos personales.
- Una sola copia de cada número.

**Non-Goals:**
- Simular una seña, cuotas o una liquidación: no hay valores.
- Modelar la propiedad ni documentos reales.

## Decisions

### 1. El módulo
```ts
// lib/lotes/modelo.ts. Puro: sin React ni Next. Todos los valores son de ejemplo y provisorios.
export const VERSION_MODELO_LOTES = {
  fuente: "NS_Tokenomics doc 31 y sim/lot_sale_sim.py",
  version: "v0.2",
  fecha: "2026-11-02",
} as const;

export const MODELO_LOTES = {
  precioLote: { min: 15_000, max: 40_000, m2Min: 1_344, m2Max: 2_200 }, // USD; [NC, llamada sin registro]; lineal entre tamaños
  casas: {                          // estimación [criterio], sin presupuesto detrás; 170 m² es la referencia de Martín
    modular: { m2: 90, usdPorM2: 1_000 },
    familiar: { m2: 170, usdPorM2: 1_400 },
    amplia: { m2: 250, usdPorM2: 2_000 },
  },
  mezcla: { "solo-lote": 0.4, modular: 0.3, familiar: 0.2, amplia: 0.1 }, // proporción de compradores [criterio]
  aporteUnico: 0.05,                // proporción de lo que se paga, al procomún
  expensaAnual: 1_200,              // USD por lote por año
  presupuestoComunAnual: 72_000,    // USD por año
  aniosDeVenta: 3,                  // los lotes se venden parejo en estos años
  infraestructuraPorLote: 12_000,   // USD: caminos, agua y energía
  parteDelDueno: 0.2,               // proporción del precio del lote; todavía no hay acuerdo
} as const;

export type OpcionCompra = "solo-lote" | "modular" | "familiar" | "amplia";

export const precioLote = (m2: number) => …;            // 1.344 → 15.000; 2.200 → 40.000; fuera de rango, el extremo
export const precioCasa = (tipo: TipoCasa) => …;        // 90.000; 238.000; 500.000
export const precioPaquete = (m2: number, o: OpcionCompra) => …;
export const aporteDe = (precio: number) => …;          // 5 % de lo que se paga
export const paquetePromedio = () => …;                 // con el lote en el medio del rango: 152.100
export const aporteTotal = (lotes: number) => …;        // 25 → 190.125
export const aportePrimerAnio = (lotes: number) => …;   // 25 → 63.375
export const expensasTotales = (lotes: number) => …;    // 25 → 30.000
export const expensaParaCubrir = (lotes: number) => …;  // 25 → 2.880
export const aniosQueCubreElAporte = (lotes: number) => …; // 25 → 2,6
export function leccionAporte(lotes: number, idioma: Idioma): string;
export function leccionExpensas(lotes: number, idioma: Idioma): string;
```
La cantidad de lotes **nunca** es una constante: la pantalla pasa `listarLotes().length`, así el KMZ de Martín mueve las cuentas solo. Con `lotes <= 0` las funciones devuelven `null`, y la pantalla dice "sin dato" (no dividir por cero).

**Tests contra el modelo (ADR-010, regla 3):** comprueban los valores de `sim/RESULTS_lot_sale.md` v0.2. Si el `.py` cambia, otro cambio chico actualiza valores, versión y tests.

### 2. La lección del aporte sale de la cuenta, no de una frase fija
El modelo reparte las ventas en tres años, así que el aporte también entra de a partes: con 25 lotes y la mezcla de compradores suma USD 190.125, pero el primer año entran USD 63.375, menos que los USD 72.000 del presupuesto. `leccionAporte` elige la frase según la cuenta:

| Condición | es |
|---|---|
| `aportePrimerAnio < presupuestoComunAnual` | Con {n} lotes, el aporte único del {p} suma {total} en {años de venta} años de ventas. El primer año entran {primer año}: no alcanza para un presupuesto común de {presupuesto} por año, y el aporte no se repite. |
| si no | Con {n} lotes, el aporte único del {p} suma {total}: paga {años} años de un presupuesto común de {presupuesto}, y no se repite. |

Hoy se ve la primera. Con 50 lotes o con otro valor del módulo, aparece la segunda sin tocar pantallas.

`leccionExpensas`: "Cubrir ese presupuesto solo con expensas pide {2.880} por lote al año; la expensa de ejemplo es {1.200}." En inglés, lo mismo.

### 3. Precio
La ficha dice el precio del lote según su superficie: "USD {precio} · precio de ejemplo, a confirmar" ⚖ `precioreferencia`. Debajo: "Los precios de lotes van de USD {min} a USD {max} según la superficie, de ejemplo". El tamaño real de esos lotes es "sin dato" hasta el KMZ de Martín, y el modelo supone que entra una casa familiar.

**USD 500.000 por familia no se muestra:** es la cifra de la llamada del 2-nov, y solo la alcanza el paquete mayor. Queda como pregunta para Franz (doc 31 §3), no como dato de pantalla.

**Aporte y precio van separados, sin sumarlos.** No hay dato de si el 5 % va dentro del precio o se suma. El pago simulado muestra el precio elegido y, aparte, "Aporte único al procomún: USD {aporte} · si se suma al precio o va incluido: sin dato".

### 4. Secciones de la ficha `/lotes/[id]`
1. **Encabezado:** `Lote N`, marca "Loteo provisorio, ilustrativo", superficie, estado en texto y forma.
2. **Precio** (§3).
3. **Con casa:** radio "Solo el lote" / "Casa modular" / "Casa familiar" / "Casa amplia". Cada opción dice sus m² y el precio de la casa, y debajo se ve el total de lote más casa, "estimación de ejemplo, sin presupuesto". La familiar aclara "170 m², referencia de Martín".
4. **Costos:** tabla con Aporte único (sobre la opción elegida), Expensas por año, Infraestructura por lote y Parte del dueño (sobre el lote), todos "de ejemplo". Al pie, `VERSION_MODELO_LOTES`.
5. **Derechos y deberes** (§6).
6. **Estado administrativo:** versión completa de `lighthouse-norte`.
7. **Acciones:** según `accionesDeLote("lighthouse-norte")`, y solo si el estado del lote es "disponible". "Hablar con alguien" está siempre <!-- arquitecto: "Acciones que piden cuenta" y "Sin datos guardados sin sesión" --> (sin sesión, "Entrá para hablar con alguien", como en una finca).
8. **Quién vende:** "sin dato".

`generateStaticParams` con `listarLotes()` y `dynamicParams = false`; un id desconocido da `notFound()`. `/lotes`: resumen, estado administrativo completo y la lista con enlaces a cada ficha, en el mismo formato que la lista del mapa.

### 5. Qué se guarda, y por qué no hay dato personal nuevo
`NOMBRES_BASE.lotes = "lh-lotes"`, por persona, como los demás flujos. Entra solo en la descarga de `/mis-datos` y en "Borrar todo".

```ts
type CompraLote = {
  loteId: string;
  opcion: OpcionCompra;
  paso: "reservado" | "pagado";
  reservadoEl: string; // ISO
  pagadoEl?: string;
  /** Lo que la persona vio, para que un boleto viejo no cambie si cambia el modelo. */
  vio: { precio: number | null; aporte: number | null; expensa: number | null; version: string };
};
```
**Ningún campo de identidad**: ni nombre, ni documento, ni domicilio, ni forma de pago. Sin sesión no se guarda nada ("Sin datos guardados sin sesión").

<!-- arquitecto: respuesta a la pregunta que dejó el especificador -->
**Lectura de ADR-017: amplía, y la versión sube.** El registro no pide identidad, pero se guarda con el prefijo de la persona, entra en su descarga y dice qué lote eligió, por cuánto y cuándo. Es un dato de esa persona, de una clase que la política no nombra, y ADR-017 sube la versión cuando se suman datos o finalidades. En `lib/privacidad/politica.ts`:

- `DATOS_POR_PANTALLA` suma: pantalla "Lotes (simulado)"; datos "Qué lote reservaste o “pagaste” en la simulación, la opción que elegiste, las fechas y los valores que viste. Nunca datos de pago ni de identidad."; dónde "Solo en tu navegador: no se envía a ningún lado."
- `RESUMEN`, en "Qué guardamos", suma "lotes simulados". `FINALIDADES`, en "Mostrarte el territorio…", suma "y simular la reserva y la compra de un lote".
- `TERMINOS_DE_USO` pasa a "planes, Pase Fundador, aportes, inversión y lotes son simulados". La frase "Lo que ves no es una oferta de inversión ni de venta de lotes" sigue siendo cierta, porque es simulada, y no se toca.
- `VERSION_POLITICA` sube a `<fecha de la noche>-borrador`, y la cabecera lo anota con el cambio. **Costo aceptado:** cada persona del equipo vuelve a aceptar la política una vez, y también el consentimiento de datos sensibles si lo había dado. `e2e/fixtura.ts` importa la constante, así que no se rompe.

### 6. Derechos y deberes (⚖ `derechosdeberes`, borrador)
Salen de doc 18 §3 y §4, como supuestos del modelo, nunca como promesa.

- **Derechos:** usar y construir en tu lote según el reglamento; usar lo común; revender, con la preferencia de reventa que fije el reglamento.
- **Deberes:** respetar las servidumbres registradas antes de la primera venta; cumplir el mismo reglamento que todos; pagar el aporte único y las expensas.
- **Lo que no da:** ningún pase, ticket ni token da prioridad, crédito o reserva sobre un lote.
- **⚖ es:** "Borrador de lo que traería comprar un lote en el modelo híbrido. Las servidumbres, el reglamento y la preferencia de reventa todavía no existen. Un lote vendido se rige por su título, las servidumbres y el reglamento: si alguien no cumple, el camino es el de cualquier vecino o barrio con reglamento, no una decisión de la plataforma. A verificar con abogado."
- **⚖ en:** "A draft of what buying a lot would bring under the hybrid model. The easements, the regulation and the resale preference do not exist yet. A sold lot is governed by its title, the easements and the regulation: if someone does not comply, the path is that of any neighbor or community with a regulation, not a decision by the platform. To be verified with a lawyer."

Los demás ⚖ (todos con `borrador: true`):

| Clave | Título es / en | Texto es | Texto en |
|---|---|---|---|
| `precioreferencia` | Precio de ejemplo / Sample price | Un valor provisorio para el prototipo, a confirmar, igual que los precios de las casas: no salen de un presupuesto. No es una oferta ni un precio de venta. | A provisional value for the prototype, to be confirmed, like the house prices: they do not come from a quote. It is not an offer or a sale price. |
| `aporteunico` | Aporte único al procomún / One-off contribution to the commons | Una parte del precio que cada lote aportaría una sola vez a lo que es de todos. Es de ejemplo: quién la recibe depende de una entidad que todavía no existe. A verificar con abogado. | A share of the price that each lot would contribute once to what belongs to everyone. It is a sample: who receives it depends on an entity that does not exist yet. To be verified with a lawyer. |
| `expensas` | Expensas / Common charges | Lo que cada lote pagaría por año para sostener lo común. Es un valor de ejemplo y todavía no hay reglamento que lo fije. | What each lot would pay per year to sustain the commons. It is a sample value and no regulation sets it yet. |
| `boletoejemplo` | Boleto de ejemplo / Sample purchase agreement | Es una simulación del prototipo: no es un boleto de compraventa, no obliga a nadie, no transfiere ningún derecho y no se pagó nada. | This is a prototype simulation: it is not a purchase agreement, it binds nobody, it transfers no rights and nothing was paid. |

### 7. El flujo
`lib/lotes/compra.ts` es puro: `leerCompras`, `reservar`, `pagar`, `deshacer`, `estadoConCompras(id, compras)`.

| Paso | Qué ve la persona | Qué se guarda |
|---|---|---|
| Sin sesión | `EntrarPara` "Entrá para reservar este lote" | Nada |
| Disponible | "Reservar (simulado)" | — |
| Reservado | "Reserva simulada: no reserva ningún lote de verdad", "Simular el pago" y "Deshacer" | `paso: "reservado"` |
| Pago simulado | Antes de confirmar: "No se cobra nada. No ingreses datos de pago: no hay ningún campo." Precio y aporte separados. Botón "Confirmar el pago simulado" | — |
| Pagado | "Boleto de ejemplo" y "Deshacer" | `paso: "pagado"` |

- **No hay ningún campo de pago:** ni tarjeta ni CBU.
- Cada cambio se anuncia con `role="status"` y mueve el foco al título del paso nuevo.
- `reservar` falla si el estado base no es "disponible" o si la persona ya tiene ese lote. Es una función pura, testeada.
- **Sin límite de lotes por persona:** es una demo.

### 8. Boleto de ejemplo
Una sección con título "Boleto de ejemplo" y una franja visible en borde punteado: **"SIMULADO · SIN VALOR LEGAL · NO SE PAGÓ NADA"** / **"SIMULATED · NO LEGAL VALUE · NOTHING WAS PAID"**, antes de cualquier dato. Contiene: lote y superficie; opción elegida; precio, aporte y expensa de `vio`; Comprador: "Persona de ejemplo"; Vendedor: "sin dato"; Aprobación municipal: "supuesto de trabajo, no otorgada"; fechas; versión del modelo; ⚖ `boletoejemplo`. No se descarga como PDF: una copia suelta perdería el contexto del aviso.

### 9. Estado de un lote en toda la app
`estadoConCompras` se aplica sobre `estadoDeLote`: `reservado` → "Reservado (simulado, por vos)"; `pagado` → "Vendido (simulado, a vos)". Lo usan la ficha, `/lotes` y la lista del mapa. Del lado del servidor se dibuja la base, y el cliente la actualiza al leer lo guardado, sin mover el diseño.

### 10. "Hablar con alguien"
`Motivo` suma `consulta-lote-vrn`: "Consulta por un lote de Lighthouse VRN" / "Inquiry about a Lighthouse VRN lot", con destino "Equipo NetX" / "NetX team". El formulario se llama "Hablar con alguien". No se reutiliza `consulta-lote` porque su destino dice "BioPueblo, vía NetX como agencia", y no hay dato de quién vende acá. `PedidoContacto` y `esPedido` no cambian de forma: leen `MOTIVOS`. La referencia es "Lote N" y `estadoMostrado` lleva el texto del estado.

### 11. Público
Se suman `/^\/lotes$/` y `/^\/lotes\/[^/]+$/` a `RUTAS_PUBLICAS`: `puedeRuta` responde "descubrir" solo. El destino pasa a `existe: true`, y el test de coincidencia con `app/` lo exige.

## Risks / Trade-offs

- [El prototipo muestra "Comprar" y un boleto] → Es lo decidido (ADR-030). Se mantienen la franja "SIMULADO · SIN VALOR LEGAL", el ⚖ en borrador y el aviso de prototipo.
- <!-- arquitecto: P7 pasó a `venta-lotes-regla`, design §8 --> [Una página pública con precio y reserva] → No se indexa (P7, `venta-lotes-regla`, que corre antes). Quien tenga el enlace la ve sin sesión: ADR-015 ya dice que la sesión no protege, y se resuelve en R14.
- [Valores cambian en doc 31] → Se cambia un solo módulo, con otra versión. Un boleto viejo muestra lo que se vio.
- [El boceto solo tiene dos tamaños, así que casi todos los lotes dan USD 15.000] → Se corrige solo con el KMZ de Martín, porque el precio sale de la superficie. Con costos de ejemplo, un lote de USD 15.000 no se cubre (doc 31 §3): no se muestra en la ficha, es una pregunta para el equipo.
- [Un lote desaparece con el KMZ y queda una reserva vieja] → `estadoConCompras` ignora ids desconocidos, y el importador avisa.

## Migration Plan

Clave nueva, sin datos viejos. Volver atrás es revertir el PR. `lh-lotes` quedaría en el navegador sin uso, y "Borrar todo" ya no la vería: es aceptable en el prototipo.
