# Design

## Context

- `app/layout.tsx` define `metadata` con título y descripción, sin `robots`. Varias páginas definen su propia metadata (`/congreso` y `/congreso/en` con `metadataVitrina`, territorio, tribus); Next la combina con la del layout campo por campo, así que un `robots` en el layout llega a todas mientras ninguna página lo pise.
- No existe `app/robots.ts` ni `public/robots.txt`.
- `next.config.ts` no define `headers()`.
- Vercel ya manda `X-Robots-Tag: noindex` en las URLs de preview, pero **no** en el dominio de producción. Con *Standard Protection* (paso 2 de la nota de dogfooding) producción queda abierta sin login de Vercel.
- `idioma-base` (PR #90, abierto) pasa la metadata del layout a `generateMetadata`.

## Goals / Non-Goals

**Goals**
- Que ninguna URL de la plataforma aparezca en resultados de buscadores mientras sea prototipo.
- Que los rastreadores que no son buscadores no lean el contenido.
- Volver atrás con una línea.

**Non-Goals**
- Ocultar la plataforma a quien tiene el enlace (eso es protección de acceso, no indexación).
- Open Graph, títulos, sitemap, Search Console.

## Decisions

### 1. `noindex` como herramienta principal, `robots.txt` como complemento
Un `Disallow: /` para todos parece lo más seguro, pero tiene una trampa conocida: si el buscador no puede rastrear la página, **no ve el `noindex`**, y si alguien enlaza la URL desde un sitio público, el buscador puede listarla igual (sin descripción). Por eso:
- **Googlebot y Bingbot pueden rastrear** (`Allow: /`) para leer el `noindex` y no listar nada. DuckDuckGo, Yahoo y Ecosia usan el índice de Bing.
- **Todos los demás** (`User-agent: *`) reciben `Disallow: /`: así los rastreadores que respetan `robots.txt` y no son buscadores (por ejemplo los que juntan texto para entrenar modelos) no se llevan los datos de ejemplo.
- Alternativa descartada: `Disallow: /` para todos. Más simple, pero deja abierta la puerta de "URL listada sin descripción".
- Alternativa descartada: mantener una lista de rastreadores de IA por nombre. Se desactualiza; el bloque `*` los cubre a todos los que respetan el archivo.

### 2. Cabecera y etiqueta, las dos
- La **cabecera** (`next.config.ts` → `headers()` con `source: "/:path*"`) cubre lo que no es HTML: JSON de las rutas de API, el GeoJSON y las imágenes de `public/`.
- La **etiqueta** (`metadata.robots = { index: false, follow: false }` en el layout) queda en el HTML aunque la página se guarde o se sirva desde otro lado.
- Se descarta hacerlo en un `middleware.ts`: `idioma-base` ya suma uno y no hace falta pasar cada pedido por código para una cabecera fija.

### 3. El interruptor
`lib/sitio/indexacion.ts` exporta `INDEXAR = false` y tres funciones puras:
- `reglasRobots(indexar)` → el objeto que devuelve `app/robots.ts` (`MetadataRoute.Robots`).
- `metadataRobots(indexar)` → el valor de `metadata.robots`.
- `cabecerasRobots(indexar)` → la lista para `headers()` (vacía si se indexa).

`next.config.ts` importa `cabecerasRobots(INDEXAR)` con import relativo (`./lib/sitio/indexacion`); el módulo no importa nada de Next ni de `@/`, para que la configuración lo pueda cargar. Si al implementarlo `next.config.ts` no pudiera importar el módulo, se duplica la constante y un test comprueba que las dos valen lo mismo (anotarlo en el PR).

### 4. Páginas con metadata propia
Next combina la metadata por campo: mientras ninguna página defina `robots`, vale la del layout. El e2e comprueba `/congreso/en` justamente porque tiene `generateMetadata` propio. Si `idioma-base` ya está en `dev` cuando se implemente, el `robots` va dentro de lo que devuelve el `generateMetadata` del layout.

## Risks / Trade-offs

- **Vista previa de enlaces**: algunos servicios que arman la tarjeta al pegar un enlace (WhatsApp, Slack, Telegram) leen `robots.txt`. Con `User-agent: *` → `Disallow: /`, la tarjeta puede salir sin título ni imagen. Hoy no hay Open Graph, así que el cambio es chico; si molesta, se suman sus agentes al bloque `Allow` (pregunta abierta).
- **Rastreadores que no respetan las reglas**: `robots.txt` y `noindex` son pedidos, no barreras. Lo que protege de verdad es no compartir el enlace fuera del equipo (R14).
- **Producción ya indexada**: si algo se indexó antes de este cambio, el `noindex` lo saca en la próxima pasada del buscador; si urge, Search Console.

## Migration Plan

Sin datos. Se despliega con el PR. Para abrir la plataforma a los buscadores, poner `INDEXAR = true` (y revisar antes R14). Para volver atrás, revertir el PR.

## Open Questions

- **Gus:** cuando la plataforma salga del prototipo, ¿la vitrina del Congreso (`/congreso`, `/congreso/en`) tiene que poder aparecer en Google antes que el resto? Ya tiene `hreflang` pensado para eso. Hoy queda con `noindex` como todo.
- **Gus:** ¿te importa que al pegar un enlace en WhatsApp o Slack no salga la tarjeta con título? Si sí, se agregan esos agentes al bloque que puede rastrear.
