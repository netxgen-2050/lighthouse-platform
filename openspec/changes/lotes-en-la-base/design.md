# Design

## Context

- **Reservas:** `lib/lotes/reservas.ts` ya es la única puerta y es asíncrona "para el día de `lotes-en-la-base`". Su comentario nombra tres lugares que recorren todas las claves `lh-*` sin pasar por ella: `lib/privacidad/exportar.ts`, `lib/demo/importar.ts` y el borrado de `/mis-datos`. Las reglas puras (`reservar`, `pagar`, `deshacer`, `estadoConCompras`) viven en `lib/lotes/compra.ts`. Los estados de ejemplo están en `lib/territorios/loteo-estados.ts`, y el loteo en `loteo-norte.json`, leído solo por `lib/territorios/loteo.ts`.
- **Contactos:** `lib/contactos/almacen.ts` guarda en `lh-contactos`. Hay tres formularios que llaman a `guardarPedido`: `ficha-cliente.tsx` (lote), `vitrina-territorio.tsx` y `sumarte-cliente.tsx`. La bandeja de `/admin` y `usePendientes` leen el navegador. `lh-consultas-lotes` está declarada en `claves.ts`, pero ningún código la escribe.
- **Bitácora:** el formato está en `lib/demo/bitacora.ts` (tipo, clave, mostrado, huella, borrador, idioma, 30 minutos sin repetir, tope de 300). La escribe `anotar-en-bitacora.ts` y la lee `/panel/bitacora`.
- **Servidor:** `consentimiento-en-la-base` dejó `sesionDelPedido`, `exigirConsentimiento`, `moldeDeEscritura` (tipo de contenido y origen propio) y el patrón de ruta con tope de bytes, `no-store` y errores sin detalle. Este cambio lo copia.

## Goals / Non-Goals

**Goals:**
- Un lote reservado por alguien se ve reservado para todos.
- El equipo ve todos los contactos.
- La bitácora queda en un libro que no se puede editar.
- Ninguna escritura sin un consentimiento vigente.
- Mis datos sigue descargando y borrando todo lo de la persona.

**Non-Goals:**
- Editar lotes o precios (paso 3).
- Responder contactos.
- Cobrar.
- Copiar lo que hay hoy en los navegadores.

## Decisions

### 1. Esquema (`lib/db/schema.ts`, migración `0002`)

```
reserva_evento: enum('reserva', 'paga', 'deshace')
opcion_compra:  enum('solo-lote', 'modular', 'familiar', 'amplia')

reservas (libro: triggers que rechazan UPDATE, DELETE y TRUNCATE)
  id            uuid pk
  persona_id    uuid not null → personas (restrict)   -- de quién es la reserva
  hecho_por     uuid not null → personas (restrict)   -- quién agregó la fila (la persona o el super admin que libera)
  lote_id       text not null                          -- id del loteo en código ("lote-7"); sin FK hasta el paso 3
  evento        reserva_evento not null
  opcion        opcion_compra                          -- obligatoria en 'reserva', nula en los otros
  vio           jsonb                                  -- LoVisto; obligatoria en 'reserva'; ≤ 4 KB
  origen        jsonb                                  -- { fuente, medio, campana, camino }; opcional
  registrado_at timestamptz not null default now()
  índices: (lote_id, registrado_at desc), (persona_id, registrado_at desc)

contactos (tabla común: la persona puede borrar los suyos)
  id, persona_id → personas (restrict), motivo text, referencia text, canal text, momento text,
  mensaje text (≤ 500), destino text, estado_mostrado text, origen jsonb, creado_at timestamptz default now()
  índice: (creado_at desc)

bitacora (libro: mismos triggers)
  id, persona_id → personas (restrict), ruta text, tipo text ('estado-loteo' | 'termino-legal'),
  clave text, mostrado text, huella text, borrador boolean, idioma text, mostrado_at timestamptz default now()
  índice: (persona_id, tipo, clave, huella, mostrado_at desc)

personas.origen jsonb  -- la primera visita; se escribe solo si es null
```

