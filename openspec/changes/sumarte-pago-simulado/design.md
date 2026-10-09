# Design

## Context

`app/sumarte/sumarte-cliente.tsx` maneja el estado con `reducir` de `lib/sumarte/estado.ts` y lo guarda en `localStorage` (`CLAVES.sumarte`, `lh-sumarte`). Hoy "Hacerme miembro" despacha `{ tipo: "plan", plan: "miembro" }` y "Quiero el Pase" despacha `{ tipo: "pase" }` (que también pone `plan: "miembro"`). Los pedidos de contacto ya usan un formulario en línea con foco al abrir y vuelta del foco al cancelar (`components/pedido-contacto.tsx`): es el patrón a seguir. Los precios salen de `PASSES` y `MEMBRESIA` de `lib/sumarte/datos.ts`.

Fuente de la regla: nota 18 §4.1 (tres tipos de plata) y §5 ("el pago simulado deja claro quién cobra"); el aviso del mock-up v6: "Pago simulado: el Guardián recibe USD X y NetX, su tarifa de servicio" y "Membresía activada (simulado): la factura NetX". El plazo de 10 días sale de la nota 18 §4.4.

## Goals / Non-Goals

**Goals:** un paso de resumen antes de activar; decir quién recibe la plata sin inventar el monto de la tarifa; el arrepentimiento del Pase con su plazo calculado y testeado.

**Non-Goals:** pasarela, comprobantes, cuotas, arrepentimiento de la membresía, cambios en la sección "Para inversores".

## Decisions

1. **Estado.** `EstadoSumarte` suma `fechaPase: string | null` (ISO) y `planPrevio: Plan | null`. Acciones nuevas o cambiadas:
   - `{ tipo: "pase"; fecha: string }`: guarda `planPrevio = e.plan`, `fechaPase = fecha`, `pase = e.nivelPase`, `plan = "miembro"`.
   - `{ tipo: "arrepentirse" }`: `pase = null`, `plan = planPrevio ?? "miembro"`, `fechaPase = null`, `planPrevio = null`.
   - "Volver a Explorador" también limpia `fechaPase` y `planPrevio`.
   `leer` acepta lo guardado antes (sin esos campos) y descarta una fecha que no sea ISO válida (`null`).
2. **Plazo.** Función pura `plazoArrepentimiento(fechaPase: string | null, ahora: Date)` en `lib/sumarte/` que devuelve `{ estado: "sin-dato" } | { estado: "vigente"; limite: Date } | { estado: "vencido"; limite: Date }`. Límite = fecha del pago + 10 días corridos; vigente mientras `ahora <= limite`. Tests de Vitest: hoy, día 10 exacto, día 11, `null`, fecha inválida. La fecha se muestra con `toLocaleDateString("es-AR")`.
3. **Resumen en línea.** Un componente `components/resumen-pago.tsx` (cliente) que recibe el título del producto, el precio en texto, las filas de "Quién recibe la plata", `alConfirmar` y `alCancelar`. Se abre debajo de la tarjeta, con `aria-expanded` en el botón que lo abrió, foco al título del resumen (`tabIndex={-1}`) y vuelta del foco al cancelar. Mientras un resumen está abierto, el botón que lo abrió no se duplica. Un solo resumen abierto a la vez.
4. **Tarifa de NetX.** Se muestra literalmente "NetX cobra su tarifa de servicio: sin dato". No se suma al total ni se descuenta del precio: el total es el precio del pase, y el Guardián recibe ese total (igual que el aviso del mock-up y el ⚖ `guardian`). Si se define que la tarifa se descuenta o se suma, cambia solo esta fila (ver preguntas abiertas).
5. **Anuncios.** Se reusa la región en vivo de la página (o una propia con `role="status"`). Confirmar: "Pago simulado: el Guardián recibe USD <precio> y NetX, su tarifa de servicio." / "Membresía activada (simulado): la factura NetX." (textos del mock-up). Arrepentirse: el texto de la spec.
6. **Textos legales en borrador** (`borrador: true`, con el comentario de texto nuevo como el resto):
   - `cobro` · "Quién cobra qué": "En la plataforma hay tres tipos de plata. La membresía y el Plan Tribu son servicios de NetX: los cobra y los factura NetX. El Pase Fundador lo cobra el Guardián del Lighthouse: NetX solo procesa el pago y cobra su tarifa de servicio, sin quedarse con la plata. La plata para invertir en el proyecto nunca pasa por la plataforma: va directo al fiduciario. En el prototipo ningún pago es real."
   - `arrepentimiento` · "Derecho de arrepentimiento": "Si comprás a distancia, tenés 10 días corridos para arrepentirte sin dar motivos y sin costo (Ley 24.240 de Defensa del Consumidor). Se te devuelve todo lo que pagaste. En el prototipo el arrepentimiento es simulado: no hay pago ni devolución reales."
7. **Tests existentes.** `e2e/sumarte.spec.ts` y cualquier e2e que active el pase con un clic (por ejemplo `e2e/canales.spec.ts`) pasan a abrir el resumen y confirmar. Conviene una ayuda en `e2e/ayudas.ts` ("activarPase") para no repetir pasos.

## Risks / Trade-offs

- **Conflicto con `pasaporte-sellos`** (de esta noche), que también toca `app/sumarte/sumarte-cliente.tsx` (KYC antes de pedir invitación). Mitigación: este cambio solo toca las tarjetas de Miembro y Pase Fundador; si `pasaporte-sellos` ya está en `main`, partir de ahí.
- **Fechas en e2e.** Para probar "plazo vencido" se escribe en `localStorage` un estado con fecha de hace 11 días antes de cargar la página, sin mockear el reloj.
- **El texto `cobro` adelanta la reformulación del §4 de la nota 18**, que todavía no se adoptó (decisión del 12-oct). Por eso va como borrador.

## Open Questions

- ¿La tarifa de servicio de NetX sobre el Pase se descuenta de lo que recibe el Guardián, se suma al precio, o es una tarifa mensual fija aparte? (nota 18 §4.1 vs §4.2; Vagner y Gus).
- ¿Quién factura la membresía: la SAS argentina, el holding o el Guardián? (nota 18 §7.4; Gabriel). El prototipo dice "NetX".
