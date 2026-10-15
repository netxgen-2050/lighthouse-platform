# Design

## Context

El Fogón (`fogon-decisiones`) ya existe en `/fogon` con decisiones de sí/no guardadas en el navegador (`lib/fogon/estado.ts`, clave `lh-fogon`). Este cambio suma otro tipo de participación (consultas con voto cuadrático) sin tocar esas decisiones. Todavía no hay base (`base-neon` está aprobado, sin implementar), así que todo vive en el navegador; el cambio siguiente (`fogon-cuadratico-en-la-base`) cambia la fuente de datos sin tocar las pantallas. Motivación y alcance: ver `proposal.md`. Requisitos: `specs/voto-cuadratico` y `specs/fogon-consultas`.

## Goals / Non-Goals

**Goals:**
- Un motor puro, sin dependencias del Fogón ni de React, que también corra en el servidor (lo va a usar la API del cambio siguiente para validar).
- Una costura única (repositorio de consultas) entre las pantallas y los datos.
- Un donut reutilizable y accesible, sin librería de gráficos.

**Non-Goals:**
- Financiamiento cuadrático (Ronda 0): el motor no trae fondo de contrapartida ni la fórmula (Σ√aporte)². Solo se cuida que los nombres y tipos no supongan "Fogón" para poder sumarlo después en el mismo módulo.
- Persistencia compartida, identidad real y padrón (cambio siguiente).

## Decisions

### 1. Motor en `lib/cuadratico/`
- `costo(votos)`, `costoReparto(reparto)`, `validarReparto(reglas, reparto)`, `agregar(opciones, repartos)`, `porcentajes(agregado)`, `ordenar(agregado)` y `repartirPresupuesto({ montoCentavos, opciones: { id, peso, topeCentavos?, pisoCentavos? }[] })`.
- `reglas` = `{ creditos: 100, opciones: string[], votosEnContra: boolean }`. `creditos` es un parámetro (para tests y para la Ronda 0), pero el Fogón siempre pasa la constante `CREDITOS_POR_PERSONA = 100` (regla 6); ninguna ruta ni pantalla lo calcula por persona.
- `validarReparto` devuelve `{ ok: true, usados, restantes }` o `{ ok: false, motivos: ("excede-creditos" | "no-entero" | "en-contra-no-permitido" | "opcion-ajena")[] }`. Un reparto con todo en 0 es válido (equivale a "no participo").
- **Porcentajes**: resto mayor sobre la suma de netos positivos; `null` si la suma es 0 (la pantalla muestra "sin dato").
- **Presupuesto**, en centavos enteros (`number` seguro hasta 9·10¹⁵): peso = neto positivo; si la suma de pesos es 0 o el monto es `null`, todas las partes son `null`. Si los pisos de las opciones con peso superan el monto, se ignoran y se devuelve el aviso `pisos-imposibles`. Luego, "llenado con límites": se reparte lo libre en proporción al peso entre las opciones no fijadas; si alguna supera su tope, se fijan en su tope y se repite; si no, si alguna queda bajo su piso, se fijan en su piso y se repite; termina cuando nadie viola (cada vuelta fija al menos una opción, así que termina en ≤ N vueltas). Redondeo final a centavos por resto mayor. Devuelve `{ partes: Record<id, number | null>, sinAsignar: number | null, avisos }`.
- **Alternativa descartada**: un motor dentro de `lib/fogon/`. Lo descartamos porque la Ronda 0 y la API del servidor lo van a importar, y no queremos que arrastren tipos del Fogón.

