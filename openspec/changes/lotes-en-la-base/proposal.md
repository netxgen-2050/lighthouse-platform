# Proposal

## Why

Hoy cada reserva simulada de un lote de Lighthouse VRN vive en el navegador de quien la hizo. Dos personas del equipo pueden reservar el mismo lote y nadie se entera. Lo mismo pasa con las consultas por un lote y los pedidos de contacto: la bandeja de `/admin` solo muestra lo que se guardó en el navegador de quien la mira, así que como CRM no sirve. La bitácora de exposición (qué texto legal se le mostró a quién y cuándo, regla C11) tampoco sirve como prueba mientras viva en un navegador que se puede borrar.

Es el **paso 2** del orden de la fase 1 (`NS_platform/Documentation/backend/01` y `02`, 23-nov-2026). Ya están en `dev` la base (`base-neon`) y el consentimiento en el servidor (`consentimiento-en-la-base`, con `exigirConsentimiento`). Este cambio muda a la base lo que la fase 1 necesita compartir: reservas, contactos, origen de la visita y bitácora. También borra los datos del Congreso, que se canceló el 23-oct.

Sigue siendo **una simulación**: no se cobra nada, no se guarda ningún dato de pago y la aprobación municipal nunca figura como otorgada (fase 1, R36 y R14).

## What Changes

- **Libro `reservas`** (solo agregar, con triggers): cada fila es un evento `reserva`, `paga` o `deshace` sobre un lote. Guarda la opción elegida, lo que la persona vio (`vio`, el `LoVisto` de hoy) y el origen de la visita. El estado de cada lote se **calcula** desde el libro. Un lote reservado por una persona aparece **reservado para todos**, y uno "pagado", **vendido para todos**. Gana quien reserva primero según el reloj del servidor: ningún pase ni rol da prioridad.
- **Rutas de reservas:** `GET /api/lotes/estados` (público, sin identidad: solo el estado de cada lote), `GET /api/lotes/reservas` (las de la persona en sesión) y `POST /api/lotes/reservas` (reservar, pagar o deshacer). Toda escritura pide un consentimiento vigente. El super admin puede liberar cualquier lote, para reiniciar la simulación.
- **Tabla `contactos`:** consultas por un lote y pedidos de contacto, con la persona en sesión, el motivo, el canal, el mensaje, el estado administrativo que se le mostró y el origen. La bandeja de `/admin` y el contador de pendientes leen la base. La persona puede borrar los suyos desde Mis datos.
- **Origen de la visita:** columna `origen` en `personas` (la primera visita, se escribe una sola vez), en `contactos` y en `reservas`. `lh-origen` sigue en el navegador hasta que la persona escribe algo.
- **Libro `bitacora`** (solo agregar): `anotarEnBitacora` escribe en el servidor con la persona en sesión. El servidor no repite la misma entrada (mismo tipo, clave y huella) en 30 minutos. `/panel/bitacora` lee la base.
- **Mis datos:** la descarga suma las reservas, los contactos y la bitácora de la base. "Retirar y borrar mis datos" libera los lotes de la persona (agrega `deshace`), borra sus contactos y su origen. La bitácora se conserva (ver Preguntas abiertas). Esta ruta pide sesión, no consentimiento: borrar es un derecho.
- **Se borra lo del navegador:** `lh-lotes`, `lh-consultas-lotes`, `lh-contactos` y `lh-bitacora` dejan de escribirse y se limpian la próxima vez que la persona entra. **No se copian a la base** (decisión por defecto, ver Preguntas abiertas).
- **Congreso:** `lh-congreso-ticket` y `lh-congreso-idioma` salen de `lib/demo/claves.ts` y se limpian del navegador. Se retira el registro del ticket y todo lo que lo lee (Pasaporte, Semillas, próximo paso del panel, vista NetX del Congreso). La página `/congreso` queda como vitrina (backlog D16, decisión 4 de `backend/01` todavía abierta), con el idioma general de la app.
- **E2E:** la fixtura siembra reservas, contactos y bitácora por la API. En modo de prueba hay una ruta para vaciar las reservas, que en producción de Vercel no existe.

