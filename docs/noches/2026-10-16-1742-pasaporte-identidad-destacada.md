# Noche 2026-10-16-1742 — pasaporte-identidad-destacada
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/82 · **Preview:** https://lighthouse-platform-jh8kycneo-net-xg-en.vercel.app

## En una línea
El Pasaporte ahora tiene una tarjeta propia, arriba de los sellos, para verificar la identidad (KYC). Funciona y pasa las pruebas, pero quedan dos cosas para que decidas vos. Nadie mergeó nada.

## Qué quedó hecho (tareas 3/4)
Lo que no se terminó, primero: la tarea F.1 (sacar capturas de los tres estados a 1440 y 390 px) quedó sin marcar. El implementador no pudo sacarlas y el tester tampoco las revisó.

Hecho:
- 1.1 Tarjeta "Verificá tu identidad (KYC)" en `/pasaporte`, antes de "Tus sellos". Tiene un indicador escrito de tres pasos, para qué sirve, qué no requiere y los cinco pasos del trámite. Tiene los botones "Completar mi verificación (KYC)" y "Simular: verificación aprobada". Si la residencia es del exterior, avisa que por ahora no está habilitado como inversor, con el término legal (⚖). El enlace `/pasaporte#identidad` lleva el foco al encabezado de la tarjeta.
- 1.2 El sello "Identidad verificada" ya no tiene botón: ahora es un enlace "Ver la verificación". El botón de simular quedó solo en la tarjeta.
- 2.1 Pruebas e2e nuevas en `e2e/pasaporte.spec.ts`.
- Después de la revisión se corrigieron dos problemas de foco con teclado (al cerrar el diálogo tras enviar, y al apretar "Ver la verificación" con el hash ya puesto), con dos pruebas e2e más.
- `pnpm verificar` (972 tests) y `pnpm build` en verde. La auditoría de accesibilidad (axe) pasa.

Aparte: el implementador también tocó `e2e/privacidad.spec.ts` y `e2e/accesibilidad.spec.ts`, que no estaban en `tasks.md`. Fue para ajustarlos al cambio del sello.

## Qué decidir a la mañana
1. **Tarjeta verificada en una línea (baja).** La spec pide que, al estar verificada, la tarjeta se achique a una línea con la fecha y si quedó habilitada. El código muestra dos párrafos y además deja el indicador de tres pasos. Funciona, pero la forma no coincide. Acción sugerida: aceptarlo y cambiar el texto de la spec, o pedir que se ajuste el código a una línea. Está en `app/pasaporte/tarjeta-identidad.tsx:86-97`.
2. **Capturas F.1 (baja).** Faltan las capturas de los tres estados (sin empezar, en trámite, verificada) a 1440 y 390 px. Acción sugerida: sacarlas vos desde el preview, o aceptar el PR sin ellas y marcar la tarea como pendiente.
3. **Duda del implementador.** El enlace "Ver la verificación" del sello aparece solo cuando no hay trámite en curso. Acción sugerida: mirarlo en el preview y decir si te parece bien.

## Revisor: veredicto y hallazgos
Veredicto en las dos pasadas: con observaciones. 0 altas, 0 medias.
- Primera pasada, 3 bajas. Las dos de foco con teclado se corrigieron (commit 4e84823). La tercera es la de la línea única, que quedó para vos.
- Segunda pasada: correcciones verificadas, sin regresiones, sin problemas con las reglas de CLAUDE.md (sin textos legales nuevos, sin cobros, sin colores sueltos, un solo `<main>`). Quedan las dos pendientes de arriba.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/82#issuecomment-6220405439 y https://github.com/netxgen-2050/lighthouse-platform/pull/82#issuecomment-6220641968

## Tester: resultado
Pasa en el preview. La suite completa de Playwright dio 545 que pasaron, 1 que falló, 2 inestables y 12 omitidos.
- Falló `e2e/congreso.spec.ts:101` (diálogo de compra en Congreso). No es de este PR y pasó al repetirla.
- Inestables, tampoco de este PR: `e2e/compromisos.spec.ts:152` y `e2e/contactos.spec.ts:110`.
- Omitido en Pasaporte: `e2e/pasaporte.spec.ts:287` (almacenamiento bloqueado), una omisión que ya existía.
- El guion manual de 6 pasos dio bien, pero se comprobó con los e2e de `pasaporte.spec.ts` contra el preview, no con un recorrido a mano en el navegador.

## Para la próxima noche
- Sacar las capturas F.1 y cerrar esa tarea (o sacarla de `tasks.md` si decidís aceptar sin ellas).
- Ajustar la tarjeta verificada a una línea, o la spec, según lo que decidas.
- Mirar los tres tests que fallaron o fueron inestables en Congreso, Compromisos y Contactos; no son de este cambio, pero conviene que alguien los revise.
- Un recorrido manual en el navegador del Pasaporte, que esta noche no se hizo.
