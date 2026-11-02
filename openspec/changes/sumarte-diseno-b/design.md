# Design

## Context

`/sumarte` es una página pública. Sus planes, su comparativa y sus textos vienen del mock-up v6, anterior al diseño legal B. La Vista NetX (`/netx`, `/netx/financiamiento`) ya cuenta el modelo nuevo y pide sesión; está solo en español. Motivación y alcance: ver `proposal.md`. Requisitos: ver `specs/`.

Fuentes:

- NS_Tokenomics 04 §2: tres niveles, créditos 30 % en 3 años que vencen a los 12 meses, misma voz en todos los niveles.
- NS_Tokenomics 25 y 26: el Pase va a la Fundación; series, y la tierra nunca en manos de inversores.
- NS_Tokenomics 28 §3: SAFU, Serie Madre y colocación privada.
- NS_Tokenomics 30 §1 y §2b, y `sim/RESULTS_platform_revenue.md`: la membresía y el Plan Tribu son de NetX; el Pase es del procomún.
- Backlog: D9, D37, D38 y T7.

## Goals / Non-Goals

**Goals:**
- Que Sumarte no contradiga a la Vista NetX ni a lo que Gus decidió el 30-oct y el 1-nov.
- Separar a simple vista sumarse (membresía) de invertir (otro camino, sin oferta).
- Tocar lo mínimo: una noche, sin cambiar permisos, estado guardado ni los ids de los niveles.

**Non-Goals:**
- Modelar series o instrumentos en el código de Sumarte: son textos y ⚖. Los números siguen en `lib/series` y `lib/financiamiento`.
- Resolver el resto de la app que todavía nombra el diseño anterior (ver fuera de alcance en `proposal.md`).

## Decisions

### 1. Los números de inversión quedan detrás de la sesión
Sumarte nombra los instrumentos y enlaza, sin tasas, descuentos ni cupos, y sin tickets de los proyectos. El ⚖ `circulo` dice "sin difusión masiva del instrumento", y Sumarte es pública.

**Única excepción, pedida por Gus el 2-nov:** el rango de tickets de "En NetX como empresa". Sale de una constante con su marca, `TICKETS_SAFE = { min: 5_000, max: 50_000, abierto: true }` en `lib/financiamiento/fuentes.ts`, y la tarjeta dice "de ejemplo, a definir con Vagner". Es un SAFE de la empresa, no el círculo de un fideicomiso. Igual, es un monto de inversión en una página pública <!-- arquitecto: P7 pasó a `venta-lotes-regla` --> (no indexada desde `venta-lotes-regla`, pero visible con el enlace): antes de mostrar la plataforma afuera, esto se revisa junto con lo de abajo.

<!-- arquitecto: "detrás de la sesión" es una tapa, no una llave (ADR-015); se deja escrito para que nadie lo tome como protección -->
**Qué protege y qué no.** La sesión de la Vista NetX oculta la página en el navegador, pero no la protege: según ADR-015, sus números se pueden leer sin sesión y el registro de Explorador es gratis y abierto. Esta decisión ordena el relato para el equipo; no cumple por sí sola con "sin difusión masiva". El enlace nuevo además conecta una página pública con el detalle del SAFU. Alcanza para el prototipo interno. Antes de mostrar la plataforma afuera (R14) hay que pasar a la opción C de ADR-015 o sacar los enlaces.

<!-- arquitecto: la spec prohíbe cupos y descuentos en la sección, y dos ⚖ que se conservan los nombran -->
**Los ⚖ de la sección.** "Sin cupos ni descuentos" se aplica a lo que la sección muestra y ofrece: lugares disponibles, medidores y valores del instrumento. Los ⚖ se leen solo si se abren y conservan su texto: `circulo` nombra los topes de la norma (35 y 15) y `safu` dice "con un descuento", sin el valor. Si Gus prefiere que tampoco aparezcan ahí, hay que usar otro texto solo para Sumarte.

*Alternativa descartada:* un resumen con números en Sumarte (se parece a P21 y a una oferta).

