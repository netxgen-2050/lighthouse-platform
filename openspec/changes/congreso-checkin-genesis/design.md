# Design

## Context

`/congreso` es una página de servidor con la agenda estática y un componente cliente `RegistroTicket` que guarda el código del ticket como texto plano en `CLAVES.congreso` (`"lh-congreso-ticket"`). `/canales` arma la persona con `personaDesdeSumarte` (siempre `presenciaGenesis: false`) y `lib/demo/resumen.ts` lee el ticket para el panel. `borrarDemo` recorre todas las `CLAVES`. Ver proposal.md para el porqué.

## Goals / Non-Goals

**Goals:**
- Una sola fuente de verdad para la presencia, leída por `/congreso`, `/canales` y `/panel` con la misma función pura.
- No tocar el formato del ticket ya guardado.

**Non-Goals:**
- Modelar quién hace el check-in (anfitrión), ni fechas reales.

## Decisions

1. **Clave nueva `CLAVES.presencia = "lh-congreso-presencia"`** con `{"dias": n}` (n entero de 0 a 5). *Alternativa:* cambiar `CLAVES.congreso` a un JSON con ticket y días. Se descarta porque rompe lo ya guardado y obliga a migrar a `resumen.ts`; una clave aparte se suma sola a `borrarDemo`.
2. **`lib/congreso/presencia.ts`** con funciones puras: `leerPresencia(crudoTicket, crudoPresencia)` → `{ ticket: string | null, dias: number }` (sin ticket válido → `dias: 0`; valores fuera de rango o JSON roto → 0; se acota a 5), `hacerCheckin(dias)` (suma 1 hasta 5) y `tieneGenesis(dias)` (`dias >= 1`).
3. **El estado del Congreso sube a un componente cliente `CongresoCliente`** que contiene `RegistroTicket` (ahora controlado por props) y la agenda, para que la agenda marque los días presentes. La página de servidor conserva el título, la explicación, el `AvisoEjemplo` y la nota de presencia.
4. **Quitar ticket borra las dos claves** (`congreso` y `presencia`). Si borrar la presencia falla, se muestra el mismo aviso de almacenamiento que ya existe y el ticket no se quita, para no dejar presencia huérfana visible.
5. **`/canales`:** se agrega `personaReal(crudoSumarte, crudoTicket, crudoPresencia)` en `lib/canales/` que parte de `personaDesdeSumarte` y pone `presenciaGenesis` con `tieneGenesis`. El simulador "Probá otra situación" no cambia.
6. **Panel:** `ResumenDemo` suma `presencia: number` (0 si no hay); `resumen.tsx` muestra "Genesis · N de 5 días" cuando es mayor que 0.
7. **Texto legal nuevo** (`borrador: true`): `genesis` · "Registro Genesis": "Queda registrado en la plataforma que estuviste en el comienzo del Lighthouse, con el check-in que confirma el anfitrión. Da acceso y suma a tu voz con un tope; no tiene valor económico, no se compra ni se transfiere. Más adelante podría emitirse también como una insignia digital no transferible."

## Risks / Trade-offs

- [El ticket de un e2e anterior deja presencia en el navegador] → Playwright arranca cada test con almacenamiento vacío; los tests nuevos siembran ticket y presencia explícitamente.
- [Mover la agenda al cliente la saca del HTML del servidor] → la agenda se sigue renderizando en el primer render del cliente sin esperar `localStorage` (los días se marcan después de leer), así que no aparece y desaparece.
- [`lib/demo/claves.test.ts` puede fijar la lista de claves] → la tarea 1.1 lo actualiza.
