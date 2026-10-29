# Design

## Context

- `lib/gobernanza/datos.ts` tiene 7 `CIRCULOS_DEL_COMUN` (`comun-permacultura`, `comun-agua`, `comun-legal`, `comun-token`, `comun-marketing`, `comun-cuidado`, `comun-plataforma`), con `tribus: []`.
- `manifiesto-lighthouse-vrn` (0/26, sin implementar) va a renombrar algunos y a sumar `comun-contratistas` y `comun-gobernanza`. Este cambio referencia los círculos **solo por id**, así que los nombres siguen a lo que haya en `dev`.
- `todosLosCirculos()` **no** incluye los del común. Por eso `holonDeId("circulo:comun-agua")` devuelve `null` y hoy nadie puede postularse a una tarea de un círculo del común. Es lo que deja afuera este cambio (ver Non-Goals).
- La membresía (`lib/membresia/estado.ts`, clave `lh-membresia`) es `Record<comunidad, "pedido" | "miembro">`. La recorren Perfil, Pasaporte, Panel, Semillas, Pactos y la holarquía.
- La adhesión al Lighthouse ya existe en `/tribus/lighthouse/manifiesto` (`useMembresia("lighthouse")`, con la capacidad `adherir`).
- `/tribus` es un Server Component que lee `idiomaDelPedido()`.

## Goals / Non-Goals

**Goals:**
- datos de fases y frentes con su validación;
- la sección Tribus con dos pestañas;
- pedir sumarse a un equipo como aspirante;
- la marca "ejemplo, a definir" en las tribus.

**Non-Goals:**
- el mapa (va en `territorio-vistas`);
- tomar tareas de un frente con pacto puntual;
- aprobar a la aspirante;
- el proceso equipo → tribu;
- D1;
- capas con fechas (D17).

## Decisions

### 1. Fases (`lib/territorios/fases.ts`)

```ts
export type Fase = 0 | 1 | 2;
export const FASES: readonly { fase: Fase; nombre: BilingueConOriginal; cuando: BilingueConOriginal }[];
// 0 "Equipos semilla" / "hoy"; 1 "Primeras comunidades" / "2027"; 2 "Barrios con tribus" / "sin fecha"
export const FASE_ACTUAL: Fase = 0;
export function esFase(x: unknown): x is Fase;
/** Única puerta para filtrar por tiempo. Hoy compara `desde <= fase`; D17 le suma `hasta` y fechas sin tocar a quien llama. */
export function vigenteEn(e: { desde: Fase }, fase: Fase): boolean;
```

- La fase 2 no tiene año en el boceto. Su "cuándo" se muestra "sin dato", nunca un año inventado.
- **Capas temporales (D17), previstas sin construir.** Todo elemento con tiempo lleva `desde: Fase` y se filtra solo con `vigenteEn`. Cuando haya capas de evento con inicio y fin, se agrega `hasta?: Fase | fecha` al tipo y se cambia esa función, sin tocar la pantalla.

### 2. Frentes (`lib/equipos/frentes.ts`)

```ts
export type FrenteBilingue = {
  id: string;                      // estable: lo usan ?sel= del mapa y los tests
  nombre: BilingueConOriginal;
  circuloId: string;               // id de CIRCULOS_DEL_COMUN
  necesidad: BilingueConOriginal;
  faltan: BilingueConOriginal | null;      // null = sin dato
  paraCuando: BilingueConOriginal | null;  // texto libre del boceto; null = sin dato
  desde: Fase;
  lugar: Punto | null;             // [lng, lat] dentro del Macrolote 7; null = sin lugar en el mapa
  ejemplo: true;
};
export function frentesBilingues(): readonly FrenteBilingue[];
export function frentesDe(circuloId: string, idioma: Idioma): Frente[];
export function validarFrentes(lista?, circulos?, contorno?): string[];
```

`paraCuando` es texto, no fecha, porque el boceto dice "siembra de otoño" o "antes de diciembre". Inventar un día exacto sería un dato falso.

Datos (en el inglés se marca revisión nativa):

