# Tasks

**Rama:** `agente/fogon-propuestas` desde `dev`. Si en `dev` no están `lib/gobernanza/caminos.ts` ni `app/fogon/gobernanza/lentes/panel-decisiones.tsx` (holarquía), frenar y reportar.

**Tres noches, con cortes.** Cada noche termina con `pnpm verificar` y `pnpm build` en verde y el PR (borrador hasta la noche 3) actualizado con `scripts/pr.sh`.
- **Noche 1** (grupos 1 a 3): modelo, reglas, matriz de permisos, datos de ejemplo y la página de solo lectura (ficha, fases, discusión, tabla de permisos, selector de nivel con acciones como lista, sin botones que escriban). **Corte:** PR en borrador; los botones "Abrir la propuesta" ya funcionan.
- **Noche 2** (grupos 4 y 5): registros en el navegador y las acciones de la discusión (preguntas, comentarios, concerns, sumarse, retirar, resoluciones, versiones, pasar de fase). **Corte:** PR en borrador, sin cierre ni Hifa.
- **Noche 3** (grupos 6 a 8): bloqueo y legitimidad, afectadas, cierre, vencimiento, evaluación, guardián, Hifa simulada e integración.

Todo valor A–F sale de `lib/fogon/propuestas/reglas.ts` o `permisos.ts` (design §1 y §2): **ningún componente escribe un número de días, un mínimo ni una celda de la matriz.**

## 1. Modelo, reglas y permisos (noche 1)

- [ ] 1.1 `lib/fogon/propuestas/tipos.ts` y `reglas.ts` con los valores A–F del design §1, cada uno con un comentario "propuesta, a confirmar por Gus (letra)". Tests: `minimoParticipacion` (1 → 1, 2 → 2, 4 → 3, 6 → 3, 12 → 6, `null` → `null`); plazos por defecto 2/3/2 y simple 3; un holón de ejemplo con 5 días de discusión cambia solo esa fase; `alVencer` (importante → pausada; urgente de círculo → tribu; urgente de tribu → consejo; urgente del común → pausada; simple sin concerns abiertos → adoptada; simple con concern abierto → pausada). Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 1.2 `lib/fogon/propuestas/permisos.ts`: `NIVELES_IMPLICACION`, `MATRIZ` (transcripción exacta de las 15 filas × 7 columnas de `ACCIONES` del boceto, `docs/referencia/gobernanza-fractal-boceto.html`), `ACCIONES_DE_PROCESO`, `RESTRICCIONES_DE_QUIEN_PRESENTA` y `permiso()` (design §2). Tests: un test que recorre las 105 celdas contra una tabla escrita en el test a partir del boceto; `solo-comun` da sí en el común y no en una tribu; visita lee solo con `resumen-si-comun`; unión de niveles (`["red", "afectada"]` puede levantar concern); `["ambito", "presenta"]` no puede levantar concern, sumarse, hacerse a un lado, bloquear ni decidir legitimidad, y sí puede editar; ninguna celda queda sin texto en es ni en en. Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 1.3 `lib/fogon/propuestas/fases.ts`: `RECORRIDOS`, `ACCIONES_POR_FASE` (tabla del design §2) y `accionesDisponibles`. Tests: en "preguntas" del ámbito hay `preguntar` y no `levantar-concern`; en "objetar" del ámbito hay `levantar-concern` y `bloquear`; en "cierre" solo leer, acta y evaluar (D3); leer siempre. Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 1.4 `lib/fogon/propuestas/principios.ts` (design §5) y `ejemplos.ts` (design §8) con las cinco propuestas, sus personas "(ejemplo)", registros de ejemplo y `propuestaDe(decisionId)`. Tests: cada `decisionId` existe en `DECISIONES_BASE`; ninguna decisión de ámbito fideicomiso tiene propuesta; cada `holonId` existe en la holarquía; todo principio citado existe; todo texto tiene es y en. Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 1.5 `lib/fogon/propuestas/estado.ts`: `derivarEstado(p, extra, ahora)` con fases, vencimientos (fechas en UTC), concerns y su estado, participación y resultado (design §4). Tests: bomba en "resolver" con dos concerns agrupados en "Uso compartido"; siembra cerrada por consenso con Paz a un lado; cisterna en "preguntas"; vencimiento de "preguntas" del 1-nov el 3-nov y de la propuesta el 8-nov; misma salida en dos llamadas. Verificar con `pnpm test lib/fogon/propuestas`.

