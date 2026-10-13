## 0. Prerrequisitos

- [ ] 0.1 Confirmar que están en `main`: `login-privy` (claves con prefijo por persona), `lib/sumarte/`, `lib/semillas/estado.ts` (`semillasDeComunidad`), `lib/congreso/ticket.ts` y `lib/canales/puertas.ts` (`filasDePuertas`, `personaDesdeSumarte`). Si falta algo, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls lib/sumarte lib/semillas lib/congreso lib/canales`.

## 1. Lógica

- [ ] 1.1 Crear `lib/mi-raiz/estado.ts` con `armarMiRaiz(leer: (clave: string) => string | null)` que devuelve las cinco tarjetas (pase, créditos, presencia, Semillas por comunidad y las tres filas de voz). Verificar con Vitest: con Pase Brote da créditos 450 y "Voz en el Fondo Común" abierta; sin pase, créditos sin monto; ticket válido e inválido; pacto sin aceptar da "sin dato"; sin pactos da lista vacía; `lh-sumarte` con JSON roto se trata como sin pase. Correr `pnpm test`.
- [ ] 1.2 Agregar `miraiz` a `lib/legal/terminos.ts` con `borrador: true` y el comentario de texto nuevo (texto sugerido: "Mi Raíz junta lo que tenés en la red: tu pase, tus créditos, tu presencia, tus Semillas y tu voz. No es una cuenta de plata ni una inversión: nada de esto se compra, se vende ni se transfiere, y no da tierra, lotes ni rendimiento."). Sumar `{ href: "/mi-raiz", etiqueta: "Mi Raíz", icono: Wallet, grupo: "persona", existe: true }` a `lib/navegacion.ts`. Verificar con `pnpm test` (catálogo legal y test de navegación contra el disco, que pasa cuando exista la página de 2.1).

## 2. Pantalla

- [ ] 2.1 Crear `app/mi-raiz/page.tsx` y su componente cliente que lee el navegador con las claves de `CLAVES` y pinta las tarjetas con `TerminoLegal`, `TerminoEconomico` y la moneda de la configuración. Verificar en `pnpm dev`: sin datos; con Pase Brote; con ticket; con un pacto; cambiando la moneda.

## 3. Tests

- [ ] 3.1 Crear `e2e/mi-raiz.spec.ts`: entrar desde el menú de la persona; sin datos (sin pase, sin ticket, sin Semillas, voz cerrada); activar Pase Brote en `/sumarte` y verlo en `/mi-raiz` con créditos y voz en el Fondo Común; ticket registrado; `lh-sumarte` roto; la página no tiene botones que cambien datos. Verificar con `pnpm test:e2e e2e/mi-raiz.spec.ts`.
- [ ] 3.2 Sumar `/mi-raiz` con y sin pase a `e2e/accesibilidad.spec.ts`. Verificar sin violaciones `serious` ni `critical` con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/mi-raiz` con guion de prueba (menú → "Mi Raíz" vacía → `/sumarte` activar Pase Brote → `/congreso` registrar ticket → volver a `/mi-raiz` y ver pase, créditos, presencia y voz). Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/mi-raiz> pnpm test:e2e e2e/mi-raiz.spec.ts`.
