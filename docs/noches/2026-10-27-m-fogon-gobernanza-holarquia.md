# Noche 2026-10-27 (carril m) — fogon-gobernanza-holarquia
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/123 · **Preview:** no disponible (el deploy de Vercel falló)

## En una línea
El código está listo y pasa todo en local, pero el preview de Vercel falló, así que no se pudo probar sobre el preview y la tarea 6.2 sigue pendiente.

## Qué falló (primero)
- **El deploy de Vercel falló** en los commits `dda3af2` y `1c9a991` ("Deployment has failed", deploy `dpl_H3JQPfgwhTDQgvkeUg5PCYHb1CWh`). Logs: https://vercel.com/net-xg-en/lighthouse-platform/H3JQPfgwhTDQgvkeUg5PCYHb1CWh
- Nadie pudo leer la causa: el tester no tenía permiso para `npx vercel inspect`. Hay que mirar el log a mano.
- Lo que sugiere un problema de entorno (inferencia, no confirmada): el build local pasa, y el PR #124 (`rail-sin-compromisos`) también falla en Vercel desde las 22:10. La única dependencia nueva es `d3-hierarchy` (más `@types/d3-hierarchy`), con el lockfile al día.
- Consecuencia: los e2e contra el preview no se corrieron, y el guion manual (pasos 1 a 10) quedó sin recorrer en el preview.

## Qué quedó hecho (tareas 13 de 14 marcadas)
Hechas todas las de las secciones 1 a 6, salvo la 6.2:
- Modelo de la holarquía (círculos del común, consejo, transversal, 12 tribus, roles de ejemplo, lentes, caminos) y `d3-hierarchy` encapsulada en `lib/gobernanza/empaquetar.ts`.
- `/fogon/gobernanza` rehecho: dibujo con zoom, migas, panel de detalle, lista anidada accesible y cuatro lentes (Estructura, Propósitos, Decisiones que suben, Desde mí).
- Roles de cada persona (Ana con 2, Bruno con 3), con botón que hace zoom a cada círculo.
- Decisiones del Fogón con plazo, acuerdo y monto simulado (sin cifra dice "sin dato", nunca 0); decisiones nuevas de ejemplo: regalía (común) y cisterna compartida (consejo).
- Dos términos legales nuevos con ⚖ y `borrador: true`: doble enlace y dominio.
- Se borraron `lib/gobernanza/vista.ts` y `app/fogon/gobernanza/estructura-svg.tsx`.
- **Pendiente: 6.2.** Falta correr `BASE_URL=<preview> pnpm test:e2e e2e/fogon-gobernanza.spec.ts` contra el preview.

