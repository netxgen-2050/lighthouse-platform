# Proposal

## Why

La auditoría UX del 25-nov-2026 (hallazgo H7) mostró que Invertir despliega las 60 filas del libro del barrio, apila tres etiquetas arriba ("Propuesta v0.1", sello de prototipo, "No es una oferta") y en la fila de indicadores la meta pesa lo mismo que "sin dato". Gus eligió el 25-nov la dirección **C · DeFi solar** para Invertir: la página de un barrio en financiamiento se lee como la página de un pool (Uniswap), con un número que manda, pestañas y un libro paginado.

Sexto cambio de la serie `ux-*`. Va apilado sobre `ux-mi-tierra` (reutiliza la fila de posición y el patrón de actividad).

## What Changes

- **Encabezado del barrio tipo pool:** nombre del barrio, `ChipEstado` "En financiamiento", la meta de la obra como número principal en mono y tres secundarios en una fila (lo juntado, mes en que se terminaría de devolver, parte de cada pago al común). "Sin dato" se ve como tal pero con menos peso que la meta.
- **Una sola línea de aviso** en lugar de tres etiquetas: "Propuesta v0.1 en discusión · no es una oferta ⚖" como `Aviso` tono `legal` de `ux-base`. La cinta de prototipo ya está arriba.
- **Pestañas** (`Pestanas` de `ux-base`, de panel): "Cómo funciona", "Curva", "Libro".
  - Cómo funciona: los tres puntos de hoy con sus ⚖ y los dos enlaces.
  - Curva: `CurvaDevolucion` a todo el ancho, con la leyenda y la tabla por trimestre desplegable como hoy.
  - Libro: 8 filas visibles, "Ver todo el libro (N movimientos)" y filtro por tipo (entra al fideicomiso, se devuelve al inversor, va al común).
- **Prima objetivo del Token Inversor** sale de la línea apretada debajo de los indicadores y pasa a "Cómo funciona", con su ⚖ y su aclaración de "objetivo, ejemplo, en discusión, no es una promesa".
- **Sin sesión:** el estado vacío de `ux-base` con una ilustración del barrio, "Invertir se ve con una cuenta" y la acción "Sumate para ver el barrio"; el pie queda abajo.

## Fuera de alcance

- Los números, la curva y el libro (`lib/bien-comun/barrio.ts`, `sim/`): solo cambia la presentación.
- Mostrar montos sin sesión (sigue sin aparecer ningún monto en el HTML sin sesión).

## Capabilities

### New Capabilities
- `ux-invertir`: Invertir como pool de un barrio, con número principal, aviso único, pestañas y libro paginado.

## Impact

- **Cambia:** `app/invertir/invertir-cliente.tsx`, `app/invertir/page.tsx`, `components/invertir/curva-devolucion.tsx` (solo ancho y estilo), `lib/idioma/textos/invertir.ts` (es/en).
- **Tests:** `components/invertir/invertir.test.tsx`, `e2e/invertir.spec.ts`, `e2e/accesibilidad.spec.ts`.
- **Sin** tablas, datos personales ni dependencias nuevas.
