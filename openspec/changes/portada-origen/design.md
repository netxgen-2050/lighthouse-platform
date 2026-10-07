# Design

## Context

`app/page.tsx` es un Server Component que arma los caminos con `caminosDePortada()` (`lib/portada.ts`) y ya muestra el botón "Elegí cómo sumarte" solo si `/sumarte` existe en `DESTINOS`. En Next 15, `searchParams` llega a la página como `Promise`. `/sumarte` tiene la sección `id="inversores"`. El ⚖ `circulo` ya está en `lib/legal/terminos.ts` y se muestra con `components/termino-legal.tsx`. `e2e/portada.spec.ts` fija el orden de los caminos y el recorrido con Tab.

## Goals / Non-Goals

**Goals:**
- Traducir el link de entrada a un camino con una función pura y testeada.
- Marcar el camino recomendado sin romper el orden ni el recorrido con teclado.
- Una puerta visible a inversores para las campañas de inversión.

**Non-Goals:**
- Persistir el origen, medirlo o mandarlo a un CRM; nodos del corredor.

## Decisions

1. **Ids de camino:** `Camino` suma `id: "explorar" | "tribu" | "congreso"` en `caminosDePortada()`. `OrigenId = Camino["id"] | "inversor"`.
2. **`origenDeVisita(params: Record<string, string | string[] | undefined>): OrigenId | null`** en `lib/portada.ts`. Toma el primer valor si viene un arreglo. `camino` gana si es un id válido; si no, `utm_campaign` en minúsculas con las reglas de la spec en orden (invers/invert → inversor, congreso, tribu, territorio/nodo → explorar). Cualquier otro caso → `null`. Sin acceso a `window` ni a cookies.
3. **Página:** `export default async function Home({ searchParams }: { searchParams: Promise<...> })`, `const origen = origenDeVisita(await searchParams)`. Leer `searchParams` hace que la portada se renderice por pedido; es una página liviana y está bien para el prototipo.
4. **Inversor también recomienda:** con `inversor` ningún camino de los tres lleva "Recomendado para vos" (la recomendación es la sección de inversores). Con `explorar`, `tribu` o `congreso`, se marca la tarjeta de ese id.
5. **Marca:** dentro del `<Link>` de la tarjeta, antes de la etiqueta, un `<span>` "Recomendado para vos" con `font-semibold text-deep`; la tarjeta pasa de `border` a `border-2 border-deep`. Texto + grosor de borde: no depende solo del color. Mismo foco visible que hoy.
6. **Sección inversores:** `<section aria-labelledby="venis-a-invertir">` con `<h2 id="venis-a-invertir">¿Venís a invertir?</h2>`, el texto "Hay dos puertas: sumarte al proyecto del territorio por invitación ⚖ o invertir en NetX como empresa. Las dos están en Sumarte, con lo que da cada una y quién la ofrece." (`TerminoLegal` con la clave `circulo` en "por invitación") y `<Link href="/sumarte#inversores">Ver Para inversores</Link>` con el estilo del botón principal. Solo se muestra si `/sumarte` existe en `DESTINOS` (mismo criterio que el botón actual). Sin cifras.
7. **Estilo:** solo tokens del tema; un único `<main>` (lo pone el layout).

## Risks / Trade-offs

- [Las campañas reales de HubSpot pueden usar otros nombres de `utm_campaign`] → las reglas por subcadena cubren variantes; agregar una regla es una línea con su test.
- [La portada deja de ser estática] → costo despreciable en Vercel; si molesta, la marca puede pasar a un componente cliente.
- [Mostrar "¿Venís a invertir?" a quien llegó por error con ese link] → no compromete nada: es un enlace a información.

## Open Questions

- ¿Qué nombres de campaña (`utm_campaign`) va a usar el equipo en HubSpot para inversores, nodos y Congreso? Las reglas se ajustan cuando se definan (Gus/Franz).
- El ⚖ `circulo` dice "sin difusión masiva del instrumento". ¿Una campaña de HubSpot que lleve a la portada con `camino=inversor` y nombre el círculo cuenta como difusión? En el prototipo interno no importa; antes de usarlo fuera del equipo lo tiene que revisar Gabriel (pendiente R14).
