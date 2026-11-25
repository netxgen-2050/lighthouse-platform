# Noche 2026-11-25-m — login-google-estandar
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/217 (base `spec/login-google-estandar`, rama `agente/login-google-estandar`) · **Preview:** no hay (el deploy de Vercel falla)

## En una línea
El botón "Continuar con Google" quedó hecho, primero en el login y con el estilo de Google, y pasa todo lo automático. **Pero Vercel no logra desplegar la rama, no hay preview, y la prueba quedó sin concluir**: lo que depende de Neon y Google reales no se probó.

## Qué falló (primero)
- **Vercel falla en todos los commits de la rama**, incluido el primero, que solo trae archivos de la spec y ningún código (`98615a0`, deploy `dpl_HZEwXT7xDuYZeLGu7Wed6YdsNXPS`). Un commit vacío de reintento (`c58fb31`, `dpl_7v7bE1a6URrTnHRq18WuY3bMBEUY`) también falló. Por eso no parece culpa del código de este cambio.
- Hasta ayer los deploys andaban: `agente/login-neon-auth` (23-nov), `agente/participa-vision-2050` (24-nov) y `dev` en `487be33` dieron verde.
- **Causa: no confirmada.** Nadie pudo leer los logs de Vercel (pide aprobación y credenciales). Las sospechas, sin confirmar: falta una variable de entorno de Preview para ramas nuevas, o un límite o estado del proyecto en Vercel.
- **Prueba: no concluyente.** El tester la corrió dos veces, solo en local. Sin preview no hay Neon Auth ni Google reales, así que no se pudo ver el flujo de verdad.
- Dos comentarios del revisor no se pudieron publicar en el PR (el permiso rechazó `scripts/pr.sh`). Sus textos solo quedaron en los reportes internos; abajo va el resumen.

## Qué quedó hecho (tareas 5/6)
Hechas: 1.1, 1.2, 1.3, 2.1, 3.1 y 3.2. **Sin hacer: 3.3.**
- Botón "Continuar con Google" primero, fuera del formulario del email, con el logo G oficial (decorativo, sin nombre accesible). Mide 40 px y usa Roboto Medium (`components/sesion/boton-google.tsx`, `logo-google.tsx`). Con un pedido en curso queda deshabilitado y avisa con `aria-disabled`.
- Debajo viene el separador con la "o" como texto real, y después "Tu email" y "Mandame el código". Se sacó el texto viejo "O entrá con tu cuenta de Google". El foco inicial sigue en el email.
- Colores nuevos en `app/globals.css` (`--color-google-fondo`, `-borde`, `-texto`) para tema claro y oscuro. Los colores del logo son una excepción anotada solo para ese archivo en `lib/sin-colores-sueltos.test.ts`.
- Tests de contraste: el borde cumple 3:1 en los dos temas sin tener que oscurecerlo.
- Tests e2e: orden de los controles, Shift+Tab desde el email llega a Google, Enter en el email no abre Google, axe en claro y oscuro. Tras la corrección del revisor se sumaron tres: el clic pide `signIn.social` con provider `google` y la `callbackURL`; un error 500 muestra `role=alert`; un doble clic deja un solo pedido.
- Guion `docs/guiones/login-neon-auth.md` actualizado (paso 7.7).
- Pautas de Google leídas el 25-nov-2026. Los colores, los 40 px y el texto coinciden con la spec. No se pudo confirmar Roboto 14/20 ni los rellenos finos: la página los carga por script.
- Tarea 3.3 abierta: falta `pnpm test:e2e` completo (1383 tests; una corrida falló por la descarga de la fuente Hanken Grotesk del Congreso, un error ajeno y pasajero, y la otra se cortó por tiempo) y falta la captura del diálogo en los dos temas.

