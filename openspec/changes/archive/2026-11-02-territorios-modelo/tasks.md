## 1. Modelo

- [x] 1.1 Crear `lib/territorios/tipos.ts` con `Territorio` (`id`, `nombre`, `ubicacion`, `descripcion`, `superficie?`, `bienesComunes`) y `ResumenTerritorio` (`activa`, `formacion`, `vacante`, `total`). Verificar con `pnpm exec tsc --noEmit`.
- [x] 1.2 Crear `lib/territorios/datos.ts` con el territorio `lighthouse` (textos copiados del mock-up v6, sin montos ni horas) y `listarTerritorios`, `buscarTerritorio`, `tribusDeTerritorio`, `resumenDeTerritorio`. Verificar con los tests de 2.1.

## 2. Tribus

- [x] 2.1 Agregar `territorioId: string` a `Tribu` y `territorioId: "lighthouse"` a las 12 tribus de `lib/tribus/datos.ts`. Verificar que `pnpm verificar` sigue en verde y que las páginas de `/tribus` no cambian (`pnpm test:e2e e2e/tribus.spec.ts`).

## 3. Tests

- [x] 3.1 Crear `lib/territorios/datos.test.ts` con un caso por escenario de la spec (listar, buscar inexistente, 12 tribus ordenadas, integridad de referencias, territorio desconocido, resumen que suma 12 y coincide con contar estados, resumen inexistente = `undefined`, superficie ausente = `undefined`). Verificar con `pnpm test`.
- [x] 3.2 Agregar un test que recorra el código fuente de `lib/territorios/datos.ts` y falle si aparece "USD", "$", "lote" o "parcela" (guarda contra plata y lotes). Verificar con `pnpm test`.

## 4. Integración

- [x] 4.1 `pnpm verificar` y `pnpm build` en verde; PR chico desde `agente/territorios-modelo` con la lista de escenarios cubiertos. Sin UI: no tocar `app/`.
