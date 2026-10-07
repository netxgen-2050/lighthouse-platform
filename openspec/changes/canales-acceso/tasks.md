## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `servicio-permisos` (`lib/permisos/`), `sumarte-planes` (`app/sumarte/`, `lib/sumarte/estado.ts`) y `panel-recorrido` (`lib/demo/claves.ts`) están en `main`. Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls lib/permisos lib/sumarte lib/demo`.

## 1. Lógica

- [ ] 1.1 Mover la clave de `localStorage` de Sumarte a `lib/demo/claves.ts` como `CLAVES.sumarte` **con el mismo valor** (`"lh-sumarte"`) y usarla desde `app/sumarte/sumarte-cliente.tsx`. Verificar con `pnpm test` (incluido `lib/demo/claves.test.ts`) y que en `pnpm dev` lo elegido antes en `/sumarte` sigue apareciendo.
- [ ] 1.2 Crear `lib/canales/` con: los nombres en lenguaje simple de las 9 puertas; `personaDesdeSumarte(estado)` (plan y pase de Sumarte; sin tribus, sin presencia, no residente); `filasDePuertas(persona)` que usa `calcularPermisos` y `puede` y devuelve, por puerta, estado en texto, motivos en texto y, si está cerrada, "Se abre con: …" derivado de las columnas no vacías de `lib/permisos/tabla.ts`; para la sala y la voz de tribu, una fila por tribu aceptada y una para "otras tribus". Verificar con tests de Vitest que cubren todos los escenarios de la spec (mínima, Brote, dos motivos, cerrada con pista, tribu aceptada, refuerzo "a decidir" sin número, residente).

## 2. Página

- [ ] 2.1 Crear `app/canales/page.tsx` (servidor: título, explicación, aviso de modo demostración) y un componente cliente que lee `CLAVES.sumarte` con `leer()`, muestra "Tu situación" y la lista de puertas (lista o tabla semántica, estado en texto, ⚖ existentes: `pasefundador`, `presencia`, `guardian`, `creditos`). Sin `<main>` propio, solo tokens. Verificar en `pnpm dev` recorriendo `/canales` solo con teclado.
- [ ] 2.2 Agregar "Probá otra situación" (plan, pase, una tribu aceptada entre las tribus no vacantes, presencia Genesis, residente) con estado en memoria y el botón "Volver a mi situación". Las puertas se actualizan en una región `aria-live="polite"`. Verificar en `pnpm dev` que marcar "Residente" abre el voto y que recargar lo deshace.
- [ ] 2.3 Agregar en `/sumarte`, debajo de la tabla de planes, el enlace "Ver qué te abre cada plan" → `/canales`. Verificar que `e2e/sumarte.spec.ts` (si existe) sigue en verde.

## 3. Tests

- [ ] 3.1 Escribir `e2e/canales.spec.ts` con los escenarios de la spec: estado inicial (2 abiertas); activar Brote en `/sumarte` y ver el canal de fundadores abierto en `/canales`; ticket registrado en `/congreso` sin motivo "por tu presencia"; 9 filas; simulador (tribu Valle Solar, Raíz + presencia sin "×", residente y recarga); enlace desde `/sumarte`; un solo `main`. Verificar con `pnpm test:e2e e2e/canales.spec.ts`.
- [ ] 3.2 Sumar `/canales` a `e2e/accesibilidad.spec.ts`. Verificar sin violaciones `serious` ni `critical`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/canales-acceso` con guion de prueba (Sumarte → activar Pase Brote → "Ver qué te abre cada plan" → simulador) y captura. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/canales-acceso> pnpm test:e2e e2e/canales.spec.ts`.
