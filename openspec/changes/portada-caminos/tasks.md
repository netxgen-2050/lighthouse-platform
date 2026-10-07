## 0. Prerrequisitos

- [ ] 0.1 Confirmar que están en `main` las rutas `/territorios/lighthouse`, `/perfil` y `/congreso`, y el módulo `lib/territorios/` con `tribusDeTerritorio`. Si falta alguna, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls app/territorios app/perfil app/congreso lib/territorios`.

## 1. Portada

- [ ] 1.1 Agregar en `app/page.tsx`, debajo del botón "Ver las tribus", la sección "Por dónde empezar" con los tres caminos como `<Link>` (etiqueta, título `<h3>`, descripción), en el orden de la spec. Verificar en `pnpm dev` que se ven los tres y que cada uno lleva a su ruta.
- [ ] 1.2 Calcular la cantidad de barrios con `tribusDeTerritorio("lighthouse")`; si no hay datos, usar la descripción sin número. Verificar con un test unitario de la función que arma las descripciones (o, si queda en la página, con el e2e de la tarea 3.1).
- [ ] 1.3 Verificar que no hay colores sueltos ni `<main>` nuevo: `grep -nE "stone-|emerald-|amber-|#[0-9a-fA-F]{3,6}" app/page.tsx` y `grep -n "<main" app/page.tsx` no devuelven nada.

## 2. Encabezado

- [ ] 2.1 Agregar "Perfil" → `/perfil` y "Congreso" → `/congreso` al final del arreglo `enlaces` de `components/encabezado.tsx`. Verificar en `pnpm dev` con un ancho de 375 px que los enlaces no se superponen y que `aria-current="page"` aparece solo en el de la ruta actual.

## 3. Tests

- [ ] 3.1 Ampliar `e2e/portada.spec.ts` con todos los escenarios de la spec: los tres caminos en orden, cada uno navega a su ruta con respuesta 200, recorrido con Tab + Enter hasta `/perfil`, titular y botón "Ver las tribus" presentes, cantidad de barrios igual a la de los datos, ausencia de "USD", "$", `/\bha\b/`, "invertir", "capital", "lote" y "reservar". Verificar con `pnpm test:e2e e2e/portada.spec.ts`.
- [ ] 3.2 Agregar a `e2e/marco.spec.ts` (o donde se prueba el encabezado) el escenario de `aria-current` en `/congreso` y en `/perfil`. Verificar con `pnpm test:e2e e2e/marco.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/portada-caminos` con guion de prueba (portada → cada camino → volver) y captura de la portada en escritorio y en móvil. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/portada-caminos> pnpm test:e2e e2e/portada.spec.ts`.
