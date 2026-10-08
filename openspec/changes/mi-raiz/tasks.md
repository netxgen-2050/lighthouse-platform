# Tasks

## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `congreso-checkin-genesis` (`lib/congreso/presencia.ts`, `personaReal` en `lib/canales/`), `canales-acceso`, `semillas-libro` (`lib/semillas/`) y `sumarte-planes` están en `main`. Si falta alguno, frenar y reportar. Verificar con `ls lib/congreso lib/canales lib/semillas lib/sumarte` y `grep -rn "personaReal" lib/canales`.

## 1. Lógica

- [ ] 1.1 Agregar `miraiz` a `lib/legal/terminos.ts` con el texto de design.md (decisión 6) y `borrador: true`. Verificar con `pnpm test` y un caso en `lib/legal/terminos.test.ts` que pida que sea borrador.
- [ ] 1.2 Crear `lib/mi-raiz/resumen.ts` con `resumirRaiz(leer)` (design.md decisiones 1 a 3) y `lib/mi-raiz/resumen.test.ts`: sin datos (Explorador, sin Pase, créditos null, sin ticket, Semillas null, tres filas de voz cerradas); Pase Brote (Miembro, créditos 450); Pase Raíz con ticket y 1 día (voz en el Fondo Común "Abierta · 1 voz" con refuerzo "a decidir" y sin "×"); pacto de tiempo aceptado (Semillas igual a `semillasTiempo` con `FACTOR_EVALUACION`). Verificar con `pnpm test`.

## 2. Página y navegación

- [ ] 2.1 Crear `app/mi-raiz/page.tsx` (título, ⚖ `miraiz`, aviso "Prototipo interno · datos de ejemplo", aviso de "no es una cuenta de plata") y `app/mi-raiz/mi-raiz-cliente.tsx` con los cinco bloques, sus ⚖ (`pasefundador`, `creditos`, `presencia`, `semillas`, `guardian`), los enlaces de la spec y "sin dato" donde corresponde; sin `<main>` propio, solo tokens. Verificar en `pnpm dev` recorriendo la página solo con teclado, sin datos y después de activar un Pase y hacer un check-in.
- [ ] 2.2 Agregar "Mi Raíz" a `DESTINOS` en `lib/navegacion.ts` entre Sumarte y Mi recorrido, y el enlace "Ver Mi Raíz" en `app/panel/`. Verificar con `pnpm test` (`lib/navegacion.test.ts`) y en `pnpm dev` que el ítem del rail marca la página actual.
- [ ] 2.3 Escribir `e2e/mi-raiz.spec.ts` con los escenarios de la spec: estructura y enlaces; sin datos (Explorador, "Sin Pase Fundador", "Los créditos vienen con el Pase Fundador", sin "USD 0", Semillas "sin dato", voz cerrada); Pase Raíz sembrado en `localStorage` ("USD 1.500 en 3 años", "Disponible hoy: sin dato"); ticket + 2 días ("Genesis · 2 de 5 días"); ticket sin días ("Genesis pendiente"); Semillas iguales a las de `/semillas` con un pacto sembrado; rail y enlace desde `/panel`; un solo `main`. Sumar `/mi-raiz` (vacía y con Pase + Genesis) a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/mi-raiz.spec.ts e2e/accesibilidad.spec.ts`.

## 3. Integración

- [ ] 3.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/mi-raiz` con guion de prueba (Sumarte → Pase Raíz → Congreso → ticket y check-in → Mi Raíz) y capturas sin datos y con datos. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/mi-raiz> pnpm test:e2e e2e/mi-raiz.spec.ts`.
