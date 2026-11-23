# Design

## Contexto

Hoy `lib/bien-comun/modelo.ts` mezcla tres cosas: valores de FARO del modelo viejo (suministro, reparto, tramos, staking), helpers que usan otras pantallas (`faroDeLote`, `loteTraeFaro`, `centroDeAnillo`, usados por la ficha, el boleto y la vista de lotes del territorio) y la cotización por tramos. La página `app/bien-comun/page.tsx` escribe las clases de Tailwind dentro de un archivo largo. Esta semana se rediseña toda la UI: la página nueva tiene que poder repintarse sin tocar el modelo ni los textos.

## Decisiones

### 1. Un solo módulo, con fuente por valor

`lib/bien-comun/modelo.ts` queda así (nombres orientativos):

- `VERSION_PROPUESTA = { version: "v0.1", fecha: "2026-11-19", fuente: "NS_Tokenomics doc 34" }`.
- `NOMBRE_TOKEN = "FARO"` (provisorio; decisión 6 abierta).
- `FARO_POR_M2 = { valor: 10, fuente: "slides del 9-nov, láminas 8 a 14 (doc 34 §3)" }`. Se mantienen `faroDeLote`, `loteTraeFaro` y `centroDeAnillo` con la misma firma (otras pantallas dependen de ellos).
- Estructura de la propuesta, **sin textos** (los textos van al diccionario, con la misma clave):
  - `CARRILES`: `a` (nodos `tokenTierra`, `tokenInversor`, `fideicomiso`) y `b` (nodos `tesoro`, `faro`).
  - `PUENTES`: `parteDeCadaPago`, `faroPorCuota`, `reventa`, cada uno con `desde`, `hacia` y, si tiene, el valor que usa (`parteDeCadaPago` lee `MODELO_LOTES.aporteUnico` de `lib/lotes/modelo.ts`: 5 %, no se copia).
  - `PUERTAS`: `conElLote`, `aportando`, `prepagando`.
  - `QUE_DA`: `voz`, `noches`, `huertaYCocina`, `talleres`, `expensas`. `QUE_NO_TIENE`: `exchange`, `liquidez`, `recompra`, `respaldoTierra`, `premioPorBloquear`.
  - `POLITICA`: `emision`, `quema`, `bloqueo`, `transferencia`, `reserva`, `voz`, cada una con `fuente` (la columna "De dónde viene" del doc 34 §3). La revisión de la transferencia a los 12 meses va como valor (`revisionMeses: 12`).
  - `DECISIONES`: las 8 del doc 34 §7, cada una `{ id, estado: "abierta" | "decidida", decidida?: { fecha, quien } }`. **Cuando Juanpi y Franz decidan, se cambia solo ese objeto** (y el texto de la decisión tomada en el diccionario). Hoy las 8 están `"abierta"`.
  - `CAMBIOS_DESDE_V_ANTERIOR`: `tramos`, `staking`, `reservaTierra`, `repartoFijo`, con la fecha del modelo anterior (`2026-11-08`).
- Sale: `SUMINISTRO`, `REPARTO`, `faroDeGrupo`, `reparto`, `TRAMOS`, `AVANCE_DE_EJEMPLO`, `MONTO_MINIMO_USD`, `cotizar`, `disponiblePorTramo`, `totalPorTramo`, `LIBERACION_NETXGEN`, `STAKING`, `APORTE_DE_ENTRADA`.

El cambio 2 agrega a este mismo módulo los parámetros del barrio; el cálculo vive aparte (`lib/bien-comun/barrio.ts`).

### 2. Textos en el diccionario, presentación en componentes chicos

