# Noche 2026-11-03 — sumarte-diseno-b
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/170 (base `agente/lote-ficha-y-compra`) · **Preview:** no hay (ver "Qué falló primero")

## Qué falló primero
- **No se pudo probar contra el preview de Vercel.** El secreto de Vercel venció y `scripts/preview-url.sh` no funciona. Todo se probó solo en local.
- **Por eso la tarea 5.3 quedó sin marcar.** Es la única de las 16 que falta.
- **Hay tests inestables.** En la última corrida completa falló uno (`pacto-puntual.spec.ts:385`). Otros dos (`configuracion.spec.ts:38` e `idioma.spec.ts:86`) fallaron antes. No son de este PR, pero conviene que los mires (ver abajo).
- **El guion manual de prueba (pasos 1 a 7 del PR) solo está cubierto por los tests automáticos.** Nadie lo recorrió a mano contra un preview.

## En una línea
`/sumarte` ahora dice lo mismo que el modelo vigente (Pase con influencia en el Fondo Común, sección "Comprar un lote", sección "Invertir" sin oferta). El código está listo y el tester dio PASA en local, pero faltan dos decisiones tuyas y una prueba contra el preview.

## Qué quedó hecho (tareas 15/16)
- Hechas de la 1.1 a la 5.2 (catálogo legal, textos, tarjeta del Pase, planes, adhesión, "Comprar un lote", "Invertir", tickets de la empresa, accesibilidad y chequeo de que no se tocó lo que debía quedar igual).
- **Sin marcar:** 5.3 (probar contra el preview de Vercel), por el secreto vencido.
- Lo que trae el PR, en corto:
  - Pase Fundador con influencia en el Fondo Común (conviction voting, "próximamente"), créditos que se liberan en 3 años y vencen a los 12 meses, la plata va al Fondo Común y no a NetX. Sin Ronda 0 ni Congreso.
  - Párrafo de adhesión con su ⚖ y enlace a `/tribus/lighthouse`. Elegir un plan no adhiere.
  - Sección nueva "Comprar un lote": precio mínimo leído de `lib/lotes/modelo.ts`, estado administrativo compacto, enlace a `/lotes`, sin botón de compra ni reserva (ADR-030).
  - Sección "Invertir": "Esto no es una oferta", dos tarjetas, sin medidores, cupos ni tickets de proyectos. La tarjeta de la empresa lee el rango de tickets desde `TICKETS_SAFE`.
  - Los ⚖ reescritos quedan como borrador.
