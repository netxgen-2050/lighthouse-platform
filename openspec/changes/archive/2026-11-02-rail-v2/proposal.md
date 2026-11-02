# Proposal

## Why

El rail tiene 13 destinos sueltos. Hay que agruparlos y dejar las secciones personales en un menú de la persona. Decisiones de Gus del 9-oct-2026 sobre "Mi lugar" (Perfil, Pasaporte, Mi recorrido, bandeja y rail). Fase de prototipo interno, sin cuentas todavía: todo se guarda en el navegador (ver `CLAUDE.md`).

## What Changes

- El rail se organiza en grupos con un título corto visible en computadora (y como separador en el celular):
  - **Descubrir:** Inicio, Territorio, Tribus.
  - **Participar:** Pactos, Semillas, Fogón, Compromisos, Congreso.
  - **Sumarte**, destacado (estilo de botón principal).
- **Abajo del todo:** la **campanita** (de `bandeja-notificaciones`, si está en la base) y el **avatar de la persona** (iniciales del perfil o un ícono genérico), que abre un menú con **Perfil**, **Pasaporte**, **Mi recorrido** y "Salir" (deshabilitado, con la nota "llega con el login").
- **NetX** queda al final del rail con una marca "Interno" (pasará a ser solo para admins con los roles).
- Se quita `/canales` de cualquier enlace (lo absorbe el Pasaporte).
- Sigue funcionando igual en la computadora y en el celular, sin scroll horizontal, con `aria-current` en el destino actual (también cuando la página actual está dentro del menú del avatar: el avatar se marca).

**Fuera de alcance:** roles reales (NetX visible para todos por ahora).

## Capabilities

### New Capabilities
- `rail-v2`: ver specs.

### Modified Capabilities

## Impact

`lib/navegacion.ts` (grupos), `components/rail.tsx`, menú del avatar, e2e del marco y la navegación.
