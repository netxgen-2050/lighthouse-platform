# Noche 2026-10-07-1705 — canales-acceso
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/22 (base: `agente/territorio-mapa`, no se mergeó nada) · **Preview:** https://lighthouse-platform-git-agente-canales-acceso-net-xg-en.vercel.app

## En una línea
La página `/canales` quedó hecha y funciona, pero el tester la dio por fallida: a 320 px de ancho (celulares chicos) la tabla de puertas se ve muy angosta y es incómoda de leer, y hay una decisión tuya pendiente sobre el simulador.

## Qué quedó hecho (tareas 9 de 10; falta la 4.1)
- 0.1 Prerrequisitos confirmados.
- 1.1 La clave de Sumarte pasó a `CLAVES.sumarte` (mismo valor `lh-sumarte`), así que lo elegido antes sigue apareciendo.
- 1.2 `lib/canales/` arma las 9 puertas (11 filas si hay tribu aceptada) con estado en texto, motivos y "Se abre con: …", con tests.
- 2.1 `/canales` muestra "Tu situación" y las puertas, con los ⚖ ya existentes.
- 2.2 Simulador "Probá otra situación" con "Volver a mi situación"; no guarda nada.
- 2.3 Enlace "Ver qué te abre cada plan" en `/sumarte`.
- 3.1 y 3.2 Pruebas e2e de `/canales` y auditoría de accesibilidad (axe) sin violaciones.
- 4.1 **Sin marcar** en `tasks.md`. Las pruebas sobre el preview se hicieron, pero ver más abajo.

Verificado: `pnpm verificar` y `pnpm build` en verde (246 tests). Playwright contra el preview: 147 pasaron, 0 fallaron.

## Qué decidir a la mañana
Lo bloqueante primero.

1. **Tabla de puertas poco legible a 320 px (el tester marcó la noche como fallida por esto).** El scroll horizontal ya se corrigió, pero a 320 px la tabla mide solo 174 de ~272 px útiles, con columnas de 52 a 63 px; la fila "Foros de la red" mide 349 px de alto. A 375 px mide 229 px, mejor pero también angosta. Acción sugerida: en pantallas chicas mostrar cada puerta como tarjeta apilada (la tabla queda de `sm` en adelante) o hacer que la tabla use todo el ancho útil. Hay que pedirlo como una corrección aparte: esta noche se agotaron las vueltas.
2. **Simulador: ¿acopla plan y pase como Sumarte?** En Sumarte, activar un pase te pasa a Miembro y volver a Explorador saca el pase. En el simulador de `/canales` son independientes, así que se puede armar "Explorador con Pase Raíz", que Sumarte no permite. La spec no lo pide y un test (pase Raíz con presencia Genesis) depende de esa combinación. Acción sugerida: decidir si se copia la regla de Sumarte (hay que ajustar ese test) o se deja libre a propósito, por ser un simulador de "qué pasaría si".
3. **Tarea 4.1.** Las pruebas sobre el preview se hicieron y pasaron, pero el tester no pudo mirar las capturas (le negaron la lectura de imágenes); su juicio sale de medidas. Acción sugerida: mirar vos `/canales` en el preview a 320 px y decidir si se marca. Conviene hacerlo después de resolver el punto 1.
4. **La última versión (7d5e4c1) no tuvo re-revisión del revisor.** Se llegó al límite de dos vueltas. Acción sugerida: una pasada rápida del revisor sobre los cambios de la última corrección (grillas, tabla de ancho fijo, textos que cortan palabras).

Otras notas:
- El worktree arrancó en `agente/territorio-mapa` y los dos primeros commits cayeron ahí. El implementador los movió a `agente/canales-acceso` y devolvió la rama local `agente/territorio-mapa` a lo que está en origin. No empujó nada a esa rama.
- `lib/demo/borrar.ts` recorre todas las claves, así que borrar la demo ahora también limpia lo elegido en Sumarte. Es un efecto esperable, pero conviene saberlo.
- No se agregó ítem en el rail, como indicaba la propuesta.

## Revisor: veredicto y hallazgos
Dos rondas, ambas "con observaciones". 7 de 8 requisitos cumplidos; reglas de CLAUDE.md cumplidas. Comentarios: [ronda 1](https://github.com/netxgen-2050/lighthouse-platform/pull/22#issuecomment-6042139274), [ronda 2](https://github.com/netxgen-2050/lighthouse-platform/pull/22#issuecomment-6042189335).
- Resuelto: el ⚖ posiblemente recortado por el contenedor con scroll (media).
- Resuelto: el texto "ser aceptado en esa tribu" en filas de otras tribus; ahora dice "en otra tribu", con test (baja).
- Resuelto: faltaba prueba de teclado; se sumó un recorrido completo del simulador (baja).
- Abierto, tuyo: el simulador permite combinaciones que Sumarte no permite (media). Ver punto 2.
- Resuelto en la práctica: sin scroll en la tabla, el revisor temió desborde en pantallas angostas (media). El tester confirmó el desborde a 320 px, se corrigió, y el revisor no lo volvió a mirar. Ver punto 4.

## Tester: resultado
Falla, solo por legibilidad. Comentarios: [ronda 1](https://github.com/netxgen-2050/lighthouse-platform/pull/22#issuecomment-6042250388), [ronda 2](https://github.com/netxgen-2050/lighthouse-platform/pull/22#issuecomment-6042363700).
- Ronda 1: falló por scroll horizontal a 320 px (355 px de contenido contra 320). Se corrigió.
- Ronda 2: ya no hay scroll horizontal a 320 ni 375 px, con y sin tribu. El ⚖ no se corta (cuadro de 288 px dentro de la pantalla). Queda la tabla angosta y alta a 320 px (punto 1).
- Nota: no pudo mirar capturas; el juicio sale de medidas.

## Para la próxima noche
- Cambio chico: puertas como tarjetas apiladas en pantallas chicas (punto 1), con una prueba a 320 px que mida legibilidad (ancho útil de la tabla o tarjetas).
- Según lo que decidas, acoplar plan y pase en el simulador y ajustar el test de "pase Raíz con presencia Genesis".
- Re-revisión del revisor sobre la versión final y marcar la tarea 4.1 cuando se confirme a ojo.
- Si el PR se aprueba, recordar que su base es `agente/territorio-mapa`: ese PR tiene que mergearse antes o cambiarse la base.
