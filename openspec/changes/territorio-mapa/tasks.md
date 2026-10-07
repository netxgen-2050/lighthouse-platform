## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `territorio-ficha` (`app/territorios/[id]/page.tsx`), `territorios-modelo` (`lib/territorios/`) y `navegacion-rail` están en `main`. Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls app/territorios lib/territorios`.

## 1. Datos

- [ ] 1.1 Crear `lib/territorios/geometria.ts` con la geometría ilustrativa del Lighthouse copiada de `LH_POLY`, `barrioRect(1..12)` y `COMMONS_RECT` del mock-up (`docs/referencia/netx-tribus-mockup-v6.html`), con `ilustrativa: true` y la función `geometriaDe(id)`. Verificar con un test de Vitest: hay 12 barrios, cada polígono está cerrado y dentro del contorno, y `geometriaDe("no-existe")` devuelve `undefined`.

## 2. Mapa

- [ ] 2.1 Agregar `leaflet` y `@types/leaflet` (`pnpm add leaflet` y `pnpm add -D @types/leaflet`). Verificar que `pnpm build` sigue en verde.
- [ ] 2.2 Crear el componente cliente del mapa (Leaflet con import dinámico, `map.remove()` al desmontar, sellos `divIcon` con `keyboard: true`, `role="link"` y `aria-label` "Barrio N · <tribu> · <estado>", navegación con `router.push`, polígonos no interactivos, tiles de OSM con atribución). Verificar en `pnpm dev` que en `/territorios/lighthouse` se llega a los 12 sellos con Tab y que Enter en el barrio 6 abre `/tribus/valle`.
- [ ] 2.3 Montarlo en la ficha con `next/dynamic` y `ssr: false`, arriba de la grilla de barrios, con la leyenda en texto y la nota de datos ilustrativos; si no hay geometría, mostrar "Mapa: sin dato". Verificar que `pnpm build` no falla por `window`.
- [ ] 2.4 Estilos de polígonos y sellos en `app/globals.css` solo con tokens del tema. Verificar con `pnpm test` (`lib/sin-colores-sueltos.test.ts`) y `grep -n "<main" app/territorios -r` sin resultados.

## 3. Tests

- [ ] 3.1 Escribir `e2e/territorio-mapa.spec.ts` con los escenarios de la spec: región "Mapa del Lighthouse" con 12 sellos; Tab + Enter en el barrio 6 → `/tribus/valle`; sello vacante con "+" y "Busca tribu"; leyenda con los cuatro textos; nota y atribución; sin "Finca", "lote", "USD", "$", "reservar", "comprar" dentro del mapa; con `page.route` bloqueando `tile.openstreetmap.org` los sellos siguen funcionando; un solo `main`. Verificar con `pnpm test:e2e e2e/territorio-mapa.spec.ts`.
- [ ] 3.2 Sumar `/territorios/lighthouse` (si no está) a la auditoría de `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts` sin violaciones `serious` ni `critical`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/territorio-mapa` con guion de prueba (rail → Territorio → mapa → Tab hasta el barrio 6 → Enter) y una captura del mapa. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/territorio-mapa> pnpm test:e2e e2e/territorio-mapa.spec.ts`.
