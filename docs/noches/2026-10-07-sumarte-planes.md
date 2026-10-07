# Noche 2026-10-07 — sumarte-planes
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/16 (base `agente/portada-caminos`) · **Preview:** https://lighthouse-platform-oz9lm3v1l-net-xg-en.vercel.app

## En una línea
La página `/sumarte` (planes, Pase Fundador e inversores, todo simulado) quedó hecha, revisada dos veces y probada sobre el preview sin fallas; falta que decidas una cosa sobre dos frases legales.

## Qué quedó hecho (tareas 4/4)
- 1.1 Datos y estado de Sumarte (`lib/sumarte/datos.ts`, `estado.ts`) con tests contra el mock-up v6, y 13 términos ⚖ nuevos en `lib/legal/terminos.ts`, textuales del mock-up (no borrador).
- 2.1 Página `/sumarte`: cuatro planes, selector Mensual/Anual, niveles del Pase Fundador, medidores de cohorte en texto, tabla comparativa y sección "Para inversores". Todo se guarda en el navegador y está rotulado "(simulado)". Enlace agregado en la navegación.
- 2.2 `e2e/sumarte.spec.ts` (13 escenarios al final) con auditoría de accesibilidad.
- 3.1 `pnpm verificar` (195 tests), `pnpm build` y 84 e2e en verde.

## Qué decidir a la mañana
1. **Dos frases con peso legal están fuera del catálogo** (`lib/legal/terminos.ts`), escritas directamente en `sumarte-cliente.tsx`. Nadie las tocó en la corrección; queda a tu decisión:
   - "Elegibilidad de ejemplo: disponible. Con residencia fiscal en el exterior todavía no se puede entrar…". Está reescrita respecto del mock-up (que solo la muestra cuando la persona no es elegible) y no está marcada como borrador.
   - "No es una inversión…". Es textual del mock-up.
   - **Acción sugerida:** pasar las dos al catálogo con su ⚖; la primera con `borrador: true` porque no viene del mock-up. La otra opción es dejarlas donde están, pero entonces rompen la regla de un solo catálogo. Si aprobás, se hace en una tarea chica la próxima noche.
2. Menor: la elegibilidad de inversor siempre dice "disponible" (así lo pide la spec), con una línea del término `hacienda`. Confirmá que está bien para el prototipo.
3. Menor: se escribió "Invitación pedida (simulado)" y se omitió "Valle Solar te avala" del mock-up. Confirmá si querés recuperar esa frase.
4. Merge: nadie mergea; la base del PR es `agente/portada-caminos`, así que ese PR va antes.

## Revisor: veredicto y hallazgos
- 1ª pasada: con observaciones, 7 hallazgos (1 media, 6 bajas). [Comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/16#issuecomment-6040453535).
  1. (media) Se perdía el foco tras "Sumar mi tribu" y faltaba un e2e de teclado. Corregido.
  2. Con pase activo se podía cambiar el nivel y la tarjeta se contradecía. Corregido.
  3. El pedido de Plan Tribu no se guardaba al recargar. Corregido.
  4. El test de "sin pedidos de red" dependía de localhost. Corregido (ignora solo el prefetch `?_rsc=`).
  5. Mensual/Anual se distinguía solo por color. Corregido (✓ visible).
  6. `outline-none` en el elemento que recibe el foco. Corregido (`focus-visible`).
  7. Frases legales fuera del catálogo: pendiente de tu decisión (arriba).
- 2ª pasada: listo para revisión humana, con la decisión 7 pendiente. Sin hallazgos nuevos. Ojo: revisó leyendo el código, no corrió tests. [Comentario](https://github.com/netxgen-2050/lighthouse-platform/pull/16#issuecomment-6040503509).

## Tester: resultado
Pasa, sin bloqueos. Playwright contra el preview: 84 pasaron, 0 fallaron (incluye `sumarte.spec.ts` y la auditoría de accesibilidad en `/sumarte`). El guion manual de 6 pasos quedó en verde, verificado con los tests y un curl (200), sin una pasada manual aparte. Matiz: el test de activación usa el Pase Brote, no el Raíz, así que el flujo exacto "Quiero el Pase Raíz" no se corrió. [Reporte](https://github.com/netxgen-2050/lighthouse-platform/pull/16#issuecomment-6040523369).

## Para la próxima noche
- Resolver la decisión 1 (mover las dos frases al catálogo) según lo que decidas.
- Agregar un e2e que active el Pase Raíz de punta a punta.
- Revisar con un humano el foco con teclado en la página, ya que el revisor lo comprobó leyendo código y los tests.
