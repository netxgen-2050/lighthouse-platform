# Tasks

Rama `agente/fogon-plantillas-backlog` desde `dev`, **después** de `fogon-consultas-panel`. Si no está en `dev`, frenar y reportar. Sin migraciones ni rutas: si hace falta alguna, frenar y reportar.

## 1. Plantillas

- [ ] 1.1 `lib/fogon/consultas/plantillas.ts`: plantillas U5 y U7 con los textos exactos de la spec (título, descripción, modo, ámbito, voto abierto, resultado al cierre, votos en contra apagados; U7 con las 20 opciones en orden y un comentario con la fecha del backlog de la que salen, 16-oct-2026). Tests: cada plantilla pasa la validación de `formulario.ts` con un cierre futuro y un padrón; U7 tiene 20 opciones con etiquetas únicas; un reparto de 1 voto en cada opción de U7 (20 créditos) es válido para el motor. Verificar con `pnpm test lib/fogon`.

## 2. Formulario

- [ ] 2.1 `lib/fogon/consultas/formulario.ts` y la sección de `/netx`: U5 y U7 en el selector de plantillas; botón "Quitar <opción>" por opción (si el formulario de `fogon-consultas-panel` ya lo tiene, solo se verifica el mínimo de dos y el foco); deshabilitado con dos opciones y el texto "Una consulta necesita al menos dos opciones."; foco a la siguiente o a la anterior. Tests de la función pura de quitar (orden, mínimo). Verificar con `pnpm test lib/fogon` y con el e2e de 3.1.

## 3. Pruebas e integración

- [ ] 3.1 `e2e/fogon-panel.spec.ts` (PGlite + modo de prueba): el super admin elige U7, ve las 20 opciones, quita 14 con el teclado, crea y la persona del padrón ve 6 en el mismo orden; con U5 se crea con sus 5 opciones; con dos opciones "Quitar" está deshabilitado. Otra consulta U7 completa (20 opciones) abierta a 390 px: sin scroll horizontal y repartible con teclado. Sumar U7 completa (Mi reparto y resultado) a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-panel.spec.ts e2e/accesibilidad.spec.ts`.
- [ ] 3.2 `pnpm verificar` y `pnpm build` en verde; PR a `dev` con la nota para Gus de que la lista de U7 es la del backlog al 16-oct y se ajusta en el formulario. Verificar con los dos comandos y con `scripts/pr.sh`.
