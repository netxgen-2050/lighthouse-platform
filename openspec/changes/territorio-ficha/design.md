# Design

## Context

El mock-up v6 (`V.territorio`) combina mapa, selector Lighthouse/Soluna, panel lateral y bienes comunes con barras de plata y horas. Para la It.1 tomamos solo lo que no depende del GIS, de lotes, de plata ni de textos legales todavía no aprobados. Los datos vienen de `lib/territorios/` (cambio `territorios-modelo`) y de `lib/tribus/`.

## Goals / Non-Goals

**Goals:**
- Un paso "Territorio" navegable en el preview, que lleve a las tribus.
- Página estática (Server Component, `generateStaticParams`), sin JavaScript de cliente.

**Non-Goals:**
- Mapa, capas, leyenda geográfica.
- Cualquier cifra de plata u horas; cualquier mención a lotes.
- Términos ⚖ nuevos.

## Decisions

- **Ruta dinámica `/territorios/[id]`** en lugar de `/territorio`: respeta el modelo multi-territorio desde el día uno. `generateStaticParams` sale de `listarTerritorios()`; `notFound()` para ids desconocidos, con `app/territorios/[id]/not-found.tsx` igual que en tribus.
- **Sin `<main>` propio:** el contenedor raíz de la página es un `<div>` (o `<article>`) con el ancho máximo; el `<main id="contenido">` lo pone `app/layout.tsx`. Lección de la integración del 6-oct: las páginas que anidaban `<main>` rompían la auditoría de accesibilidad.
- **Solo tokens del tema** (`text-ink`, `text-muted`, `bg-surface`, `border-line`, `bg-deep`, `text-on-deep`, `bg-green-soft`, `bg-gold-soft`, `text-gold-ink`…), definidos en `app/globals.css` por `navegacion-base`. Prohibido `stone-*`, `emerald-*`, `amber-*` o hex sueltos. Se reutiliza `SelloTribu` para el estado y se acompaña siempre del texto de `TEXTO_ESTADO`.
- **Estructura semántica:** `h1` con el nombre, `h2` "Tribus del territorio" y `h2` "Bienes comunes"; los barrios en una `<ul>` de enlaces; el resumen en una `<dl>`.
- **Navegación:** se agrega un ítem "Territorio" al arreglo de enlaces del encabezado de `navegacion-base`, entre "Inicio" y "Tribus", reutilizando su lógica de `aria-current`.
- **Prueba anti-plata/anti-lotes en e2e:** se lee el `innerText` de la página y se buscan los términos prohibidos; es barato y protege de que alguien copie después las barras del mock-up.

## Risks / Trade-offs

- [Si `navegacion-base` o `territorios-modelo` no están en `main` cuando se implemente] → el implementador frena y reporta; no copia tokens ni modelo a mano.
- [La ficha queda "pobre" sin mapa ni ⚖ de licencia] → es deliberado; se completa cuando Gabriel apruebe los textos y llegue el GIS.
- [La búsqueda de "h" de horas da falsos positivos] → el test busca patrones concretos (`/\d+\s?h\b/`, `USD`, `\$`), no la letra suelta.
