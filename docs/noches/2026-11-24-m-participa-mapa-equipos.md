# Noche 2026-11-24-m — participa-mapa-equipos
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/211 · **Preview:** https://lighthouse-platform-git-agente-par-e4cd2b-netxgen-2030-projects.vercel.app (ver la nota sobre el preview más abajo)

## Bloqueos y decisiones pendientes (leer primero)

1. **Nada se probó contra el preview de Vercel.** El tester esperó 15 minutos y dijo que el preview del commit final (0067faf) no apareció. Pero el bot de Vercel comentó en el PR que hay un despliegue en estado "Ready", actualizado a las 15:48 UTC, y el commit 0067faf es de las 15:46 UTC. Es probable que el preview sí exista y que el script de espera no lo haya encontrado (por ejemplo, porque la rama tiene un nombre cortado en la URL). No lo verifiqué abriéndolo. Además, el revisor vio que el preview devuelve error 401 al cargar el consentimiento, y eso nunca se pudo confirmar. **Acción sugerida:** abrir el preview a mano y mirar si carga `/participa`. Si da 401 en todo, hay que revisar la protección de previews en Vercel antes de que las pruebas contra preview sirvan de algo.
2. **La ilustración no fue vista por ningún humano.** Ni el revisor ni el tester la miraron con los ojos; solo hay pruebas automáticas (existen, se ven, axe, animaciones). Proporciones, paleta y "se siente bien dibujada" quedan para vos. **Acción sugerida:** seguir el guion de la sección del tester, pasos 1 y 2, en los dos temas. Las ubicaciones se ajustan en `components/participa/ubicaciones.ts`.
3. **Una corrida completa de pruebas locales terminó con error y nadie supo por qué.** El tester hizo tres corridas completas. La primera terminó con código 1 y la salida quedó cortada, así que no se vio qué falló. La segunda falló al compilar porque no pudo bajar la fuente de Google (red). La tercera salió limpia (1369 pasaron, 0 fallaron, 3 omitidos). Puede ser una prueba inestable. **Acción sugerida:** no bloquea el PR, pero si la integración continua del PR falla sin explicación, acordate de esto. Los dos tests que ya se sabía que eran inestables (foco y Tab) se estabilizaron en la última corrección.
4. **Decisión tuya, hallazgo 3 [baja]:** la modalidad "A acordar en un pacto" en las posiciones abiertas aparece sin el símbolo ⚖. **Acción sugerida:** elegir una opción. (a) Ponerle el ⚖ con uno de los términos de `lib/legal/terminos.ts` (`pacto`, `pactoDosPartes` o `pactopuntual`). (b) Decidir que ahí no lleva ⚖ porque es solo una frase de orientación. Mi sugerencia es (a) con `pacto`, que es lo más general y no promete un tipo de pacto concreto.
5. **Decisión tuya, hallazgo 4 [baja]:** en el celular (390 px) los nombres de los carteles del mapa se ven de unos 7 u 8 px, porque el mapa entero se achica. La lista de botones debajo del mapa lo compensa. **Acción sugerida:** decidir entre (a) dejarlo así, (b) que en celular el mapa arranque ya ampliado, o (c) carteles más grandes en celular. Es un ajuste chico; se puede pedir para la próxima noche.

## En una línea
Se creó **Participa** (`/participa`), un destino nuevo con un mapa ilustrado a mano de los nueve equipos del común, con detalle por equipo y posiciones abiertas de ejemplo. Pasa todo en local, pero falta verlo en el preview y con tus ojos.

## Qué quedó hecho (tareas 9/9)
Todas las tareas de `openspec/changes/participa-mapa-equipos/tasks.md` están marcadas como hechas. `pnpm verificar`, `pnpm build` y `openspec validate --strict` quedaron en verde.

- **Datos:** posiciones abiertas de ejemplo (2 a 4 por equipo, en español e inglés) en `lib/equipos/posiciones.ts`, marcadas "Ejemplo · a definir", sin pago, sueldo ni prioridad.
- **Ilustración:** mapa en SVG con el río Negro y sus sauces, la planicie con chacras, la barda y el cañadón hasta el humedal. Lleva la marca "Ilustración · no es un plano". De día es mediodía y de noche hay luna, faro, fogón y ventanas con luz (12 colores nuevos `--color-ilus-*` en ambos temas). Hay nueve formas, una por círculo del común, cada una con su detalle animado.
- **Interacción:** al pasar el puntero o al enfocar con teclado, la forma se eleva, aparece un contorno y un globo con el nombre y las posiciones abiertas. Con movimiento reducido solo queda contorno y etiqueta. Hay zoom con + y −.
- **Detalle del equipo:** panel lateral (hoja inferior en celular) con ilustración, qué decide, frentes, posiciones abiertas y "Quiero sumarme". La URL lleva `?equipo=<id>`. Escape cierra y devuelve el foco.
- **Página y menú:** pestañas Equipos (por defecto) y Visión (por ahora lo de antes), Participa en el menú después de Explorar, y `/tribus` redirige a `/participa`. Las fichas `/tribus/[id]` siguen donde estaban.
- **Pruebas:** `e2e/participa.spec.ts` reemplazó a `tribus-equipos.spec.ts`. Se adaptaron los e2e que usaban `/tribus`. axe pasa en los dos temas, con y sin el detalle abierto.

