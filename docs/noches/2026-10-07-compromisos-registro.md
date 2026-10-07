# Noche 2026-10-07 — compromisos-registro
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/10 (base `agente/territorio-ficha`) · **Preview:** https://lighthouse-platform-8mm2e0pxj-net-xg-en.vercel.app

## En una línea
No falló nada. La página `/compromisos` ahora admite tres clases de compromiso (Tiempo, Bienes y Plata, con monto orientativo en USD y sin cobrar nada), todo guardado solo en el navegador. Quedan cuatro cosas para que decidas vos, ninguna bloquea el PR. Ojo con un dato: las dos últimas correcciones del implementador no pasaron por una tercera revisión.

## Qué decidir a la mañana
1. **Tribus vacantes en "Para quién" (media).** El selector ofrece "Barrio 3" y "Barrio 8" (`app/compromisos/page.tsx:10`, vienen de `lib/tribus/datos.ts`). La proposal dice que no se mencionan barrios. Acción sugerida: filtrar las tribus con `estado === "vacante"`. Es un cambio de una línea, pero la decisión es tuya: sacarlas, o aceptarlas y ajustar la proposal.
2. **Texto del pie (fuera de este PR).** `components/pie.tsx:19` dice "Prototipo en desarrollo. Datos de ejemplo." y CLAUDE.md exige "Prototipo interno · datos de ejemplo" en todas las páginas. Viene de la rama base (`agente/territorio-ficha`), no de este PR. Acción sugerida: corregirlo en esa rama antes de mergearla, o en un cambio aparte.
3. **Tope y entero del monto de Plata (baja).** El implementador eligió que el monto sea un entero de 1 a 1.000.000 USD (`lib/compromisos/tipos.ts:38-39`). Es opcional: si queda vacío se muestra "sin dato", nunca 0. Acción sugerida: confirmar los valores o decir cuáles querés.
4. **Leyenda "no vinculante" con ⚖ (baja).** No se agregó a propósito. Hoy solo hay una nota técnica: "no se cobra ni se paga nada". Con la regla actual los agentes pueden redactar la leyenda como borrador (`borrador: true`) en `lib/legal/terminos.ts`. Acción sugerida: decir si la querés ahora; si sí, se agrega en una noche corta, y como texto nuevo queda marcada como borrador para revisar.

Dos cosas más para tener presentes, sin urgencia:
- **Descripción libre sin filtro de montos.** Una persona puede escribir un monto a mano en la descripción y no se detecta. Acción sugerida: aceptarlo mientras sea prototipo.
- **Merge.** El PR #10 está apilado sobre `agente/territorio-ficha`. Conviene mergear primero esa rama (PR #12). Solo vos mergeás.

## Qué quedó hecho (tareas 10/10)
Esta fue una vuelta de corrección: el PR ya estaba abierto.
- Se trajo la base corregida (`origin/agente/territorio-ficha`) sin conflictos.
- Nueva clase **Plata**: monto orientativo en USD, opcional, "sin dato" si queda vacío, con la nota "no se cobra ni se paga nada". Ningún flujo cobra: los pagos son simulados, como pide la fase de prototipo.
- Se reescribieron spec, design y proposal para que digan lo mismo que el código (antes decían que Plata estaba fuera de alcance).
- Al apretar "Quitar" o "Borrar todo", el foco pasa al título "Tus compromisos" y el lector de pantalla anuncia "Compromiso quitado." o "Se borraron todos los compromisos.".
- Tests nuevos: la nota de Plata y los avisos de modo demostración y de datos de ejemplo.
- `/compromisos` se agregó a la auditoría de accesibilidad (axe): 18 rutas, sin violaciones.
- Este reporte se reescribió entero. El anterior decía "sin plata" y "ningún agente redacta textos legales", y ninguna de las dos cosas es cierta ya.
- `pnpm verificar` (184 tests), `pnpm build` y e2e (89/89 en local) en verde.

## Revisor: veredicto y hallazgos
Veredicto final: con observaciones (⚠️), el de la segunda pasada. Todo lo corregible quedó corregido, salvo que las dos correcciones de la última vuelta **no fueron re-revisadas** (el máximo es dos vueltas del revisor). Son chicas y el tester las cubrió, pero conviene que las mires.
- Primera pasada (⚠️): docs que aún decían "sin plata", reporte viejo, foco y anuncio al quitar, y faltaban tests de la nota de Plata y de los avisos. Todo corregido.
- Segunda pasada (⚠️): correcciones verificadas, sin regresiones, 184 tests y 20 e2e de compromisos en verde. Quedaban dos corregibles, y ambos se arreglaron en la última vuelta sin re-revisión:
  - Faltaba `/compromisos` en la auditoría axe. Ya está. Aclaración: axe audita solo el estado inicial (clase Tiempo), no con Plata elegida.
  - `proposal.md:13` no mencionaba el monto en USD. Ya está alineado.
- Los tres puntos que siguen abiertos son los de arriba: tribus vacantes, tope y entero del monto, y leyenda "no vinculante".
- Sin hallazgos de seguridad: no hay secretos ni pedidos al servidor, `localStorage` se valida al cargar y se usan solo tokens del tema.

## Tester: resultado
Pasa, sin bloqueos.
- Playwright contra el preview: 91 pasaron, 0 fallaron (incluye axe sobre `/compromisos`).
- Guion manual 8/8:
  - Plata con 500 muestra "USD 500"; los límites 1 y 1.000.000 se aceptan.
  - Plata vacía muestra "sin dato", también tras recargar.
  - 0, 1.000.001, 2,5 y -5 dan error junto al campo, con el foco en el campo, y no agregan nada.
  - Horas 0, 161 y 2,5, y una descripción de 161 caracteres, también se rechazan.
  - Quitar y Borrar todo mueven el foco al título y se anuncian; el registro solo con teclado anuncia "Compromiso registrado.".
- Con esto queda cubierto el pendiente 4.1 de las tareas (e2e contra el preview).

## Para la próxima noche
- Cuando decidas lo de las tribus vacantes, es un cambio de una línea.
- Corregir el texto del pie en la rama base, o en un cambio aparte.
- Si querés la leyenda "no vinculante", pedirla como cambio chico; queda como borrador hasta que alguien la revise.
- Si se quiere más cobertura de accesibilidad, ampliar axe para que también audite el formulario con Plata elegida.
- Antes de mostrar la plataforma fuera del equipo, revisar las reglas del prototipo (pendiente R14 en `NS_platform/Documentation/Desarrollo/Segunda revisión/`).