**Fuera de alcance:**
- `lotes`, `planos`, `parametros`, `decisiones` y `cambios_de_contenido`: el panel para que el equipo edite lotes, precios y la propuesta es el paso 3 (`contenido-editable-lotes`). Acá el loteo y los estados de ejemplo siguen en el código.
- Responder un contacto o marcarlo atendido (backlog B6).
- HubSpot.
- Anonimizar una cuenta borrada (R29).
- Cuotas como tabla aparte (se siguen calculando desde lo que vio la persona).
- Cobro real de cualquier tipo.
- Semillas y Compromisos: no se tocan sus datos ni su código (pueden ser el acceso a FARO por aporte).

## Capabilities

### New Capabilities
- `lotes-reservas-registro`: libro de reservas simuladas en el servidor, estado de cada lote calculado desde ahí, y la regla de que un lote tiene a lo sumo una reserva vigente.
- `contactos-registro`: consultas y pedidos de contacto en la base, bandeja del equipo y origen de la visita.
- `bitacora-registro`: bitácora de exposición en el servidor como libro de solo agregar.
- `congreso-sin-datos`: limpieza de los datos del Congreso y retiro del ticket.

### Modified Capabilities

## Impact

**Orden:** `base-neon` → `consentimiento-en-la-base` → **`lotes-en-la-base`** → `contenido-editable-lotes`. Anda con Privy y con Neon Auth, porque la persona se resuelve por `cuentas`. No depende de que se prenda `login-neon-auth`.

**Migración:** nueva, con tablas `reservas`, `contactos` y `bitacora`, enums nuevos, la columna `personas.origen` y los triggers de solo agregar de `reservas` y `bitacora`, escritos a mano como en `0001`. La guarda de ADR-008 sigue igual: fuera de producción, solo base virgen o rama `previews`.

**Archivos:**

| Área | Archivos |
|---|---|
| Base | `lib/db/schema.ts` y `drizzle/0002_*` |
| Servidor | `lib/lotes/servidor.ts`, `lib/contactos/servidor.ts` y `lib/demo/bitacora-servidor.ts` (todos nuevos) |
| Rutas | `app/api/lotes/estados`, `app/api/lotes/reservas`, `app/api/contactos`, `app/api/admin/contactos`, `app/api/bitacora`, `app/api/mis-datos/actividad` y `app/api/prueba/reservas` |
| Cliente | `lib/lotes/reservas.ts`, `components/lotes/usar-compras.ts`, un hook nuevo `usar-estados-lotes.ts`, `lib/lotes/compra.ts` (`estadoConCompras` recibe los estados de la base), `lib/contactos/almacen.ts`, `lib/admin/usar-pendientes.ts`, `app/admin/bandeja-pedidos.tsx`, `lib/demo/anotar-en-bitacora.ts` y `app/panel/bitacora/tabla-bitacora.tsx` |
| Privacidad | `lib/privacidad/exportar.ts`, `lib/demo/importar.ts`, `lib/demo/borrar.ts` y `app/mis-datos/mis-datos-cliente.tsx` |
| Congreso | `lib/demo/claves.ts`, `lib/congreso/*`, `app/congreso/*`, `app/pasaporte/pasaporte-cliente.tsx`, `app/semillas/semillas-cliente.tsx`, `lib/panel/proximo-paso.ts` y `lib/idioma/cliente.tsx` |
| Pruebas | `e2e/fixtura.ts` y los e2e de lotes, Mi tierra, contactos, bitácora, Mis datos y Congreso |

**Revisión:** toca datos personales (mensaje de contacto, origen) y una prueba legal (bitácora), así que **pide revisión de arquitectura**.

## Preguntas abiertas (Gus)

1. **¿Se copian las reservas, contactos y bitácora que hoy están en los navegadores del equipo?** Propuesta: no. Son datos de prueba, y copiarlos puede dejar dos reservas sobre el mismo lote. Se limpian al entrar.
2. **¿Cómo ve el resto un lote "pagado en cuotas" por otra persona?** Propuesta: "vendido", igual que uno pagado de contado. Solo la persona ve "en cuotas, tuyo".
3. **Al borrar mis datos, ¿se conserva la bitácora?** Propuesta: sí, porque es la prueba de qué texto legal se mostró **[verificar con abogado]** (Ley 25.326, art. 16, conservación por obligación legal). Si la respuesta es borrarla, cambia una línea de la ruta de Mis datos y el libro deja de serlo para esa persona.
4. **¿Quién ve la bandeja de contactos?** Propuesta: solo el super admin, como hoy `/admin`. Los admins de comunidad, más adelante.
5. **Congreso:** ¿se retira también la página `/congreso` (decisión 4 de `backend/01`)? Este cambio la deja como vitrina y solo saca el ticket.
