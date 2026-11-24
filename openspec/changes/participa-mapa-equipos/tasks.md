# Tasks

Tercero de los cuatro cambios de corrección (24-nov-2026). Requiere `explorar-unificado`. Trabajá con criterio de diseñador gráfico profesional: la ilustración es la pieza central, cuidá proporciones, ritmo, paleta y detalle (`design.md` §1–3).

## 1. Datos

- [ ] 1.1 `lib/equipos/posiciones.ts` con 2 a 4 posiciones por círculo del común, bilingües (`design.md` §6). **Verifica:** test de unidad: todo círculo tiene 2–4 posiciones con es/en y ninguna usa palabras prohibidas (`lib/legal` o la lista de copia prohibida).

## 2. Ilustración

- [ ] 2.1 Tokens `--color-ilus-*` en `app/globals.css` (claro = mediodía, oscuro = noche) y el fondo del territorio en SVG (`design.md` §1–2). **Verifica:** `pnpm build` en verde; captura en los dos temas en el reporte.
- [ ] 2.2 Las nueve formas de permacultura con su etiqueta y su detalle animado (`design.md` §3), en `components/participa/formas/`. **Verifica:** test de unidad: hay una forma por cada id de `CIRCULOS_DEL_COMUN` (o la genérica).

## 3. Interacción y detalle

- [ ] 3.1 Hover y foco, globo, movimiento reducido (`design.md` §4). **Verifica:** e2e de la tarea 4.1.
- [ ] 3.2 Diálogo de detalle con `?equipo=`, foco y Escape (`design.md` §5). **Verifica:** e2e de la tarea 4.1.

## 4. Página, menú y E2E

- [ ] 4.1 `app/participa/page.tsx` con pestañas, tarjeta del común, mapa y lista; Participa `existe: true`; redirección de `/tribus`; enlaces internos; rutas públicas y traducidas. `e2e/participa.spec.ts`: abrir, hover, Tab, clic, Escape, link directo, `/tribus` redirige, `/tribus/lighthouse` sigue, inglés, 390 px, movimiento reducido. **Verifica:** en verde.
- [ ] 4.2 Adaptar los e2e que usaban `/tribus`; axe en `/participa` y con el diálogo abierto, en los dos temas. **Verifica:** `pnpm test:e2e` completo en verde.

## 5. Cierre

- [ ] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate participa-mapa-equipos --strict` pasa.
