# Proposal

## Why

`fogon-gobernanza-fractal` (PR #112, rama `agente/fogon-gobernanza-fractal`, todavía sin integrar en `dev`) armó el esqueleto de la gobernanza: círculos, círculos transversales, consejo con un lugar por tribu validada, validaciones con forma de constancia EAS (ADR-012), ámbitos nuevos del Fogón, "Llevar al consejo" y una lista accesible. Pero la pantalla `/fogon/gobernanza` es una rueda estática con una lista larga: **no se siente fractal**. El 27-oct-2026 Gus aprobó un boceto interactivo (`docs/referencia/gobernanza-fractal-boceto.html`, copia de `NS_platform/Documentation/mockup/`) en el que la estructura es una **holarquía**: círculos dentro de círculos, con zoom, y el mismo patrón en cada escala (propósito, sobre qué decide, roles, decisiones). Este cambio rehace la experiencia de esa página sobre el esqueleto del PR #112.

## What Changes

- **Dependencia:** se apila sobre `agente/fogon-gobernanza-fractal` (PR #112). La implementación parte de esa rama, no de `dev`. Se conservan su modelo (`lib/gobernanza/`), sus registros con forma de constancia, los ámbitos del Fogón, "Llevar al consejo", la marca de validación en la ficha de tribu y en Mi recorrido.
- **Holarquía con zoom en `/fogon/gobernanza`** (reemplaza la rueda SVG y la lista larga del PR #112):
  - el común (Lighthouse) contiene **sus propios círculos** (de ejemplo: Permacultura y suelo, Agua del Lighthouse, Legal y fideicomiso, Tokenomics y Semillas, Comunicación y marketing, Cuidado y conflictos, Plataforma y datos), el **Consejo de tribus** (un lugar por tribu validada) y las **12 tribus reales**; cada tribu activa o en formación tiene sus círculos según su propósito; las que buscan tribu muestran "Lugar libre";
  - cada círculo tiene **roles**: Facilita, Enlace hacia arriba, Enlace del nivel de arriba, Memoria, Miembro, con personas de ejemplo marcadas como ejemplo;
  - **los roles de cada persona se ven** (agregado de Gus, 27-oct-2026): al entrar a un círculo, cada persona muestra en el dibujo su nombre y, debajo, su rol en ese círculo, si el tamaño en pantalla alcanza; si no, el rol se lee en el panel y en la lista. Al tocar o elegir a una persona, el panel muestra **todos sus roles en toda la holarquía** con su lugar ("Facilita en Huerta intensiva (Semilla Viva)", "Miembro en Agua del Lighthouse (el común)"); cada entrada es un botón que lleva a ese círculo. Todo esto también desde teclado, por el panel y la lista. Los datos de ejemplo tienen personas con roles en varios círculos y niveles, identificadas por un id estable y no por el nombre;
  - tocar un círculo **entra** (zoom); tocar el fondo o una **miga** sale. El zoom también se maneja desde la lista y las migas;
  - círculos transversales del PR #112: siguen colgando del común y dicen qué tribus participan.
- **Panel de detalle** del nivel elegido: tipo, propósito, "Decide sobre", sus círculos o sus roles y la validación por el común. En celular, el dibujo arriba y el panel abajo.
- **Lentes** (botones con `aria-pressed`): **Estructura**, **Propósitos** (color por razón de ser: tierra, agua, economía, comunidad, conocimiento, gobierno, con leyenda y con texto, no solo color), **Decisiones que suben** (elegís una decisión y el dibujo marca su camino numerado: círculo → tribu → consejo → común, o una derivación) y **Desde mí** (dónde participa la persona, en varios niveles a la vez). El sistema de lentes es un **registro tipado**: sumar una lente es agregar una entrada (nombre, cómo pinta los nodos, qué muestra el panel, leyenda) sin tocar el resto.
- **Parámetros opcionales de una decisión:** plazo o fecha de cierre, acuerdo o norma en que se apoya, monto pedido y su fuente (plata simulada). No van en el mapa: se ven en la lente Decisiones y en la tarjeta de la decisión del Fogón, solo si existen; un monto sin cifra dice "sin dato", nunca 0.
- **Decisiones de ejemplo nuevas en el Fogón** para la lente: "Parámetros de la regalía de regeneración" (nace en el círculo Tokenomics del común) y "Cisterna compartida entre Agua Clara y Valle Solar" (el consejo la deriva al círculo Agua del Lighthouse).
- **"Desde mí" preparado para la gamificación:** solo un texto de ideas (Semillas por facilitar o por ser enlace, una marca por cada decisión llevada al consejo). Sin mecánica.
- Textos por los diccionarios es/en (ADR-004). Términos con peso legal nuevos con ⚖ y `borrador: true`: **doble enlace** y **dominio ("Decide sobre")**.
- **Técnica:** `d3-hierarchy` (solo el `pack`) como única dependencia nueva; el zoom y el dibujo son propios en React + SVG. Sin `d3-interpolate` ni librerías grandes (ver design).

**Fuera de alcance:**
- **Consenso Formal** (`fogon-consenso-formal`): Gus no lo aprobó; este cambio no lo usa ni lo nombra.
- Elegir representantes o enlaces de verdad: los lugares del consejo siguen "Sin representante elegido" (como en el PR #112) y los roles de los círculos son personas de ejemplo.
- La **mecánica de gamificación** (Semillas, marcas, puntajes): otro cambio.
- Tiempo, acuerdos y plata **en el mapa** (capas, colores o tamaños por monto o fecha): van solo dentro de cada decisión.
- Base de datos, firmas o constancias reales: todo sigue en el navegador.
- Pagos reales o movimiento del Fondo Común.
- Editar la estructura (crear círculos, asignar roles) desde la pantalla.
- Personas reales en los roles, perfiles de persona o un enlace a una ficha de la persona: los roles son de ejemplo y solo se ven dentro de `/fogon/gobernanza`. Tampoco se cruzan con los roles de la base (`personas.rol`, backlog B2), que son otra cosa (permisos de la plataforma).
- Nombres o roles en los lugares del consejo (siguen "Sin representante elegido").
- Una 5.ª lente visible: solo se prueba la extensibilidad con una lente de ejemplo en los tests.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `gobernanza-fractal` (creada por `fogon-gobernanza-fractal`): la estructura pasa a ser una holarquía con zoom, con círculos del común, roles por círculo visibles en el dibujo, todos los roles de una persona en el panel, panel de detalle, lentes extensibles y su equivalente accesible.
- `fogon`: las decisiones aceptan parámetros opcionales (plazo, acuerdo o norma, monto y fuente) y suman dos decisiones de ejemplo con camino.

## Impact

`lib/gobernanza/` (holarquía: círculos del común, roles, propósitos, caminos de decisiones; registro de lentes con tests), `app/fogon/gobernanza/` (página nueva: dibujo con zoom, migas, panel, lentes, árbol accesible; se borra `estructura-svg.tsx`), `lib/fogon/datos.ts` (parámetros opcionales y dos decisiones), `app/fogon/fogon-cliente.tsx` (muestra los parámetros), diccionarios `lib/idioma/textos/gobernanza.ts` y del Fogón, `lib/legal/terminos.ts`, `package.json` (`d3-hierarchy` y `@types/d3-hierarchy`), `docs/referencia/gobernanza-fractal-boceto.html` (ya copiado), e2e `fogon-gobernanza.spec.ts`, `fogon.spec.ts` y `accesibilidad.spec.ts`. Una o dos noches (ver tasks: hay un corte al final de la noche 1).
