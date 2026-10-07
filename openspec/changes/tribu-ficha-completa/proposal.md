# Proposal

## Why

La ficha de cada tribu (`/tribus/[id]`) se construyó antes de la fase de prototipo interno y dejó afuera **a propósito** todo lo que tenía plata o peso legal: plata comprometida y meta en USD, roles cubiertos, avales, licencia de uso del barrio, adhesión al Lote 7 y los botones de pactos y de sala (ver `tribus-directorio`, "Fuera de alcance", y el test "sin plata ni avales"). Desde el 7-oct-2026 (decisión de Gus, `CLAUDE.md`) plata, inversión y textos legales de borrador están permitidos, y la ficha es justo donde una persona ve **cuánta plata y cuánta gente le falta a una tribu** y por dónde sumarse. Hoy es la única pantalla del recorrido que quedó por debajo del mock-up v6 (`V.tribu`) y corta el camino Tribus → Pactos → Semillas → Sumarte.

## What Changes

- **Datos:** sumar a cada tribu de `lib/tribus/datos.ts` los campos `plata` (comprometida y meta, en USD), `roles` (cubiertos y necesarios) y `avales` (cantidad), copiados de `cap`, `hum` y `avales` de `TRIBES` del mock-up v6.
- **Tribu activa o en formación:** en "Lo que tiene", dos medidores con el número escrito (Valle Solar: "Plata comprometida · USD 310.000 de USD 480.000 · 65%" y "Roles cubiertos · 9 de 14 · 64%"). En "Cómo se entra", la licencia de uso del barrio ⚖ y la adhesión al proyecto del Lote 7 ⚖. Una tarjeta nueva **"Red de confianza"**: "N personas de la red avalan a esta tribu (ejemplo)".
- **Acciones del mock-up:** "Proponer mi pacto" → `/pactos` (solo si ese destino existe en `lib/navegacion.ts`), "Entrar a la sala" (simulado: anuncia que en el producto real abriría la sala de Telegram) y "Ver su barrio en el mapa" → `/territorios/lighthouse`.
- **Barrio vacante:** el texto del mock-up con licencia ⚖ y adhesión ⚖, los medidores "Plata para arrancar" y "Roles" (en 0 de la meta, que es el dato real del ejemplo) y la tarjeta **"¿Tenés una tribu?"** con "Proponer mi tribu" (simulado, sin formulario).
- Un componente `Medidor` compartido (`components/medidor.tsx`), extraído del que ya usa `/sumarte`.
- ⚖ nuevos copiados textualmente del `LEGAL` del mock-up: `licencia` y `adherente`.
- El aviso "Prototipo interno · datos de ejemplo" en la ficha.
- El test e2e "sin plata ni avales" pasa a cubrir solo el listado `/tribus`; las fichas ahora **sí** muestran plata y avales.

**Fuera de alcance:**
- La afinidad con la persona ("Muy afín", "por qué") del mock-up: necesita `personas-demo`; va en un cambio aparte.
- Cambiar el listado `/tribus` (sigue sin montos).
- Formulario real para proponer una tribu, sala de Telegram real, avales reales con personas (los avatares son decorativos).
- Cualquier botón de pago o de aporte de plata desde la ficha: la plata se compromete en `/pactos` y `/sumarte`.

## Capabilities

### New Capabilities
- `tribu-ficha-completa`: la ficha de tribu completa según `V.tribu` del mock-up v6, con plata, roles, red de confianza, licencia y acciones simuladas.

### Modified Capabilities

## Impact

`lib/tribus/tipos.ts`, `lib/tribus/datos.ts` (y su test), `app/tribus/[id]/page.tsx` y un componente cliente para las acciones simuladas, `components/medidor.tsx`, `app/sumarte/sumarte-cliente.tsx` (usa el medidor compartido), `lib/legal/terminos.ts` (y su test), `e2e/tribus.spec.ts`, `e2e/accesibilidad.spec.ts`. Sin dependencias npm nuevas. Reemplaza, para las fichas, el requisito "sin USD ni avales" de `tribus-directorio` y `accesibilidad-auditoria` (ver design).