## Qué decidir a la mañana
1. **Mirar el log del deploy de Vercel** y ver si es del entorno o del cambio. Acción: abrir el link de arriba. Si es de entorno, volver a lanzar el deploy y recién ahí correr la tarea 6.2 y el guion manual. Si fuera de este cambio, la sospecha es `d3-hierarchy`.
2. **Lente "Decisiones que suben" y los roles de una persona.** Hoy, si elegís a Ana estando en esa lente, el panel no muestra sus roles (hace zoom, pero nada más). La spec no excluye ninguna lente; el diseño (§2) sí excluye esta. Acción sugerida: decidir una de dos. O se ajusta la spec y queda como está, o se hace que ese panel también muestre los roles (cambio chico).
3. **Datos de ejemplo de gobernanza inventados** (`lib/gobernanza/datos.ts`, líneas 21-58 y 62): los "Decide sobre" de los círculos de tribu, los propósitos y temas de Avelan Kerum y el "Decide sobre" del transversal los inventó el implementador, porque el boceto solo trae "Lo de X en Y" ahí. Además, dos propósitos no coinciden con el boceto: Olivos y aceite (acá es economía, en el boceto es tierra) y Hospedaje (acá es comunidad, en el boceto es economía). Acción sugerida: aprobar los datos tal cual (son de ejemplo y se pueden cambiar) o pedir que se alineen con el boceto; como mínimo, corregir esos dos propósitos.
4. **Datos de ejemplo del Fogón inventados** (`lib/fogon/datos.ts`, líneas 160, 171 y 176): monto de 4800 USD, fechas de cierre y nombres de acuerdo ("Pacto de regalía regenerativa (ejemplo)", "Norma de uso compartido del agua (ejemplo)"). Además, la regalía usa como base legal el art. 35 del Reglamento de Soluna (fondo comunitario y contribución mensual), cuyo texto no habla de regalías. Acción sugerida: aprobar las cifras y nombres como ejemplo, y confirmar si el art. 35 corresponde o sacar esa base.
5. **Decisiones propias del implementador a aprobar** (están en el PR): propósitos y "Decide sobre" de tribus y Avelan Kerum (ver punto 3); las personas de relleno se llaman "Eva G.", "Facu L." (nombre más inicial) para que cada nombre sea una sola persona; el panel dice "Roles del círculo" y no "Roles" (el test de diccionarios no admite el mismo texto en español e inglés); "Quién valida a quién" quedó debajo de la lista para que el dibujo se vea sin scroll; los rótulos de círculos que no entran no se dibujan (en el nivel del común varias tribus quedan sin rótulo y se leen en el panel o la lista); `lugaresMios` recibe además la lista de tribus válidas; `acuerdo.nombre` es bilingüe. Acción: dar el visto bueno o pedir cambios.
6. **Orden de archivado:** este cambio se construyó sobre `dev`, donde ya está `fogon-gobernanza-fractal` (PR #112). Para archivar este, primero hay que archivar ese.

## Desviaciones de proceso
El implementador rompió dos reglas de CLAUDE.md:
- Usó `sed -i` una vez para editar un archivo (debía usar Edit/Write).
- Usó `TZ=` antes de un comando (para el test de fechas en zona horaria de Argentina).
Fue en un archivo propio y en un test unitario, y no dejó efecto en el repo. Acción: ninguna sobre el código; si el test de fechas depende de `TZ`, vale confirmar que no se rompe en otra máquina. Si se quiere correr con otra zona, hay que dejarlo dentro de un test y no en la línea de comandos.

## Revisor: veredicto y hallazgos
Veredicto: con observaciones (⚠️), en las dos rondas. Sin hallazgos altos.

**Ronda 1** (0 altos, 1 medio, 6 bajos): https://github.com/netxgen-2050/lighthouse-platform/pull/123#issuecomment-6454731778
- Medio, corregido: las etiquetas de persona no medían el texto y se salían del círculo.
- Bajos, corregidos: tocar el círculo ya enfocado no hacía nada; el ⚖ de doble enlace estaba mal ubicado; textos sin uso en `lib/idioma/textos/gobernanza.ts`.
- Bajos, de decisión de Gus: lente Decisiones sin roles de la persona, datos de gobernanza inventados, datos del Fogón inventados (puntos 2 a 4 de arriba).

**Corrección** (commit `1c9a991`, https://github.com/netxgen-2050/lighthouse-platform/pull/123#issuecomment-6454888161): se arreglaron los 4 puntos corregibles, con tests nuevos (`lib/gobernanza/zoom.test.ts` y un e2e para el clic en el círculo). Se quitaron 4 textos sin uso y se actualizó `docs/idioma/revisar-nativo.md` (124 a 120). Solo se corrieron 5 e2e (zoom y roles); los demás los corrió después el tester.

**Ronda 2** (0 altos, 0 medios, 4 bajos): https://github.com/netxgen-2050/lighthouse-platform/pull/123#issuecomment-6454951582
- Las 4 correcciones quedaron bien, sin regresiones. `pnpm verificar` (1609 tests) y `pnpm build` en verde.
- Quedan: el fallo de Vercel y los tres temas de decisión de Gus. Todos los requisitos de la spec están cubiertos salvo la tarea 6.2.
- Nota del revisor: la medida del texto es una estimación por cantidad de caracteres, y ningún e2e mide en el navegador que las etiquetas no se pisen.

## Tester: resultado
**Bloqueado contra el preview.** https://github.com/netxgen-2050/lighthouse-platform/pull/123#issuecomment-6455160650
- `scripts/preview-url.sh` salió con error: "El deploy de Vercel falló para 1c9a99114ee85067d963102d430de19986588bfa".
- Alternativa local (NO es el preview), sobre `1c9a991`: `pnpm build` en verde (59 páginas, con `/fogon/gobernanza`) y `pnpm test:e2e` con 880 pasados y 0 fallidos.
- Guion manual, pasos 1 a 10: sin recorrer (teclado, 390 px, `?lang=en`, movimiento reducido). Lo cubre en parte `e2e/fogon-gobernanza.spec.ts`, que pasó en local.
- No hubo ronda de corrección del tester porque no hubo fallas de código.

## Para la próxima noche
- Destrabar el preview de Vercel (ver el log) y, con el preview andando, cerrar la 6.2: correr `BASE_URL=<preview> pnpm test:e2e e2e/fogon-gobernanza.spec.ts` y recorrer el guion manual del PR.
- Aplicar lo que Gus decida sobre la lente Decisiones y los datos de ejemplo (puntos 2 a 4).
- Una vez mergeado, archivar primero `fogon-gobernanza-fractal` y después este cambio.
- Sumar un e2e que mida en el navegador que las etiquetas de persona no se pisan.
