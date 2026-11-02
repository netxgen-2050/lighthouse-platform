# Proposal

## Why

El Resumen (cambio `vista-netx-financiamiento`) responde en una pantalla de dónde sale la plata sin vender lotes. En una reunión, el equipo (Franz y Vagner primero) va a preguntar **cómo**: en qué orden cobra cada uno dentro de una serie, cuándo entra cada peso a NetX, cómo puede invertir alguien hoy si las series todavía no existen, qué pasa si sale mal y por qué el Juego A (vender lotes) no es el atajo. Este es el **segundo cambio de dos** (pedido de Gus, 23-oct-2026): la pestaña **"Modelo de financiamiento"** con ese detalle, sus rangos de riesgo y todos los supuestos que hay que confirmar con Vagner, a la vista.

El 26-oct Gus respondió las preguntas del PR #108: el relato habla de **Juego A** y **Juego B** en lugar de "diseño B", la vista se abre entera a toda persona con sesión (las operaciones del super admin se van a una página propia, `/admin`: opción B, cambio 1) y los textos con peso legal (SAFU, oferta privada, tokenización CNV) alcanzan con ⚖ y "a verificar con abogado".

## What Changes

- **Pestaña nueva** "Modelo de financiamiento" en `/netx/financiamiento`, segunda en la navegación (Resumen · Modelo de financiamiento · Simulador · Comunidad y embudo, iguales para todos), visible para **toda persona con sesión** (hereda la capacidad `vista-netx` del cambio 1). El Resumen suma un enlace "Ver el modelo completo".
- **Contenido**, en este orden (fuentes: NS_Tokenomics doc 28, 29 y 30, v0.1 del 17-oct-2026):
  1. **La plata entra por etapas** (doc 30 §2): Semilla (ahora a marzo 2027), Construir (2027–2028) y Escalar (2028+), con qué entra, de qué tamaño y de qué depende. Lo que no tiene número dice "sin dato".
  2. **Quién es quién con la plata** (doc 30 §1): NetX, Fundación, series y BioPueblo, qué plata tiene cada uno y si NetX puede tomar de ahí.
  3. **Cómo paga una serie** (doc 28 §1–§2): el orden de la cascada en una lista numerada (costos → Fundación → comisión de NetX → Notas Verdes → Unidades hasta el tope → primera pérdida → excedente 80 % procomún · 20 % Unidades) y las series posibles (S0 a S5 y la Serie Madre), con cuáles tienen modelo (viñedo, agrovoltaica) y cuáles todavía no (biochar y el resto: "sin modelo todavía").
  4. **Dinero temprano** (doc 28 §3): la escalera SAFU → primer cierre de la Serie Madre (con descuento) → inversión en series → Unidades en rieles regulados, la tabla de instrumentos (SAFU, SAFE de NetX, membresía RAIZ, Unidades de serie, Unidades de la Serie Madre) con su forma legal "a verificar con abogado" y ⚖, y "USD 1.000 en SAFU se convierten en USD 1.250 de Unidades de la Serie Madre" (cálculo de la plataforma ya existente).
  5. **Recorridos de inversores** (doc 28 §4–§5): A · "invierto hoy y en 10 años vivo acá" (USD 10.000 a 3 · 6 · 9 % → USD 13.439 · 17.908 · 23.674; entrada a la vivienda "sin dato"; sin prioridad ni reserva antes de la aprobación) y B · "USD 1.000 en el vino" (flujos año por año, USD 2.663 y 9,2 %; camino del vino: unas 302 botellas más USD 850 el año 15).
  6. **¿Y si sale mal?** (doc 29 §5): la tabla completa del Monte Carlo (TIR de las Unidades, lo que recibe la Fundación y el múltiplo de la primera pérdida en P10 · P50 · P90; probabilidades de perder, de llegar al tope y de que la primera pérdida no se recupere), un gráfico de rangos con tabla equivalente, los supuestos de incertidumbre y **los tres hallazgos que cambian el diseño** (la primera pérdida no se recupera completa en ~60 % de los futuros; el procomún gana mucho en los buenos; demoras y heladas mandan el riesgo), sin esconder ninguno.
  7. **Juego A o Juego B** (doc 30 §3): tabla comparativa con columnas "Juego A · vender lotes ahora" y "Juego B · el procomún", y filas Ley (Ordenanza 173), La tierra, Ingresos, Tierra y agua, Comisión (sin matrícula de corredor) y Quién vende, más la propuesta para quien quiere vender: NetX diseña y regenera la tierra de BioPueblo, BioPueblo vende después y mejor, y una contribución por lote va al procomún. Mismo tono que el Resumen: el Juego A con respeto y con datos, el Juego B como una opción que suma; nadie nombrado.
  8. **Supuestos a confirmar**: una lista única, agrupada por quién confirma (Vagner, Martín y Franz, a verificar con abogado, enólogo o desarrollador, BioPueblo), con el valor de partida de cada uno o "sin dato".
