## 1. Constancias y registro compartido

- [ ] 1.1 `lib/pactos/constancias.ts`: tipo `ConstanciaPacto` y funciones puras `agregar`, `revocar`, `estaRevocada`, `pendientes`, `respuestaDe`, `puedeResponder`, `leerConstancias` (design §1). Tests de Vitest: una propuesta sin respuesta está pendiente; aceptada o no aceptada deja de estarlo; revocada deja de estarlo y la propuesta sigue en la lista; no se puede revocar dos veces ni revocar un `revoca`; `puedeResponder` es falso para la propia persona, para quien lidera otra tribu y para una persona común, y verdadero para quien lidera esa tribu y para el super admin en `lighthouse`; una entrada mal formada se ignora y el resto se lee. Verificar con `pnpm test lib/pactos`.
- [ ] 1.2 `lib/demo/claves.ts`: `CLAVES_COMPARTIDAS.pactosConstancias = "compartido:pactos-constancias"` (sin prefijo). `lib/pactos/registro-compartido.ts`: leer (null si el navegador no deja) y agregar releyendo antes de escribir. Tests: la clave no lleva el prefijo de la persona con una persona en sesión; agregar con lo guardado roto no pierde la constancia nueva. Verificar con `pnpm test lib/demo lib/pactos`.

## 2. Estado de la persona y conciliación

- [ ] 2.1 `lib/pactos/estado.ts`: `conciliar(estado, constancias, idPersona)` (design §4), campo `ultimaRespuesta` (leído con validación, como el resto) y helper `leerPactosConciliados`. Tests: aceptación de un pacto nuevo → paso 2, versión 1, historial con la fecha de la constancia; aceptación de un cambio → versión 2; no aceptación de un pacto nuevo → paso 0 con el contenido intacto y el motivo; no aceptación de un cambio → sigue la vigente; una aceptación con `por` igual a la persona del pacto se ignora; conciliar dos veces da lo mismo; sin registro (null) no cambia nada; `pactosAceptados` refleja lo conciliado. Verificar con `pnpm test lib/pactos lib/semillas`.
- [ ] 2.2 Lectores: `lib/semillas/estado.ts`, `app/semillas/semillas-cliente.tsx`, `app/perfil/perfil-cliente.tsx` y `lib/panel/proximo-paso.ts` leen con `leerPactosConciliados` (en memoria, sin guardar). Tests de `lib/panel` y `lib/semillas`: un pacto en paso 1 con aceptación en el registro cuenta como aceptado. Verificar con `pnpm test lib/panel lib/semillas`.
- [ ] 2.3 Descargar y borrar (design §7): `quitarConstanciasDe(idPersona)` en `lib/pactos/registro-compartido.ts`, llamada desde `app/mis-datos/mis-datos-cliente.tsx` al retirar el consentimiento; `lib/privacidad/exportar.ts` suma `pactosConstancias`. Tests con dos personas: borrar saca solo las de una; la descarga trae solo las suyas y `null` si el registro no se puede leer. Verificar con `pnpm test lib/pactos lib/privacidad` y `pnpm test:e2e e2e/privacidad.spec.ts`.

## 3. Pantalla de la persona (`/pactos`)

- [ ] 3.1 `app/pactos/pactos-cliente.tsx`: al enviar (pacto o cambio) escribe la propuesta; "Retirar y editar" (pacto y cambio enviado) revoca la propuesta si sigue pendiente; se quitan los tres botones "Simular…"; con algo enviado muestra "Esperando la respuesta de <comunidad>"; al cargar concilia, guarda, anuncia y registra los eventos una sola vez (clave por propuesta); muestra el aviso con el motivo de la no aceptación; el estado "Aceptado" lleva el ⚖ `pactoDosPartes`. Pacto en paso 1 sin propuesta en el registro → se publica (design §8). Verificar con `pnpm test:e2e e2e/pactos.spec.ts`.
- [ ] 3.2 `lib/actividad/eventos.ts`: `pactoNoAceptado`; los eventos de aceptación y de cambio pasan a dispararse desde la conciliación. Test de Vitest del texto en es/en. Verificar con `pnpm test lib/actividad`.

## 4. Pantalla de la tribu

- [ ] 4.1 `app/pactos/responder/page.tsx` y su cliente (design §6): lista de pendientes por comunidad que la sesión puede responder, "Aceptar", "No aceptar" con motivo obligatorio (hasta 500 caracteres), re-chequeo de "sigue pendiente" antes de escribir, anuncio del resultado con foco, "Es tu propio pacto…" sin botones, "No tenés pactos para responder" sin permiso, "fecha sin dato". Verificar con `pnpm test:e2e e2e/pactos-dos-partes.spec.ts`.
- [ ] 4.2 `app/tribus/[id]/page.tsx`: "Pactos para responder (N)" para quien lidera esa tribu, con enlace; "(sin dato)" si el registro no se puede leer. Verificar con `pnpm test:e2e e2e/pactos-dos-partes.spec.ts`.

## 5. Textos y legal

- [ ] 5.1 `lib/idioma/textos/pactos.ts`: textos nuevos en es y en (esperando respuesta, aviso de no aceptación con motivo, vista de la tribu, errores, anuncios); se quitan los de los botones simulados que ya no se usan. `lib/legal/terminos.ts`: `pactoDosPartes` ("Pacto aceptado por las dos partes": un acuerdo social entre la persona y su tribu, registrado en la plataforma; no es un contrato de trabajo ni de inversión, y cada tribu lo revisa según su estatuto), con `en` y `borrador: true`. Verificar con `pnpm test lib/idioma lib/legal` (los tests que comparan claves es/en y los ⚖ en borrador).

## 6. e2e y accesibilidad

- [ ] 6.1 `e2e/pactos-dos-partes.spec.ts` (nuevo), cambiando de persona en el mismo contexto (cookie de prueba + recarga): `persona@prueba.test` envía 10 h/mes a Valle Solar → `admin@prueba.test` lo ve y lo acepta → la persona ve versión 1, Semillas con 10 h/mes y el evento en `/panel`; un cambio a 20 h/mes no aceptado con motivo → sigue versión 1 y se ve el motivo; retirar saca el pendiente de la tribu; motivo vacío no registra; otra persona común no ve nada; el líder no puede responder su propio pacto; "Pactos para responder (N)" en `/tribus/valle`; en inglés. Verificar con `pnpm test:e2e e2e/pactos-dos-partes.spec.ts`.
- [ ] 6.2 Adaptar los e2e que apretaban "Simular…" (`e2e/pactos.spec.ts`, `e2e/bandeja.spec.ts`, `e2e/accesibilidad.spec.ts`) con un ayudante en `e2e/ayudas.ts` que siembra la aceptación de la tribu en `compartido:pactos-constancias` y recarga (documentado como siembra de test). Agregar `/pactos/responder` con un pendiente a la auditoría de axe. Verificar con `pnpm test:e2e e2e/pactos.spec.ts e2e/bandeja.spec.ts e2e/accesibilidad.spec.ts`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde. PR desde `agente/pactos-dos-partes` hacia `dev` con guion de prueba: entrar como `persona@prueba.test` → pedir membresía y ser miembro de Valle Solar → enviar pacto → "Entrar como…" `admin@prueba.test` → `/tribus/valle` → "Pactos para responder (1)" → aceptar → volver como persona → ver "Aceptado", versión 1, Semillas y Mi recorrido; repetir con un cambio no aceptado.
