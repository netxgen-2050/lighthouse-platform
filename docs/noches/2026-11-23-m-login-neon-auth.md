# Noche 2026-11-23 — login-neon-auth
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/195 (base `agente/consentimiento-alta`) · **Preview:** no apareció (ver abajo)

## En una línea
El código del login con Neon Auth está hecho y pasa todas las pruebas locales, pero **no se pudo probar con cuentas reales porque el preview de Vercel nunca apareció**; hay cuatro decisiones tuyas pendientes antes de dar esto por bueno.

## Qué falló primero
- **Tester BLOQUEADO.** `scripts/preview-url.sh` esperó 15 minutos el preview del commit `ba3d755` y no apareció (quizá el repo no está conectado a Vercel). Sin preview no se corrieron los pasos 2 a 7 del guion. Faltan: un preview con `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` y `NEXT_PUBLIC_LH_LOGIN=neon-auth`; el usuario `login@prueba.test` con las variables `NEON_AUTH_PRUEBA_*`; y un email real y una cuenta de Google.
- **No se verificó la cookie `neon-auth`** (paso 7.8): sus atributos (HttpOnly, Secure, SameSite) siguen sin verse en un entorno real.
- **El primer revisor no pudo comentar en el PR**: el permiso rechazó `scripts/pr.sh comentar/diff/ver`. Sus hallazgos llegaron solo por el resumen. El segundo revisor sí publicó su comentario.

## Qué quedó hecho (tareas 9 marcadas; 2 sin marcar: 5.1 y 6.2)
- Adaptadores de Privy y de Neon Auth detrás de `sesionDelPedido`; manejador `/api/auth/[...path]` (503 si faltan variables); la vuelta de Google en `middleware.ts`.
- `/api/sesion` devuelve `personas.id` como `idPersona` y `clavesAnteriores`; `/api/personas` exige JSON y Origin propio.
- Cliente: formulario propio tras aceptar el consentimiento; `abrirLogin()` según `NEXT_PUBLIC_LH_LOGIN`; "Salir" cierra el proveedor en uso; copia única de las claves del navegador.
- Textos: Neon aparece como encargado del login y la política sube a `2026-11-24-borrador`.
- Prueba e2e nueva y guion para Gus en `docs/guiones/login-neon-auth.md`.
- `pnpm verificar` (2464 tests) y `pnpm build` en verde.
- **5.1 sin marcar:** la prueba de accesibilidad (axe) del formulario quedó en `e2e/login-neon-auth.spec.ts` y no en `accesibilidad.spec.ts` (esa corre con Privy, que se fija al compilar); y el e2e completo no queda en verde por la consulta U1.
- **6.2 sin marcar:** falta lo que depende del preview (atributos de cookie, resultado del guion).

## Qué decidir a la mañana
1. **Preview de Vercel (bloquea todo lo real).** Revisar si el repo está conectado a Vercel y armar un preview de la rama con las variables de Neon. Acción sugerida: hacerlo y después correr el guion `docs/guiones/login-neon-auth.md` (o pedir otra noche de tester).
2. **Atributos de la cookie (revisor 7).** El diseño §2 dice que si la cookie no es HttpOnly hay que frenar. Acción: verla en el preview antes de aceptar el PR.
3. **Cambio de `idPersona` (revisor 6).** Ahora es `personas.id` para todos, incluso los que usan solo Privy. El registro de pactos (`lib/pactos/postulacion.ts:87`) guarda con el id viejo: una admin-tribu podría aprobar su propia postulación y dejar de ver las suyas. Semillas usa la misma clave y está congelado. Acción sugerida: decidir si se migra el registro de pactos en un cambio aparte, o si se mantiene el id viejo para los usuarios solo-Privy.
4. **Versión de la política (revisor 8, pregunta abierta del diseño §5).** Subir a `2026-11-24-borrador` obliga a todo el equipo a volver a aceptar. El implementador tuvo que ajustar dos e2e de `consentimiento-alta`. Acción: confirmar que está bien pedir la re-aceptación.
5. **SDK y lockfile (revisor 9).** `@neondatabase/auth` 0.6.0-beta pide Next 16+ y el repo está en 15.5.27. El lockfile se re-resolvió con pnpm 12.4.2 y suma unos 312 paquetes; además se puso `core-js:false` en `pnpm-workspace.yaml`. Acción: aceptar el riesgo o posponer hasta subir Next.
6. **Desvío de 5.1:** aceptar que el axe del formulario viva en el archivo nuevo.
7. **Decisiones menores del implementador:** el 503 sale solo si el pedido trae Bearer (sin credenciales sigue siendo 401); el SDK se carga solo al abrir el formulario o al salir.
8. **Sin verificar con cuenta real:** la vuelta de Google (SameSite strict contra lax), la configuración por rama de Neon y `/admin` con un super admin que solo existe en Neon.
9. **Aviso por error en la vuelta de Google:** no se agregó (la spec no lo define); hoy el error se registra en el log y la persona no ve nada. Acción: decidir si hace falta un aviso.

## Revisor: veredicto y hallazgos
- **1ª pasada:** con observaciones. 0 altos, 4 medios, 5 bajos. No pudo publicar el comentario. Corregibles (1 a 5): origen `http://interno.invalid` en páginas del servidor; faltaban tests de "Código por email" y de "Sesión de Privy abierta"; doble clic en "Mandar otro código"; `NEXT_PUBLIC_LH_LOGIN` sin recortar en el servidor; error de la vuelta de Google que se perdía. Decisiones de Gus (6 a 9): ver arriba.
- **Vuelta de corrección (`ba3d755`):** se resolvieron 1 a 5. Origen real con `origenDeCabeceras` (el Set-Cookie de renovación no se puede aplicar desde una página del servidor y sigue en `/api/sesion`); e2e del código por email; decisión de "Privy abierta" en `lib/sesion/consulta.ts` con tests unitarios (sin e2e, porque el build de e2e no tiene Privy); arreglo del doble clic; variable recortada; logs solo con el tipo de error.
- **2ª pasada:** con observaciones. 1 a 5 bien resueltos, sin hallazgos nuevos ni regresiones; 135 tests de `lib/sesion` y 12 e2e pasan. Quedan abiertos solo 6 a 9. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/195#issuecomment-7104673361
- Sin hallazgos contra CLAUDE.md, seguridad ni alcance.

## Tester: resultado
- **BLOQUEADO** (ver arriba). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/195#issuecomment-7105437430
- Playwright local sin variables de Neon: 1213 pasaron, 17 fallaron, 3 omitidos. Las 17 son las ya conocidas de la consulta U1 (`accesibilidad.spec:442`; `fogon-consultas.spec` a–i; `idioma-pendientes` 23/46/62/107; `manifiesto-lighthouse-vrn` 189/206/218). Ninguna falla nueva.
- No se hizo vuelta extra del tester porque no hubo fallas de código.

## Para la próxima noche
- Arreglar el preview y volver a correr al tester con el guion completo (pasos 2 a 7, cookie incluida).
- Con eso, marcar 5.1 y 6.2.
- Cambio aparte, si decidís migrar el registro de pactos al nuevo `idPersona`.
- Arreglar o aislar las 17 pruebas de la consulta U1, que ensucian el e2e completo en todas las ramas.
- Lo que queda para `retiro-privy` y para los emails propios, según el diseño.
