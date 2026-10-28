## 0. Antes de empezar

- [ ] 0.1 Comprobar en `dev`: (a) que `tribu-necesidades` está mergeado (`lib/tribus/necesidades.ts` existe); si no, frenar y reportar. (b) Si ya existe `lib/pactos/constancias.ts` (`pactos-dos-partes` implementado), frenar y reportar: las respuestas de la tribu tienen que ir por su flujo y esta spec se ajusta antes. (c) Si existe `lib/evaluacion/constancias.ts`, reusar su tipo de constancia base (design §3). Verificar con `ls lib/tribus lib/pactos lib/evaluacion`.

## 1. Lógica pura

- [ ] 1.1 `lib/pactos/formatos.ts` con `formatosDe` y `aceptaFormato`. Tests: Valle Solar fijo y puntual; Barda Productiva solo fijo; Lighthouse solo fijo; comunidad desconocida solo fijo. Verificar con `pnpm test lib/pactos`.
- [ ] 1.2 `lib/pactos/mes.ts` con `mesDe(ahora)` en hora de Argentina (design §3) y `lib/pactos/constancia-base.ts`: `constanciaBasePuntual` y `leerConstanciaBase`. Tests: `mesDe("2026-12-01T01:30:00Z")` → `2026-11`; uid con prefijo `ejemplo-`; 10 h → 50 Semillas y período `2026-11`; 12 h → 60; <!-- arquitecto: período en hora local y uid de ejemplo --> sin email ni nombre en `JSON.stringify`; una constancia guardada no cambia si cambia `HOUR_REF_USD` (mock del módulo); mal formada → null. Verificar con `pnpm test lib/pactos`.
- [ ] 1.3 `lib/pactos/estado.ts`: `puntuales` por comunidad, `HORAS_PUNTUAL`, acciones del design §2, `puntualCompleto` y lectura. Tests: nace desde la necesidad con horas/fecha nulas cuando faltan; no duplica la misma necesidad; no se envía incompleto; retirar vuelve a borrador con el contenido; marcar hecha con horas reales; confirmar crea la constancia; pedir revisar vuelve a aceptado sin constancia; lo guardado sin `puntuales` se lee igual; puntual roto se corrige según el design; `pactosAceptados` no cuenta puntuales; cada acción fuera de su paso devuelve el mismo estado; confirmar dos veces deja una sola constancia con el `creada_en` de la primera. Verificar con `pnpm test lib/pactos`. <!-- arquitecto: idempotencia de las respuestas -->
- [ ] 1.4 `lib/semillas/estado.ts`: parte `puntual` y `constancias`. Tests: con una constancia de 50, `puntual` 50 y total 50 sin pacto fijo; sin constancias, `puntual` null; `pactoAceptado` false con solo puntuales. Verificar con `pnpm test lib/semillas`.

## 2. Pantallas y textos

- [ ] 2.1 Textos es/en (pactos, semillas, tribus) y `pactopuntual` en `lib/legal/terminos.ts` con `borrador: true` y `en`. Verificar con `pnpm verificar` (tests de diccionarios y de términos).
- [ ] 2.2 `app/pactos/pactos-cliente.tsx`: parámetro `necesidad` procesado una vez y solo después de leer la membresía (design §4) <!-- arquitecto -->, sección "Pactos puntuales", pasos, campos, botones simulados agrupados, avisos en región `aria-live`, ⚖. Eventos de `lib/actividad/eventos.ts`. Verificar a mano en `pnpm dev` con `/pactos?comunidad=valle&necesidad=valle-solar` siendo miembro de Valle Solar.
- [ ] 2.3 `app/tribus/[id]/`: componente cliente con el estado propio de la necesidad y "Ofrecer tomarla" / "no toma pactos puntuales". Verificar a mano en `/tribus/valle` y `/tribus/barda`.
- [ ] 2.4 `app/semillas/semillas-cliente.tsx`: parte "Pactos puntuales" y lista de constancias. Verificar a mano en `/semillas` después de confirmar horas.
- [ ] 2.5 e2e `e2e/pacto-puntual.spec.ts` con los escenarios de la spec: ofrecer desde `/tribus/valle`, borrador prefijado, horas vacías en `valle-eventos`, necesidad que no se puede tomar, quien no es miembro no deja ningún puntual guardado <!-- arquitecto -->, no duplicar, enviar incompleto, retirar, aceptar, marcar hecha con 12 h, pedir revisar, confirmar 10 h → 50 Semillas, "Tomada por vos" / "Hecha por vos" en la ficha, Barda sin botón, evento en Mi recorrido, ⚖ con teclado, inglés, y axe en `/pactos` y `/semillas`. Verificar con `pnpm test:e2e e2e/pacto-puntual.spec.ts`.
- [ ] 2.6 Comprobar que "Mis datos" descarga los puntuales (misma clave de pactos) y que "Borrar datos de la demo" los borra. Verificar con el test de `lib/demo` o `lib/privacidad` que ya recorre las claves (`pnpm test lib/demo lib/privacidad`).

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde; `pnpm test:e2e e2e/pactos.spec.ts` sigue en verde (el pacto fijo no cambia). PR desde `agente/pacto-puntual` hacia `dev` con guion de prueba: sumarse a Valle Solar → `/tribus/valle` → "Energía solar" → "Ofrecer tomarla" → completar y enviar → simular aceptación → ver "Tomada por vos" → marcar hecha → confirmar → ver 50 Semillas y la constancia en `/semillas` → Mi recorrido.
