# Proposal

## Why

El POC (prototipo con demos, sin base de datos) ya lo usan Gus, su equipo y pronto los primeros testers. Gus empieza a encontrar bugs y quiere un flujo ágil: que cualquiera reporte desde la pantalla donde está, y que los reportes queden en un lugar donde Gus los revisa y le dice a Claude cómo proceder. Decisión de Gus (7-oct-2026).

## What Changes

- **Botón fijo abajo a la derecha**, presente en todas las páginas y siempre visible al navegar ("Reportar"), que abre un diálogo accesible.
- **Formulario corto:** tipo ("Algo no funciona", "Idea o mejora", "Pregunta"), qué pasó (obligatorio), qué esperabas (opcional), nombre o email (opcional, para responder).
- **Contexto automático** adjunto al reporte, visible para quien reporta antes de enviar: URL y ruta, título de la página, tamaño de pantalla, navegador, versión desplegada (commit de Vercel), entorno (producción o preview) y fecha y hora.
- **Destino: GitHub Issues** del repo `netxgen-2050/lighthouse-platform`, con las etiquetas `reporte` y una por tipo (`bug`, `idea`, `pregunta`). Lo envía una ruta del servidor (`app/api/reportes/route.ts`) con un token guardado en Vercel (`REPORTES_GITHUB_TOKEN`); el navegador nunca ve el token. Los testers no necesitan cuenta de GitHub.
- **Sin token configurado** (por ejemplo en los previews o en local): la ruta responde que no está configurada y el diálogo ofrece "Copiar el reporte" para pegarlo en otro lado. Nada se pierde en silencio.
- **Protección mínima:** campo trampa para bots, largo máximo por campo, y validación en el servidor.

**Fuera de alcance:** capturas de pantalla adjuntas (más adelante, con almacenamiento de archivos), cuentas (llega con el login), vista de reportes dentro de la app (se revisan en GitHub).

## Capabilities

### New Capabilities
- `reportes`: reportar bugs, ideas y preguntas desde cualquier pantalla y registrarlos como issues.

### Modified Capabilities

## Impact

`components/boton-reportar.tsx` (montado en `app/layout.tsx`), `app/api/reportes/route.ts`, `lib/reportes/` (validación, armado del issue, contexto), `e2e/reportes.spec.ts`. Variable de entorno nueva en Vercel: `REPORTES_GITHUB_TOKEN` (la carga Gus). Sin dependencias nuevas: la ruta usa `fetch` contra la API REST de GitHub.
