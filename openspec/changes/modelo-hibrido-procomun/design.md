# Design

## Context

`lib/lotes/modelo.ts` ya calcula aporte, expensas y lecciones. `/netx` y `/netx/financiamiento` están solo en español, por decisión anterior: el relato híbrido de esas páginas sigue en español, y `/lotes/hibrido` es bilingüe (ADR-004).

**Dónde está de verdad el Juego A y el B**, porque el pedido nombra otros archivos:

| Contenido | Archivo | Lo usa |
|---|---|---|
| `JUEGO_A`, `JUEGO_B`, `PROCOMUN_EN_SIMPLE` | `lib/financiamiento/juegos.ts` | **`/netx`**, no `/netx/financiamiento` |
| `LOTES_INTRO`, `LOTES_VS_MODELO`, `PROPUESTA_PARA_QUIEN_VENDE` | `lib/financiamiento/relato.ts` | `SeccionJuegos` de `/netx/financiamiento` |
| "por qué vender lotes no es el atajo" | `app/netx/financiamiento/page.tsx` | la bajada de esa página |

Por eso el cambio toca también `/netx` y `relato.ts`.

## Goals / Non-Goals

**Goals:**
- Una sola explicación, sin números escritos a mano, que no se contradiga con la ficha ni con la Vista NetX.
- Decir qué falta, en lugar de disimularlo.

**Non-Goals:**
- Inventar el reparto del presupuesto entre rubros.
- Volver a defender el "no vender" ni atacar la venta: el tono es descriptivo.

## Decisions

### 1. Una ruta propia
`/lotes/hibrido`, y no una sección dentro de la ficha, porque la explicación es la misma para todos los lotes y se enlaza desde `/lotes`, desde cada ficha y desde la Vista NetX. La regla `/^\/lotes\/[^/]+$/` ya la hace pública, y una ruta estática gana sobre `[id]`. No suma destino al rail: marca "Lotes" como activo.

### 2. La tabla de lo privado y lo común
`lib/lotes/hibrido.ts`, bilingüe y puro:

| Qué | De quién | Quién lo paga | Cuánto |
|---|---|---|---|
| Tu lote | Privado | Quien compra | Precio de referencia (módulo) |
| Tu casa, si la construís | Privado | Quien compra | sin dato |
| Caminos | Común | Presupuesto común | sin dato |
| Agua | Común | Presupuesto común | sin dato |
| Aguas grises y negras | Común | Presupuesto común | sin dato |
| Basura | Común | Presupuesto común | sin dato |
| Escuela | Común | Presupuesto común | sin dato |
| Restauración | Común | Presupuesto común | sin dato |
| Producción | Común | Presupuesto común | sin dato |

Debajo: "El costo de cada rubro todavía no está calculado: sin dato. El presupuesto común de ejemplo es {240.000} por año y sale del aporte único y de las expensas." "Quién lo paga" es un supuesto del modelo, y la página lo dice. La columna "De quién" lleva palabra, no color.

### 3. Cuánto aporta cada lote
Tres datos, leídos del módulo: aporte único ({25.000}, ⚖ `aporteunico`), expensas por año ({3.000}, ⚖ `expensas`), y "si el aporte se suma al precio o va incluido: sin dato".

### 4. Por qué la venta sola no alcanza
Con `n = listarLotes().length`:

1. `leccionAporte(n)`: hoy, "Con 25 lotes, el aporte único del 5 % suma USD 625.000: paga 2,6 años de un presupuesto común de USD 240.000, y no se repite."
2. `leccionExpensas(n)`: "Cubrir ese presupuesto solo con expensas pide USD 9.600 por lote al año; la expensa de ejemplo es USD 3.000."
3. `leccionFaltante(n)`, nueva: "Con las expensas de ejemplo entran USD 75.000 por año: faltan USD 165.000 por año, y de dónde salen: sin dato."

**El título "Por qué la venta sola no alcanza" sigue siendo cierto con los números de hoy**: el aporte no se repite y las expensas cubren menos de un tercio. Lo que no se afirma es "ni el primer año", salvo que los valores lo sostengan (`lote-ficha-y-compra`, design §2).

### 5. Resguardos
Cuatro, de doc 18 §4 (los que pidió Gus), cada uno con la línea "Estado: todavía no está hecho":

| Resguardo | Texto |
|---|---|
| Servidumbres | Se registran antes de la primera venta. |
| Mismo reglamento y aporte | Quien compra cumple el mismo reglamento y hace el mismo aporte que todos. |
| Preferencia de reventa | Si alguien revende, hay una preferencia acordada de antemano. |
| Franja del río | Ninguna venta sobre la franja del río. |

En la franja se agrega: "El loteo provisorio no considera la costa ni la línea de inundación: todavía no está verificado (sin dato)", con el ⚖ `ribera`, que ya existe.

**⚖ `resguardoshibrido`** (borrador):
- es: "Son condiciones que el modelo híbrido pide para que vender un lote no le saque derechos a la tierra ni al procomún. Ninguna existe todavía. Una preferencia contractual sobre un inmueble dura poco; la forma duradera depende del régimen del barrio. A verificar con abogado."
- en: "These are conditions the hybrid model asks for, so that selling a lot does not take rights away from the land or the commons. None of them exists yet. A contractual preference over real estate is short-lived; the lasting form depends on the community's legal regime. To be verified with a lawyer."

