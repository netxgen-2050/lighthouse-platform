# Noche 2026-10-29-m — manifiesto-lighthouse-vrn
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/139 · **Preview:** no hay (el deploy de Vercel falla, ver abajo)

## En una línea
El código del manifiesto de Lighthouse VRN quedó hecho y probado en local (996 pruebas pasaron), pero no se pudo probar en un preview real porque Vercel está fallando, también en `dev`.

## Qué decidir a la mañana

**1. Vercel no despliega (bloqueo).**
El deploy falla para el último commit de este PR (30fd10c) y también para `dev` (aa6f15d). No depende de este cambio. El tester no pudo probar contra un preview y lo hizo contra un servidor local de producción.
- Acción sugerida: mirar el error en el panel de Vercel y arreglarlo en `dev`. Después, volver a correr el e2e de este PR contra el preview.

**2. Lista de comunidades de referencia incompleta (media).**
El implementador armó `COMUNIDADES_DE_REFERENCIA` sin acceso a la fuente. La lista es incompleta y por eso no queda cubierto el escenario "Sin nombrar las fuentes" (que el manifiesto no nombre a esas comunidades).
- Acción sugerida: pasar la lista real de comunidades y completar el archivo.

**3. Revisión manual 7.2 sin hacer (media).**
Es la única tarea sin marcar. Es una revisión con teclado, en español e inglés, de `/tribus`, `/tribus/lighthouse`, el manifiesto, `/fogon` (con y sin adhesión), una consulta, `/fogon/gobernanza` y `/netx/financiamiento`. Hay que confirmar el aviso de prototipo, las marcas de borrador y ejemplo, y que no aparezca nada en `/sumarte`.
- Acción sugerida: hacerla vos sobre el preview cuando Vercel ande, y dejar el resultado en el PR.

**4. El requisito de postulación sigue diciendo "Pacto de convivencia" (baja).**
Es el ⚖ del pacto de propiedad horizontal, no el manifiesto viejo, así que se dejó.
- Acción sugerida: decidir si se renombra o se deja.

**5. Verificación de adhesión solo en el navegador (baja, ya asumida en ADR-023).**
Cuando `fogon-cuadratico-en-la-base` o `fogon-propuestas` guarden votos, la ruta del servidor tiene que verificar la adhesión y su versión con datos de la base.
- Acción sugerida: tenerlo presente al aprobar esos cambios.

**6. Otros puntos menores.**
- `lib/fogon/propuestas/principios.ts` no existe en `dev`, así que la tarea 1.6 no se aplicó. Cuando exista, cambiar `fuentePrincipios` por `principiosDelManifiesto`.
- El test de "Cargando" se probó solo a nivel del hook, no de la pantalla (baja, aceptable).
- Mejora que nadie pidió: un botón "Volver" después de adherir. Dejarlo o sacarlo.

## Qué quedó hecho (tareas 25/26)
Hecho: tareas 1.1 a 1.6 (la 1.6 quedó marcada pero sin aplicar, porque el archivo no existe en `dev`), 2.1 y 2.2, 3.1 a 3.6, 4.1 a 4.6, 5.1 a 5.3, 6.1 y 7.1. Sin marcar: 7.2.
- Manifiesto en borrador (es/en) que reemplaza al Pacto de convivencia: propósito, 15 principios, 7 derechos, 6 compromisos y cómo se cambia.
- Equipos transversales renombrados; se sumaron `comun-contratistas` y `comun-gobernanza`.
- Ficha del común en `/tribus/lighthouse` y tarjeta destacada en `/tribus`.
- Lectura del manifiesto con adhesión, 3 términos ⚖ nuevos y el de adhesión actualizado.
- Regla única de participación: sin adhesión no se puede votar, llevar al consejo ni repartir en consultas. La acción se frena, no solo el botón.
- Principios propios de tribu (Semilla Viva 2, Agua Clara 1) y bloque de 15 principios en Vista NetX.
- Tus decisiones aplicadas: nombre del común en una constante (Procomún/Commons), volver a adherir cuando cambia la versión, la adhesión vale desde que se adhiere, las consultas de Equipo piden adhesión, sin switch del mapa, ADR-023 sin choque de número.

## Revisor: veredicto y hallazgos
Pasó por tres revisiones. Veredicto final: con observaciones, 0 altas, 2 medias, 3 bajas, y ninguna se puede corregir sin vos. Detalle: https://github.com/netxgen-2050/lighthouse-platform/pull/139#issuecomment-6502223842
- Primera revisión (3 medias, 7 bajas): se corrigieron las 7 que se podían (regla de versión duplicada, falta del ⚖ en la ficha, texto de adhesión que perdió "la comunidad decide si te acepta", función sin uso, título de test, specs sin reflejar tus decisiones, test de Cargando).
- Segunda revisión: se corrigieron el e2e del ⚖ en la ficha y el idioma del ⚖ de lectura.
- Quedan las medias y bajas de los puntos 2, 3, 4 y 5 de arriba, más el test de Cargando.

## Tester: resultado
Bloqueado para probar en un preview, porque Vercel no despliega. Probó contra un servidor local de producción (puerto 3011) sobre 30fd10c: 996 pasaron, 0 fallaron. El guion manual de los pasos 1 a 10 salió bien (el 8 y `?lang=en` con un test temporal que ya se borró). No hizo la revisión manual 7.2. Informe: https://github.com/netxgen-2050/lighthouse-platform/pull/139#issuecomment-6502410352

Antes, en la corrida del implementador, un test de accesibilidad de pacto-puntual (`document-title`) falló una vez y pasó al repetir. Puede ser intermitente.

## Para la próxima noche
- Arreglar Vercel y correr el e2e contra el preview de este PR.
- Completar la lista de comunidades de referencia y el test que depende de ella.
- Hacer la revisión manual 7.2 y marcarla.
- Cuando exista `lib/fogon/propuestas/principios.ts`, conectarlo a `principiosDelManifiesto`.
- Al guardar votos en la base, verificar la adhesión en el servidor (ADR-023).
