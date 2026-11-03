# Proposal

## Why

Quien mira un lote tiene que entender qué compra y qué sigue siendo de todos. Además, la Vista NetX todavía dice lo contrario de la fase 1 (ADR-030): su título pregunta cómo financiarse "sin vender lotes", y compara un "Juego A" de vender lotes con un "Juego B". Este cambio cuenta el modelo híbrido en un solo relato.

## What Changes

- **Página `/lotes/hibrido`, "Qué es tuyo y qué es de todos"**, pública y bilingüe:
  - qué es privado y qué común: caminos, agua, aguas grises y negras, basura, escuela, restauración y producción;
  - quién lo paga y cuánto aporta cada lote;
  - por qué la venta sola no alcanza, con las lecciones que calcula `lib/lotes/modelo.ts`;
  - los resguardos de doc 18 §4: servidumbres antes de la primera venta, mismo reglamento y aporte para todos, preferencia de reventa, y ninguna venta sobre la franja del río. Todos dicen en texto que **todavía no están hechos**.
- **`/netx/financiamiento`:** sale la sección "Juego A o Juego B" y la frase "por qué vender lotes no es el atajo"; entra la sección "El modelo híbrido". Se conserva el bloque del manifiesto.
- **`/netx` (Resumen):** sale "Dos juegos" y "¿Y vender lotes?", y el título pasa a "¿Cómo se financia NetX?". **Va más allá de lo que nombró el pedido, pero es necesario:** `lib/financiamiento/juegos.ts` solo lo usa `/netx`, y la tabla de `/netx/financiamiento` vive en `lib/financiamiento/relato.ts`. Sin esto, la Vista NetX se contradice sola.
- **⚖:** se reescribe `ordenanza173` y se suma `resguardoshibrido`, en borrador y es/en.
- **`sumarte-diseno-b` se revisa en su propia carpeta**, en este mismo trabajo de especificación: saca "Lighthouse VRN no vende tierra", suma la puerta "Comprar un lote" y amplía los tickets de "Invertir en NetX". Se implementa la noche anterior a este cambio.

## Fuera de alcance

- **Tickets de acceso al procomún:** es `procomun-tickets`, bloqueado hasta el sí de Franz.
- **Gobernanza del procomún** (`consentimiento-alta`, Fogón en la base, conviction voting): congelada hasta ese sí.
- **El nombre "Juego B" en el Fogón** (`lib/gobernanza/datos.ts`, "Parámetros del Juego B"): queda como está; se reporta.
- **Números que no existen:** el costo de cada rubro común es "sin dato" y el cuadro no reparte el presupuesto entre rubros. Lote, casa, infraestructura y parte del dueño vienen del módulo, como valores de ejemplo.
- **Cumplir los resguardos:** esto los cuenta, no los hace. Tampoco se dibuja la franja del río, porque no hay dato.
- **Decidir qué pasa con la Fundación en el híbrido:** se conserva "todavía no existe" y se aclara que los lotes privados no quedarían en ella (ver preguntas).
- **Editar `NS_Tokenomics`** (doc 30, `AGENTS.md`) y `NS_platform`.
- **Lighthouse SMA, deck de inversores y la nota de las "300 razones".**

## Capabilities

### New Capabilities
- `modelo-hibrido`: la página que explica qué es privado, qué es común, quién paga, por qué la venta sola no alcanza y qué resguardos se piden.

### Modified Capabilities
- `vista-netx-financiamiento`: salen "Juego A y Juego B", "Vender lotes en tres líneas" y "Juego A o Juego B"; cambian "La Vista NetX es para toda persona con sesión", "Un título por pestaña, sin el hito del Congreso", "Resumen en una frase" y "Quién es quién con la plata"; entra el modelo híbrido.
- `modelo-financiamiento`: "Textos del Juego A y el Juego B" pasa a textos del modelo híbrido.
- `manifiesto-lighthouse-vrn`: "Manifiesto en la Vista NetX" pasa a "Manifiesto en el modelo híbrido", con el mismo bloque.

## Impact

- **Código nuevo:** `app/lotes/hibrido/page.tsx`, `lib/lotes/hibrido.ts`.
- **Código que cambia:** `app/netx/page.tsx`, `app/netx/financiamiento/page.tsx`, `app/netx/financiamiento/secciones-modelo.tsx`, `app/netx/simulador/page.tsx` (una línea), `lib/financiamiento/juegos.ts` (pasa a `hibrido.ts`), `lib/financiamiento/relato.ts`, `lib/lotes/modelo.ts` (`faltanteAnual`), `lib/legal/terminos.ts`, `lib/idioma/textos/lotes.ts`, `app/lotes/page.tsx` y `app/lotes/[id]/page.tsx` (enlace).
- **Tests:** `lib/financiamiento/relato.test.ts`, `lib/legal/terminos.test.ts`, `e2e/vista-netx.spec.ts`, `e2e/netx-financiamiento.spec.ts`, `e2e/manifiesto-lighthouse-vrn.spec.ts`, `e2e/login.spec.ts`, `e2e/hibrido.spec.ts` (nuevo).
- **Sin** tablas, migraciones, permisos ni dependencias nuevas.
- **Depende de** `lote-ficha-y-compra` (el módulo y `/lotes`) y de `sumarte-diseno-b` revisado.
- **Revisión de arquitectura:** toca textos de inversión y el modelo de plata. La corre el script de Gus en un paso aparte.
