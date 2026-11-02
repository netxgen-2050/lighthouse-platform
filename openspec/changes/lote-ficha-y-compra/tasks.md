# Tasks

**Corte por noche: noche 2.** Rama `agente/lote-ficha-y-compra`, desde `dev` con `venta-lotes-regla` y `loteo-norte-7a` ya integrados (o apilada sobre ellos si Gus todavía no los mergeó). Textos en `design.md`.

**Antes de empezar:** comprobar que existen `lib/territorios/loteo.ts` y `accionesDeLote("lighthouse-norte")`. Si el veredicto del arquitecto pidió subir la versión de la política (design §5), hacerlo como tarea extra antes de la sección 3.

## 1. Modelo

- [ ] 1.1 Crear `lib/lotes/modelo.ts` (design §1) con los valores y `VERSION_MODELO_LOTES`. Verificar con `lib/lotes/modelo.test.ts`: con 25 lotes, `aportePorLote` 25.000, `aporteTotal` 625.000, `expensasTotales` 75.000, `expensaParaCubrir` 9.600 y `aniosQueCubreElAporte` ≈ 2,6; con 0 lotes, `null`; `precioCasa`, `infraestructura` y `parteDelDueno` son `null`. `pnpm test lib/lotes`.
- [ ] 1.2 Sumar `leccionAporte` y `leccionExpensas` (design §2). Verificar con tests: con los valores actuales la lección del aporte dice "2,6 años" y **no** dice "no alcanza"; con 5 lotes (aporte total USD 125.000) dice "no alcanza ni para el primer año"; la de expensas dice "USD 9.600" con 25 lotes; las dos existen en inglés. `pnpm test lib/lotes`.
- [ ] 1.3 Sumar un test que vigile que no hay números escritos, como `lib/sin-colores-sueltos.test.ts`: en `app/lotes/` y en `lib/idioma/textos/lotes.ts` no aparecen `500.000`, `500000`, `25.000`, `3.000`, `9.600` ni `240.000`. También falla si aparecen `SMA`, `111`, `TIR` o `recupero`. `pnpm test lib/lotes`.

## 2. Compra

- [ ] 2.1 Crear `lib/lotes/compra.ts` (design §5 y §7) y sumar `lotes: "lh-lotes"` a `NOMBRES_BASE`. Verificar con `lib/lotes/compra.test.ts`: un JSON inválido da lista vacía; no se reserva un lote vendido, ni uno reservado de ejemplo; no se paga lo que no está reservado; `deshacer` lo saca; un id desconocido se ignora al calcular el estado; el registro **no tiene** campos de identidad. Sumar la clave a `lib/demo/claves.test.ts`. `pnpm test lib/lotes lib/demo`.

## 3. Pantallas

- [ ] 3.1 Sumar los ⚖ `precioreferencia`, `aporteunico`, `expensas`, `derechosdeberes` y `boletoejemplo` (design §6) con `borrador: true` y `en`. Verificar con `lib/legal/terminos.test.ts`, sumando que todos son borrador con inglés y que `boletoejemplo` dice "no se pagó nada". `pnpm test lib/legal`.
- [ ] 3.2 Crear `lib/idioma/textos/lotes.ts` y registrarlo en `lib/idioma/textos.ts`. Crear `app/lotes/page.tsx` y `app/lotes/[id]/page.tsx` con las secciones de design §4. Sumar las rutas públicas (design §11) y `/lotes` a `lib/sesion/rutas-publicas.test.ts`. Pasar el destino a `existe: true`. Verificar con `pnpm test lib/navegacion lib/sesion` y `pnpm verificar`.
- [ ] 3.3 En `lib/legal/vistas-con-lotes.ts`, pasar la lista a `{ ruta, proyectos }[]`, con `/territorios/lighthouse` (Soluna y Norte), `/lotes` y `/lotes/lote-1` (Norte). Hoy el e2e exige "Chacras de Soluna" en cada ruta: el bucle de `e2e/estado-administrativo.spec.ts` tiene que comprobar, en cada ruta, el texto de cada uno de sus proyectos. Actualizar `lib/legal/estado-administrativo.test.ts`. Verificar con `pnpm test lib/legal` y `pnpm test:e2e e2e/estado-administrativo.spec.ts`.
- [ ] 3.4 Crear `app/lotes/[id]/compra-cliente.tsx` con la opción "con casa" y el flujo (design §7 y §8). Verificar con `e2e/lotes.spec.ts`, nuevo, con sesión y solo con teclado: reservar → simular pago → confirmar → se ve "Boleto de ejemplo", "SIMULADO · SIN VALOR LEGAL · NO SE PAGÓ NADA", "Comprador: Persona de ejemplo", "Vendedor: sin dato"; al recargar sigue ahí; "Deshacer" vuelve a disponible; ningún pedido de red lleva datos del lote; no hay campos de pago. `pnpm test:e2e e2e/lotes.spec.ts`.
- [ ] 3.5 Comprobar los demás estados: sin sesión se ve "Entrá para reservar este lote" y no se guarda nada; `/lotes/lote-13` (vendido) no ofrece reservar; `/lotes/no-existe` da 404; "Con casa de referencia" dice "170 m²" y "Precio: sin dato"; Infraestructura y Parte del dueño dicen "sin dato", no 0. `pnpm test:e2e e2e/lotes.spec.ts`.

## 4. Conexiones

- [ ] 4.1 En el panel del lote del mapa, sumar el enlace a su ficha y usar `estadoConCompras` en el panel, en la lista del mapa y en `/lotes` (design §9). Verificar en `e2e/lotes.spec.ts`: después de reservar `lote-7`, el mapa con `?sel=lote-7` dice "Reservado (simulado, por vos)", y `accionesDeLote("soluna")` sigue sin ofrecer compra en una finca. `pnpm test:e2e e2e/lotes.spec.ts e2e/loteo-norte.spec.ts`.
- [ ] 4.2 Sumar el motivo `consulta-lote-vrn` en `lib/contactos/tipos.ts` y `lib/idioma/textos/sumarte.ts`, y "Hablar con alguien" en la ficha (design §10). Verificar en `lib/contactos/pedidos.test.ts` (un pedido viejo sigue leyéndose) y en `e2e/lotes.spec.ts`: el pedido figura en `/netx` como "Consulta por un lote de Lighthouse VRN · Lote 7", con destino "Equipo NetX". `pnpm test lib/contactos`.

## 5. Calidad

- [ ] 5.1 Sumar `/lotes` y una ficha a `e2e/accesibilidad.spec.ts`, en los dos idiomas. Comprobar 390 × 844 px sin scroll horizontal, incluido el boleto y la tabla de costos. `pnpm test:e2e e2e/accesibilidad.spec.ts e2e/lotes.spec.ts`.
- [ ] 5.2 `git diff --name-only origin/dev` no incluye `lib/db/`, `lib/privacidad/consentimiento.ts` (salvo veredicto del arquitecto) ni `package.json`. `pnpm verificar` y `pnpm build` en verde.
- [ ] 5.3 Abrir el PR con `scripts/pr.sh` hacia `dev`, aclarando: el flujo es simulado y sin datos de identidad; los ⚖ son borrador; la lección del aporte hoy dice "2,6 años" porque así dan los números (pregunta para Gus); `/lotes` es pública y sigue indexable hasta P7. Verificar con `scripts/preview-url.sh agente/lote-ficha-y-compra` y `BASE_URL=<url> pnpm test:e2e e2e/lotes.spec.ts`.