*Alternativa descartada:* sacar toda mención a invertir. CLAUDE.md pide que la plataforma deje claro que va a servir para captar plata de inversores.

### 2. Se conserva "Pedir invitación", sin cupos
El pedido no compromete a nada (⚖ `contacto`) y es el único punto que dispara la verificación de identidad a pedido (B5) desde Sumarte. Se conservan:

- la acción `invitacion` y el estado guardado;
- el motivo `invitacion-circulo`, con su etiqueta "Invitación al círculo";
- el diálogo de identidad.

Cambia la referencia del pedido, de "Lote 7" a "Programa de series", y salen los dos medidores con `EMISION` de `lib/sumarte/datos.ts`. La copia de `EMISION` en `lib/vista-netx/datos.ts` no se toca.

Las referencias de los dos pedidos salen del diccionario, porque se ven en la pantalla del pedido: en inglés hoy aparecen en español. Los pedidos viejos que digan "Lote 7" se muestran como están.

### 3. "Automática" quiere decir "sin aceptación", no "al sumarte"
La spec `gobernanza-adhesion` y `lib/gobernanza/participar.ts` definen la adhesión como un acto de la persona: adherís y valés al instante, sin que nadie te acepte. Elegir un plan no adhiere, porque adherir es aceptar por escrito unos principios.

La línea va **fuera** de las tarjetas, sin botón de adherir y sin condicionar ningún plan. Esto corrige en lo mínimo la decisión del 29-oct "No va en Sumarte" (`manifiesto-lighthouse-vrn`), y por eso queda como pregunta para confirmar. Si Gus la prefiere afuera, se saca un solo párrafo.

<!-- arquitecto: "No aparece en Sumarte" es un requisito con test; este cambio lo contradice dos veces -->
**Choque con `manifiesto-lighthouse-vrn`.** Su requisito "No aparece en Sumarte" y su test (`e2e/manifiesto-lighthouse-vrn.spec.ts`) prohíben que `/sumarte` nombre a "Lighthouse VRN" o muestre el requisito de adhesión. Lo nombran esta línea, `invertir.proyectos.tierra` y la puerta "Comprar un lote", así que sacar el párrafo de adhesión no alcanza. Hay que actualizar el test (tarea 3.3) y el delta de esa spec, que ya está en este cambio.

<!-- arquitecto: adherir es de Miembro en adelante (`NIVEL_MINIMO.adherir`); sin decirlo, el texto le promete a un Explorador algo que la pantalla le niega -->
**Adherir pide ser Miembro.** Hoy `NIVEL_MINIMO.adherir` es `miembro`, y `/fogon` también lo pide. Un Explorador que sigue el enlace no puede adherir: ve "Sumate para adherir". Por eso el texto de `adhesion` nombra los dos requisitos. Este cambio no modifica esa regla.

### 4. Ronda 0 sale de la tarjeta y la influencia es la única promesa de gobierno
La Ronda 0 suponía el encuentro de febrero (NS_Tokenomics I-15, abierto). Prometer a la vez "voz en la Ronda 0" e "influencia" confunde.

El ⚖ `ronda0` queda en el catálogo, sin uso en Sumarte. La puerta `voz-fondo-comun` del Pasaporte tampoco se toca. Lo de "la misma influencia en los tres niveles" mantiene lo que ya dice la tarjeta ("Mismo voto en los tres niveles") y doc 04 ("money buys access and credits, not more voice"). El mecanismo real es D38.

### 5. Solapamiento con `fogon-desde-mi-y-guardian`
Este cambio toma de su design §4 solo la tarjeta de Sumarte y la **creación** de `influenciafondocomun`, con la misma redacción. Aquel conserva el id de la puerta, la etiqueta del Pasaporte y el retiro de `gobernanzafideicomiso`, que hoy sigue en uso en `lib/canales/puertas.ts`, y por eso se queda en el catálogo.

*Alternativa descartada:* esperar a aquel cambio. Está apilado sobre `fogon-portada-holarquia` (0/20) y dejaría a Sumarte desalineada varias noches.

