# Noche 2026-10-08 — ajustes-ui-8oct
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/37 · **Preview:** https://lighthouse-platform-d4xfip5so-net-xg-en.vercel.app

## En una línea
Salió todo lo que pedía la spec y los tests pasan (370 unitarios, 264 e2e), pero hay dos cosas que solo vos podés cerrar: mirar el mapa con tus ojos y decidir de dónde sale la condición de "residente" en Fogón y Semillas. Nada falló.

## Qué quedó hecho (tareas 6/6)
Todas las tareas (1.1 a 1.5 y F.1) figuran marcadas. Ojo con la 1.4, que se marcó hecha sin cumplir una parte (ver abajo).
- **Reportar:** el botón tiene un ícono de bicho (decorativo); el nombre para lectores de pantalla no cambió.
- **Inicio:** el botón principal del héroe ahora dice "Explorar el Lighthouse". La tarjeta "Descubrir" pasó a "Ver las tribus" y lleva a /tribus.
- **Tribus 3 / 5 / 4:** Barda Productiva y Puerto Trueque pasan a "En formación". Los barrios 9 y 12 quedan vacantes (sin nombre, declaración ni pozo; 0 comprometido y 0 avales). El indicador de /netx decía 9 escrito a mano; ahora sale de los datos y da 3.
- **Mapa:** leyenda en tres grupos con título, sin repetir colores entre grupos. Hay tres tokens nuevos en `app/globals.css` (violeta, arcilla, rosa).
- **Sin personas de ejemplo:** se sacaron Lucía y Lucas de Fogón, Pactos y Semillas. Las pantallas usan lo que cargaste en /pasaporte (residencia fiscal, modalidad, país). Si no hay nada cargado dicen "sin dato" y enlazan a "Tus datos". Lo guardado con el formato viejo por persona se descarta.

## Qué decidir a la mañana
1. **[media] Residencia: Fogón y Semillas no dicen lo mismo.** Con residencia fiscal en Argentina cargada, Fogón la toma como "residente" y como "beneficiaria/o del fideicomiso" (habilita votar en la Asamblea y en la asamblea del fideicomiso, simulado). Semillas, con el mismo dato, dice "sin dato" en el paso "Residente". Además, Fogón deduce dos condiciones con peso legal a partir de un dato que no las expresa (`lib/fogon/estado.ts:834` contra `app/semillas/semillas-cliente.tsx:204`). La spec no decía de dónde salen estos datos y se eligió el pasaporte. Acción sugerida: decidir de dónde sale cada condición (¿un campo propio en /pasaporte?) y, hasta entonces, que Fogón también diga "sin dato" para lo que el pasaporte no dice, así los dos coinciden. El rol en Pactos y el paso "Residente" de Semillas quedan hoy en "sin dato".
2. **[baja] Mirar el mapa vos mismo.** La tarea 1.4 pedía verificarlo en `pnpm dev` y nadie lo hizo. Mirá `/territorios/lighthouse` y `/territorios/soluna`, sobre todo si se distingue sobre la imagen satelital el borde azul claro de la finca disponible (`mapa-leaflet.tsx:42`). Si no se distingue, pedí otro token.
3. **[baja] Barrios 9 y 12 contra el mock-up v6.** Ya no coinciden con la referencia (`docs/referencia/netx-tribus-mockup-v6.html`). Se ajustaron dos tests para excluirlos. Acción: decidir si se actualiza el mock-up o si queda así.
4. **[baja] Ids `escuela` y `guardia`.** Se mantienen para no romper los enlaces, así que `/tribus/escuela` muestra "Barrio 9" y `/tribus/guardia` muestra "Barrio 12". Acción: aceptar, o pedir renombrar las rutas en un cambio aparte.

## Revisor: veredicto y hallazgos
- **1.ª pasada:** con observaciones, 6 hallazgos ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/37#issuecomment-6058676665)). Se corrigieron 4 en el commit `acaf92a`:
  - Color repetido entre grupos del mapa (el barrio vacante y la finca cantera usaban el mismo).
  - Parpadeo de "Sin dato de tu residencia" en Fogón antes de leer lo guardado.
  - El formato viejo con persona se seguía leyendo como voto propio.
  - Faltaba un test de colores distintos en la leyenda.
- **2.ª pasada:** listo para revisión humana. Los 4 arreglos están bien, sin regresiones, Vercel en verde ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/37#issuecomment-6058730154)). Cumple los 5 requirements de la spec y no hay violaciones de CLAUDE.md.
- **Siguen abiertos:** los puntos 1 a 3 de arriba (el 4 lo declaró el implementador).

## Tester: resultado
Pasó. Playwright: 264 de 264 contra el preview ([comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/37#issuecomment-6058765391)). Sin bloqueos.

**Lo que NO se verificó:**
- No se usó navegador. Los pasos 1 a 5 se revisaron leyendo el HTML con curl.
- Los colores del mapa sobre la imagen satelital no se pudieron juzgar por nadie.
- Los pasos 6 a 9 (flujos de Fogón, Pactos y Semillas con residencia cargada: Argentina, exterior, sin dato) no se probaron a mano; los cubren solo los tests e2e. A mano solo se comprobó que Lucía y Lucas no aparecen en /fogon ni /semillas.
- En la vuelta de corrección el implementador corrió solo los e2e de territorio-mapa y fogon (25). La suite completa (264) se corrió después, en el preview, por el tester.
- El test de "colores distintos" mide los colores de la leyenda, no los del canvas de Leaflet.

## Para la próxima noche
- Cerrar la fuente de datos de residente y beneficiario/a (punto 1) en una spec corta, para que Fogón y Semillas usen lo mismo.
- Según lo que veas en el mapa, un ajuste de tokens de color.
- Si se actualiza el mock-up v6, sacar las exclusiones de los barrios 9 y 12 en `lib/tribus/datos.test.ts:122` y `lib/vista-netx/vista-netx.test.ts:224`.
- Tener en cuenta que las specs siguientes del dictado del 8-oct (postulación de barrios, mercado, manifiesto, pactos v2, semillas v2) tocan Pactos y Semillas, así que conviene resolver el punto 1 antes.