| id | Nombre | Círculo | Necesidad | Faltan | Para cuándo | Fase | Lugar |
|---|---|---|---|---|---|---|---|
| `agua-cuenca` | Agua y cuenca | `comun-agua` | Medir el caudal del canal y diseñar la primera toma | 1 hidróloga, 2 personas para mediciones de campo | antes de diciembre | 0 | punto |
| `acceso-camino` | Acceso y camino | `comun-contratistas` | Mejorar 3 km de huella para que entre un camión | 1 persona con máquina, presupuesto | enero | 0 | punto |
| `vivero-suelo` | Vivero y suelo | `comun-permacultura` | Primer vivero de nativas del monte y ensayo de suelo | 3 voluntarias por mes, 1 persona que sepa de nativas | siembra de otoño | 0 | punto |
| `linea-de-base` | Línea de base | `comun-permacultura` | Medir suelo, vegetación y agua antes de intervenir (Libro C) | `null` | verano | 0 | punto |
| `primer-obrador` | Primer obrador | `comun-contratistas` | Un lugar para guardar herramientas y dormir 6 personas | diseño bioclimático, materiales | 2027 | 1 | punto |
| `parque-agrovoltaico` | Parque agrovoltaico | `comun-contratistas` | Estudio de suelo y conexión a la red | cotización de una desarrolladora | 2027 | 1 | punto |
| `papeles-fideicomiso` | Papeles y fideicomiso | `comun-legal` | Fundación, fideicomisos por series, Ordenanza 173 | un abogado o abogada (sin presupuesto) | `null` | 0 | `null` |
| `comunicacion` | Comunicación | `comun-marketing` | Contar el proyecto y convocar a los primeros equipos | 1 persona de contenidos | `null` | 0 | `null` |

- **Puntos:** el implementador elige 6 puntos `[lng, lat]` dentro de `macrolote7().anillo` (`lib/territorios/biopueblo.ts`), separados entre sí al menos ~300 m para que los sellos no se pisen. `validarFrentes` lo verifica con un punto-en-polígono (ray casting, función pura en `lib/territorios/geometria.ts` si no existe ya). Los puntos son **ilustrativos**: la pantalla lo dice.
- El boceto pone el agrovoltaico en una "Serie solar". Una serie del diseño legal B no es un círculo, así que queda en Contratistas (pregunta abierta).
- **Equipo de obra → `comun-contratistas`.** Si no existe en `CIRCULOS_DEL_COMUN`, se agrega con los datos de `manifiesto-lighthouse-vrn` design §6: nombre "Gestión de contratistas" / "Contractor management", propósito `economia` y "Decide sobre" "Convocatorias y contratos de obra" y "Seguimiento de entregas". Hay un test que verifica que existe. Si el manifiesto entra después, encuentra el círculo ya hecho y no lo duplica (se resuelve en el merge).
- Agregar ese círculo hace que aparezca también en `/fogon/gobernanza`. Es lo que quiere el manifiesto, así que se acepta. Hay que revisar los tests de la holarquía que cuentan círculos del común (7 → 8).

### 3. Equipos (`lib/equipos/equipos.ts`, puro)

```ts
export type Equipo = { circulo: Circulo; frentesAhora: Frente[]; frentesDespues: Frente[] };
export function listarEquipos(idioma: Idioma, fase: Fase = FASE_ACTUAL): Equipo[];
// orden: primero los que tienen frentesAhora (más frentes primero), después el resto, con orden estable por el de CIRCULOS_DEL_COMUN

export type PedidosEquipos = Record<string, "pedido">;
export function leerPedidos(crudo: string | null): PedidosEquipos;  // descarta lo raro, entrada por entrada
export function pedir(p: PedidosEquipos, circuloId: string): PedidosEquipos; // idempotente; ignora ids que no son del común

export type EstadoSumarme =
  | { tipo: "sin-sesion" }
  | { tipo: "sin-capacidad" }
  | { tipo: "sin-adhesion" }      // lighthouse no-miembro
  | { tipo: "puede" }
  | { tipo: "pedido" };
export function estadoSumarme(x: { conSesion: boolean; puedeAdherir: boolean; membresia: Membresias; pedidos: PedidosEquipos; circuloId: string }): EstadoSumarme;
```

