# Proposal

## Why

La auditoría UX del 25-nov-2026 (hallazgo H6) mostró que Bien común es un documento de 8.200 px en el celular y 5.250 px en compu, con hasta tres niveles de cajas con borde una dentro de otra, texto de 13 a 14 px, todo con el mismo peso y sin índice. Tiene contenido valioso (la frase, los dos carriles y tres puentes, las tres puertas, qué da y qué no da FARO, la política de FARO, lo que hay que decidir, Ostrom, las parcelas comunes, el NFT del lote y las preguntas para el abogado), pero no se puede recorrer.

Séptimo cambio de la serie `ux-*` (dirección B, Gus, 25-nov-2026). Va apilado sobre `ux-celular`.

## What Changes

- **Índice fijo:** en compu, una columna izquierda con las secciones de la página que marca la sección visible (como la documentación de Stripe); en el celular, un botón "En esta página" que abre una hoja con el índice.
- **Secciones con aire, sin cajas dentro de cajas:** cada sección es una `Seccion` de `ux-base`. Solo llevan caja los objetos que lo son: cada carril del diagrama, cada puente, cada puerta y cada regla de la política.
- **Lo más importante abierto, lo largo plegado:** "En una frase", "Dos carriles y tres puentes" y "Las tres puertas" quedan abiertas; "La política de FARO", "Lo que hay que decidir", "Inspirado en Elinor Ostrom", "Las parcelas comunes", "NFT del lote" y "Preguntas para el abogado" se despliegan (`details` con resumen de una línea que dice qué hay adentro).
- **Texto a 16 px como mínimo** en el cuerpo; las tablas (decisiones, Ostrom) pasan a filas de dos líneas en el celular, sin scroll horizontal.
- **Un solo aviso** al principio: el estado de la propuesta ("Propuesta v0.1 · en discusión con el equipo · números de ejemplo · lo legal, a verificar con abogado") como `Aviso` legal; se sacan los otros dos que hoy se apilan (la cinta de prototipo ya está arriba).

## Fuera de alcance

- Cambiar el contenido, los números o las decisiones (`lib/idioma/textos/bien-comun.ts` solo suma los resúmenes de las secciones plegadas, es y en).
- El diagrama de los carriles (solo su estilo de caja).
- Decir "procomún": se usa "bien común".

## Capabilities

### New Capabilities
- `ux-bien-comun`: Bien común con índice, secciones con aire y contenido largo plegado.

## Impact

- **Cambia:** `app/bien-comun/page.tsx`, `components/bien-comun/*` (estilos de caja y tablas), `lib/idioma/textos/bien-comun.ts` (resúmenes, es/en).
- **Nuevo:** `components/ui/indice-pagina.tsx` (índice con sección visible, reutilizable), tests.
- **Tests:** `e2e/bien-comun.spec.ts`, `e2e/accesibilidad.spec.ts`, `lib/lotes/sin-numeros-escritos.test.ts`.
- **Sin** tablas de base, datos personales ni dependencias nuevas.
