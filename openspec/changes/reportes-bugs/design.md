# Design

## Context

POC sin base de datos ni cuentas. La app corre en Vercel (Next.js App Router). Los reportes los revisa Gus y después le indica a Claude qué hacer; Claude lee los issues con `gh`.

## Decisions

- **GitHub Issues como registro.** Alternativas: Airtable o Notion (más cómodas para personas no técnicas, pero quedan lejos del código), una base propia (no existe todavía). Issues permite enlazar el arreglo con el PR ("Closes #42"), filtrar por etiqueta y que Claude los lea y comente con `gh`. Los testers no necesitan cuenta: escribe el servidor.
- **Ruta del servidor `POST /api/reportes`** que valida (con funciones puras de `lib/reportes/`) y llama a `POST https://api.github.com/repos/netxgen-2050/lighthouse-platform/issues` con `fetch` y el token. Si falta el token responde 503 con `{ configurado: false }`.
- **Versión desplegada:** `process.env.VERCEL_GIT_COMMIT_SHA` y `VERCEL_ENV`, leídos en el servidor y pasados al cliente por el layout (sin exponer nada sensible).
- **Etiquetas:** si no existen en el repo, GitHub las crea al usarlas en el issue.
- **Tests:** la lógica pura con Vitest; el e2e intercepta `/api/reportes` con `page.route` (éxito con un número de issue, 503 sin configurar) para no crear issues reales; un test unitario de la ruta con `fetch` simulado verifica el cuerpo enviado a GitHub y que el token no aparece en la respuesta.

## Risks / Trade-offs

- [Spam si la app se abre al público] → campo trampa y largos máximos ahora; límite por IP cuando haya almacenamiento.
- [El token da acceso al repo] → token de permisos finos, solo "Issues: lectura y escritura" sobre `lighthouse-platform`.

## Migration Plan

Mergear y, después, cargar `REPORTES_GITHUB_TOKEN` en Vercel (Production y Preview). Hasta entonces el botón funciona con "Copiar el reporte".
