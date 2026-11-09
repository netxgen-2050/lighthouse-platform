# Design

## Context

Gus pidió el 8-nov una exploración visible de un mecanismo con tokens para el bien común. `lib/lotes/modelo.ts` ya tiene precios y aportes; `lib/territorios/loteo-textos.ts` ya lista las parcelas por uso (`parcelasPorUso`). El componente `components/barras-reparto.tsx` dibuja repartos con su tabla. Todo es de ejemplo **[criterio]** y se dice en pantalla.

## Goals / Non-Goals

**Goals:** que el equipo entienda, en una página, cómo se combinarían el lote privado y el bien común, y qué falta decidir. Simple de leer: la curva se muestra por tramos, no como fórmula.

**Non-Goals:** prometer nada, simular compras guardadas o mostrar rendimientos. Ningún texto habla de ganancia, valorización ni retorno.

## Decisions

### 1. El módulo `lib/bien-comun/modelo.ts`
Puro, con `VERSION_BIEN_COMUN = { version: "v0.1", fecha: "2026-11-08", fuente: "Exploración de Gus y Claude, 8-nov-2026 [criterio]" }` y:

| Valor | Ejemplo |
|---|---|
| `NOMBRE_TOKEN` | "FARO" (nombre provisorio; Lighthouse es un faro) |
| `SUMINISTRO` | 10.000.000 FARO |
| Reparto | Lotes y familias 35 %, venta temprana por tramos 30 %, tesoro del bien común 20 %, NetXGen 15 % |
| FARO por m² de lote | 10 (un lote de 1.856 m² trae 18.560 FARO) |
| Tramos | 4 tramos de 750.000 FARO a USD 0,05, 0,08, 0,12 y 0,18 |
| Avance de ejemplo | Tramo 1 vendido al 40 % |
| Aporte de entrada | 10 % de cada compra va al tesoro del bien común |
| NetXGen | se libera en 4 años, con 1 año de espera |
| Staking A | bloquear 12 meses suma voz, sin tokens nuevos |
| Staking B | bloquear da 5 % anual en tokens nuevos |

Funciones: `faroDeLote(m2)`, `cotizar(usd)` (recorre los tramos desde el avance de ejemplo y devuelve FARO, precio promedio, tramos que toca y aporte al tesoro; con USD menor a 10 devuelve "monto mínimo"), `reparto()` (suma 100 %), `totalPorTramo()`. Un test comprueba que el reparto suma 100 %, que los tramos suman el 30 % del suministro y que `cotizar` cruza de tramo bien.

### 2. La página `/bien-comun`
Secciones, en este orden, cada una con su `h2`:

1. **Arriba:** título "El bien común de Lighthouse VRN". Bajada: "Lo privado es poco y lo común es casi todo: los lotes son el 0,4 % de la tierra (calculado). Esta página simula cómo se podría financiar y cuidar lo común con tokens." Aviso fijo: "Simulación para conversar en el equipo: no se emite ningún token, nada se cobra y nada está decidido." ⚖ `tokenbiencomun`.
2. **Inspirado en Elinor Ostrom:** tabla de 8 filas (principio · cómo lo tomaríamos · estado "idea"): límites claros (quién es parte: quien adhiere al manifiesto y quien tiene un lote); reglas acordes al lugar (el agua guía el diseño; reglamento igual para todos); elección colectiva (quien usa lo común decide sobre lo común: voz con FARO, con un tope por persona a definir); monitoreo (Libro C: lo que se mide de la tierra, público); sanciones graduales (primero aviso, después pérdida de voz, nunca expulsión por creencias); resolución de conflictos (círculo de cuidado y conflictos); derecho a organizarse (la Fundación y el consorcio reconocidos por el municipio, a verificar); niveles anidados (lote, barrio, Lighthouse, BioPueblo).
3. **Dos tipos de token:** dos tarjetas. **NFT del lote:** uno por lote privado; su metadata dice superficie, contorno, estado administrativo y deberes; tenerlo trae deberes (reglamento, aporte, expensas) y una asignación de FARO por m². No reemplaza la escritura: el dominio se registra donde corresponde (⚖ `nftlote`). **Token del bien común (FARO, nombre provisorio):** da voz en las decisiones sobre lo común y podría usarse para pagar parte de las expensas (opción a conversar).
4. **Las parcelas comunes (cambio del 9-nov, decisión de Gus):** "Huertas, bosques, talleres, cocinas, vías, escuela: las parcelas comunes no son tokens. Quedan en un registro del tesoro del bien común, con su uso y lo que se mide de cada una. FARO da voz sobre todas, y quien cuida cada parcela tiene un rol que le da la comunidad, que no se compra ni se vende. Ninguna parcela común se vende." Primero decía "un NFT del tesoro"; el 9-nov se probó un ERC-1155 con cuotas y Gus eligió simplificar: **un solo token del bien común (FARO, ERC-20) para todo lo común, sin respaldo en la tierra**. El respaldo convertiría a FARO en una parte de la tierra común que se vende, lo que choca con "la tierra no se vende" y es lo que la CNV mira como valor negociable [verificar]. El rol de quien cuida podría ser más adelante una atestación EAS (backlog D37). La tarjeta de FARO dice "Es el único token de todo el bien común… No está respaldado por la tierra ni da una parte de ella".
5. **Cómo se reparte FARO:** `BarrasReparto` con los cuatro grupos y su tabla, el suministro y una línea por grupo. NetXGen con ⚖ `partenetxgen`.
6. **Venta temprana por tramos:** tabla de los 4 tramos (cantidad, precio, total en USD) y el avance de ejemplo. Texto: "Es una curva escalonada: el precio sube de tramo en tramo, así quien llega antes paga menos. La mostramos por tramos porque es más fácil de entender que una curva continua." **Calculadora:** un campo "Cuánto pondrías (USD)", accesible con etiqueta, que muestra FARO que recibirías, precio promedio, tramos que toca y cuánto iría al tesoro. Una región `aria-live="polite"`. Botón ausente: "No se puede comprar: es una simulación." ⚖ `ventatramos`.
7. **Staking, en estudio:** tabla con las dos opciones (qué da, a quién favorece, riesgo). B dice: "emitir tokens nuevos diluye a quien no bloquea". Línea final: "Para conversar: la opción A premia el compromiso sin emitir más." ⚖ `stakingbiencomun`.
8. **De dónde sale la plata y en qué se usa:** dos columnas. **Inversión inicial (CAPEX):** masterplan de permacultura del 100 % de la tierra, corredor, agua, caminos; se pagaría con la venta temprana, el aporte único de los lotes y el aporte de entrada. **Mantenimiento (OPEX):** expensas, ingresos del bien común y el aporte de entrada. Montos: "sin dato · a confirmar con Vagner". Debajo, **referentes**, una línea cada uno y "a verificar": Commons Stack (curva donde cada compra deja un aporte a un fondo común), RealT (propiedades tokenizadas con reserva para mantenimiento), Nouns (subasta continua que alimenta un tesoro), impuesto Harberger (*Radical Markets*: cada parcela declara su valor y paga una tasa al común) y CityDAO (tierra y ciudadanía en NFT).
9. **Riesgos y lo que falta decidir:** lista: un token que sube de precio o da derechos sobre plata puede ser un valor negociable ante la CNV (a verificar con abogado); el NFT no es la escritura; que FARO no está respaldado por la tierra; quién emite y en qué país; red y billeteras; verificación de identidad; impuestos; nombre; reparto y tramos; si las expensas se pagan con FARO.

