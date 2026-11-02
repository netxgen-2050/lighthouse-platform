# Proposal

**Revisado el 2-nov-2026 por la fase 1 (ADR-028).** Saca "Lighthouse VRN no vende tierra", suma la puerta "Comprar un lote", amplía los tickets de "Invertir en NetX", deja de decir "Juego B" en pantalla y suma los deltas que había pedido la revisión de arquitectura. El resto no cambia. Se implementa la **noche 3**, después de `lote-ficha-y-compra` y antes de `modelo-hibrido-procomun`.

## Why

`/sumarte` sigue contando el diseño legal anterior al 17-oct: un "voto en el fideicomiso", un Guardián que recibe el Pase, el fideicomiso del Lote 7 con sus cupos a la vista, y un Congreso que se canceló el 23-oct. Hoy la pantalla contradice a la Vista NetX y a NS_Tokenomics (docs 25, 26, 28 y 30). Gus la señaló como deuda: Sumarte tiene que decir lo mismo que el modelo, sin ofrecer inversión a nadie.

## What Changes

**Qué queda en Sumarte: las cuatro formas de sumarse.** Los precios ya coinciden con NS_Tokenomics (doc 04 y `RESULTS_platform_revenue.md`) y no cambian, pero ahora se presentan como "de ejemplo, a re-ajustar".

| Plan | Valores de ejemplo | Cambios | A dónde va la plata |
|---|---|---|---|
| Explorador | Gratis | Sin menciones al Congreso | — |
| Miembro de la red | USD 10/mes o 100/año | Solo la línea de la plata | NetX (servicio) |
| Pase Fundador | USD 300 · 1.500 · 5.000 | Influencia en el Fondo Común, créditos con vencimiento, sin Ronda 0 ni fecha de febrero | Fondo Común del procomún, **no NetX** |
| Plan Tribu | USD 60/mes o 600/año | Solo la línea de la plata | NetX se lo factura a la tribu |

- **Pase Fundador:** da "Influencia en el Fondo Común (próximamente: conviction voting)" en lugar de voto en un fideicomiso, igual en los tres niveles. El ⚖ dice que en el modelo híbrido lo recibe la Fundación, que todavía no existe. Sigue sin dar tierra, lotes, prioridad ni rendimiento: comprar un lote es otro camino.
- **Adhesión:** una línea informativa dice que participar en las decisiones pide adherir al manifiesto de Lighthouse VRN, y que al adherir se queda adentro al instante, sin aceptación de nadie. Elegir un plan no hace adherir a nadie.
- **Congreso:** se saca de los planes y de la comparativa. La Presencia Genesis pasa a nombrar los eventos de comunidad, "a definir".

**Qué sale de Sumarte y pasa a "Invertir".** La sección "Para inversores" se reemplaza por "Invertir", con dos tarjetas y el texto visible "Esto no es una oferta":

- **En los proyectos de regeneración (por invitación):** explica en palabras simples series, SAFU y Serie Madre, con sus ⚖, y enlaza a `/netx/financiamiento#m-temprano`. Mantiene "Pedir invitación", con la verificación de identidad a pedido. Sale el proyecto del Lote 7 (fideicomiso, caja, espejo, residencia fiscal) y salen los medidores de cupos.
- **En NetX como empresa (SAFE):** mantiene "Pedir una charla" y enlaza a `/netx`. **Muestra un rango de tickets:** desde USD 5K hasta USD 50K o más, de ejemplo, a definir con Vagner.
- **Lo que Sumarte no muestra:** tasas, descuentos, cupos ni retornos, ni tickets de los proyectos (SAFU). Eso vive solo en la Vista NetX, que pide sesión.
- **Tierra:** la tierra común queda en una Fundación que todavía no existe; los lotes privados son otro camino.

**Puerta nueva: "Comprar un lote".** Una sección propia, entre los planes e "Invertir": lotes privados del sector norte de Lighthouse VRN, con el precio de referencia leído de `lib/lotes/modelo.ts`, el estado administrativo compacto, la aclaración de que todo es simulado y un enlace a `/lotes`. Queda **fuera** de "Invertir" para que la frase "desde esta sección no se vende ni se cobra nada" siga siendo literalmente cierta.

**Catálogo legal (⚖ en borrador, es/en).**

- Se reescriben `pasefundador`, `guardian` (pasa a "El Fondo Común") y `creditos`.
- Se suman `influenciafondocomun`, `noesinversion` y `noesoferta`. Las dos últimas llevan al catálogo la frase que hoy está suelta en la tarjeta del Pase (R16) y la frase nueva "no es una oferta".
- Los ⚖ que quedan en pantalla y no tenían inglés lo suman, salvo `semillas` (ver fuera de alcance).

**Pasaporte:** solo cambia la mención al Lote 7, que dejaría de ser cierta.

