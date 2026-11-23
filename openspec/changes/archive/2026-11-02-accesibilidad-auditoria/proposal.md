# Proposal

## Why

El producto tiene que poder usarse con teclado y lector de pantalla desde el primer día (regla de `CLAUDE.md`). La revisión del PR #1 dejó cuatro observaciones de accesibilidad y de cobertura de tests. Queremos una auditoría automática que corra en cada PR y que corrija lo que encuentre.

## What Changes

- Auditoría automática con axe (`@axe-core/playwright`) sobre **todas** las rutas públicas: `/`, `/tribus` y las 12 `/tribus/<id>`, más la página 404.
- Corrección de todas las violaciones de nivel `serious` y `critical` que encuentre.
- ⚖: Escape cierra la explicación aunque el foco esté dentro del panel o en otro control, y un clic fuera también la cierra (hallazgo 2 del PR #1).
- Test de teclado real: se llega al ⚖ con Tab y se abre con Enter **y** con Space (hallazgo 3).
- El test "sin plata ni avales" recorre las 12 tribus (hallazgo 4).
- Se elimina `app/tribus/[id]/not-found.tsx`, que nunca se muestra (hallazgo 5).

**Fuera de alcance:** rediseño visual, nuevas pantallas.

## Capabilities

### New Capabilities
- `accesibilidad`: auditoría automática y comportamiento accesible del ⚖.

### Modified Capabilities

## Impact

`e2e/`, `components/termino-legal.tsx`, ajustes puntuales en `app/**`. Dependencia de desarrollo nueva: `@axe-core/playwright`.
