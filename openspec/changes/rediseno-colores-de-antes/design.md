# Design

## Decisiones

### 1. De dónde salen los colores
Los valores exactos están en `git show origin/dev~20:app/globals.css` o, más seguro, en el padre del commit `1b6ed24` ("Aplicar el sistema visual de la slide…"): `git show 1b6ed24^:app/globals.css`. Se copian tal cual los bloques `@theme` (claro) y `:root[data-tema="oscuro"]`, con los mismos nombres de token. Si un token nuevo del rediseño no existía, se le da un valor de la paleta de antes:
- `regen-1` a `regen-5`: de la arcilla al verde de antes (por ejemplo `clay` → `gold` → `green`), en los dos temas; nunca llevan texto encima.
- vidrio: `surface` con opacidad (claro: blanco hueso translúcido; oscuro: el `surface` oscuro de antes translúcido) y borde `line`.

### 2. Tema por defecto
Vuelve a "sistema" en `PREFERENCIAS_INICIALES` y en `SCRIPT_APARIENCIA` (sin preferencia guardada, sigue a `prefers-color-scheme`). Lo que la persona guardó se respeta.

### 3. Contraste
`lib/tema-contraste.test.ts` se queda y verifica AA con la paleta de antes en los dos temas. Si algún par de la paleta de antes no pasa AA, se ajusta lo mínimo y se anota en el PR.
