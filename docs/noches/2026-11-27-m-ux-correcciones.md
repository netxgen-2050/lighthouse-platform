# Noche 2026-11-27-m — ux-correcciones
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/237 (base `spec/ux-correcciones`, rama `agente/ux-correcciones`) · **Preview:** https://lighthouse-platform-git-agente-ux-828616-netxgen-2030-projects.vercel.app (figura Ready, pero NO se pudo verificar: pide login)

## Lo que falló o quedó trabado (leer primero)
1. **Tarea 3.2 necesita tu decisión.** Está marcada como hecha, pero la verificación de la spec (buscar "todo es de ejemplo") no da vacío: quedan 3 coincidencias en `lib/legal/terminos.ts:730`, `lib/gobernanza/datos.ts:207` y `lib/invertir/barrios.ts:4`. Hablan de datos de ejemplo, no de pagos simulados, así que el implementador las dejó. Una está en el catálogo legal, que no le toca tocar a un agente.
2. **El preview de Vercel no se verificó.** El preview está Ready pero pide login. El secreto de bypass no llegó al entorno del tester, `scripts/curl-preview.sh` no mandó la cabecera y `scripts/preview-url.sh` esperó 15 minutos sin encontrar el deployment por SHA. Todo lo probado fue en LOCAL.
3. **`scripts/pr.sh diff` pidió aprobación al revisor.** No pudo usarlo y revisó con git. No cambió el resultado, pero hay que revisar ese permiso.

Nada se mergeó ni se tocó `dev` ni `main`.

## En una línea
Tres arreglos de interfaz chicos (filtro de lotes en el celular, chip "Idea" en Ostrom, prueba del pie) más un comentario corregido. Funciona en local con todos los tests en verde. Falta tu decisión sobre 3.2 y probarlo en el preview real.

## Qué quedó hecho (tareas 5/5)
- **Filtro de lotes en el celular:** las pastillas Disponible, Reservado y Vendido ahora se ven con la hoja en reposo, sin abrirla. En compu no cambia nada. Después de la revisión se subió el tope de la hoja de 128 a 160 px para que no quedaran justas, con un test unitario y una aserción e2e que habría fallado con el tope anterior.
- **Chip Idea:** `ChipEstado` tiene un estado nuevo `idea` (lamparita; dice "Idea" o "Draft idea"). La tabla de Ostrom en `/bien-comun` lo usa. Se borró la clave sin uso `bien-comun.ostrom.idea` y se regeneró `docs/idioma/revisar-nativo.md`. Hay test unitario y e2e actualizado.
- **Pie de página:** e2e nuevo en `e2e/marco.spec.ts` (`/invertir` sin sesión a 390x844). Pasó sin tocar el layout.
- **Comentario de `app/invertir/page.tsx`:** ahora dice que solo el pago es simulado.
- Dos vueltas de corrección: la primera (commit cf11e0b) subió la hoja a 160 px; la segunda (commit 0aeb07b) actualizó tres comentarios que decían 8rem y ahora dicen 10rem.

## Qué decidir a la mañana
1. **Tarea 3.2 (media).** Opciones: (a) ajustar la verificación de la spec para que acepte esas 3 coincidencias, que son legítimas; o (b) reescribir los 3 textos. Sugerencia: (a), porque los textos hablan de datos de ejemplo y no de pagos. Si elegís (b), el de `lib/legal/terminos.ts` lo tenés que aprobar vos.
2. **Preview sin verificar (baja).** Dejá disponible el secreto de bypass para el tester, o corré vos el guion de 7 pasos del PR en el preview. Sugerencia: no mergear hasta tener esa prueba.
3. **Borde de la primera tarjeta (baja).** Con la hoja en reposo se ve una franja de unos 10 px del borde de la primera tarjeta, cortada y no usable. axe pasa. Decidí si te molesta; si sí, se arregla en otro cambio chico.
4. **Proceso (baja).** El implementador marcó `tasks.md` con `sed -i`, contra la regla de usar Edit. El resultado es el mismo. Sugerencia: recordárselo en la próxima noche.
5. **Permiso de `scripts/pr.sh diff` (baja).** Pidió aprobación a un subagente. Sugerencia: revisar la lista de permisos de `.claude/settings.json`.

## Revisor: veredicto y hallazgos
Tres rondas, todas con veredicto "con observaciones" (sin problemas con CLAUDE.md, seguridad ni alcance).
- **Ronda 1:**
  - (media) 3.2 marcada con el grep no vacío.
  - (baja) 4.1 marcada con 2 e2e en rojo ajenos al cambio.
  - (baja) `components/ui/hoja.tsx:183` tenía `max-h-32` (128 px) contra un contenido de unos 133 px, sin margen.
  - (baja) `sed -i`.
- **Ronda 2:**
  - La corrección es correcta, con unos 27 px de margen y sin regresiones.
  - Quedaban 3 comentarios con 8rem obsoletos, que se arreglaron.
  - Se avisó de la franja de unos 10 px de la primera tarjeta.
- **Ronda 3 (final):** el commit 0aeb07b solo toca comentarios y ya no quedan 8rem obsoletos. Siguen abiertos solo los puntos de decisión humana (3.2, 4.1 contra el preview, borde de la tarjeta, `sed -i`).

## Tester: resultado
**Pasa en LOCAL; NO confirmado contra el preview de Vercel.**
- Build y `pnpm test:e2e` local sobre 0aeb07b, con red: 1512 pasaron, 0 fallaron, 3 omitidos.
- `reportes.spec` pasa con red; antes había fallado por no poder bajar las fuentes de Google.
- `barrio-norte` y `consentimiento-alta` pasaron en la suite completa y aparte; `idioma.spec (f)` pasó. Esos tres habían sido intermitentes bajo carga.
- No hizo recorrido manual en navegador. Los 7 pasos del guion los cubren los e2e del PR (`explorar.spec`, `bien-comun.spec`, `marco.spec:218`).
- Pendiente: repetir el guion contra el preview real cuando el secreto de bypass esté disponible.

## Para la próxima noche
- Resolver 3.2 según lo que decidas, ya sea ajustando la spec o los textos.
- Repetir el guion de 7 pasos contra el preview real una vez disponible el bypass, y cerrar la tarea 4.1.
- Arreglar el acceso del tester al preview (secreto de bypass) y la búsqueda del deployment por SHA en `scripts/preview-url.sh`.
- Revisar el permiso de `scripts/pr.sh diff` para los subagentes.
- Recordar a los implementadores usar Edit y no `sed -i` en `tasks.md`.
- Fuera de alcance por spec, pendiente para otros cambios: cuotas de Mi tierra, login, Candide y colores.
