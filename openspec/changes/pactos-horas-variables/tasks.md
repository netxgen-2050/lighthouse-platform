## 0. Antes de empezar

- [ ] 0.1 Ver si existe `lib/pactos/formatos.ts` en `dev` (de `pacto-puntual`). Si no existe, crearlo como dice el design §1. Si ya existe `lib/pactos/constancias.ts` (`pactos-dos-partes` implementado), frenar y reportar: la aceptación del rango tiene que ir por ese flujo. Verificar con `ls lib/pactos`.

## 1. Lógica pura

- [ ] 1.1 `lib/pactos/formatos.ts` con "variable" y los datos de ejemplo. Tests: Valle Solar y Lighthouse aceptan variable; Monte Nuevo y Barda Productiva no. Verificar con `pnpm test lib/pactos`.
- [ ] 1.2 `lib/pactos/estado.ts` y `lib/pactos/datos.ts`: `modalidad`, `rango`, `RANGO_VARIABLE`, `declaradas`, acción `declarar`, `pactoCompleto` con rango, cambio e historial con modalidad, lectura. Tests: rango al revés no se envía; declarar dentro del rango sin crear cambio; fuera del rango no se guarda; corregir el mes en curso; no declarar un mes pasado ni futuro; declarar 0 queda como dato; cambio de fija a variable aceptado → versión 2 con historial; las declaraciones sobreviven al cambio; lo guardado sin modalidad se lee como fija; declaraciones rotas se descartan. Verificar con `pnpm test lib/pactos`.
- [ ] 1.3 `lib/semillas/calculo.ts` y `lib/semillas/estado.ts`: `semillasVariables` y su uso. Tests: octubre sin dato, noviembre 24 h → 121, diciembre 10 h → 50, total 171; sin declaraciones → tiempo null y `pactoAceptado` true; pacto fijo igual que antes. Verificar con `pnpm test lib/semillas`.
- [ ] 1.4 `textoHorasDelPacto` en `lib/pactos/` y su uso en Perfil, panel y Mi recorrido. Test del helper en los dos idiomas. Verificar con `pnpm test lib/pactos lib/panel`.

## 2. Pantallas y textos

- [ ] 2.1 Textos es/en (pactos, semillas, perfil) y evento `declarasteHoras` en `lib/actividad/eventos.ts`. Verificar con `pnpm verificar`.
- [ ] 2.2 `app/pactos/pactos-cliente.tsx`: modalidad, rango, bloque del mes en curso y meses anteriores, mensajes en `aria-live`. `app/semillas/semillas-cliente.tsx`: los tres meses. Verificar a mano en `pnpm dev` con un pacto variable en Valle Solar y con Monte Nuevo (sin la opción).
- [ ] 2.3 e2e `e2e/pactos-horas-variables.spec.ts` con los escenarios de la spec, fijando el reloj con `page.clock` (noviembre y diciembre de 2026): rango, rango al revés, declarar, fuera del rango, mes pasado, cambio de fija a variable, Semillas 171, sin declarar, Perfil, evento sin duplicar, Monte Nuevo sin opción, inglés y axe en `/pactos` y `/semillas`. Verificar con `pnpm test:e2e e2e/pactos-horas-variables.spec.ts`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde; `pnpm test:e2e e2e/pactos.spec.ts` sigue en verde. PR desde `agente/pactos-horas-variables` hacia `dev` con guion de prueba: sumarse a Valle Solar → pacto "Horas variables" de 0 a 30 h → simular aceptación → declarar 24 h → intentar 40 h → `/semillas` → proponer pasar a fijo → historial.
