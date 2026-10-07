# Tasks

## 1. Modelo y guardado

- [ ] 1.1 Crear `lib/perfil/permanencia.ts` con `NIVELES` (ids, nombres y explicaciones del design) y `leerPermanencia`. Verificar con tests en `lib/perfil/permanencia.test.ts`: orden y nombres de los cuatro niveles; `leerPermanencia` devuelve el id para cada valor válido y `null` para `null`, `""`, `"otro"` y JSON.
- [ ] 1.2 Agregar `permanencia: "lh-permanencia"` a `CLAVES` en `lib/demo/claves.ts` y actualizar `claves.test.ts` y `borrar.test.ts`. Verificar con `pnpm test` (el borrado incluye la clave nueva).

## 2. Selector y atajo en /perfil

- [ ] 2.1 Crear `app/perfil/permanencia.tsx` (fieldset con radios, lectura después de hidratar, guardado al cambiar; con permiso si `privacidad-consentimiento` está en `main`) y montarlo en `app/perfil/page.tsx` antes de la entrevista. Verificar en `pnpm dev`: se elige con teclado y el nivel sobrevive a la recarga.
- [ ] 2.2 Mostrar el recuadro de inversores solo con `invertir`, con el enlace a `/sumarte#inversores`. Verificar en `pnpm dev`: aparece con "Solo invertir", desaparece con "Mudarme" y el enlace baja a "Para inversores".
- [ ] 2.3 Agregar a `e2e/perfil.spec.ts` los escenarios de la spec: cuatro niveles en orden, elegir con teclado, recarga, valor inválido, recuadro sí y no, enlace a inversores. Verificar con `pnpm test:e2e e2e/perfil.spec.ts`.

## 3. Mi recorrido

- [ ] 3.1 Extender `resumirDemo` con `permanencia` y el paso `"inversores"` según la regla del design. Verificar con casos nuevos en `lib/demo/resumen.test.ts`: inversor sin perfil, inversor con perfil incompleto, inversor con perfil completo, otro nivel sin perfil, sin nivel.
- [ ] 3.2 Mostrar en `app/panel/resumen.tsx` la tarjeta "Cuánto te querés quedar" ("Sin elegir" + enlace a `/perfil` si no hay nivel) y el paso "Mirá cómo invertir". Verificar con escenarios nuevos en `e2e/panel.spec.ts` (con nivel, sin nivel, próximo paso de inversor, "Borrar todo" borra el nivel) y `pnpm test:e2e e2e/panel.spec.ts`.

## 4. Integración

- [ ] 4.1 Correr `pnpm verificar`, `pnpm build` y la auditoría de axe (`pnpm test:e2e e2e/accesibilidad.spec.ts`) con `/perfil` y `/panel` incluidos. Verificar que los tres terminan en verde.
