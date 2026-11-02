# Proposal

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

- **Pase Fundador:** da "Influencia en el Fondo Común (próximamente: conviction voting)" en lugar de voto en un fideicomiso, igual en los tres niveles. El ⚖ dice que en el Juego B lo recibe la Fundación, que todavía no existe.
- **Adhesión:** una línea informativa dice que participar en las decisiones pide adherir al manifiesto de Lighthouse VRN, y que al adherir se queda adentro al instante, sin aceptación de nadie. Elegir un plan no hace adherir a nadie.
- **Congreso:** se saca de los planes y de la comparativa. La Presencia Genesis pasa a nombrar los eventos de comunidad, "a definir".

**Qué sale de Sumarte y pasa a "Invertir".** La sección "Para inversores" se reemplaza por "Invertir", con dos tarjetas y el texto visible "Esto no es una oferta":

- **En los proyectos de regeneración (por invitación):** explica en palabras simples series, SAFU y Serie Madre, con sus ⚖, y enlaza a `/netx/financiamiento#m-temprano`. Mantiene "Pedir invitación", con la verificación de identidad a pedido. Sale el proyecto del Lote 7 (fideicomiso, caja, espejo, residencia fiscal) y salen los medidores de cupos.
- **En NetX como empresa (SAFE):** mantiene "Pedir una charla" y enlaza a `/netx`.
- **Lo que Sumarte no muestra:** tasas, tickets, descuentos, cupos ni retornos. Eso vive solo en la Vista NetX, que pide sesión.
- **Tierra:** el texto dice que Lighthouse VRN no vende tierra en el Juego B.

**Catálogo legal (⚖ en borrador, es/en).**

- Se reescriben `pasefundador`, `guardian` (pasa a "El Fondo Común") y `creditos`.
- Se suman `influenciafondocomun`, `noesinversion` y `noesoferta`. Las dos últimas llevan al catálogo la frase que hoy está suelta en la tarjeta del Pase (R16) y la frase nueva "no es una oferta".
- Los ⚖ que quedan en pantalla y no tenían inglés lo suman, salvo `semillas` (ver fuera de alcance).

**Pasaporte:** solo cambia la mención al Lote 7, que dejaría de ser cierta.

**Sobre el backlog.** D9 dice "documentar, no construir" las series hasta que haya abogado. Este cambio no construye la entidad Serie: es texto, ⚖ y un enlace, en la línea de la excepción de prototipo que Gus decidió el 26-oct para la Vista NetX. No repropone P4 (`sumarte-pago-simulado`) ni P21 (`inversores-comparador`).

## Fuera de alcance

- **La venta de lotes privados que quiere el CEO:** no se diseña ni se menciona como opción; queda como pregunta abierta. La consulta por lotes de Chacras de Soluna sigue como está.
- **Cobros y plata real:** nada se cobra, todo sigue simulado y en el navegador.
- **Conviction voting** (backlog D38) y cualquier cámara o voto del Pase.
- **El id de la puerta `voto-fideicomiso` y la etiqueta del Pasaporte:** los cambia `fogon-desde-mi-y-guardian`, como pidió Gus. Hasta entonces el Pasaporte sigue diciendo "Voto en el Fideicomiso".
- **Re-ajustar valores** (precios, cupo de 300, mínimo de USD 75.000) y re-correr el modelo de la cohorte (NS_Tokenomics I-15). Tampoco se editan los documentos de NS_Tokenomics.
- **Renombrar el nivel "Brote":** sigue igual en pantalla y en el código hasta que Gus decida (ver preguntas).
- **Otras pantallas y ⚖ del diseño anterior:** los cupos de `/netx/comunidad`, el sello Genesis del Pasaporte, "Guardián del Lighthouse" en `guardianIA` y en territorios, y los ⚖ `semillas`, `pasaporte`, `kyc` y `licencia`.
- **Oferta "Círculo Fundador"** (SAFE + Pase, doc 15), una vía para aportantes del exterior y la frase "de por vida" del Pase.
- **Volver a activar las reglas antes de mostrar la plataforma afuera** (R14). El borrador "no es una oferta" no alcanza para abrirla fuera del equipo.

## Capabilities

### New Capabilities
<!-- ninguna: se amplían las capacidades de Sumarte y del Pase -->

### Modified Capabilities
- `sumarte` (la crea `sumarte-planes`, todavía sin archivar): valores a re-ajustar, destino de la plata, Pase con influencia, adhesión, planes sin Congreso y "Invertir" en lugar de "Para inversores".
- `pase-fundador-gobernanza` (todavía sin archivar): el texto de la tarjeta en Sumarte y su ⚖.

Para archivar este cambio, antes hay que archivar `sumarte-planes` y `pase-fundador-gobernanza`, que crean esas specs.

## Impact

- **Código:**
  - `app/sumarte/sumarte-cliente.tsx`
  - `lib/sumarte/datos.ts` (filas de la comparativa; sale `EMISION`)
  - `lib/idioma/textos/sumarte.ts` y `lib/idioma/textos/pasaporte.ts`
  - `lib/legal/terminos.ts`
- **Tests:**
  - `lib/sumarte/sumarte.test.ts` y `lib/legal/terminos.test.ts`
  - `e2e/sumarte.spec.ts`, `e2e/idioma-portada-sumarte.spec.ts`, `e2e/contactos.spec.ts` y `e2e/pasaporte.spec.ts`
- **Sin** dependencias nuevas, tablas, migraciones, pedidos de red ni permisos nuevos. Los datos guardados en el navegador siguen igual.
- **Toca textos de inversión y de pagos simulados:** pasa por la revisión del agente `arquitecto`, en un paso aparte.
- **Relación con otros cambios:**
  - `fogon-desde-mi-y-guardian` (0/9) también prevé el texto de la tarjeta del Pase y crear el ⚖ `influenciafondocomun`, con la misma redacción (su design §4). El que entre segundo reutiliza lo que ya esté. No conviene correrlos la misma noche.
  - `fogon-portada-holarquia` (0/20) es el que saca de la ficha de Lighthouse VRN la aceptación simulada. La adhesión ya vale desde que se adhiere (`lib/gobernanza/participar.ts`), así que este cambio no depende de él.
  - `idioma-legal` (0/8) suma el inglés de todo el catálogo: si entra antes, no se repite lo que ya esté.
