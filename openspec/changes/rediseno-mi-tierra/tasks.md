# Tasks

Cuarto de los cinco cambios del rediseño. **Orden:** requiere en `dev` `rediseno-sistema-visual`, `rediseno-menu-cinco`, `bien-comun-propuesta` y `lote-token-tierra` (el campo `plan` y la regla de FARO por cuota). No depende de `rediseno-explorar-valle`: pueden ir en paralelo.

## 1. Función única de reservas

- [x] 1.1 Crear `lib/lotes/reservas.ts` (`leerReservas`, `guardarReservas`, asíncronas, sin sesión → `[]`/`false`) con test. **Verifica:** `pnpm test lib/lotes` en verde.
- [x] 1.2 Cambiar `components/lotes/usar-compras.ts` para que lea y guarde por esas funciones, y ajustar sus usos a `guardar` asíncrono. **Verifica:** `pnpm test:e2e e2e/lotes.spec.ts` en verde sin cambiar sus casos.
- [x] 1.3 Test `lib/lotes/reservas-unica.test.ts`: recorre `app/`, `components/` y `lib/` y falla si otro archivo hace `getItem`/`setItem` sobre la clave de reservas. **Verifica:** `pnpm test lib/lotes` en verde; agregar a propósito un `getItem(CLAVES.lotes)` en otro archivo lo hace fallar (probar y revertir).
- [x] 1.4 Comentario en `lib/lotes/reservas.ts` que nombra a `lib/privacidad/exportar.ts`, `lib/demo/importar.ts` y el borrado de `/mis-datos` como lecturas genéricas que tienen que cambiar junto con esta función en `lotes-en-la-base`. Test: con sesión de la persona A guardar una reserva, cambiar a la persona B ("Entrar como…") y `leerReservas` devuelve `[]`. **Verifica:** `pnpm test lib/lotes` en verde. <!-- arquitecto: lecturas genéricas que el test no ve; reservas separadas por persona -->

## 2. Vista

- [x] 2.1 `lib/mi-tierra/portafolio.ts` con test: reservado, en cuotas (anticipo pagado, 0 de N), contado, primeros 4 lotes sin plan ni FARO, reserva vieja sin `plan` ("sin dato", nunca "Contado"), libro ordenado; estado tomado de `estadoConCompras()`; plan y FARO leídos de `vio.plan` (`design.md` §2). **Verifica:** `pnpm test lib/mi-tierra` en verde; los esperados salen de los módulos; un caso con una compra guardada con un `vio.plan` distinto del que daría el modelo de hoy muestra lo guardado. <!-- arquitecto: estado y FARO con un solo dueño cada uno -->
- [x] 2.2 `app/mi-tierra/page.tsx` y `lib/idioma/textos/mi-tierra.ts` (es/en): sin sesión (`EntrarPara`), sin compras, tu lote, plan, FARO, voz, actividad y sello de venta, con los componentes de `components/ui/`. Sumar `/mi-tierra` a `lib/sesion/rutas-publicas.ts` (`design.md` §1). **Verifica:** `pnpm test lib/idioma lib/sesion lib/permisos` en verde, con un caso nuevo `esPublica("/mi-tierra") === true`; `pnpm build` en verde. <!-- arquitecto: si no es pública, la puerta redirige a Sumarte y el aviso nunca se ve -->
- [x] 2.3 `/mi-tierra` pasa a `existe: true` en `lib/navegacion.ts`; sumar `app/mi-tierra/` y `lib/mi-tierra/` a `lib/lotes/sin-numeros-escritos.test.ts`. **Verifica:** `pnpm test lib/navegacion lib/lotes` en verde.

## 3. E2E

- [x] 3.1 `e2e/mi-tierra.spec.ts`: sin sesión (aviso, ningún número); con sesión sin compras; reservar un lote desde su ficha y verlo en Mi tierra como "Reservado" con "falta el primer pago"; pagar el anticipo en 24 cuotas y ver "0 de 24", FARO acreditados y dos filas en el libro; voz sin adhesión y con adhesión; sello de venta; inglés; 390 px; ningún "rendimiento", "APY" ni "precio de FARO". **Verifica:** `pnpm test:e2e e2e/mi-tierra.spec.ts` en verde.
- [x] 3.2 Sumar `/mi-tierra` (con y sin compras) a `e2e/accesibilidad.spec.ts` en los dos idiomas y los dos temas. **Verifica:** `pnpm test:e2e e2e/accesibilidad.spec.ts` en verde.

## 4. Cierre

- [x] 4.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate rediseno-mi-tierra --strict` pasa.
