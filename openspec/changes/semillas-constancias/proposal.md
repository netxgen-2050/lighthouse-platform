# Proposal

## Why

`/semillas` todavía calcula el saldo a su manera, anterior a ADR-012: con un pacto de horas fijas suma una **proyección de 3 meses** (20 h/mes → 303) que no sale de ninguna hora confirmada ni de ninguna constancia. El bloque de constancias queda aislado como "ejemplo" y no explica ese saldo (el panel dice 303 y el bloque, base 101 y ajuste 109). El mismo número llega a "Semillas totales" en `/perfil`.

Ya están construidos los datos para hacerlo bien: `pactos-dos-partes`, `tribu-necesidades`, `pacto-puntual(-verificacion)`, `pactos-horas-variables` y `evaluacion-pares`. Falta que la vista los use.

## What Changes

- **Una sola fuente del saldo.** Una función pura arma el libro de Semillas de una comunidad a partir de lo que ya está guardado: Semillas recibidas, Semillas pendientes e historial de constancias. No guarda nada nuevo.
- **Semillas recibidas = suma de constancias vigentes** (ADR-012 §Saldo). Una base con ajuste vigente cuenta por el valor del ajuste: 50 con ajuste a 54 es 54, nunca 104.
- **Semillas pendientes** aparte, sin sumar, con cuánto falta para recibirlas ("te falta 1 mes confirmado"). Quien pasó a horas fijas ve el aviso de validación, sin cuenta de meses.
- **Historial de constancias:** base, ajuste y revocadas, cada una con su origen (pacto, tarea o ronda), su período y si cuenta en el saldo.
- **Sección "Lo que abren tus Semillas":** a definir por cada tribu (D3 y D4), sin inventar utilidades.
- **BREAKING (números en pantalla).** La proyección del pacto fijo deja de sumar: se muestra rotulada como proyección y el saldo baja. Un pacto de 20 h/mes sin ronda pasa de "303" a "sin dato"; con la ronda de ejemplo enviada, a 109.
- **Se retira el medidor "Sembrador/a activo/a"** (meta de 120): medía esa proyección, no se usa fuera de `/semillas` y D4 dice que la escalera no está clara.
- **El bloque "Tus Semillas como constancias (ejemplo)" pasa al historial.** El selector de fuerza sigue como simulación y ya no mueve ni el saldo ni el historial.
- `/perfil` toma su total del mismo libro. **El Pasaporte no muestra ningún panel de Semillas** (solo el pase con ese nombre), así que no se toca.

## Fuera de alcance

- **Emitir y congelar la constancia base mensual** (ADR-021): acá se calcula en pantalla y se rotula así. Tampoco se guarda la base de la ronda.
- **Una tabla o libro en la base de datos**, firmas y EAS real (etapas 2 y 3 de ADR-012).
- **Confirmación mensual de las horas de un pacto fijo.**
- **Una pantalla o permiso para revocar y reemitir:** se muestra lo revocado que ya esté en el registro, pero no se agrega cómo revocar.
- **Ajuste por pares de meses variables y de tareas:** sigue abierto en `evaluacion-pares`.
- **Definir utilidades de tribu** (D3, D4), el reconocimiento entre nodos (D29) y Mi Raíz (B9).
- **Salidas de un pacto y validación de pendientes** al pasar a fijas: siguen en `pactos-horas-variables` (P.1).
- **Cálculo fino de Semillas por plata** (L2). Los aportes siguen sumando al total, aparte de las constancias.
- **Las tarjetas de Plata y Presencia** y la ronda de reconocimiento: no cambian, salvo los textos que hablaban del panel.
- **Los números de `/pactos`** ("Semillas por mes" del formulario).

## Capabilities

### New Capabilities
- `semillas-constancias`: cómo se calculan y se muestran las Semillas recibidas, las Semillas pendientes y el historial de constancias de una persona en cada comunidad, y lo que abren.

### Modified Capabilities
Ninguna: las specs de Semillas (`semillas-libro`, `semillas-v2`, `evaluacion-pares`, `pactos-horas-variables`) siguen como cambios sin archivar en `openspec/changes/` y no hay una spec principal que modificar. Lo que este cambio reemplaza de ellas está listado en `design.md` §9.

## Impact

- **Código:** `lib/semillas/` (función nueva y limpieza de lo que ya no se usa), `app/semillas/semillas-cliente.tsx`, `app/perfil/perfil-cliente.tsx`, `lib/idioma/textos/semillas.ts`, `lib/idioma/revision-nativa.ts`.
- **Tests:** `lib/semillas/*.test.ts`, `lib/pactos/horas.test.ts` y los e2e que esperaban la proyección o el bloque anterior (lista en `tasks.md`).
- **Datos:** sin tablas, sin migraciones, sin claves nuevas en el navegador y sin pedidos de red. Se lee lo que ya existe: `lh-pactos`, `lh-semillas-ronda` y el registro compartido de pactos.
- **Dependencias e integraciones:** ninguna.
- **Decisiones:** se apoya en ADR-012, ADR-019, ADR-020 y ADR-021. Pasa por la revisión del arquitecto en un paso aparte, porque cambia cómo se calcula un saldo y deriva constancias sin guardarlas.