Doc 18 §4 también pide un **tope a la parte vendible** (punto 1) y que ningún pase dé prioridad sobre un lote (punto 5). El punto 5 ya está en la ficha y en el Pase. El tope no se muestra porque no hay valor: queda como pregunta.

### 6. `/netx/financiamiento`
- `INDICE`: "Juego A o Juego B" pasa a "El modelo híbrido", con id `m-hibrido`.
- Bajada: "El detalle de cómo entra la plata: en qué orden cobra cada uno, cómo se puede invertir hoy, qué pasa si sale mal y cómo conviven la venta de lotes y el procomún."
- `SeccionJuegos` pasa a `SeccionHibrido`, con tres bloques de igual estilo:
  - **Lotes privados:** el sector norte, simulado, con supuesto de trabajo (⚖ `ordenanza173`), resumen del precio y de los aportes. "Quién cobra la venta: sin dato."
  - **Procomún:** la tierra común queda en una Fundación que todavía no existe (⚖ `fundaciontierra`), y los lotes no. Las tres lecciones de §4.
  - **Series y NetX:** la plata de los proyectos entra por series; NetX cobra por su trabajo. "Comisión por vender lotes: NetX no puede cobrarla sin matrícula de corredor (a verificar con abogado)", que ya estaba en la tabla vieja y sigue valiendo.
- Enlace a `/lotes/hibrido`. `BloqueManifiesto` queda al final de la sección.
- En `relato.ts` salen `LOTES_INTRO`, `LOTES_VS_MODELO`, `FilaLotes` y `PROPUESTA_PARA_QUIEN_VENDE`. En `BOLSILLOS`, la fila de la Fundación dice "Fondo del Procomún; en el modelo híbrido, la tierra común queda en ella (todavía no existe)".
- `ETAPAS`: el SAFE deja de decir "tickets de USD 5.000" y usa `TICKETS_SAFE` (`lib/financiamiento/fuentes.ts`, lo crea `sumarte-diseno-b`).
- `SUPUESTOS_A_CONFIRMAR` suma, con valores leídos del módulo o "sin dato": "Precio de referencia de los lotes" (`martinFranz`), "Aporte único y expensas de los lotes" (`vagner`), "Quién vende los lotes y si el aporte se suma al precio" (`abogado`).
- Al pie, las fuentes suman `VERSION_MODELO_LOTES`.

### 7. `/netx` (Resumen)
- `h1`: "¿Cómo se financia NetX?".
- Respuesta corta: "NetX es la empresa que diseña, gestiona y opera la plataforma, y cobra por su trabajo. La fase 1 suma la venta de lotes privados en Lighthouse VRN, simulada en este prototipo; la tierra común queda en una Fundación que todavía no existe y la plata de los proyectos entra por series (⚖) del programa de fideicomisos." Sigue "Ver el modelo completo".
- "Dos juegos" pasa a "El modelo híbrido": un solo bloque con `HIBRIDO` (renombrando `juegos.ts` a `lib/financiamiento/hibrido.ts`, que conserva `PROCOMUN_EN_SIMPLE` y `PALABRAS_QUE_NO_VAN`), con fuente, y un enlace a `/lotes/hibrido`.
- Sale "¿Y vender lotes?".
- `/netx/simulador`: "el Juego B en números" pasa a "el procomún en números".

**Se mantiene la regla de tono:** ningún texto usa "capitalista", "extractivista", "colonialista" ni nombra a Franz. La decisión se registra en el ADR, no en pantalla. Que el grupo existente "A confirmar con Martín y Franz" lo nombre no cambia con esto.

### 8. ⚖ `ordenanza173` (borrador)
- es: "Hasta que el municipio apruebe un loteo, nadie puede ofrecer, vender, reservar ni dar prioridad sobre esos lotes. Por eso, en este prototipo, la venta de lotes de Lighthouse VRN es una simulación sobre un supuesto de trabajo: la aprobación no está otorgada y no tiene fecha. A verificar con abogado."
- en: "Until the municipality approves a subdivision, nobody can offer, sell, reserve or give priority over those lots. That is why, in this prototype, selling Lighthouse VRN lots is a simulation on a working assumption: approval has not been granted and has no date. To be verified with a lawyer."

## Risks / Trade-offs

- [Se pierde la comparación de costos de vender (agua, tierra, ingresos únicos)] → Es lo pedido, sin volver a discutirlo. La parte que describe riesgos reales queda en doc 30, y las lecciones cuentan lo de los ingresos únicos.
- [El Fogón sigue nombrando "Juego B"] → Fuera de alcance; se reporta en el PR. Es un texto de gobernanza que no se toca ahora.
- [La Fundación "todavía no existe" y su papel en el híbrido no está decidido] → Es un supuesto de este cambio, y queda como pregunta. Si cambia, son textos y un ⚖.
- [Tres páginas repiten el relato] → Las tres leen el mismo módulo y los mismos textos de lecciones.
- [`e2e/login.spec.ts` y `e2e/vista-netx.spec.ts` esperan el título viejo] → Se actualizan: el título cambió a propósito.

## Migration Plan

Sin datos guardados. Volver atrás es revertir el PR. Al archivar, actualizar el `Purpose` de `openspec/specs/vista-netx-financiamiento/spec.md`, que hoy dice "sin vender lotes".
