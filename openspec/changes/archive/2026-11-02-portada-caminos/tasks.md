## 0. Prerrequisitos

- [x] 0.1 Confirmar que están en `main` las rutas `/territorios/lighthouse`, `/perfil` y `/congreso`, y el módulo `lib/territorios/` con `tribusDeTerritorio`. Si falta alguna en la base, usá el enlace igual (la integración la trae) y anotalo en el PR. Verificar con `git log origin/main --oneline` y `ls app/territorios app/perfil app/congreso lib/territorios`.

## 1. Portada

- [x] 1.1 Agregar en `app/page.tsx`, debajo del botón "Ver las tribus", la sección "Por dónde empezar" con los tres caminos como `<Link>` (etiqueta, título `<h3>`, descripción), en el orden de la spec. Verificar en `pnpm dev` que se ven los tres y que cada uno lleva a su ruta.
- [x] 1.2 Calcular la cantidad de barrios con `tribusDeTerritorio("lighthouse")`; si no hay datos, usar la descripción sin número. Verificar con un test unitario de la función que arma las descripciones (o, si queda en la página, con el e2e de la tarea 3.1).
- [x] 1.3 Verificar que no hay colores sueltos ni `<main>` nuevo: `grep -nE "stone-|emerald-|amber-|#[0-9a-fA-F]{3,6}" app/page.tsx` y `grep -n "<main" app/page.tsx` no devuelven nada.

## 2. Héroe

- [x] 2.1 Copiar el texto del héroe de `V.inicio` del mock-up v6 (con la mención a la inversión), sumar el enlace "Elegí cómo sumarte" → `/sumarte` si la ruta existe y el aviso "Prototipo interno · datos de ejemplo". Sin otros nodos del corredor. Verificar en `pnpm dev`. (Sin `/sumarte` en la base el enlace no se muestra; sin la frase "podés salir cuando quieras" porque su ⚖ `salida` no está en el catálogo.)

## 3. Tests

- [x] 3.1 Ampliar `e2e/portada.spec.ts` con todos los escenarios de la spec: los tres caminos en orden y navegando a su ruta, recorrido con Tab + Enter hasta `/perfil`, cantidad de barrios igual a la de los datos, héroe del mock-up, aviso de prototipo, y que no aparezcan San Martín de los Andes ni Atlántico Sur. Verificar con `pnpm test:e2e e2e/portada.spec.ts`. (La navegación a `/territorios/lighthouse` solo se verifica por el `href`: la ruta no existe en esta base.)

## 4. Integración

- [x] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/portada-caminos` con guion de prueba (portada → cada camino → volver) y captura de la portada en escritorio y en móvil. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/portada-caminos> pnpm test:e2e e2e/portada.spec.ts`. (Hecho: e2e sobre el preview 8/8; capturas de escritorio y móvil en `.noches/tmp/portada-escritorio.png` y `portada-movil.png`, ignoradas por git.)