### 2. Datos del Fogón en `lib/fogon/consultas/`
- `tipos.ts`: `Consulta` = `{ id (slug: "u1"…), titulo, descripcion, modo: "prioridades" | "presupuesto", ambito: "equipo" | "tribu" | "asamblea", cierre (ISO), votosEnContra, resultadoVisible: "al-votar" | "al-cierre", voto: "abierto" | "secreto", presupuesto?: { montoCentavos: number | null, moneda: "USD" | "ARS", nota: string | null }, opciones: { id, etiqueta, topeCentavos?, pisoCentavos? }[] }`. `nota` es el texto que acompaña al monto (en U4, "Sugerencia del equipo: lo decide Franz").
- `ejemplo.ts`: U1–U4 con las opciones textuales de la nota. U4 con el **monto sugerido USD 20.000** (`montoCentavos: 2_000_000`) y `nota: "Sugerencia del equipo: lo decide Franz"` (respuesta de Gus al PR #76), sin topes ni pisos (la nota no los trae). Padrón de ejemplo de seis personas ficticias ("Persona de ejemplo 1…6") más la persona que mira; las personas 1 a 5 tienen votos de ejemplo, cada reparto válido (lo prueba un test), y la 6 no votó (para que se vea "Falta votar"). Cierres de ejemplo: U1 y U2 el 2026-11-15, U3 y U4 el 2026-11-30; votos en contra apagados, resultado al cierre y **voto abierto** en las cuatro (los valores por defecto). Para poder ver las otras reglas en la demo y en los e2e: U2 se marca `resultadoVisible: "al-votar"` y U3 `voto: "secreto"`.
- `reglas.ts` (puro): `estado(consulta, cierreManual, ahora)` → `"abierta" | "cerrada"`; `resultadoVisible(consulta, estado, yaReparti)`; `textoCierre`; `textoVoto(consulta)` ("Voto abierto: todo el padrón ve cómo repartió cada quien" / "Voto secreto: nadie ve el reparto de otra persona").
- **Voto abierto o secreto** (ADR-007). Es una regla de la consulta, igual para todo el padrón. Con `abierto`:
  - "Faltan votar" (lista de nombres del padrón sin reparto con algún voto) se ve **siempre**, también antes de que el resultado sea visible; en la consulta cerrada se titula "No repartieron".
  - La **tabla de repartos** (una fila por persona con reparto, una columna por opción con sus votos, y los créditos usados) se ve **solo cuando el resultado es visible** (la misma regla al votar / al cierre); así el cierre por defecto evita que quien vota tarde copie a los demás.
  - Con `secreto`, ninguna de las dos aparece: solo "N personas repartieron de M".
  - Sin mínimo de personas para mostrar el resultado (decisión de Gus).

### 3. La costura: `RepositorioConsultas`
```ts
type Lectura<T> = { ok: true; valor: T } | { ok: false; error: "no-encontrada" | "sin-sesion" | "falla" };
interface RepositorioConsultas {
  listar(): Promise<Lectura<ResumenConsulta[]>>;     // con estado, yaReparti y participantes (ver abajo)
  abrir(id: string): Promise<Lectura<VistaConsulta>>; // consulta, miReparto, estado, puedeCerrar,
                                                     // resultado: { visible: true, agregado, participantes } | { visible: false, participantes },
                                                     // padron: null (secreto) | { faltan: Persona[], repartos: { persona, reparto }[] | null } (abierto;
                                                     //   repartos es null mientras el resultado no es visible)
  guardarReparto(id: string, reparto: Reparto): Promise<{ ok: true } | { ok: false; error: "invalido" | "cerrada" | "sin-permiso" | "sin-sesion" | "falla"; motivos?: string[] }>;
  cerrar(id: string): Promise<{ ok: boolean }>;      // solo si puedeCerrar
  reabrir?(id: string): Promise<{ ok: boolean }>;    // solo la versión del navegador
}
```
- Asíncrona desde ahora, aunque el navegador responda al instante, para que la versión con API no cambie las pantallas.
<!-- arquitecto: con `abrir() → null` una caída de la red se vería como "No encontramos esta consulta", y la pantalla no tendría cómo saber que falta la sesión; la versión con API (`fogon-cuadratico-en-la-base`) cambiaría las pantallas. Se fija ahora la forma completa. -->
- **Las lecturas distinguen "no hay" de "no pude saber"** desde este cambio, para que el siguiente no toque las pantallas: `listar()` y `abrir(id)` devuelven `Lectura<T>` (en `listar` no aparece `"no-encontrada"`). `"sin-sesion"` cubre también "sin consentimiento vigente" (las dos llevan a "Entrar"). La versión del navegador solo usa `ok: true` y `"no-encontrada"`, pero las pantallas ya muestran los tres casos: "No encontramos esta consulta", la invitación a entrar y "No pudimos cargar las consultas. Probá de nuevo." con `role="alert"` (nunca una lista vacía ni ceros cuando la lectura falló). `guardarReparto` suma `"sin-sesion"` a sus errores. `ResumenConsulta` trae `participantes: { repartieron, padron } | null` (en el navegador, `null` = "sin dato") para que el panel de `fogon-consultas-panel` no necesite otra ruta.
- **El agregado y el bloque del padrón los arma el repositorio**, no la pantalla: con la base, el servidor decide qué manda según `voto` y `resultadoVisible` (en secreto, nunca repartos ajenos; en abierto, la tabla solo cuando el resultado es visible), y la pantalla solo dibuja lo que recibe. `Persona` = `{ id, nombre }` (en el navegador, "Persona de ejemplo N" y "Vos").
- `lib/fogon/consultas/fuente.ts` exporta `repositorioConsultas()`: hoy devuelve `RepositorioNavegador`; el cambio siguiente cambia solo esa línea (y suma su implementación).
- **Navegador**: clave nueva `lh-fogon-consultas` en `NOMBRES_BASE` (por persona con el prefijo `u:<id>:`), valor `{ repartos: Record<idConsulta, Reparto>, cierres: Record<idConsulta, ISO> }`. `leer()` descarta campo por campo lo raro (como `lib/fogon/estado.ts`), incluido un reparto inválido. El agregado = repartos de ejemplo + el propio guardado. `puedeCerrar` es `true` para toda consulta abierta, con el botón "Simular el cierre" y, en una cerrada a mano, "Volver a abrir (simulado)" para repetir la demo.

### 4. Pantallas
- `/fogon`: debajo del h1, un bloque "Consultas de prioridades y presupuesto" con enlace a `/fogon/consultas` (sin otro h1).
- `/fogon/consultas` (h1 "Consultas"): lista de tarjetas con h2 por consulta; chips de texto (no solo color) para modo, ámbito y estado; "Ya repartiste" con ✓ y texto.
- `/fogon/consultas/[id]` (h1 = título; `notFound()` si no existe): secciones h2 "Mi reparto", "Resultado del grupo", con voto abierto "Faltan votar" (o "No repartieron" en la cerrada) y, cerrada, "Acta (ejemplo)". El reparto en edición vive en el estado del componente; "Sin guardar" aparece si difiere del guardado.
- **Aviso de voto abierto**: en una consulta abierta con `voto: "abierto"`, arriba de los botones de "Mi reparto", un aviso con ícono y texto (no solo color): "Tu reparto lo va a ver todo el padrón", con el momento ("cuando cierre la consulta" o "en cuanto lo guardes", según `resultadoVisible`). El botón "Guardar mi reparto" lo referencia con `aria-describedby`. Con voto secreto: "Voto secreto: nadie ve tu reparto, solo el resultado del grupo". En la lista, un chip de texto "Voto abierto" / "Voto secreto".
- **Tabla de repartos** (voto abierto y resultado visible): `<table>` con `<caption>` "Cómo repartió cada persona", encabezado de fila con el nombre, una columna por opción con sus votos (una opción sin votos muestra "0": ahí el dato existe, la persona puso 0) y "Créditos usados"; la fila propia dice "Vos" además del nombre. En 390 px la tabla va dentro de un contenedor con scroll horizontal propio y `tabindex="0"` con nombre accesible (la página no hace scroll horizontal).
- **− / +**: botones reales con `aria-label="Sumar un voto a <opción>"` / "Quitar…". Si el próximo voto no alcanza, `aria-disabled="true"` (sigue enfocable) y el motivo en texto visible, unido con `aria-describedby`. Cada cambio se anuncia en una región `role="status"` ("Regeneración ecológica: 3 votos, 9 créditos. Te quedan 91."). Se reutiliza `components/medidor.tsx` para los créditos.
- **Formato de plata**: `Intl.NumberFormat("es-AR")` con la moneda delante ("USD 15.000"); centavos solo si no son cero.
- **Rail**: "Fogón" queda activo en `/fogon/consultas/*` (verificar `lib/ruta-activa.ts`).

### 5. Donut (`components/donut.tsx`)
- Props: `titulo`, `porciones: { id, etiqueta, valor }[]`, `resto?: { etiqueta: "Sin usar", valor }`, `formatoValor`. Sin estado; sirve en servidor y cliente.
- SVG con un círculo por porción (`stroke-dasharray` sobre la circunferencia), empezando a las 12 y en sentido horario, en el mismo orden que la leyenda. El SVG es `aria-hidden`; la información está en el `<figure>`: `<figcaption>` con el título, **leyenda** como lista ordenada ("1 · Regeneración ecológica · 36 %") y una **tabla** equivalente (opción, valor, %) dentro de `<details>` "Ver como tabla".
- **Sin solo color**: cada porción de ≥ 5 % lleva su número dibujado en el arco; las más chicas no (no entra), pero están en la leyenda y la tabla con su número. "Sin usar" va con un trazo punteado además del tono.
- Tonos: lista fija de clases de tokens (`stroke-deep`, `stroke-gold`, `stroke-blue`, `stroke-violet`, `stroke-clay`, `stroke-rose`, `stroke-green`) y `stroke-line` para "Sin usar"; nada de colores sueltos (el test `lib/sin-colores-sueltos.test.ts` lo cubre). Con más de 7 opciones los tonos se repiten (el número los distingue).
- Total 0: un anillo vacío y "sin dato" en la leyenda.

### 6. Pruebas
- Vitest: todos los escenarios de `specs/voto-cuadratico` (incluidos tope, piso, todos topados, pisos imposibles, monto `null`, sin votos), validez de los repartos de ejemplo, `leer()` del repositorio del navegador, `estado` y `resultadoVisible`.
- Playwright: `e2e/fogon-consultas.spec.ts` (repartir, bloqueo por créditos, guardar y recargar, regla al votar en U2, al cierre en U1, simular el cierre y ver el acta, presupuesto en U4, teclado, 390 px) y las páginas nuevas en `e2e/accesibilidad.spec.ts`.

## Risks / Trade-offs

- [El llenado con límites puede dar un resultado distinto según el orden en que se fijan topes y pisos en casos raros] → el orden queda fijo (primero topes, después pisos) y documentado; los escenarios de la spec lo prueban. Si la Ronda 0 necesita otra regla, se agrega como otra función.
- [Votos de ejemplo pueden confundirse con opiniones reales del equipo] → las personas son "Persona de ejemplo N" y la página dice "datos de ejemplo".
- [Con voto abierto el equipo puede repartir "para la foto"] → riesgo aceptado por Gus (ADR-007); el aviso antes de votar y el resultado al cierre por defecto lo acotan.
- [Muchas opciones achican las porciones y los números no entran] → la leyenda y la tabla siempre tienen todo; el número en el arco es una ayuda, no la única vía.
- [La regla "una persona, una voz" depende de que nadie pueda votar dos veces] → en el navegador no se puede garantizar (es una demo); la garantía llega con la base en el cambio siguiente.

## Migration Plan

Solo código nuevo y una clave nueva de `localStorage`; nada que migrar. Para volver atrás se revierte el PR.

## Open Questions

Ninguna. Gus respondió en el PR #76: voto abierto por defecto en Equipo, sin mínimo de personas, U4 con USD 20.000 sugeridos (lo decide Franz). Cambiar un valor por defecto es cambiar datos de `ejemplo.ts`, no el diseño.