- **El orden de los chequeos** es el de la lista: sesión, capacidad, adhesión, pedido. Con sesión y un pedido ya hecho vale `pedido`, aunque después la persona haya bajado de plan: lo que pidió no se borra.
- `pedir` solo acepta ids de `CIRCULOS_DEL_COMUN`. Un id de tribu o uno inventado no se guarda.
<!-- arquitecto: una sola regla de adhesión y freno en la acción (ADR-023) -->
- **Una sola regla de adhesión.** Sumarse a un círculo del común es participar en la gobernanza, así que vale ADR-023 (Propuesta). `estadoSumarme` no mira `membresia.lighthouse` por su cuenta: recibe `adhirio: boolean`, calculado con `puedeParticiparEnGobernanza(membresias)` de `lib/gobernanza/participar.ts`. Si `manifiesto-lighthouse-vrn` todavía no está en `dev`, este cambio crea ese archivo con esa misma firma y solo esa función (pura, sin `window` ni `localStorage`; hoy = `lighthouse` en `pedido` o `miembro`), y el manifiesto la encuentra hecha. Nunca dos definiciones de "adhirió".
- **Se frena la acción, no solo el botón.** El "Confirmar" no llama a `pedir` directo: llama a `confirmarPedido(x) → PedidosEquipos | null`, que vuelve a leer sesión, capacidad, membresía y pedidos en ese momento y devuelve `null` (sin escribir) si `estadoSumarme(x).tipo !== "puede"`. Así una membresía retirada en otra pestaña entre abrir y confirmar no deja un pedido escrito.
- **Sin sesión nunca se escribe.** Sin sesión `clave()` devuelve el nombre sin prefijo, que comparten todas las personas del navegador. El estado `sin-sesion` ya lo impide; `confirmarPedido` lo vuelve a comprobar. Con sesión hay consentimiento vigente (ADR-005), así que no hace falta otro chequeo.
- **Lo que entra por "Importar" se limpia igual.** `lib/demo/importar.ts` acepta cualquier clave de `NOMBRES_BASE`, así que un archivo importado puede traer `lh-equipos` con basura: `leerPedidos` descarta entrada por entrada lo que no sea un id del común con `"pedido"` (incluidos `__proto__` y `constructor`).

### 4. Clave `lh-equipos`, aparte de la membresía

- **La decisión:** se agrega a `NOMBRES_BASE` como `equipos: "lh-equipos"`. Toma el prefijo de la persona y entra sola en la exportación y el borrado de `lib/privacidad/exportar.ts`, que recorre `NOMBRES_BASE`. Hay un test que lo verifica.
- **Por qué no la membresía:** sus consumidores tratan cada clave como una comunidad (buscan el nombre de la tribu, cuentan dónde sos miembro). Un `comun-agua` ahí aparecería como "comunidad desconocida" o contaría en Pactos.
- **Alternativa descartada:** prefijar `circulo:` dentro de la membresía. Obliga a filtrar en 8 lugares y es fácil olvidarse de uno.
- **Cuando haya integrantes de círculo de verdad** (`pacto-puntual` lo dejó afuera), `relacionConHolon` va a leer también esta clave para los círculos del común. Hoy no la lee: tomar tareas está fuera de alcance.
<!-- arquitecto: dueño del dato y paso a la base -->
- **Dueño del dato.** El pedido es de NetX y hoy vive solo en el navegador de la persona; nadie más lo ve (ni Hifa ni el super admin, aunque el texto diga que responden: es simulado). Es un dato personal nuevo (a qué equipo quiere sumarse una persona): se agrega como pendiente al inventario de datos del POC (`NS_platform/Documentation/backend/01 - Inventario de datos del POC.md`) desde el cuerpo del PR, porque la noche no ve `NS_platform`.
- **Cuando el pedido pase a la base** (aceptar o rechazar aspirantes, B6): el servidor verifica la sesión, el consentimiento y la adhesión guardada en la base (ADR-023), y que el `circuloId` sea del común. Lo que haya en `lh-equipos` **no se migra**: cada persona vuelve a pedir. Este cambio no lo implementa; solo no cierra esa puerta.

