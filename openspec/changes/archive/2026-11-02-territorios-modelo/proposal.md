# Proposal

## Why

La actualización del roadmap del 6-oct (nota 18, §1 punto 10 y §6 punto 8) suma a la It.1 el **multi-territorio en el modelo de datos**: el mismo software tiene que servir mañana para otros barrios de BioPueblo y para otros nodos (licencias). Hoy las tribus viven en una lista suelta, sin saber a qué territorio pertenecen. Si no lo modelamos ahora, cada pantalla nueva (ficha del territorio, permisos, compromisos, Fogón) va a suponer "hay un solo territorio" y después va a costar mucho más desarmarlo.

Este cambio es **solo modelo y lógica pura**, sin base de datos y sin pantallas, igual que `servicio-permisos`.

## What Changes

- Módulo nuevo `lib/territorios/` con el tipo `Territorio` y los datos de ejemplo de **un solo territorio**: el Lighthouse (BioPueblo Mainqué), con los datos que ya muestra el mock-up v6 (nombre, ubicación, superficie ilustrativa, descripción y los nombres de sus cuatro bienes comunes).
- Cada `Tribu` pasa a tener un `territorioId`. Las 12 tribus de ejemplo apuntan al Lighthouse.
- Funciones puras: `listarTerritorios()`, `buscarTerritorio(id)`, `tribusDeTerritorio(id)` y `resumenDeTerritorio(id)` (cuántas tribus activas, en formación y vacantes).
- El dato que falta se modela como ausente (`undefined`), nunca como 0: por ejemplo, la superficie de un territorio sin dato.

**Fuera de alcance:**
- Base de datos (Neon + Drizzle), migraciones y API.
- Cualquier pantalla (la ficha del territorio es otro cambio: `territorio-ficha`).
- **Lotes y parcelas**: el modelo no incluye lotes, fincas ni Chacras de Soluna (que comercializa BioPueblo); nada de la Ordenanza 173 entra acá.
- **Plata**: ni montos, ni costos de los bienes comunes, ni aportes, ni Guardián/fiduciario por territorio.
- Otros territorios reales (Rubania, Leusis, El Pantano…): no hay datos y no se inventan.
- Reglamento, licencias de uso y textos legales por territorio.

## Capabilities

### New Capabilities
- `territorios`: el territorio como entidad, las tribus que pertenecen a cada uno y su resumen.

### Modified Capabilities

## Impact

Código nuevo en `lib/territorios/`. Cambio chico en `lib/tribus/tipos.ts` y `lib/tribus/datos.ts` (campo `territorioId`) y en su test. Sin dependencias, sin UI, sin variables de entorno.