- **Ajustes pedidos para el 3-nov** (el plano de Martín, PR #168: 21 lotes de 1.680 a 2.798 m²; las zonas "parcela" no son lotes): `precioLote` con 1.680/2.798, valores leídos del loteo y estados de ejemplo lote-5 y lote-18 reservados y lote-13 vendido ya venían en la base. No se tocaron `datos/planos/`, `loteo-norte.json` ni `importar-loteo.ts`. No se implementó `modelo-hibrido-procomun`.
- **Desvíos explicados en el PR:**
  - `/sumarte` no entra en `VISTAS_CON_LOTES`: usa la versión compacta del estado administrativo y el test viejo espera la región completa.
  - El pasaporte sigue diciendo "Voto en el Fideicomiso" porque `fogon-desde-mi-y-guardian` está congelado.
  - La ficha de Lighthouse VRN sigue con la aceptación simulada, y `guardianIA` nombra al Consejo de la Fundación.
  - Se reutilizó el ⚖ `influenciafondocomun`, que ya existía.
  - Un test viejo de guardián pasó a decir "Fundación de la tierra" (design §7).
  - Se actualizó `docs/idioma/revisar-nativo.md`.

## Qué decidir a la mañana
1. **Hallazgo media (revisor): cupos y descuento dentro de "Invertir".** La explicación del ⚖ "Círculo por invitación" dice "hasta 35 aportantes por emisión y 15 no calificados", y la del ⚖ SAFU dice "con un descuento". La spec prohíbe cupos o descuentos en esa sección. El texto viene del mock-up y un test exige que coincida; el test no lee los ⚖ cerrados, así que no lo detecta.
   - **Acción sugerida:** decidir si el tope de la CNV cuenta como cupo. Si sí, escribir una versión aparte de esos dos ⚖ para Sumarte (y ajustar el test). Si no, aclararlo en la spec.
2. **Hallazgo baja (revisor): idioma de la referencia del pedido.** La referencia sale del diccionario y se guarda en el idioma de la página. En inglés, la bandeja de `/admin` muestra "Series program" e "Invest in NetX", y la spec de contactos espera "Programa de series".
   - **Acción sugerida:** decidir si se guarda siempre en español (lo más simple para la bandeja). Un pedido viejo guardado como "Lote 7" se sigue mostrando igual (lo cubre el código; no tiene test propio).
3. **Contradicción en la spec: "Comprar un lote" vs "Invertir".** La tarjeta de proyectos nombra "Comprar un lote" (texto de design §7), pero la spec pide esa sección fuera de "Invertir". El implementador hizo que el test compruebe que el encabezado no esté dentro de "Invertir".
   - **Acción sugerida:** elegir cuál manda y corregir la otra.
4. **Tests inestables.**
   - `e2e/configuracion.spec.ts:38`: falla igual en la base `agente/lote-ficha-y-compra`; inestable (una vez falló por timeout y después el archivo pasó 34/34).
   - `e2e/idioma.spec.ts:86`: intermitente, también falla en la base; en la última corrida pasó.
   - `e2e/pacto-puntual.spec.ts:385`: falló una vez (axe en `/pactos`, regla `document-title`), pasa al repetirla sola y el PR no toca esa página.
   - **Acción sugerida:** abrir un cambio aparte para estabilizarlos; no bloquean este PR.
5. **Prueba contra el preview.** Renová el secreto de Vercel y corré `BASE_URL=<url> pnpm test:e2e e2e/sumarte.spec.ts`, o recorré el guion del PR a mano. Después marcar la 5.3.

## Revisor: veredicto y hallazgos
- **1ª vuelta:** con observaciones. 4 hallazgos ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/170#issuecomment-6616183115)).
  1. Baja: precio del lote y tickets con formato argentino siempre ("USD 5.000" en inglés) y sin conversión a pesos. **Corregido.**
  2. Baja: `TICKETS_SAFE.abierto` sin usar; el "o más" estaba escrito en el diccionario. **Corregido.**
  3. Media: cupos y descuento en los ⚖ (decisión 1). **Espera a Gus.**
  4. Baja: idioma de la referencia del pedido (decisión 2). **Espera a Gus.**
- **2ª vuelta:** listo para revisión humana, sobre el commit 5c84bde, 0 hallazgos nuevos ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/170#issuecomment-6616470443)). No corrió `pnpm build` (lo corrió el implementador). La 5.3 sigue sin marcar.

## Tester: resultado
- **1ª vuelta: FALLA** (solo local) ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/170#issuecomment-6616662283)). Playwright: 1144 pasaron, 3 fallaron, 1 omitido.
  - `login.spec.ts:283`: no aparecía la región "Encontramos datos de antes del login". **Esta la causaba el PR:** la puerta "Comprar un lote" dibuja el estado administrativo compacto, que anota en la bitácora al dibujarse; esa anotación quedaba guardada antes de evaluar la oferta de importar datos previos, y con datos propios la oferta no aparecía (afectaba el camino normal). **Corregida** en `components/sesion/puerta.tsx` (commit f6538d7): `useEffect` pasó a `useLayoutEffect`.
  - `configuracion.spec.ts:38` e `idioma.spec.ts:86`: fallan igual en la base, no son del PR.
- **2ª vuelta: PASA**, en local sobre f6538d7 ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/170#issuecomment-6617436173)). 1146 pasaron, 1 falló, 1 salteado.
  - La falla es `pacto-puntual.spec.ts:385` (decisión 4); pasa al repetirla sola y no toca `puerta.tsx`.
  - `login` 19/19; `idioma:86` pasa; `configuracion:38` inestable. El tester no pudo probarlo en la base y aceptó lo que dijo el implementador.
  - `puerta.tsx` solo cambia `useEffect` por `useLayoutEffect`; tests unitarios de `components/sesion` 9/9.
  - Una corrida con `BASE_URL=http://localhost:3000` dio fallas masivas falsas (no había servidor) y se descartó.
  - El guion manual 1 a 7 quedó cubierto solo por los e2e.

## Para la próxima noche
- Resolver las decisiones 1 a 3 y aplicar lo elegido (textos aparte de los ⚖, idioma de la referencia, ajuste de spec).
- Con el secreto de Vercel renovado, probar contra el preview y marcar la 5.3.
- Un cambio chico para estabilizar `configuracion:38`, `idioma:86` y `pacto-puntual:385`.
- Cuando se retome `fogon-desde-mi-y-guardian`, actualizar "Voto en el Fideicomiso" en el pasaporte y `guardianIA`.
- R14 sigue pendiente: los ⚖ reescritos son borrador.
