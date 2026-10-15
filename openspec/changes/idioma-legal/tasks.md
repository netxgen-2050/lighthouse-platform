# Tasks

Requisito previo: `idioma-base`, `consentimiento-alta` e `idioma-portada-sumarte` mergeados <!-- arquitecto: los escenarios de Sumarte en inglés y la tarea 2.2 suponen Sumarte ya traducida -->. Rama `agente/idioma-legal`. Todo texto en inglés es borrador. Español idéntico al de hoy y **sin subir la versión de la política** (decisión de Gus: la única subida es la de `consentimiento-alta`). Cada fuente legal con inglés se anota como `pendiente` en `lib/idioma/revision-nativa.ts`.

## 1. ⚖ y Ord. 173

- [ ] 1.1 Sumar `en` a todas las claves de `lib/legal/terminos.ts` y hacerlo obligatorio en el tipo (design §1); `TerminoLegal` usa el idioma del contenido por defecto (`useIdioma()`). Test en `terminos.test.ts`: todas con `en` no vacío y distinto del español; <!-- arquitecto --> y test de `TerminoLegal` dentro del envoltorio de página sin traducir: se muestra en español y anota `idioma: "es"` (design §1). Verificar con `pnpm test` y `pnpm test:e2e e2e/congreso-en.spec.ts` (sigue en verde).
- [ ] 1.2 `lib/legal/estado-administrativo.ts`, `components/estado-administrativo.tsx` y `components/anotar-exposicion.tsx` con idioma (entrada de bitácora con el idioma mostrado y `borrador: true` en inglés), con su test. Verificar con `pnpm test` y `pnpm test:e2e e2e/estado-administrativo.spec.ts`.

## 2. Política, consentimiento y Mis datos

- [ ] 2.1 `lib/privacidad/politica.ts` en dos idiomas, con la lista de cambios de cada versión también en inglés y **la misma** `VERSION_POLITICA` (design §2 y §5); test: mismas secciones, filas y cambios por versión en los dos idiomas, y `VERSION_POLITICA` igual a `2026-10-15-borrador`. Verificar con `pnpm test`.
- [ ] 2.2 Crear `lib/idioma/textos/privacidad.ts` y pasar `app/privacidad/page.tsx` (con el aviso de traducción, design §3), `pantalla-consentimiento.tsx`, `bloque-consentimiento.tsx` y `paso-alta.tsx` en sus dos modos, "Create your account" y "Sign in" (sacar el envoltorio `lang="es"` que dejó `idioma-portada-sumarte`). Verificar con `pnpm test:e2e e2e/privacidad.spec.ts e2e/consentimiento-alta.spec.ts`.
- [ ] 2.3 `idioma` en el registro del consentimiento, en el de novedades y en la aceptación previa (design §4) con tests (registro con `en`, sin idioma = `es`, `idioma: "fr"` descartado). `app/mis-datos/**` en inglés con la constancia del idioma y el bloque de novedades. Verificar con `pnpm test`.
- [ ] 2.4 Anotar como `pendiente` en `lib/idioma/revision-nativa.ts` los diccionarios `textos/legal` y `textos/privacidad` y las fuentes `lib/legal/terminos.ts`, `lib/legal/estado-administrativo.ts` y `lib/privacidad/politica.ts`, y regenerar la lista. Verificar con `pnpm idioma:pendientes` (aparecen las cinco) y `pnpm test`.

## 3. Pruebas

- [ ] 3.1 Sumar `/privacidad` y `/mis-datos` a `RUTAS_TRADUCIDAS` y crear `e2e/idioma-legal.spec.ts`: ⚖ en Sumarte en inglés con "Draft" y su entrada de bitácora; aviso de la Ord. 173; `/privacidad?lang=en` con el aviso y el enlace al español; una persona con consentimiento vigente de `2026-10-15-borrador` pasa a inglés y **no** ve la pantalla; "What changed" en inglés sembrando un registro de `2026-10-14-borrador`; alta en inglés con las dos casillas y la opcional de novedades; Mis datos con el idioma aceptado. Verificar con `pnpm test:e2e e2e/idioma-legal.spec.ts e2e/idioma.spec.ts`.
- [ ] 3.2 Sumar `/privacidad`, la pantalla de consentimiento y el paso "Sign in" en inglés a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.
