## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `personas-demo` (`lib/personas/`, selector en el layout) y `sumarte-planes` (`lib/sumarte/datos.ts` con `EMISION`) están en `main`. Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls lib/personas lib/sumarte`.

## 1. Catálogo legal

- [ ] 1.1 Copiar textualmente del objeto `LEGAL` del mock-up v6 las claves `pasaporte`, `calificado`, `pase`, `chacra`, `ribera` y `remoto` a `lib/legal/terminos.ts` (título y texto). Verificar con `pnpm test` (`lib/legal/terminos.test.ts`; si el test compara contra el mock-up, sumar las claves nuevas).

## 2. Lógica

- [ ] 2.1 Crear `lib/pasaporte/caminos.ts` con `caminos(persona, emision)` según el design. Verificar con tests de Vitest (`lib/pasaporte/caminos.test.ts`): 5 caminos por persona; Lucas "abierto" en sumarte con 4 lugares; Lucía "no" en sumarte; chacra "condiciones" para Lucía y "abierto" para Lucas; "Horas de obra" con 60 h/mes para Lucas y "Aporte remoto" para Lucía.

## 3. Página

- [ ] 3.1 Crear `app/pasaporte/page.tsx` y `app/pasaporte/pasaporte-cliente.tsx` con "Lo que declaraste" (lista de definiciones) y "Tus caminos" (lista con estado en texto y ⚖), el aviso "Prototipo interno · datos de ejemplo" y la marca de ejemplo en la identidad. Sin `<main>` propio, solo tokens. Verificar en `pnpm dev` con Lucía y con Lucas, recorriendo los ⚖ solo con teclado.
- [ ] 3.2 Agregar "Pasaporte" → `/pasaporte` a `DESTINOS` en `lib/navegacion.ts`, entre "Perfil" y "Compromisos", con `existe: true`. Verificar con `pnpm test` (`lib/navegacion.test.ts` contra el disco).

## 4. Tests

- [ ] 4.1 Escribir `e2e/pasaporte.spec.ts` con los escenarios de la spec: Lucía y Lucas en "Lo que declaraste", 5 caminos con estado en texto, sumarte por persona (4 lugares), chacra y modalidad, cambio de persona en vivo, ⚖ de tierra ribereña con teclado, destino del rail con `aria-current="page"`, aviso de prototipo y un solo `main`. Verificar con `pnpm test:e2e e2e/pasaporte.spec.ts`.
- [ ] 4.2 Sumar `/pasaporte` (con Lucía y con Lucas) a `e2e/accesibilidad.spec.ts`. Verificar sin violaciones `serious` ni `critical`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/pasaporte-caminos` con guion de prueba (rail → Pasaporte como Lucía → cambiar a Lucas → ver "Sumarte al proyecto" abierto) y dos capturas. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/pasaporte-caminos> pnpm test:e2e e2e/pasaporte.spec.ts`.
