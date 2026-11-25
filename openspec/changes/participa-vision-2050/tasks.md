# Tasks

Cuarto de los cuatro cambios de corrección (24-nov-2026). Requiere `participa-mapa-equipos`. Diseño editorial con criterio de diseñador gráfico profesional (`design.md` §2).

## 1. Textos

- [x] 1.1 `lib/idioma/textos/vision-2050.ts` con el texto **exacto** de `design.md` §3 (es y en), sin reescribirlo. **Verifica:** test de unidad: los dos idiomas tienen las mismas secciones y ninguno usa copia prohibida.

## 2. Pantalla

- [x] 2.1 `components/participa/vision-2050.tsx` con el diseño de `design.md` §2 y su uso en la pestaña Visión de `app/participa/page.tsx` (sin las tribus de ejemplo). **Verifica:** `pnpm build` en verde.

## 3. E2E

- [x] 3.1 `e2e/participa-vision.spec.ts`: título, marca, cuatro secciones, enlace a Equipos, inglés, 390 px; axe en los dos temas. Adaptar los e2e que esperaban las tribus de ejemplo en la pestaña. **Verifica:** `pnpm test:e2e` completo en verde.

## 4. Cierre

- [x] 4.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate participa-vision-2050 --strict` pasa; `docs/idioma/revisar-nativo.md` actualizado.
