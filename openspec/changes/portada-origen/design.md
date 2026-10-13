# Design

## Context

`app/page.tsx` es un componente de servidor estático que pinta `caminosDePortada()` de `lib/portada.ts` (tres tarjetas: `/tribus`, `/perfil`, `/congreso`). Los pedidos de contacto se arman en `components/pedido-contacto.tsx` con `crearPedido` de `lib/contactos/pedidos.ts` y se guardan en `lh-contactos`; `leerBandeja` valida cada pedido con `esPedido`. La bandeja de `/netx` está en `app/netx/bandeja-pedidos.tsx`. `borrarDemo` recorre todas las `CLAVES` de `lib/demo/claves.ts`, así que sumar la clave alcanza para borrarla.

## Goals / Non-Goals

**Goals:** recomendar un camino por link; guardar el primer origen de campaña de forma segura; verlo en cada pedido y en la Vista NetX.

**Non-Goals:** CRM, envío a servidores, cookies, atribución multi-toque, capturar `utm_*` fuera de la portada.

## Decisions

1. **Lectura en el servidor, guardado en el cliente.** `app/page.tsx` recibe `searchParams` (en Next 15 es una `Promise`) y llama a `leerParametros(params)` de `lib/origen/origen.ts`, que devuelve `{ camino?: CaminoId; fuente?: string; medio?: string; campana?: string }` ya limpio. El `camino` se pasa a las tarjetas para la marca; si hay algún `utm_*`, se pinta `<GuardarOrigen origen={...} />` (componente cliente sin UI) que en un `useEffect` guarda en `lh-origen` solo si no hay uno válido. Leer en el servidor evita un parpadeo de la marca y el `Suspense` de `useSearchParams`. Costo: `/` deja de ser estática (se renderiza por pedido); es una página liviana.
2. **Valores sin filtros** (decisión de Gus, 13-oct-2026). `limpiar(valor)`: toma el primer valor si viene repetido, saca los espacios de los bordes y corta a 200 caracteres; vacío → `undefined`. No cambia mayúsculas ni quita símbolos. `camino` solo vale si está en `["tribus", "perfil", "congreso"]`. Nada de lo recibido se pinta con `dangerouslySetInnerHTML`.
3. **Formato guardado.** `lh-origen` = `{ fuente?, medio?, campana?, camino?, fecha }` (fecha ISO). `leerOrigen(texto)` devuelve `null` si el JSON no es válido o no tiene al menos una de fuente, medio o campaña, y vuelve a limpiar cada campo al leer.
4. **Pedidos.** `Pedido` y `Borrador` suman `origen?: { fuente?: string; medio?: string; campana?: string }`. `PedidoContacto` lee `lh-origen` al enviar y lo pasa en el borrador; `crearPedido` lo copia solo si tiene alguna parte; `esPedido` acepta pedidos sin `origen` (los ya guardados) y descarta un `origen` mal formado ignorando solo ese campo. La lectura del origen desde el componente pasa por una función de `lib/origen/` para que el componente no conozca la clave.
5. **Marca en la tarjeta.** `caminosDePortada()` suma un `id` (`tribus`, `perfil`, `congreso`) a cada camino. La tarjeta recomendada lleva una etiqueta visible "Recomendado para vos" dentro del enlace (así entra en el nombre accesible) y `border-2 border-deep`. Solo tokens.
6. **Bandeja.** Columna "Origen" después de "Destino" con `formatoOrigen(origen)` → `"fuente · medio · campaña"` con "sin dato" por parte, o "sin dato" si no hay origen. Se testea con Vitest.
7. **Privacidad.** Fuente, medio y campaña describen el link, no a la persona, y se descarta cualquier otro parámetro (por ejemplo, un email en la URL). Queda solo en el navegador y se borra con "Borrar todo". Cuando se implemente `privacidad-consentimiento`, `lh-origen` tiene que entrar en su lista de lo que se guarda.

## Risks / Trade-offs

- **`/` dinámica.** Se pierde el prerender estático de la portada. Alternativa descartada: leer en el cliente con `useSearchParams` dentro de `Suspense` (marca con parpadeo y más código).
- **Primer contacto.** Si la persona llega primero por un link de prueba del equipo, ese queda como origen hasta "Borrar todo". Aceptable en el prototipo.
- **Conflicto con `perfil-v3`**, que puede cambiar el texto de la tarjeta "Encontrar mi tribu". Este cambio no toca textos de las tarjetas, solo agrega `id` y la marca.

## Open Questions

- ¿Atribución por primer contacto (lo propuesto) o por último contacto? Depende de cómo quiera leer el embudo el equipo y del CRM que se elija.
- ¿Hace falta un camino "inversor" que lleve a `/sumarte` y se pueda preseleccionar por link? Hoy la portada no tiene esa tarjeta.