## 2. Página de solo lectura (noche 1)

- [ ] 2.1 `lib/idioma/textos/fogon-propuestas.ts` (es y en): fases, tipos de discusión, estados de concern, niveles, acciones, condiciones de la matriz, avisos (prototipo, ejemplo, simulación de nivel, "Proceso de ejemplo: las reglas son una propuesta"). Verificar con el test de cobertura de idioma (`pnpm test lib/idioma`).
- [ ] 2.2 `app/fogon/propuestas/[id]/page.tsx` y `propuesta-cliente.tsx` (design §7): migas, encabezado, fases con `aria-current="step"` y texto, ficha (`<dl>`, "sin dato", "No pide plata", "(simulado)" junto al monto), discusión con su tipo en texto, concern con principio y estado, historial de versiones, `notFound()` para ids sin propuesta. Solo tokens del tema. Verificar con `pnpm verificar`.
- [ ] 2.3 "Qué podés hacer": selector "Mirá la propuesta como…" con los 7 niveles, nivel inicial calculado después de montar con "(tu nivel)" (design §3), lista de acciones disponibles en la fase con su condición en texto (todavía sin formularios), vista de visita (A2). "Quién puede hacer qué": `<details>` con la tabla accesible (caption, encabezados, celdas en texto). Tests unitarios de `nivelInicial` (miembro de Valle Solar → ámbito en la bomba; sin membresía → red; `localStorage` roto → red). Verificar con `pnpm test lib/fogon/propuestas` y `pnpm verificar`.
- [ ] 2.4 Botón "Abrir la propuesta" en la tarjeta de `app/fogon/fogon-cliente.tsx` y en la decisión elegida de `app/fogon/gobernanza/lentes/panel-decisiones.tsx`, solo si `propuestaDe(id)` existe. Verificar con `pnpm verificar`.
- [ ] 2.5 ⚖ nuevos en `lib/legal/terminos.ts` (design §9), `borrador: true` y `en`, usados junto a concern, bloqueo, hacerse a un lado, afectada, principios y guardián. Verificar con `pnpm test lib/legal`.

## 3. Pruebas de la noche 1

