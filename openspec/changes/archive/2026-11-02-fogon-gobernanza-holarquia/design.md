# Design

## Context

- **Punto de partida:** la rama `agente/fogon-gobernanza-fractal` (PR #112). Ya trae `lib/gobernanza/` (`tipos.ts`, `datos.ts` con círculos por tribu y un transversal, `registros.ts` con constancias de solo agregar, `vista.ts`), la página `app/fogon/gobernanza/page.tsx` con `estructura-svg.tsx` (rueda estática, oculta en < 640 px) y una lista larga, los ámbitos del Fogón y "Llevar al consejo" en `lib/fogon/`.
- **Referencia aprobada:** `docs/referencia/gobernanza-fractal-boceto.html` (HTML + JS con d3 completo desde un CDN). Es la guía de comportamiento y de datos de ejemplo; no se copia su código (usa `innerHTML`, colores sueltos y d3 entero).
- Las 12 tribus están en `lib/tribus/datos.ts` (ids reales: `semilla`, `barda`, `grano`, `monte`, `agua`, `valle`, `taller`, `cuidado`, `escuela`, `avelan`, `puerto`, `guardia`; 4 vacantes). Avelan Kerum trae `areas`.
- Lo que el navegador sabe de la persona: membresías aceptadas (`lib/membresia/estado.ts`, `comunidadesDondeEsMiembro`) y la tribu que lidera (Sumarte, `lib/sesion/nivel.ts`, `tribuLider`), igual que usa `fogon-cliente.tsx`.
- Tokens del tema que alcanzan para los propósitos sin colores nuevos: `green`, `blue`, `gold`, `rose`, `violet`, `deep` (y sus `-soft`).

## Goals / Non-Goals

**Goals:**
- Que la estructura se sienta fractal: el mismo patrón (propósito, "Decide sobre", roles, decisiones) en cada escala, con zoom.
- Un modelo puro y testeable de la holarquía (`lib/gobernanza/holarquia.ts`) del que salen el dibujo, la lista, las migas y el panel.
- Un registro de lentes donde sumar una lente es agregar una entrada.
- Accesible de punta a punta: la lista hace todo lo que hace el dibujo.

**Non-Goals:**
- Editar la estructura, elegir enlaces o representantes, gamificar, Consenso Formal, base de datos.

## Decisions

1. **Modelo de la holarquía** (`lib/gobernanza/holarquia.ts`, puro):
   ```ts
   type Proposito = "tierra" | "agua" | "economia" | "comunidad" | "conocimiento" | "gobierno";
   type Rol = "facilita" | "enlace-arriba" | "enlace-de-arriba" | "memoria" | "miembro";
   type NodoH =
     | { tipo: "comun" | "consejo" | "tribu" | "circulo"; id: string; nombre: string;
         proposito: Proposito | null; decide: string[]; hijos: NodoH[];
         estado?: EstadoTribu; validada?: boolean; tribus?: string[] /* transversal */; ejemplo: boolean }
     | { tipo: "rol"; id: string; personaId: string; persona: string; rol: Rol; esYo: boolean; ejemplo: boolean }
     | { tipo: "lugar-libre"; id: string }
     | { tipo: "lugar"; id: string; tribuId: string; representante: null };
   function construirHolarquia(idioma, registros: readonly Registro[] = []): NodoH;
   function caminoHasta(raiz, id): NodoH[];   // para migas y "Desde mí"
   type RolDePersona = { nodoRolId: string; rol: Rol; circuloId: string; circulo: string;
                         lugar: { tipo: "tribu"; tribuId: string; nombre: string } | { tipo: "comun" } };
   function rolesDe(raiz, personaId): RolDePersona[];   // en el orden del árbol: primero el común, después las tribus
   ```
   <!-- arquitecto: el árbol no depende del navegador; "Desde mí" va aparte (§6) para que servidor y cliente dibujen lo mismo -->
   - **Un solo árbol, igual en servidor y cliente.** `construirHolarquia` no recibe nada del navegador: el servidor la llama con `registros = []` (cuentan solo las validaciones de ejemplo, como hoy en el PR #112) y el cliente usa ese mismo modelo. "Desde mí" **no agrega nodos**: marca nodos que ya existen (ver §6). Así el empaquetado no salta después de montar y no hay diferencias de hidratación (cuando el HTML del servidor no coincide con el primer dibujo del navegador).
   - **Ids únicos en todo el árbol.** Los círculos del común llevan prefijo `comun-` (por ejemplo `comun-agua`), para no chocar con la tribu `agua`; los roles, `<idCirculo>-rol-<n>`; los lugares del consejo, `consejo-<tribuId>`. Un test recorre el árbol y verifica que ningún id se repite (los caminos, las migas y el zoom buscan por id).
   - Los datos de ejemplo nuevos van en `lib/gobernanza/datos.ts`: `CIRCULOS_DEL_COMUN` (7 círculos del boceto con propósito y "Decide sobre" bilingües), propósito y "Decide sobre" de cada círculo de tribu (los de `CIRCULOS_POR_TRIBU` pasan de `BilingueConOriginal[]` a `{ nombre, proposito, decide }[]`) y los roles de ejemplo.
   - **Personas de ejemplo:** nombres de pila de una lista fija, asignados de forma determinística (sin `Math.random`), todos con `ejemplo: true` y marca visible "(ejemplo)". La persona demo es "Vos" con dos roles: Miembro en Permacultura y suelo (común) y Enlace hacia arriba en Cuidado de la tierra (Valle Solar), como en el boceto.
   - **Personas en varios círculos (agregado del 27-oct).** Cada persona de ejemplo es `{ id, nombre }` en `PERSONAS_DE_EJEMPLO` (`lib/gobernanza/datos.ts`) y cada rol apunta a su `personaId`. "Todos los roles de…" busca por `personaId`, **nunca por nombre** (el boceto busca por nombre y, como recicla 40 nombres, junta personas distintas que se llaman igual). Además de los roles de relleno (una persona por rol, sin repetir dentro del mismo círculo), una tabla corta `ROLES_CRUZADOS` fija a mano a quienes participan en varios lugares:
     - Ana: Facilita en Huerta intensiva (Semilla Viva) · Miembro en Agua del Lighthouse (el común);
     - Bruno: Facilita en Agua del Lighthouse (el común) · Enlace hacia arriba en Toma y cisterna (Agua Clara) · Memoria en Energía solar (Valle Solar) — conecta con la decisión de la cisterna compartida;
     - Carla: Enlace del nivel de arriba en Banco de semillas (Semilla Viva) · Miembro en Tokenomics y Semillas (el común);
     - Diego: Memoria en Herrería (Taller Común) · Miembro en Bioconstrucción (Monte Nuevo).
     Los nombres de `ROLES_CRUZADOS` no se reusan como relleno, así un nombre es una sola persona en todo el árbol. Un test verifica que ninguna persona tiene dos roles en el mismo círculo y que los ids de persona de `ROLES_CRUZADOS` existen.
   - **Dónde está cada rol (`lugar`):** si el círculo cuelga de una tribu, `{ tipo: "tribu", nombre }`; si cuelga del común (círculos del común y transversales), `{ tipo: "comun" }`. El panel lo arma con el diccionario: es "{rol} en {círculo} ({tribu | el común})", en "{rol} in {círculo} ({tribu | the commons})".
   - **Consejo:** sus hijos son los lugares de `lugaresDelConsejo(registros)` del PR #112, con `representante: null` → "Sin representante elegido". No se inventan nombres en los lugares (elegir representantes queda fuera de alcance; ver Open Questions).
   - **Transversales:** siguen saliendo de `circulosTransversales()`, cuelgan del común y el panel dice "Participan: …".
   - `vista.ts` y `estructura-svg.tsx` del PR #112 se borran (`git rm`) si nada más los usa; sus tests se reescriben contra `holarquia.ts`.
   - Alternativa descartada: guardar el árbol como un JSON grande escrito a mano (duplica las tribus de `lib/tribus/datos.ts` y se desincroniza).

2. **Layout: `d3-hierarchy` (solo `hierarchy` + `pack`), zoom propio.**
   - `pack` resuelve el empaquetado de círculos (algoritmo de Wang et al.), que es lo difícil y no vale reescribir. `d3-hierarchy` es chica (≈ 12 kB sin comprimir del módulo usado), sin dependencias, licencia ISC; se suma `@types/d3-hierarchy` en dev.
   - El layout se calcula una vez, en una función pura `empaquetar(raiz, tamaño): Map<id, { x, y, r }>` testeable (por ejemplo: cada hijo queda dentro de su padre).
   - **Zoom propio** en lugar de `d3-interpolate`: la vista es `[cx, cy, ancho]`; la transición interpola lineal con suavizado (`ease-in-out`) en `requestAnimationFrame` durante ~600 ms. Con `prefers-reduced-motion: reduce` se salta directo al final. Son ~30 líneas y no suman `d3-color`.
   - **Render en React**, no con d3 sobre el DOM: `<svg role="img" aria-labelledby>` con `<circle>` y `<text>` generados desde el modelo; los círculos del dibujo no son focusables (el teclado va por la lista y las migas, para no duplicar el orden de tabulación con cientos de nodos). Clic en un círculo con hijos → entrar; en una hoja → mostrar en el panel; en el fondo → subir un nivel.
   - Etiquetas: solo se muestran las de los hijos del foco con radio en pantalla suficiente (como el boceto), para que no se pisen.
   - **Nombre y rol de cada persona** (agregado del 27-oct): un nodo `rol` se rotula con dos líneas dentro de su círculo: el nombre (11 px) y, debajo, el rol en su idioma (10 px, color `muted`). Una función pura `etiquetaPersona(radioEnPantalla): "nada" | "nombre" | "nombre-y-rol"` decide qué entra, con umbrales como el boceto (nombre desde 26 px de radio, rol desde 34 px); se testea sola. Nada se recorta con "…": lo que no entra no se dibuja. Las etiquetas del SVG son `aria-hidden` (el equivalente accesible es el panel y la lista, como el resto del dibujo). Se recalcula en cada cuadro del zoom con el radio ya escalado, sin estado extra.
   - **Elegir a una persona:** clic en un nodo `rol` del dibujo → `seleccion = nodoRolId` (no cambia el foco). El panel, en cualquier lente salvo Decisiones, muestra "Todos los roles de {nombre} (ejemplo)" con `rolesDe(raiz, personaId)`: una `<ul>` con un `<button>` por rol que hace `enfocar(circuloId)` y deja la selección en esa persona. Si tiene un solo rol, la lista tiene una entrada (no se oculta ni se rellena).
   - Alternativas descartadas: d3 completo (grande y manipula el DOM fuera de React); empaquetado propio (algoritmo no trivial, riesgo alto para una noche); librería de grafos.

3. **Registro de lentes** (`lib/gobernanza/lentes.ts`, la parte pura; los paneles en `app/fogon/gobernanza/lentes/`):
   ```ts
   type Pintura = { relleno: TokenColor | "ninguno"; borde: TokenColor | "ninguno"; grosor: 1 | 1.5 | 3;
                    punteado: boolean; atenuado: boolean };
   type EntradaLeyenda = { muestra: Pintura; texto: ClaveTexto; glifo?: string };
   type Marca = { nodoId: string; texto: string };            // p. ej. el número del paso
   type ContextoLente = { raiz: NodoH; foco: NodoH; seleccion: string | null; idioma: Idioma };
   type Lente = {
     id: string;
     nombre: ClaveTexto;                                       // clave del diccionario gobernanza.lentes
     pintar(nodo: NodoH, ctx: ContextoLente): Pintura;
     leyenda(ctx: ContextoLente): EntradaLeyenda[];
     marcas?(ctx: ContextoLente): Marca[];
     panel: ComponentType<PropsPanel>;                         // qué muestra el panel con esta lente
   };
   const LENTES: readonly Lente[] = [estructura, propositos, decisiones, desdeMi];
   ```
   - `TokenColor` es una unión de los nombres de tokens del tema (`"green" | "blue" | …`); el dibujo los traduce a `var(--color-…)`. Así ninguna lente puede meter un color suelto.
   - El dibujo, la leyenda, las marcas y la barra de lentes reciben `lentes: readonly Lente[]` (por defecto `LENTES`) y no conocen ninguna lente por nombre. Sumar una lente = una entrada en `LENTES` y sus textos en el diccionario.
   - Para separar lo puro de React, la entrada del registro puro (`lib/`) lleva `id`, `nombre`, `pintar`, `leyenda`, `marcas`; `app/fogon/gobernanza/lentes/index.ts` arma `LENTES` sumando `panel` a cada una. El test de extensibilidad (Vitest) arma un registro con una `lentePrueba` y verifica que `pinturasDe`, `leyendaDe` y `marcasDe` la usan sin tocar nada más.
   - **Propósitos → tokens:** tierra `green`, agua `blue`, economía `gold`, comunidad `rose`, conocimiento `violet`, gobierno `deep`. Cada entrada de la leyenda lleva texto; el panel y la lista dicen "Propósito: …".
   - **Estructura:** común `green-soft`; tribu activa borde `green` lleno; en formación o busca tribu, punteado; consejo `gold-soft`; roles `muted`. Glifos de estado del PR #112 (● ◐ ○) en la lista y en el panel.
   - **Desde mí:** borde `gold` grosor 3 en cada nodo que contiene un lugar de la persona; los demás roles atenuados.
   - **Decisiones:** borde `gold` en los nodos del camino y marcas numeradas (círculo `gold` con número en `ink`) arriba de cada nodo.

4. **Caminos de decisiones** (`lib/gobernanza/caminos.ts`): `CAMINOS: { decisionId: string; camino: string[]; tipo: "sube" | "deriva" | "queda" }[]`, que apuntan a ids de decisiones del Fogón (`lib/fogon/datos.ts`) y a ids de nodos de la holarquía. Un test verifica que todo id existe en los dos lados. Caminos de ejemplo:
   - `consejo-bomba`: Cuidado de la tierra (Valle Solar) → Valle Solar → Consejo → Lighthouse (`sube`);
   - `regalia` (nueva): Tokenomics y Semillas → Lighthouse (`queda` en el común);
   - `siembra`: Cuidado de la tierra → Valle Solar (`queda`; el texto dice que no hace falta subir);
   - `cisterna-compartida` (nueva): Toma y cisterna (Agua Clara) → Agua Clara → Consejo → Agua del Lighthouse (`deriva`).
   Una decisión llevada al consejo con "Llevar al consejo" (PR #112) hereda el camino de su decisión de origen más el paso Consejo.
   <!-- arquitecto: falta el caso de una copia cuyo origen no tiene camino cargado (por ejemplo `consejo-cisterna`) -->
   - `caminoDe(decision): { camino: string[]; tipo } | null` resuelve en este orden: (1) la entrada de `CAMINOS`; (2) si es una copia del consejo (`origen.tribuId`), el camino de la decisión original si existe, y si no `[origen.tribuId, "consejo"]`, más el paso Consejo, con tipo `sube`; (3) si no, `null`, y el panel dice "Sin camino de ejemplo" (no se inventa un camino). Un id del camino que no existe en el árbol se descarta con un aviso en consola de desarrollo, nunca rompe la página.
   - La lente lista solo las decisiones de ejemplo de `CAMINOS`. Las copias que la persona llevó al consejo en su navegador se leen después de montar (como `fogon-cliente.tsx`) y se suman al final; si no se pueden leer, la lista queda con las de ejemplo.

5. **Parámetros opcionales de una decisión** (`lib/fogon/datos.ts`):
   ```ts
   type Decision = { …; plazo?: { cierra: string /* AAAA-MM-DD */ };
     acuerdo?: { tipo: "pacto" | "norma"; nombre: string; href?: string };
     monto?: { cantidad: number | null; moneda: "USD"; fuente: "fondo-comun" | "tribu" | "fideicomiso" } };
   ```
   - Un componente `ParametrosDecision` (en `app/fogon/`) los muestra en la tarjeta de `/fogon` y en el panel de la lente Decisiones: cada fila solo si el campo existe; `cantidad: null` → "Monto pedido: sin dato"; el monto lleva "(simulado)". Fechas y montos con `Intl` en el idioma de la persona.
   <!-- arquitecto: una fecha AAAA-MM-DD leída con `new Date()` es medianoche UTC; en Argentina (UTC−3) se ve un día antes y puede diferir entre servidor y navegador -->
   - **Fechas sin corrimiento:** la fecha de cierre se formatea con `Intl.DateTimeFormat(idioma, { dateStyle: "long", timeZone: "UTC" })` (o armando la fecha desde sus partes), así `2026-11-15` dice 15 de noviembre en cualquier zona horaria. Un monto con `cantidad` que no es un número finito se trata como `null`.
   - Ejemplos: `consejo-bomba` con monto (cifra de ejemplo), fuente Fondo Común y fecha de cierre; `cisterna-compartida` con monto `cantidad: null` (para probar "sin dato") y acuerdo de tipo norma; `regalia` con plazo y acuerdo; las demás sin parámetros.
   - Alternativa descartada: pintar montos o plazos en el mapa (Gus lo dejó fuera: el mapa es la estructura).

6. **"Desde mí"** combina dos fuentes en `lugaresMios(membresias, tribuLider): LugarMio[]`:
   - los dos roles de ejemplo de "Vos" (marcados "(ejemplo)");
   - por cada membresía aceptada de tribu, rol Miembro en esa tribu; si lidera una tribu en Sumarte, rol Facilita en esa tribu.
   - Se leen en el navegador después de montar (como `fogon-cliente.tsx`), así el HTML del servidor no depende de `localStorage`. No se guarda nada nuevo ni sale nada por la red.
   <!-- arquitecto: "Desde mí" solo lee; no llama a sincronizarValidaciones ni a guardarRegistros -->
   - Los lugares que vienen del navegador **no crean nodos**: el rol Miembro o Facilita de una tribu marca el nodo de esa tribu (borde `gold` grosor 3) y aparece en el panel con su camino. Los dos roles de "Vos" ya están en el árbol de ejemplo (`esYo: true`). "Desde mí" no llama a `sincronizarValidaciones` ni a `guardarRegistros` (esas escriben); si `localStorage` falla o trae algo raro, quedan solo los dos roles de ejemplo.
   - Ideas de gamificación: un párrafo del diccionario, sin estado ni botones.

7. **Página y accesibilidad:**
   - `page.tsx` (servidor) arma la holarquía en el idioma pedido y pasa el modelo a `holarquia-cliente.tsx` (cliente), que tiene foco, lente y selección en estado de React. La URL no guarda el foco (fuera de alcance).
   - Orden en el DOM: barra de lentes → migas (`<nav aria-label>` con `aria-current="location"`) → dibujo → leyenda → panel (`aria-live="polite"`) → árbol ("Ver toda la estructura como lista", en un `<details>` cerrado por defecto como en el boceto, con su `summary` siempre visible y alcanzable con teclado).
   - Árbol: `<ul>` anidado con un `<button>` por nodo que hace zoom; la tribu dice su estado en texto; los círculos dicen su propósito en texto. Las personas van como último nivel bajo su círculo, con texto "{nombre} (ejemplo) · {rol}"; su botón enfoca el círculo y selecciona a la persona (el panel muestra todos sus roles).
   - Panel de un círculo: la sección "Roles" es una `<ul>` con un `<button>` por persona ("{nombre} (ejemplo)" + rol), que selecciona a la persona. Así, solo con teclado: lista o panel → persona → cualquiera de sus roles → zoom a ese círculo.
   - Grilla: `minmax(0,1.35fr) minmax(300px,1fr)` en escritorio; una columna en < 860 px. El SVG usa `viewBox` y `width:100%`, así no desborda en 390 px (se sacan el `hidden sm:block` y el aviso de "solo lista" del PR #112).
   - Se mantienen el aviso de prototipo, el aviso "Estructura de ejemplo" con ⚖ `consejo`, la sección "Quién valida a quién" (corta) y el enlace al Fogón.

8. **Términos ⚖ nuevos** en `lib/legal/terminos.ts`, con `borrador: true` y explicación simple: `dobleenlace` ("cada tribu manda un enlace al consejo y el común manda un enlace a cada tribu; en el prototipo nadie fue elegido") y `dominio` ("lo que un círculo decide sin pedir permiso; el reglamento real lo define el diseño legal").

## Risks / Trade-offs

- [Cientos de nodos en un celular] → solo se rotulan los hijos del foco; los roles se rotulan recién cuando el círculo tiene radio suficiente en pantalla.
- [Dos líneas por persona en celular] → con 390 px casi nunca entra el rol; el umbral lo saca del dibujo y el panel lo muestra. No se achica la letra por debajo de 10 px.
- [Confundir estos roles con los permisos de la plataforma (`personas.rol`, backlog B2)] → son roles de círculo, de ejemplo, que viven solo en `lib/gobernanza/`; no leen ni escriben la base.
- [Nombres de ejemplo que parecen personas reales] → todos llevan "(ejemplo)" y el aviso general dice que las personas son de ejemplo.
- [Dependencia nueva] → `d3-hierarchy` se usa solo dentro de `empaquetar()`; si se quisiera sacar, se cambia una función.
- [Rehacer la página del PR #112 antes de que entre a `dev`] → se apila sobre su rama; si el PR #112 cambia en revisión, este cambio se rebasa. Ver tasks.
- [La lente Decisiones se lee como un reglamento] → el texto dice "camino de ejemplo" y el ⚖ `consejo` sigue diciendo que el reglamento lo define el diseño legal.

## Migration Plan

Sin base. Los registros del PR #112 (clave del navegador `gobernanza`) no cambian de forma. Los datos de círculos cambian de forma solo en el repo. Para revertir: volver a la rama del PR #112.

## Revisión de arquitectura

Este cambio toca plata simulada (monto pedido), permisos ya existentes ("Llevar al consejo", sin cambios) y datos del navegador de la persona (lectura, sin escribir nada nuevo), y suma una dependencia. Pide revisión del agente `arquitecto` antes de aprobarlo (ver el resumen del especificador). Puntos a mirar: que `d3-hierarchy` sea la versión más chica que alcanza; que "Desde mí" no escriba ni mande nada; que el monto no se lea como un cobro.

<!-- arquitecto: resultado de la revisión (27-oct-2026) -->
Revisado por el agente `arquitecto` (27-oct-2026): se puede aprobar con los ajustes ya incorporados arriba (§1 árbol único e ids únicos, §4 `caminoDe` con caso sin camino, §5 fechas en UTC, §6 "Desde mí" solo lee y no crea nodos). `d3-hierarchy` queda encapsulada en `empaquetar()`; no hace falta ADR (se revierte cambiando una función). Sin base, sin servicio externo, sin datos personales nuevos.

## Open Questions

- ¿Los lugares del consejo muestran un nombre de ejemplo, como el boceto, o siguen "Sin representante elegido" como pide el PR #112? Este diseño mantiene "Sin representante elegido".
- Roles de cada persona: ¿un rol en un círculo transversal dice "(el común)" o "(transversal: Valle Solar y Taller Común)"? Este diseño dice "el común", porque el transversal cuelga del común.
- ¿Quiénes son las personas con varios roles (Ana, Bruno, Carla, Diego) y en qué círculos? Se cambian en `ROLES_CRUZADOS` sin tocar la spec, salvo los escenarios de Ana y Bruno.
- Cifras de ejemplo de los montos y fechas de cierre: se pueden cambiar en `lib/fogon/datos.ts` sin tocar las specs.
- Nombres, propósitos y "Decide sobre" finales de los círculos: se cambian en `lib/gobernanza/datos.ts` sin tocar las specs.
