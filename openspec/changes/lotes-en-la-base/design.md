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
  registrado_at timestamptz not null default now()   -- el servidor lo escribe con clock_timestamp() (ver §2)
  índices: (lote_id, registrado_at desc), (persona_id, registrado_at desc)
<!-- arquitecto: `now()` es la hora de INICIO de la transacción, no la del insert. Una reserva cuya transacción empezó antes que
     un `deshace` pero tomó el lock después quedaría con una hora MENOR que el `deshace`, y "el último evento" diría que el lote
     está libre aunque esté reservado. Por eso cada insert en `reservas` (y en `bitacora`) va con `registrado_at: sql\`clock_timestamp()\``,
     después de tomar el lock, como ya hace `registrarEn` en `lib/privacidad/servidor.ts`. El default queda solo como red. -->
<!-- arquitecto: la migración nueva toma el siguiente número libre al implementarse: `fogon-cuadratico-en-la-base` también
     agrega una migración; si entra antes, esta es la `0003` y hay que regenerar el journal de drizzle sobre `dev`. -->


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
  <!-- arquitecto: usar `hashtextextended('reserva:' || lote_id, 0)` (64 bits), igual que el lock de `registrarEn`, para no
       compartir espacio de 32 bits con otros locks. El insert va con `clock_timestamp()` (ver §1). El `persona_id` de un
       `deshace` es SIEMPRE el titular leído bajo el lock (último evento), nunca un dato del cuerpo; `hecho_por` es quien pide.
       La `opcion` y el `vio` (con `plan`) de una compra vigente salen de la última fila `reserva` del ciclo actual: `paga` no
       los repite. -->
  <!-- arquitecto: en PGlite hay una sola conexión y las transacciones se serializan: el test de "dos reservas a la vez" prueba
       que la segunda ve la fila de la primera, no que el lock funcione en Neon. Se acepta; el e2e (a) cubre el caso real contra
       el preview. -->

- **Reglas** (las mismas de `compra.ts`, ahora en el servidor):

  | Acción | Se permite si | Si no, responde |
  |---|---|---|
  | `reservar` | el estado de ejemplo del lote es `disponible` y no hay reserva vigente | 409 `no-disponible` o `ya-reservado` |
  | `pagar` | la reserva vigente es de la persona | 409 `no-reservado` |
  | `deshacer` | la reserva o el pago vigente es de la persona, o quien lo pide es super admin (`hecho_por` ≠ `persona_id`) | — (sin nada vigente es un no-op, 200) |

