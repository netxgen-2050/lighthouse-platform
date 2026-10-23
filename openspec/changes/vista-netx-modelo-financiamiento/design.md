# Design

## Contexto

- Segundo cambio del pedido de Gus del 23-oct-2026. El primero (`vista-netx-financiamiento`) deja: `app/netx/layout.tsx` con `PESTANAS_NETX`, el Resumen, `lib/financiamiento/` (`fuentes`, `plataforma`, `pista`, `riesgo`, `resumen`, `usdMillones`), `components/barras-reparto.tsx`, el término `ordenanza173` y ADR-014. A través de él: `lib/series/` (`correrSerie`, `porMil`, `convertirSafu`, `formato`, `VERSION_MODELO`) y los términos ⚖ del diseño B.
- **Orden de archivo:** este cambio modifica requisitos que crea el cambio 1; se archiva **después** de `fogon-simulador-parametros` y de `vista-netx-financiamiento` (si no, `openspec archive` lo rechaza).
- Fuentes (NS_Tokenomics, `main`, leídas el 23-oct-2026), copiadas acá para que el implementador no las abra: doc 28 §1–§5 y §7, doc 29 §5, doc 30 §1–§3, `RESULTS_series_waterfall.md` (recorridos), `RESULTS_series_montecarlo.md`.

## Objetivos / No objetivos

- Objetivo: la pestaña de detalle, con cada texto y número trazable a su fuente y los supuestos sin confirmar en un solo lugar.
- No objetivo: modelos nuevos, cambiar números de NS_Tokenomics, cambiar el Resumen más allá de un enlace.

## 1. Archivos

```
lib/financiamiento/
  recorridos.ts     valorFuturo(), caminoDelVino()
  relato.ts         ETAPAS, BOLSILLOS, CASCADA, SERIES_POSIBLES, ESCALERA_SAFU, INSTRUMENTOS, LOTES_VS_MODELO, HALLAZGOS_RIESGO, SUPUESTOS_A_CONFIRMAR
  *.test.ts
components/rangos.tsx (+ test)
app/netx/financiamiento/page.tsx (+ piezas si el archivo pasa de ~250 líneas)
```

Cada ítem de `relato.ts` lleva `fuente: string` ("NS_Tokenomics doc 30 §2"). Los montos no se escriben en `relato.ts`: se toman de `lib/financiamiento` y `lib/series` en la página, para que haya una sola copia de cada número.

## 2. Funciones nuevas (`recorridos.ts`)

- `valorFuturo(monto, retorno, anios)` = `monto × (1 + retorno)^anios`; `null` si algún argumento es `null` o no finito, o `retorno ≤ −1`. Referencia (`RESULTS_series_waterfall.md`, "Journey"): 10.000 → 13.439 · 17.908 · 23.674; 30.000 → 40.317 · 53.725 · 71.021 (3 · 6 · 9 %, 10 años).
- `RETORNO_SERIE_MADRE = { valores: [0.03, 0.06, 0.09], fuente: "doc 28 §7 (parámetro, mezcla de las series)", aConfirmar: "Vagner" }`.
- `caminoDelVino(flujosPorMil, precioBotella)`: `flujosPorMil` = flujos de `porMil` para el viñedo (año 0 negativo). Botellas = suma de los flujos de los años 1 a H−1 / precio; plata del año H = flujo del año H. `null` si el precio ≤ 0 o no finito. Con la partida: 1.812,8 / 6 = 302,1 → "unas 302 botellas"; año 15 = 850. Precio minorista de referencia (USD 14) **no** se usa: es un dato de doc 28 sin fuente de mercado; queda fuera para no sumar un número más.

## 3. Relato (`relato.ts`)

