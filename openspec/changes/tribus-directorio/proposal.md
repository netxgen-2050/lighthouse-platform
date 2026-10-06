# Proposal

## Why

Es la primera noche de los agentes de desarrollo. Necesitamos una pieza chica, visible en el preview de Vercel y sin riesgo legal ni de plata, para estrenar el circuito completo (Implementador → Revisor → Tester → Documentador). El directorio de tribus del mock-up v6 cumple esas condiciones y además es una pantalla central del producto ("Encontrarse").

## What Changes

- Nueva página `/tribus` con las 12 tribus del Lighthouse (una por barrio): nombre, sello con iniciales, barrio, foco, subtítulo y estado (activa, en formación, vacante).
- Nueva página `/tribus/[id]` por tribu: declaración, lo que tiene, lo que busca, áreas abiertas (si las tiene), lo que aporta al pozo común, ritual de entrada y forma jurídica.
- Los barrios vacantes muestran "Barrio N busca tribu" con lo que el Lighthouse necesita de ese barrio.
- Datos de ejemplo en un archivo del repo, copiados del mock-up v6 (`docs/referencia/netx-tribus-mockup-v6.html`, constante `TRIBES`). Sin base de datos.
- Un componente mínimo de término legal (⚖) que muestra en lenguaje simple los dos textos que **ya existen** en el mock-up: "Ritual de entrada" y "Comunidad con personería". No se escriben textos legales nuevos.
- Aviso visible: "Tribus, personas y cifras de ejemplo."

**Fuera de alcance (a propósito):** plata comprometida y metas en USD, roles cubiertos, avales, afinidad con la persona, botones de pactos y de Telegram, licencia de uso y adhesión al Lote 7 (pendientes de revisión legal), mapa.

## Capabilities

### New Capabilities
- `directorio-tribus`: el listado público de las tribus del territorio y la página de cada tribu.
- `termino-legal`: la forma en que la interfaz marca un término con peso legal (⚖) y lo explica en palabras simples.

### Modified Capabilities

## Impact

- Código nuevo en `app/tribus/`, `lib/tribus/` y `components/`.
- Sin dependencias nuevas de producción. Tests con Vitest (datos) y Playwright (recorrido sobre el preview).
- Sin variables de entorno ni secretos.
