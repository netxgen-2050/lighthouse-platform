# Tasks

Vuelta de corrección después de la integración #234. Va sobre `dev`.

## 1. Explorar

- [x] 1.1 Filtro por estado visible y operable con la hoja en reposo a 390 px (design §1). **Verifica:** e2e nuevo en `e2e/explorar.spec.ts`: a 390×844, sin abrir la hoja, tocar "Disponible" deja `aria-pressed="true"`, la URL lleva el filtro y el mapa marca solo esos lotes; `pnpm test:e2e e2e/explorar.spec.ts e2e/estado-administrativo.spec.ts e2e/accesibilidad.spec.ts` en verde.

## 2. Bien común

- [x] 2.1 Chip `idea` en `ChipEstado` y en la tabla de Ostrom (design §2). **Verifica:** test en `components/ui/` del chip nuevo (texto e ícono); e2e: en `/bien-comun` la tabla de Ostrom muestra "Idea" ocho veces y ninguna "En discusión"; `pnpm test lib/idioma` en verde.

## 3. Marco

- [x] 3.1 e2e del pie pegado abajo (design §3). **Verifica:** `pnpm test:e2e e2e/marco.spec.ts` en verde.
- [x] 3.2 Comentario de `app/invertir/page.tsx` (design §4). **Verifica:** `grep -rniE "todo es (de ejemplo|una simulaci)" app components lib` vacío.

## 4. Cierre

- [x] 4.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-correcciones --strict` pasa; suite e2e completa en verde y axe sin violaciones. En el PR: qué se ve en `/explorar/lotes` a 390 px con la hoja en reposo, antes y después.
