## 1. Lógica

- [ ] 1.1 Crear `lib/legal/glosario.ts`: `entradasGlosario()` devuelve las dos secciones (legales y económicas) con `{ clave, titulo, texto, borrador }`, ordenadas por título con `localeCompare(…, "es")`, y `contarBorradores()` devuelve `{ borradores, total }`. Sin textos propios: todo sale de `TERMINOS` y `TERMINOS_ECONOMICOS`. Tests en `lib/legal/glosario.test.ts`: misma cantidad de entradas que claves en cada catálogo, orden alfabético, `kyc` es borrador y `ritual` no, el contador coincide con los catálogos. Verificar con `pnpm test`.

## 2. Página

- [ ] 2.1 Crear `app/glosario/page.tsx` (servidor) y un componente cliente para el filtro "Mostrar solo borradores" sincronizado con `?borradores=1`; anclas `id={clave}`; etiqueta "Borrador: a revisar" en texto; contador "N de M textos son borrador"; "Sin borradores en esta sección." cuando corresponda; aviso de prototipo; solo tokens del tema y sin `<main>`. Verificar en `pnpm dev` abriendo `/glosario`, `/glosario#pasefundador` y `/glosario?borradores=1`, y recorriendo el filtro solo con teclado.
- [ ] 2.2 Sumar `/glosario` a `RUTAS_PUBLICAS` (con su test en `lib/sesion/rutas-publicas.test.ts`) y el enlace "Glosario" en `components/pie.tsx`. Verificar con `pnpm test` y en `pnpm dev` sin sesión.

## 3. E2E

- [ ] 3.1 `e2e/glosario.spec.ts` con todos los escenarios de la spec (cantidades contra los catálogos importados, ancla, orden, borrador sí/no, contador, filtro con teclado y por URL, sin sesión, enlace del pie, un solo `main`), y `/glosario` en `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/glosario.spec.ts e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/glosario-legal` con guion de prueba (pie → Glosario → activar "solo borradores" → copiar el enlace → abrirlo en otra pestaña) y la nota para Gus: el enlace `/glosario?borradores=1` es el que se le puede pasar a Gabriel.
