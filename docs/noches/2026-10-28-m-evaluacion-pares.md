# Noche 2026-10-28 (m) — evaluacion-pares
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/136 (base `agente/pactos-horas-variables`) · **Preview:** no disponible (el deploy de Vercel falló)

## En una línea
El código de la evaluación entre pares quedó hecho y revisado (listo para tu revisión), pero **no se pudo probar contra el preview porque Vercel falló al desplegar el último commit (160c56c)**; además hay cuatro decisiones tuyas pendientes.

## Qué falló (primero)
- **Vercel no desplegó el commit 160c56c.** El estado del commit figura en `failure`: https://vercel.com/net-xg-en/lighthouse-platform/3pVg1FR31Zwr69Djrmuy74Nmgvb6. Por eso `scripts/preview-url.sh agente/evaluacion-pares` terminó con error y el tester quedó **bloqueado**.
- Nadie pudo atribuir la falla a una línea del cambio. Hace falta que alguien mire el log (`npx vercel inspect dpl_3pVg1FR31Zwr69Djrmuy74Nmgvb6 --logs`) y lo corrija o lo relance. En local, `pnpm verificar` y `pnpm build` pasan.
- No se hizo una vuelta extra del tester porque el problema es de infraestructura, no de pruebas.

## Qué quedó hecho (tareas 22 hechas, 1 abierta)
- Cálculo de `f_eval` en `lib/evaluacion/`, con defensas, guía por nivel, datos de ejemplo y constancias. La defensa de reciprocidad está hecha y probada, pero **apagada por defecto**.
- Pantalla `/semillas`: guía del nivel, resultado de la ronda de ejemplo (1,08), selector de fuerza simulada y constancias (10 h/mes: base 50, ajuste 54). "Cómo te reconocieron" no muestra nombres ni motivos.
- Dos términos legales nuevos con ⚖, marcados como borrador, con inglés pendiente de revisión nativa (`docs/idioma/revisar-nativo.md`).
- Tus decisiones del 28-oct quedaron aplicadas en spec, design y tasks: solo se ajustan las Semillas recibidas; los máximos (total y por persona) son de las tareas; los nombres son "Semillas pendientes" y "Semillas", con test. Las decisiones 1 y 2 ya estaban en la spec de pactos-horas-variables.
- **Hifa y super admin: solo en la spec, sin código ni aviso en pantalla.** La ronda de ejemplo es de un pacto y no de un círculo transversal (nota 7.3 en tasks.md y frase en design §9).
- El panel de Semillas sigue con factor 1,0, como pedía la spec.
- **Tarea 2.1 reabierta** a propósito: falta la suma de las notas que da la persona (ver decisión 1).

## Qué decidir a la mañana
1. **Notas que da la persona vs. el 1,08 fijo.** La spec dice que las notas que ella da a Martina y Joaquín se suman como evaluaciones sobre ella, lo que haría variar el resultado y contradice el 1,08 fijo. Hoy se implementó el ejemplo fijo y "enviar" solo cierra la ronda. El comentario del revisor propone 3 opciones. Acción sugerida: elegir una; si querés que el resultado cambie, hay que sumar las notas dadas y cerrar la tarea 2.1.
2. **Cuatro requirements nuevos de la spec** entraron sin aprobación aparte (incluido Hifa, sin código). Acción sugerida: leerlos y confirmar o sacar los que no quieras. Si alcanza con Hifa solo en la spec, decirlo.
3. **Meses de horas variables en las constancias:** hoy un mes ya recibido figura como "sin dato". Acción sugerida: decidir si el ajuste se calcula por mes o recién al cumplir el mínimo de meses.
4. **Ajuste frente a los máximos de tarea (D20)** y el ajuste de meses de horas variables: dos preguntas abiertas nuevas en design. Acción sugerida: responderlas cuando decidas el punto 3.
5. **Vercel:** ver arriba; alguien tiene que revisar el log y relanzar.

## Revisor: veredicto y hallazgos
- **1ª vuelta:** con observaciones. 0 altos, 2 medios (el e2e de pacto variable no enviaba la ronda; el test del tope no usaba un equipo polarizado 1,1,5,5,q), 4 bajos (texto "Menos de 3 evaluaciones" falso por dimensión; `notasAcotadas` copiaba lógica; clave `contaron` sin uso; tarea 2.1 marcada hecha sin estar completa). De tus decisiones del 28-oct se cumplían la 1, 2, 3 y 5; la 4 (Hifa) quedó solo anotada.
- **Corrección (commit 160c56c):** los 6 hallazgos se resolvieron.
- **2ª vuelta: listo para revisión humana.** Sin regresiones; 0 altos, 0 medios, 1 bajo nuevo: en `lib/evaluacion/evaluacion.test.ts` (líneas 141-144 y 207) ya no se comprueba nota por nota que una nota alta "cuenta como 4" ni el equipo dividido. El tope sigue protegido por el caso [5,5,5,1,1] y por la propiedad general. `pnpm verificar` pasa (1900 tests).
- Comentarios en el PR: #issuecomment-6490066867 (1ª) y #issuecomment-6490207522 (2ª). El revisor notó que el check de Vercel de 160c56c figura en Error.
- Nota: `scripts/pr.sh diff` pidió una aprobación que no estaba disponible; el revisor trabajó con git.

## Tester: resultado
- **Bloqueado**: no se pudo probar contra el preview (ver arriba). Reporte en el PR: #issuecomment-6490296265.
- **Evidencia local (no es el preview):** Playwright completo, 967 pasaron y 3 fallaron (`idioma-pendientes.spec.ts:19`, `idioma.spec.ts:86`, `pacto-puntual.spec.ts:385`). Repetidos junto con idioma y semillas dieron 100/100 en verde, así que se toman como intermitentes.
- Cubierto en local: guía del nivel, 1,08, fuerza, constancias 50/54, "Cómo te reconocieron" sin nombres, "sin dato" con horas variables, ⚖ con teclado, axe y es/en.
- "brotes" y "germinar" no aparecen en el texto visible. Quedan el nivel de Pase "Brote/Sprout" de Sumarte y tokens de color del Congreso, ambos preexistentes.
- La corrección del implementador solo corrió el e2e cambiado y dos del mismo archivo, no la suite completa.

## Para la próxima noche
- Arreglar o relanzar el deploy de Vercel y recién entonces repetir al tester contra el preview.
- Según lo que decidas en el punto 1, sumar las notas dadas y cerrar la tarea 2.1.
- Implementar Hifa/super admin si querés más que la spec.
- Revisar con una persona nativa los dos términos legales en inglés.
- Averiguar si los 3 e2e intermitentes se pueden estabilizar.
- Recordar que el PR apunta a `agente/pactos-horas-variables`, no a `dev`: va después de ese cambio.