*Alternativa descartada:* renombrar la puerta acá. Gus pidió ese cambio en aquel PR, y sumaría permisos a este.

### 6. "Brote" sigue igual
Doc 04 lo llama "Guardián"; `RESULTS_platform_revenue.md` y el código, "Brote". "Guardián" ya nombra al agente que defiende la Voz de la Tierra, y usarlo también para un nivel de pago confunde. Si Gus quiere el cambio, es de una línea por idioma en `niveles`; el id `brote` queda.

### 6 bis. Puerta "Comprar un lote" (2-nov)
Es un `h2` propio, entre los planes e "Invertir", y **no** va dentro de "Invertir": ahí la frase `noesoferta` dice "desde esta sección no se vende ni se cobra nada" y tiene que seguir siendo literalmente cierta. Muestra: el texto, el precio mínimo de lote de `lib/lotes/modelo.ts` (nunca escrito en el diccionario), `EstadoAdministrativo proyecto="lighthouse-norte" compacto`, y un enlace `next/link` a `/lotes`. No tiene botón de compra ni de reserva: eso vive en la ficha.

*Alternativa descartada:* una tarjeta más dentro de los cuatro planes. Un lote no es un plan: no se activa ni se compara en "Qué incluye cada plan".

### 6 ter. "Juego B" sale de los textos de esta página (2-nov)
`modelo-hibrido-procomun` saca el Juego A y el B de la Vista NetX, y dejarlos acá dejaría a Sumarte hablando de algo que ya no se explica en ningún lado. Los textos de abajo dicen "modelo híbrido" o directamente lo que pasa. Que la Fundación siga guardando la tierra común es un **supuesto** y queda como pregunta para Gus: si cambia, son textos y dos ⚖.

### 7. Textos

Valen como punto de partida; el implementador los copia y puede ajustar solo el armado con los ⚖.

**Sumarte, es:**

| Clave (orientativa) | Texto |
|---|---|
| `pagina.intro` | Sumarte es la puerta de entrada: cómo te sumás define qué podés hacer. Explorar es gratis. La membresía te abre las salas y los pactos. El Pase Fundador sostiene el Fondo Común del Lighthouse y te da influencia y créditos. Comprar un lote e invertir son otros caminos: están más abajo. Valores de ejemplo, a re-ajustar. Nada se cobra de verdad: todo lo que elijas acá es simulado y queda solo en este navegador. |
| `comprarLote.titulo` | Comprar un lote |
| `comprarLote.texto` | Lotes privados en el sector norte de Lighthouse VRN, con un loteo provisorio e ilustrativo. Desde {precio} el lote, con opción de casa: precios de ejemplo, a confirmar. Es una simulación: no se cobra nada y no reserva ningún lote de verdad. |
| `comprarLote.enlace` | Ver los lotes |
| `explorador.incluye` | Mapa y páginas de tribus · Entrevista con el agente · Eventos abiertos · Hifa y tu espacio personal |
| `miembro.plata` | La cobra NetX: es un servicio. |
| `fundador.cohorte` | Cohorte Génesis · fecha a definir |
| `fundador.financias…` | Sostenés el Fondo Común (⚖) y entrás a la cohorte fundadora. La misma influencia en los tres niveles. |
| `fundador.plata` | Va al Fondo Común del procomún, no a NetX. |
| `fundador.influencia` | Influencia en el Fondo Común (⚖): la distribución de grandes sumas se va a decidir con conviction voting (próximamente) |
| `fundador.creditosFin` | (⚖), se liberan en 3 años y vencen a los 12 meses de liberarse |
| `fundador.registroGenesis` | Registro Genesis si venís a un evento de comunidad (a definir) |
| `tribu.plata` | Lo cobra NetX: un servicio que le factura a la tribu. |
| `adhesion` <!-- arquitecto: suma "como mínimo el plan Miembro" (§3) --> | Para participar en las decisiones hace falta tener como mínimo el plan Miembro y adherir al manifiesto de Lighthouse VRN (⚖). Adherís y quedás adentro al instante: nadie tiene que aceptarte. Elegir un plan no te hace adherir. **Leer el manifiesto** → `/tribus/lighthouse` |
| `invertir.titulo` | Invertir |
| `invertir.intro` | Invertir es distinto de sumarte: es otro camino, con otros documentos. |
| `invertir.proyectos.etiqueta` | Por invitación (⚖ `circulo`) |
| `invertir.proyectos.titulo` | En los proyectos de regeneración |
| `invertir.proyectos.texto` | Esta plata de inversión va a proyectos (las series ⚖), no a la tierra. Las series todavía no existen: la idea es entrar con un SAFU (⚖), que después se convierte en Unidades de la Serie Madre (⚖). |
| `invertir.proyectos.tierra` | La tierra común queda en una Fundación (⚖) que todavía no existe y que no podría venderla. Los lotes privados son otro camino: están en "Comprar un lote". |
| `invertir.proyectos.enlace` | Ver cómo funciona en la Vista NetX |
| `invertir.proyectos.referencia` | Programa de series |
| `invertir.empresa.etiqueta` | Conversación privada |
| `invertir.empresa.titulo` | En NetX como empresa (⚖ `safe`) |
| `invertir.empresa.texto` | Es otra inversión: en la compañía detrás de la plataforma, no en los proyectos. Lo hablamos uno a uno con el equipo. |
| `invertir.empresa.tickets` | Tickets desde {min} hasta {max} o más: de ejemplo, a definir con Vagner. |
| `invertir.empresa.enlace` | Ver cómo se financia NetX en la Vista NetX |
| `invertir.empresa.referencia` | Invertir en NetX |

