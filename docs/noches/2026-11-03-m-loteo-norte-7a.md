# Noche 2026-11-03-m — loteo-norte-7a
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/165 (base `agente/venta-lotes-regla`, nadie mergea) · **Preview:** https://lighthouse-platform-git-agente-lot-ca2d99-netxgen-2030-projects.vercel.app (Vercel lo marca Ready, pero pide login: los agentes no pudieron entrar)

## En una línea
La vista Lotes del sector norte está hecha y pasa todo en local, pero **no se pudo probar contra el preview de Vercel** (pide login) y **4 tests del Fogón fallaron en local** sin saber si ya fallaban antes: hay que mirar eso y dos decisiones tuyas antes de mergear.

## Qué quedó hecho (tareas 13/14)
Hecho (tareas 1.1 a 4.3 y 5.1):
- Datos del loteo en un solo archivo (`lib/territorios/loteo-norte.json`) y un solo módulo que los lee (`loteo.ts`). Los estados de ejemplo van aparte (`loteo-estados.ts`).
- Vista nueva "Lotes · sector norte": es la primera del selector y la que se abre por defecto en `/territorios/lighthouse`. Lista de lotes usable con teclado y panel de cada lote. **Sin precios ni botones de reservar o comprar.**
- Textos en español e inglés.
- Los dos avisos de estado administrativo (Chacras de Soluna y Lighthouse VRN). El de Norte es bilingüe.
- Importador de KML/KMZ (`scripts/importar-loteo.ts`, con `--salida` y `--comprobar`) y su nota de uso en `docs/notas/importar-loteo.md`.
- Tests nuevos y `e2e/loteo-norte.spec.ts`.
- Local: `pnpm verificar` (2263 tests) y `pnpm build` en verde.

**Sin marcar: 5.2** (probar contra el preview). Ver abajo.

## Qué decidir a la mañana
1. **Tarea 5.2 (la hace Gus).** Correr `BASE_URL=<url del preview> pnpm test:e2e e2e/loteo-norte.spec.ts` con el bypass de Vercel. Los agentes no lograron entrar: el preview responde 302 al login SSO. Acción: correrlo vos y, si da verde, marcar 5.2.
2. **Dos tests del Fogón siguen fallando en local** (`e2e/fogon-propuestas.spec.ts` líneas 71 y 133). No tocan loteo ni territorios y el Fogón está congelado, pero **no se comprobó si también fallan en la rama base**. Acción: correrlos en `agente/venta-lotes-regla` antes de mergear. Si fallan ahí también, no es de este PR.
3. **Hallazgo 6 (decisión tuya).** El aviso compacto de estado administrativo en el panel del lote se llama solo "Estado administrativo", sin el proyecto. La spec exige el nombre con proyecto, pero no aclara si vale para la versión compacta. Acción sugerida: decidir si la versión compacta también lleva el proyecto ("Estado administrativo · Lighthouse VRN"). Si sí, es un cambio chico.
4. **Hallazgo 7 (decisión tuya).** La comprobación "el lote está dentro del 7A" no tiene tolerancia (la de superposición sí: 0,5 m). Con el KMZ de Martín, un redondeo de unos 10 cm podría hacer fallar la importación. Falla a la vista, no en silencio. Acción sugerida: darle la misma tolerancia de 0,5 m, o dejarlo estricto y ajustar cuando llegue el KMZ real.
5. **Check de Vercel en Error para el commit `b3ee987`.** El implementador diagnosticó que es del entorno y no del código: la rama base y `21f63a0` fallan igual, y `7c86dfa` desplegó bien. Para confirmarlo hace falta `npx vercel inspect dpl_9pzLLzsg2fkFuL4bb98VEk7tU43h --logs` con tus credenciales de Vercel.
6. **Pregunta abierta del diseño:** con el plano real hay que mirar el cruce con el Barrio 1 de la vista Visión.
7. **Decisiones del implementador para que confirmes:** tomó el rasgo `macrolote` de `biopueblo-territorios.json` como polígono del 7A (es el mismo que usa el boceto de NS_platform). Agregó `loteoDe(archivo)` solo para poder probar el importador. La tabla de nombres del importador (Lote N, L-N, común, producción, camino, sector) es una suposición a ajustar cuando llegue el KMZ de Martín.
8. **Los lotes no se alcanzan con Tab sobre el mapa**: el camino con teclado es la lista (lo pide el diseño). Un clic sí elige. Solo para que lo sepas.

