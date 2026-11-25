# Design

## Context

Hoy `lib/tribus/datos.ts` tiene las 12 tribus del mock-up v6 como constante y `lib/tribus/tipos.ts` su tipo. No hay base de datos todavía (Neon + Drizzle vienen después). La nota 18 pide que cada barrio o nodo sea un "territorio" con sus tribus, su Guardián y su reglamento; para la It.1 alcanza con que el modelo lo permita.

## Goals / Non-Goals

**Goals:**
- Que ninguna pantalla nueva suponga un único territorio.
- Lógica pura, tipada y testeada, fácil de mover a Drizzle después.

**Non-Goals:**
- Persistencia, API, rutas ni componentes.
- Guardián, reglamento, licencias o fiduciario por territorio (tienen peso legal o de plata).
- Lotes: el Lighthouse no vende tierra y Chacras de Soluna no se modela.

## Decisions

- **Archivos:** `lib/territorios/tipos.ts` (tipo `Territorio`, `ResumenTerritorio`), `lib/territorios/datos.ts` (constante `TERRITORIOS` + funciones), `lib/territorios/datos.test.ts`. Mismo patrón que `lib/tribus/`, para que quien lea uno entienda el otro.
- **Relación por id, no por anidamiento:** la tribu guarda `territorioId: string`; el territorio no guarda la lista de tribus. Así queda igual que una clave foránea cuando llegue la base, y no hay dos fuentes de verdad.
- **El resumen se calcula** a partir de las tribus en cada llamada (son 12; no hace falta cache).
- **`superficie?: string`** y no número: el mock-up dice "~1.000 ha (ilustrativa)" y no queremos convertir una aproximación en una cifra exacta.
- **Textos copiados textualmente** del mock-up v6 (`V.territorio` y la lista de bienes comunes), con un comentario de origen, igual que `lib/tribus/datos.ts`. Los montos y horas de los bienes comunes del mock-up **no** se copian.

## Risks / Trade-offs

- [Cambiar `Tribu` rompe usos existentes] → el campo es obligatorio pero se completa en los 12 datos en el mismo commit; `pnpm verificar` lo detecta.
- [Choque con ramas de esta noche que también tocan `lib/tribus/`] → el cambio en tribus es una sola propiedad por objeto; si hay conflicto, se resuelve a mano en la rama de integración.
