## 0. Prerrequisitos

- [x] 0.1 Confirmar que `perfil-entrevista`, `compromisos-registro` y `congreso-registro` están en `main` y que sus claves de `localStorage` son las de la tabla del design. Si falta alguno o una clave es distinta, frenar y reportar. Verificar con `git log origin/main --oneline` y `grep -rn "CLAVE =" app`.

## 1. Lógica

- [x] 1.1 Crear `lib/demo/claves.ts` con `CLAVES` (valores actuales, sin cambiarlos) y su test que fija cada valor. Verificar con `pnpm verificar`.
- [x] 1.2 Reemplazar `const CLAVE = …` por `CLAVES.<x>` en `app/perfil/entrevista.tsx`, `app/compromisos/formulario.tsx` y `app/congreso/registro-ticket.tsx`. Verificar con `grep -rn "const CLAVE =" app` (no devuelve nada) y con la tarea 3.2.
- [x] 1.3 Crear `lib/demo/resumen.ts` (`resumirDemo`) y su test con un lector falso: todo vacío → tres `null` y próximo `"perfil"`; perfil 2/6 → próximo `"perfil"`; perfil 6/6 sin compromisos → `"compromisos"`; perfil 6/6 + 1 compromiso sin ticket → `"congreso"`; todo completo → `null`; JSON roto en cada clave → `null` en ese campo; ticket `"1234"` → `null`. Verificar con `pnpm verificar`.
- [x] 1.4 Crear `lib/demo/borrar.ts` (`borrarDemo`) y su test: llama a `quitar` una vez por clave. Verificar con `pnpm verificar`.

## 2. Página

- [x] 2.1 Crear `app/panel/page.tsx` y `app/panel/resumen.tsx` con el próximo paso, las tres tarjetas, el aviso, el botón de borrado con `window.confirm` y el error de almacenamiento. Verificar en `pnpm dev`: completar parte del perfil, un compromiso y un ticket, abrir `/panel` y recorrerlo solo con teclado.
- [x] 2.2 Agregar "Mi recorrido" → `/panel` a la lista única de navegación (`lib/navegacion.ts`, del rail) si existe en la base; si no, al final de `enlaces` en `components/encabezado.tsx`. Verificar en `pnpm dev`.
- [x] 2.3 Verificar que no hay colores sueltos ni `<main>` nuevo: `grep -rnE "stone-|emerald-|amber-|#[0-9a-fA-F]{3,6}" app/panel` y `grep -rn "<main" app/panel` no devuelven nada.

## 3. Tests

- [x] 3.1 Escribir `e2e/panel.spec.ts` con todos los escenarios de la spec, cargando los datos por las páginas reales (no escribiendo `localStorage` a mano, salvo para el código inválido y el almacenamiento bloqueado): perfil a medias y sin empezar, compromisos 2/1 sin "h/mes", "USD" ni "$", sin compromisos, ticket válido e inválido, próximo paso en cada caso, borrar todo (y comprobar `/perfil`, `/compromisos` y `/congreso` vacíos), cancelar el borrado, sin pedidos de red con los datos, error de almacenamiento, orden de Tab y `aria-current`. Verificar con `pnpm test:e2e e2e/panel.spec.ts`.
- [x] 3.2 Correr los e2e de perfil, compromisos y congreso para confirmar que el cambio de claves no rompió nada. Verificar con `pnpm test:e2e` completo en verde.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/panel-recorrido` con guion de prueba (perfil a medias → panel → próximo paso → completar → panel → borrar todo) y capturas del panel vacío, a medias y completo. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/panel-recorrido> pnpm test:e2e e2e/panel.spec.ts`.
