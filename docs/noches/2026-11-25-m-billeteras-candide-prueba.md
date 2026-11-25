# Noche 2026-11-25-m — billeteras-candide-prueba
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/219 · **Preview:** no existe (Vercel dio `failure` en el último commit; ver más abajo)

## En una línea
El código de la prueba de billeteras con Candide (Base Sepolia) está hecho y pasa en local, pero **no hay preview, el adaptador real de Candide nunca se probó y la última corrección no la revisó nadie**; hay cuatro cosas que tenés que decidir vos.

## Qué falló o quedó sin hacer (primero lo malo)
- **No hay preview de Vercel.** El tester esperó 15 minutos y no apareció. Vercel marca `failure` en el commit 257c454. El revisor vio que también falla en 72c7ead (la base, que solo tiene archivos de openspec), así que probablemente no viene de este PR. Nadie miró el log.
- **Tarea 8.2 abierta** (`pnpm test:e2e` completo en verde). El servidor de Playwright no arrancó en las rondas del implementador por `next/font/google` sin red. El tester sí corrió la suite completa en local: 1381 pasaron, 2 fallaron, 3 omitidas (detalle abajo).
- **Nadie probó contra Candide de verdad.** No hay claves cargadas. El adaptador real se probó solo con respuestas armadas a mano.
- **La corrección 2 (commit 257c454) no tuvo revisión.** Se llegó al tope de dos vueltas. El tester la corrió y pasó, pero el revisor no la leyó.
- `pnpm build` suelto falla en el entorno del tester por `next/font/google` sin red. Con la red del implementador pasó.

## Qué quedó hecho (tareas 23/24)
Todas las tareas de `tasks.md` están marcadas salvo la 8.2.
- Pasos 1 a 4 de ADR-011 (imprescindibles) y paso 5 / grupo 7 de ADR-012 (deseable): passkey, dirección de la Safe, primera operación con gas patrocinado, firma EIP-1271 fuera de la cadena.
- Página `/netx/billetera-prueba` y seis rutas `/api/netx/billetera-prueba/…`. Sin `LH_PRUEBA_CANDIDE=1` todo responde 404. Solo super admin. No hay enlace desde el menú.
- Puerto de Candide con mock y adaptador real. Dependencias fijas: abstractionkit 2.1.0 y viem 2.56.5. Nada se guarda en la base.
- Guion de prueba manual: `docs/guiones/billeteras-candide-prueba.md`.
- Cumple tus decisiones del 25-nov: Base Sepolia; Production solo con la variable (nadie la cargó); abstractionkit 2.1.0.
- Aviso: el texto del PR quedó desactualizado. Dice viem 2.58.6 (después se fijó 2.56.5, el que ya usan Privy y wagmi) y e2e 3/3 (ahora son 7/7).

## Qué decidir a la mañana
1. **Política de gas (decisión tuya).** La spec y design §4 dicen "solo attest y register, como mucho dos llamadas". Pero abstractionkit antepone solas, en la primera operación, otras dos llamadas: desplegar el verificador WebAuthn y cambiar el dueño de la Safe (`swapOwner`). Sin ellas la Safe queda con el firmante compartido como dueño. La política del código las acepta solo si coinciden byte a byte, al principio y con nonce 0. **Acción sugerida (recomendación del revisor):** aceptar la excepción y actualizar `spec.md` y design §4 para que lo digan. Si no, hay que rechazar el desvío y buscar otra forma de crear la cuenta.
2. **Heurística de errores EIP-1271 (decisión tuya).** Para distinguir "firma rechazada" de "la Safe no responde EIP-1271" se mira el texto del revert (con código GS0xx de Safe es rechazada). Está endurecida y con tests, pero sigue siendo por texto. **Acción sugerida:** dejarla así para la prueba y confirmarla con la corrida real; anotar en el guion qué mensaje devolvió Candide.
3. **Vercel en `failure`.** **Acción sugerida:** abrir el log en Vercel antes de mergear. Si el fallo viene de la base (72c7ead) no es de este PR; si no, arreglarlo antes de la prueba real, porque sin preview no se puede probar.
4. **Tarea 8.2.** **Acción sugerida:** correr `pnpm test:e2e` completo en un entorno con red (o en la nube) y, recién ahí, marcarla. Los dos fallos del tester pasaron al repetirse solos (ver "Tester").
5. **Corrección 2 sin revisar.** **Acción sugerida:** pedir una tercera ronda corta solo sobre el commit 257c454 (reintento de red/5xx y tests e2e con `page.route`), o leerla vos.
6. **Prueba real (sigue siendo tuya).** Seguir `docs/guiones/billeteras-candide-prueba.md`: proyecto de testnet en Candide, cargar `CANDIDE_BUNDLER_URL`, `CANDIDE_PAYMASTER_URL` y `LH_PRUEBA_CANDIDE=1` solo en Preview de la rama, nunca en Production. En el panel de Candide quizá haya que permitir también la fábrica del verificador WebAuthn (paso 1.4 del guion).
7. **Nota sobre EAS (para ADR-012).** El SDK de EAS (eas-sdk 2.10.0) solo verifica firmas ECDSA, no EIP-1271. Su dominio EIP-712 se llama `EAS Attestation` y no `EAS` como decía design.md; se usó el del SDK. Si la Safe valida su firma, la constancia hay que afirmarla en la cadena desde la Safe. Conviene corregir design.md.
8. **Cambio menor:** `tsconfig` pasó de target ES2017 a ES2020 (por los números bigint). El revisor lo vio sin riesgo.

