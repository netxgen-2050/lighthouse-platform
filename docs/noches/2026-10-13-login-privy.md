# Noche 2026-10-13 — login-privy
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/57 · **Preview:** https://lighthouse-platform-4xj2hhwbg-net-xg-en.vercel.app

## En una línea
El login con Privy está construido y revisado, pero el tester no pudo probarlo en el preview (faltan variables de configuración en Vercel) y el flujo real con Privy nunca se probó: hay que hacerlo con tus credenciales.

## Qué falló o quedó sin probar (primero)
- **Tester: no concluyente.** No es una falla del código sino de configuración: el preview responde `{"activo":false,"emails":[]}` en `/api/sesion/prueba`. De los 16 e2e de login contra el preview, 2 pasaron y 14 fallaron porque no aparece "Entrar como…". La suite completa no terminó (timeouts en cascada) y no se reporta.
- **Login real con Privy: sin probar.** Ni el implementador ni el tester tuvieron credenciales ni red hacia Privy. Código por email, Google y billetera embebida solo están cubiertos por tipos, tests con un cliente simulado y e2e con el modo de prueba.

## Qué quedó hecho (tareas 7/7)
- Servidor: la lista de acceso `LH_PERSONAS` se lee en `lib/sesion/personas.ts`. `GET /api/sesion` verifica el token de Privy y responde 200 (con rol y perfil), 401 (sin sesión) o 403 (email fuera de la lista).
- Modo de prueba: solo con `LH_AUTH_PRUEBA=1` y nunca en producción. Es lo que usan los e2e.
- Pantallas: bienvenida, "sin acceso" y error, barra con Entrar/Salir, aviso "Prototipo interno" también en las pantallas de acceso y en "Cargando…".
- Datos por persona: cada cuenta guarda sus datos con su propio prefijo. Los datos de antes del login se ofrecen una vez para importarlos.
- Roles: NetX solo para super admin; marca de Admin en Valle Solar para admin de tribu; panel "Personas y roles" (solo lectura) en `/netx`; perfil con "Tu cuenta" e iniciales; sello "Billetera creada" en el Pasaporte.
- Verificación local: `pnpm verificar` (561 tests) y `pnpm build` en verde; e2e locales en verde (16/16 en `e2e/login.spec.ts`).

## Qué decidir a la mañana
1. **Cargar variables en Vercel (acción tuya, desbloquea al tester).**
   - `LH_PERSONAS` en Production y Preview con los emails reales (ej.: `tu-email=superadmin:usuario;otro=admin-tribu:inversor;otro2=persona:comunidad`). Para el tester en Preview, sumar también `superadmin@prueba.test`, `admin-tribu@prueba.test` y `persona@prueba.test`.
   - `LH_AUTH_PRUEBA=1` solo en Preview y Development, nunca en Production.
   - Redeployar y volver a correr el tester.
2. **Panel de Privy:** permitir los dominios de producción, localhost y, si querés Privy en los previews, los de preview.
3. **Probar el login real una vez** con las variables cargadas (guion manual en el PR, pasos 1 a 9).
4. **Después del merge:** sacar la protección de Vercel de producción. Antes de eso, resolver el punto 5.
5. **`/api/reportes` no pide sesión (media).** Al sacar la protección de Vercel, cualquiera con la URL podría crear issues en GitHub. Acción sugerida: exigir sesión en esa ruta antes de abrir producción, o dejarlo asumido mientras sea prototipo cerrado.
6. **Contenido visible sin sesión (baja).** La puerta de entrada es solo del lado del navegador: el contenido de NetX y de páginas protegidas viaja en el HTML aunque no haya sesión. Son datos de ejemplo. Acción sugerida: aceptarlo por ahora; con Neon se pasa a protección en servidor.
7. **Billetera para todos (baja).** Privy crea una billetera embebida a cada persona que entra (`createOnLogin: users-without-wallets`) y la spec no lo pide. Acción sugerida: decidir si se deja (el sello del Pasaporte la usa) o se cambia a que no se cree sola.
8. **Parpadeo de tema (baja).** Si la sesión vence sin apretar Salir y entra otra persona, se ve un instante el tema de la anterior. Evitarlo del todo implica pintar siempre el tema por defecto al arrancar. Acción sugerida: aceptarlo, o decidir que el tema por defecto sea lo primero que se ve.

## Revisor: veredicto y hallazgos
Tres rondas. Veredicto final: **sin hallazgos nuevos, PR listo para revisión humana.** Corrió `pnpm verificar` (561) y `e2e/login.spec.ts` (16/16). La spec está cubierta en sus 6 requirements; lo único sin test automático es la entrada real con Privy.
- Ronda 1 (7 hallazgos: 0 altos, 2 medios, 5 bajos). Corregidos: cookie de prueba vencida que dejaba sin poder entrar (nota: el arreglo no se probó en un navegador real, solo con un e2e que simula el 401), aviso de prototipo en pantallas de acceso, tests faltantes (sello billetera, nombre Privy en perfil, ruta de prueba en producción). Corregido solo en parte: tema de la persona anterior (punto 8).
- Ronda 2 (3 bajos): faltaba test de la cookie vencida y aviso en "Cargando…"; ambos corregidos en la segunda vuelta.
- Ronda 3: nada nuevo. Quedan solo las decisiones tuyas (puntos 5 a 8), que los agentes no pueden resolver.

## Tester: resultado
**No concluyente por configuración, no por falla del cambio.** Contra el preview, el guion manual solo avanzó en el paso 1 de forma parcial: `/api/sesion` sin sesión da 401 `{"ok":false}` y el HTML trae el aviso de prototipo. Los pasos 2 a 9 quedaron sin probar. Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/57#issuecomment-6144136028. No se hizo vuelta de corrección porque no había fallas de código.

## Para la próxima noche
- Después de cargar las variables en Preview, volver a correr el tester sobre este PR (suite `e2e/login.spec.ts` y guion manual).
- Si decidís exigir sesión en `/api/reportes`, abrir un cambio chico de spec.
- Si querés evitar el parpadeo de tema o la billetera automática, también van como cambios chicos.
- Notas del implementador: se adaptaron tests existentes (menú del avatar con Salir habilitado, test de Hifa reescrito, tests de red ignoran `/api/sesion`) y se marcaron en `false` los scripts de build opcionales de Privy en `pnpm-workspace.yaml`.
