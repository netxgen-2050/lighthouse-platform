## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `login-privy` está en `main` (prefijo por persona en las claves del navegador) y que existen `app/perfil/perfil-cliente.tsx`, `lib/panel/proximo-paso.ts` y `lib/demo/borrar.ts`. Si falta algo, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls app/perfil lib/panel lib/demo`.

## 1. Lógica

- [ ] 1.1 Crear `lib/perfil/permanencia.ts` con el tipo `Permanencia`, la lista ordenada de opciones con sus etiquetas, `leerPermanencia(crudo)` (valor raro o vacío → `null`), y `sugerencia(p)` que devuelve `{ texto, href }` según la tabla de la spec. Sumar `permanencia: "lh-permanencia"` a `lib/demo/claves.ts`. Verificar con Vitest: los cuatro valores se leen; `"vacaciones"`, `""`, JSON roto y `null` dan `null`; cada valor da su enlace; `borrarDemo` quita `lh-permanencia`. Correr `pnpm test`.
- [ ] 1.2 En `lib/panel/proximo-paso.ts`, leer `CLAVES.permanencia` en `leerProgreso` y calcular `quiereInvertir = kyc iniciado || permanencia === "invertir"`; actualizar el comentario que dice que no hay forma de saberlo. Verificar con Vitest en `lib/panel/panel.test.ts`: "Solo invertir" sin KYC da el paso `identidad`; "Visitar" sin KYC no; KYC iniciado sigue dando `identidad`. Correr `pnpm test`.

## 2. Pantallas

- [ ] 2.1 En `/perfil`, agregar el grupo "¿Cuánto te querés involucrar?" arriba del formulario, con guardado inmediato, texto "Guardado" en una región `role="status"` y el enlace de sugerencia. Verificar en `pnpm dev`: elegir cada opción, recargar y ver que se conserva; con las herramientas del navegador, poner `"vacaciones"` en la clave y ver que no hay opción marcada.
- [ ] 2.2 En `/panel`, mostrar "Cómo te querés involucrar: …" o "sin dato". Verificar en `pnpm dev` con y sin opción elegida.

## 3. Tests

- [ ] 3.1 e2e en `e2e/perfil.spec.ts`: primera elección, cambio de opinión con recarga, valor raro, sugerencia para "Solo invertir" (el enlace lleva a `/sumarte`), sin elegir no hay sugerencia, solo teclado (Tab + flechas). En el e2e del panel: "sin dato" y el paso "Verificá tu identidad" con "Solo invertir". Verificar con `pnpm test:e2e e2e/perfil.spec.ts` y el spec del panel.
- [ ] 3.2 Sumar `/perfil` con una opción elegida a `e2e/accesibilidad.spec.ts`. Verificar sin violaciones `serious` ni `critical` con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/perfil-permanencia` con guion de prueba (entrar → `/perfil` → "Solo invertir" → seguir la sugerencia a `/sumarte` → `/panel` muestra el dato y, con los pasos previos hechos, "Verificá tu identidad"). Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/perfil-permanencia> pnpm test:e2e e2e/perfil.spec.ts`.
