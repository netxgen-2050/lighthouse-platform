# Noche 2026-10-07 — bitacora-exposicion
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/34 · **Preview:** https://lighthouse-platform-ggwy4504f-net-xg-en.vercel.app

## En una línea
La bitácora "Lo que te mostramos" quedó hecha y probada, salvo la captura de la tabla (tarea 5.1); quedan dos decisiones tuyas y un texto legal borrador por revisar.

## Qué quedó hecho (tareas 10/11)
Nada falló: `pnpm verificar` (367 tests) y `pnpm build` pasan, y Playwright contra el preview dio 253 pasaron y 0 fallaron.

- Registro (`lib/demo/bitacora.ts`): huella del texto, lectura, y anotación sin repetidos dentro de 30 minutos, con tope de 300 entradas. La clave `lh-bitacora` entra en "Borrar todo".
- Se anota el estado del loteo y cada ⚖ que la persona abre (teclado, mouse y toque).
- Página `/panel/bitacora` ("Lo que te mostramos"): tabla, botón "Descargar (JSON)", mensaje cuando está vacía y enlace desde `/panel`.
- Término ⚖ `bitacora`, marcado como borrador.
- Tests: 11 e2e nuevos y la auditoría de accesibilidad (axe) sobre la página.
- **Pendiente: tarea 5.1.** Falta la captura de la tabla; la tarea quedó destildada a propósito.

## Qué decidir a la mañana
1. **Proyecto en la entrada de la vista compacta (media-baja).** Hoy la ficha lateral y el formulario guardan solo el estado y la norma corta, porque es lo único que se ve ahí. La spec pide también proyecto y expediente. La tabla tampoco muestra de qué proyecto es cada fila. Hoy hay un solo proyecto, así que no confunde. Acción sugerida: dejarlo como está (manda lo visible) y, si sumás más proyectos, mostrar la clave del proyecto en la tabla.
2. **Descargar vs. tabla (baja).** "Descargar (JSON)" baja lo guardado tal cual; la tabla muestra solo las entradas válidas. Si alguien tiene entradas rotas, el archivo trae filas que la tabla no muestra. La spec pide las dos cosas. Acción sugerida: que manden las entradas válidas en ambos lados, o aclarar en la spec que el archivo es "crudo".
3. **Texto legal borrador.** El ⚖ `bitacora` cita la Ley 24.240 y viene del design aprobado, pero es borrador. Acción: revisarlo antes de cualquier uso real.
4. **Base del PR.** El PR apunta a `agente/contactos-bandeja`, no a `main`. Acción: según el orden en que mergees, reapuntarlo.
5. **Captura de la tabla (5.1).** Sacarla y tildar la tarea.

## Revisor: veredicto y hallazgos
Tres vueltas. Veredicto final: listo para revisión humana, sin hallazgos nuevos.
- Vuelta 1 (con observaciones, 4 hallazgos): la vista compacta anotaba cosas que no mostraba (media, corregido); la tarea 5.1 estaba tildada sin captura y se había editado con `sed -i`, que CLAUDE.md no permite (media, corregido); faltaban tests e2e de ⚖ con toque y de bitácora inválida (baja, corregido); descarga vs. tabla (baja, queda para vos).
- Vuelta 2 (3 hallazgos bajos): un test e2e de la vista compacta nunca corría (corregido: ahora elige la finca 502 y falla si no hay entrada compacta); proyecto en la entrada compacta y descarga vs. tabla (quedan para vos).
- Vuelta 3: sin hallazgos nuevos.

## Tester: resultado
Pasó. Playwright contra el preview: 253 pasaron, 0 fallaron (incluye los 11 de la bitácora y axe). El guion manual se cubrió con Playwright, no a mano: bitácora vacía, elegir finca, abrir ⚖ con teclado y toque, filas con huella y "Borrador", sin repetidos, descarga, "Borrar todo" y 390 px sin scroll horizontal de la página.
No se probó: que la tabla se deslice bien dentro de su caja a 390 px (solo se verificó que la página no tenga scroll horizontal), la captura 5.1 (no existe), y el mensaje de bitácora vacía no está en el HTML del servidor porque se pinta en el navegador.

## Para la próxima noche
- Tomar las decisiones 1 y 2 y, si cambian, pedir el ajuste en la spec.
- Sacar la captura y cerrar la tarea 5.1.
- Revisar y, si corresponde, sacar la marca de borrador del ⚖ `bitacora`.
- Fuera de alcance de este cambio, para más adelante: guardado en servidor, plazo de conservación, consentimiento previo (C16), precios y pagos.
- Nadie mergeó ni tocó `main`.
