# Noche 2026-10-07 — territorios-modelo
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/8 · **Preview:** https://lighthouse-platform-3rzderxs9-net-xg-en.vercel.app

## Lo que falló o quedó trabado (primero)
- El reporte del tester **no quedó publicado como comentario en el PR**. La herramienta Write rechazó crear el archivo en `.noches/tmp/` y el tester no lo resolvió de otra manera. Lo que dijo el tester está resumido más abajo, pero no está en el PR.
- En la sesión del revisor también estaba deshabilitado Write. Publicó el comentario con `--body` y con títulos en HTML (`<h2>`, `<h3>`) porque el validador rechaza líneas que empiezan con `#`. Se lee bien, pero se ve distinto de los otros comentarios.
- Los dos casos son un tema de permisos de las sesiones, no del código. Conviene revisar los permisos antes de la próxima noche.

## En una línea
Se armó el modelo de "territorio" (hoy solo el Lighthouse, con datos de ejemplo) y cada una de las 12 tribus quedó asociada a un territorio. No hay pantallas nuevas.

## Qué quedó hecho (tareas 6/6)
- 1.1 y 1.2: módulo nuevo `lib/territorios/` con los tipos y los datos. Incluye el territorio `lighthouse` con 4 bienes comunes, sin montos ni horas. Funciones para listar, buscar, ver las tribus de un territorio (ordenadas por barrio) y calcular el resumen. El resumen devuelve "sin resultado" si el territorio no existe, nunca ceros.
- 2.1: `Tribu` tiene `territorioId` y las 12 tribus apuntan a `lighthouse`. Las páginas de `/tribus` no cambian.
- 3.1 y 3.2: tests por cada escenario de la spec, y un test de guarda que falla si `datos.ts` menciona "USD", "$", "lote" o "parcela".
- 4.1: `pnpm verificar` (147 tests) y `pnpm build` en verde. Los e2e de tribus pasaron 7/7.

## Qué decidir a la mañana
1. **[baja] Texto de `descripcion` del territorio** (`lib/territorios/datos.ts:14`). La spec no dice qué texto usar. Se usó la frase de la portada del mock-up: "~1.000 ha, doce barrios y las tribus que los están formando." No se copió la descripción larga de la pantalla del territorio porque menciona "Lote 7" y licencias de uso, y eso no corresponde todavía.
   - Acción sugerida: aceptarla como está, o dejar que la próxima spec (`territorio-ficha`) fije el texto. No bloquea el merge.
2. **Comentario del tester sin publicar.** Acción sugerida: leer el resumen de abajo; no hace falta repetir la prueba, salvo que quieras el comentario en el PR.

No hay hallazgos de severidad alta ni media.

## Revisor: veredicto y hallazgos
- **Ronda 1:** con observaciones, 0 alta, 0 media, 2 baja.
  - Un test ("la superficie ausente es undefined, no 0") no probaba los datos reales. Se corrigió en la vuelta de corrección.
  - La duda sobre `descripcion` (arriba, para decidir).
- **Vuelta de corrección:** el implementador corrigió el test en el commit 99b740c, con `pnpm verificar` y `pnpm build` en verde. No tocó `descripcion`, como correspondía.
- **Ronda 2:** listo para revisión humana. 0 alta, 0 media, 1 baja pendiente (`descripcion`).
- Reglas no negociables: sin textos legales nuevos, sin plata ni lotes, el dato que falta no es cero. Datos de ejemplo y accesibilidad no aplican porque no hay UI.
- Comentarios: [ronda 1](https://github.com/netxgen-2050/lighthouse-platform/pull/8#issuecomment-6035990232) y [ronda 2](https://github.com/netxgen-2050/lighthouse-platform/pull/8#issuecomment-6036007943).

## Tester: resultado
Pasa, con alcance limitado. Fallas de la app: ninguna.
- Playwright contra el preview: 20 pasaron, 0 fallaron (portada, marco, listado de tribus, valle, avelan, grano, 404, teclado en el ⚖, "sin plata ni avales").
- Guion manual: `/tribus` muestra las 12 tarjetas en orden y con el estado escrito; `/tribus/valle` responde 200.
- No probado por el tester: `pnpm verificar` y `pnpm build` (los corrió el implementador; además el preview compiló).
- No se pudo probar `lib/territorios/` en el preview, porque son funciones sin ruta ni pantalla. Su cobertura son los tests unitarios.
- Su reporte no se publicó en el PR (ver el bloqueo arriba). No hizo falta vuelta de corrección.

## Para la próxima noche
- Arreglar los permisos de Write en las sesiones del revisor y del tester (incluyendo `.noches/tmp/`).
- Spec `territorio-ficha`: puede mostrar el territorio en pantalla y fijar el texto de `descripcion`. Ahí sí aplican los datos de ejemplo declarados y el banner de lotes si se mostraran lotes.
- Esperar tu merge de este PR antes de apilar cambios que dependan de `territorioId`.
