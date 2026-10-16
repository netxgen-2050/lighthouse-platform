# Tasks

Rama `agente/fogon-mis-envios` desde `dev`, **después** de que `fogon-cuadratico` y `fogon-cuadratico-en-la-base` estén en `dev`. Si no están, frenar y reportar. Sin rutas, tablas ni columnas nuevas: si hacen falta, frenar y reportar. No arrancar sin la revisión del arquitecto anotada en este cambio.

## 1. Datos

- [ ] 1.1 `lib/fogon/consultas/servidor.ts`: `misEnvios(consultaId, personaId)` (envíos propios con sus votos, del más nuevo al más viejo, por `registrado_at desc, orden desc`, sin `persona_id` en la salida) y `guardarReparto` que devuelve `{ id, registradoAt }`. `vista` suma `misEnvios` solo de quien pregunta. Tests con PGlite: tres envíos en orden, envío en cero, la vista de B no trae envíos de A (secreto y abierto), el super admin sin envíos recibe lista vacía, la salida no tiene `persona_id` ni email. Verificar con `pnpm test lib/fogon`.
- [ ] 1.2 Fuente del navegador: guarda el historial de envíos propios (id aleatorio y hora local) en la misma clave de `lh-fogon-consultas`, y lee bien lo guardado antes de este cambio (sin historial: un solo envío con el reparto guardado y sin hora, que se muestra "sin dato"). Tests. Verificar con `pnpm test lib/fogon`.

## 2. Pantalla

- [ ] 2.1 Comprobante después de guardar (región `role="status"`) y sección desplegable "Mis envíos en esta consulta" (`<details>`/`<summary>` o botón con `aria-expanded`), con "Este es el que cuenta", "Sin votos", los textos de consulta cerrada y el de sin envíos. Fecha y hora en hora de Argentina con el formato de `fogon-cuadratico`. Verificar con `pnpm verificar` y el e2e de 3.1.

## 3. Pruebas

- [ ] 3.1 `e2e/fogon-mis-envios.spec.ts` (PGlite + modo de prueba, y la fuente del navegador si es más simple para parte de los casos): guardar muestra comprobante con código de 8 caracteres; tres guardados dejan tres envíos con el último marcado; envío en cero como "Sin votos"; consulta cerrada dice "Contó tu envío del …" con el mismo código; la respuesta de red de otra persona no trae envíos ajenos (voto secreto); teclado y 390 px. Sumar el detalle con la sección abierta a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-mis-envios.spec.ts e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR a `dev` con `scripts/pr.sh`. Verificar con los dos comandos y con el número de PR que devuelve `scripts/pr.sh numero`.
