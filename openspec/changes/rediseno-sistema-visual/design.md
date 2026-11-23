# Design

## Contexto

Los tokens de `app/globals.css` son semánticos (`bg`, `surface`, `surface-2`, `ink`, `muted`, `faint`, `line`, `deep`, `on-deep`, `gold-*`, `warn-*`, etc.) y toda la app los usa. El tema oscuro ya existe (`:root[data-tema="oscuro"]`) y lo pone el script de apariencia antes de hidratar. El tema por defecto hoy es "sistema".

## Decisiones

### 1. Mismos nombres de token, valores nuevos
Se cambian los **valores**, no los nombres. Así el rediseño llega a las 30+ páginas sin tocarlas y el riesgo queda en un solo archivo. Correspondencia propuesta (el implementador ajusta tonos intermedios para que pase el test de contraste):

| Token | Oscuro (A + C) | Claro (B) |
|---|---|---|
| `bg` | `#0E0F0B` | `#F3EFE6` |
| `surface` / `surface-2` | dos escalones más claros que el fondo, cálidos | blanco hueso y un hueso más oscuro |
| `ink` | `#F1EEE6` | `#16170F` |
| `muted` | `#B9B49B` | `#57543F` |
| `faint`, `line` | tonos del secundario, más apagados | tonos del secundario, más claros |
| `deep` (acento, fondo de botón principal) | `#D8CC92` (dorado oliva) | un oliva oscuro que pase AA con `on-deep` |
| `on-deep` | el fondo oscuro | el hueso |
| `green`, `gold`, `clay`, etc. | se acercan a la escala de regeneración | ídem, más oscuros |

Los colores de los mapas (`mapa-*`) siguen usando tokens: se repintan solos. El tema del Congreso (ADR-002) no se toca.

### 2. Escala de regeneración como tokens propios
`--color-regen-1` … `--color-regen-5` (terracota → verde). En oscuro, los valores exactos de la slide. En claro, versiones más oscuras de los mismos tonos con 3:1 contra el hueso (WCAG 1.4.11, componentes no textuales). Nunca llevan texto encima: el número va al lado de la barra.

### 3. Vidrio
`--color-vidrio`: el fondo del tema con opacidad (punto de partida: 80 %). El test de contraste mezcla ese color sobre blanco y sobre negro y exige AA para `ink`. `backdrop-filter: blur()` con `@supports`; sin soporte o con `prefers-reduced-transparency: reduce`, fondo `surface` sólido.

### 4. Fuentes
`next/font/google`: `Fraunces` (variable, `axes: ["SOFT", "opsz"]`), `Inter_Tight`, `JetBrains_Mono` (ya está). `h1`–`h3` con `font-variation-settings: "SOFT" 100`. Las variables `--font-display`, `--font-sans` y `--font-mono` mantienen su nombre.

### 5. Tema oscuro por defecto
`PREFERENCIAS_INICIALES.tema = "oscuro"`. El script de apariencia: sin preferencia guardada → `oscuro`; `sistema` → `matchMedia`. Lo guardado se respeta.

### 6. Componentes en `components/ui/`
- `indicador.tsx`: `{ etiqueta, valor: string | null, mono? }`. El valor ya viene formateado por quien llama (los formateadores de `lib/lotes/formato.ts` y `lib/bien-comun/formato.ts`); `null` → texto "sin dato" del diccionario. Estructura `<div role="group" aria-label>` o `<dl>`.
- `barra-avance.tsx`: `{ etiqueta, fraccion: number | null }`. `role="meter"` con `aria-valuenow/min/max` y `aria-valuetext` ("45 %"). Tono por quinto con una función pura `tonoDeAvance(fraccion)` testeada.
- `panel-vidrio.tsx`: contenedor con el fondo de vidrio y borde `line`.
- `tabla-libro.tsx`: `{ titulo, filas: { fecha, motivo, monto: string | null }[] }`. A 390 px, filas apiladas con la etiqueta de cada celda visible.
- `sello-prototipo.tsx`: `{ variante: "general" | "venta" }`. Reutiliza los textos de `components/aviso-ejemplo.tsx` si existen; no los duplica.
- `chip-estado.tsx`: `{ estado: EstadoChip }`, tipo cerrado; cada estado con un ícono de `lucide-react` (ya instalado) y su texto.

Los componentes existentes parecidos (`components/medidor.tsx`, `components/lotes/estado-del-lote.tsx`) **no** se reemplazan en este cambio; los cambios 3 a 5 deciden si migran.

## Riesgos

- **Toda la app cambia de golpe.** Mitigación: la tarea de axe recorre todas las rutas en los dos temas; los pares de contraste se prueban en unidad.
- **Parpadeo de tema** si el script y las preferencias no coinciden. Mitigación: test de `script-apariencia` y escenario e2e de primera visita.
- **Fraunces variable pesa más.** Se cargan solo los ejes SOFT y opsz y el subconjunto latino.