### 3.1 Etapas (doc 30 §2)
| Etapa | Cuándo | Qué entra | Tamaño | Depende de |
|---|---|---|---|---|
| Semilla | Ahora a marzo 2027 | SAFE en el holding nuevo (tickets de USD 5.000) | `META_SAFE_USD` | Holding nuevo fuera de Próspera; abogado; presentación |
| | | Círculo Fundador (SAFE + Pase, USD 2.000 a 5.000) | "decenas de miles" (texto de la fuente, sin número) | Doc 15 |
| | | Contrato de diseño regional con BioPueblo (agua, suelo y plan maestro) | sin dato (a cotizar) | Que los dueños de BioPueblo digan que sí |
| | | Subsidios para la plataforma | chicos e inciertos | Postulaciones |
| Construir | 2027–2028 | Comisión de desarrollo por serie | 3 a 5 % del capex, una vez (agrovoltaica: `comisionDesarrollo`) | Series levantadas |
| | | Comisión de gestión por serie | `gestionAnual` viñedo y agrovoltaica | Series funcionando |
| | | Comisiones de plataforma (fijas) | chicas, recurrentes (sin dato) | Plataforma en uso |
| | | Contratos de operación (por ejemplo, el vivero) | margen del servicio (sin dato) | Series que contraten a NetX |
| Escalar | 2028 en adelante | Gestión de la Serie Madre | crece con los activos (sin dato) | Programa CNV, tokenización |
| | | Licencias del kit a otros lotes y nodos | por nodo (sin dato) | Replicación |
| | | Valor de la empresa | sin dato | Todo lo anterior |

### 3.2 Bolsillos (doc 30 §1)
| Bolsillo | Qué es | Su plata | ¿NetX puede tomar de ahí? |
|---|---|---|---|
| NetX Gen (holding + SAS) | La empresa | SAFE, comisiones, contratos, licencias | — (es NetX) |
| Fundación (procomún) | En el diseño B, dueña de la tierra (todavía no existe); Fondo del Procomún | Canon, regalía, excedente, subsidios, RAIZ | No: nunca un porcentaje; solo una tarifa fija y pública si contrata la plataforma |
| Series (proyectos) | El fideicomiso de cada proyecto | Plata de inversores e ingresos del proyecto | Solo las comisiones del contrato del fideicomiso, aprobadas por sus inversores |
| BioPueblo | Dueña de las otras ~9.000 ha | Sus ventas de lotes | Solo por contratos (diseño, regeneración); nunca comisión por venta sin matrícula de corredor |

### 3.3 Cascada (doc 28 §1)
1. Costos de operación · 2. Fundación: canon y regalía (antes que cualquier inversor) · 3. Comisión de gestión de NetX · 4. Notas Verdes: interés y capital · 5. Unidades de Regeneración: hasta el tope · 6. Primera pérdida: hasta su meta · 7. Excedente sobre los topes: 80 % procomún · 20 % Unidades. Debajo: "No todas las series tienen las tres clases: un viñedo joven no puede cargar deuda; un parque solar con contrato de energía puede ser 60 % deuda."

### 3.4 Series posibles (doc 28 §2)
S0 Hectárea piloto, vivero y cursos · S1 Centro de materia orgánica (biochar, compost, captura de carbono) · S2 Agrovoltaica (energía con contrato) · S3 Viñedo y frutales · S4 Hospitalidad · S5 Vivienda (después de la aprobación) · Serie Madre (invierte en todas). `conModelo: true` solo S2 y S3 ("Viñedo · 10 ha" y "Agrovoltaica · 5 MW", enlazan al Simulador); el resto "sin modelo todavía".

### 3.5 Escalera del SAFU e instrumentos (doc 28 §3)
Escalera: "Hoy · SAFU de Regeneración (colocación privada o plataforma de financiamiento colectivo)" → "2027 · primer cierre de la Serie Madre: el SAFU convierte con descuento" → "2027–2028 · la Serie Madre invierte en S0, S1, S2, S3…" → "2028+ · Unidades de la Serie Madre tokenizadas en rieles regulados por la CNV (mercado secundario = liquidez)". Al lado: "Membresía RAIZ: rendimiento en especie (estadías, vino, cursos)" con la marca "fecha a re-anclar: suponía el encuentro de febrero 2027 (I-15)", y "SAFE de NetX: participación en la empresa, sin rendimiento".

Instrumentos (columnas Instrumento · Quién lo emite · Para quién · Qué recibís · Forma legal "a verificar con abogado"):
- SAFU de Regeneración · Serie 0 · primeros creyentes, USD 1.000 a 50.000 · convierte en Unidades de la Serie Madre con descuento (20 %); si la Serie Madre no abre a tiempo, en Unidades de la Serie 0 · colocación privada (~35 por emisión, hasta 15 no calificados) o plataforma de financiamiento colectivo registrada en la CNV.
- SAFE de NetX · holding de NetX · inversores de riesgo · participación en la empresa (comisiones, licencias) · colocación privada.
- Membresía RAIZ · Fundación · cualquiera · estadías, productos, voz; rendimiento en especie · membresía y contrato de servicios.
- Unidades de una serie · cada serie · inversores de impacto · rendimiento con tope de un proyecto · privada, después oferta pública CNV.
- Unidades de la Serie Madre → tokens · Serie Madre · cualquiera con KYC · una parte de todos los proyectos, después negociable · oferta pública CNV + tokenización (rieles PSAV).

