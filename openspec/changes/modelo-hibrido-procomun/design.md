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
| Tu lote | Privado | Quien compra | Rango de precios de lote (módulo), de ejemplo |
| Tu casa, si la construís | Privado | Quien compra | Rango de precios de casa (módulo), estimación de ejemplo |
| Caminos | Común | Presupuesto común | sin dato |
| Agua | Común | Presupuesto común | sin dato |
| Aguas grises y negras | Común | Presupuesto común | sin dato |
| Basura | Común | Presupuesto común | sin dato |
| Escuela | Común | Presupuesto común | sin dato |
| Restauración | Común | Presupuesto común | sin dato |
| Producción | Común | Presupuesto común | sin dato |

Debajo: "El costo de cada rubro todavía no está calculado: sin dato. El presupuesto común de ejemplo es {72.000} por año y sale del aporte único y de las expensas." "Quién lo paga" es un supuesto del modelo, y la página lo dice. La columna "De quién" lleva palabra, no color.

### 3. Cuánto aporta cada lote
Tres datos, leídos del módulo: aporte único (el 5 % de lo que se paga, ⚖ `aporteunico`, con el ejemplo del paquete promedio: {7.605}), expensas por año ({1.200}, ⚖ `expensas`), y "si el aporte se suma al precio o va incluido: sin dato".

### 4. Por qué la venta sola no alcanza: tres escenarios (reescrito el 8-nov)
**No se usa `leccionFaltante` ni ninguna cifra de "lo que falta".** El costo anual del bien común no existe: el USD 72.000 de `lib/lotes/modelo.ts` salió de una simulación de octubre (`NS_Tokenomics/sim/RESULTS.md`, "Commons opex USD 6k/month ❓") y nadie lo costeó. La página lo dice con esas palabras.

**Qué se muestra:**
1. **Para qué es la plata:** el bien común es el 100 % de la tierra, no solo el sector de lotes. Los lotes privados son el 0,4 % del 7A (superficie de los 21 lotes sobre la del 7A, calculada del loteo y del polígono, nunca escrita a mano), y todo lo demás hay que diseñarlo, restaurarlo y mantenerlo.
2. **Qué cuesta, con fuente:** una lista de rubros (masterplan de permacultura, mantenimiento del corredor y de las reservas, agua, energía, caminos, personal, seguros y tasas). Todos dicen "sin dato · a confirmar con Vagner", salvo el masterplan: **"más de USD 30.000 el primer año (Gus, 8-nov, estimación)"**.
3. **Tres escenarios de costo anual**, en `lib/lotes/escenarios.ts`, cada uno con su fuente y la marca "de ejemplo, no es un presupuesto":
   - **Arranque:** USD 30.000, el masterplan del primer año (Gus, 8-nov).
   - **Simulación de octubre:** USD 72.000 (`NS_Tokenomics/sim/RESULTS.md`).
   - **Alternativa alta:** USD 240.000 (`NS_Tokenomics/sim/lot_sale_sim.py`, `COMMONS_BUDGETS`).
4. **Qué cubre la venta en cada escenario**, calculado con el módulo: el aporte único repartido en los años de venta y las expensas de los 21 lotes del sector norte. Para cada escenario: qué parte cubre la venta, en porcentaje y en dólares, y "el resto saldría de: token del bien común, ingresos del bien común (huerta, cocina, alojamiento) u otros aportes: sin dato". Los primeros 4 lotes no se suman: "si aportan al bien común de Lighthouse: sin dato" (R40).
5. **Calculadora:** tres controles accesibles con teclado (costo anual del bien común, expensa por lote, cantidad de lotes), con los valores del escenario elegido como punto de partida. Muestra lo mismo que el punto 4 y se recalcula al cambiar. No guarda nada. Una región `aria-live="polite"` anuncia el resultado.
6. **Lo que hay que preguntarle a Vagner**, como lista: costo de cada rubro, cuánto del costo es inversión inicial (CAPEX) y cuánto es mantenimiento (OPEX), y desde qué año.