- **Libros:** `reservas` y `bitacora` son libros con triggers escritos a mano, como en `0001` y con el mismo comentario. `contactos` no es un libro: tiene un mensaje en texto libre (dato personal) y la persona lo puede borrar (Ley 25.326, art. 16).
- **`lote_id` es texto:** el servidor lo valida contra `listarLotes()`. Cuando el paso 3 cree la tabla `lotes`, se agrega la FK.
- **`motivo`, `canal` y `momento`** son texto validado contra las listas de `lib/contactos/tipos.ts`, no enums de Postgres: el CRM va a sumar motivos.

### 2. Estado de un lote (`lib/lotes/servidor.ts`)

- **El estado vigente de un lote es el último evento del libro para ese `lote_id`.** No hay fila o es `deshace`: el lote vuelve a su estado de ejemplo (`estadoDeLote`). Es `reserva`: el lote está reservado por `persona_id`. Es `paga`: está vendido a `persona_id`, al contado o en cuotas según `vio.plan`.
- **Una sola reserva vigente por lote.** Cada escritura corre en una transacción con `pg_advisory_xact_lock(hashtext('reserva:' || lote_id))`, lee el último evento y recién entonces agrega. Hace falta el driver `neon-serverless`, que es el de `lib/db/cliente.ts`.
- **Reglas** (las mismas de `compra.ts`, ahora en el servidor):

  | Acción | Se permite si | Si no, responde |
  |---|---|---|
  | `reservar` | el estado de ejemplo del lote es `disponible` y no hay reserva vigente | 409 `no-disponible` o `ya-reservado` |
  | `pagar` | la reserva vigente es de la persona | 409 `no-reservado` |
  | `deshacer` | la reserva o el pago vigente es de la persona, o quien lo pide es super admin (`hecho_por` ≠ `persona_id`) | — (sin nada vigente es un no-op, 200) |

- **Quién gana:** quien primero toma el lock. La hora es la del servidor. Ningún rol, pase ni perfil da prioridad (fase 1: "ningún pase da prioridad sobre un lote").
- **`vio`:** el servidor valida la forma de `LoVisto` (campos conocidos, números finitos o null, `version` texto) y descarta lo demás. No recalcula el precio: es lo que la persona vio, y sigue siendo una simulación.
- **`GET /api/lotes/estados`:** devuelve `{ estados: { [loteId]: "reservado" | "vendido" } }`. Combina los estados de ejemplo con los del libro. No dice de quién es cada reserva y no pide sesión (las páginas de lotes ya son visibles hoy). Va con `Cache-Control: no-store`.
- **Lo que ve cada persona:** `estadoConCompras(loteId, compras, estados)` suma un tercer parámetro con los estados de la base. Un lote reservado o pagado por otra persona se ve `reservado` o `vendido`. Uno propio se ve `reservado-por-vos`, `vendido-a-vos` o `en-cuotas-tuyo`, como hoy.

### 3. Rutas

Todas siguen el patrón de `app/api/consentimientos/route.ts`:
- `moldeDeEscritura` en los POST;
- `sesionDelPedido`;
- tope de bytes, declarado y leído;
- `no-store`;
- 503 sin el detalle del error si la base falla.

Toda escritura a nombre de una persona llama a `exigirConsentimiento`. La excepción es `app/api/mis-datos/actividad`, que borra.

| Ruta | Quién | Qué |
|---|---|---|
| `GET /api/lotes/estados` | cualquiera | estados de los lotes, sin identidad |
| `GET /api/lotes/reservas` | persona con consentimiento | sus compras vigentes, con la forma de `CompraLote[]` |
| `POST /api/lotes/reservas` | persona con consentimiento; `deshacer` de otra persona solo con super admin | `{ accion, loteId, opcion?, vio?, origen? }` → `{ compras }`, o 409 con el motivo; tope de 4 KB |
| `POST /api/contactos` | persona con consentimiento | crea un pedido (valida motivo, canal, mensaje ≤ 500 y origen); tope de 2 KB |
| `GET /api/contactos` | persona con consentimiento | sus pedidos |
| `GET /api/admin/contactos` | super admin | todos los pedidos, con email y nombre de la persona; 403 para el resto |
| `POST /api/bitacora` | persona con consentimiento | agrega una entrada; si ya hay una igual en los últimos 30 minutos no agrega nada y responde 200; tope de 2 KB |
| `GET /api/bitacora` | persona con consentimiento | sus entradas, las más nuevas primero, hasta 300 |
| `DELETE /api/mis-datos/actividad` | persona con sesión (sin pedir consentimiento) | en una transacción: `deshace` de sus lotes vigentes, borra sus contactos y pone su `personas.origen` en null; la bitácora se conserva |
| `DELETE /api/prueba/reservas` | solo con `modoPruebaActivo` y fuera de producción de Vercel (si no, 404) | vacía `reservas` saltando el trigger con `ALTER TABLE … DISABLE TRIGGER` dentro de la transacción, solo para e2e |

