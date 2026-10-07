## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `tribus-directorio`, `sumarte-planes` (`Medidor` y `miles`) y `navegacion-rail` (`destinosDisponibles`) están en `main`. Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls app/tribus app/sumarte lib/navegacion.ts`.

## 1. Datos y catálogo

- [ ] 1.1 Sumar `plata`, `roles` y `avales` a `Tribu` (`lib/tribus/tipos.ts`) y a las 12 tribus de `lib/tribus/datos.ts`, copiados de `cap`, `hum` y `avales` de `TRIBES` del mock-up v6. Verificar con `pnpm test` (`lib/tribus/datos.test.ts` con al menos `valle`, `avelan` y `grano` contra el mock-up, y `comprometida <= meta` y `cubiertos <= necesarios` en las 12).
- [ ] 1.2 Copiar textualmente del `LEGAL` del mock-up v6 las claves `licencia` y `adherente` a `lib/legal/terminos.ts`. Verificar con `pnpm test` (`lib/legal/terminos.test.ts`).

## 2. Componentes

- [ ] 2.1 Extraer `Medidor` de `app/sumarte/sumarte-cliente.tsx` a `components/medidor.tsx` sin cambiar su salida, y usarlo desde Sumarte. Verificar con `pnpm test:e2e e2e/sumarte.spec.ts` en verde (incluye "USD 46.000 de USD 75.000").
- [ ] 2.2 Crear `app/tribus/[id]/acciones.tsx` (cliente) con "Ver su barrio en el mapa", "Entrar a la sala" (mensaje en `aria-live="polite"`) y "Proponer mi pacto" solo si recibe `pactos: true`; y la variante vacante con "Proponer mi tribu". Verificar en `pnpm dev` activando cada botón solo con teclado.

## 3. Página

- [ ] 3.1 Completar `app/tribus/[id]/page.tsx` según `V.tribu`: medidores en "Lo que tiene", licencia ⚖ y adhesión ⚖ en "Cómo se entra", tarjeta "Red de confianza" con avatares `aria-hidden` y marca de ejemplo, acciones, y el aviso "Prototipo interno · datos de ejemplo". Para vacantes: texto con ⚖, medidores "Plata para arrancar" y "Roles", tarjeta "¿Tenés una tribu?". Sin `<main>` propio, solo tokens. Verificar en `pnpm dev` con `/tribus/valle`, `/tribus/avelan` y `/tribus/grano`.

## 4. Tests

- [ ] 4.1 En `e2e/tribus.spec.ts`: reducir "sin plata ni avales en pantalla" al listado `/tribus` y sumar los escenarios de la spec (medidores de Valle Solar y Avelan Kerum, red de confianza, ⚖ de licencia con teclado, sala simulada sin cambiar la URL, ver el barrio, Barrio 3 sin red de confianza, proponer tribu simulado, aviso de prototipo). Verificar con `pnpm test:e2e e2e/tribus.spec.ts`.
- [ ] 4.2 Sumar `/tribus/valle` y `/tribus/grano` a `e2e/accesibilidad.spec.ts` si no están (el requisito "sin USD ni avales" de `accesibilidad-auditoria` vive en `e2e/tribus.spec.ts` y ya se ajusta en 4.1). Verificar sin violaciones `serious` ni `critical`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/tribu-ficha-completa` con guion de prueba (Tribus → Valle Solar → medidores, ⚖ de licencia, "Entrar a la sala" → Barrio 3 → "Proponer mi tribu") y capturas. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/tribu-ficha-completa> pnpm test:e2e e2e/tribus.spec.ts`.