Pie: fuente `VERSION_BIEN_COMUN` y enlace a `/lotes/hibrido`. Aviso de prototipo como en el resto.

### 3. Ficha y boleto
- En `/lotes/[id]`, una tarjeta "NFT del lote (simulado)" después de la imagen: lista de definiciones con número de token (el número del lote), superficie, centro del contorno (lat y lng con 5 decimales), estado administrativo del grupo, deberes ("reglamento, aporte único, expensas") y "FARO que trae: {faroDeLote(m2)}". Red: "sin definir". ⚖ `nftlote`. Enlace "Ver el bien común".
- Al reservar, `vio` guarda `faro` (opcional; un registro viejo dice "sin dato").
- En el boleto, una línea: "Se acuñaría el NFT del lote {n} y se asignarían {faro} FARO (simulado)".
- La nota provisoria de costos pasa a: "lo que el comprador pone en infraestructura se le retribuiría en tokens del bien común (nombre provisorio: FARO). Todavía no está decidido, y no es una promesa." El ⚖ `retribucionraiz` cambia su título a "Retribución en tokens del bien común: medida provisoria" y su texto deja de llamar RAIZ al token (dice que el nombre está en discusión). La clave no cambia.

### 4. Rail, rutas y Sumarte
- `DESTINOS`: "Bien común" en el grupo Descubrir, después de Lotes, con un ícono de `lucide-react` que ya esté instalado. Actualizar `lib/navegacion.test.ts`.
- `/bien-comun` en `RUTAS_PUBLICAS` y `RUTAS_TRADUCIDAS`.
- Sumarte, sección Invertir: una línea "El token del bien común: ver la simulación" que enlaza a `/bien-comun`, sin montos.

### 5. ⚖ nuevos (borrador, es/en)
Cada uno dice qué es en palabras simples, que es una simulación y "a verificar con abogado": `nftlote` (un certificado digital del lote; no reemplaza la escritura), `tokenbiencomun` (unidad que daría voz en lo común; no existe; no se promete valor), `ventatramos` (precio por tramos; no es una oferta; un token con precio creciente puede ser un valor negociable), `stakingbiencomun` (bloquear tokens para sumar voz o recibir más; en estudio), `partenetxgen` (la parte de la empresa que diseña y opera, liberada en 4 años para alinear incentivos).

## Risks / Trade-offs

- [El equipo lo lee como decidido] → Aviso fijo arriba, "idea" en cada principio y "de ejemplo" en cada número.
- [Lenguaje de inversión] → Ningún texto dice ganancia, retorno ni valorización. La regla 5 se rompe solo con "token" e "invertir", a pedido de Gus (R42).
- [Muchos números] → Todos salen del módulo; el test de números escritos se amplía a `/bien-comun`.

## Migration Plan

Sin datos guardados, salvo el campo opcional `faro` en las reservas simuladas. Volver atrás es revertir el PR.
