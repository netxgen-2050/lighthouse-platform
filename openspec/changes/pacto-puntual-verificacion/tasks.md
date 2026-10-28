## 0. Antes de empezar

- [ ] 0.1 Comprobar en `dev` que `pacto-puntual` está mergeado (`lib/pactos/postulacion.ts` existe y `PasoPuntual` tiene `preadmitido`). Si no, frenar y reportar. Si existe `lib/evaluacion/constancias.ts`, reusar su tipo de constancia base (design §3). Verificar con `ls lib/pactos lib/evaluacion`.

## 1. Lógica pura

- [ ] 1.1 `lib/pactos/constancias.ts` (design §1): esquemas `pacto-propone-horas` y `pacto-confirma-horas`, `horasPendientes`, una respuesta por propuesta de horas, lectura. Tests: la propuesta de horas apunta a la postulación pre-admitida; la confirmación afirma el holón y copia las horas; nadie confirma sus propias horas; `proponeLider` la confirma el super admin; una segunda respuesta se rechaza; `mes` inválido o horas fuera de 1..200 se ignoran al leer. Verificar con `pnpm test lib/pactos`.
- [ ] 1.2 `lib/pactos/mes.ts` con `mesDe` en hora de Argentina y `lib/pactos/constancia-base.ts` (design §3). Tests: `mesDe("2026-12-01T01:30:00Z")` → `2026-11`; uid con prefijo `ejemplo-`; 10 h → 50 Semillas y período `2026-11`; 12 h → 60; `creada_en` y `periodo` salen del `cuando` de la verificación; `datos.confirmacion` es el id de la verificación; sin email ni nombre en `JSON.stringify`; una constancia guardada no cambia si cambia `HOUR_REF_USD` (mock del módulo); mal formada → null. Verificar con `pnpm test lib/pactos`.
- [ ] 1.3 `lib/pactos/estado.ts` (design §2): pasos `hecha` y `verificado`, `marcarHecha`, `retirarHecha`, `verificarHoras` y `pedirRevisarHoras` solo por conciliación, lectura. Tests: marcar hecha con 12 h; retirar vuelve a pre-admitido; verificar crea la constancia con las horas de la confirmación; pedir revisar vuelve a pre-admitido sin constancia; conciliar dos veces deja una constancia y un evento; cada acción fuera de su paso devuelve el mismo estado; `hecha` sin horas y `verificado` sin constancia se corrigen al leer. Verificar con `pnpm test lib/pactos`.
- [ ] 1.4 `lib/semillas/estado.ts` (design §5): parte `puntual` y `constancias`. Tests: con una constancia de 50, `puntual` 50 y total 50 sin pacto recurrente; sin constancias, `puntual` null; `pactoAceptado` false con solo puntuales. Verificar con `pnpm test lib/semillas`.

## 2. Pantallas y textos

- [ ] 2.1 Textos es/en (pactos, semillas, tribus) y eventos `marcasteHecha`, `horasVerificadas` y `horasARevisar` en `lib/actividad/eventos.ts`. Verificar con `pnpm verificar`.
- [ ] 2.2 `app/pactos/pactos-cliente.tsx` y `app/pactos/responder/` (design §4): horas reales, "Marcar hecha", "Retirar", sección "Tareas para verificar" con "Verificar" y "Pedir revisar", re-chequeo antes de escribir, avisos en `aria-live`. Verificar a mano en `pnpm dev` como `persona@prueba.test` y `admin@prueba.test`.
- [ ] 2.3 `app/semillas/semillas-cliente.tsx` y `app/tribus/[id]/` (design §4 y §5): parte "Pactos puntuales: horas verificadas", lista de constancias, rótulo del pacto fijo, estados "Hecha". Verificar a mano en `/semillas` y `/tribus/valle` después de verificar.
- [ ] 2.4 e2e `e2e/pacto-puntual-verificacion.spec.ts` con dos personas, fijando el reloj con `page.clock` (noviembre de 2026 y el 30-nov a las 22:30 de Argentina): marcar hecha con 12 h, horas fuera de rango, verificar 10 h → 50 Semillas y período 2026-11, fin de mes, pedir revisar, sus propias horas, doble respuesta, "Hecha por vos" y "Hecha", Semillas sin ronda, evento una sola vez, inglés, y axe en `/pactos`, `/pactos/responder` y `/semillas`. Verificar con `pnpm test:e2e e2e/pacto-puntual-verificacion.spec.ts`.
- [ ] 2.5 Comprobar que "Mis datos" descarga los puntuales con sus constancias y que "Borrar datos de la demo" los borra. Verificar con `pnpm test lib/demo lib/privacidad`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde; `pnpm test:e2e e2e/pactos.spec.ts e2e/pacto-puntual.spec.ts` sigue en verde. PR desde `agente/pacto-puntual-verificacion` hacia `dev` con guion de prueba: postulación pre-admitida de `persona@prueba.test` en "Energía solar" → marcar hecha con 10 h → entrar como `admin@prueba.test` → `/pactos/responder` → verificar → volver como la persona → 50 Semillas y la constancia en `/semillas` → "Hecha por vos" en `/tribus/valle` → Mi recorrido.
