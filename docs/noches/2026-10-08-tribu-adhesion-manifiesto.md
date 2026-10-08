# Noche 2026-10-08 — tribu-adhesion-manifiesto
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/42 · **Preview:** https://lighthouse-platform-9wni111v8-net-xg-en.vercel.app

## En una línea
Ya se puede leer el manifiesto de cada tribu (y el Pacto de convivencia del Lighthouse), adherir con conciencia y ver el estado de membresía. Nada falló: el tester pasó 298 de 298 pruebas. Quedan dos decisiones tuyas.

## Qué quedó hecho (tareas 3/3)
- 1.1 Datos: 8 manifiestos de ejemplo (uno por tribu activa o en formación) más el del Lighthouse, y los estados de membresía por comunidad, con tests.
- 2.1 Pantallas: lectura y adhesión del manifiesto; los botones cambian según seas o no miembro, en la página de la tribu y en el resumen del Lighthouse.
- F.1 Integración: `pnpm verificar` (399 tests) y `pnpm build` en verde, sin violaciones de accesibilidad.

Cómo funciona: el botón Adherir queda apagado hasta llegar al final del texto y marcar las dos casillas. Al adherir aparece "Tu pedido llegó". La aceptación es simulada. Si ya sos miembro aparecen "Proponer mi pacto" y "Entrar a la sala". Todo es de ejemplo, nadie paga nada.

Dato de la integración: la rama venía de una corrida anterior sin PR. Se le sumó `main` (merge, con 4 conflictos resueltos conservando ambas versiones). Como `main` convirtió Escuela de la Tierra y Guardianes del Monte en barrios vacantes (sin manifiesto), se les quitó el manifiesto: de 9 pasamos a 8.

## Qué decidir a la mañana
1. **Los manifiestos y el texto legal (media).** Los manifiestos son el texto al que la persona adhiere, pero viven fuera del catálogo legal (`lib/legal/terminos.ts`) y están marcados "ejemplo", no "borrador". El de Barda Productiva habla de la SAS y del estatuto sin el ⚖ (`lib/manifiestos/datos.ts` líneas 121 y 141).
   - Acción sugerida: elegir una. (a) Tratarlos como texto legal: pasarlos al catálogo o a un mecanismo equivalente marcado como borrador. (b) Dejarlos como ejemplo y quitar de ellos las referencias jurídicas (SAS, estatuto). La (b) es más rápida para el prototipo; la (a) es más segura antes de mostrarlo afuera.
2. **Choque con Pactos (baja).** La propuesta dice que el pacto de convivencia deja de ser un tipo de pacto y pasa a ser este paso de adhesión. Pero `/pactos` sigue ofreciendo "Pacto de convivencia" como tipo, y no lee el dato `?comunidad=` que le mandan los botones "Proponer mi pacto".
   - Acción sugerida: abrir un cambio nuevo de Pactos que quite ese tipo y lea la comunidad. No hace falta resolverlo en este PR.

Nada más bloquea el merge. Mergear o no es decisión tuya.

## Revisor: veredicto y hallazgos
Con observaciones en las tres vueltas; 0 altas en total. Ya no hay nada corregible pendiente salvo un test.
- Primera vuelta: 5 hallazgos. Se corrigieron tres: el foco de teclado se perdía y los avisos no se anunciaban bien; "Adherir" no tenía ⚖; había código sin uso.
- Segunda vuelta: las tres correcciones funcionan. Aparecieron dos bajas, corregidas: el lector de pantalla repetía el aviso al volver con estado guardado, y faltaba probar el foco tras "Simular" en la tribu y el Lighthouse.
- Tercera vuelta (final): sin regresiones, los 4 requisitos de la spec cubiertos, 399 tests y 30 pruebas e2e locales en verde. Quedan las dos decisiones de arriba y una baja que no bloquea: falta un test que compruebe que la zona de avisos queda vacía al volver con estado guardado en `/tribus/valle/manifiesto` (`lectura.tsx:99`). El código está bien; no se corrigió por el tope de dos vueltas.

## Tester: resultado
Pasó, sin bloqueos. Suite completa de Playwright contra el preview: 298 de 298, incluido axe. El guion manual de 8 pasos quedó cubierto por `e2e/membresia.spec.ts`, pero nadie lo recorrió a mano.
- Aclaración: en el paso 5 se verificó que "Proponer mi pacto" apunta a `/pactos?comunidad=valle` y que aparece "Entrar a la sala"; no se verificó por separado el texto del mensaje simulado de ese botón.
- Aviso menor: en el test de la tribu vacante `grano` (404 a propósito) apareció un `NoFallbackError` en el servidor; el test pasó.

## Para la próxima noche
- Cambio de Pactos: quitar "Pacto de convivencia" como tipo y leer `?comunidad=` (decisión 2).
- Según lo que decidas en la 1: mover los manifiestos al catálogo legal como borrador, o sacarles las referencias jurídicas.
- Agregar el test de la zona de avisos vacía en `/tribus/valle/manifiesto`.
- Pendiente fuera de alcance: aprobación real del manifiesto por un admin y firma de versiones.
- Los textos de los manifiestos son de ejemplo; revisarlos antes de cualquier uso fuera del equipo.
