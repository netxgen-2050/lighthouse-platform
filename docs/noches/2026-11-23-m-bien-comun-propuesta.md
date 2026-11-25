# Noche 2026-11-23 — bien-comun-propuesta
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/192 (base `dev`, rama `agente/bien-comun-propuesta`) · **Preview:** no hay (el deploy de Vercel falló, ver abajo)

## Bloqueos y lo que necesita tu decisión (leer primero)
1. **No hay preview.** Vercel marcó como fallido el deploy del último commit (`bf447e6`, deploy `dpl_3PGvAvbFrnyn9jeFnqa9nqcsKs9a`). El commit anterior (`eac1807`) y `dev` sí salieron bien. GitHub no tiene deployment para ese commit y `scripts/preview-url.sh` esperó 15 minutos sin resultado. El revisor y el tester creen que es un fallo de Vercel y no del código: el commit solo toca TypeScript y textos, y el build local pasa. El tester vio que una vez el build local falló al bajar Google Fonts y pasó al reintentar, así que puede ser la red. No está confirmado.
   - **Acción:** relanzar el deploy o mirar los logs (`npx vercel inspect dpl_3PGvAvbFrnyn9jeFnqa9nqcsKs9a --logs`) antes de mergear.
2. **Quedó sin probar a mano contra un preview:** recorrido con Tab, vista a 390 px, `/sumarte` y `/lotes/hibrido`. Todo eso está cubierto por tests automáticos, pero nadie lo miró con los ojos.
   - **Acción:** hacerlo cuando haya preview.
3. **Hallazgo 7 del revisor (RAIZ en la página).** La decisión 6 de "Lo que hay que decidir" nombra RAIZ. Sale de tu recomendación en el doc 34 §7. Hasta ahora la página no nombraba RAIZ, y los ⚖ del bien común lo siguen prohibiendo en un test. El implementador borró el test e2e que lo prohibía.
   - **Acción sugerida:** decir si se puede nombrar RAIZ ahí. Si sí, hay que ajustar la regla de los ⚖. Si no, se cambia el texto de la decisión 6.
4. **Hallazgo 8 del revisor (FARO por cuotas o todo junto).** La puerta "Con el lote" dice que FARO se acredita a medida que se pagan las cuotas. La ficha del lote ("FARO que trae") y el boleto ("se asignarían X FARO") dicen que se asigna todo junto al firmar. Hoy la plataforma cuenta dos versiones distintas. Esta spec no toca la ficha ni el boleto.
   - **Acción sugerida:** decidir si lo resuelve el cambio hermano "ficha en cuotas". Si no, hay que alinear el texto de la puerta con el de la ficha.
5. **Fallos de e2e que no son de este PR.** En la corrida completa del tester: 1179 pasaron, 18 fallaron, 1 omitido. Los fallos son de Fogón (`fogon-consultas`, `idioma-pendientes`, `manifiesto-lighthouse-vrn` y `accesibilidad.spec.ts:442`, en `/fogon/consultas/u1`). El PR no toca nada de Fogón (el revisor lo comprobó con el diff contra `dev`). **No se comprobó si también fallan en `dev`.** Además `pacto-puntual.spec.ts:385` falló una vez y pasó al repetir (parece intermitente).
   - **Acción:** correr esos tests en `dev` para confirmar que ya estaban rotos. Si lo están, abrir un cambio aparte para Fogón consultas.

## En una línea
`/bien-comun` deja de mostrar el modelo del 8-nov (tramos, staking, reparto fijo) y muestra la propuesta v0.1 como "en discusión", con dos carriles, tres puentes, tres puertas, política, 8 decisiones abiertas y preguntas para el abogado. El código está listo y el revisor lo dio por bueno, pero falta preview y tus dos decisiones.