**Quedó pendiente, a propósito:**
- Pactos, Semillas (módulos congelados), el Congreso y las notificaciones guardadas siguen apuntando a `/tribus` y llegan por la redirección.
- La pestaña Visión muestra lo de antes hasta el cambio 4 (manifiesto 2050).
- Los textos nuevos y las posiciones son borrador de agente. No hay textos legales nuevos.
- No hay capturas de pantalla versionadas en el repo. La tarea 2.1 pedía una captura de los dos temas en el reporte, y no la tengo. Queda para tu revisión visual en el preview.

**Cosa de proceso:** el primer commit cayó por error en la rama `agente/explorar-unificado`. El implementador lo movió a la rama nueva y devolvió la anterior a su estado en origin. Conviene mirar que `agente/explorar-unificado` no haya quedado con nada de más.

## Revisor: veredicto y hallazgos
Dos rondas, las dos con ⚠️ (con observaciones). La primera no pudo comentar en el PR (`pr.sh` pidió aprobación). La segunda quedó en https://github.com/netxgen-2050/lighthouse-platform/pull/211#issuecomment-7136372271.

**Ronda 1**
- 1 [media] el foco y el hover compartían estado y se perdía el contorno del foco. **Corregido.**
- 2 [media] la ilustración del detalle se animaba sin parar. **Corregida** (queda quieta, con brotes y personitas visibles).
- 3 [baja] "A acordar en un pacto" sin ⚖. **Espera tu decisión** (punto 4 arriba).
- 4 [baja] carteles chicos en celular. **Espera tu decisión** (punto 5 arriba).
- 5 [baja] el grano de papel quedaba sobre los carteles. **Corregido** (el mapa va en dos capas).
- 6 [baja] el tema oscuro solo estaba cubierto por axe. **Corregido** (e2e de noche con luna y nueve carteles).
- 7 [baja] las ubicaciones de Agua y Cuidado no coincidían con `design.md` §3. **Corregidas** (Agua en 642,244; Cuidado en 820,228; humedal movido al este y rótulo al oeste).

**Ronda 2:** verificó las cinco correcciones sin regresiones. Encontró dos hallazgos nuevos, ya corregidos en el commit final.
- [media] el test "foco y puntero independientes" fallaba porque leía la opacidad en plena transición (0.96 en vez de 1). El componente andaba bien; era el test. **Corregido** con `toHaveCSS`, que reintenta.
- [baja] el test "con Tab" era inestable. **Corregido** esperando a la hidratación. Con `--repeat-each=3` (87 casos) quedó en verde.

El revisor no pudo correr nada contra el preview (401 al cargar el consentimiento), así que su revisión también fue solo local.

## Tester: resultado
**Local: pasa. Preview: sin probar.** Detalle en https://github.com/netxgen-2050/lighthouse-platform/pull/211#issuecomment-7137326432

- `pnpm test:e2e` sin `BASE_URL`: 1369 pasaron, 0 fallaron, 3 omitidos. `participa.spec.ts`: 29 de 29. axe sin violaciones en los dos temas.
- Las otras dos corridas completas tuvieron los problemas del punto 3 de arriba.
- El guion manual de 7 pasos quedó cubierto por e2e locales (mapa en los dos temas, hover, Tab, Enter/Escape, posiciones y "Quiero sumarme", link directo y redirecciones, movimiento reducido, 390 px con zoom e inglés). **Nadie lo hizo a mano.**
- **Sin probar:** todo contra el preview; el 401 del consentimiento; la apariencia real de la ilustración.

## Para la próxima noche
- Resolver los hallazgos 3 y 4 según lo que decidas.
- Revisar por qué el script `preview-url.sh` no encontró el preview que Vercel dice tener listo. Si es un problema del nombre de la rama, arreglarlo una vez para todas las noches.
- Correr las pruebas contra el preview una vez que se sepa si el 401 es real.
- Cambio 4: manifiesto 2050, que reemplaza la pestaña Visión.
- Más adelante, cuando se descongelen Pactos y Semillas, apuntar sus enlaces directo a `/participa` en vez de pasar por la redirección.
- Agregar capturas de los dos temas si querés que queden como evidencia del cambio.
