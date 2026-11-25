# Design

## Context

C11 pide saber qué se le mostró a cada persona y cuándo, incluido el estado administrativo. Los textos legales viven en `lib/legal/terminos.ts` y se muestran con `components/termino-legal.tsx` (cliente). `estado-administrativo` agrega `components/estado-administrativo.tsx` (servidor). No hay cuentas ni base: el modo demostración guarda en `localStorage` con las claves de `lib/demo/claves.ts`.

## Decisions

- **Funciones puras** (`lib/demo/bitacora.ts`): `huella(titulo, texto)` (djb2 sobre `titulo + "\n" + texto`, en hexadecimal de 8 caracteres); `leer(texto)` tolera JSON inválido; `anotar(bitacora, entrada, ahora)` aplica la regla de 30 minutos (misma `tipo + clave + ruta + huella`) y el tope de 300. Tests con Vitest, con `ahora` inyectado.
- **Escritura:** un helper cliente `anotarEnBitacora(entrada)` lee, anota y guarda en `CLAVES.bitacora = "lh-bitacora"`; envuelto en `try/catch` (si el navegador no deja guardar, no rompe la pantalla).
- **Estado del loteo:** como `EstadoAdministrativo` es de servidor, se le agrega un hijo cliente mínimo `AnotarExposicion` (no renderiza nada) que anota en `useEffect` al montar, con los textos que el componente muestra.
- **⚖:** `TerminoLegal` anota en el `useEffect` que ya corre cuando `visible` pasa a `true` (el que dispara `EVENTO_ABRIR`). La ruta sale de `window.location.pathname`.
- **Página:** `app/panel/bitacora/page.tsx` (servidor, con `metadata`) + `tabla-bitacora.tsx` (cliente). "Descargar (JSON)" con `Blob` y un enlace temporal con `download="bitacora.json"`. Enlace "Ver lo que te mostramos" en `/panel`, cerca de "Borrar todo lo de este navegador".
- **Texto del ⚖ `bitacora` (borrador):** "Anotamos qué estado del loteo y qué explicaciones legales te mostramos, y cuándo, para poder probar con qué información contabas al decidir (Ley 24.240 de Defensa del Consumidor). En el prototipo queda solo en este navegador, no tiene datos personales y se borra con 'Borrar todo'."

## Risks / Trade-offs

- [Una bitácora en el navegador no sirve como prueba: la persona la puede borrar] → es a propósito: este cambio fija la forma del registro y su huella; el guardado de verdad va con login y base. Se dice en la página.
- [Anotar en cada ⚖ puede escribir mucho en `localStorage`] → regla de 30 minutos y tope de 300 entradas (unos pocos KB).
- [Guardar sin consentimiento] → no hay datos personales (solo rutas, claves y huellas); cuando entre `privacidad-consentimiento`, se suma a la lista de lo que se guarda con OK.
