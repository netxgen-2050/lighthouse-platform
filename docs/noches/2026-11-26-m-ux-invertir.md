# Noche 2026-11-26-m — ux-invertir
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/230 (base `agente/ux-mi-tierra`, apilado) · **Preview:** no disponible (ver bloqueos)

## En una línea
Invertir quedó rediseñado como el pool de un barrio y el código está listo, pero falta tu decisión sobre dónde va el aviso legal, y no se pudo probar en el preview de Vercel ni sacar las capturas.

## Qué quedó hecho (tareas 4/5)
Hechas (1.1 a 1.4):
- Encabezado tipo pool: nombre, chip "En financiamiento", la meta de la obra como número grande y tres datos chicos (lo juntado, mes de devolución, parte al común). Lo que no tiene dato dice "sin dato", más liviano que la meta.
- Un solo aviso legal, "Propuesta v0.1 en discusión · no es una oferta" con su ⚖. Reemplaza las tres etiquetas apiladas.
- Tres pestañas: Cómo funciona, Curva y Libro. La elegida va en la URL (`?ver=curva`, `?ver=libro`). Flechas, Inicio y Fin las recorren.
- La curva ocupa todo el ancho; las etiquetas miden 13 px también a 390 px.
- Libro: 8 filas, botón "Ver todo el libro (N movimientos)" y filtro por tipo.
- Sin sesión: estado vacío con dibujo del barrio y "Sumate para ver el barrio". No hay ningún monto en el HTML.
- Textos en español e inglés, tests unitarios, e2e de Invertir reescrito (12 tests) y axe por pestaña, idioma, tema y ancho.

Sin hacer:
- 2.1: falta marcarla. Faltan las capturas de cada pestaña a 390 y 1440 px, claro y oscuro (el agente no puede subir imágenes al PR) y la suite e2e completa en verde (ver Tester).

## Qué decidir a la mañana
1. **Posición del aviso legal (media, decisión tuya).** Hoy el aviso está debajo de la meta, y el e2e lo exige así. Pero la spec vigente `rediseno-invertir` (escenario "Sellos primero") pide los avisos antes de cualquier número. El cambio ux-invertir no la modifica, y su propio diseño (§1) dice "Debajo, el Aviso legal único". Hay una contradicción entre las dos specs.
   - Si querés el aviso **arriba**: se mueve el bloque y el test (cambio chico).
   - Si querés el aviso **abajo** (como está): hay que agregar a la spec del cambio un MODIFIED de `rediseno-invertir` para que la regla vieja no quede en contra.
   - Sugerencia: decidir esto antes de mergear; el aviso es un tema legal y la spec vieja es la más estricta.
2. **Bloqueo: preview de Vercel.** `scripts/preview-url.sh` esperó 15 minutos y no encontró el preview del último commit. Puede ser que el repo no esté conectado a Vercel o que el preview falle. Acción: mirar el panel de Vercel del repo y, si hace falta, reconectarlo.
3. **Bloqueo: capturas (tarea 2.1).** Hay que sacarlas a mano en el preview (o en local) y subirlas al PR. Acción: sacarlas vos o habilitar una forma de subirlas.
4. **Bloqueo: neon-auth.** El proyecto de tests `neon-auth` (12 tests) no se pudo correr por falta de credenciales y red. No tocan Invertir, pero no están confirmados. Acción: correrlos con credenciales.
5. **Dibujo del estado vacío.** `DibujoBarrio` es un primer boceto; mirarlo y ajustarlo si no te gusta.
6. **Textos nuevos es/en.** Son de agente; quedan para revisión (la lista de revisión nativa se regeneró).

## Revisor: veredicto y hallazgos
Tres pasadas. Veredicto final: **listo para revisión humana, 0 hallazgos corregibles** (no corrió e2e).
- Hallazgo 1 (media): posición del aviso legal. **Sigue abierto, es la decisión 1.**
- Hallazgo 2 (media): el test de "nunca habla de rendimiento" solo miraba la pestaña por defecto. Corregido: ahora recorre las tres pestañas.
- Hallazgo 3 (baja): los ids de pestañas y paneles eran globales y podían chocar con un segundo barrio. Corregido: llevan prefijo por barrio.
- Segunda pasada (baja): dos pruebas e2e podían leer el texto antes de que `?ver=` cambiara la pestaña. Corregido: esperan la pestaña por su nombre.
- Comentarios en el PR: https://github.com/netxgen-2050/lighthouse-platform/pull/230#issuecomment-7185086874 y https://github.com/netxgen-2050/lighthouse-platform/pull/230#issuecomment-7185187194

## Tester: resultado
**Bloqueado en el preview**, probado solo en local. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/230#issuecomment-7186017419
- Preview: no se encontró tras 15 minutos.
- Local (build y servidor de producción, chromium): `invertir.spec.ts` y `accesibilidad.spec.ts` 190 pasan, 0 fallan. `barrio-norte`, `bitacora`, `portada` y `congreso-en` 65 pasan.
- Suite completa: se cortó a los 10 minutos; 13 tests dieron timeout y pasaron al repetirlos. Antes, el implementador había visto 1417 pasar y 14 fallar fuera de Invertir (12 neon-auth y 2 intermitentes de idioma que pasan al repetir).
- Guion manual de 8 pasos: cubierto por los e2e, pero **no recorrido a ojo**. Sin verificar visualmente: etiquetas de la curva a 13 px y filas del libro en dos líneas en el celular.
- Fallas reales: ninguna.

## Para la próxima noche
- Repetir las pruebas sobre el preview real cuando Vercel funcione, y sacar las capturas de 2.1.
- Aplicar tu decisión sobre el aviso legal (mover bloque y test, o agregar el MODIFIED a la spec).
- Correr el proyecto neon-auth con credenciales.
- Warning de lint que ya existía, sin relación con este cambio: `app/territorios/[id]/vistas/paneles.tsx` línea 84.
- El PR está apilado sobre `agente/ux-mi-tierra`: va después de ese PR, o hay que cambiar la base si ese entra primero.
