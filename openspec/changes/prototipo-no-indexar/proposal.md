# Proposal

## Why

La plataforma es un **prototipo interno** con datos de ejemplo, precios, el Pase Fundador, la porción del Lote 7 (oferta privada del círculo) y fincas de Chacras de Soluna con el loteo en trámite (CLAUDE.md, fase de prototipo; R14 y R23 de la segunda revisión). Desde `descubrir-publico` la portada, el territorio, las tribus, Sumarte, `/privacidad` y el Congreso se ven **sin cuenta**, y para el dogfooding del Fogón producción pasa a *Standard Protection* (nota Desarrollo/2026-10-15, "Lo que tiene que hacer Gus", punto 2): el dominio de producción queda abierto a cualquiera que tenga el enlace.

Hoy nada le dice a un buscador que no lo indexe: no hay `robots.txt`, ni `<meta name="robots">`, ni cabecera `X-Robots-Tag` (las previews de Vercel ya la mandan; producción no). Si alguien comparte un enlace en un lugar público, Google puede mostrar en sus resultados precios de ejemplo, el Lote 7 o "Finca disponible" de Soluna, que es justo lo que la Ordenanza 173 prohíbe publicitar y lo que R14 pide revisar **antes** de mostrar la plataforma fuera del equipo. Es un cambio chico que baja ese riesgo mientras dure la fase de prototipo.

Roadmap: It.1 "Explorar" (cumplimiento C1, "sobre un preview real"); no viene de un ítem del backlog. No repite ninguna propuesta abierta ni cerrada.

## What Changes

- **Ninguna página se indexa** mientras dure el prototipo: todas las respuestas de la plataforma (páginas, rutas de API y archivos de `public/`) llevan `X-Robots-Tag: noindex, nofollow`, y todas las páginas llevan además `<meta name="robots" content="noindex, nofollow">`. Incluye `/congreso` y `/congreso/en`.
- **`/robots.txt`**: deja pasar solo a los buscadores que tienen que leer el `noindex` para sacar la página de sus resultados (Googlebot y Bingbot) y le cierra todo al resto (`User-agent: *` → `Disallow: /`), así los rastreadores que juntan contenido (por ejemplo para entrenar modelos) no se llevan los datos de ejemplo. Sin `sitemap`.
- **Un solo interruptor** en el código (`INDEXAR = false`) del que salen las tres piezas, para que abrir la plataforma a los buscadores el día que Gus lo decida (después de R14) sea cambiar una línea.
- **Pruebas**: un test unitario del `robots.txt` y del interruptor, y un e2e que pide `/robots.txt`, la portada, el territorio, el Congreso y una ruta de API y comprueba la cabecera y la etiqueta. El e2e corre también contra el preview con `BASE_URL`.

### Fuera de alcance

- Vista previa de enlaces al compartir (Open Graph, imagen, descripción por página) y plantilla de títulos.
- Pedir a Google que saque algo ya indexado (Search Console): si hiciera falta, lo hace Gus a mano.
- Proteger producción con contraseña o con la protección de Vercel (configuración de Gus en Vercel, no código).
- Decidir qué páginas se abren a los buscadores después del prototipo (por ejemplo, la vitrina del Congreso): queda como pregunta abierta.
- Analítica, medición de visitas o cualquier envío de datos a terceros.

## Capabilities

### New Capabilities
- `indexacion-buscadores`: la plataforma, mientras sea prototipo, les pide a los buscadores que no la indexen y les cierra el paso a los demás rastreadores, con un único interruptor para cambiarlo.

### Modified Capabilities

## Impact

- Archivos nuevos: `app/robots.ts`, `lib/sitio/indexacion.ts` (+ test), `e2e/no-indexar.spec.ts`.
- Archivos que cambian: `next.config.ts` (`headers()`), `app/layout.tsx` (`metadata.robots`).
- Riesgo de integración: `idioma-base` (PR #90) cambia `metadata` del layout a `generateMetadata`; si entra antes, el campo `robots` va en lo que devuelve esa función. Sin otras dependencias.
- No toca tablas, migraciones, integraciones externas, permisos, pagos ni datos personales: no necesita revisión del arquitecto.