## Revisor: veredicto y hallazgos
Veredicto final (revisión 3): **con observaciones**. Sin hallazgos altos ni medios en ninguna vuelta.
- Revisión 1: 7 hallazgos bajos. Corregidos 1 a 5 (leyenda sin `aria-hidden` en símbolos; el resaltado quitaba el borde punteado del lote vendido; faltaba test de bordes distintos; "sin dato" escrito en el código; código sin uso). Quedaron 6 y 7, que son tuyos (arriba).
- Revisión 2: 1 a 5 resueltos. Hallazgo nuevo bajo: `capas.ts:49`, `lineCap` quedaba sin definir. Se corrigió en `7c86dfa` (`base.lineCap ?? "round"` más un test).
- Revisión 3: sin hallazgos nuevos. Solo quedan 6, 7 y la tarea 5.2.
- Comentarios: revisión 2 https://github.com/netxgen-2050/lighthouse-platform/pull/165#issuecomment-6605648243 · revisión 3 https://github.com/netxgen-2050/lighthouse-platform/pull/165#issuecomment-6606055217
- El comentario de la revisión 1 no se pudo publicar por permisos de `scripts/pr.sh`; las siguientes sí.
- Warning de lint que ya existía: `vistas/paneles.tsx:83`.

## Tester: resultado
**No se pudo probar contra el preview.** Probó el commit `7c86dfa` en local (build de producción, puerto 3100).
- Preview: responde 302 al login de Vercel. El bypass no llega al shell porque `scripts/curl-preview.sh` arma las cabeceras vacías, y `scripts/preview-url.sh` no devuelve URL (Vercel solo registra estados de commit). La corrida contra el preview dio decenas de timeouts y no cuenta.
- Local, suite completa: 1100 pasaron, 4 fallaron: `fogon-propuestas` (líneas 71 y 133), `pacto-puntual-verificacion` (78) y `pacto-puntual` (372).
- Al repetir con `e2e/loteo-norte.spec.ts`: 78 pasaron, 2 fallaron. Los de `pacto-puntual` eran intermitentes. Siguen fallando los dos de `fogon-propuestas`: en el 71 esperaba "Resolver concerns" como fase actual y vio "Cierre · ahora"; en el 133 no encontró "Falta responder el desafío del Guardián".
- Todos los tests de `e2e/loteo-norte.spec.ts` y la auditoría de accesibilidad (41 rutas) pasaron en local.
- Guion manual: pasos 1, 2, 4, 5, 6, 8 y 9 cubiertos por e2e. El paso 3 solo por el texto de la leyenda (el borde lo cubre `capas.test.ts`). **No ejecutados:** el paso 7 (finca de Soluna sin reservar ni comprar) y el 10 (importador `--comprobar`).
- Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/165#issuecomment-6606652852

## Para la próxima noche
- Cerrar 5.2 una vez que Gus corra el e2e contra el preview.
- Resolver los hallazgos 6 y 7 según lo que decidas.
- Reemplazar el boceto con el KMZ de Martín en un PR chico (solo el archivo de datos), ajustando la tabla de nombres del importador, y mirar el cruce con el Barrio 1.
- Corregir los scripts de agentes que trabaron esta noche: `scripts/curl-preview.sh` (cabeceras de bypass vacías) y `scripts/preview-url.sh` (no devuelve URL; además puede quedar corriendo en segundo plano hasta 15 min y no se puede matar con `kill`). `scripts/pr.sh comentar` y `diff` fallaron por permisos en la primera pasada del revisor.
- El orquestador no tuvo Monitor ni sleep y esperó por polling; conviene darle una forma de espera.
- Aparte: revisar los tests intermitentes de `pacto-puntual` y los dos de `fogon-propuestas`.