**Origen en `personas`:** la primera vez que una persona escribe una reserva o un contacto con origen, el servidor copia ese origen a `personas.origen` solo si está en null (`update … where origen is null`).

### 4. Cliente

- **`lib/lotes/reservas.ts`:** `leerReservas` pasa a `GET /api/lotes/reservas`. `guardarReservas(lista)` se reemplaza por `reservarLote`, `pagarLote` y `deshacerLote`, que mandan una acción y devuelven `{ ok, compras }` o `{ ok: false, motivo }`. Sin sesión, igual que hoy: lista vacía y `false`.
- **`useCompras`:** devuelve `{ compras, reservar, pagar, deshacer, listo }`. Las pantallas que hoy calculan la lista nueva con `compra.ts` y llaman a `guardar` pasan a llamar a la acción. `compra.ts` sigue validando en el cliente para dar el mensaje antes de mandar.
- **`useEstadosLotes()` (nuevo):** pide `/api/lotes/estados` al montar y cuando la persona vuelve a la pestaña. Mientras no llegó, se dibujan los estados de ejemplo, el mismo patrón que `listo`. Si falla, se quedan los de ejemplo y aparece un aviso discreto: "No pudimos traer el estado actual de los lotes."
- **Errores al escribir:** "No pudimos guardar tu reserva. Probá de nuevo." (`role="alert"`). La pantalla no cambia. Con 409 `ya-reservado`, el aviso es: "Alguien reservó este lote hace un momento." Después se actualizan los estados.
- **Contactos:** `guardarPedido` pasa a ser asíncrona y llama a `POST /api/contactos`. Los tres formularios esperan la respuesta y muestran el error si falla. `leerBandejaDelNavegador` se reemplaza por `leerMisPedidos()`, que se usa para "ya consultaste por este lote" en la vitrina. La bandeja de `/admin` y `usePendientes` usan `GET /api/admin/contactos`.
- **Bitácora:** `anotarEnBitacora` hace un POST sin esperar la respuesta. Guarda en memoria lo ya anotado en los últimos 30 minutos para no repetir pedidos, y si falla, no rompe la pantalla. `/panel/bitacora` lee `GET /api/bitacora`.
- **Limpieza del navegador:** `lib/demo/importar.ts` (o el proveedor de sesión, donde hoy se mudan las claves viejas) borra `lh-lotes`, `lh-consultas-lotes`, `lh-contactos`, `lh-bitacora`, `lh-congreso-ticket` y `lh-congreso-idioma`, con y sin prefijo de persona. Corre una vez por navegador y se marca en `lh-limpieza-paso-2`.
- **Mis datos:**
  - La descarga suma `reservas`, `contactos` y `bitacora` desde las rutas `GET`. Si una falla, esa parte sale `null` ("sin dato").
  - "Retirar y borrar mis datos" llama a `DELETE /api/mis-datos/actividad` **antes** del retiro del consentimiento. Si falla, no retira y muestra el error de hoy.

### 5. Congreso

- Salen `congreso` e `idiomaCongreso` de `NOMBRES_BASE`.
- Se borran `lib/congreso/ticket.ts`, `mostrar-ticket.ts`, `tribus-con-ticket.ts` y `preferencia-idioma.ts` con sus tests, además de `app/congreso/registro-ticket.tsx` y `app/congreso/netx/ticket-netx.tsx`.
- Pasaporte, Semillas, `proximo-paso.ts`, `lib/idioma/cliente.tsx` y `app/congreso/netx/tribus.tsx` dejan de leer el ticket. Lo que mostraban según el ticket desaparece; no se reemplaza.
- `/congreso` queda como vitrina, en el idioma general de la app (`?lang` y la preferencia general).
- **Límite:** si para sacar el ticket hay que tocar algo fuera de esa lista, el implementador frena y lo reporta en el PR. Nunca toca Semillas ni Compromisos más allá de quitar la lectura del ticket.

