# Noche 2026-11-26-m — ux-inicio
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/232 (base `agente/ux-explorar`) · **Preview:** sin verificar (ver abajo)

## En una línea
El código de la portada nueva quedó hecho y pasa todas las pruebas en local, pero **nadie pudo ver el preview de Vercel** y **faltan las capturas (tarea 2.1 abierta)**: hay que mirarla a mano antes de aceptarla.

## Qué bloquea (dicho primero)
- **El preview no se probó.** El script que busca la URL no la encontró en 10 minutos; la URL conocida pide login de Vercel (el secreto de acceso no llegó al entorno); `scripts/curl-preview.sh` está roto (`CABECERAS[@]: unbound variable`); Playwright contra el preview dio 1507 fallos por el muro de login, que se descartaron. Lo único probado es el build local.
- **La tarea 2.1 está sin marcar.** Pide capturas de `/` a 390 y 1440 px en claro y oscuro, y los agentes no pueden subir imágenes. Todo lo demás de 2.1 está en verde (verificar, build, `openspec validate --strict`, axe).
- **Nadie miró la portada con los ojos.** El contraste del héroe se verificó con un test, no a la vista. El alto mínimo de 440 px del héroe no se verificó por separado.

## Qué quedó hecho (tareas 3 de 4)
- 1.1 Héroe a sangre con degradado (0 % a 92 %) y test de contraste en los dos temas. Hecha.
- 1.2 Franjas de pilares, cifras y capitales con dibujos SVG. Hecha.
- 1.3 Tres caminos por público, en español e inglés. Hecha.
- 2.1 Verificación final y capturas. **Abierta** (solo faltan las capturas).

## Qué decidir a la mañana
1. **Sacar las capturas a mano** (tarea 2.1): `/` a 390 y 1440 px, claro y oscuro, y subirlas al PR. También sirve para ver el preview real. Con eso se marca 2.1.
2. **Preview de Vercel sin verificar:** arreglar el secreto de acceso (bypass) en el entorno de los agentes y el script `scripts/curl-preview.sh`. Sin eso, ninguna noche puede probar el preview.
3. **Héroe de /explorar al 92 %:** el cambio también afectó el héroe de Explorar (comparten estilo). Acción sugerida: mirarlo y decidir si se deja o se limita a Inicio.
4. **Mapeo de `?camino=`:** lotes y territorio marcan "vivir", tribus marca "cuidar"; "invertir" nunca sale como recomendado. Es una decisión del implementador. Acción: confirmar, o definir un valor nuevo para campañas dirigidas a inversores.
5. **Destino de "cuidar":** hoy va a `/participa`; la spec admitía también Bien común. Acción: elegir.
6. **Textos en borrador:** los textos de los tres caminos y el término legal nuevo `sinretorno` están marcados como borrador. El inglés espera revisión nativa (`docs/idioma/revisar-nativo.md`).
7. **Tarea menor (baja):** el texto visible del aviso de retorno está copiado en `lib/idioma/textos/portada.ts` (líneas 42 y 105) en vez de leerse de `lib/legal/terminos.ts` (línea 88). Si se cambia en un lugar, queda desparejo.

## Revisor: veredicto y hallazgos
Terminó en "con observaciones": 0 altos, 0 medios.
- Ronda 1: 2 medias (tarea 2.1 sin cerrar; el aviso "no es una promesa de retorno" estaba fuera del catálogo legal, sin ⚖ ni marca de borrador) y 5 bajas (comentario viejo "80 %", `tabIndex=0` en compu, héroe de Explorar, mapeo de `?camino=`, destino de cuidar). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/232#issuecomment-7186610359
- Corrección 1 (9add749): el aviso pasó al catálogo legal con ⚖ y borrador; la fila de capitales solo es parada de Tab si se desplaza; comentario corregido.
- Ronda 2: las correcciones 1 a 4 estaban bien; 3 problemas nuevos (el texto visible "Sobre el retorno ⚖" ocultaba la advertencia; dos tests sin esperar hidratación). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/232#issuecomment-7186906891
- Corrección 2 (efd05ab): el texto visible ahora es "Sin promesa de retorno" / "No promise of return"; los tests esperan hidratación.
- Revisión final: las tres correcciones OK, sin regresiones. Queda la baja de duplicación de texto (punto 7). El revisor tampoco pudo correr Playwright en local (Google Fonts sin red) ni contra el preview. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/232#issuecomment-7187576451

## Tester: resultado
No pudo probar el preview (ver "Qué bloquea"). En local, con build y `test:e2e` sobre efd05ab: **1427 pasaron, 0 fallaron, 3 omitidos**.
No probado: el preview real, la revisión visual en claro y oscuro, el alto mínimo de 440 px del héroe y `?lang=en` (solo por e2e).
Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/232#issuecomment-7188439119

Dato de estabilidad: durante la implementación, un axe de `/pactos/responder` (`document-title`) y un test de Sumarte en inglés fallaron una vez cada uno y pasaron al repetir. Esas páginas no se tocaron; parecen intermitentes. La corrección 2 no volvió a correr la suite completa, pero el tester sí lo hizo sobre el último commit y dio verde.

## Para la próxima noche
- Arreglar el acceso al preview y `curl-preview.sh` antes de lanzar otra noche, o el próximo cambio volverá a quedar sin verificar.
- Este PR está apilado sobre `ux-explorar`: se revisa y se integra en ese orden.
- Unificar el texto del aviso de retorno leyéndolo del catálogo legal.
- Vigilar los dos tests intermitentes mencionados arriba.
