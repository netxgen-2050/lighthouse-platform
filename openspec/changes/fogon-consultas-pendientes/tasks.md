# Tasks

Rama `agente/fogon-consultas-pendientes` desde `dev`, **después** de que `fogon-cuadratico` esté en `dev`. Si no está, frenar y reportar. Sin tablas, migraciones ni rutas nuevas: si hace falta alguna, frenar y reportar.

## 1. Cálculo

- [ ] 1.1 `lib/fogon/consultas/pendientes.ts`: función pura `consultasPorRepartir(resumenes, ahora)` que filtra abiertas sin reparto con al menos un voto, ordena por cierre y arma "Cierra hoy" / "Cierra mañana" / "Cierra el <fecha>" en la zona horaria de Argentina; y `textoAviso(n)` ("Tenés 1 consulta por repartir" / "Tenés N consultas por repartir"). Tests: cerrada que no aparece, reparto en cero que sigue pendiente, orden, hoy, mañana, otra fecha y cambio de día a medianoche en Argentina. Verificar con `pnpm test lib/fogon`.
- [ ] 1.2 Hook `usarConsultasPendientes()` que lee `listar()` del repositorio al montar y en `visibilitychange` (cuando vuelve a estar visible) y devuelve `{ estado: "ok", lista } | { estado: "error" } | { estado: "sin-sesion" }`. Verificar con `pnpm verificar`.

## 2. Pantallas

- [ ] 2.1 `components/aviso-consultas.tsx` arriba de `/fogon` y `/fogon/consultas`: texto, enlaces y cierre; mensaje de error sin número; nada si no hay pendientes o sin sesión. Verificar con el e2e de 3.1.
- [ ] 2.2 Campanita (`components/campanita.tsx`) y `/bandeja`: suma al número y al nombre accesible (`nombreCampanita`), grupo "Consultas por repartir" primero en la bandeja, que no se marca como leído; mensaje de error en la bandeja. Tests unitarios de la suma y del nombre accesible. Verificar con `pnpm test lib/actividad` y el e2e de 3.1.
- [ ] 2.3 Tipo de aviso "Consultas del Fogón" en `lib/configuracion/preferencias.ts` (prendido por defecto; las preferencias guardadas sin ese campo lo leen como prendido) y su casilla en `/configuracion`. Test de lectura de preferencias viejas. Verificar con `pnpm test lib/configuracion`.
- [ ] 2.4 Paso "Repartí tus votos" en `lib/panel/proximo-paso.ts`, primero en el orden, con título, cierre y enlace de la consulta que cierra primero; sin cambios si no hay pendientes o si la lectura falló. Tests del orden. Verificar con `pnpm test lib/panel`.

## 3. Pruebas

- [ ] 3.1 `e2e/fogon-pendientes.spec.ts`: con la fuente del navegador de `fogon-cuadratico` (y, si `fogon-cuadratico-en-la-base` ya está en `dev`, con PGlite y el modo de prueba): aviso con dos consultas en orden; repartir en una baja el número en el Fogón, la campanita y la bandeja; reparto en cero no cuenta; "Marcar todo como leído" no borra el grupo; preferencia apagada; Mi recorrido muestra "Repartí tus votos"; error de lectura sin "0" (interceptando la ruta); todo con teclado y sin scroll horizontal a 390 px. Sumar `/fogon` y `/bandeja` con pendientes a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-pendientes.spec.ts e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR a `dev` con `scripts/pr.sh`. Verificar con los dos comandos y con el número de PR que devuelve `scripts/pr.sh numero`.
