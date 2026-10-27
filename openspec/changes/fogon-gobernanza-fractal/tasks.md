# Tasks

Rama `agente/fogon-gobernanza-fractal` desde `dev`, **después** de que `fogon-limpieza` esté en `dev`. Si no está, frenar y reportar. Para archivar este cambio, antes hay que archivar `fogon-decisiones` y `fogon-limpieza`.

## 1. Modelo de gobernanza

- [x] 1.1 `lib/gobernanza/tipos.ts` y `datos.ts` (design §1): común, 12 tribus desde `lib/tribus/datos.ts`, círculos de ejemplo (Avelan Kerum desde sus `areas`), consejo con un lugar por tribu validada y `representante: null` donde no hay. Tests: las vacantes no tienen círculos ni lugar; ningún lugar tiene representante inventado. Verificar con `pnpm test lib/gobernanza`.
- [x] 1.2 `lib/gobernanza/registros.ts` (design §2): agregar registro, revocar (registro nuevo que apunta), `estaRevocado`, `validadaPorElComun(tribuId)`, `tribusQueValidan(personaId)`; lectura tolerante de lo guardado; clave nueva en `lib/demo/claves.ts` que "Borrar todo" incluye. Tests: revocar no borra el original; un registro no se edita; datos guardados rotos se leen como lista vacía. Verificar con `pnpm test lib/gobernanza lib/demo`.

- [x] 1.3 (Enmienda 23-oct-2026) Círculos transversales: un círculo tiene `tribus: string[]` (una o varias, o ninguna) y zona opcional; agregar un círculo transversal de ejemplo con personas de Valle Solar y Taller Común que cuelga del común. Tests: el transversal aparece bajo el común con sus tribus; sin zona no inventa un lote. Verificar con `pnpm test lib/gobernanza`.

## 2. Página "Cómo decidimos"

- [ ] 2.1 `app/fogon/gobernanza/` con el gráfico SVG y la lista anidada (design §5), aviso de prototipo, ⚖ nuevos con `borrador: true` en `lib/legal/terminos.ts` (y su test), textos es/en. Verificar con `pnpm verificar`.
- [ ] 2.2 `e2e/fogon-gobernanza.spec.ts`: ver la estructura; Barrio 3 sin círculos ni lugar; lista recorrible con teclado; 390 px sin scroll horizontal; botón de reportar presente. Sumar la página a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-gobernanza.spec.ts e2e/accesibilidad.spec.ts`.

## 3. Fogón con ámbitos nuevos

- [ ] 3.1 `lib/fogon/datos.ts` y `estado.ts` (design §3 y §4): ámbitos nuevos, `EJEMPLOS_COMUN` en el común, decisión de círculo y de consejo de ejemplo, "llevar al consejo" con su registro. Tests: filtrar por cada ámbito; llevar al consejo crea la copia con `origen` y el registro; quien no lidera no puede. Verificar con `pnpm test lib/fogon`.
- [ ] 3.2 `app/fogon/fogon-cliente.tsx` y `page.tsx`: filtros nuevos, marca "Viene de … (aprobada en la tribu)", botón "Llevar al consejo" solo para quien lidera, enlace "Cómo decidimos". Actualizar `e2e/fogon.spec.ts` con los escenarios del delta de `fogon`. Verificar con `pnpm test:e2e e2e/fogon.spec.ts`.

## 4. Validaciones visibles

- [ ] 4.1 Ficha de tribu (`app/tribus/[id]`): "Validada por el común" / "Todavía no validada por el común". "Mi recorrido": "Validada por <tribu>" para cada membresía aceptada (simulado). E2E en `e2e/fogon-gobernanza.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-gobernanza.spec.ts`.

## 5. Integración

- [ ] 5.1 `pnpm verificar`, `pnpm build` y los e2e tocados en verde; PR a `dev` con `scripts/pr.sh`, aclarando que los registros tienen forma de attestation pero viven solo en el navegador (sin blockchain) y que el reglamento del consejo es de ejemplo.
