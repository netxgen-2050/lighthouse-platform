# Proposal

## Why

La auditoría UX del 25-nov-2026 (hallazgo H11) mostró que Inicio parece una plantilla: un héroe metido en una caja translúcida que tapa la foto del valle, tres tarjetas iguales (Agua, Trabajo, Comunidad), cinco capitales en cinco tarjetas iguales y tres "Por dónde empezar" que no distinguen a quién le hablan. La visión del 23-nov-2026 (lienzo "Lighthouse · direcciones visuales") ya decía que hay tres públicos con tres preguntas: quien quiere vivir, quien invierte y quien cuida el bien común.

Cuarto cambio de la serie `ux-*` (dirección B, Gus, 25-nov-2026). Va apilado sobre `ux-explorar` (que ya trae el botón "Explorar el territorio" de #218).

## What Changes

- **Héroe a sangre:** la foto del valle ocupa el ancho completo; el título "Regenerar desde el agua. Una promesa a 2030.", la bajada y las dos acciones van directo sobre la foto, con un degradado para que se lean. Sin caja translúcida. Alto según contenido.
- **Agua, Trabajo y Comunidad** pasan de tres tarjetas a una franja de tres columnas con un ícono de línea dibujado (estilo del mapa de Participa), título y una línea, separadas por aire.
- **Cifras del sitio** (lluvia, desierto, escurrimiento) en una franja de tres números grandes en mono con su fuente debajo, sobre `surface-2`, de borde a borde.
- **Los cinco capitales** en una sola fila desplazable en el celular y en grilla en compu, sin borde (ícono + nombre + una línea), con la fuente al final.
- **Tres caminos, uno por público:** "Quiero vivir ahí" (→ Explorar), "Quiero invertir" (→ Invertir) y "Quiero cuidar el bien común" (→ Participa / Bien común). Cada camino es una tarjeta con su pregunta, un dibujo chico y una acción. Reemplaza a "Por dónde empezar".
- "Argentina, un lugar seguro y abierto" pasa a un `Aviso` tono `info` con su ⚖.

## Fuera de alcance

- Cambiar textos de fondo, cifras o sus fuentes (se reacomodan, no se reescriben).
- La Visión 2050 y el manifiesto (Participa).

## Capabilities

### New Capabilities
- `ux-inicio`: Inicio con héroe a sangre, franjas en lugar de tarjetas iguales y tres caminos por público.

## Impact

- **Cambia:** `app/page.tsx`, `components/explorar/heroe-valle.tsx` (si se comparte), `lib/idioma/textos/portada.ts` (es/en: títulos de los tres caminos).
- **Nuevo:** `components/inicio/` (franja de pilares, franja de cifras, caminos) y sus dibujos SVG, tests.
- **Tests:** `e2e/portada.spec.ts`, `e2e/idioma-portada-sumarte.spec.ts`, `e2e/accesibilidad.spec.ts`, `app/page.test.tsx`, `lib/lotes/sin-numeros-escritos.test.ts` si vigila la portada.
- **Sin** tablas, datos personales ni dependencias nuevas.
