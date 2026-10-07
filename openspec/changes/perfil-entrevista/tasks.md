## 1. Lógica

- [ ] 1.1 Crear `lib/perfil/preguntas.ts` (las 6 preguntas y etiquetas del mock-up, constante `CHATS`), `lib/perfil/propuesta.ts` con `propuestaDePerfil(pregunta, respuesta)` (recorta a 80 caracteres sin cortar palabras) y `lib/perfil/estado.ts` (reducer puro: responder, confirmar, corregir, borrar). Verificar con tests de Vitest para cada función.

## 2. Página

- [ ] 2.1 Crear `app/perfil/page.tsx` con la conversación, el panel "Tu perfil", el avance, el aviso de datos locales y "Borrar mis respuestas", guardando el estado en `localStorage`. La conversación con `aria-live="polite"`. Verificar en `pnpm dev`.
- [ ] 2.2 Escribir `e2e/perfil.spec.ts` con todos los escenarios, incluido "sin pedidos al servidor" (escuchar `page.on("request")` durante la entrevista). Verificar con `pnpm test:e2e`.

## 3. Integración

- [ ] 3.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba. No tocar `app/layout.tsx` ni la portada.