## Qué decidir a la mañana
1. **Vercel (lo urgente).** Alguien con acceso corre `npx vercel inspect dpl_7v7bE1a6URrTnHRq18WuY3bMBEUY --logs` o abre https://vercel.com/netxgen-2030-projects/lighthouse-platform/7v7bE1a6URrTnHRq18WuY3bMBEUY. Si es una variable de Preview faltante, cargarla. Después, reintentar el deploy. Sin esto no hay forma de probar el login real.
2. **Tarea 3.3 (media, decisión humana).** Dejar que el CI corra el e2e completo y sacar a mano las capturas de los dos temas en el preview cuando exista. Mientras tanto la tarea queda sin marcar.
3. **Aceptar o no `renderToStaticMarkup` en vez de Testing Library (baja, decisión humana).** El repo no tiene Testing Library ni jsdom, y el implementador no sumó dependencias. Los tests de componente (tareas 1.3 y 2.1) usan `renderToStaticMarkup`. El clic real quedó cubierto por los e2e con la red interceptada. Sugerencia: aceptarlo, porque el e2e cubre lo que faltaba. Si preferís Testing Library, es un cambio aparte.
4. **Probar a mano cuando haya preview** (guion del PR, pasos 5 a 7): tema oscuro a ojo, logo G de colores, lector de pantalla, flujo real de Google con vuelta a la misma página, y los atributos de la cookie `neon-auth` (HttpOnly, Secure, SameSite; paso 7.8).
5. **Comentarios del revisor sin publicar.** Quedaron en sus reportes; el resumen está más abajo. Si querés que consten en el PR, que alguien los pegue o que se les dé permiso a `scripts/pr.sh`.
6. **Base del PR.** El PR apunta a `spec/login-google-estandar`, no a `dev`. Hay que decidir cuándo y cómo pasa a `dev`. Nadie mergea sin vos.

## Revisor: veredicto y hallazgos
- **Vuelta 1: con observaciones, 3 hallazgos.**
  - [media] Ningún test apretaba el botón real (faltaban inicio del flujo, error del proveedor y ocupado). Corregido con tres e2e (commit `d44640f`).
  - [baja] Roboto se precargaba por defecto en `app/layout.tsx`. Corregido con `preload: false`.
  - [baja, decisión humana] Tarea 3.3 abierta y aceptar o no `renderToStaticMarkup` (puntos 2 y 3 de arriba).
- **Vuelta 2: listo para revisión humana.** Los dos hallazgos corregidos están bien y no hay regresiones. 76 tests unitarios en verde. Quedó un hallazgo bajo y opcional en `e2e/login-neon-auth.spec.ts:145`: `expect(pedidos).toBe(1)` se evalúa enseguida tras el clic forzado. La comprobación de la línea 148 sí lo cubre. Se puede pasar a `expect.poll` o borrar. Ningún hallazgo necesita decisión de Gus.
- Ninguna de las dos vueltas pudo publicar su comentario en el PR.

## Tester: resultado
- **No concluyente.** Todo lo automático pasa en local (servidor propio de Playwright, sin Neon ni Google reales): 153 tests pasaron y 0 fallaron entre `e2e/login-neon-auth.spec.ts` y `e2e/accesibilidad.spec.ts`. `pnpm build` local en verde (solo un warning ajeno en `app/territorios/[id]/vistas/paneles.tsx`).
- Cubierto por e2e con mocks: pasos 7.1 a 7.5, el orden de Google, Shift+Tab, Enter en el email, el clic con `signIn.social`, el error 500 con `role=alert`, el doble clic y axe en claro y oscuro.
- Sin probar: 7.1 a 7.5 con Neon real, 7.6 (salir y volver a pedir las casillas), 7.7 con el flujo real de Google, 7.8 (cookie), lector de pantalla, tema oscuro a ojo y logo. Sin las claves reales de Neon Auth, el manejador local responde 503 (también cubierto por un e2e).
- No se corrió `pnpm test:e2e` completo ni se sacaron las capturas.
- Comentarios del tester en el PR: issuecomment-7161294364 (vuelta 1), issuecomment-7161936399 (vuelta 2).

## Para la próxima noche
- Cuando Vercel vuelva a desplegar, correr el guion manual completo sobre el preview (Neon y Google reales) y sacar las capturas de los dos temas para cerrar la 3.3.
- Si querés, limpiar el hallazgo bajo de `e2e/login-neon-auth.spec.ts:145` (`expect.poll` o borrar la línea).
- Si se decide sumar Testing Library, abrir un cambio aparte para eso.
- Revisar si el Congreso (Hanken Grotesk) sigue fallando al bajar la fuente en el build. Fue un error pasajero y local, pero conviene vigilarlo.