`leccionAporte` y `leccionExpensas` siguen, pero reciben el costo del escenario en lugar del presupuesto fijo.

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

### 9. "Bien común" en vez de "procomún" (8-nov)
En todo texto visible en español, "procomún" pasa a "bien común" y "Procomún" a "Bien común", con la concordancia que haga falta ("del procomún" → "del bien común"; "Fondo del Procomún" → "Fondo del Bien Común"). Incluye los ⚖ de `lib/legal/terminos.ts`, `lib/idioma/textos/`, `lib/series/`, `lib/financiamiento/`, `lib/manifiestos/`, `lib/gobernanza/datos.ts` y `app/netx/`. En inglés sigue "commons". **Los identificadores del código no cambian** (`PROCOMUN_EN_SIMPLE`, `procomun-tickets`). Al terminar, `grep -rIn "procomún\|Procomún" app lib components` no da nada fuera de comentarios.

### 10. Quién es "todos" (opción C, 8-nov)
La tabla de §2 suma una columna o una línea por rubro que diga quién lo cuidaría:
- **Consorcio de propietarios:** caminos internos, agua, aguas grises y negras, basura.
- **Fundación (todavía no existe):** restauración, corredor, producción, escuela.
Arriba de la tabla: "Proponemos repartir lo común en dos: lo que los vecinos usan todos los días lo cuida un consorcio de propietarios; lo que cuida el territorio queda en una Fundación al servicio de la comunidad que adhiere al manifiesto. Es una propuesta para el equipo, a verificar con abogado." ⚖ nuevo `consorciofundacion`, en borrador, es/en.

### 11. Resumen en la ficha y aceptación al reservar (8-nov)
En `/lotes/[id]`, antes de "Qué podés hacer", una tarjeta "Lo que compartís y lo que pagás" con tres líneas leídas de `lib/lotes/hibrido.ts`:
1. "Tu lote y tu casa son tuyos; caminos, agua, corredor y producción son de todos."
2. "Pagás el aporte único al bien común y las expensas por año" (con los valores del módulo).
3. "Cumplís el mismo reglamento que todos", con el enlace "Ver qué es tuyo y qué es de todos" a `/lotes/hibrido`.

"Reservar (simulado)" queda deshabilitado hasta marcar una casilla "Leí lo que comparto y lo que me comprometo a pagar". La reserva guarda en `vio` la versión del texto aceptado (`hibridoAceptado: VERSION_HIBRIDO`), y el boleto la muestra. Un registro viejo sin ese campo se sigue leyendo ("sin dato"). La casilla tiene su etiqueta, se maneja con el teclado y el botón deshabilitado dice por qué.

## Risks / Trade-offs

- [Se pierde la comparación de costos de vender (agua, tierra, ingresos únicos)] → Es lo pedido, sin volver a discutirlo. La parte que describe riesgos reales queda en doc 30, y las lecciones cuentan lo de los ingresos únicos.
- [El Fogón sigue nombrando "Juego B"] → Fuera de alcance; se reporta en el PR. Es un texto de gobernanza que no se toca ahora.
- [La Fundación "todavía no existe" y su papel en el híbrido no está decidido] → Es un supuesto de este cambio, y queda como pregunta. Si cambia, son textos y un ⚖.
- [Tres páginas repiten el relato] → Las tres leen el mismo módulo y los mismos textos de lecciones.
- [`e2e/login.spec.ts` y `e2e/vista-netx.spec.ts` esperan el título viejo] → Se actualizan: el título cambió a propósito.

## Migration Plan

Sin datos guardados. Volver atrás es revertir el PR. Al archivar, actualizar el `Purpose` de `openspec/specs/vista-netx-financiamiento/spec.md`, que hoy dice "sin vender lotes".