## Revisor: veredicto y hallazgos
- **Ronda 1 (cambios pedidos):** 0 alta, 3 media, 7 baja. https://github.com/netxgen-2050/lighthouse-platform/pull/219#issuecomment-7161507583
  Corregibles, todos arreglados en 5799507: tiempo de inclusión mal medido al retomar; lockfile cambiaba la versión de viem de wagmi/porto; filtro de revert demasiado amplio; no se consultaba el último hash; un error pasajero marcaba "Falló"; faltaba test con nonce distinto de 0; faltaban tests (modo real sin configurar, passkey cancelada, 200 en Production); `direccion.ts` reexportaba para esquivar la regla `netx-sin-operaciones`.
  Para Gus: política de gas y heurística EIP-1271 (puntos 1 y 2 arriba).
  Cumple: Production solo con la variable, rutas solo super admin, sin secretos, tsconfig sin riesgo.
- **Ronda 2 (aprobado con observaciones, nada alto):** https://github.com/netxgen-2050/lighthouse-platform/pull/219#issuecomment-7161906776
  Los 8 hallazgos quedaron resueltos. Pendientes: (media, del entorno) tarea 8.2 y Vercel; (baja) el reintento valía para cualquier error, incluidos 4xx y 503 "sin configurar", corregido luego en 257c454; (baja) faltaban tests de los arreglos 1, 4 y 5, que 257c454 cubre con e2e nuevos. Local: 25 archivos y 240 tests de vitest ok, tsc y eslint ok.
- **Ronda 3:** no hubo.

## Tester: resultado
**Pasa en local, sin preview.** https://github.com/netxgen-2050/lighthouse-platform/pull/219#issuecomment-7163165216
- `e2e/billetera-prueba.spec.ts`: 7/7. Tests unitarios de la prueba: 72 pasan.
- Suite completa: 1381 pasaron, 2 fallaron, 3 omitidas. Fallaron `accesibilidad.spec.ts:635` (`/lotes?lang=en`, axe `document-title`) y `consentimiento-alta.spec.ts:385` (esperaba canal al-entrar y versión 2026-11-24-borrador, recibió null). Al repetirlos solos pasaron: probable inestabilidad bajo carga, sin relación aparente con este PR. Si vuelven a fallar en la corrida limpia, abrir un cambio aparte.
- El 404 sin variable está cubierto por tests unitarios, no por un despliegue real.
- **Sin probar:** preview de Vercel, adaptador real de Candide, Safari / iPhone / passkey real, Basescan y EASScan, qué filtra el panel de Candide, tiempos reales.

## Para la próxima noche
- **Bloqueado hasta que vos hagas algo:** la prueba real depende de las claves de Candide, de las variables en Preview de Vercel y de que el preview exista (arreglar o entender el `failure`). Sin eso no hay nada más que un agente pueda verificar del adaptador real.
- Si aceptás la excepción de gas: un cambio chico que actualice `spec.md` y design §4 (también el nombre del dominio EIP-712 de EAS).
- Correr `pnpm test:e2e` completo en un entorno con red y cerrar la 8.2.
- Revisión corta de 257c454.
- Tras la prueba real: ajustar la heurística EIP-1271 con el mensaje real, confirmar el UID del schema en EASScan (`0xe67582ba…27a0`, hoy sin registrar en Base Sepolia) y la política del panel de Candide.
- Fuera de alcance y congelado: recuperación con guardianes, tabla `billeteras` y red definitiva (`billeteras-safe`).