**Sobre el backlog.** D9 dice "documentar, no construir" las series hasta que haya abogado. Este cambio no construye la entidad Serie: es texto, ⚖ y un enlace, en la línea de la excepción de prototipo que Gus decidió el 26-oct para la Vista NetX. No repropone P4 (`sumarte-pago-simulado`) ni P21 (`inversores-comparador`).

## Fuera de alcance

- **La venta de lotes en sí:** Sumarte solo tiene la puerta. La ficha y el flujo son `lote-ficha-y-compra`, y el modelo es `modelo-hibrido-procomun`. La consulta por lotes de Chacras de Soluna sigue como está.
- **Tickets de acceso al procomún** (`procomun-tickets`): bloqueado hasta el sí de Franz. El Pase de esta página sigue simulado, como hoy.
- **Cobros y plata real:** nada se cobra, todo sigue simulado y en el navegador.
- **Conviction voting** (backlog D38) y cualquier cámara o voto del Pase.
- **El id de la puerta `voto-fideicomiso` y la etiqueta del Pasaporte:** los cambia `fogon-desde-mi-y-guardian`, como pidió Gus. **Ese cambio quedó congelado el 2-nov**, así que el Pasaporte va a seguir diciendo "Voto en el Fideicomiso" hasta nuevo aviso.
- **Re-ajustar valores** (precios, cupo de 300, mínimo de USD 75.000) y re-correr el modelo de la cohorte (NS_Tokenomics I-15). Tampoco se editan los documentos de NS_Tokenomics.
- **Renombrar el nivel "Brote":** sigue igual en pantalla y en el código hasta que Gus decida (ver preguntas).
- **Otras pantallas y ⚖ del diseño anterior:** los cupos de `/netx/comunidad`, el sello Genesis del Pasaporte, "Guardián del Lighthouse" en `guardianIA` y en territorios, y los ⚖ `semillas`, `pasaporte`, `kyc` y `licencia`.
- **Oferta "Círculo Fundador"** (SAFE + Pase, doc 15), una vía para aportantes del exterior y la frase "de por vida" del Pase.
- **Volver a activar las reglas antes de mostrar la plataforma afuera** (R14). El borrador "no es una oferta" no alcanza para abrirla fuera del equipo.

## Capabilities

### New Capabilities
<!-- ninguna: se amplían las capacidades de Sumarte y del Pase -->

### Modified Capabilities
- `sumarte`: valores a re-ajustar, destino de la plata, Pase con influencia, adhesión, planes sin Congreso, "Invertir" en lugar de "Para inversores", puerta "Comprar un lote" y tickets de la empresa.
- `pase-fundador-gobernanza`: el texto de la tarjeta en Sumarte y su ⚖.
- `manifiesto-lighthouse-vrn`: "No aparece en Sumarte" pasa a permitir la línea de adhesión.
- `contactos-bandeja`: "Inversión y círculo con el mismo pedido" sin medidores ni "Lote 7".
- `pasaporte-identidad-destacada`: "Para qué sirve y qué no requiere" sin "Lote 7".

## Impact

- **Código:**
  - `app/sumarte/sumarte-cliente.tsx`
  - `lib/sumarte/datos.ts` (filas de la comparativa; sale `EMISION`)
  - `lib/idioma/textos/sumarte.ts` y `lib/idioma/textos/pasaporte.ts`
  - `lib/legal/terminos.ts`
- **Tests:**
  - `lib/sumarte/sumarte.test.ts` y `lib/legal/terminos.test.ts`
  - `e2e/sumarte.spec.ts`, `e2e/idioma-portada-sumarte.spec.ts`, `e2e/contactos.spec.ts` y `e2e/pasaporte.spec.ts`
- **También:** `lib/financiamiento/fuentes.ts` (`TICKETS_SAFE`).
- **Sin** dependencias nuevas, tablas, migraciones, pedidos de red ni permisos nuevos. Los datos guardados en el navegador siguen igual.
- **Toca textos de inversión y de pagos simulados:** pasa por la revisión del agente `arquitecto`, en un paso aparte.
- **Relación con otros cambios:**
  - **Depende de `lote-ficha-y-compra`** (`/lotes` y `lib/lotes/modelo.ts`) y de `venta-lotes-regla` (`EstadoAdministrativo` de `lighthouse-norte`). Va antes de `modelo-hibrido-procomun`, que usa `TICKETS_SAFE`.
  - `fogon-desde-mi-y-guardian` (0/9, congelado) prevé el mismo texto de la tarjeta del Pase y el ⚖ `influenciafondocomun`: este cambio crea ese ⚖ y aquel, si se descongela, lo reutiliza.
  - `fogon-portada-holarquia` (0/20) es el que saca de la ficha de Lighthouse VRN la aceptación simulada. La adhesión ya vale desde que se adhiere (`lib/gobernanza/participar.ts`), así que este cambio no depende de él.
  - `idioma-legal` (0/8) suma el inglés de todo el catálogo: si entra antes, no se repite lo que ya esté.
