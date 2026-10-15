# Tasks

Rama `agente/fogon-consultas-panel` desde `main`, **después** de `fogon-cuadratico-en-la-base`. Si no está en `main`, frenar y reportar. Sin migraciones ni rutas nuevas: si hace falta una ruta, frenar y reportar.

## 1. Formulario

- [ ] 1.1 `lib/fogon/consultas/formulario.ts`: de plantilla a borrador (U1–U4 y en blanco con los valores por defecto: resultado al cierre, votos en contra apagados, 100 créditos que no se editan), y validación pura con mensajes por campo (título, al menos 2 opciones con texto, cierre futuro, monto ≥ 0 o vacío, moneda en presupuesto, piso ≤ tope, padrón con al menos una persona). La validación del servidor de `crearConsulta` pasa a usar esta misma función. Tests de cada mensaje y de cada plantilla. Verificar con `pnpm test lib/fogon`.

## 2. Pantalla

- [ ] 2.1 <!-- arquitecto: "votaron X de N" sale de `participantes` de cada `ResumenConsulta` de `GET /api/fogon/consultas` (`fogon-cuadratico-en-la-base` design §2), sin ruta nueva; la sección se oculta en el cliente pero el permiso lo decide la API (403 para quien no es super admin). Las personas del padrón que todavía no aceptaron la política cuentan en N pero no pueden votar hasta aceptar: la casilla del padrón lo dice ("todavía no aceptó") si `GET /api/personas` ya trae ese dato; si no lo trae, no se agrega (no es ruta nueva) y se anota en el PR. --> Sección "Consultas del Fogón" en `/netx` solo para el super admin: lista con estado, cierre y "votaron X de N" (desde `participantes` de la lista, nunca con nombres); "Nueva consulta" (plantilla, campos, padrón con casillas desde `GET /api/personas` y campo de email, errores junto a cada campo con `aria-describedby` y un resumen con `role="alert"`); "Cerrar ahora" con un `<dialog>` de confirmación (el foco vuelve al botón). Montos con el formato de `fogon-cuadratico`; vacío = "sin dato". Verificar con `pnpm verificar` y con el e2e de 3.1.

## 3. Pruebas

- [ ] 3.1 `e2e/fogon-panel.spec.ts` (PGlite + modo de prueba): el super admin crea U1 con dos personas y la ven las dos (y no una tercera); crear U4 sin monto muestra "sin dato" en el detalle; fecha pasada y padrón vacío muestran su error; "Cerrar ahora" pide confirmación y deja la consulta cerrada con el acta a la vista para las del padrón; una persona sin rol no ve la sección; todo con teclado y sin scroll horizontal a 390 px. Sumar la sección (con el formulario abierto y con errores) a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-panel.spec.ts e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con los pasos para que Gus cargue U1–U4 con el padrón del equipo en producción después del merge. Verificar con los dos comandos y con `scripts/pr.sh`.
