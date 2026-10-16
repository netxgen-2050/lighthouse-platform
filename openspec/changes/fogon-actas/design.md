# Design

## Context

`fogon-cuadratico-en-la-base` guarda las consultas, el padrón y un libro de votos de solo agregar. Después del cierre la base no acepta envíos nuevos, ni cambios de opciones, padrón o reglas, así que **los datos de entrada del acta ya no cambian**. Lo que puede cambiar es el **cálculo**: el resultado se arma al vuelo con el motor de `lib/cuadratico/`, y su diseño (§ riesgos) anota que, si un acta tiene que quedar fija, se agrega una tabla `actas`. El dogfooding va a usar las actas de U1–U4 para decidir, así que este cambio las fija.

**Goals:** el acta de cada consulta cerrada queda escrita una sola vez, tal como era al cierre; se muestra desde la base; se puede copiar como texto; se encuentra desde el Fogón.

**Non-Goals:** PDF, firmas, sellos externos, efectos legales, actas de `fogon-decisiones`, avisos.

## Decisions

### 1. Tabla `consulta_actas` (una migración nueva)

| Columna | Tipo | Nota |
|---|---|---|
| `consulta_id` | `uuid` PK, foránea `→ consultas` `on delete restrict` | una sola acta por consulta |
| `cerrada_at` | `timestamptz not null` | `consultas.cerrada_at` si se cerró a mano; `consultas.cierre_at` si cerró por fecha |
| `cierre_tipo` | enum (`a-mano`, `por-fecha`) | |
| `cerrada_por` | `→ personas` nula | solo en `a-mano` |
| `repartieron`, `padron` | `int not null` | `check (0 <= repartieron and repartieron <= padron)` |
| `regla` | `text not null` | por ejemplo "Voto cuadrático, 100 créditos por persona, resultado al cierre, voto abierto" |
| `resultado` | `jsonb not null` | lista ordenada `{ opcion_id, etiqueta, votos, porcentaje, personas, monto_centavos? }` y `sin_asignar_centavos?` en presupuesto |
| `motor_version` | `text not null` | constante exportada por `lib/cuadratico/` |
| `registrada_at` | `timestamptz not null default now()` | |

- **Por qué `jsonb` acá** y no columnas, a diferencia de los votos (ADR-001): el acta es una **foto** derivada de datos que ya están en columnas reales; no se consulta por opción ni se suma. Guardar la foto entera es justamente lo que se quiere congelar. La etiqueta de cada opción se copia para que el acta se lea sola.
- **Triggers** (SQL propio, probado con PGlite): solo agregar (`BEFORE UPDATE OR DELETE` por fila y `BEFORE TRUNCATE` por sentencia, como los libros de votos); `BEFORE INSERT` rechaza con `consulta-abierta` si la consulta no está efectivamente cerrada (`estado = 'cerrada'` o `now() >= cierre_at`).

### 2. Cuándo se escribe

- **Cierre a mano:** `cerrarConsulta` arma el acta con el motor y la inserta **en la misma transacción** que el `update` de `consultas` (mismo camino de transacciones que eligió `fogon-cuadratico-en-la-base`: `neon-serverless` o `db.batch`).
- **Cierre por fecha:** no hay cron. `vista` y `listar`, al encontrar una consulta efectivamente cerrada sin acta, la arman e insertan con `insert … on conflict (consulta_id) do nothing` y después la leen. Dos lecturas a la vez dan la misma acta (los datos de entrada no cambian después del cierre) y solo una fila entra.
- Si la escritura falla, la lectura no falla: la vista trae `acta: null` y `resultado` calculado como hoy; la pantalla lo dice ("El acta todavía no está registrada") y lo registra en el log del servidor.

### 3. API y tipos

- Sin rutas nuevas. `VistaConsulta` suma `acta: ActaRegistrada | null` (solo cuando la consulta está cerrada). `ResumenConsulta` suma `cerradaAt` para la sección del Fogón (ya trae el estado).
- `lib/fogon/consultas/acta.ts` (puro): `armarActa(consulta, opciones, ultimosRepartos, padron)` y `textoActa(acta)` para copiar. El texto **no lleva nombres** en ningún tipo de voto: solo agregado y participantes.
- La fuente del navegador de `fogon-cuadratico` implementa `acta` armándola al vuelo con la misma función, marcada como no registrada.

### 4. Pantalla

- En el detalle cerrado: h2 "Acta", "Registrada el <fecha y hora>" (hora de Argentina), el contenido y el botón "Copiar el acta" (`navigator.clipboard.writeText`; anuncio "Acta copiada" en una región `role="status"`; si falla, un `<textarea readonly>` con el texto y la indicación "Seleccioná y copiá el texto").
- En `/fogon`: sección "Actas de consultas" (h2) con una lista de enlaces "título · cerrada el <fecha>", desde `listar()`. Sin consultas cerradas: "Todavía no hay actas de consultas".

## Risks / Trade-offs

- [Escribir en una lectura (GET)] → es idempotente y solo deriva datos ya cerrados; no cambia nada que la persona haya hecho. ADR-006 trata las rutas públicas que escriben; acá la ruta tiene sesión, pero el arquitecto debería confirmar que este patrón es aceptable o proponer otro (por ejemplo, un cron de Vercel).
- [`jsonb` en una base que prefiere columnas] → justificado arriba; si más adelante hace falta consultar actas por opción, se agrega una tabla hija.
- [Un acta escrita con un motor con errores queda fija] → se guarda `motor_version`; corregir un acta es otra decisión (fuera de alcance).
- [Copiar el acta saca el resultado de la plataforma] → solo el agregado, que ya ve todo el padrón; en voto secreto con grupos chicos el agregado puede dejar adivinar votos (ya anotado en `fogon-cuadratico-en-la-base`).
