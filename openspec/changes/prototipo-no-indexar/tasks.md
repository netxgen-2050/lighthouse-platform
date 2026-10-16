# Tasks

## 1. Interruptor y robots.txt

- [ ] 1.1 Crear `lib/sitio/indexacion.ts` con `INDEXAR = false`, `reglasRobots(indexar)`, `metadataRobots(indexar)` y `cabecerasRobots(indexar)` (design §3), sin importar nada de Next ni de `@/`. Verificar con `lib/sitio/indexacion.test.ts`: apagado → reglas con `Googlebot` y `Bingbot` en `Allow: /`, `*` en `Disallow: /`, sin `sitemap`; metadata `{ index: false, follow: false }`; cabecera `X-Robots-Tag: noindex, nofollow` para `/:path*`. Encendido → `*` con `Allow: /`, metadata sin `noindex`, lista de cabeceras vacía. `pnpm verificar` en verde.
- [ ] 1.2 Crear `app/robots.ts` que devuelve `reglasRobots(INDEXAR)`. Verificar en `pnpm dev` que `/robots.txt` responde texto plano con los dos bloques y sin `Sitemap`.

## 2. Cabecera y etiqueta

- [ ] 2.1 En `next.config.ts`, `async headers()` con `cabecerasRobots(INDEXAR)` (import relativo). Si no se puede importar, aplicar el plan B del design §3 y anotarlo en el PR. Verificar con `pnpm build` (sin errores de configuración); la cabecera la comprueba el e2e de 3.1.
- [ ] 2.2 En `app/layout.tsx`, `metadata.robots = metadataRobots(INDEXAR)` (o dentro de `generateMetadata` si `idioma-base` ya está en `dev`). Comprobar que ninguna página define `robots` propio (`grep -rn "robots" app`). Verificar con el e2e de 3.1.

## 3. E2E

- [ ] 3.1 Crear `e2e/no-indexar.spec.ts` con el fixture `request` y `page`, sin sesión: (a) `/robots.txt` tiene `User-agent: *` seguido de `Disallow: /`, el bloque de `Googlebot`/`Bingbot` con `Allow: /` y ninguna línea `Sitemap`; (b) `/`, `/territorios/lighthouse`, `/tribus/valle`, `/sumarte`, `/congreso`, `/api/sesion` y `/no-existe` traen `x-robots-tag` que contiene `noindex` y `nofollow`; (c) en `/` y en `/congreso/en` hay exactamente una `meta[name="robots"]` y su `content` contiene `noindex` y `nofollow`. Verificar con `pnpm test:e2e e2e/no-indexar.spec.ts` y, con preview, `BASE_URL=<url> pnpm test:e2e e2e/no-indexar.spec.ts`.

## 4. Cierre

- [ ] 4.1 `pnpm verificar`, `pnpm build` y `pnpm test:e2e` completos en verde. En el PR, una línea para Gus: "Para abrir la plataforma a los buscadores: `INDEXAR = true` en `lib/sitio/indexacion.ts`, después de R14".
