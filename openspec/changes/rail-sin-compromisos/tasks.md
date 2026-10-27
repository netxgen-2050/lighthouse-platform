# Tasks

## 1. Marca `oculto` en la lista única

- [ ] 1.1 En `lib/navegacion.ts`, agregar al tipo `Destino` el campo opcional `oculto?: true` con un comentario que diga que solo saca el destino de los menús (la página sigue con su URL y su permiso) y que Compromisos se oculta por decisión de Gus del 27-oct-2026. Hacer que `destinosDeGrupo` filtre `!d.oculto`; `destinosDisponibles()` no cambia. Verificar con `pnpm typecheck` sin errores.
- [ ] 1.2 Marcar Compromisos con `existe: true, oculto: true`, en su mismo lugar de `DESTINOS`. Verificar que `git diff lib/navegacion.ts` muestra solo el campo nuevo, el filtro y esa marca.
- [ ] 1.3 En `lib/navegacion.test.ts`: dejar el test de orden de `DESTINOS` como está; cambiar Participar a `["Pactos", "Semillas", "Fogón", "Congreso"]` y en inglés a `["Pacts", "Semillas", "Fireside", "Congress"]`; agregar un test "Compromisos existe pero no aparece en ningún grupo" y otro "todo destino oculto existe". Verificar con `pnpm test -- lib/navegacion.test.ts` en verde, incluido el test de `existe` contra `app/`.

## 2. e2e del rail

- [ ] 2.1 `e2e/marco.spec.ts`: sacar "Compromisos" del orden esperado, pasar el conteo de Participar de 5 a 4 y agregar que en la navegación "Principal" no hay enlace "Compromisos", también en el test de celular 390 x 844. Verificar con `pnpm test:e2e e2e/marco.spec.ts` en verde.
- [ ] 2.2 `e2e/descubrir-publico.spec.ts` (línea 86) y `e2e/sumarte-acceso.spec.ts` (constante `PARTICIPAR`): quitar "Compromisos" de las listas y agregar que no aparecen ni el enlace "Compromisos" ni la ayuda "Sumate para participar: Compromisos". Verificar con `pnpm test:e2e e2e/descubrir-publico.spec.ts e2e/sumarte-acceso.spec.ts` en verde.
- [ ] 2.3 `e2e/fixtura.ts`: actualizar el comentario de la línea 53 para que nombre Pactos, Semillas y Fogón (sin Compromisos). Verificar con `grep -n "Compromisos" e2e/fixtura.ts` sin resultados.

## 3. La página por su URL

- [ ] 3.1 `e2e/compromisos.spec.ts`: reemplazar el test "exactamente un main y Compromisos marcado en el encabezado" por uno que, entrando con `page.goto("/compromisos")`, verifique un único `<main>`, que la navegación "Principal" no tiene enlace "Compromisos" y que ningún enlace suyo tiene `aria-current="page"`. Verificar con `pnpm test:e2e e2e/compromisos.spec.ts` en verde.
- [ ] 3.2 `e2e/idioma-fogon-mercado.spec.ts`: en el bloque "Compromisos y Mercado en inglés" (ya entra por la URL), agregar que la navegación principal no trae "Commitments". Verificar con `pnpm test:e2e e2e/idioma-fogon-mercado.spec.ts` en verde.
- [ ] 3.3 Confirmar que no queda ningún e2e que busque el enlace en el rail: `grep -rn "name: \"Compromisos\"" e2e` solo devuelve aserciones de `toHaveCount(0)` o el título de la página. Y que no se tocó el contenido: `git diff --stat` no incluye `app/compromisos/`, `lib/compromisos/`, `lib/actividad/eventos.ts`, `lib/permisos/`, `lib/privacidad/` ni `lib/idioma/textos/`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde.
- [ ] 4.2 `pnpm test:e2e` completo en verde (incluye `accesibilidad.spec.ts`, que sigue auditando `/compromisos` con axe por su URL).
