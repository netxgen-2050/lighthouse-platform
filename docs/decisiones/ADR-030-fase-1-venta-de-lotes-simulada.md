# ADR-030 · La fase 1 es la venta de lotes privados en Lighthouse VRN más el modelo híbrido con el procomún, solo simulada dentro del prototipo

- **Estado:** Propuesta
- **Fecha:** 2026-11-02
- **Cambio OpenSpec relacionado:** `venta-lotes-regla` (primero de la serie `loteo-norte-7a`, `lote-ficha-y-compra`, `modelo-hibrido-procomun`, `portada-vrn`; `procomun-tickets` queda bloqueado)

## Contexto
Franz (CEO) decidió en la llamada del 2-nov-2026 que la fase 1 de la plataforma es vender lotes privados en Lighthouse VRN, con un modelo híbrido con el procomún. Gus lo aceptó y pidió no volver a discutirlo: el riesgo legal y comercial queda a cargo de Franz (confirmación escrita pedida, todavía sin respuesta al 2-nov). Hasta hoy varias reglas escritas decían lo contrario, y los agentes las aplican: sin este registro, frenarían el trabajo. Hay que dejar claro qué cambia, qué no y cómo se modela en el código sin mostrar una aprobación municipal que no existe.

## Opciones
La decisión de producto ya está tomada; la tabla la deja registrada, no la reabre.

| Opción | A favor | En contra |
|---|---|---|
| A · No ofrecer lotes (regla vigente, nota 19 §2) | Sin choque con las reglas escritas | Contradice la decisión del CEO |
| B · Vitrina con derivación al vendedor, sin precio ni reserva (nota 19 §3) | Es lo que ya hace Soluna | No permite mostrar el flujo de compra que pide la fase 1 |
| C · Venta completa, simulada, con marca explícita de que la aprobación es un supuesto de trabajo | Es lo decidido; se ve de punta a punta sin cobrar nada | Muestra en el prototipo algo que afuera no se podría ofrecer; obliga a cuidar que no salga del equipo |

## Decisión
**C.** Decide Franz; acepta Gus. Técnicamente, "se puede simular la venta" y "está aprobado" son **dos datos separados**: `ventaSimulada` habilita `reservar` y `comprar`; `aprobacionMunicipal` sigue en `false` y nunca se usa para habilitar nada. Así ningún dato del sistema dice que el municipio aprobó algo.

### Qué reglas cambia
Rompe, a propósito, lo que estas fuentes dicen sobre lotes de Lighthouse:

- **`NS_platform`, nota 19** §2 ("Nunca: ofrecer, publicitar, reservar, señar o poner precio a un lote del Lighthouse") y §4 art. 1 ("no existe en el modelo de datos una entidad lote en venta").
- **`NS_platform`, backlog T7** y el principio 6 del Índice de Desarrollo; regla C24 de Compliance by design.
- **`NS_Tokenomics`, doc 30** §3 y título ("selling lots is not the shortcut") y `AGENTS.md`, regla 1. Doc 18 §4.6 pedía enmendar esa regla por escrito: esa enmienda queda pendiente en aquel repo.
- **Este repo:** `CLAUDE.md`; las specs `estado-administrativo` ("Sin compra ni reserva sin aprobación") y `vista-netx-financiamiento` ("Juego A o Juego B", "Vender lotes en tres líneas"); el cambio sin implementar `sumarte-diseno-b`.

Si un agente lee alguna de esas reglas y este ADR, manda este ADR. Los documentos de `NS_platform` y `NS_Tokenomics` no se editan desde este repo: los ajusta Gus o el documentador.

### Qué sigue igual
- **Es el prototipo interno.** Pagos simulados, ningún cobro real, sin pasarela, sin KYC real, y el aviso "Prototipo interno · datos de ejemplo" en todas las páginas. Abrirlo afuera es otro paso (R14).
- **La aprobación municipal no se muestra como otorgada.** El estado dice en texto que es un supuesto de trabajo, con fecha "sin dato".
- **Ninguna página se deja indexar** (P7, lo hace `venta-lotes-regla`). Es lo que sostiene que esto "no sale del equipo": lo que un buscador guarda no se deshace revirtiendo un PR. No reemplaza a R14: quien tenga el enlace puede ver `/lotes` sin sesión.
- **Chacras de Soluna no cambia:** `accionesDeLote("soluna")` devuelve solo `consultar`.
- **Reglas de calidad:** el dato que falta no es cero; accesibilidad; tokens del tema; ⚖ en un solo catálogo con `borrador: true`; textos es/en (ADR-004).
- **Ningún pase, ticket ni token da prioridad, crédito o reserva sobre un lote** (doc 18 §4.5).
- **Foco solo en VRN.** Nada de Lighthouse SMA ni del deck de inversores (USD 111M, TIR, recupero).

### Lo que sigue siendo cierto fuera del prototipo
No frena este trabajo, pero condiciona cualquier apertura y por eso queda escrito. Según nota 19 §1 (hipótesis, sin dictamen de abogado): la Ordenanza 173/2026 de Mainqué prohíbe ofrecer o reservar parcelas sin aprobación; la Ley 26.737 limita la propiedad extranjera y la prohíbe junto a cuerpos de agua; la Ley 20.266 impide cobrar comisión por vender tierra ajena sin matrícula. La tierra no es de NetX: quién vende queda como "sin dato" en la plataforma hasta que se defina.

## Consecuencias
- **Ganamos:** el equipo ve la fase 1 de punta a punta en el preview de `dev` antes de la reunión del lunes 9-nov.
- **Aceptamos:** una contradicción temporal con `NS_platform` y `NS_Tokenomics` hasta que se actualicen, y un prototipo que no se puede mostrar afuera tal como está.
- **Riesgo asumido por Franz:** el legal y comercial de la decisión. Sin su confirmación escrita, este ADR registra lo que Gus informó de la llamada.
- **Revisar:** cuando llegue la confirmación escrita de Franz; cuando haya resolución municipal real (cambia el texto del estado y su fecha); y siempre antes de mostrar la plataforma fuera del equipo (R14).

## En palabras simples
Franz decidió que lo primero que muestra la plataforma es la venta de lotes en Lighthouse VRN. Por eso una persona del equipo va a poder elegir un lote, reservarlo, "pagarlo" y ver un boleto, todo de mentira: nadie paga nada. Pero la pantalla no miente: el municipio todavía no aprobó el loteo, y lo dice con esas palabras. Es como un ensayo general con público de la casa: sirve para ver si la obra funciona, no para vender entradas.

## Fuentes
- Pedido de Gus del 2-nov-2026 (decisión de Franz en la llamada del mismo día).
- `NS_platform`: nota 19, backlog T7 y D16.
- `NS_Tokenomics`: doc 18 §4, doc 30 §3, doc 31 y `sim/lot_sale_sim.py` v0.2.
- ADR-004 (bilingüe), ADR-010 (modelos copiados con versión), ADR-015 (la sesión oculta, no protege), ADR-017 (versión de la política).
