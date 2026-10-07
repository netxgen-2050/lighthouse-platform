## 1. Lógica

- [ ] 1.1 Crear `lib/perfil/preguntas.ts` (las 6 preguntas y etiquetas del mock-up, constante `CHATS`), `lib/perfil/propuesta.ts` con `propuestaDePerfil(pregunta, respuesta)` (recorta a 80 caracteres sin cortar palabras) y `lib/perfil/estado.ts` (reducer puro: responder, confirmar, corregir, borrar). Verificar con tests de Vitest para cada función.

## 2. Página

- [ ] 2.1 Crear `app/perfil/page.tsx` con la conversación, el panel "Tu perfil", el avance, el aviso de datos locales y "Borrar mis respuestas", guardando el estado en `localStorage`. La conversación con `aria-live="polite"`. Verificar en `pnpm dev`.
- [ ] 2.2 Escribir `e2e/perfil.spec.ts` con todos los escenarios, incluido "sin pedidos al servidor" (escuchar `page.on("request")` durante la entrevista). Verificar con `pnpm test:e2e`.

## 3. Integración

- [ ] 3.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba. No tocar `app/layout.tsx` ni la portada.

## 4. Correcciones (7-oct, encontradas en la integración del 6-oct)

- [ ] 4.1 Traer la base corregida: `git fetch origin` y `git merge --no-edit origin/agente/congreso-registro` (que ya incluye `main`). En los conflictos, conservar lo de la base. Verificar con `pnpm verificar`.
- [ ] 4.2 Reemplazar todos los colores sueltos de `app/perfil/**` por los tokens del tema y quitar cualquier `<main>` propio: el layout ya trae `<main id="contenido">`. Verificar con `pnpm verificar` y `pnpm test:e2e` (incluidos `e2e/marco.spec.ts` y `e2e/perfil.spec.ts`).
