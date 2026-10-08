# Noche 2026-10-08 — tribus-activas-formacion
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/38 · **Preview:** https://lighthouse-platform-m0ho71cyn-net-xg-en.vercel.app

Nota: el PR #38 está apoyado sobre la rama `agente/ajustes-ui-8oct` (no sobre `main`). Conviene mergear primero ese cambio.

## En una línea
`/tribus` ahora se divide en tres secciones (activas, en formación y barrios vacantes), con tarjetas distintas para cada estado y un aviso en la página de las tribus en formación. Nada falló; queda una decisión tuya sobre datos de ejemplo.

## Qué quedó hecho (tareas 3/3)
- Etapa de ejemplo para las 5 tribus en formación y una función `agruparPorEstado()` en `lib/tribus/datos.ts`.
- `/tribus` con tres secciones: 3 activas, 5 en formación y 4 vacantes.
- Tarjetas distintas por estado. Las activas muestran el pozo común, las en formación muestran etapa y roles que buscan (sin pozo), y las vacantes muestran lo que el barrio necesita y un botón "Proponer una comunidad".
- Aviso en `/tribus/[id]` cuando la tribu está en formación ("todavía no tiene un compromiso firmado con el Lighthouse").
- Lo que falta de dato se muestra como "sin dato", no como cero ni vacío.
- Tests e2e y unitarios actualizados. `pnpm verificar` (372 tests) y `pnpm build` pasan.

## Qué decidir a la mañana
1. **Etapas de ejemplo (hallazgo baja, necesita tu decisión).** La spec solo daba una etapa: "Armando su propuesta" para Monte Nuevo. Las otras cuatro las inventó el implementador: Barda "Reuniendo socios", Agua Clara "Armando su propuesta", Avelan "Eligiendo representantes", Puerto "Sumando hogares". Acción sugerida: confirmarlas o decirme cuáles cambiar. Están en la constante `ETAPAS` de `lib/tribus/datos.ts`. Son datos de prototipo bajo el aviso de ejemplo.
2. **Botón "Proponer una comunidad".** La ruta `barrio-vacante-postulacion` todavía no existe, así que el botón lleva a `/tribus/<id>#proponer` (la sección "¿Tenés una tribu?" de la página del barrio). Acción sugerida: cuando se haga ese cambio, editar solo la función `rutaProponerComunidad` en `lib/tribus/datos.ts`; la página y los tests la usan, no hay que tocar nada más.
3. **Mergear el PR #38** si te parece bien (después de `ajustes-ui-8oct`, que es su base).

## Revisor: veredicto y hallazgos
- Primera pasada: "con observaciones", 5 hallazgos de severidad baja, spec cubierta y sin violaciones de CLAUDE.md.
  1. Pozo ausente debía decir "sin dato". Corregido.
  2. "El barrio necesita" vacío debía decir "sin dato". Corregido.
  3. Dos enlaces seguidos al mismo destino en las vacantes. Corregido: el botón va a `#proponer`.
  4. Test e2e atado a `/tribus/grano`. Corregido: el destino sale de una sola función.
  5. Etapas inventadas. Abierto, es la decisión 1 de arriba.
- Segunda pasada: "listo para revisión humana", sin hallazgos nuevos. Comentarios: [1ª](https://github.com/netxgen-2050/lighthouse-platform/pull/38#issuecomment-6058851386) y [2ª](https://github.com/netxgen-2050/lighthouse-platform/pull/38#issuecomment-6058883178).
- Detalle de proceso: el implementador marcó `tasks.md` con `sed -i`, lo que va contra las reglas de herramientas. El resultado quedó correcto (3 de 3 marcadas).

## Tester: resultado
Pasa, sin fallas ([reporte](https://github.com/netxgen-2050/lighthouse-platform/pull/38#issuecomment-6058915579)).
- Playwright: 267 pasaron, 0 fallaron (incluye tribus, accesibilidad axe en 25 rutas y marco).
- Guion manual con `curl`, pasos 1 a 5 bien.
- Paso 6 (foco visible con Tab) no se recorrió a mano; lo cubren los tests de teclado y axe, que pasan. Si querés, probalo vos en el preview.
- Aclaración: la ficha `/tribus/monte` sí muestra "Plata comprometida" (USD 60.000 de 300.000). Es la ficha, no el listado; el listado no muestra plata, como pide la spec.

## Para la próxima noche
- Cambio `barrio-vacante-postulacion`: crear la ruta `/tribus/<id>/postular` y actualizar `rutaProponerComunidad`.
- Reemplazar las etapas de ejemplo por las que decidas (o por datos reales cuando existan).
- Recordatorio para el implementador: marcar `tasks.md` con Edit, no con `sed -i`.