## Qué quedó hecho (tareas 12/12)
Las 12 tareas de `openspec/changes/bien-comun-propuesta/tasks.md` están hechas y marcadas.
- Se archivó el cambio anterior `bien-comun-tokens` (0.1) y se le sacaron los requisitos que reemplaza esta propuesta.
- `lib/bien-comun/modelo.ts` se reescribió: cada valor lleva su fuente (en español e inglés), las 8 decisiones están todas "abierta", y la parte de cada pago sale de `MODELO_LOTES.aporteUnico`. Se conservan `faroDeLote`, `loteTraeFaro` y `centroDeAnillo`.
- Página nueva con el sello de propuesta antes de cualquier número, seis componentes nuevos en `components/bien-comun/`, y sección propia para el NFT del lote (con su metadata). Se borró la calculadora.
- Catálogo legal: salen `ventatramos`, `stakingbiencomun` y `partenetxgen`; se reescribe `tokenbiencomun`; entran `fideicomisobarrio`, `tokentierra`, `tokeninversor`, `tesorocomun`, `primaobjetivo`, `boletocompraventa` y `valornegociable`. Todos los nuevos van como borrador (`borrador: true`) y con inglés.
- Las cantidades ("ocho decisiones", "seis reglas") ahora salen del módulo y no se escriben a mano.
- Se actualizó `docs/idioma/revisar-nativo.md`.
- Verificación del implementador: `pnpm verificar` (2420 tests) y `pnpm build` en verde; `openspec validate --strict` pasa; e2e de bien-comun (17/17, es y en) y accesibilidad de `/bien-comun` y lotes pasan.

Quedan para cambios hermanos (no son de esta noche): la calculadora del barrio, la ficha en cuotas y el Token Inversor en financiamiento.

Pendiente menor: la palabra "expensas" quedó sin ⚖ dentro del texto de los puentes y de "Carril B", porque son textos dentro del diagrama.

## Revisor: veredicto y hallazgos
Tres vueltas. Veredicto final: **listo para revisión humana**, sin hallazgos nuevos ni regresiones.
- Vuelta 1 (con observaciones, 8 hallazgos bajos). Se corrigieron los 6 primeros: e2e en inglés de términos retirados, test del cambio de estado de una decisión, cantidades a mano, fuente de reglas duplicada, términos legales sin ⚖ y tarjeta del NFT mal ubicada.
- Vuelta 2 (con observaciones, 2 hallazgos nuevos). Uno medio: en `?lang=en` las seis tarjetas de política mostraban la fuente en español. Uno bajo: el ⚖ de las preguntas al abogado se asignaba por posición. Los dos quedaron corregidos.
- Vuelta 3: sin hallazgos. La fuente de la política es `{es, en}` desde el módulo, y las preguntas al abogado llevan id y término legal en el módulo, con test.
- Seguridad: el PR no toca API, sesión, permisos, base de datos ni integraciones, y no hay secretos. Se borró la calculadora, que era el único campo de entrada.
- Quedan abiertos solo los hallazgos 7 y 8 (arriba, puntos 3 y 4), que son tuyos.

## Tester: resultado
**Pasa en local; contra el preview, bloqueado.**
- Sin preview (ver bloqueo 1). Se probó con el build y el servidor local.
- Playwright completo: 1179 pasaron, 18 fallaron, 1 omitido. Todos los tests de `bien-comun.spec.ts` pasan. Los fallos son de Fogón y ajenos al PR (bloqueo 5).
- `pnpm build` local en verde (solo un aviso de lint que ya existía en `app/territorios/[id]/vistas/paneles.tsx`).
- Guion manual: pasos 1 a 6 cubiertos por tests. Pasos 7 a 9 parcialmente (⚖, inglés, axe y lotes cubiertos por tests). Sin revisar a mano: Tab, 390 px, `/sumarte` y `/lotes/hibrido`.

## Para la próxima noche
- **No se hizo una vuelta extra después del tester.** Los fallos que encontró son ajenos al PR y el bloqueo (el preview) es de Vercel, no se arregla con código.
- Confirmar si los fallos de Fogón consultas ya existen en `dev` y, si es así, abrir un cambio para arreglarlos.
- Después de tus decisiones sobre los hallazgos 7 y 8, ajustar los textos o los ⚖ que haga falta.
- Cambios hermanos pendientes: calculadora del barrio, ficha en cuotas (puede resolver la decisión 8) y Token Inversor en financiamiento.
- Cuando haya preview: recorrer a mano Tab, 390 px, `/sumarte` y `/lotes/hibrido`, y correr `BASE_URL=<preview> pnpm test:e2e`.
- Poner "expensas" con ⚖ dentro de los textos del diagrama, si te parece necesario.