**Sumarte, en:**

| Clave (orientativa) | Texto |
|---|---|
| `pagina.intro` | Joining is the way in: how you join defines what you can do. Exploring is free. Membership opens the rooms and the pacts. The Founder Pass supports the Lighthouse Common Fund and gives you influence and credits. Buying a lot and investing are different paths: they're further down. Sample values, to be re-tuned. Nothing is really charged: everything you choose here is simulated and stays only in this browser. |
| `comprarLote.titulo` | Buy a lot |
| `comprarLote.texto` | Private lots in the north sector of Lighthouse VRN, on a provisional, illustrative subdivision. From {precio} per lot, with a house option: sample prices, to be confirmed. It's a simulation: nothing is charged and no lot is really reserved. |
| `comprarLote.enlace` | See the lots |
| `explorador.incluye` | Map and tribe pages · Interview with the agent · Open events · Hifa and your personal space |
| `miembro.plata` | NetX charges it: it's a service. |
| `fundador.cohorte` | Genesis Cohort · date to be defined |
| `fundador.financias…` | You support the Common Fund (⚖) and join the founding cohort. The same influence at all three levels. |
| `fundador.plata` | It goes to the commons' Common Fund, not to NetX. |
| `fundador.influencia` | Influence in the Common Fund (⚖): the distribution of large sums will be decided with conviction voting (coming soon) |
| `fundador.creditosFin` | (⚖), released over 3 years; they expire 12 months after release |
| `fundador.registroGenesis` | Genesis registration if you attend a community event (to be defined) |
| `tribu.plata` | NetX charges it: a service billed to the tribe. |
| `adhesion` <!-- arquitecto: suma "at least the Member plan" (§3) --> | To take part in decisions you need at least the Member plan and to sign on to the Lighthouse VRN manifesto (⚖). You sign on and you're in right away: nobody has to accept you. Choosing a plan doesn't sign you on. **Read the manifesto** → `/tribus/lighthouse` |
| `invertir.titulo` | Invest |
| `invertir.intro` | Investing is not the same as joining: it's a different path, with different documents. |
| `invertir.proyectos.etiqueta` | By invitation |
| `invertir.proyectos.titulo` | In the regeneration projects |
| `invertir.proyectos.texto` | This investment money goes to projects (the series ⚖), not to the land. The series don't exist yet: the idea is to come in with a SAFU (⚖), which later converts into Units of the Mother Series (⚖). |
| `invertir.proyectos.tierra` | The common land stays in a Foundation (⚖) that doesn't exist yet and could not sell it. Private lots are a different path: see "Buy a lot". |
| `invertir.proyectos.enlace` | See how it works in the NetX View (in Spanish) |
| `invertir.proyectos.referencia` | Series program |
| `invertir.empresa.etiqueta` | Private conversation |
| `invertir.empresa.titulo` | In NetX as a company |
| `invertir.empresa.texto` | It's a different investment: in the company behind the platform, not in the projects. We talk it over one on one with the team. |
| `invertir.empresa.tickets` | Tickets from {min} to {max} or more: samples, to be defined with Vagner. |
| `invertir.empresa.enlace` | See how NetX is funded in the NetX View (in Spanish) |
| `invertir.empresa.referencia` | Invest in NetX |

