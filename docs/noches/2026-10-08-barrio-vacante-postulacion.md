# Noche 2026-10-08 — barrio-vacante-postulacion
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/39 · **Preview:** https://lighthouse-platform-552zjrw2h-net-xg-en.vercel.app

## Estado del PR
Abierto, sin conflictos, listo para tu revisión. Ojo: su base no es `main` sino `agente/tribus-activas-formacion`, así que ese PR tiene que mergearse antes (o cambiar la base). Nada falló: revisor y tester dieron el visto bueno. Quedan 5 decisiones tuyas (abajo).

## En una línea
Un barrio sin comunidad ahora tiene el botón "Proponer una comunidad", que lleva a un formulario de postulación (simulado), y /netx cuenta las postulaciones recibidas.

## Qué quedó hecho (tareas 3/3)
- Tarea 1.1: lógica de postulaciones (tipo, validación, guardado en el navegador) con tests.
- Tarea 1.2: página `/tribus/<id>/postular` con requisitos de ejemplo, ocho preguntas, errores junto a cada campo, confirmación simulada y "Agendar una llamada" (enlace de ejemplo). Botón en la ficha del mapa y en la página del barrio vacante. Sección "Postulaciones de comunidades" en /netx. Los barrios no vacantes o inexistentes dan 404.
- Tarea F.1: verificación, build y accesibilidad en verde. Se sacó el botón simulado "Proponer mi tribu".
- Fuera de alcance: aprobación real por administrador, envío por mail, Calendly real.

## Qué decidir a la mañana
1. **[media] ⚖ de la forma jurídica (hallazgo 4).** La explicación dice "asociación civil o SAS", pero el selector ofrece también Cooperativa y Fundación. Acción sugerida: ampliar la explicación del ⚖ `personeria` (borrador) o sacar esas opciones del selector.
2. **[baja] Mínimo de hogares (hallazgo 5).** Los requisitos piden al menos 3 hogares, pero el formulario acepta desde 1. Acción sugerida: decidir si se exige 3 en el formulario o se cambia el requisito.
3. **[baja] Campos obligatorios (hallazgo 6).** La spec no los fija; el implementador puso 11 de 15 como obligatorios (opcionales: antigüedad, roles, tierra/experiencia). Acción sugerida: confirmar la lista o indicar cuáles cambiar.
4. **[baja] Tabla en /netx (hallazgo 7).** La spec pide solo el número; el PR agrega una tabla (comunidad, barrio, hogares, forma jurídica; sin datos de contacto). Acción sugerida: dejarla, o sacarla y quedarse con el número.
5. **[baja] Texto del ⚖ del Pacto (hallazgo nuevo de la 2ª revisión).** El requisito del Pacto de convivencia muestra el texto del catálogo `pacto`, que habla de propiedad horizontal y escrituras (corresponde a las chacras). La tribu de un barrio recibe licencia de uso, no escritura. Acción sugerida: decidir con legales si se usa ese texto o se redacta uno nuevo marcado `borrador: true`.

También tené en cuenta: las preguntas, los requisitos y el enlace de Calendly son de ejemplo; el formulario pide no cargar datos reales de contacto.

## Revisor: veredicto y hallazgos
- 1ª revisión (con observaciones): cubre los 4 requirements de la spec, cada uno con e2e. 7 hallazgos (0 altos, 3 medios, 4 bajos). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/39#issuecomment-6059050046
- Corregidos por el implementador: (1) el requisito del Pacto no tenía ⚖; (2) con el navegador sin poder leer lo guardado, /netx decía "0 postulaciones" en vez de "sin dato"; (3) el selector de forma jurídica dependía del título del grupo.
- 2ª revisión: "listo para revisión humana", las 3 correcciones verificadas, sin regresiones. Un hallazgo nuevo (baja): el texto del Pacto, punto 5 arriba. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/39#issuecomment-6059088161
- Pendientes tuyos: hallazgos 4, 5, 6, 7 y el nuevo.

## Tester: resultado
Pasó. Playwright: 277 pasaron, 0 fallaron (incluye 10 tests de postulación con accesibilidad). Guion manual de 7 pasos todo bien: /tribus/valle/postular da 404 y /tribus/grano tiene el botón hacia /tribus/grano/postular. No se abrió el enlace externo de Calendly. Se probó la rama tal cual, no contra su base. No hizo falta vuelta de corrección. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/39#issuecomment-6059121938

## Para la próxima noche
- Resolver las 5 decisiones de arriba y, si cambian algo, pasarlas como tareas nuevas.
- El historial tiene un commit duplicado de `lib/` (7ab7439 y 15d44de, mismo mensaje) que no se pudo reescribir; se resuelve con squash al mergear.
- Después de la vuelta de corrección, el implementador no corrió toda la suite e2e; la corrió el tester (277 en verde), así que no queda pendiente.
- Futuro, fuera de esta spec: aprobación real por administrador, mail de aviso y agenda real.
