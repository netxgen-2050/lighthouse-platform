# Design

## Contexto

`base-neon` deja la tabla `personas` (con `rol` y `tribu_admin`), Drizzle con migraciones y PGlite en local, en los tests y en los agentes. Este cambio es el primero que guarda datos de una persona que **otra** persona ve y modifica.

## Decisiones

- **Tabla con columnas reales, no JSON.** La membresía es un estado que se aprueba, así que sirve tanto la propuesta A como la B de `backend/02`, sin esperar esa decisión. Enum `estado_membresia` (`pedido`, `miembro`, `rechazado`); único `(persona_id, comunidad)`; `resuelto_por` es FK a `personas`, y nulo mientras está pendiente.
- **`comunidad` es texto** (`lighthouse`, `valle`, …): tribus y territorio siguen en el código con su id estable (`backend/02`, "Identificadores"). La API valida que el id exista en `lib/tribus/datos.ts` o sea `lighthouse`, y que la tribu no esté vacante.
- **La regla de quién resuelve es una función pura** (`puedeResolver(persona, comunidad, solicitante)`) en `lib/membresia/permisos.ts`, con tests. La API la llama en el servidor y la bandeja la usa para filtrar. Así, cuando haya varios admins por tribu, se cambia en un solo lugar.
- **La resolución va dentro de una transacción** que verifica que la fila siga en `pedido` (`UPDATE … WHERE estado = 'pedido'`). Si dos admins resuelven a la vez, el segundo recibe 409 "Este pedido ya fue resuelto".
- **Cliente único** (`lib/membresia/cliente.ts`): un hook `useMembresias()` que hace `GET /api/membresias` una vez por carga y se invalida al adherir. Las pantallas que hoy llaman a `leerMembresiaDelNavegador()` pasan a usar el hook. Las funciones puras (`estadoDe`, `comunidadesDondeEsMiembro`) se mantienen, y `rechazado` se agrega a `EstadoMembresia`.
- **Mudanza del navegador.** Se hace del lado del cliente: si existe la clave `lh-membresia` de la persona, se manda un `POST` por comunidad y, cuando todos responden bien, se borra la clave. Si alguno falla, la clave queda y se reintenta en la próxima carga.
- **Actividad local.** Los eventos `adheriste` siguen en `lh-actividad` como hoy. El evento `adhesionAceptada`, que hoy se dispara con el botón simulado, deja de emitirse hasta `avisos-en-la-base`. Mientras tanto, la persona ve el cambio en la ficha y en el Pasaporte.

## Riesgos

- **Las demos de una sola persona se traban:** sin el botón simulado, alguien tiene que aceptar. Se mitiga con que el super admin pueda resolver sus propios pedidos y con el modo de prueba de los e2e (tres personas: `superadmin@prueba.test`, `admin-tribu@prueba.test`, `persona@prueba.test`).
- **Previews sin `DATABASE_URL`:** usan PGlite en memoria, así que cada instancia arranca vacía. Alcanza para los e2e de un mismo proceso, pero no para probar a mano entre dos navegadores en un preview sin Neon. Hay que anotarlo en el guion del PR.