El título de la sección nueva queda en `h2`, las tarjetas en `h3`, como la sección actual. La frase "no es una oferta" va entre el título y las tarjetas, con su ⚖. Comparativa: la fila 1 pasa a "Mapa, tribus y eventos abiertos" / "Map, tribes and open events"; la fila 7, a "Influencia en el Fondo Común (próximamente: conviction voting)" / "Influence in the Common Fund (coming soon: conviction voting)". Pasaporte: "Lote 7" pasa a "programa de series" y "Lot 7" a "series program".

**Catálogo legal (todos con `borrador: true`).** La bitácora y el tooltip no cambian.

**`pasefundador`** · título "Pase Fundador" / "Founder Pass"
- es: "Una membresía no transferible del procomún del Lighthouse. Da influencia en el Fondo Común, acceso y créditos de servicios. No da tierra, lotes, prioridad ni rendimiento, y no se puede revender. La plata del Pase va al Fondo Común, no a NetX. En el modelo híbrido la recibe la Fundación de la tierra, que todavía no existe; quién la recibiría mientras tanto está sin definir. A verificar con abogado."
- en: "A non-transferable membership of the Lighthouse commons. It gives influence in the Common Fund, access and service credits. It gives no land, lots, priority or return, and it cannot be resold. The Pass money goes to the Common Fund, not to NetX. Under the hybrid model it is received by the land Foundation, which does not exist yet; who would receive it in the meantime is still undefined. To be verified with a lawyer."

**`guardian`** · título "El Fondo Común" / "The Common Fund". La clave queda porque la usa `lib/canales/puertas.ts`.
- es: "La plata del procomún para agua, energía, vivero e incubación de tribus. Recibe el pago del Pase directamente. NetX nunca toma un porcentaje: como mucho cobra una tarifa de servicio fija y publicada, si se la contrata para operar la plataforma. En el modelo híbrido lo administra la Fundación de la tierra, que todavía no existe. A verificar con abogado."
- en: "The commons' money for water, energy, the nursery and incubating tribes. It receives the Pass payment directly. NetX never takes a percentage: at most it charges a fixed, published service fee, if it is hired to operate the platform. Under the hybrid model it is managed by the land Foundation, which does not exist yet. To be verified with a lawyer."

**`creditos`** · título "Créditos comunes y de estadía" / "Common and stay credits"
- es: "Un saldo con un solo emisor, quien custodie el Fondo Común: se canjea por productos de las tribus y por estadías. Se libera por partes en 3 años y cada parte vence a los 12 meses. No se transfiere y no se rescata en dinero, para no ser un medio de pago. Valores de ejemplo, a re-ajustar."
- en: "A balance with a single issuer, whoever holds the Common Fund: it can be redeemed for tribe products and stays. It is released in parts over 3 years and each part expires after 12 months. It cannot be transferred or cashed out, so that it is not a means of payment. Sample values, to be re-tuned."