Debajo, la frase de `convertirSafu(1000, 0.2)` ya existente.

### 3.6 Hallazgos del riesgo (doc 29 §5)
1. "El lugar de la primera pérdida está mal: detrás de Unidades con tope, la plata catalítica se recupera completa solo en los buenos futuros (no se recupera en 60 % · 61 %). Próximo modelo: retorno preferente para las Unidades, después la primera pérdida, después el tope."
2. "El procomún gana mucho en los buenos futuros (su P90 es 8 a 11 veces su P50). Es el propósito, pero hay que afinar el tope y el reparto del excedente con inversores reales."
3. "Las demoras y las heladas mandan las pérdidas. Respuestas a modelar: la Serie Madre repartida entre motores cuyos riesgos no se mueven juntos, un seguro o reserva contra heladas, y abrir series solo con los permisos dados."
Los porcentajes del 1 se toman de `MONTE_CARLO`, no se escriben en el texto.

### 3.7 Vender lotes o este modelo (doc 30 §3)
| | Vender lotes ahora | Lo que proponemos |
|---|---|---|
| Ley | Prohibido antes de la aprobación municipal: ni venta, ni reserva, ni prioridad (Ordenanza 173 ⚖) | Nada a la venta antes de la aprobación; la plata viene de inversores y contratos |
| Diseño B | La tierra del Lighthouse va a la Fundación: no hay lotes para vender en las ~1.000 ha | Viviendas más adelante en derecho de superficie (entrada + canon anual), después de la aprobación |
| Tierra y agua | Lotes dibujados antes de leer el agua: algunos sin agua, otros se inundan; quien compra lo descubre y el valor cae | Primero el diseño (agua, suelo, accesos), después la venta |
| Comisión | NetX no puede cobrar comisión por venta sin matrícula de corredor | NetX cobra por diseño y regeneración, no por venta |
| Quién vende | — | BioPueblo vende sus propios lotes en sus otras ~9.000 ha, ya diseñados y aprobados; una contribución por lote va a la Fundación |

Debajo, la propuesta (doc 30 §3, "the pitch"): "La forma más rápida de vender más y mejor es diseñar la tierra primero. NetX y su socio de permacultura hacen ese diseño, cobrado ahora. BioPueblo vende después, con agua, árboles y una comunidad que se puede visitar, y cada venta financia el procomún que hace más fácil la venta siguiente." Marcar "a verificar con abogado" en Ley y Comisión.

### 3.8 Supuestos a confirmar
`SUPUESTOS_A_CONFIRMAR: { etiqueta, valor: string | "sin dato", quien, fuente }[]`, agrupados por `quien`:
- **Vagner:** consumo USD 31.000 por mes (de los cuales ~USD 10.000 "otros" sin desglosar); meta del SAFE USD 375.000 a 500.000 (hay cuatro valuaciones en circulación, doc 30 §4); comisión de gestión 1 a 1,5 % anual; comisión de desarrollo 3 a 5 % del capex; múltiplo de salida 6 veces (viñedo) · 3 veces (agrovoltaica); estructura de capital de la agrovoltaica 60 % Notas al 7 % · 10 % primera pérdida · 30 % Unidades; retorno neto de la Serie Madre 3 · 6 · 9 %; supuestos de incertidumbre del Monte Carlo; re-correr membresías y Pase sin el Congreso (I-15).
- **Martín y Franz (después de la aprobación):** entrada y canon anual de la vivienda: sin dato.
- **Abogado:** si un fideicomiso privado puede emitir un SAFU convertible en Unidades de otra serie; distribuciones en especie; usar Unidades para pagar una vivienda sin que sea una reserva prohibida; si la Serie Madre puede tener Unidades de otras series (doc 28 §8).
- **Enólogo local:** rendimiento 7 t/ha, USD 6 neto por botella. **Desarrollador y red:** USD 800.000 por MW, USD 60 por MWh.
- **BioPueblo:** el contrato de diseño regional (sin dato, a cotizar).
Los valores numéricos se arman desde las constantes existentes (`fuentes.ts`, `escenarios.ts`) cuando existen; el texto queda solo para lo que no es número.

