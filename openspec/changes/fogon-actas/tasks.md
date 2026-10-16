# Tasks

Rama `agente/fogon-actas` desde `dev`, **después** de que `fogon-cuadratico` y `fogon-cuadratico-en-la-base` estén en `dev`. Si no están, frenar y reportar. Sin rutas nuevas: si hace falta una, frenar y reportar. No arrancar sin la revisión del arquitecto anotada en este cambio.

## 1. Base

- [ ] 1.1 Tabla `consulta_actas` en `lib/db/schema.ts` y una migración nueva en `drizzle/` con los triggers de solo agregar y el `BEFORE INSERT` que rechaza consultas abiertas (`consulta-abierta`), según design §1. Tests con PGlite: inserta una vez, rechaza la segunda (clave), rechaza `UPDATE`, `DELETE` y `TRUNCATE`, rechaza una consulta abierta, acepta una cerrada por fecha. Verificar con `pnpm test lib/db`.

## 2. Servidor

- [ ] 2.1 `lib/fogon/consultas/acta.ts` (puro): `armarActa` y `textoActa` (sin nombres, con la frase consultiva), y la constante `MOTOR_VERSION` en `lib/cuadratico/`. Tests: prioridades, presupuesto con fondos sin asignar, sin votos ("sin dato"), voto abierto sin nombres en el texto. Verificar con `pnpm test lib/fogon lib/cuadratico`.
- [ ] 2.2 `cerrarConsulta` inserta el acta en la misma transacción que el cierre; `vista` y `listar` registran con `on conflict do nothing` el acta de una consulta cerrada por fecha que no la tiene; si falla, devuelven `acta: null` y escriben en el log. `VistaConsulta.acta` y `ResumenConsulta.cerradaAt`. La fuente del navegador arma el acta al vuelo, marcada como no registrada. Tests con PGlite: cierre a mano con acta en la misma transacción (si el insert del acta falla, la consulta no queda cerrada), cierre por fecha con dos lecturas a la vez (una sola fila), acta igual después de cambiar `MOTOR_VERSION`. Verificar con `pnpm test lib/fogon`.

## 3. Pantallas

- [ ] 3.1 Detalle cerrado: "Acta", "Registrada el …", "El acta todavía no está registrada" cuando corresponde, botón "Copiar el acta" con anuncio y campo de solo lectura si el portapapeles falla. Sección "Actas de consultas" en `/fogon` con sus tres estados (lista, vacía, error). Verificar con `pnpm verificar` y el e2e de 4.1.

## 4. Pruebas

- [ ] 4.1 `e2e/fogon-actas.spec.ts` (PGlite + modo de prueba): el super admin cierra una consulta a mano y la persona del padrón ve "Registrada el …"; una consulta con cierre en el pasado registra su acta al abrirla; "Copiar el acta" copia el texto sin nombres (permiso de portapapeles en el contexto de Playwright) y otro caso con el portapapeles bloqueado muestra el campo; `/fogon` lista las actas del padrón y no las ajenas; error de lectura sin lista vacía (interceptando la ruta); teclado y 390 px. Sumar `/fogon` con actas y el detalle cerrado a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-actas.spec.ts e2e/accesibilidad.spec.ts`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; probar la migración contra la rama de Neon del preview (`BASE_URL=<preview> pnpm test:e2e e2e/fogon-preview.spec.ts` con un caso de acta). PR a `dev` con `scripts/pr.sh`. Verificar con los comandos y con el número de PR que devuelve `scripts/pr.sh numero`.
