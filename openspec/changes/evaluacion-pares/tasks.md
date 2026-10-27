# Tasks

Dos noches como máximo. La **noche 1** cierra los grupos 1 a 3 (todo en `lib/`, la app no cambia y queda en verde). La **noche 2** cierra los grupos 4 a 6 (pantalla, textos y e2e). Cada grupo deja `pnpm verificar` en verde.

## 1. Cálculo de `f_eval` (noche 1)

- [ ] 1.1 Crear `lib/evaluacion/tipos.ts` y `lib/evaluacion/parametros.ts` con `PARAMETROS_DE_PARTIDA`, `FUERZAS` y `VERSION_EVALUACION = 1` (design §1; <!-- arquitecto: ADR-018 --> ADR-018), con el comentario de que se calibran con simulación (K11). Verifica: `pnpm verificar` (tipos) en verde.
- [ ] 1.2 Implementar en `lib/evaluacion/calculo.ts` `mediana`, `mediaRecortada` y `redondearFactor`. Verifica: tests en `lib/evaluacion/evaluacion.test.ts` para mediana par e impar, media recortada de 1, 4, 4, 4, 5 → 4 (con r = 1) y `redondearFactor(1.025) === 1.03`.
- [ ] 1.3 Implementar `calcularFactorEvaluacion` en el orden de design §2 (validar → reciprocidad → mínimo → tope → agregado → combinar). Verifica: un test por escenario de la spec: tres estrellas = 1,00; extremos 1,20 y 0,80; fuerza 0; fuerza fuera de rango acotada; autoevaluación; fuera del equipo; sin motivo; nota inválida (0, 6, 3,5); dos evaluadores → 1,00; el descuento deja menos de 3 → dimensión neutra; mínimo 4 con 3 evaluadores → 1,00.
- [ ] 1.4 Tests de colusión. Verifica: (a) pareja recíproca que se infla (5 contra mediana 3) → no cuenta y suma un descarte "reciprocidad"; (b) pareja que coincide con el resto → cuenta; (c) nota alta sin reciprocidad → se acota a mediana + 1; (d) anillo de dos en un equipo de 6 (5 entre sí, 3 del resto) → ambos con `f_eval` 1,00 a fuerza 0,2; (e) anillo de tres que se pone 5 entre sí en un equipo de 7 con el resto en 3 → los tres quedan en 1,00.
- [ ] 1.5 Test de la propiedad del tope: para al menos cinco conjuntos fijos de notas (con mediana y con media recortada), reemplazar la nota de cada evaluador por la mediana de los demás cambia el agregado como mucho en `topePorEvaluador`. Incluir un equipo polarizado (1, 1, 5, 5 y una quinta nota) y uno con todas iguales salvo una. <!-- arquitecto: la cota no está demostrada; ver design §2 "Ojo" --> Si un conjunto rompe la cota, no cambiar el algoritmo: dejarlo como `it.fails` y reportarlo en el PR. Verifica: el test pasa.
- [ ] 1.6 Test de privacidad del resultado: `JSON.stringify(resultado)` no contiene ningún id de evaluador, y `motivos` va vacío cuando alguna dimensión tiene menos de 3 evaluadores. Verifica: el test pasa.

## 2. Datos de ejemplo y constancias (noche 1)

- [ ] 2.1 Crear `lib/evaluacion/ejemplo.ts` con el equipo y las evaluaciones de design §4 (motivos en es y en, sin autor visible y <!-- arquitecto: si no, el test de privacidad da falsos positivos --> sin ningún id del equipo como parte del texto, por ejemplo "tomas") y una función que sume las notas enviadas por la persona a `martina` y `joaquin`. Verifica: test con la ronda enviada → `f_eval` 1,05, `rol` 3 (3 evaluadores), `cultura` 4 (4 evaluadores), 2 descartes "fuera del equipo", 1 "reciprocidad"; con fuerza 0,1 → 1,03.
- [ ] 2.2 Implementar `lib/evaluacion/constancias.ts` (design §5). Verifica: tests: con 10 h y `f_eval` 1,05 la base tiene 50 Semillas y el ajuste 53 con `apunta_a` igual al `uid` de la base; `afirma` es `"netx"` en las dos; cambiar la fuerza no cambia la base; la salida es idéntica en dos llamadas (determinista).
  <!-- arquitecto: ADR-012 "nunca se edita" + ADR-018 parámetros congelados -->
  Además: con otra fuerza el ajuste tiene **otro** `uid` y la misma `apunta_a`; `datos` del ajuste trae `version_evaluacion` y los parámetros usados (incluida la fuerza); `JSON.stringify` de las dos constancias no contiene ningún id de evaluador ni motivo; las Semillas base salen de la misma función mensual que usa el panel (sin × `MESES`).

