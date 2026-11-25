# Noche 2026-10-27-m — idioma-perfil-recorrido
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/118 (base `agente/idioma-fogon-mercado`) · **Preview:** no hay (el deploy de Vercel falló, ver abajo)

## En una línea
Perfil, Mi recorrido, Bandeja y Configuración ya se leen en inglés y las pruebas locales pasan, pero Vercel no pudo armar el preview y hay una pregunta de spec sobre la entrevista del perfil. Nadie mergeó nada.

## Qué quedó hecho (tareas 7/7)
- Las 7 tareas de `openspec/changes/idioma-perfil-recorrido/tasks.md` están marcadas.
- Cuatro diccionarios nuevos (perfil, recorrido, bandeja, configuración), pendientes de revisión de una persona nativa (`docs/idioma/revisar-nativo.md` regenerado).
- `/perfil`, `/panel`, `/bandeja` y `/configuracion` quedaron en la lista de rutas traducidas.
- Notificaciones: los eventos nuevos guardan el mensaje y sus datos, y el texto se arma en el idioma que se esté usando. Los eventos viejos se ven en español. Si los datos guardados están dañados, se descartan y se muestra el texto en español.
- Lo que escribe la persona (nombre, lugar, frase, respuestas) se muestra tal cual, marcado como español.
- Configuración, incluida la confirmación de "Borrar todo", en inglés.
- Pruebas: unitarias nuevas, 15 escenarios e2e nuevos (`e2e/idioma-perfil-recorrido.spec.ts`) y las tres páginas nuevas en la auditoría de accesibilidad en inglés.
- `pnpm verificar` (1395 tests) y `pnpm build` pasan en local.

## Qué decidir a la mañana
1. **Bloqueo de Vercel (lo más urgente).** El deploy del último commit (`c82e67a`) falló y `scripts/preview-url.sh` no devolvió ninguna URL. El build local pasa, así que no se sabe la causa. Los agentes no pudieron ver el log de Vercel. Acción sugerida: mirar el log del deploy en Vercel antes de cualquier otra cosa. Sin preview, el guion manual del PR no se pudo recorrer contra un entorno real.
2. **Entrevista del perfil sin pantalla (hallazgo 2 del revisor).** `preguntasEn` (las 6 preguntas en inglés, en `lib/perfil/preguntas.ts`) no la usa ninguna pantalla, porque la entrevista ya no se muestra en ningún lado. El escenario "Entrevista" de la spec no tiene dónde cumplirse. Tú decidís una de dos:
   - corregir la spec y sacar ese escenario, o
   - volver a mostrar la entrevista en otro cambio.

   El revisor lo rotuló severidad media; en el resumen de la vuelta 2 dice que en inglés la entrevista muestra preguntas en español. Eso no coincide con lo que verificaron el implementador y el tester: ninguna pantalla muestra la entrevista, y en `/perfil` en inglés no aparece ninguna pregunta. Es una discrepancia menor de redacción, el fondo del problema es el mismo.
3. **Cambio en un dato guardado en el navegador.** Los eventos de actividad suman mensaje y datos opcionales (los viejos se siguen leyendo). No es un dato personal nuevo ni toca la base. Queda anotado para cuando la actividad pase a la base (`datos-en-la-nube`). Acción: confirmar que está bien.
4. **Incidente de ramas, ya resuelto.** Dos commits iniciales se hicieron por error en la rama local `agente/idioma-fogon-mercado`. Se movieron a la rama del cambio y esa rama local se devolvió a lo que hay en origin. No se empujó nada a esa rama. Acción: nada, solo que lo sepas.

## Revisor: veredicto y hallazgos
Veredicto: con observaciones (0 alta, 0 media real en la vuelta 1; 2 baja).
- Hallazgo 1 (baja): `components/texto-evento.tsx` marcaba la palabra equivocada con `translate=no` si el dato repetía una palabra de la frase fija. **Resuelto** en el commit `c82e67a`: ahora el texto se arma por partes desde la plantilla (`partesDeTexto` en `lib/actividad/actividad.ts`), con dos tests nuevos. No se agregó un test que dibuje el componente y revise `translate` y `lang`.
- Hallazgo 2: el de la entrevista, arriba en "Qué decidir". Sigue abierto.
- El resto de las reglas de CLAUDE.md, seguridad y cobertura: sin observaciones.
- El revisor no pudo publicar su comentario (pidió aprobación) y lo publicó el orquestador.

## Tester: resultado
- **En local: bien. En Vercel: bloqueado** (ver arriba, no hubo preview).
- Playwright local: 762 pasaron y 1 falló. La falla es `e2e/idioma.spec.ts:86`, que esperaba `/tribus?sel=valle&lang=en` y recibió `/tribus?lang=en`. Es intermitente: corrido junto con `idioma-perfil-recorrido.spec.ts` pasan 61 de 61, y no depende de este PR. Conviene mirarla aparte porque puede asustar en otra noche.
- `idioma-perfil-recorrido.spec.ts`: 15 de 15.
- El guion manual quedó cubierto por los e2e, pero nadie lo recorrió a mano contra un preview.
- No hubo vuelta de corrección del tester: la única falla es intermitente y el bloqueo de Vercel no se arregla desde el código sin ver el log.
- Reporte completo: https://github.com/netxgen-2050/lighthouse-platform/pull/118#issuecomment-6449038952

## Para la próxima noche
- Diagnosticar el deploy fallido de Vercel (si tenés el log, pegalo en el PR).
- Resolver la entrevista del perfil según lo que decidas.
- Estabilizar `e2e/idioma.spec.ts:86` (pierde el `sel=valle` de la dirección) y el timeout de carga ocasional en `sumarte-acceso`, que pasa solo al repetirlo.
- Agregar un test que dibuje `TextoEvento` y revise `translate` y `lang`.
- `/panel/bitacora` (enlace viejo, también accesible desde Configuración) sigue sin traducir; no estaba en la spec.
- El término legal de la Bitácora no tiene inglés todavía; corresponde a `idioma-legal`.
- La campanita no se tocó (su nombre accesible con la cantidad ya era bilingüe).
- Revisión nativa del inglés de los cuatro diccionarios nuevos.
