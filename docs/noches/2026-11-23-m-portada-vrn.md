# Noche 2026-11-23-m — portada-vrn
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/190 (base `dev`) · **Preview:** https://lighthouse-platform-git-agente-por-2ee5e1-netxgen-2030-projects.vercel.app (existe y está Ready, pero pide login de Vercel: nadie pudo probarlo)

## En una línea
La portada ahora cuenta la promesa de Lighthouse VRN a 2030, con "Ver los lotes" como llamado principal. Quedó probada en local, pero no contra el preview de Vercel, que está protegido con login, y hay 4 textos que tenés que decidir vos.

## Qué falló o quedó sin hacer (primero)
- **Tarea 3.2 sin cerrar:** la prueba e2e contra el preview no se pudo correr. Vercel tiene Deployment Protection y pide login (responde 302). Además `scripts/preview-url.sh` no encuentra el preview, porque espera un deployment de GitHub sobre el commit y no aparece. Se probó el mismo commit en local, con el build de producción.
- **17 pruebas e2e fallan, ninguna de la portada.** Todas son de `/fogon/consultas` (accesibilidad u1, fogon-consultas, idioma-pendientes y manifiesto-lighthouse-vrn). El revisor vio que la consulta u1 aparece ya cerrada: son datos que dependen de la fecha. Es una falla de `dev`, porque este PR no toca `app/fogon` ni `lib/fogon`. El tester no la comparó contra `dev`: lo infirió por la ruta. Falta un cambio aparte para arreglarla.
- **La última revisión no se repitió** después del último commit (b489c2c), por el límite de dos vueltas. Ese commit solo endurece una prueba. Corrió `pnpm verificar` (verde), pero el e2e local no se pudo correr en ese paso por falta de red para Google Fonts en modo dev. Después, el tester sí corrió todo contra un build de producción local y no hubo fallas en portada.

## Qué quedó hecho (tareas 6 de 7)
- 1.1 Datos nuevos en `lib/portada-vrn.ts`: los cinco capitales y tres cifras del sitio, cada una con fuente y fecha de consulta (un test lo exige). Sin cifras externas.
- 1.2 `ribera` ya tenía inglés en `dev`; solo se sumó un test.
- 2.1 Portada reescrita (`lib/idioma/textos/portada.ts`, `app/page.tsx`): promesa a 2030, Argentina con su ⚖, cinco capitales, cifras con fuente, "Ver los lotes" que lleva a `/lotes`.
- 2.2 y 2.4 Las tarjetas son Lotes, Territorio y Tribus. `?camino=congreso` o `?camino=perfil` no marcan nada y no fallan. Un `lh-origen` viejo con congreso sigue dando fuente y campaña.
- 2.3 y 2.5 Pruebas e2e de contenido, inglés, accesibilidad y 390 px. Se actualizaron las que buscaban el titular viejo (descubrir-publico, login, marco, idioma-portada-sumarte, accesibilidad).
- 3.1 `pnpm verificar` (2413 tests) y `pnpm build` en verde. No se tocó `lib/permisos/` ni `package.json`.
- **3.2 abierta** (ver arriba).

Correcciones de la noche: la prueba de "nada fuera de alcance" ahora corre en español e inglés y comprueba que no haya enlaces a `/congreso`. Un test nuevo (`app/page.test.tsx`) cubre el caso "Sin cifras". La prueba de alcance ahora exige primero ver el título y los cinco capitales, así no pasa vacía mirando el login de Vercel.

## Qué decidir a la mañana
1. **Preview protegido (tarea 3.2).** Acción sugerida: desactivar la protección para este preview, o pasar un secreto de bypass (`VERCEL_AUTOMATION_BYPASS_SECRET`) a la noche. Si no, aceptar la corrida local como verificación y marcar la tarea.
2. **Los cinco capitales** (Natural, Humano, Social, Construido, Financiero). Son una hipótesis del agente, tomada de Forum for the Future. No salen de la documentación y la página no avisa que son una propuesta. Acción: confirmarlos o cambiarlos. Se cambian solo en `lib/portada-vrn.ts`.
3. **"En el corazón de Vaca Muerta"** (bajada) y **"lejos de los grandes conflictos"** (texto de Argentina). Ninguna tiene fuente. Mainqué está en el Alto Valle de Río Negro, así que alguien de la zona podría cuestionarlo. Acción: decidir si se dejan, se suavizan o se sacan, antes de mostrar la plataforma afuera (R14).
4. **"Ver las comunidades" en lugar de "Ver las tribus".** La spec pide "Ver las tribus", pero el vocabulario de la plataforma dice "Ver las comunidades" (en inglés "See the communities"), y las pruebas esperan eso. Acción sugerida: dejarlo como está y ajustar la spec al archivar.
5. **Sobretítulo en inglés.** Dice "Río Negro province, Argentina", y `design.md` pide "Río Negro, Argentina". El test de diccionarios rechaza texto idéntico al español. Acción: aceptar el desvío y ajustar `design.md`, o hacer una excepción en el test para el nombre propio.
6. **Arreglar `/fogon/consultas` en `dev`.** Abrir un cambio aparte para las 17 pruebas que dependen de la fecha.

Todos los textos de la portada son borrador de agente.

## Revisor: veredicto y hallazgos
Veredicto final: con observaciones, sin hallazgos altos ni medios.
- Primera vuelta: 8 hallazgos, todos bajos. Se corrigieron el 2 (alcance en inglés y enlaces a `/congreso`) y el 3 (caso "Sin cifras"). El 4 era de proceso: el implementador editó `tasks.md` con `sed -i`, que las reglas prohíben. El contenido quedó bien. Los hallazgos 5 a 8 son los puntos 5, 2, 3 y 4 de la lista de decisiones de arriba.
- Segunda vuelta: 2 hallazgos bajos. El primero es la tarea 3.2 (preview protegido). El segundo es que la prueba de alcance podía pasar mirando el login de Vercel. Se corrigió en el commit db97ae8, y no se volvió a revisar.
- Las tres cifras coinciden con la nota 19 de NS_platform. No aplica el checklist de seguridad: no se tocó API, sesión, permisos, base ni integraciones.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/190#issuecomment-7099749372 y https://github.com/netxgen-2050/lighthouse-platform/pull/190#issuecomment-7100308315

## Tester: resultado
Pasó en local, con el preview sin poder probarse. Se usó un build de producción en el puerto 3113 (el 3000 lo ocupaba otro proceso).
- Playwright: 1183 pasaron, 17 fallaron, 1 omitida. Las 17 son de `/fogon/consultas` (ver arriba). Nada falló en portada, descubrir-publico, login ni marco.
- Guion manual con curl: pasos 1, 3, 4 y 6 verificados. Los pasos 2 y 5, y el ⚖ con teclado, los cubrió Playwright, no se hicieron a mano.
- Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/190#issuecomment-7101384306
- Quedaron carpetas de una corrida contra el preview en `test-results/` de `.carriles/m3` (git las ignora).

## Para la próxima noche
- Cerrar la tarea 3.2 apenas el preview se pueda abrir: `BASE_URL=<url> pnpm test:e2e e2e/portada.spec.ts`.
- Cambio aparte para `/fogon/consultas`: que las pruebas no dependan de la fecha.
- Aplicar lo que decidas de los puntos 2 a 5 (son textos y una lista, no hace falta código nuevo).
- Recordatorio de proceso: editar `tasks.md` con Edit o Write, no con `sed -i`.
