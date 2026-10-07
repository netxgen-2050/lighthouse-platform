## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `perfil-entrevista` está en `main` (`app/perfil/entrevista.tsx`, `lib/perfil/preguntas.ts`, `lib/perfil/propuesta.ts`). Si falta, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls app/perfil lib/perfil`. Si `portada-caminos` no está en `main`, el e2e entra a `/perfil` con el enlace del encabezado o con `page.goto`, y se anota en el PR.

## 1. Datos y lógica

- [ ] 1.1 Crear `lib/personas/tipos.ts` y `lib/personas/datos.ts` con Lucía y Lucas (nombre, edad, ciudad, descripción y las seis respuestas con su resumen), copiados textualmente de `PEOPLE` y `CHATS` del mock-up v6. Sin campos de plata, nacionalidad ni residencia. Verificar con `lib/personas/datos.test.ts`: los textos coinciden con el mock-up, hay seis respuestas por persona y las etiquetas siguen el orden de `lib/perfil/preguntas.ts`.
- [ ] 1.2 Crear `lib/personas/estado.ts` con `CLAVE_PERSONA` y `leerPersona`. Verificar con tests: `"lucia"` → `"lucia"`, `null`, `""`, `"pepe"` y JSON roto → `null`.
- [ ] 1.3 Cambiar `propuestaDePerfil` para devolver el resumen cuando la respuesta coincide exactamente con una de ejemplo de esa pregunta. Verificar con `lib/perfil/propuesta.test.ts`: respuesta de ejemplo → resumen; respuesta de ejemplo con un carácter cambiado → recorte actual; los tests existentes siguen en verde.

## 2. Interfaz

- [ ] 2.1 Crear `components/selector-persona.tsx` (fieldset + radios "Sin persona", "Lucía", "Lucas") y `components/tarjeta-persona.tsx`. Verificar en `pnpm dev` que se opera con Tab y flechas y que la opción elegida se distingue sin color (peso de fuente o marca de texto).
- [ ] 2.2 Montar selector y tarjeta en `app/page.tsx` como isla cliente, debajo de los caminos de entrada. Verificar en `pnpm dev`: sin persona no hay tarjeta; con Lucía aparece "Estás viendo la plataforma como Lucía, 38 · Oslo, Noruega" y "Persona de ejemplo".
- [ ] 2.3 Montar el selector en `/perfil` y agregar el botón "Usar la respuesta de ejemplo de <nombre>" en `app/perfil/entrevista.tsx`. Verificar en `pnpm dev` que completa el campo sin enviar y que el foco queda en el campo.
- [ ] 2.4 Verificar que no hay colores sueltos ni `<main>` nuevo: `grep -nE "stone-|emerald-|amber-|#[0-9a-fA-F]{3,6}" components/selector-persona.tsx components/tarjeta-persona.tsx app/page.tsx app/perfil -r` y `grep -n "<main" components app/page.tsx app/perfil -r` no devuelven nada.

## 3. Tests

- [ ] 3.1 Escribir `e2e/recorrido-demo.spec.ts` con todos los escenarios de la spec: valor por defecto, elección con teclado, persistencia entre `/` y `/perfil` con recarga, volver a "Sin persona", tarjeta sin "Nacionalidad", "Residencia fiscal", "USD" ni "$", botón que completa sin enviar, sin botón sin persona, resumen "Valle ribereño patagónico", respuesta editada, y el recorrido completo de Lucía **y** de Lucas hasta "Ver las tribus" → `/tribus`. Incluir un chequeo de que no hay pedidos de red con el nombre de la persona. Verificar con `pnpm test:e2e e2e/recorrido-demo.spec.ts`.
- [ ] 3.2 Correr el e2e existente del perfil (el que dejó `perfil-entrevista` en `e2e/`) para confirmar que sin persona todo sigue igual. Verificar con `pnpm test:e2e <ese archivo>` en verde.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/personas-ejemplo` con el guion de la demo (portada → Lucía → Encontrar mi tribu → seis respuestas → 6/6 → tribus) y capturas de la tarjeta y del botón. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/personas-ejemplo> pnpm test:e2e e2e/recorrido-demo.spec.ts`.