**`influenciafondocomun`** (nueva) · título "Influencia en el Fondo Común" / "Influence in the Common Fund"
- es: el texto de `fogon-desde-mi-y-guardian`, design §4, sin cambios.
- en: "The Founder Pass will give you influence over how large sums from the Common Fund are distributed, with a mechanism called conviction voting: your support for a proposal weighs more the longer you sustain it. It is not built yet. It is not a vote in any trust or in the series: those assemblies vote by capital and outside the platform. Who decides the Common Fund's budget is set by the Foundation's statute, to be confirmed with the legal team."

**`noesinversion`** (nueva, con `frase` como `consultivo`) · título "No es una inversión" / "It is not an investment"
- frase es: la de hoy, sin cambios. Frase en: "It is not an investment: it gives no land, lots, priority or return, and it cannot be resold."
- es: "El Pase Fundador es una membresía: pagás para sostener el procomún y recibís acceso, influencia y créditos de servicios. No esperes una ganancia en plata. Invertir es otro camino, separado y con otros documentos."
- en: "The Founder Pass is a membership: you pay to support the commons and you receive access, influence and service credits. Do not expect a money gain. Investing is a different path, separate and with different documents."

**`noesoferta`** (nueva, con `frase`) · título "Esto no es una oferta" / "This is not an offer"
<!-- arquitecto: decía "desde esta página", pero esta misma página muestra planes con precio y botones de compra simulada; la frase legal tiene que ser literalmente cierta -->
- frase es: "Esto no es una oferta: desde esta sección no se vende ni se cobra nada. Contamos cómo funcionaría." Frase en: "This is not an offer: nothing is sold or charged from this section. We explain how it would work."
- es: "Ofrecer inversiones al público necesita autorización de la CNV. Acá solo contamos un diseño que todavía no revisó un abogado: el SAFU y las series no existen. Si algún día se concreta, sería en forma privada, por invitación, con documentos propios y verificando tu identidad antes. A verificar con abogado."
- en: "Offering investments to the public requires authorization from the CNV (Argentina's securities regulator). Here we only describe a design that no lawyer has reviewed yet: the SAFU and the series do not exist. If it ever happens, it would be private, by invitation, with its own documents and after verifying your identity. To be verified with a lawyer."

**Solo suman `en`, sin cambiar el español:**

| Clave | Título en | Texto en |
|---|---|---|
| `membresia` | Network membership | A service: access to the network, the tribes and the events. It gives no rights over the land. |
| `plantribu` | Tribe Plan | A software service that NetX bills to the tribe (a nonprofit association or a simplified company). It is not a contribution or an investment. |
| `safe` | Investing in the company | Investing in NetX as a company is something else: it is done with a SAFE in the holding, in private conversations, one on one. It is not publicly offered on the platform. |
| `circulo` | Circle by invitation | Private offer: access by invitation, up to 35 contributors per issue and at most 15 non-qualified, with no mass promotion of the instrument (CNV General Resolution 1016/2024, as amended by 1088/2025). Community content is public. |
| `serieprograma` | Series | A project with its own money, its own income and its own investors (for example, the vineyard or the solar park) within the trust program. Each trust is a separate estate: a problem in one series does not reach another. |
| `safu` | SAFU | A simple agreement for future Units: someone puts in money today, before the series exist, and receives it as Units of the Mother Series when it opens, at a discount. How it can legally be offered still has to be confirmed by a lawyer. |
| `seriemadre` | Mother Series | A series with no project of its own: it invests in all the others. Whoever comes in holds a small piece of every project, with less risk than in a single one. It is where the SAFU and, later, the tokens end up. |

**`fundaciontierra`** (se reescribe el español también, 2-nov, `borrador: true`) · título "Fundación de la tierra" / "Land Foundation"
- es: "En el modelo híbrido, la entidad en la que queda la tierra común del Lighthouse. Todavía no existe: se crea si se acepta el diseño y el dueño actual le pasa esa tierra. Los lotes privados no quedan en ella. Su estatuto le prohibiría vender, hipotecar o dar en garantía la tierra común (cómo hacer que eso valga frente a terceros está a verificar con abogado). Cobra un canon y una regalía de cada serie antes que cualquier inversor y con eso paga el procomún. NetX no puede tomar un porcentaje de su plata."
- en: "Under the hybrid model, the entity that holds the Lighthouse common land. It does not exist yet: it is created if the design is accepted and the current owner transfers that land to it. Private lots do not stay in it. Its statute would forbid selling, mortgaging or pledging the common land as collateral (how to make that binding on third parties is to be verified with a lawyer). It collects a ground rent and a royalty from each series before any investor, and uses them to fund the commons. NetX cannot take a percentage of its money."

