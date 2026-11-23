# Proposal

## Why

En una app financiera web3, el **portafolio** responde de un vistazo "¿qué tengo?". En Lighthouse no hay un lugar así: la reserva o el pago simulado de un lote se ven solo en la ficha de ese lote, el plan en cuotas (Token Tierra, `lote-token-tierra`) solo en el boleto, y nada junta el lote, las cuotas, los FARO que se acreditarían y la voz de la persona. El lienzo "Lighthouse · direcciones visuales" (23-nov-2026) propone **Mi tierra** con la dirección **C · Terminal solar**: indicadores, números en monoespaciada y un libro de movimientos.

Además, el inventario de datos del backend (`NS_platform/Documentation/backend/01`, 23-nov) pide que las reservas se lean **por una sola función**, para que cuando pasen a Neon (`lotes-en-la-base`) cambie solo esa función.

Es el **cuarto de los cinco cambios** del pedido `rediseno-defi-tierra`. Depende de `rediseno-sistema-visual`, `rediseno-menu-cinco` y `lote-token-tierra`.

## What Changes

- **Página nueva `/mi-tierra`**, bilingüe, con la dirección C:
  - **Sin sesión:** un aviso corto para entrar, sin ningún dato.
  - **Con sesión y sin compras simuladas:** "Todavía no reservaste un lote" y enlace a `/lotes`.
  - **Tu lote:** por cada reserva o pago simulado, el lote, su chip de estado (reservado, en cuotas, vendido), la opción elegida y el precio que vio, con enlace a su ficha.
  - **Plan en cuotas (Token Tierra, simulado):** anticipo, valor de la cuota, cuotas pagadas sobre el total y una barra de avance del plan. Los primeros 4 lotes dicen que no entran al plan.
  - **FARO acreditados (simulado):** los que se acreditaron con lo pagado y los que se acreditarían si se completa el plan, calculados con la regla de `lote-token-tierra` ("quien paga la mitad tiene la mitad").
  - **Tu voz:** si adheriste al manifiesto de Lighthouse VRN (hoy, la llave para ser parte del común, ADR-023/025) y qué propone el doc 34 sobre la voz, como **propuesta en discusión**; FARO no da voto en la plataforma (ADR-031).
  - **Actividad:** un libro con la fecha y el motivo de cada paso (reserva, primer pago) y el monto que se vio.
  - Sello de venta: "Prototipo interno · datos de ejemplo" y "venta simulada · aprobación municipal pendiente".
- **Una sola función de lectura de las reservas** (`lib/lotes/reservas.ts`), asíncrona, que hoy lee `lh-lotes` del navegador. La usan Mi tierra y el hook de compras que ya existe (`components/lotes/usar-compras.ts`), que deja de leer el navegador por su cuenta.
- **"Mi tierra" aparece en el menú** (la lista única pasa `/mi-tierra` a `existe: true`).

## Fuera de alcance

- Pasar las reservas a la base (`lotes-en-la-base`): este cambio solo deja la función lista para eso.
- Pagar cuotas siguientes, mora, interés o actualización ("sin dato" en `lote-token-tierra`).
- Votar desde Mi tierra o darle a FARO cualquier efecto (ADR-031).
- Cuentas Safe con passkey y Neon Auth: Mi tierra usa la sesión que haya.
- Cualquier cobro real, contrato, emisión de tokens o KYC.

## Capabilities

### New Capabilities
- `mi-tierra`: el portafolio de la persona (lote, plan en cuotas, FARO, voz y actividad) y la función única de lectura de reservas.

### Modified Capabilities
- Ninguna spec vigente cambia de requisito. El hook de compras sigue haciendo lo mismo, leyendo por la función nueva.

## Impact

- **Nuevo:** `app/mi-tierra/page.tsx` y sus componentes, `lib/lotes/reservas.ts` y su test, `lib/mi-tierra/portafolio.ts` (arma la vista desde las compras y los módulos de lotes y bien común) y su test, `lib/idioma/textos/mi-tierra.ts`, `e2e/mi-tierra.spec.ts`.
- **Cambia:** `components/lotes/usar-compras.ts` (lee por la función única), `lib/navegacion.ts` (`/mi-tierra` existe), `lib/lotes/sin-numeros-escritos.test.ts` (vigila `app/mi-tierra/`).
- **Datos personales:** lee las compras simuladas de la persona en sesión, guardadas en su navegador, como hoy; no las manda a ningún lado y no suma campos. Sin sesión no se lee nada.
- **Sin** tablas, migraciones, permisos nuevos, integraciones ni dependencias nuevas.
