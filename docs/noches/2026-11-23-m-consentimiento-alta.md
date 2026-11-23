# Noche 2026-11-23 — consentimiento-alta
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/191 (rama `agente/consentimiento-alta`, base `dev`) · **Preview:** https://lighthouse-platform-git-agente-con-6dfcba-netxgen-2030-projects.vercel.app (ver la nota de abajo: el tester no pudo usarlo)

## Lo que falló o quedó bloqueado (leer primero)
1. **El tester dio ❌ falla.** Hay 17 e2e que fallan por la consulta U1 (no es de este PR, ver más abajo) y 2 que fallaron una vez bajo carga y pasaron al repetirlos.
2. **Preview de Vercel no probado.** El tester esperó 15 minutos con `scripts/preview-url.sh` y no apareció el preview del último commit (`a9f3508`). Probó en local. Por eso **dos tareas quedaron sin verificar**:
   - **3.5:** que la ventana de Privy muestre los dos enlaces legales (política y términos).
   - **4.2:** el test que prueba que Privy no recibe el email antes de las casillas. Está escrito, pero se salta sin Privy real.
   - Tampoco se recorrió el guion manual contra el preview.
   - Nota: el bot de Vercel dejó un comentario con un preview "Ready" de las 12:01 UTC, pero no se pudo confirmar que sea del commit `a9f3508`. Conviene mirarlo a mano antes de dar por perdido el preview.
3. **Hay decisiones tuyas pendientes** (sección siguiente). Sin ellas el cambio no cumple del todo la spec.
4. Nadie mergeó nada ni tocó `dev` ni `main`.

## En una línea
Ahora nadie puede abrir el login de Privy sin antes aceptar la política y los términos en un paso propio ("Crear tu cuenta" o "Entrar"). Todo está hecho y verde en local, salvo la prueba contra Privy real y tus decisiones sobre la versión de la política.

## Qué quedó hecho (tareas 14 de 16)
Hechas: 1.1 a 1.4, 2.1, 2.2, 3.1 a 3.4, 4.1, 4.3 y 4.4. Sin marcar: **3.5** y **4.2** (ambas necesitan el preview con Privy real; el código y el test ya están escritos).

- Una sola puerta al login: solo el paso nuevo lo abre, y un test de fuente falla si el login de Privy aparece en otro archivo.
- La aceptación se guarda 5 minutos en la pestaña y se registra al terminar el login, con el camino (alta, al-entrar, nueva-version).
- Sin consentimiento, la persona es anónima: no se guarda nada con su nombre y el menú solo ofrece "Salir".
- La pantalla de consentimiento queda como red de seguridad en cualquier página menos `/privacidad`, ahora con "Aceptaste la versión X el..." y "Qué cambió".
- Novedades por email, opcional y sin marcar. Solo se guarda la elección, no se manda nada.
- Mis datos muestra la constancia (versión, fecha, camino) y permite dar o retirar las novedades.
- Se reescribieron los e2e de congreso, congreso-en, privacidad y descubrir-publico, porque con sesión sin consentimiento las páginas públicas ya no se ven.
- Local: `pnpm verificar` en verde (2428 tests) y `pnpm build` en verde. Los e2e del archivo nuevo: 22 pasan y 1 se salta (Privy).

## Qué decidir a la mañana
1. **[Media] Número de versión de la política y texto nuevo.** La spec pedía `2026-10-15-borrador`, pero `main` ya estaba en `2026-11-03-borrador` (lotes), así que el implementador usó `2026-11-23-borrador`. Además escribió un texto nuevo de "Qué cambió" para la versión `2026-11-03-borrador` (`lib/privacidad/politica.ts`, líneas 2286 a 2290), que la spec no pedía. Es un texto legal nuevo y es borrador.
   - **Acción sugerida:** ratificar `2026-11-23-borrador` y ese texto, y después actualizar la spec de este cambio y la de `idioma-legal` (que todavía nombra la `2026-10-15-borrador`). Si no, la política se sube de versión dos veces.
2. **[Baja] "Qué cambió" no acumula versiones.** Muestra solo lo de la versión vigente. Quien aceptó la `2026-10-14` y nunca la `2026-11-03` no ve el cambio de los lotes simulados. La spec se cumple al pie de la letra.
   - **Acción sugerida:** decidir si se acumulan los cambios desde la versión que la persona aceptó. Si sí, es un cambio chico aparte.
