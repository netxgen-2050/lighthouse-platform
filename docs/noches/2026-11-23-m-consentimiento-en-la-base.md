# Noche 2026-11-23 — consentimiento-en-la-base
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/198 · **Preview:** no apareció

**Lo primero:** el preview de Vercel no apareció (15 min de espera), así que el guion manual contra Neon quedó sin verificar. Además, la tarea 4.1 quedó sin marcar porque hay 17 e2e en rojo (Consultas del Fogón).

## En una línea
El consentimiento ahora se guarda en el servidor (en la base) y no en el navegador, así que una persona que aceptó en un dispositivo no vuelve a ver la pantalla en otro. El código y los tests locales están en verde, pero no se probó contra Neon ni Privy reales.

## Qué quedó hecho (tareas 4/5)
- 1.1 Hecha. Servidor: `lib/privacidad/servidor.ts` con `estadoConsentimiento` y `registrar`. Registrar es una transacción con lock por identidad. El retiro agrega filas y no borra nada.
- 1.2 Hecha. `exigirConsentimiento(sesion)`: devuelve 403 sin consentimiento vigente y nunca escribe.
- 1.3 Hecha. Ruta `app/api/consentimientos/route.ts` (GET y POST). Tiene un tope de 2 KB en el cuerpo (413).
- 2.1 Hecha. El navegador usa la API: constancia, novedades, aceptación previa y retiro. Sin confirmación del servidor la persona sigue anónima y ve un aviso (`role="alert"`). El consentimiento de datos sensibles y KYC sigue en el navegador.
- 3.1 Hecha. La fixtura de e2e siembra por la API y hay tres e2e nuevos: aceptar en otro navegador, API caída y retiro. Se sumó un cuarto e2e para el fallo del retiro.
- 4.1 **Sin marcar.** `pnpm verificar` y `pnpm build` dieron verde. Faltan los 17 e2e de Consultas del Fogón, que fallan porque la U1 cerró el 15-nov-2026. No tocan consentimiento, pero no se confirmó contra la rama base.

Decisiones propias del implementador:
- Si ya hay un consentimiento general vigente, aceptar no agrega filas del general.
- Desde Mis datos no se acepta el general a escondidas (devuelve 403).
- La casilla sin marcar solo escribe un retiro cuando es la primera decisión.

Aviso para el equipo: tras el primer deploy, quien ya aceptó en su navegador vuelve a ver la pantalla una vez.

## Qué decidir a la mañana
1. **Textos falsos tras el cambio (media).** `mis-datos-cliente.tsx:216` dice que retirar borra el registro. `lib/privacidad/politica.ts:148` y `:124` siguen diciendo que el consentimiento está en el navegador. Corregirlos pide una versión nueva de la política, revisada por Gabriel, y que todo el equipo vuelva a aceptar. Acción sugerida: decidir si se hace en un cambio aparte y quién la manda a Gabriel.
2. **`exigirConsentimiento` sin uso (baja).** Ninguna ruta lo llama. Acción sugerida: decidir si POST y PATCH de `/api/personas` deben exigirlo.
3. **17 e2e de Consultas del Fogón en rojo (baja).** Acción sugerida: decidir si se actualizan las fechas de la U1, se retiran o se aíslan, y confirmar si ya fallaban en la rama base. Hasta entonces la 4.1 no se puede marcar.
4. **Preview de Vercel (pendiente).** No hay preview para `caed95c` y la API de deployments no lista ninguno para la rama. Posible causa: el PR apunta a `agente/login-neon-auth` y no a `dev`, o Vercel no está conectado a esa rama. Acción sugerida: que alguien con acceso a Vercel lo revise.
5. **Guion manual contra Neon (pendiente).** Faltan el paso 8, que pide credenciales reales de Privy o Neon Auth, y el paso 9 (doble clic y lock). El lock advisory (`servidor.ts:255`) solo se probó con PGlite, que tiene una sola conexión. Acción sugerida: correr el guion apenas haya preview.
6. **Base del PR.** El PR apunta a `agente/login-neon-auth`, no a `dev`. Acción sugerida: decidir el orden de integración.

## Revisor: veredicto y hallazgos
Tres pasadas. Veredicto final: con observaciones, sin hallazgos de gravedad alta ni media nuevos.
- 1ª pasada: 6 hallazgos (0 alta, 2 media, 4 baja).
  - Corregidos en la vuelta 1: Mis datos mostraba el aviso de borrado local cuando fallaba el POST de retiro (media). POST sin tope de cuerpo (baja).
  - Pasaron a decisión: textos falsos (media), `exigirConsentimiento` sin uso, 4.1 sin marcar y lock sin probar (bajas).
- 2ª pasada: los hallazgos 1 y 2 estaban bien resueltos, sin regresiones. Dos hallazgos nuevos de gravedad baja: un aviso viejo no se limpiaba (`mis-datos-cliente.tsx:112-114`) y, sin `Content-Length`, el cuerpo se lee entero antes de compararlo con 2 KB.
  - El aviso viejo se corrigió en la vuelta 2 (`caed95c`). No tiene test porque el camino no se alcanza desde la UI.
  - Lo de `Content-Length` se dejó como está. Está acotado por el límite de Vercel (unos 4,5 MB).
- 3ª pasada (final): `caed95c` resuelve lo marcado. Quedan abiertos la baja de `Content-Length` y los hallazgos 3 a 6.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/198#issuecomment-7108106901 y https://github.com/netxgen-2050/lighthouse-platform/pull/198#issuecomment-7108377423

## Tester: resultado
- **No se pudo probar el preview.** `scripts/preview-url.sh` esperó 15 min y no encontró preview.
- Playwright local (build y start de prueba, sin Neon), con `--retries=1`: consentimiento-alta, privacidad, marco, sumarte, login, perfil y panel. 212 pasaron, 0 fallaron y 2 se omitieron.
- Una falla intermitente en `idioma-portada-sumarte` ("cuatro planes con sus nombres y montos") en la primera corrida. Pasó en la segunda y no parece tener relación con este cambio.
- No corrió la suite completa ni las 17 fallas de Consultas del Fogón.
- Guion manual: los pasos 1 a 7 no se verificaron contra Neon. Los pasos 8 y 9 quedaron sin verificar.
- Detalle: https://github.com/netxgen-2050/lighthouse-platform/pull/198#issuecomment-7108887298

## Para la próxima noche
- Arreglar el preview de Vercel para esta rama y correr el guion manual contra Neon (pasos 8 y 9 incluidos).
- Resolver los 17 e2e de Consultas del Fogón para poder marcar la 4.1 y correr la suite completa.
- Si Gus lo aprueba, abrir un cambio para la versión nueva de la política y los textos que hoy dicen que el consentimiento vive en el navegador.
- Decidir si `/api/personas` debe exigir consentimiento.
- Proceso: el implementador usó una vez `sed -i` sobre `tasks.md`. Las reglas piden usar Edit.
- Nadie mergeó ni tocó `dev` ni `main`.
