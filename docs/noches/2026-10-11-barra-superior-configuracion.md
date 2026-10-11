# Noche 2026-10-11 — barra-superior-configuracion
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/54 · **Preview:** https://lighthouse-platform-dgoo8hn34-net-xg-en.vercel.app

## En una línea
Nada falló al final: la barra superior fija y la página de Configuración están listas y probadas, pero hay que decidir qué hacer con la moneda, que quedó convertida solo en Sumarte y Pactos.

Durante la noche hubo dos fallas que ya se arreglaron: un test de Hifa que el tester vio fallar en el preview (era un defecto del test, no de la app) y detalles menores que marcó el revisor.

## Qué quedó hecho (tareas 4/4)
- 1.1 Barra superior fija con NetX "Interno", campanita y avatar. El menú del avatar tiene Perfil, Pasaporte, Mi recorrido, Configuración y Salir (deshabilitado). Funciona con teclado y Escape. El rail lateral quedó solo con navegación.
- 2.1 Preferencias guardadas en el navegador (`lib/configuracion/`), con tests.
- 2.2 Página `/configuracion` con Apariencia (tema claro, oscuro o del sistema; texto grande; menos animaciones), Notificaciones (5 tipos), Asistente (ocultar Hifa), Moneda (USD o ARS, con 1 USD = 1.400 ARS de ejemplo), Idioma (inglés "próximamente") y Tus datos. "Borrar todo" se movió ahí, con enlace desde Mi recorrido.
- F.1 `pnpm verificar`, `pnpm build` y accesibilidad en verde. El tema oscuro se revisó con axe en 15 rutas, sin violaciones. Sin scroll horizontal a 390 px.

Cosas que se tocaron sin que las pidiera la spec, para que la barra fija no rompiera nada: el tooltip ⚖ y 2 tests de tribus, un `scroll-padding-top`, y el arreglo de un scroll horizontal que ya existía en `/sumarte` a 390 px.

## Qué decidir a la mañana
1. **Alcance de Moneda (media).** La spec dice "todos los montos", pero solo se convierten Sumarte y Pactos. Tribus, NetX y Compromisos siguen en USD. Acción sugerida: elegir entre convertir también esas tres pantallas (otro cambio) o acotar la spec a Sumarte y Pactos antes de archivar.
2. **Monto de Pactos (baja).** El campo Monto va en USD (1 USD = 1 Semilla) mientras los aportes se muestran en ARS. Acción sugerida: aceptarlo así para el prototipo o pedir que el campo siga la moneda elegida.
3. **Tema oscuro (baja).** El token `deep` está invertido, así que el rail queda verde claro. Los contrastes calculados pasan, pero el foco dorado sobre `deep` da ~3,2:1. Acción sugerida: mirarlo a ojo en oscuro y pedir otra paleta si no te cierra.
4. **Limitación conocida.** Con ARS elegido, `/sumarte` muestra un instante los precios en USD antes de cargar. Se dejó así por riesgo de hidratación. Acción sugerida: aceptar para el prototipo.
5. **NetX visible para todas las personas.** Los roles quedaron fuera de alcance, según la propuesta. Acción sugerida: confirmar que está bien en esta fase.
6. **Menor (tester).** En el menú del avatar la flecha abajo no mueve el foco (Tab sí). No estaba pedido. Acción sugerida: anotarlo para otra noche.

## Revisor: veredicto y hallazgos
Veredicto final (3ª pasada): listo para revisión humana, 0 hallazgos abiertos. Cubre 6 de 7 requirements; Moneda queda parcial, según la decisión 1.

- 1ª pasada: con observaciones (0 altas, 1 media, 4 bajas). La media es la de Moneda. Las bajas: monto de Pactos, tema oscuro, parpadeo de Hifa apagada al cargar, y faltaban rutas en el axe oscuro. El script del `<head>` se consideró seguro (texto fijo, sin datos de la persona). Si algún día hay CSP necesitará nonce o hash.
- Corrección 1 (44b7b8b): Hifa ya no parpadea (`data-hifa` en `<html>` más regla CSS) y el axe oscuro pasó a 15 rutas.
- 2ª pasada: 3 bajas. La descripción del PR estaba desactualizada y había un comentario suelto de un intento fallido; el test de Hifa no probaba la ausencia de parpadeo; un comentario mal ubicado en `globals.css`.
- Corrección 2 (0ec63fb): descripción reescrita, test que bloquea el JS para no hidratar (con control), comentario movido.

## Tester: resultado
**Primera corrida: FALLA** (commit 0ec63fb). Falló `e2e/configuracion.spec.ts:99` (Hifa apagada sin hidratar). Vercel agrega `?dpl=` a los scripts y el bloqueo del test no los reconocía. Era un defecto del test, no de la app.

Corrección (3cb64fd): el bloqueo ahora ignora la query. Se verificó que el test falla si se quita la regla CSS.

**Segunda corrida: PASA** (deploy de 3cb64fd confirmado).
- `configuracion` 31/31 sin reintentos.
- Suite completa: 403 ok, 0 fallas, 2 flaky ajenos al PR (`accesibilidad.spec.ts:26` y `pactos.spec.ts:263`). En la primera corrida hubo 3 flaky ajenos (`contactos.spec.ts:191`, `membresia.spec.ts:29`, `territorio.spec.ts:29`).
- Guion manual sin fallas: barra en 17 rutas, menú del avatar, "Borrar todo" vacía el localStorage incluidas las preferencias, sin scroll horizontal a 390 px, la barra no tapa contenido ni foco, tooltips ⚖ debajo de la barra.
- Con ARS siguen en USD `/tribus/valle`, `/netx` y `/compromisos` (es la decisión 1).

## Para la próxima noche
- Según tu decisión: convertir Moneda en tribus, NetX y Compromisos, o ajustar la spec.
- Flechas del teclado en el menú del avatar.
- Mirar los flaky que aparecen seguido (`accesibilidad.spec.ts:26`, `pactos.spec.ts:263`, `sumarte.spec.ts:113`, `contactos.spec.ts:191`, `membresia.spec.ts:29`, `territorio.spec.ts:29`), que no son de este PR.
- Después de que mergees: archivar el cambio con `/opsx:archive`.

Nota del entorno: la corrida fue en la nube (`gh pr` no funciona, se usó `scripts/pr.sh`) y los subagentes corrieron en segundo plano.
