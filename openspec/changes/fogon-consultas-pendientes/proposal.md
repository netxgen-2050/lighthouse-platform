# Proposal

## Why

El plan de dogfooding (`NS_platform/Documentation/Desarrollo/2026-10-15 - Estrategia - dogfooding del Fogón.md`) se mide así: **al menos 4 personas del equipo votan en al menos 2 consultas reales**. Hoy una persona solo se entera de que hay una consulta abierta si entra a `/fogon/consultas` por su cuenta. `fogon-cuadratico-en-la-base` dejó afuera, a propósito, las notificaciones ("se abrió una consulta", "cierra mañana") y los recordatorios a quien falta votar. Este cambio cubre lo mínimo: **avisarle a cada persona qué consultas tiene abiertas sin repartir y cuándo cierran**, con lo que ya devuelve la lista de consultas, sin tablas, sin rutas nuevas y sin mail.

## What Changes

- **Consultas por repartir**: una función pura arma, a partir de la lista de consultas del repositorio (`listar()`), las que están **abiertas** y en las que la persona **todavía no guardó un reparto con al menos un voto**, ordenadas por cierre, con el texto del cierre: "Cierra hoy", "Cierra mañana" o "Cierra el <fecha>".
- **Aviso en el Fogón**: arriba de `/fogon` y de `/fogon/consultas`, "Tenés N consultas por repartir" con cada título enlazado y su cierre. Si no hay, no se muestra nada. Si la lectura falla: "No pudimos saber si tenés consultas por repartir", nunca "0".
- **Campanita y bandeja**: la campanita suma las consultas por repartir a su número (y a su nombre accesible). `/bandeja` las muestra primero, en un grupo "Consultas por repartir". Esos ítems se calculan, no se guardan: no se marcan como leídos, y desaparecen al repartir o cuando la consulta cierra.
- **Preferencia**: un tipo de aviso nuevo, "Consultas del Fogón", en `/configuracion`. Apagado, la campanita y la bandeja no cuentan esas consultas, pero el aviso dentro del Fogón se sigue viendo.
- **Mi recorrido**: si hay consultas por repartir, el próximo paso es "Repartí tus votos", con la consulta que cierra primero. Va antes que los demás pasos porque tiene fecha.
- **Cuándo se revisa**: al cargar la página y cada vez que la pestaña vuelve a estar visible. No se consulta en intervalos.

**Decisiones por defecto** (Gus las puede cambiar): "Repartí tus votos" va primero en Mi recorrido; la preferencia arranca prendida; un reparto guardado con todas las opciones en 0 no cuenta como repartido (es el mismo criterio que usa "Faltan votar").

**Fuera de alcance:**
- Mail, Telegram, notificaciones push o del navegador.
- Avisos guardados en la base (`avisos-en-la-base`, PR #61, en pausa) y "se cerró una consulta" o "ya está el resultado".
- Recordatorios que el super admin manda a mano a quien falta votar.
- Consultas de tribu o de asamblea, y las decisiones viejas de `/fogon` (`fogon-decisiones`).
- Cambiar las reglas del voto, el padrón o la API de `fogon-cuadratico-en-la-base`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: suma el aviso de consultas abiertas sin repartir en el Fogón, la campanita, la bandeja y Mi recorrido.

## Impact

Depende de `fogon-cuadratico` (repositorio con `listar()`, `yaReparti` y estado). Funciona igual con la fuente del navegador y con la de la base (`fogon-cuadratico-en-la-base`), porque solo lee del repositorio. Archivos: `lib/fogon/consultas/pendientes.ts` (función pura y tests), un hook `usarConsultasPendientes`, `components/aviso-consultas.tsx`, `components/campanita.tsx`, `app/bandeja/bandeja-cliente.tsx`, `app/fogon/` (página y lista de consultas), `lib/configuracion/preferencias.ts`, `lib/panel/proximo-paso.ts`, `e2e/fogon-pendientes.spec.ts` y `e2e/accesibilidad.spec.ts`. Sin tablas, migraciones, rutas ni dependencias nuevas.
