# Tasks

Rama `agente/lotes-en-la-base` desde `dev`, **después** de que `consentimiento-en-la-base` esté en `dev` (hay que confirmar que existen `exigirConsentimiento` en `lib/privacidad/servidor.ts` y la migración `0001`). Si falta, frenar y reportar. Orden de la serie: `consentimiento-en-la-base` → **`lotes-en-la-base`** → `contenido-editable-lotes`.

**Límites:**
- Todo sigue SIMULADO: nada de cobros ni datos de pago. La aprobación municipal nunca figura como otorgada.
- No tocar los datos ni el código de Semillas y Compromisos más allá de quitar la lectura del ticket (grupo 6).
- Si la noche no alcanza, el grupo 6 (Congreso) es el que se puede cortar: va al final y no lo necesita nadie más.

## 1. Base

- [ ] 1.1 `lib/db/schema.ts`:
  - enums `reserva_evento` y `opcion_compra`;
  - tablas `reservas`, `contactos` y `bitacora`;
  - columna `personas.origen` (design §1).

  `pnpm db:generate` genera `drizzle/0002_*`. A mano, en la misma migración o en una `0003_*` aparte como en `0001`, van los triggers de solo agregar de `reservas` y `bitacora`, con el comentario de cómo recrearlos. Tests con PGlite: UPDATE, DELETE y TRUNCATE fallan en los dos libros; en `contactos`, DELETE sí funciona. Verificar con `pnpm test lib/db`.

## 2. Servidor de reservas

- [ ] 2.1 `lib/lotes/servidor.ts`:
  - `estadosDeLotes(bd)`;
  - `comprasDePersona(bd, personaId)` con la forma de `CompraLote[]`;
  - `reservar`, `pagar` y `deshacer`, cada una en una transacción con `pg_advisory_xact_lock` por lote (design §2);
  - la validación pura del cuerpo (acción, `loteId` contra `listarLotes()`, opción, forma de `vio` ≤ 4 KB y origen).

  Tests con PGlite:
  - reservar, pagar y deshacer;
  - dos reservas del mismo lote con `Promise.all`: una sola gana, la otra da `ya-reservado`;
  - un lote de ejemplo vendido da `no-disponible`;
  - pagar lo ajeno da `no-reservado`;
  - deshacer sin nada vigente es un no-op;
  - el super admin libera con `hecho_por` propio;
  - una persona común no puede deshacer lo ajeno;
  - `personas.origen` se escribe solo si es null.

  Verificar con `pnpm test lib/lotes`.
- [ ] 2.2 Rutas `app/api/lotes/estados` (GET público) y `app/api/lotes/reservas` (GET y POST), con el patrón de `app/api/consentimientos/route.ts` (design §3). Tests de ruta:
  - 401 sin sesión;
  - 403 sin consentimiento (`consentimiento: false`);
  - 409 con el motivo;
  - 413 y 422;
  - `estados` no trae ningún id de persona: recorrer la respuesta y buscar UUID y `@`.

  Verificar con `pnpm test`.
- [ ] 2.3 `app/api/prueba/reservas` (DELETE): solo con `modoPruebaActivo` y fuera de producción de Vercel; si no, 404. Test de los dos casos. Verificar con `pnpm test`.

## 3. Cliente de reservas

- [ ] 3.1 `lib/lotes/reservas.ts`: `leerReservas`, `reservarLote`, `pagarLote` y `deshacerLote` contra la API.
  - `components/lotes/usar-compras.ts` devuelve `{ compras, reservar, pagar, deshacer, listo }`.
  - Nuevo `components/lotes/usar-estados-lotes.ts`.
  - `estadoConCompras` recibe los estados de la base.

  Adaptar todos los que usan `useCompras`, `guardarReservas` o `estadoDeLote` para la vista (buscarlos con `rg`): ficha y compra del lote, lista de lotes, vista de lotes del territorio, mapa, Mi tierra y portafolio. Errores: "No pudimos guardar tu reserva. Probá de nuevo." y "Alguien reservó este lote hace un momento." (`role="alert"`), y el aviso de estados sin respuesta (design §4). Actualizar `lib/lotes/reservas-unica.test.ts`: ahora vigila que nadie más llame a `/api/lotes/reservas`. Verificar con `pnpm verificar`.

## 4. Contactos y origen

