## 0. Prerrequisitos

- [x] 0.1 Confirmar que `navegacion-base` (tokens, encabezado y `<main id="contenido">` en el layout) está en `main`. Si no, frenar y reportar. Verificar con `git log origin/main --oneline` y revisando `app/layout.tsx`.

## 1. Lógica

- [x] 1.1 Crear `lib/compromisos/tipos.ts`, `validar.ts`, `estado.ts` y `formato.ts` según el design (unión `clase` sin plata). Verificar con `pnpm exec tsc --noEmit`.
- [x] 1.2 Tests de Vitest en `lib/compromisos/*.test.ts`: descripción vacía y de 141 caracteres; horas 0, 161, 2,5 y vacías; bienes de 61 caracteres; registrar/quitar/borrar todo; orden más reciente primero; `describirCompromiso` con y sin cantidad ("sin dato") y con destino Lighthouse o tribu; `cargar` con JSON inválido devuelve lista vacía. Verificar con `pnpm test`.

## 2. Página

- [x] 2.1 Crear `app/compromisos/page.tsx` y `app/compromisos/formulario.tsx` con el formulario, la lista, "Quitar", "Borrar todo", aviso de demostración, `AvisoEjemplo` y región `aria-live="polite"`; persistencia en `localStorage` (`lighthouse.compromisos.v1`). Contenedor raíz sin `<main>`; solo tokens del tema. Verificar en `pnpm dev` completando el flujo solo con teclado.
- [x] 2.2 Verificar que no quedan colores sueltos ni `<main>`: `grep -rnE "stone-|emerald-|amber-|#[0-9a-fA-F]{3,6}" app/compromisos` y `grep -rn "<main" app/compromisos` no devuelven nada.
- [x] 2.3 Agregar "Compromisos" → `/compromisos` al encabezado global con `aria-current` en esa ruta. Verificar que `e2e/portada.spec.ts` sigue en verde.

## 3. E2E

- [x] 3.1 Escribir `e2e/compromisos.spec.ts` con todos los escenarios de la spec, incluidos "sin opciones de plata" (opciones de Clase y ausencia de `USD`, `$`, "plata", "monto", "aporte" en el texto), "sin pedidos al servidor" (escuchar `page.on("request")` y verificar que ninguna URL ni cuerpo contiene las descripciones), recarga, solo teclado y exactamente un `main`. Verificar con `pnpm test:e2e e2e/compromisos.spec.ts`.

## 4. Integración

- [x] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/compromisos-registro` con guion de prueba (registrar una oferta de tiempo, una necesidad de bienes, recargar, quitar, borrar todo). Probar sobre el preview con `BASE_URL=$(scripts/preview-url.sh agente/compromisos-registro) pnpm test:e2e e2e/compromisos.spec.ts`.

## 6. Vuelta de corrección (7-oct)

- [ ] 6.1 Traer la base corregida: `git fetch origin` y `git merge --no-edit origin/agente/territorio-ficha`, conservando lo de la base en los conflictos. Verificar con `pnpm verificar` y `pnpm test:e2e`.
- [ ] 6.2 Fase de prototipo (ver `CLAUDE.md`): agregar la clase "Plata" a los compromisos (monto orientativo en USD, opcional, "sin dato" si no se completa), además de Tiempo y Bienes. Actualizar la lógica, los tests y el e2e. El PR #10 ya existe: actualizar su descripción, no abrir otro.