- `lib/idioma/textos/bien-comun.ts` se reescribe con claves que espejan las del módulo (`carriles.a.tokenTierra`, `puertas.aportando`, `politica.quema`, `decisiones.d1.pregunta` / `.recomendacion`, etc.). Ningún número escrito: llegan por parámetro.
- Componentes en `components/bien-comun/`, cada uno recibe datos y textos por props y no importa el modelo: `SelloPropuesta`, `DiagramaCarriles`, `ListaPuertas`, `TarjetasPolitica`, `TablaDecisiones`, `ListaCambios`. La página arma las props. Solo tokens del tema; las clases repetidas en un único lugar del componente.
- El diagrama es HTML: dos `section` (carril A, carril B) con sus nodos en listas, y los tres puentes como una lista ordenada entre ambos, cada puente con "de → a" dicho en texto. Las flechas son decorativas (`aria-hidden`). En pantallas angostas se apila en vertical; a 390 px no hay scroll horizontal. Así un lector de pantalla lo recorre en orden y se entiende sin el dibujo.

### 3. El sello

Es el primer contenido después del `<h1>`, antes de cualquier número. **No es `sticky`**: un elemento pegado arriba puede tapar el foco del teclado (WCAG 2.4.11). "Fijo" se interpreta como "siempre primero y siempre presente". Lleva el estado sin depender del color (texto completo).

### 4. "Retorno" solo en el carril A

`lib/lotes/sin-numeros-escritos.test.ts` hoy prohíbe "retorno" en todo lo del bien común. La propuesta necesita decir "capital con retorno" para el carril A. La regla pasa a ser: el diccionario `bien-comun.ts` no puede tener "ganancia", "retorno", "valorización", "profit", "return" ni "appreciation" **fuera** de los subárboles `carriles.a` (y, en el cambio 2, `barrio`); los ⚖ `tokenbiencomun` y `tesorocomun` tampoco. Los archivos de `app/bien-comun/` y `components/bien-comun/` no escriben esas palabras (sus textos vienen del diccionario). Se suma "precio de FARO" / "FARO price" a lo prohibido.

### 5. ⚖ que se retiran

`ventatramos`, `stakingbiencomun` y `partenetxgen` se borran del catálogo y de sus tests. Ningún otro archivo los usa (verificado con `grep` el 23-nov: solo `app/bien-comun/page.tsx` y los tests). `tokenbiencomun` se reescribe: membresía del común, emisión solo por las tres puertas, sin precio, sin mercado, sin respaldo en la tierra, que en la versión 1 solo viaja con el lote, propuesta v0.1, a verificar con abogado.

<!-- arquitecto: §5 bis agregado por la revisión de arquitectura del 23-nov (ADR-031). -->
### 5 bis. FARO no tiene efectos en la plataforma (ADR-031)

El doc 34 llama a FARO "membresía que crece" y le da voz sobre el tesoro; la plataforma dice que ser miembro del común sale de adherir al manifiesto (ADR-025) y que la adhesión es la llave de la gobernanza (ADR-023). Para no tener dos verdades:

- `tokenbiencomun` y los textos de "qué da" / "voz" dicen que es **lo que propone** la v0.1, y suman una línea: "Hoy, en la plataforma, ser parte del común sale de adherir al manifiesto; FARO no cambia eso." No dicen, como hecho, "FARO es la membresía del común".
- Ningún helper nuevo de `lib/bien-comun/` devuelve membresía, voto, nivel ni rol. `faroDeLote` y los demás siguen siendo números para mostrar.
- `DECISIONES` pasa a `"decidida"` solo con `fecha` y `quien`, en un cambio OpenSpec aprobado por Gus (ADR-031, regla 2).

### 6. Nota de archivo

`bien-comun-tokens` está implementado pero no archivado. Al archivar, primero `bien-comun-tokens`, después este; y en `openspec/specs/bien-comun-tokens/spec.md` se quitan los requisitos que este reemplaza (tramos, staking, reparto). Se deja escrito porque el delta de este cambio no puede marcar como `REMOVED` requisitos de una spec que todavía no existe en `openspec/specs/`.

## Riesgos

- Que la página parezca el modelo decidido. Mitigación: el sello, el estado "abierta" en cada decisión y la línea "nada de esto está acordado" en la frase.
- Que el rediseño visual rompa la lógica. Mitigación: componentes sin acceso al modelo, test del módulo independiente de la UI.
- Textos legales nuevos: todos con `borrador: true`.
