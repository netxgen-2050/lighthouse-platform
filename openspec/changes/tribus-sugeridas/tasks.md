# Tasks

## 1. Cálculo de afinidad

- [ ] 1.1 Crear `lib/tribus/afinidad.ts` con `normalizar`, la coincidencia de palabras y `sugerirTribus` según el design. Verificar con `lib/tribus/afinidad.test.ts`: tildes y mayúsculas; palabras cortas y vacías descartadas; prefijo de 5 letras; puntajes y niveles en sus bordes (1, 2, 3, 4); vacantes excluidas; dos más afines + la menos afín; desempate por barrio; mismo resultado en dos llamadas; `[]` sin respuestas; el caso "Sé instalar paneles de energía solar" → Valle Solar con `aportas: ["Energía solar"]`.

## 2. Término legal

- [ ] 2.1 Agregar `afinidad` a `lib/legal/terminos.ts` con el título y el texto del mock-up (sin `borrador`). Verificar con `pnpm test` (test del catálogo: el texto coincide con el del mock-up y no es borrador, si el catálogo ya admite borradores).

## 3. Sugerencias en /tribus

- [ ] 3.1 Crear `app/tribus/sugeridas.tsx` y montarlo en `app/tribus/page.tsx` antes del directorio, pasando las tribus del territorio. Verificar en `pnpm dev`: sin perfil se ve el aviso con enlace a `/perfil`; con perfil confirmado, tres tarjetas con nivel en texto, ⚖, porqué y botones según el nivel.
- [ ] 3.2 Agregar a `e2e/tribus.spec.ts` los escenarios de la spec, cargando un perfil en `localStorage` antes de abrir la página: sin perfil, perfil confirmado (tres tarjetas, sin vacantes), respuesta sin confirmar no influye, "Vos aportás: Energía solar, que hoy buscan.", tarjeta baja sin "Proponer mi pacto", directorio completo debajo, recarga estable. Verificar con `pnpm test:e2e e2e/tribus.spec.ts`.

## 4. Cierre de la entrevista

- [ ] 4.1 Cambiar el enlace final de `app/perfil/entrevista.tsx` a "Ver mis tribus" → `/tribus#sugeridas`, conservando el foco. Actualizar `e2e/perfil.spec.ts` (y `e2e/marco.spec.ts` solo si usa ese enlace del perfil) y agregar el escenario "llega a Sugeridas para vos". Verificar con `pnpm test:e2e e2e/perfil.spec.ts e2e/marco.spec.ts`.

## 5. Integración

- [ ] 5.1 Correr `pnpm verificar`, `pnpm build` y `pnpm test:e2e e2e/accesibilidad.spec.ts` con `/tribus` con y sin perfil guardado. Verificar que los tres terminan en verde.
