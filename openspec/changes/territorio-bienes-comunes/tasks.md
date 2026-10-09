## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `territorio-ficha`, `territorio-macrolote` y `compromisos-registro` están en `main` (`app/territorios/[id]/page.tsx` con la sección "Bienes comunes", `components/medidor.tsx`, `app/compromisos/`). Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls components app/compromisos`.

## 1. Modelo y catálogo

- [ ] 1.1 Buscar los usos de `bienesComunes` (`grep -rn bienesComunes app lib e2e`) y cambiar el tipo a `BienComun[]` en `lib/territorios/tipos.ts` con los datos del design en `lib/territorios/datos.ts`. Agregar `medidaDe` según el design. Verificar con Vitest: los cuatro bienes coinciden con el HTML del mock-up; `medidaDe` devuelve `null` si falta un número o el necesario es 0. Correr `pnpm test`.
- [ ] 1.2 Agregar `guardianes` a `lib/legal/terminos.ts` (textual del mock-up, sin `borrador`). Verificar con `pnpm test` (el test del catálogo encuentra título y texto en el mock-up).

## 2. Pantalla

- [ ] 2.1 Rehacer la sección de `app/territorios/[id]/page.tsx`: título "Bienes comunes del Lighthouse" con la marca de ejemplo, "Plata y horas, en el espejo del proyecto" con ⚖ `espejo`, una tarjeta por bien con `Medidor` o "sin dato", la frase de protección de la tierra con ⚖ `guardianes` y ⚖ `pacto`, y el enlace "Ofrecer tiempo o plata" a `/compromisos`. Verificar en `pnpm dev`: los cuatro bienes con sus números, recorrido con Tab, y un bien de prueba sin horas muestra "Horas de trabajo: sin dato".

## 3. Tests

- [ ] 3.1 Actualizar `e2e/territorio.spec.ts` ("bienes comunes por nombre" pasa a probar los escenarios de la spec: agua con 68% y 56%, cuatro tarjetas, ⚖ espejo, ⚖ guardianes sin borrador, enlace a `/compromisos`, orden de Tab). Verificar con `pnpm test:e2e e2e/territorio.spec.ts`.
- [ ] 3.2 Confirmar que `/territorios/lighthouse` sigue en `e2e/accesibilidad.spec.ts` y pasa sin violaciones `serious` ni `critical`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/territorio-bienes-comunes` con guion de prueba (abrir `/territorios/lighthouse` → bajar a "Bienes comunes del Lighthouse" → abrir los ⚖ → "Ofrecer tiempo o plata"). Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/territorio-bienes-comunes> pnpm test:e2e e2e/territorio.spec.ts`.