- **Lenguaje:** "diseño B" no aparece en la pantalla salvo al citar doc 28 en las fuentes. La Fundación se nombra como "en el Juego B, la tierra queda en una Fundación (todavía no existe)".
- **Números**: dos funciones puras nuevas en `lib/financiamiento/` con tests contra `RESULTS_series_waterfall.md` (valor de la Serie Madre a 10 años; botellas del camino del vino); el resto sale de lo que ya existe (`lib/series`, `lib/financiamiento`). Los textos del relato viven como datos tipados con su fuente, no sueltos en el JSX.
- **Catálogo legal**: dos términos ⚖ nuevos en borrador: "Serie Madre" y "Fundación de la tierra", con "a verificar con abogado".

**Depende de** `vista-netx-financiamiento` (pestañas, capacidad `vista-netx`, `lib/financiamiento` con `juegos.ts`, `BarrasReparto`, ADR-014) y, a través de él, de `fogon-simulador-parametros` (`lib/series`, términos del diseño B, `convertirSafu`). Si cuando corra la noche `lib/financiamiento/resumen.ts` no está en `dev`, el implementador frena y reporta.

**Decidido por Gus (26-oct-2026):** los textos legales de esta pestaña (instrumentos, SAFU, oferta privada, tokenización CNV, Fundación) se redactan desde lo que sabemos, con ⚖ y "a verificar con abogado", en borrador; no hay presupuesto para consultoría legal. Es la excepción de prototipo interno a D9.

## Fuera de alcance

- Datos reales de la base, plata real, ofertas o botones de "invertir": nada capta plata.
- Editar o re-correr los modelos de NS_Tokenomics (por ejemplo, la cascada con retorno preferente que propone doc 29, o el modelo sin el Congreso, I-15): otro cambio cuando existan.
- Modelar series nuevas (biochar, hospitalidad, vivienda) o la cartera de la Serie Madre: no tienen modelo en NS_Tokenomics.
- Mover supuestos de riesgo en pantalla (ADR-014).
- La tokenomics anterior al diseño B (`RESULTS_value_model.md`).
- Las operaciones del super admin: viven en `/admin` (cambio 1, design §3); esta pestaña no las toca.
- Versión en inglés; imprimir o exportar la pestaña.

## Capabilities

### New Capabilities
<!-- ninguna: amplía las capacidades que crea vista-netx-financiamiento -->

### Modified Capabilities
- `vista-netx-financiamiento`: suma la pestaña "Modelo de financiamiento" y su contenido; la navegación pasa a cuatro pestañas.
- `modelo-financiamiento`: suma el valor de la Serie Madre a 10 años, las botellas del camino del vino y el catálogo de supuestos a confirmar.

## Impact

- Código nuevo: `app/netx/financiamiento/page.tsx` (y piezas), `lib/financiamiento/recorridos.ts`, `lib/financiamiento/relato.ts` (etapas, bolsillos, cascada, series, instrumentos, comparación entre juegos, supuestos), `components/rangos.tsx` (gráfico P10–P50–P90 con tabla), dos entradas en `lib/legal/terminos.ts`, `PESTANAS_NETX` con una pestaña más, un enlace en el Resumen.
- Tests: `lib/financiamiento/*.test.ts`, `components/rangos.test.tsx`, `e2e/netx-financiamiento.spec.ts`, una ruta más en `e2e/accesibilidad.spec.ts`, el orden de pestañas en `e2e/vista-netx.spec.ts`.
- Sin dependencias nuevas, sin base de datos, sin red, sin permisos nuevos (la capacidad `vista-netx` ya cubre `/netx/financiamiento`), sin datos personales.