### 6. Pruebas

- **Unitarias con PGlite** (`lib/lotes/servidor.test.ts` y siguientes):
  - Reservar, pagar y deshacer.
  - Dos reservas simultáneas del mismo lote: dos promesas en paralelo, y solo una gana.
  - Un lote de ejemplo `vendido` no se puede reservar.
  - El super admin libera y queda `hecho_por`.
  - UPDATE, DELETE y TRUNCATE sobre `reservas` y `bitacora` fallan.
  - La bitácora no repite en 30 minutos y sí repite a los 31.
  - `personas.origen` no se pisa.
  - El borrado de Mis datos deja la bitácora y saca los contactos.
  - Sin consentimiento → 403.
  - `GET /api/lotes/estados` no trae ningún id de persona.
- **Rutas:** 401, 403, 409, 413 y 422 en cada una. `DELETE /api/prueba/reservas` da 404 con `VERCEL_ENV=production`.
- **E2E:**
  - La fixtura llama a `DELETE /api/prueba/reservas` en el arranque global.
  - Cada archivo de pruebas usa lotes distintos, para correr en paralelo.
  - Los e2e que hoy siembran `lh-lotes` pasan a sembrar por la API.
  - Uno nuevo: la persona A reserva el lote 7 y la persona B, en otro contexto, lo ve "Reservado" y no puede reservarlo.
  - Otro: con `/api/lotes/reservas` interceptado con 500, se ve el error y nada cambia.
  - Mis datos: descarga con las tres partes, y borrar libera el lote para la persona B.

## Risks / Trade-offs

- **[Las páginas de lotes muestran primero el estado de ejemplo y después el real]** → Es el mismo patrón que `listo` hoy, y el parpadeo es breve. Leer la base en el render del servidor haría dinámicas páginas que hoy son estáticas, y el build tocaría PGlite. Queda para el paso 3, cuando los lotes vivan en la base.
- **[Una reserva de prueba olvidada bloquea un lote para todo el equipo]** → El super admin la libera desde la API. El panel con botón llega con el paso 3. Mientras tanto queda la ruta y un guion en `docs/guiones/`.
- **[La bitácora crece rápido]** → No se repite en 30 minutos y tiene tope de 2 KB por entrada. Con el equipo solo son unas miles de filas por mes.
- **[Se pierde lo que el equipo tenía en el navegador]** → Es una simulación. El PR lo avisa, igual que avisó `consentimiento-en-la-base` que había que volver a aceptar.
- **[El trigger se salta en la ruta de prueba]** → Esa ruta solo existe con `modoPruebaActivo` fuera de producción, y la guarda de ADR-008 impide que esa base tenga personas reales.

## Migration Plan

1. Migración `0002` en la rama `previews`, con la guarda de siempre.
2. Deploy: el navegador limpia las claves viejas al primer ingreso.
3. Production (`main`) recibe la migración cuando Gus pase la entrega. Green no cambia hasta que Gus haga Promote.

**Para volver atrás:** revertir el PR. Las tablas nuevas quedan y no las lee nadie. Si hiciera falta sacarlas, se escribe otra migración.

## Fuentes

- `NS_platform/Documentation/backend/01 - Inventario de datos del POC.md` (§3, §9, orden y decisiones; 23-nov-2026)
- `NS_platform/Documentation/backend/02 - Modelo de datos (propuestas).md` (tablas `reservas`, `contactos` y `bitacora`, paso 2)
- ADR-001 (libros de solo agregar), ADR-005 (consentimiento antes de escribir) y ADR-008 (guarda de entornos)
- Cambios `base-neon`, `consentimiento-en-la-base`, `lotes-compra-simulada`, `mi-tierra`, `loteo-norte` y `bitacora-exposicion`
- `NS_platform/Documentation/22 - Fase 1 · venta de lotes e híbrido.md` (simulado, sin cobro real, sin prioridad por pase)