- [ ] 4.1 `lib/contactos/servidor.ts` y las rutas `app/api/contactos` (GET y POST) y `app/api/admin/contactos` (GET, solo super admin), con tests: 401, 403 sin consentimiento, 403 para quien no es super admin en admin, 422 por motivo, canal o mensaje largo, y origen copiado a `personas.origen` solo si estaba vacío. Verificar con `pnpm test lib/contactos`.
- [ ] 4.2 Cliente:
  - `guardarPedido` asíncrona contra la API;
  - los tres formularios (`ficha-cliente.tsx`, `vitrina-territorio.tsx` y `sumarte-cliente.tsx`) esperan la respuesta y muestran el error sin perder lo escrito;
  - `leerMisPedidos()` reemplaza a `leerBandejaDelNavegador` en la vitrina;
  - `app/admin/bandeja-pedidos.tsx` y `lib/admin/usar-pendientes.ts` usan `GET /api/admin/contactos` (contador `null` si falla).

  Verificar con `pnpm verificar`.

## 5. Bitácora

- [ ] 5.1 `lib/demo/bitacora-servidor.ts` y `app/api/bitacora` (GET y POST), con tests: no repite dentro de los 30 minutos y sí a los 31 (con reloj inyectado), 403 sin consentimiento, máximo de 300 entradas en el GET.
  - `anotar-en-bitacora.ts` hace el POST sin esperar, con un recuerdo en memoria de 30 minutos.
  - `/panel/bitacora` lee la API.

  Verificar con `pnpm test lib/demo` y `pnpm verificar`.

## 6. Congreso (se puede cortar si la noche no alcanza)

- [ ] 6.1 Sacar `congreso` e `idiomaCongreso` de `NOMBRES_BASE` y borrar lo del ticket (design §5): `lib/congreso/ticket.ts`, `mostrar-ticket.ts`, `tribus-con-ticket.ts` y `preferencia-idioma.ts` con sus tests, más `app/congreso/registro-ticket.tsx` y `app/congreso/netx/ticket-netx.tsx`. Pasaporte, Semillas, `lib/panel/proximo-paso.ts`, `lib/idioma/cliente.tsx` y `app/congreso/netx/tribus.tsx` dejan de leerlo. `/congreso` queda como vitrina con el idioma general. Si aparece otro archivo que dependa del ticket, frenar y anotarlo en el PR. Verificar con `pnpm verificar` y con los e2e del Congreso (los del ticket se borran; los de la vitrina quedan).

## 7. Navegador y Mis datos

- [ ] 7.1 Limpieza, una sola vez por navegador (marca `lh-limpieza-paso-2`), de `lh-lotes`, `lh-consultas-lotes`, `lh-contactos`, `lh-bitacora`, `lh-congreso-ticket` y `lh-congreso-idioma`, con y sin prefijo, sin copiar nada (en `lib/demo/importar.ts` o donde hoy se mudan las claves). Sacar `lotes`, `consultasLotes`, `contactos` y `bitacora` de `NOMBRES_BASE`. Test unitario con un almacén simulado. Verificar con `pnpm test lib/demo`.
- [ ] 7.2 `app/api/mis-datos/actividad` (DELETE, pide sesión y no consentimiento): en una transacción agrega `deshace` de los lotes vigentes de la persona, borra sus contactos y pone `personas.origen` en null. La bitácora queda. Tests de los tres efectos y de que la bitácora siga.
  - `lib/privacidad/exportar.ts` suma `reservas`, `contactos` y `bitacora` desde las rutas GET (`null` si una falla).
  - `mis-datos-cliente.tsx` llama al DELETE antes del retiro y, si falla, no retira.

  Verificar con `pnpm test lib/privacidad` y `pnpm verificar`.

## 8. Pruebas de punta a punta

- [ ] 8.1 `e2e/fixtura.ts`: `DELETE /api/prueba/reservas` en el arranque global y siembra por la API. Los e2e que hoy escriben `lh-lotes`, `lh-contactos` o `lh-bitacora` pasan a la API, cada archivo con lotes propios. Nuevos:
  - (a) A reserva el lote 7 y B, en otro contexto, lo ve "Reservado" y no puede reservarlo;
  - (b) con `/api/lotes/reservas` interceptado con 500, se ve el error y el lote no cambia;
  - (c) el pedido de A aparece en la bandeja de `/admin` del super admin;
  - (d) Mis datos descarga las tres partes, y borrar libera el lote para B y deja la bitácora;
  - (e) axe sin violaciones serias en las pantallas tocadas.

  Verificar con `pnpm test:e2e`.

## 9. Integración

- [ ] 9.1 `pnpm verificar`, `pnpm build` y todos los e2e locales en verde. El PR avisa que las reservas, pedidos y bitácora del navegador no se copian. Suma un guion corto en `docs/guiones/` para que el super admin libere un lote mientras no exista el panel del paso 3. Verificar con los tres comandos y con `scripts/pr.sh`.
