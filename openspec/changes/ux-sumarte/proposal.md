# Proposal

## Why

La auditoría UX del 25-nov-2026 (hallazgo H9) mostró que Sumarte mide 5.100 px en el celular: cuatro planes en tarjetas largas una debajo de otra, una tabla comparativa que a 390 px muestra una sola de cuatro columnas (el encabezado "Explor…" queda cortado), "Comprar un lote", "Invertir" y "En NetX como empresa" al final, y el panel de prueba "Entrar como…" dentro de la página.

Octavo cambio de la serie `ux-*` (dirección B, Gus, 25-nov-2026). Va apilado sobre `ux-celular`.

## What Changes

- **Primero, la pregunta:** arriba, tres caminos como en Inicio (vivir, invertir, cuidar el bien común) que llevan a la parte de la página que corresponde. Debajo, los planes.
- **Planes en un selector segmentado:** Explorador, Miembro, Fundador y Comunidad en un control de cuatro opciones (en el celular, deslizable); se ve un plan por vez con su precio, para quién es, lo que incluye (lista corta) y su acción. El Pase Fundador mantiene sus tres niveles (Semilla, Brote, Raíz) como opciones dentro del plan.
- **Comparación sin tabla rota:** en compu sigue la tabla, con encabezado fijo; en el celular, "Qué incluye cada plan" se ve como una lista por plan dentro del plan elegido.
- **"Comprar un lote", "Invertir" y "En NetX como empresa"** como tres tarjetas de destino al final (una línea y una acción cada una), con el estado administrativo compacto de `ux-base` donde se mencionan lotes.
- **Panel de prueba "Entrar como…"** sale del cuerpo y pasa a un cajón plegado al final de la página ("Modo de prueba"), visible solo cuando el modo de prueba está activo, como hoy.
- **Sin tocar el login:** el botón de Google y el formulario de código son del PR #217 (`login-google-estandar`). Este cambio no toca `components/sesion/`.

## Fuera de alcance

- Precios, beneficios y reglas de los planes (`lib/idioma/textos/sumarte.ts` solo suma los textos de los caminos, es y en).
- El flujo de entrada (Neon Auth, Google, código por email).

## Capabilities

### New Capabilities
- `ux-sumarte`: Sumarte con caminos por público, planes en un selector, comparación que entra en el celular y panel de prueba aparte.

## Impact

- **Cambia:** `app/sumarte/sumarte-cliente.tsx` (presentación), `app/sumarte/page.tsx`, `lib/idioma/textos/sumarte.ts` (es/en).
- **Nuevo:** `components/sumarte/` (selector de planes, plan, comparación móvil), tests.
- **Tests:** `e2e/sumarte*.spec.ts`, `e2e/idioma-portada-sumarte.spec.ts`, `e2e/membresia.spec.ts`, `e2e/login.spec.ts` (solo si busca el panel de prueba por posición), `e2e/accesibilidad.spec.ts`.
- **Sin** tablas, datos personales ni dependencias nuevas.