3. **[Baja, fuera de este PR] Los e2e de la consulta U1 fallan por la fecha.** U1 cierra el 15-nov-2026 y hoy figura "Cerrada", así que no aparecen los botones que esperan los tests. El revisor contó 16 y el tester 17.
   - **Acción sugerida:** abrir un cambio aparte para arreglar los datos de U1 o los tests. No bloquea este PR, pero deja rojo el e2e completo.
4. **Probar Privy contra el preview** (tareas 3.5 y 4.2): con el preview disponible, correr `BASE_URL=<preview> pnpm test:e2e e2e/consentimiento-alta.spec.ts` y mirar que la ventana de Privy muestre los dos enlaces. No lo puede hacer un agente sin red ni credencial.
5. **Abierto desde el PR (fuera de alcance):** qué pasa con el usuario de Privy de quien no acepta (R29). Y los textos nuevos siguen siendo borrador sin revisión legal (R14).

## Revisor: veredicto y hallazgos
Tres rondas, siempre ⚠️ con observaciones. No hubo hallazgos altos.
- **Ronda 1 (8 hallazgos: 1 media, 7 bajos).** Cinco eran corregibles: tareas desactualizadas, una aserción que siempre pasaba (`NOMBRES_BASE`), un test que entraba por "Sumarme gratis" bajo "Entrar", faltaban pruebas de bitácora, de otra pestaña y de no sensibles, y faltaba probar `abrirLogin` con un login falso. Los otros tres son las decisiones de arriba.
- **Corrección 1 (`8c52fb5`):** los cinco corregidos. Se creó `intentarLogin` para poder probar la puerta con un login falso.
- **Ronda 2 (6 hallazgos):** quedaron tres corregibles: se perdió la mitad "Crear tu cuenta" del caso g2 (novedades que no se pisan), la aserción de bitácora nunca abría un ⚖ y "sensibles recién al verificar identidad" estaba a medias.
- **Corrección 2 (`a9f3508`):** los tres corregidos en `e2e/consentimiento-alta.spec.ts`.
- **Ronda 3 (final):** 0 altos, 1 medio, 2 bajos, ninguno corregible sin vos (son las decisiones 1 a 3). Sin regresiones, `pnpm verificar` con 2428 tests verdes. Reglas de CLAUDE.md y seguridad sin hallazgos.

## Tester: resultado
**❌ falla**, por los e2e de U1 y por no haber preview.
- Local (`pnpm build` más el servidor de Playwright, sin `BASE_URL`): 1199 pasaron, 19 fallaron, 2 saltados.
- **17 fallas conocidas de U1** (no son de este PR): `accesibilidad.spec.ts:442`; `fogon-consultas.spec.ts` (a, b, c, d, e, f, g2, h, i); `idioma-pendientes.spec.ts:23, 46, 62, 107`; `manifiesto-lighthouse-vrn.spec.ts:189, 206, 218`.
- **2 inestables** que pasaron al repetir con `--retries=0`: `lotes.spec.ts:289` y `pacto-puntual.spec.ts:385`. Parecen fallos por carga con 4 procesos en paralelo, no del cambio.
- Todos los e2e de `consentimiento-alta.spec.ts` pasaron, salvo el de Privy real (línea 461), que se salta.
- Además, durante la corrección 2 el implementador vio un fallo intermitente (test "Explorador", línea 77) y un error al cargar fuentes de Google. Al repetir pasaron y no se investigó la causa. Si vuelve a aparecer, hay que mirarlo.
- No hubo vuelta extra de corrección: U1 es otro cambio, Vercel estaba bloqueado y los flakes no se reproducen.
- Comentario del tester: https://github.com/netxgen-2050/lighthouse-platform/pull/191#issuecomment-7101827330

## Para la próxima noche
- Si ratificás la versión y el texto de "Qué cambió": actualizar la spec de `consentimiento-alta` y la de `idioma-legal` (que nombra la `2026-10-15-borrador`).
- Cambio nuevo para arreglar la consulta U1 vencida (datos o tests), así el e2e vuelve a quedar en verde.
- Con el preview publicado: correr el e2e de Privy contra él y marcar 3.5 y 4.2 en `tasks.md`.
- Si decidís acumular los cambios en "Qué cambió", especificarlo como cambio chico.
- Vigilar los flakes de `lotes.spec.ts:289`, `pacto-puntual.spec.ts:385` y el test "Explorador" (línea 77 de `consentimiento-alta.spec.ts`).
