## 0. Antes de empezar

- [ ] 0.1 `pactos-dos-partes` está en `dev` (constancias, registro compartido, `conciliar` y `/pactos/responder`). Si no, frenar y reportar. Verificar con `ls lib/pactos/constancias.ts app/pactos/responder`.

## 1. Constancias y estado

- [ ] 1.1 `lib/pactos/constancias.ts`: una `pacto-propone` que afirma la tribu y apunta a la de la persona es una **contrapropuesta** (`datos.tipo = "contrapropuesta"`, `datos.mensaje`, `datos.horas`); deja la propuesta de la persona fuera de los pendientes de la tribu y queda pendiente del lado de la persona; `esperandoALaPersona(lista, comunidades)` para la sección de la tribu; "acordada" acepta la aceptación de la persona sobre la contrapropuesta. Tests: contrapropuesta sobre pacto nuevo y sobre cambio; la tribu no puede aceptar su propia contrapropuesta; la persona no puede contraproponer; retirar (revocar la propuesta de la persona) deja la contrapropuesta sin efecto. Verificar con `pnpm test lib/pactos`.
- [ ] 1.2 `lib/pactos/estado.ts`: `conciliar` deja `cambiosPedidos = { horas, mensaje, propuestaId, cuando }` en el pacto o el cambio en paso 1; al aceptar la persona, el pacto (o el cambio) toma las horas de la tribu con la versión siguiente y el historial con la fecha de la aceptación. <!-- arquitecto: misma regla que pactos-dos-partes design §9 -->El contenido acordado sale de las constancias, no del estado local: horas de la contrapropuesta, rol y descripción de la propuesta de la persona a la que apunta. Una contrapropuesta cuya propuesta de origen está revocada no se ofrece ni se puede aceptar (se relee antes de escribir, como en la vista de la tribu). Tests: aceptar los cambios → versión 1 con 16 h/mes; sobre un cambio → versión 2 con 15 h/mes; retirar → borrador con el contenido de la persona; `pactosAceptados` usa las horas acordadas. Verificar con `pnpm test lib/pactos lib/semillas`.

## 2. Pantallas

- [ ] 2.1 `app/pactos/responder/`: botón "Pedir cambios" con horas (control deslizante con los límites de `HORAS`) y mensaje obligatorio, validación (mensaje vacío, mismas horas), re-chequeo de "sigue pendiente", anuncio con foco; sección "Esperando que <persona> responda tus cambios" sin botones. Verificar con `pnpm test:e2e e2e/pactos-dos-partes.spec.ts`.
- [ ] 2.2 `app/pactos/pactos-cliente.tsx`: bloque "<comunidad> pide cambios" (horas de la persona, de la tribu y mensaje) con "Aceptar los cambios" y "Retirar"; evento `pactoConCambiosPedidos` en `lib/actividad/eventos.ts` (una sola vez, clave por contrapropuesta). Textos es/en en `lib/idioma/textos/pactos.ts`. Verificar con `pnpm test lib/actividad lib/idioma` y `pnpm test:e2e e2e/pactos-dos-partes.spec.ts`.

## 3. e2e y accesibilidad

- [ ] 3.1 `e2e/pactos-dos-partes.spec.ts`: la tribu pide 16 h/mes a un pacto de 32 → la persona acepta → versión 1 con 16 h/mes y Semillas; la tribu pide cambios a un cambio → la persona retira → vuelve a borrador del cambio; mensaje vacío no registra; evento una sola vez en `/panel`; en inglés. Sumar a `e2e/accesibilidad.spec.ts` `/pactos` con cambios pedidos y `/pactos/responder` con "Pedir cambios" abierto. Verificar con `pnpm test:e2e e2e/pactos-dos-partes.spec.ts e2e/accesibilidad.spec.ts`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde. PR desde `agente/pactos-pedir-cambios` hacia `dev` con guion: persona envía 32 h/mes a Valle Solar → `admin@prueba.test` pide 16 con mensaje → persona acepta → ver versión 1 con 16 h/mes y Semillas.
