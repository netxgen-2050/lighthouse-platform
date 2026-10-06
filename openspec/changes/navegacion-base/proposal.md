# Proposal

## Why

Las páginas nacen sueltas y con estilos improvisados. Antes de que haya diez pantallas, necesitamos un marco común (encabezado, navegación, pie, paleta y tipografías del mock-up v6) para que todo se vea como un solo producto y para que cada página nueva no reinvente el estilo.

## What Changes

- Paleta del mock-up v6 como tokens de Tailwind 4 en `app/globals.css` (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--deep`, `--green`, `--gold` y sus variantes).
- Tipografías del mock-up: Anek Latin (títulos), Figtree (texto), JetBrains Mono (detalles), con `next/font`.
- Encabezado global con la marca "NetX · Tribus · Territorios regenerativos", navegación (Inicio, Tribus) y enlace "Saltar al contenido".
- Pie con el aviso "Prototipo en desarrollo. Datos de ejemplo." y el año.
- Portada alineada al mock-up (título "Encontrá tu tribu. Construí en común." y el botón a `/tribus`).
- Las páginas de tribus pasan a usar los tokens en lugar de colores sueltos.

**Fuera de alcance:** enlaces a páginas que no existen en `main` (Congreso, Perfil, Mapa se suman cuando se mergeen), modo oscuro, menú de cuenta.

## Capabilities

### New Capabilities
- `marco-visual`: encabezado, navegación, pie, paleta y tipografías comunes.

### Modified Capabilities

## Impact

`app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `components/` (encabezado, pie) y clases de color en `app/tribus/**`.
