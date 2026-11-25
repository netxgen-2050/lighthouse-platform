# Design

## Contexto

- `components/lotes/usar-compras.ts` lee y guarda `lh-lotes` (`CLAVES.lotes`) con `leerCompras()` de `lib/lotes/compra.ts`, solo con sesión. El registro no tiene identidad ni datos de pago.
- `lote-token-tierra` suma a `LoVisto` un campo opcional `plan` (contado o 12/24/36 cuotas, anticipo, cuota) y una función de FARO acreditado por fracción pagada en `lib/bien-comun/modelo.ts`. Los primeros 4 lotes no tienen plan ni FARO.
- La adhesión al manifiesto se guarda en `lh-adhesion-version` y tiene su helper en `lib/manifiestos/`.

## Decisiones

### 1. Función única de reservas
`lib/lotes/reservas.ts`:

```ts
/** Única puerta a las reservas simuladas. Hoy: navegador. Mañana (lotes-en-la-base): la base. */
export async function leerReservas(sesion: { estado: "ok" | "sin-sesion" }): Promise<CompraLote[]>;
export async function guardarReservas(sesion: …, compras: CompraLote[]): Promise<boolean>;
```

- Asíncrona desde hoy, aunque `localStorage` sea síncrono: así el día que lea de Neon no cambia ninguna firma ni ningún componente.
- Sin sesión devuelve `[]` sin tocar el navegador.
- `guardarReservas` también se mueve acá (no lo pide el pedido, pero si la escritura queda en el hook, el paso a Neon tocaría dos lugares).
- `usar-compras.ts` llama a estas dos funciones; su API (`compras`, `guardar`, `listo`) no cambia, salvo que `guardar` pasa a devolver `Promise<boolean>` (se ajustan sus dos usos).
- **Borrar** la clave desde `/mis-datos` sigue como está (borrar no es leer).
- Un test recorre `app/`, `components/` y `lib/` y falla si algún archivo distinto de `lib/lotes/reservas.ts` y su test hace `getItem`/`setItem` con `CLAVES.lotes` o `"lh-lotes"`.
- <!-- arquitecto: lecturas genéricas que el test no ve --> **Lecturas que no pasan por la función, a sabiendas.** `lib/privacidad/exportar.ts` ("Mis datos" → exportar), `lib/demo/importar.ts` (mueve las claves viejas sin prefijo a las de la persona) y el borrado de `/mis-datos` recorren **todas** las claves `lh-*` sin nombrar `CLAVES.lotes`, así que el test no las ve. Hoy está bien: leen el mismo navegador. Pero el día de `lotes-en-la-base` esas tres tienen que pasar a leer y borrar las reservas por la base, o la persona exportaría y borraría un navegador vacío creyendo que exportó o borró sus reservas. Se deja escrito en el comentario de `lib/lotes/reservas.ts` y en este design. No se tocan en este cambio.
- Las claves ya llevan el prefijo de la persona en sesión (`CLAVES` → `u:<idPersona>:lh-lotes`, `lib/demo/claves.ts`), así que "Entrar como…" con otra persona en el mismo navegador no le muestra las reservas de la anterior. `leerReservas` sigue usando `CLAVES.lotes` (nunca el literal `"lh-lotes"`) para conservar ese prefijo.

<!-- arquitecto: la puerta manda a Sumarte si la ruta no es pública -->
**`/mi-tierra` se suma a `RUTAS_PUBLICAS`** (`lib/sesion/rutas-publicas.ts`). Si no, `Puerta` redirige a `/sumarte` a quien no tiene sesión y el escenario "Mi tierra sin sesión" (aviso para entrar) no se puede cumplir. No abre ningún dato: sin sesión `leerReservas` devuelve `[]` sin tocar el navegador y la página dibuja solo `EntrarPara`. Mismo criterio que `rediseno-menu-cinco` ("cada página decide qué muestra sin sesión").

### 2. Vista armada por una función pura
`lib/mi-tierra/portafolio.ts` recibe `CompraLote[]`, la adhesión y el idioma, y devuelve lo que dibuja la página: por lote (id, estado, opción, precio visto, plan, FARO acreditados y totales), y las filas del libro ordenadas de la más nueva a la más vieja. Sin React, testeada.

<!-- arquitecto: estado y FARO con un solo dueño cada uno -->
- **Estado:** sale de `estadoConCompras()` de `lib/lotes/compra.ts` (con `en-cuotas-tuyo` de `lote-token-tierra`), la misma función que usan la ficha, la lista y el mapa. `portafolio.ts` no reescribe la regla: así un lote no puede decir "En cuotas" en Mi tierra y "Vendido" en su ficha. Una compra pagada **sin** `plan` (vieja) muestra lo que `estadoConCompras` diga, y el plan "sin dato": nunca se presume "Contado" (`lote-token-tierra`, design).
- **Plan y FARO:** se leen de lo que la persona vio y quedó guardado (`vio.plan.anticipo`, `cuota`, `cuotas`, `faroAnticipo`, `faroPorCuota`), no se recalculan con el modelo de hoy. Si el modelo cambia de versión, Mi tierra y el boleto siguen mostrando lo mismo. FARO acreditados = `faroAnticipo` (solo se simula el primer pago). FARO del plan completo = `vio.faro` (el total del lote que la persona vio), porque la última cuota se ajusta por redondeo (`lote-token-tierra`) y `faroAnticipo + faroPorCuota × cuotas` no da exacto. Si la compra no guardó `vio.faro` → "sin dato", sin recalcular con el modelo de hoy. Si al construir resulta que `lote-token-tierra` dejó de guardar `vio.faro` en las compras nuevas, se frena y se reporta (no se inventa el total). Compra vieja con `vio.faro` y sin `plan`: se muestra ese número con el texto "se acreditan a medida que se paga".

### 3. Cuotas pagadas
En el prototipo solo se simula el primer pago (el anticipo). Cuotas pagadas = 0 de N tras el anticipo; la barra muestra la fracción del precio del lote ya pagada (anticipo / precio). No se inventan pagos siguientes.

### 4. Presentación (dirección C)
Indicadores arriba (lotes, fracción pagada, FARO acreditados) con números en JetBrains Mono, una tarjeta por lote con `ChipEstado` y `BarraAvance`, y `TablaLibro` para la actividad. Fondo y superficies del tema; sin foto.

### 5. Voz
Texto fijo del diccionario, con el enlace al manifiesto. "Una persona, un voto en asuntos de residentes" se muestra solo como lo que propone el doc 34 (decisión 5, abierta) y con la aclaración de ADR-031. Ningún código lee FARO para la voz.

## Riesgos

- **Cambiar el hook de compras puede romper la ficha y el boleto.** Mitigación: los e2e de lotes existentes no cambian y tienen que seguir en verde.
- **Ver plata "tuya"** puede leerse como real. Mitigación: sello de venta y "simulado" en cada bloque con números.
