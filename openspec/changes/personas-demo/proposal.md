# Proposal

## Why

La demo de la It.1 "Explorar" es **el recorrido de Lucía y Lucas** (roadmap técnico, nota Desarrollo/06), y la de la It.2 es que "Lucía y Lucas ven caminos distintos". El mock-up v6 resuelve esto con dos botones fijos arriba ("Vista Lucía · NO" / "Vista Lucas · AR") que cambian la persona de toda la plataforma. En el código no existe: no hay datos de las personas de ejemplo y cada pantalla que las necesita las inventa por su cuenta (el Fogón, en la integración de esta noche, ya trae su propio selector y su propia copia de Lucía y Lucas en `lib/fogon/datos.ts`). Sin una fuente única, las pantallas que siguen (Pasaporte, Pactos, Semillas, Sumarte, Mi panel) van a divergir y la demo "dos personas, dos caminos" no se puede mostrar.

## What Changes

- `lib/personas/`: los datos de `PEOPLE` del mock-up v6 copiados tal cual (nombre, edad, ciudad, nacionalidad, residencia fiscal, bio, rol, modalidad de aporte, horas, presencia, origen de fondos, calificado, residente) y una función pura `elegibleFideicomiso(persona)` que replica `eligibleFid` del mock-up (residencia fiscal argentina).
- Un selector global **"Ves la plataforma como: Lucía (NO) / Lucas (AR)"** en una franja arriba del contenido, en todas las páginas, con botones `aria-pressed` y el estado escrito en texto (no solo con color).
- La persona elegida se guarda en el navegador (`CLAVES.persona` en `lib/demo/claves.ts`) y se comparte entre componentes con un hook `usePersona()`. Por defecto: Lucía (como el mock-up).
- Al cambiar de persona se anuncia "Ahora ves la plataforma como Lucas" en una región `aria-live="polite"` (equivalente al toast del mock-up).
- "Borrar todo lo de este navegador" (`/panel`) también borra la persona elegida (basta con sumar la clave a `CLAVES`: `borrarDemo` recorre todas) y el selector vuelve a Lucía sin recargar.

**Fuera de alcance:**
- Adaptar las pantallas existentes a la persona (perfil, sumarte, panel, pactos, semillas, fogón). Cada una se adapta en su propio cambio; el primero es `pasaporte-caminos`.
- Reemplazar el selector propio del Fogón por el global (ver preguntas abiertas).
- Estado separado por persona en otras pantallas (el `S.st[who]` del mock-up).
- El botón "Vista NetX" del mock-up: lo cubre el destino `/netx` del rail (`vista-netx`).
- Cuentas reales, login, personas creadas por el usuario.

## Capabilities

### New Capabilities
- `personas-demo`: las dos personas de ejemplo del mock-up (Lucía y Lucas) como fuente única y el selector global para elegir con cuál se recorre la plataforma.

### Modified Capabilities

## Impact

`lib/personas/` (datos, elegibilidad, hook y tests), `components/selector-persona.tsx`, `app/layout.tsx` (la franja antes de `<main>`), `lib/demo/claves.ts` (y su test), `e2e/personas.spec.ts`, `e2e/accesibilidad.spec.ts`. Sin dependencias npm nuevas. Desbloquea `pasaporte-caminos`.
