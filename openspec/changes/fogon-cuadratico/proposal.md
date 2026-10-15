# Proposal

## Why

Gus quiere que el equipo **use la gobernanza ya** ("dogfooding"): priorizar y repartir presupuesto con **voto cuadrático** dentro del Fogón (backlog D7, idea del 15-oct-2026 en `NS_platform/Documentation/Desarrollo/Ideas/2026-10-15 - Fogón - priorizar con voto cuadrático.md`). Cada persona reparte 100 créditos de voz; poner *n* votos a una opción cuesta *n²*, así se mide cuánto le importa algo a cada quien. Este primer cambio arma el **motor y las pantallas sin base de datos**, con los datos en el navegador detrás de una costura, para que `fogon-cuadratico-en-la-base` solo cambie la fuente y el equipo vote de verdad.

## What Changes

- **Motor de voto cuadrático** como funciones puras, sin nada del Fogón adentro (para poder compartirlo más adelante con la Ronda 0): costo *n²*, validación de un reparto (≤ 100 créditos, enteros, votos en contra solo si la consulta los permite), agregado por votos (no por créditos), porcentaje por opción, personas que apoyaron, y **modo presupuesto** con tope y piso por opción y redistribución de lo que sobra. Montos en centavos enteros; un monto que falta es "sin dato", nunca 0.
- **Consultas del Fogón** (`/fogon/consultas` y `/fogon/consultas/<id>`), enlazadas desde `/fogon`:
  - **Lista**: título, etiqueta "Prioridades" o "Presupuesto", ámbito, fecha de cierre, estado (abierta o cerrada) y si ya repartiste.
  - **Mi reparto**: − / + por opción con su costo, medidor "te quedan X de 100", **donut de mis créditos** con la porción "sin usar", y en modo presupuesto "con tu reparto irían $X" por opción.
  - **Resultado del grupo**: donut agregado de votos, barras ordenadas con votos, %, personas que apoyaron, monto (en presupuesto) y "tu voto" marcado. Se muestra según la regla de la consulta (al votar o al cierre).
  - **Acta** al cerrar: texto de ejemplo con el resultado y la regla, y la aclaración de que el resultado es **consultivo**.
- **Donut propio** (SVG, sin librería), accesible: etiquetas con texto y %, números que unen porción y leyenda, tabla equivalente, colores de los tokens del tema, "sin dato" cuando no hay votos.
- **Consultas de ejemplo U1 a U4** de la nota (para qué optimiza el Lighthouse, tierra silvestre por fase, usos del cono de 120 ha, primer presupuesto de regeneración) con votos de ejemplo de seis personas ficticias.
- **Costura de datos**: las pantallas leen y escriben solo a través de un repositorio de consultas. La implementación de este cambio guarda el reparto propio en el navegador (clave por persona) y simula el cierre ("Simular el cierre"); la de `fogon-cuadratico-en-la-base` hablará con la API.

**Decisiones por defecto** (Gus las puede cambiar, ver preguntas abiertas en `design.md`): votos en contra apagados por defecto y configurables por consulta; resultado del grupo visible recién al cierre por defecto, configurable; 100 créditos iguales para todas las personas siempre (regla 6 de `NS_Tokenomics/AGENTS.md`: una persona, una voz); motor aparte de la Ronda 0; resultado consultivo.

**Fuera de alcance:**
- Base de datos, login real, padrón de quién vota y permisos de quién crea consultas (`fogon-cuadratico-en-la-base`).
- Crear o editar consultas desde la pantalla (`fogon-consultas-panel`).
- **Financiamiento cuadrático de la Ronda 0** (fondo de contrapartida, apoyo amplio que pesa más): es otro mecanismo; solo se deja el motor listo para compartirse.
- Que el Consejo de Regeneración marque opciones que chocan con los principios (el *gate* de la Ronda 0).
- Cobros, fondos o movimientos reales: los montos de presupuesto son de ejemplo.
- Consultas U5 a U10 de la nota y consultas por tribu o asamblea con datos reales.
- Cambiar las decisiones existentes de `/fogon` (`fogon-decisiones`), que siguen igual.

## Capabilities

### New Capabilities
- `voto-cuadratico`: reglas de cálculo del voto cuadrático (costo, validación, agregado, porcentajes y reparto de presupuesto con tope y piso), independientes de la pantalla.
- `fogon-consultas`: consultas de prioridades y presupuesto dentro del Fogón: lista, mi reparto, resultado del grupo y acta.

### Modified Capabilities

## Impact

Código nuevo: `lib/cuadratico/` (motor puro y tests), `lib/fogon/consultas/` (tipos, datos de ejemplo U1–U4, repositorio del navegador y tests), `components/donut.tsx`, `app/fogon/consultas/` (lista y detalle), un enlace en `app/fogon/page.tsx`, `lib/demo/claves.ts` (clave nueva `lh-fogon-consultas`), `e2e/fogon-consultas.spec.ts` y `e2e/accesibilidad.spec.ts`. Sin dependencias nuevas. Sin pedidos de red.