### 5. `components/sumarme-equipo.tsx` (cliente)

- **Qué lee:** la sesión (`useSesion`), el nivel (`puedeCapacidad(nivel, "adherir")`), la membresía (`leerMembresiaDelNavegador`, después de hidratar) y `lh-equipos`.
- **Qué renderiza según `estadoSumarme`:**
  - `sin-sesion`: `EnlaceConCuenta` con "Entrá para sumarte";
  - `sin-capacidad`: el texto de `lectura.tsx` del manifiesto (mismo diccionario, sin duplicarlo);
  - `sin-adhesion`: el texto con enlace a `/tribus/lighthouse/manifiesto`;
  - `puede`: el botón. Al apretarlo se abre la confirmación, con `aria-expanded` y el foco en su título. La confirmación tiene "Confirmar" y "Cancelar"; con "Cancelar" el foco vuelve al botón;
  - `pedido`: "Pediste sumarte a <equipo> · aspirante".
- **Accesibilidad:** el cambio se anuncia en una región `aria-live="polite"`.
- **Props:** `circuloId` y `nombreEquipo`. El mismo componente lo usa después el panel del mapa (`territorio-vistas`), con el texto "Quiero sumarme a este frente".
- **Antes de hidratar** se muestra un lugar vacío de alto fijo, para que nada salte ni el servidor muestre un estado equivocado.

### 6. `/tribus` con pestañas

- **Selección:** `searchParams.ver === "tribus"` ? visión : equipos.
- **Las pestañas:** son dos `<Link>` dentro de `<nav aria-label={tx.pestanas.aria}>`, con `aria-current="page"` y subrayado grueso más negrita en la actual. Son enlaces y no un `tablist` de ARIA porque cada pestaña es una URL compartible que el servidor arma sin JS.
- **Qué pasa con lo de hoy:** el contenido actual (`Seccion` × 3) se mueve tal cual a la pestaña visión, debajo del aviso "Ejemplo, a definir". La marca "Ejemplo · a definir" va en `Tarjeta` y en el encabezado de `/tribus/[id]`, como texto con borde punteado (`border-dashed`), no solo con color.
- **Pestaña equipos:** una tarjeta por `Equipo`, con:
  - `h3` con el nombre;
  - "Decide sobre: …";
  - una `<ul>` de frentes;
  - el bloque "Más adelante · fase N";
  - `SumarmeEquipo`.
- **Textos:** "sin dato" sale de `sinDato(idioma)`.

## Risks / Trade-offs

- **[Choque con `manifiesto-lighthouse-vrn` por `comun-contratistas`]** → mismo id y mismos datos; el que entre segundo resuelve el conflicto quedándose con uno.
- **[La aspirante del círculo no habilita nada todavía]** → la pantalla no promete tareas, solo dice "aspirante". El paso siguiente (tomar tareas) depende de que Gus decida si el Lighthouse acepta pactos puntuales.
- **[El e2e de `/tribus` espera las secciones en `/tribus`]** → se actualiza para entrar por `?ver=tribus`.
- **[Que las tribus de ejemplo se sigan leyendo como reales en otras pantallas]** → fuera de alcance; queda como pregunta.

## Migration Plan

Sin base. Clave nueva vacía por defecto. Para revertir: quitar la pestaña equipos y la clave. Lo guardado queda huérfano y se borra con "Borrar mis datos".

## Open Questions

- ¿Hace falta adherir al manifiesto del Lighthouse para sumarse a un equipo? Se propone que sí, por coherencia con `pacto-puntual`.
- "Equipo de obra" del boceto: ¿es Gestión de contratistas, o un círculo aparte?
- ¿El agrovoltaico va con Contratistas o con una serie?
- ¿El Lighthouse acepta pactos puntuales para tomar tareas de un frente?
