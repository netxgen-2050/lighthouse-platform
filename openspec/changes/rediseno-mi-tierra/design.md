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

### 2. Vista armada por una función pura
`lib/mi-tierra/portafolio.ts` recibe `CompraLote[]`, la adhesión y el idioma, y devuelve lo que dibuja la página: por lote (id, estado, opción, precio visto, plan, FARO acreditados y totales), y las filas del libro ordenadas de la más nueva a la más vieja. Sin React, testeada. El estado "en cuotas" sale de `paso === "pagado"` con plan en cuotas; "vendido", de pagado al contado; "reservado", de `paso === "reservado"`.

### 3. Cuotas pagadas
En el prototipo solo se simula el primer pago (el anticipo). Cuotas pagadas = 0 de N tras el anticipo; la barra muestra la fracción del precio del lote ya pagada (anticipo / precio). No se inventan pagos siguientes.

### 4. Presentación (dirección C)
Indicadores arriba (lotes, fracción pagada, FARO acreditados) con números en JetBrains Mono, una tarjeta por lote con `ChipEstado` y `BarraAvance`, y `TablaLibro` para la actividad. Fondo y superficies del tema; sin foto.

### 5. Voz
Texto fijo del diccionario, con el enlace al manifiesto. "Una persona, un voto en asuntos de residentes" se muestra solo como lo que propone el doc 34 (decisión 5, abierta) y con la aclaración de ADR-031. Ningún código lee FARO para la voz.

## Riesgos

- **Cambiar el hook de compras puede romper la ficha y el boleto.** Mitigación: los e2e de lotes existentes no cambian y tienen que seguir en verde.
- **Ver plata "tuya"** puede leerse como real. Mitigación: sello de venta y "simulado" en cada bloque con números.