Quedan en español marcado los ⚖ `semillas`, `gobernanzafideicomiso` y otros que este cambio no toca: los resuelve `idioma-legal`.

## Risks / Trade-offs

- [Dos pantallas se contradicen: Sumarte dice "influencia" y el Pasaporte "Voto en el Fideicomiso"] → Se iba a resolver con `fogon-desde-mi-y-guardian`, **que quedó congelado el 2-nov**: la contradicción sigue hasta nuevo aviso. El PR lo aclara.
- [`/sumarte` es pública y ahora muestra precio de lote y rango de tickets] → Es el prototipo interno (ADR-028). <!-- arquitecto --> No se indexa (P7, `venta-lotes-regla`), y quien tenga el enlace la ve: se resuelve en R14.
- [Las líneas sobre "Juego B" de `lib/legal/terminos.test.ts` esperan el texto viejo de `fundaciontierra`] → Se actualizan en la tarea 1.2.
- [Sumarte dice que no hace falta aceptación y la ficha de Lighthouse VRN todavía muestra "Simular: la comunidad me acepta"] → La regla real ya es esa (`participar.ts`: "pedido" cuenta); la ficha se corrige con `fogon-portada-holarquia`. El PR lo aclara.
- [Conflictos de merge si `fogon-desde-mi-y-guardian` o `idioma-legal` corren en paralelo, en `terminos.ts` y en los diccionarios] → No correrlos la misma noche; el que entre segundo reusa lo que ya esté.
- [El enlace sin sesión te devuelve a la misma página, con un aviso] → Es la regla de acceso vigente de la Vista NetX y el aviso explica por qué. No se abre esa Vista al público. <!-- arquitecto --> `IrASumarte` conserva la ruta y la query, pero no el `#`: quien se registra desde ese aviso vuelve al principio de `/netx/financiamiento`, no a "Dinero temprano". Se acepta.
- ["No es una oferta" da una falsa tranquilidad] → Es un borrador y no reemplaza R14 ni la revisión de un abogado. Antes de mostrar la plataforma afuera hay que revisar esta sección y resolver lo de §1 ("Qué protege y qué no"). <!-- arquitecto -->
- [Otras specs quedaban desactualizadas: `manifiesto-lighthouse-vrn` ("No aparece en Sumarte"), `contactos-bandeja` ("Inversión y círculo con el mismo pedido": medidores y "Lote 7") y `pasaporte-identidad-destacada` ("Para qué sirve y qué no requiere": "Lote 7")] → Sus deltas ya están en este cambio (2-nov).
- [El ⚖ `guardian` cambia de título y la bitácora guarda la clave] → La clave no cambia. Las entradas viejas siguen valiendo.
<!-- arquitecto: `fogon-desde-mi-y-guardian` §1 deja esta frase sin cambiar hasta que Gus confirme la figura legal; no alcanza con decir que la reescribe aquel cambio -->
- [`guardianIA` sigue diciendo que "el Guardián del Lighthouse" custodia el Fondo Común, y Sumarte pasa a decir que lo administra la Fundación] → `fogon-desde-mi-y-guardian` §1 deja esa frase sin cambiar hasta que Gus confirme qué figura queda en el modelo híbrido. Este cambio no la toca, pero el ⚖ `guardian` ya da por hecha la Fundación: hace falta esa confirmación para cerrar la contradicción.

## Migration Plan

No hay migración: `lh-sumarte` conserva `invitacion`, `charla` y los ids de los niveles, y los pedidos viejos se muestran como están. Volver atrás es revertir el PR.