## 3. Guía por nivel de estrellas (noche 1)

- [ ] 3.1 Crear `lib/evaluacion/guia.ts` con un texto por nivel (1 a 5) de `rol` y de `cultura`, en es y en (inglés como borrador, registrado en `lib/idioma/revision-nativa.ts` como el resto). El nivel 3 dice que cumple lo acordado. Verifica: test que comprueba 5 niveles × 2 dimensiones × 2 idiomas, sin textos vacíos, y que `pnpm verificar` (incluidos los tests de diccionarios) queda en verde.

## 4. Pantalla `/semillas` (noche 2)

- [ ] 4.1 Mostrar la guía del nivel elegido debajo de cada grupo de botones, asociada con `aria-describedby`, y un `<details>` "Ver la guía de los 5 niveles". Verifica: e2e en `e2e/semillas.spec.ts`: elegir 3 en "Rol, Martina" muestra la guía del nivel 3 y el botón la tiene en su descripción accesible.
- [ ] 4.2 Reemplazar el factor fijo por la sección "Tu resultado de esta ronda (ejemplo)" calculada con `lib/evaluacion` (antes de enviar: "el ajuste se calcula al cerrar la ronda", sin número). Verifica: e2e: ronda abierta sin número; al enviar, `data-testid="factor"` dice "1,05", se ven "Rol" 3 y "Aporte al grupo" 4 con su cantidad de evaluadores y los descartes por motivo en texto.
- [ ] 4.3 Selector "Fuerza del ajuste de esta comunidad" (0 · 0,05 · 0,1 · 0,15 · 0,2; parte en 0,2) con el aviso de que en una comunidad real lo decide la comunidad; no se guarda. Verifica: e2e: elegir 0,1 muestra 1,03 y el rango "0,90–1,10"; al recargar vuelve a 0,2.
- [ ] 4.4 "Cómo te reconocieron" con notas agregadas y motivos sin autor (solo con 3 evaluadores o más); quitar `de` de los datos de ejemplo de `lib/semillas/datos.ts`. Verifica: e2e: la región no contiene "De Martina", "Martina" ni "Joaquín".
- [ ] 4.5 Bloque "Tus Semillas como constancias (ejemplo)" con la base y el ajuste (id, qué apunta a qué, factor, Semillas) y "sin dato" sin pacto aceptado; <!-- arquitecto: el panel muestra 3 meses --> aclara que es **por ronda (un mes)** y que con otra fuerza esa constancia de ajuste se revoca y se emite otra que apunta a la misma base. Verifica: e2e con un pacto de 10 h: base 50, ajuste 53 que dice que apunta a la base; sin pacto: "sin dato".
- [ ] 4.6 Dejar de usar `FACTOR_EVALUACION` en la ronda (el panel sigue con factor 1,0 y lo dice). Verifica: el total del panel no cambia en los e2e existentes de `e2e/semillas.spec.ts`.

## 5. Textos, idioma y ⚖ (noche 2)

- [ ] 5.1 Textos nuevos en `lib/idioma/textos/semillas.ts` (es y en), reemplazando `factorFijo` y `pie`; números con `formatearNumero`/`LOCALES`. Verifica: e2e de `e2e/idioma-pasaporte-semillas-pactos.spec.ts` en inglés muestra "1.05" y los títulos en inglés; `pnpm verificar` en verde.
- [ ] 5.2 Agregar `evaluacionPares` y `constanciaSemillas` a `lib/legal/terminos.ts` con `borrador: true` y versión `en`, y mostrarlos con `TerminoLegal` en la ronda y en el bloque de constancias. Verifica: `lib/legal/terminos.test.ts` los lista como borrador; e2e abre los dos ⚖ con teclado.

## 6. Integración (noche 2)

- [ ] 6.1 Actualizar los e2e que esperaban "1,0" y "De Martina" (`e2e/semillas.spec.ts`, `e2e/idioma-pasaporte-semillas-pactos.spec.ts`) y revisar `e2e/bandeja.spec.ts` (la ronda sigue registrando el evento). Verifica: `pnpm test:e2e` en verde.
- [ ] 6.2 Auditoría de accesibilidad de `/semillas` con la ronda enviada (axe) y prueba de teclado de punta a punta (puntuar, enviar, cambiar la fuerza, abrir los ⚖). Verifica: `e2e/accesibilidad.spec.ts` en verde; nada se comunica solo con color.
- [ ] 6.3 `pnpm verificar` y `pnpm build` en verde antes del PR.
