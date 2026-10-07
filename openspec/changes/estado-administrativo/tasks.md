## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `territorio-macrolote` está en `main` (ficha de finca en `app/territorios/[id]/` y `lib/territorios/biopueblo-territorios.json`). Si falta, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls app/territorios/[id] lib/territorios`.

## 1. Dato y reglas

- [ ] 1.1 Crear `lib/legal/estado-administrativo.ts` (tipo, registro `soluna`, `accionesDeLote`) y `lib/legal/vistas-con-lotes.ts`. Verificar con tests de Vitest: Soluna sin expediente; `accionesDeLote("soluna")` devuelve solo `"consultar"` con aprobación `false` y también con `true`; la lista incluye `/territorios/lighthouse`. Correr `pnpm test`.
- [ ] 1.2 Si no existe, permitir `borrador: true` en `lib/legal/terminos.ts` y mostrar "Borrador: texto a revisar" en `components/termino-legal.tsx`. Agregar el término `loteo` con el texto del design y `borrador: true`. Verificar con `pnpm test` (test del catálogo: `loteo` es borrador; `ritual` no).

## 2. Componente y página

- [ ] 2.1 Crear `components/estado-administrativo.tsx` (completo y compacto, "sin dato" si falta el expediente, ⚖ `loteo`, solo tokens). Verificar en `pnpm dev`.
- [ ] 2.2 En `/territorios/[id]`, poner el aviso completo arriba del mapa cuando el territorio muestra Soluna, y el compacto en la ficha de toda finca. Hacer que la ficha decida su botón con `accionesDeLote`. Verificar en `pnpm dev` a 1280 px y 390 px eligiendo las fincas 502 y 501, también con teclado.

## 3. Tests

- [ ] 3.1 Escribir `e2e/estado-administrativo.spec.ts`: recorrer `VISTAS_CON_LOTES` y exigir la región "Estado administrativo"; escenarios de las fincas 502 y 501; ningún botón ni enlace "Comprar", "Reservar" o "Señar"; abrir el ⚖ y leer "Borrador: texto a revisar". Bloquear las teselas con `page.route`. Verificar con `pnpm test:e2e e2e/estado-administrativo.spec.ts`.
- [ ] 3.2 Confirmar que `/territorios/lighthouse` sigue en `e2e/accesibilidad.spec.ts` y pasa sin violaciones `serious` ni `critical`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/estado-administrativo` con guion de prueba (abrir el territorio, leer el aviso, elegir una finca disponible y una reservada, abrir el ⚖) y captura del aviso a 390 px.
