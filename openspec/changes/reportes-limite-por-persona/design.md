# Design

## Context

- `app/api/reportes/route.ts` decide el modo por la sesión (`sesionDelPedido`): con sesión válida no hay límite; sin sesión, `limiteSinCuenta` (en memoria, por IP con hash y sal, 5 cada 10 min y 30 por hora por instancia) registra el envío antes de llamar a GitHub y lo descuenta si falla.
- `base-neon` deja `personas`, `cuentas` y `db()`; `consentimiento-en-la-base` deja la lectura del consentimiento vigente (`exigirConsentimiento`, que solo lee). ADR-005: nada se escribe con la identidad de alguien sin consentimiento vigente en la base.
- `fogon-cuadratico-en-la-base` (design §2) ya resolvió que las transacciones en Neon van con `neon-serverless` (o `db.batch`).

## Goals / Non-Goals

**Goals:** cerrar el hueco de L9 con lo mínimo: un contador por persona que no se pierde y no guarda más que la hora.

**Non-Goals:** cambiar el límite sin cuenta, historial de reportes, cuotas configurables.

## Decisions

### 1. Tabla `reportes_envios` (una migración)
| Columna | Tipo |
|---|---|
| `id` | `uuid` primary key |
| `persona_id` | `uuid not null references personas(id) on delete restrict` |
| `enviado_at` | `timestamptz not null default now()` |

- Índice `(persona_id, enviado_at desc)`.
- **No es un libro de solo agregar**: es un contador operativo sin valor legal. Se borra lo que falla y lo de más de 24 horas. Por eso no lleva triggers de solo agregar.
- No guarda IP, texto, tipo ni número de issue (minimización; el issue ya identifica al autor si dejó su contacto).

### 2. Algoritmo (en `lib/reportes/limite-persona.ts`)
`intentarConPersona(personaId)`, en **una transacción**:
1. `select id from personas where id = $1 for update` — serializa los pedidos de la misma persona (dos a la vez con un lugar: uno espera al otro).
2. `delete from reportes_envios where persona_id = $1 and enviado_at < now() - interval '24 hours'`.
3. `select count(*), min(enviado_at) ... where enviado_at > now() - interval '60 minutes'`.
4. Si `count >= 10` → `{ permitido: false, reintentarEnSegundos: ceil(min + 60 min - now) }`, al menos 1.
5. Si no, `insert ... returning id` → `{ permitido: true, envioId }`.

`descontarEnvio(envioId)`: `delete` de esa fila si GitHub falla o no hay token. Si el `delete` falla, se loguea (sin datos) y el cupo queda consumido: preferimos eso a no limitar.

- **Alternativa descartada:** `pg_advisory_xact_lock(hash(persona))`. Hace lo mismo sin tocar `personas`, pero el `for update` sobre la fila de la persona es más fácil de leer y probar con PGlite. El arquitecto puede preferir el otro.
- **Alternativa descartada:** contar en Upstash/Redis o Vercel KV. Sería una integración externa nueva solo para esto; la base ya está.

### 3. Ruta
Después de validar el reporte y antes de llamar a GitHub:
- Sin sesión → como hoy.
- Con sesión → `consentimientoVigente(sesion)` (solo lectura; si `consentimiento-en-la-base` expone solo `exigirConsentimiento`, se usa la misma lectura interna sin devolver 403). Con `personaId` → contador en la base. Sin persona o sin consentimiento → `limiteConCuenta` en memoria (una segunda instancia de `crearLimite` con su propia clave y números: 10 por 60 min, sin tope total), clave = hash con sal de `proveedor:idExterno`.
- Los números viven en constantes exportadas (`MAX_POR_PERSONA = 10`, `VENTANA_PERSONA_MS = 60 min`) para que los tests y un cambio futuro los toquen en un solo lugar.
- Si la base no responde al contar: se responde 503 sin llamar a GitHub (no se deja pasar sin límite) y el diálogo ofrece "Copiar el reporte" como en cualquier error.

### 4. Diálogo
`components/boton-reportar.tsx` ya maneja 429 en el modo sin cuenta; se usa el mismo camino para el modo con cuenta.

## Risks / Trade-offs

- [Una persona legítima que prueba mucho llega al límite] → 10 por hora es de ejemplo; el mensaje dice cuánto esperar y deja copiar el texto. Gus decide la cifra.
- [Quien crea muchas cuentas evita el límite por persona] → no lo resuelve este cambio; el acceso abierto ya lo permite. Un tope total por hora para todos los reportes con cuenta queda como pregunta.
- [`for update` sobre `personas` bloquea un instante otras escrituras de esa persona] → la transacción es corta (tres sentencias) y la llamada a GitHub queda **fuera** de ella.
- [Dato personal nuevo: cuándo reportó cada persona] → retención de 24 horas, solo la hora; se anota en el inventario de datos.

## Migration Plan

1. Migración hacia adelante con la tabla vacía; se aplica en el build del preview y en producción al mergear.
2. Volver atrás: revertir el PR deja la tabla sin uso; borrarla es otra migración.

## Open Questions

- Gus: ¿10 reportes por hora por persona está bien? ¿El super admin también queda limitado? (La spec dice que sí.)
- Gus: ¿hace falta además un tope total por hora para todos los reportes con cuenta, como el de 30 sin cuenta?