- **Quién gana:** quien primero toma el lock. La hora es la del servidor. Ningún rol, pase ni perfil da prioridad (fase 1: "ningún pase da prioridad sobre un lote").
- **`vio`:** el servidor valida la forma de `LoVisto` (campos conocidos, números finitos o null, `version` texto) y descarta lo demás. No recalcula el precio: es lo que la persona vio (el precio es de ejemplo y el pago, simulado).
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
<!-- arquitecto: la excepción se registra en ADR-032 (Propuesta): ver y borrar lo propio pide sesión, no consentimiento. El
     comentario de `app/api/consentimientos/route.ts` ("esta ruta y /api/sesion son las únicas que escriben o leen sin exigir
     un consentimiento vigente") se actualiza para nombrar también `/api/mis-datos/actividad`. El DELETE pasa igual por
     `moldeDeEscritura` (el cliente manda `Content-Type: application/json` y cuerpo `{}`): con la sesión de Neon Auth en una
     cookie, el chequeo de `Origin` es lo que impide que otra página dispare el borrado. -->
<!-- arquitecto: `POST /api/contactos` suma un límite de pedidos por persona con `crearLimite({ sal: "contactos" })` de
     `lib/reportes/limite.ts` (skill revision-seguridad-datos: "límite de pedidos en las rutas que escriben… pedidos de
     contacto"); 429 con `Retry-After`. Las otras escrituras ya tienen freno propio (lock por lote, 30 minutos en bitácora). -->
<!-- arquitecto: los GET de pantalla (`/api/lotes/reservas`, `/api/contactos`, `/api/bitacora`) siguen pidiendo consentimiento:
     sin él la persona es anónima en el cliente y no los llama. La descarga de Mis datos NO usa esos GET: usa
     `GET /api/mis-datos/actividad` (sesión sola), porque una persona con la política vencida (versión nueva) también tiene
     derecho a ver lo que hay de ella (Ley 25.326, art. 14 [verificar]) y porque la spec pide los EVENTOS de reserva, no las
     compras vigentes que devuelve `GET /api/lotes/reservas`. -->


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
| `GET /api/mis-datos/actividad` | persona con sesión (sin pedir consentimiento) | para la descarga: `{ reservas, contactos, bitacora, origen }` de la persona. `reservas` son TODOS sus eventos (también `deshace`), con `liberadoPorElEquipo: boolean` en lugar del id de quien liberó; sin persona en la base, listas vacías y `origen: null` <!-- arquitecto: nueva --> |
| `DELETE /api/mis-datos/actividad` | persona con sesión (sin pedir consentimiento) | en una transacción: `deshace` de sus lotes vigentes, borra sus contactos y pone su `personas.origen` en null; la bitácora se conserva |
| ~~`DELETE /api/prueba/reservas`~~ | — | **sacada** <!-- arquitecto: ver abajo --> |

<!-- arquitecto: `DELETE /api/prueba/reservas` se saca. (1) Es la única ruta de la app que desactiva el trigger de un libro:
     `ALTER TABLE … DISABLE TRIGGER` toma un lock ACCESS EXCLUSIVE sobre `reservas` (frena todas las lecturas y reservas
     mientras dura) y, si alguien olvida el ENABLE antes del COMMIT, el libro queda editable para siempre. (2) No pide sesión:
     en el link de `dev` el modo de prueba está prendido, así que cualquiera con el link vacía las reservas que el equipo está
     probando ahí. (3) Si los previews comparten la rama `previews` (plan B de ADR-008), una corrida nocturna borra las reservas
     de todos los previews, también las de otra corrida en paralelo. En su lugar: cada archivo de e2e usa lotes propios y, en
     su `beforeAll`, el super admin de prueba LIBERA esos lotes por la ruta normal (`POST /api/lotes/reservas` con
     `accion: "deshacer"`), que agrega un `deshace` y no toca el trigger. En local la base es PGlite en memoria y arranca vacía
     con cada servidor. Queda la proposal, que todavía nombra esta ruta: la ajusta el especificador si Gus está de acuerdo. -->

- **`DELETE /api/mis-datos/actividad`, locks:** para cada lote vigente de la persona toma el mismo `pg_advisory_xact_lock` que §2, **en orden de `lote_id`**, vuelve a leer el último evento bajo el lock y recién ahí agrega el `deshace` (si en el medio la persona pagó o deshizo desde otra pestaña, se respeta lo último). <!-- arquitecto: sin el lock, un `pagar` simultáneo podía quedar después del `deshace` y el lote seguiría vendido. -->
- **`DELETE` sin persona en la base** (`sesionDelPedido` devuelve `personaId: null`): 200 sin hacer nada; nunca pudo escribir sin consentimiento. <!-- arquitecto -->
- **Los datos de lotes que se exportan no llevan el id de otra persona:** el `hecho_por` de un super admin que liberó un lote ajeno sale como `liberadoPorElEquipo: true`. <!-- arquitecto -->


**Origen en `personas`:** la primera vez que una persona escribe una reserva o un contacto con origen, el servidor copia ese origen a `personas.origen` solo si está en null (`update … where origen is null`).

### 4. Cliente

- **`lib/lotes/reservas.ts`:** `leerReservas` pasa a `GET /api/lotes/reservas`. `guardarReservas(lista)` se reemplaza por `reservarLote`, `pagarLote` y `deshacerLote`, que mandan una acción y devuelven `{ ok, compras }` o `{ ok: false, motivo }`. Sin sesión, igual que hoy: lista vacía y `false`.
- **`useCompras`:** devuelve `{ compras, reservar, pagar, deshacer, listo }`. Las pantallas que hoy calculan la lista nueva con `compra.ts` y llaman a `guardar` pasan a llamar a la acción. `compra.ts` sigue validando en el cliente para dar el mensaje antes de mandar.
- **`useEstadosLotes()` (nuevo):** pide `/api/lotes/estados` al montar y cuando la persona vuelve a la pestaña. Mientras no llegó, se dibujan los estados de ejemplo, el mismo patrón que `listo`. Si falla, se quedan los de ejemplo y aparece un aviso discreto: "No pudimos traer el estado actual de los lotes."
- **Errores al escribir:** "No pudimos guardar tu reserva. Probá de nuevo." (`role="alert"`). La pantalla no cambia. Con 409 `ya-reservado`, el aviso es: "Alguien reservó este lote hace un momento." Después se actualizan los estados.
- **Contactos:** `guardarPedido` pasa a ser asíncrona y llama a `POST /api/contactos`. Los tres formularios esperan la respuesta y muestran el error si falla. `leerBandejaDelNavegador` se reemplaza por `leerMisPedidos()`, que se usa para "ya consultaste por este lote" en la vitrina. La bandeja de `/admin` y `usePendientes` usan `GET /api/admin/contactos`.
- **Bitácora:** `anotarEnBitacora` hace un POST sin esperar la respuesta. Guarda en memoria lo ya anotado en los últimos 30 minutos para no repetir pedidos, y si falla, no rompe la pantalla. `/panel/bitacora` lee `GET /api/bitacora`.
- **Limpieza del navegador:** `lib/demo/importar.ts` (o el proveedor de sesión, donde hoy se mudan las claves viejas) borra `lh-lotes`, `lh-consultas-lotes`, `lh-contactos` y `lh-bitacora`, con y sin prefijo de persona. Corre una vez por navegador y se marca en `lh-limpieza-paso-2`.
  <!-- arquitecto: "con prefijo" tiene que ser CUALQUIER prefijo, no solo el de la persona en sesión: la función recorre todas las
       claves (`almacen.key(i)`) y borra las que son exactamente esos nombres o terminan en `:<nombre>` (`u:<id>:lh-lotes`),
       así limpia también a otras personas del mismo navegador y las claves de logins anteriores (ids de Privy). Va en
       `lib/demo/importar.ts` como función pura (`limpiarPaso2(almacen)`) y la llama `components/sesion/proveedor-sesion.tsx`
       DESPUÉS de `copiarClavesAnteriores`: esa función copia cualquier `u:<idViejo>:*` a la clave nueva y, si corriera después,
       resucitaría `u:<idNuevo>:lh-lotes`. Es idempotente y barata: puede correr en cada carga sin marca; si se deja la marca
       `lh-limpieza-paso-2`, que se escriba solo después de la copia. -->
- **Mis datos:**
  - La descarga suma `reservas`, `contactos` y `bitacora` desde las rutas `GET`. Si una falla, esa parte sale `null` ("sin dato").
    <!-- arquitecto: desde una sola llamada, `GET /api/mis-datos/actividad` (§3), que trae también `personas.origen`. Si falla,
         las cuatro partes salen `null`. `exportarMisDatos` recibe ese objeto como recibe hoy `filas`. -->
  - "Retirar y borrar" sigue llamando a `borrarDemo` para el resto del navegador; las claves que salen de `NOMBRES_BASE` ya no las recorre, por eso la limpieza de arriba. <!-- arquitecto -->
  - "Retirar y borrar mis datos" llama a `DELETE /api/mis-datos/actividad` **antes** del retiro del consentimiento. Si falla, no retira y muestra el error de hoy.

### 5. Congreso (noche 3)

Gus, 25-nov-2026: **los datos del Congreso se borran.** Este grupo no toca la base. Qué pasa con la página `/congreso` lo decide `eventos-reemplaza-congreso`, que lleva un banner con esta decisión.

- **Claves:** salen `congreso` e `idiomaCongreso` de `NOMBRES_BASE` y se limpian del navegador, con y sin prefijo.
- **Se borran:**
  - `lib/congreso/ticket.ts`, `mostrar-ticket.ts` y `preferencia-idioma.ts`, con sus tests;
  - `app/congreso/registro-ticket.tsx` y su `registro-ticket.textos.ts`;
  - `app/congreso/netx/ticket-netx.tsx`.
- **Dejan de leer el ticket o la preferencia vieja:**
  - Pasaporte, Semillas y `lib/panel/proximo-paso.ts`;
  - `lib/idioma/cliente.tsx` y `lib/idioma/sincronizar.ts`, con su test (se quitan el campo `viejo` y la regla 3);
  - `app/congreso/netx/tribus.tsx`, `app/congreso/vitrina.tsx` (se quita el bloque que dibuja `<TicketNetx>`) y `app/congreso/netx/textos.test.ts`;
  - `lib/panel/panel.test.ts` y `lib/demo/claves.test.ts`.

  Lo que se mostraba según el ticket desaparece y no se reemplaza.
- **Se quedan como están** (reciben un booleano o son configuración; sacarlos es limpieza para otro cambio):
  - `lib/pasaporte/sellos.ts`;
  - `lib/actividad/eventos.ts` y `actividad.ts`;
  - `lib/permisos/{tipos,tabla}.ts` (la puerta `registrar-ticket`);
  - `lib/legal/terminos.ts`;
  - `lib/congreso/tribus-con-ticket.ts` (cifras de ejemplo de la vitrina).
- **Límite:** si algo fuera de esta lista depende del ticket, el implementador frena y lo reporta. Semillas y Compromisos solo pierden la lectura del ticket: sus datos y su código no se tocan.

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
- **Rutas:** 401, 403, 409, 413 y 422 en cada una. ~~`DELETE /api/prueba/reservas` da 404 con `VERCEL_ENV=production`.~~ <!-- arquitecto: ruta sacada (§3). En su lugar: `DELETE /api/mis-datos/actividad` da 403 sin `Origin` propio y 415 sin JSON; `GET /api/mis-datos/actividad` responde con la política vencida (sin consentimiento vigente) y no trae ningún id de otra persona; `POST /api/contactos` da 429 al pasar el límite. -->
- **E2E:**
  - ~~La fixtura llama a `DELETE /api/prueba/reservas` en el arranque global.~~ <!-- arquitecto: la fixtura expone `liberarLotes(ids)`, que entra como super admin de prueba y manda `deshacer` por cada lote; cada archivo la llama en su `beforeAll` con SUS lotes. -->
  - Que dos corridas en paralelo contra el mismo preview usen los mismos lotes sigue siendo posible; se acepta (reintento de Playwright). <!-- arquitecto -->
  - Cada archivo de pruebas usa lotes distintos, para correr en paralelo.
  - Los e2e que hoy siembran `lh-lotes` pasan a sembrar por la API.
  - Uno nuevo: la persona A reserva el lote 7 y la persona B, en otro contexto, lo ve "Reservado" y no puede reservarlo.
  - Otro: con `/api/lotes/reservas` interceptado con 500, se ve el error y nada cambia.
  - Mis datos: descarga con las tres partes, y borrar libera el lote para la persona B.

## Risks / Trade-offs

- **[Las páginas de lotes muestran primero el estado de ejemplo y después el real]** → Es el mismo patrón que `listo` hoy, y el parpadeo es breve. Leer la base en el render del servidor haría dinámicas páginas que hoy son estáticas, y el build tocaría PGlite. Queda para el paso 3, cuando los lotes vivan en la base.
- **[Una reserva de prueba olvidada bloquea un lote para todo el equipo]** → El super admin la libera desde la API. El panel con botón llega con el paso 3. Mientras tanto queda la ruta y un guion en `docs/guiones/`.
- **[La bitácora crece rápido]** → No se repite en 30 minutos y tiene tope de 2 KB por entrada. Con el equipo solo son unas miles de filas por mes.
- **[Dos POST iguales a la vez pueden anotar dos filas]** → El "no repetir en 30 minutos" se lee y escribe sin lock. Una fila de más en una constancia no hace daño; no vale un lock por entrada. El test de los 30 minutos va en serie. <!-- arquitecto -->
- **[Se pierde lo que el equipo tenía en el navegador]** → Son reservas de prueba del equipo (Gus decidió el 25-nov empezar limpio). El PR lo avisa, igual que avisó `consentimiento-en-la-base` que había que volver a aceptar.
- ~~**[El trigger se salta en la ruta de prueba]** → Esa ruta solo existe con `modoPruebaActivo` fuera de producción, y la guarda de ADR-008 impide que esa base tenga personas reales.~~ <!-- arquitecto: ya no aplica: la ruta se sacó (§3). -->
- **[Los triggers frenan errores de la app, no al dueño de la base]** → El rol de la app en Neon es dueño de las tablas y podría desactivarlos con un `ALTER TABLE`. Pasa igual con `consentimientos`. Un rol aparte sin permiso de DDL es un cambio para cuando haya datos reales (R14/R29), no para este. <!-- arquitecto -->
- **[El libro de reservas crece con las pruebas]** → Cada e2e agrega un `deshace` por lote al arrancar. En la rama `previews` son unos cientos de filas por noche; se recrea la rama con el script si molesta. <!-- arquitecto -->

## Migration Plan

1. Migración `0002` en la rama `previews`, con la guarda de siempre.
2. Deploy: el navegador limpia las claves viejas al primer ingreso.
3. Production (`main`) recibe la migración cuando Gus pase la entrega. Green no cambia hasta que Gus haga Promote.

**Para volver atrás:** revertir el PR. Las tablas nuevas quedan y no las lee nadie. Si hiciera falta sacarlas, se escribe otra migración.

## Fuentes

- `NS_platform/Documentation/backend/01 - Inventario de datos del POC.md` (§3, §9, orden y decisiones; 23-nov-2026)
- `NS_platform/Documentation/backend/02 - Modelo de datos (propuestas).md` (tablas `reservas`, `contactos` y `bitacora`, paso 2)
- ADR-001 (libros de solo agregar), ADR-005 (consentimiento antes de escribir) y ADR-008 (guarda de entornos)
- ADR-032 (Propuesta): ver y borrar lo propio pide sesión, no consentimiento <!-- arquitecto -->
- Cambio `eventos-reemplaza-congreso` (choque resuelto por Gus el 25-nov: los datos se borran, ver §5)
- Cambios `base-neon`, `consentimiento-en-la-base`, `lotes-compra-simulada`, `mi-tierra`, `loteo-norte` y `bitacora-exposicion`
- `NS_platform/Documentation/22 - Fase 1 · venta de lotes e híbrido.md` (pago simulado, sin cobro real, sin prioridad por pase)