- [ ] 3.1 `e2e/fogon-propuestas.spec.ts` con los escenarios de "Abrir la propuesta" (las cuatro), "Ficha de la propuesta" (las tres), "Dos recorridos de fases" (importante y simple), "Discusión con tipos", "Permisos por nivel de implicación" (las tres), "Ver la propuesta como cada nivel" (las tres) y "Acciones según la fase" (concern antes de tiempo, como lista de acciones), "Reabrir solo con nuevo consenso", "Prototipo · En inglés". Sumar la propuesta de la bomba (con la tabla abierta) a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-propuestas.spec.ts e2e/accesibilidad.spec.ts`.
- [ ] 3.2 **Corte noche 1:** `pnpm verificar` y `pnpm build` en verde; PR en borrador con `scripts/pr.sh` contra `dev`, que dice que reemplaza a `fogon-consenso-formal`, que los valores A–F son propuestas y que pide revisión del arquitecto. Verificar que el PR existe y muestra el preview de Vercel.

## 4. Registros en el navegador (noche 2)

- [ ] 4.1 Clave `fogonPropuestas: "lh-fogon-propuestas"` en `lib/demo/claves.ts` (la borra "Borrar todo"); `lib/fogon/propuestas/navegador.ts` con `leerRegistros` y `agregarRegistro` (solo agrega, lectura defensiva que descarta registros mal formados, nunca escribe los de ejemplo). Tests: agregar y leer; JSON roto → solo ejemplos; un registro sin `tipo` se descarta; no hay función para borrar ni editar un registro. Verificar con `pnpm test lib/fogon/propuestas`.

## 5. Acciones de la discusión (noche 2)

- [ ] 5.1 Validaciones puras en `lib/fogon/propuestas/acciones.ts`: texto obligatorio; un concern abierto por persona y versión (propone editar, retirar o sumarse); sumarse no duplica; concern sin nombre solo con `tema: "cuidado-conflicto"` (C1); quien presenta no puede las acciones de C4. Tests uno por regla. Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 5.2 Formularios en línea para preguntar, responder, comentar, levantar concern (con principio opcional y, si corresponde, "sin nombre"), sumarse, retirar, proponer resolución, editar (nueva versión; "solo forma" para rol de proceso) y pasar de fase (rol de proceso). Error en texto con `aria-describedby`, foco a la entrada nueva y anuncio `aria-live`. Pedir el recorrido importante en la huerta. Verificar con `pnpm verificar`.
- [ ] 5.3 E2E: "Concern sin razón", "Sumarse a un concern", "Segundo concern abierto", "Concerns con nombre" (las dos, la de cuidado en la cisterna después de pasarla a concerns como rol de proceso), "Nueva versión", "Conflicto de interés en un pedido de plata", "Pedir el recorrido importante", "Retirar un concern", "Sin red" (ningún pedido con el texto escrito) y "Borrar todo". Verificar con `pnpm test:e2e e2e/fogon-propuestas.spec.ts`.
- [ ] 5.4 **Corte noche 2:** `pnpm verificar` y `pnpm build` en verde; actualizar el PR (sigue en borrador). Verificar con `scripts/pr.sh ver`.

## 6. Bloqueo, afectadas y cierre (noche 3)

- [ ] 6.1 Bloqueo con razón y principio (C2), legitimidad registrada como "del grupo del ámbito (simulado)" (C3), bloqueo no legítimo que queda como concern, hacerse a un lado con razón; declararse afectada con motivo y objeción del grupo (A1); cierre por rol de proceso con participación mínima (B3), resultado y acta de Memoria; vencimiento con `alVencer` y `ahora` después de montar (D1). Tests unitarios de cada transición en `estado.ts`. Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 6.2 Evaluación opcional de dos preguntas al cerrar (F4), solo para quien dejó un registro, sin avisos si no se responde. Test: la evaluación se guarda como registro y no cambia el resultado. Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 6.3 E2E: "Bloqueo sin principio", "El grupo decide la legitimidad", "Quien facilita no decide la legitimidad", "Declararse afectada" (las tres), "Participación insuficiente", "Consenso con una persona a un lado", "Cerrar con un bloqueo legítimo", "Sin consenso al vencer" (las tres, con `page.clock`), "Evaluación del proceso" (las dos), "Objetar en una decisión simple". Verificar con `pnpm test:e2e e2e/fogon-propuestas.spec.ts`.

## 7. Hifa y guardián (noche 3)

- [ ] 7.1 `lib/fogon/propuestas/facilitacion.ts`: puerto `Facilitador` y `facilitadorGuionado` (design §6). Tests: el puerto no tiene métodos de cerrar, bloquear ni legitimidad; `proponerSiguienteFase` no cambia el estado; aplicar la propuesta sin `confirmadoPor` falla; frente a un bloqueo pendiente el recordatorio es una pregunta. Verificar con `pnpm test lib/fogon/propuestas`.
- [ ] 7.2 Panel "Facilitación (Hifa, simulada)" con resumen, grupos sugeridos, recordatorios de reglas y plazos, y "Confirmar" solo para rol de proceso; aviso de simulación. Concern de guardián con su marca y principio por defecto (F1). Verificar con `pnpm verificar`.
- [ ] 7.3 E2E: "Proponer pasar de fase", "Honestidad" y "Concern de la guardiana". Verificar con `pnpm test:e2e e2e/fogon-propuestas.spec.ts`.

## 8. Integración

- [ ] 8.1 `pnpm verificar`, `pnpm build`, `pnpm test:e2e e2e/fogon-propuestas.spec.ts e2e/fogon.spec.ts e2e/fogon-gobernanza.spec.ts e2e/accesibilidad.spec.ts` en verde. PR listo para revisión con `scripts/pr.sh`: reemplaza a `fogon-consenso-formal`; valores A–F propuestos; plata simulada; IA, base, avisos y constancias fuera de alcance. Verificar que el preview de Vercel pasa `BASE_URL=<url> pnpm test:e2e e2e/fogon-propuestas.spec.ts`.
