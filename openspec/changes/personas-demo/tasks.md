## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `panel-recorrido` (`lib/demo/claves.ts`, `lib/demo/borrar.ts`, `app/panel/resumen.tsx`) y `navegacion-rail` (`app/layout.tsx` con el rail) están en `main`. Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls lib/demo app/panel`.

## 1. Datos y lógica

- [ ] 1.1 Crear `lib/personas/datos.ts` con `PersonaId`, `PersonaDemo` y `PERSONAS` copiados de `PEOPLE` del mock-up v6, más `elegibleFideicomiso`. Verificar con tests de Vitest (`lib/personas/personas.test.ts`): escenarios "Datos de Lucía", "Datos de Lucas" y los dos de elegibilidad.
- [ ] 1.2 Sumar `persona: "lh-persona"` a `CLAVES` en `lib/demo/claves.ts` sin tocar las otras claves. Verificar con `pnpm test` (`lib/demo/claves.test.ts` y `lib/demo/borrar.test.ts` en verde; actualizar el test si enumera las claves).
- [ ] 1.3 Crear `lib/personas/almacen.ts` con `leerPersona`, `elegirPersona`, `notificarPersona` y el hook `usePersona` (ver design). Verificar con un test de Vitest de `leerPersona` para `null`, `"lucia"`, `"lucas"` y `"franz"`.

## 2. Interfaz

- [ ] 2.1 Crear `components/selector-persona.tsx` y montarlo en `app/layout.tsx` dentro de `<section aria-label="Persona de ejemplo">`, antes de `<main>`. Botones con `aria-pressed`, "✓" visible en el elegido, región `aria-live="polite"` con "Ahora ves la plataforma como <nombre>". Solo tokens del tema. Verificar en `pnpm dev` recorriendo la franja con teclado y mirándola a 375 px de ancho.
- [ ] 2.2 En `app/panel/resumen.tsx`, llamar a `notificarPersona()` después de `borrarDemo`. Verificar en `pnpm dev`: elegir Lucas, borrar desde `/panel` y ver que el selector vuelve a Lucía sin recargar.

## 3. Tests

- [ ] 3.1 Escribir `e2e/personas.spec.ts` con los escenarios de la spec: default Lucía, cambio y navegación, recarga, valor corrupto (inyectado con `page.addInitScript`), anuncio, borrar desde `/panel`, un solo `main`. Verificar con `pnpm test:e2e e2e/personas.spec.ts`.
- [ ] 3.2 Correr `e2e/accesibilidad.spec.ts` completo (la franja aparece en todas las páginas auditadas). Verificar sin violaciones `serious` ni `critical`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/personas-demo` con guion de prueba (portada → "Lucas (AR)" → `/tribus` → recargar → `/panel` → borrar) y captura. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/personas-demo> pnpm test:e2e e2e/personas.spec.ts`.
