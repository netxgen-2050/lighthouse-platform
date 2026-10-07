## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `navegacion-base` (tokens en `app/globals.css`, `components/encabezado.tsx`, `<main id="contenido">` en el layout) y `territorios-modelo` (`lib/territorios/`) están en `main`. Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls lib/territorios app/globals.css`.

## 1. Página

- [x] 1.1 Crear `app/territorios/[id]/page.tsx` (Server Component, `generateStaticParams` desde `listarTerritorios()`, `generateMetadata` con el nombre) con encabezado, superficie o "sin dato", resumen en `<dl>`, lista de los 12 barrios enlazados a `/tribus/[id]` con `SelloTribu` + texto de estado, sección "Bienes comunes" por nombre y `AvisoEjemplo`. Contenedor raíz sin `<main>`; solo tokens del tema. Verificar en `pnpm dev` abriendo `/territorios/lighthouse` y recorriéndola solo con teclado.
- [x] 1.2 Crear `app/territorios/[id]/not-found.tsx` con enlace a la portada. Verificar abriendo `/territorios/no-existe`.
- [x] 1.3 Verificar que no quedan colores sueltos: `grep -nE "stone-|emerald-|amber-|#[0-9a-fA-F]{3,6}" app/territorios -r` no devuelve nada, y `grep -n "<main" app/territorios -r` tampoco.

## 2. Navegación

- [x] 2.1 Agregar "Territorio" → `/territorios/lighthouse` al encabezado global, entre "Inicio" y "Tribus", con `aria-current="page"` en esa ruta. Verificar que `e2e/portada.spec.ts` sigue en verde y el enlace aparece en `pnpm dev`.

## 3. Tests

- [x] 3.1 Escribir `e2e/territorio.spec.ts` con todos los escenarios de la spec: título/ubicación/superficie, 404, resumen que suma 12 y coincide con la lista, barrio 6 → `/tribus/valle` usando teclado, cuatro bienes comunes, ausencia de `USD`, `$`, `/\d+\s?h\b/`, "lote", "parcela", "reservar", "comprar", aviso de ejemplo, exactamente un `main`, enlace "Territorio" con `aria-current`. Verificar con `pnpm test:e2e e2e/territorio.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/territorio-ficha` con guion de prueba (portada → Territorio → barrio 6 → Valle Solar) y captura de la ficha. Probar también sobre el preview con `BASE_URL=$(scripts/preview-url.sh agente/territorio-ficha) pnpm test:e2e e2e/territorio.spec.ts`.
