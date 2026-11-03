# Proposal

## Why

Franz (CEO) decidió en la llamada del 2-nov-2026 que la fase 1 de la plataforma es la **venta de lotes privados en Lighthouse VRN más el modelo híbrido con el procomún**. Gus lo aceptó: no se vuelve a discutir y el riesgo legal y comercial queda a cargo de Franz (confirmación escrita pedida, sin respuesta todavía). Antes de construir pantallas, hay que dejar la regla escrita donde los agentes la leen: si no, la spec `estado-administrativo` y los documentos de producto los frenan.

**Esto rompe reglas escritas, a propósito:** nota 19 §2 ("nunca ofrecer, reservar ni poner precio a un lote del Lighthouse"), backlog T7, doc 30 §3, `CLAUDE.md` y `sumarte-diseno-b`. El detalle está en ADR-030.

## What Changes

- **ADR-030** (ya escrito en estado Propuesta, con su línea en el índice): quién decide, qué reglas cambia y qué sigue igual.
- **`CLAUDE.md`:** una sección "Fase 1" para que ningún agente frene por las reglas viejas, con la lista de lo congelado.
- **`lib/legal/estado-administrativo.ts`:**
  - proyecto nuevo `lighthouse-norte`, con `aprobacionMunicipal: false`;
  - marca `ventaSimulada`: `accionesDeLote("lighthouse-norte")` devuelve `consultar`, `reservar` y `comprar`, solo simuladas;
  - `accionesDeLote("soluna")` **sigue igual**, solo `consultar`;
  - el estado dice en texto que la aprobación es un **supuesto de trabajo**, con fecha "sin dato"; titular y expediente también "sin dato".
- **⚖ `loteonorte`** en el catálogo, es/en, con `borrador: true`.
- **Menú de fase 1** (`lib/navegacion.ts`):
  - adelante: Inicio, Territorio, Lotes y Sumarte;
  - agrupados como "Lo que viene": Tribus, Pactos, Semillas y Fogón;
  - Congreso oculto (campo `oculto`), con la nota `docs/notas/congreso-en-pausa.md` para volver.
- **Lotes** se declara con `existe: false`: `/lotes` llega con `lote-ficha-y-compra`, y hasta entonces el rail no lo muestra.

## Fuera de alcance

- **Pantallas de lotes:** el mapa es `loteo-norte-7a`; la ficha, `/lotes` y el flujo de compra son `lote-ficha-y-compra`.
- **Cobros reales, pasarela, KYC real y abrir la plataforma afuera** (R14): siguen prohibidos.
- **Decir que el municipio aprobó algo:** ningún dato ni texto lo afirma.
- **Lighthouse SMA y el deck de inversores** (USD 111M, TIR, recupero). Tampoco la nota de las "300 razones" (`NS_permacultura` 17).
- **Editar `NS_platform` y `NS_Tokenomics`** (nota 19, backlog T7, doc 18 §4.6, doc 30, `AGENTS.md`): este repo es solo código. ADR-030 lista lo que hay que actualizar allá.
- **Retirar `/congreso`** (backlog D16, decide Gus): solo sale del menú y la página sigue en su dirección. La tarjeta de la portada que enlaza al Congreso la saca `portada-vrn`.
- **Lo congelado:** `fogon-desde-mi-y-guardian`, `fogon-consenso-en-tarjetas`, `fogon-consenso-formal`, `semillas-constancias`, `liderar-varias-tribus`, billeteras, Mi Raíz, EAS, smart contracts y red de nodos.

## Capabilities

### New Capabilities
- `fase-1-lotes`: la regla escrita de la fase 1 para quienes trabajan en el repo (ADR y `CLAUDE.md`).

### Modified Capabilities
- `estado-administrativo`: el proyecto nuevo, la venta simulada y el supuesto de trabajo. Cambian "Dato del estado administrativo" y "Sin compra ni reserva sin aprobación".
- `rail-v2`: los grupos del rail pasan a Descubrir, Sumarte y Lo que viene.
- `navegacion-rail`: el orden de los destinos.
- `rail-destinos-ocultos`: Congreso se oculta como Compromisos, y cambia la lista del grupo.

## Impact

- **Código:** `lib/legal/estado-administrativo.ts`, `components/estado-administrativo.tsx`, `lib/legal/terminos.ts`, `lib/navegacion.ts`, `lib/idioma/glosario.ts` (o donde viva `G`), `lib/idioma/textos/marco.ts`, `components/rail.tsx`.
- **Documentos:** `CLAUDE.md`, `docs/notas/congreso-en-pausa.md`.
- **Tests:** `lib/legal/estado-administrativo.test.ts`, `lib/legal/terminos.test.ts`, `lib/navegacion.test.ts`, y los e2e que recorren el rail.
- **Sin** tablas, migraciones, pedidos de red, dependencias nuevas ni cambios de permisos. `/congreso` y `/tribus` siguen públicas.
- **Revisión de arquitectura:** toca permisos de venta y la regla legal. La corre el script de Gus en un paso aparte; este cambio no se aprueba sin ese veredicto.
- **Depende de:** nada. `loteo-norte-7a` se apila sobre este cambio en el mismo carril.
- **Se pisa con:** `idioma-legal` (0/8) en `terminos.ts` y `tribu-quienes-somos` en navegación: conviene no correrlos la misma noche.
