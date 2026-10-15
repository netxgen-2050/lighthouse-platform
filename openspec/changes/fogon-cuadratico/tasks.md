# Tasks

Rama `agente/fogon-cuadratico` desde `main`. Textos en español con voseo. Sin dependencias nuevas.

## 1. Motor

- [ ] 1.1 Crear `lib/cuadratico/motor.ts` con `costo`, `costoReparto`, `validarReparto`, `agregar`, `porcentajes` y `ordenar` (design §1), sin importar nada de `lib/fogon` ni de React, y `lib/cuadratico/motor.test.ts` con los escenarios de costo, reparto válido, votos en contra, opción ajena, agregado (6/3/1 con 2, 2 y 1 personas), porcentajes (60/30/10, resto mayor que suma 100, "sin dato" = `null` sin votos) y orden con empate. Verificar con `pnpm test lib/cuadratico`.
- [ ] 1.2 Sumar `repartirPresupuesto` (design §1) con tests de cada escenario de `specs/voto-cuadratico`: proporcional 6.000/3.000/1.000, tope (5.000/3.750/1.250), piso (5.333,33/2.666,67/2.000, en centavos 533333/266667/200000), todos topados con 7.000 sin asignar, pisos imposibles con aviso, monto `null` y sin votos → todas las partes `null`; y una propiedad: la suma de las partes más lo sin asignar es exactamente el monto. Verificar con `pnpm test lib/cuadratico`.
- [ ] 1.3 Test de fuente: `lib/cuadratico/` no importa de `@/lib/fogon`, `react` ni `next`. Verificar con `pnpm test lib/cuadratico`.

## 2. Datos y costura

- [ ] 2.1 Crear `lib/fogon/consultas/tipos.ts`, `ejemplo.ts` (U1–U4 con las opciones de la nota, U4 con USD 50.000 de ejemplo, U2 con resultado al votar, seis personas de ejemplo) y `reglas.ts` (`estado`, `resultadoVisible`, `textoCierre`) con tests: todo reparto de ejemplo es válido según el motor; ninguna consulta tiene `creditos` distinto de 100; `estado` con `ahora` antes y después del cierre y con cierre manual; `resultadoVisible` para "al-votar" (antes y después de guardar) y "al-cierre" (abierta y cerrada). Verificar con `pnpm test lib/fogon`.
- [ ] 2.2 Crear `lib/fogon/consultas/repositorio.ts` (interfaz, design §3), `navegador.ts` (`RepositorioNavegador`) y `fuente.ts`; sumar `fogonConsultas: "lh-fogon-consultas"` a `NOMBRES_BASE` en `lib/demo/claves.ts`. Tests con un `localStorage` simulado: guardar y volver a leer un reparto; un reparto inválido o de una consulta cerrada se rechaza con su error; `leer()` descarta JSON roto, consultas desconocidas y repartos inválidos campo por campo; el agregado suma ejemplo + propio y cuenta solo el último reparto propio; `cerrar` y `reabrir`; con el resultado oculto `abrir` no trae el agregado (solo `participantes`). Verificar con `pnpm test lib/fogon`.

## 3. Donut

- [ ] 3.1 Crear `components/donut.tsx` (design §5) con test de render (Vitest + Testing Library si ya está en el repo; si no, test de la función que calcula los arcos): la leyenda lista número, etiqueta y % en el orden de las porciones; "Sin usar" aparece con su %; total 0 muestra "sin dato"; solo usa clases de tokens. Verificar con `pnpm test` (incluido `lib/sin-colores-sueltos.test.ts`).

## 4. Pantallas

- [ ] 4.1 `app/fogon/consultas/page.tsx` (lista) y el bloque con enlace en `app/fogon/page.tsx`, leyendo solo de `repositorioConsultas()`; confirmar que el rail marca "Fogón" en `/fogon/consultas` (ajustar `lib/ruta-activa.ts` con su test si hace falta). Verificar con `pnpm verificar` y con el e2e de 5.1.
- [ ] 4.2 `app/fogon/consultas/[id]/page.tsx` + cliente: "Mi reparto" (− / + con costo, bloqueo con motivo y `aria-describedby`, región `role="status"`, medidor, donut propio, "Con tu reparto irían" en presupuesto, "Sin guardar", "Guardar mi reparto" con anuncio), solo lectura si está cerrada. Verificar con `pnpm verificar` y con el e2e de 5.1.
- [ ] 4.3 "Resultado del grupo" (oculto con el texto de cuándo se ve y cuántas personas repartieron; visible con donut, barras ordenadas, %, "N personas la apoyaron", monto y sin asignar en presupuesto, "Tu voto") y "Acta (ejemplo)" al cerrar con la frase "El resultado es consultivo"; botones "Simular el cierre" y "Volver a abrir (simulado)". Verificar con `pnpm verificar` y con el e2e de 5.1.

## 5. Pruebas de punta a punta

- [ ] 5.1 `e2e/fogon-consultas.spec.ts`: (a) la lista muestra U1–U4 con modo, ámbito, cierre y estado, y `/fogon` enlaza; (b) en U1, tres "+" en una opción muestran "3 votos · 9 créditos" y "Te quedan 91 de 100 créditos", y el donut propio lista "Sin usar · 91 %"; (c) llenar hasta que "+" no alcance y ver el motivo; "−" no baja de 0; (d) guardar, recargar y ver el mismo reparto y "Ya repartiste" en la lista; (e) U1 con resultado al cierre: tras guardar, "El resultado del grupo se ve al cierre" sin barras; "Simular el cierre" muestra el resultado con "Tu voto" y el acta con "El resultado es consultivo"; sin botones "+"; (f) U2 con resultado al votar: tras guardar se ve el resultado; (g) U4: "Con tu reparto irían USD 37.500" y "USD 12.500" con 3 y 1 votos, y "sin dato" sin votos propios; (h) todo con teclado (Tab, Enter, Espacio) sin mouse; (i) a 390 px, `document.documentElement.scrollWidth <= 390` en lista y detalle; (j) ningún pedido de red a `/api/` al guardar. Verificar con `pnpm test:e2e e2e/fogon-consultas.spec.ts`.
- [ ] 5.2 Sumar `/fogon/consultas`, `/fogon/consultas/u1` (abierta, con reparto a medias) y `/fogon/consultas/u4` cerrada (resultado y acta a la vista) a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 6. Integración

- [ ] 6.1 `pnpm verificar` y `pnpm build` en verde; PR con capturas de Mi reparto, Resultado y Acta, y el guion de prueba de 5.1 en palabras para Gus. Verificar con los dos comandos y con `scripts/pr.sh`.