## 4. Gráfico `Rangos`

- Props: `titulo`, `filas: { id, etiqueta, p10, p50, p90: number | null }[]`, `formato`.
- Por fila: texto "Viñedo · P10 −2,6 % · P50 8,4 % · P90 10,8 %" y un SVG `aria-hidden` (`viewBox="0 0 100 6"`): línea de fondo `stroke-line`, segmento P10–P90 `stroke-deep`, marca P50 (`circle` `fill-gold` con borde `stroke-ink`) y una línea de 0 % punteada `stroke-faint`. Escala común a todas las filas: de `min(0, min P10)` a `max P90`, con un margen de 5 %.
- Fila con algún `null`: texto "sin dato", sin dibujo.
- "Ver como tabla": columnas Serie · P10 · P50 · P90.

## 5. Página

- `PESTANAS_NETX` suma `{ href: "/netx/financiamiento", etiqueta: "Modelo de financiamiento" }` en segundo lugar. El Resumen suma `Link` "Ver el modelo completo" debajo de la respuesta corta.
- h1 "Modelo de financiamiento", rótulo "Vista NetX · para Franz y Vagner", aviso `avisosimulador`.
- Ocho `section` con `aria-labelledby` y `h2`: "La plata entra por etapas", "Quién es quién con la plata", "Cómo paga una serie", "Dinero temprano", "Recorridos de inversores", "¿Y si sale mal?", "Vender lotes o este modelo", "Supuestos a confirmar". Al principio, un índice con enlaces de ancla a cada `h2` (útil para saltar en la reunión).
- Tablas con `caption`, `th scope`, dentro de `div.overflow-x-auto`. Recorrido B: tabla año por año plegada en `details`.
- Términos ⚖: Serie Madre (`seriemadre`, nuevo), Fundación (`fundaciontierra`, nuevo), SAFU, Unidades, Notas Verdes, primera pérdida, serie, SAFE, Ordenanza 173.
- Fuentes al pie desde `VERSIONES` y `VERSION_MODELO` + "NS_Tokenomics doc 28 y 29 (v0.1, 17-oct-2026)".

## 6. Catálogo legal (borrador, "Texto nuevo, no viene del mock-up")

- `seriemadre` · "Serie Madre": "Una serie que no tiene un proyecto propio: invierte en todas las demás. Quien entra ahí tiene un pedacito de todos los proyectos, con menos riesgo que en uno solo. Es donde terminan el SAFU y, más adelante, los tokens."
- `fundaciontierra` · "Fundación de la tierra": "En el diseño B, la entidad que queda como dueña de la tierra del Lighthouse. Todavía no existe: se crea si se acepta el diseño y el dueño actual le pasa la tierra. Su estatuto le prohibiría venderla, hipotecarla o darla en garantía (cómo hacer que eso valga frente a terceros está a verificar con abogado). Cobra un canon y una regalía de cada serie antes que cualquier inversor y con eso paga el procomún. NetX no puede tomar un porcentaje de su plata." <!-- arquitecto: la Fundación es propuesta (doc 25, doc 27); doc 17 y doc 06 L40 marcan que la prohibición de vender/hipotecar hay que hacerla oponible [verify] -->


## 7. Tolerancias

`valorFuturo` ±1 USD; `caminoDelVino` botellas exactas tras redondear, plata ±1 USD; tablas del relato: tests de forma (cada ítem con fuente; las etapas son tres en orden; la cascada tiene siete pasos en orden; sin "reservá" ni "reservar tu" en ningún texto; la vivienda es "sin dato").

## Riesgos / trade-offs

- **Mucho texto en una pestaña.** Mitigación: índice con anclas, una idea por sección, tablas plegadas donde hay detalle.
- **Textos traducidos de docs en inglés con peso legal.** Mitigación: lo legal va con ⚖ y "a verificar con abogado"; los términos nuevos son borrador.
- **Hallazgos que debilitan el relato** (primera pérdida, dependencia del SAFE). Mitigación: se muestran igual; son parte de lo que convence a un director financiero (que el modelo sabe dónde falla) y vienen con su respuesta propuesta.
- **Números del Congreso cancelado** (RAIZ en febrero, membresías, Pase). Mitigación: marca visible; re-correrlos es de NS_Tokenomics.
