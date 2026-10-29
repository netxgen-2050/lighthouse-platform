# Noche 2026-10-28-m — pactos-dos-partes
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/129 · **Preview:** no hay (el deploy de Vercel falló)

## En una línea
El código está terminado y el revisor lo dio por bueno con observaciones, pero el tester no pudo probar nada porque no hay preview y el build local le falla: el cambio quedó sin verificación manual.

## Lo que bloquea (primero)
- **El tester quedó BLOQUEADO (no pasa ni falla).** Vercel dijo "El deploy de Vercel falló para dcca12c". También falló en b4541d1, 57c60d9 y 481b41d. `dev` está en verde.
- En local, el tester no pudo hacer `pnpm build` (ni `pnpm test:e2e`): 16 errores de Turbopack con la fuente Hanken Grotesk ("Can't resolve '@vercel/turbopack-next/internal/font/google/font'" y "next/font/google queries have exactly one entry"). No pudo confirmar la causa. El PR no toca `app/layout.tsx`, `package.json`, el lockfile ni `next.config.ts`.
- El implementador y el revisor sí corrieron build y e2e en esta misma rama pocas horas antes, así que puede ser un problema del entorno del tester y no del código. No está confirmado.
- Los 7 pasos del guion manual quedaron sin probar.
- El último commit (dcca12c) no lo revisó el revisor: hubo tope de dos vueltas. Su último veredicto ("con observaciones") es sobre 481b41d.

## Qué quedó hecho (tareas 13/13)
Todas las tareas de `tasks.md` están marcadas. Lo que hace el cambio:
- Pactos de dos partes de verdad: propone la persona y responde quien lidera la tribu. Las constancias son solo-agregar, en un registro compartido del navegador.
- `/pactos` ya no tiene botones "Simular…". Muestra "Esperando la respuesta de <tribu>" y "Retirar y editar". Término legal ⚖ `pactoDosPartes` (borrador).
- Pantalla nueva `/pactos/responder`: aceptar o no aceptar (el motivo es obligatorio). La tribu ve nombre de perfil o iniciales, nunca el email.
- En `/tribus/[id]` aparece "Pactos para responder (N)".
- Semillas, Perfil y el panel leen el pacto conciliado.
- "Mis datos" incluye las constancias. Retirar el consentimiento y "Borrar todo" las quitan.
- Textos en es/en. Helper de siembra en `e2e/ayudas.ts`.
- Decisiones propias del implementador:
  - `/pactos/responder` es ruta de espacio personal (cambió `lib/permisos/niveles.ts`).
  - `EVENTOS.pactoNoAceptado` recibe el id de la propuesta.
  - El aviso con motivo persiste hasta reenviar.
  - Se regeneró `docs/idioma/revisar-nativo.md`.
- Limitación: la verificación de quién responde es del navegador y solo sirve dentro del mismo navegador. La base de datos (P8/P9) lo resuelve.
- Fuera de alcance: "Pedir cambios".
- Pruebas del implementador: `pnpm verificar` (1675 tests) y `pnpm build` en verde. e2e completo 903/904; falló `e2e/configuracion.spec.ts:38`, que es intermitente y pasa solo.
- Aviso de proceso: el implementador usó `sed -i` una vez para marcar `tasks.md`. Va contra las reglas del repo, pero el resultado es correcto.

## Qué decidir a la mañana
1. **Decisión tuya (hallazgo 3, media):** si el super admin propone un pacto al Lighthouse, nadie puede responderlo, y la pantalla dice que lo responde "otra persona o el super admin" (que es él mismo). La spec no define quién responde. Acción sugerida: definir quién responde por el Lighthouse (por ejemplo, el super admin como respondedor explícito, o una regla de que no se proponen pactos al Lighthouse) y pedir el ajuste en una próxima noche.
2. **Ver los logs de Vercel** del deploy fallido. Acción: correr `npx vercel inspect dpl_2G2Dqod74G2bkf74GjsxGPSrt33E --logs` (los agentes no tienen acceso) para saber si el fallo es de la fuente de Google, de la red o del código.
3. **Revisar los textos borrador** (`borrador: true`), en especial el ⚖ `pactoDosPartes` y los textos nuevos de aceptar/no aceptar/retirar, antes de cualquier uso fuera del equipo.
4. **Volver a correr al tester** cuando el preview funcione. Hasta entonces, no mergear.
5. **Pendiente de documentación (hallazgo 7, baja):** el registro compartido de constancias es un dato personal nuevo y no está en el inventario de datos de NS_platform (`backend/01`). No lo anoté: queda para vos o para la próxima noche.

## Revisor: veredicto y hallazgos
**Vuelta 1: con observaciones (7 hallazgos).**
- Alta: ids de constancia repetidos tras borrar. Corregido.
- Media: retirar no verificaba la escritura. Corregido.
- Media: nadie responde si el super admin propone al Lighthouse. **Abierto, decide Gus** (ver arriba).
- Baja: el aviso de cambio no aceptado decía "no aceptó tu pacto". Corregido.
- Baja: el evento `cambioDePactoRechazado` no tenía clave. Corregido.
- Baja: `pactosConciliadosCrudo` sin uso. Corregido.
- Baja: falta anotar el dato nuevo en el inventario de NS_platform. **Abierto.**
- Huecos de tests que NO se cerraron: pantalla de "Perfil sin nombre" y "Fecha que falta", ficha de tribu con (2) pendientes, descarga de Mis datos (solo hay test unitario), Perfil con pacto conciliado. El implementador no halló esos textos literales y no era algo chico.

**Vuelta 2: con observaciones.** Las correcciones 1, 2, 4, 5 y 6 estaban bien. `verificar` y `build` pasaron (1675 tests). En los e2e de pactos-dos-partes, privacidad y pactos pasaron 61 y falló 1. Hallazgos nuevos, todos corregidos luego en dcca12c (sin revisión posterior):
- Media: `e2e/pactos.spec.ts:192-201` usaba un texto viejo. Se arregló con un regex.
- Baja: si falla el retiro, se mostraba "la comunidad no lo va a ver", lo contrario de la verdad. Se agregó el texto `noSePudoRetirar` (es/en) y un e2e.
- Baja: comentario desactualizado en `pactos-cliente.tsx:81`. Corregido.
- Nota del revisor: el preview de Vercel falla en 481b41d y 57c60d9 mientras `dev` está en verde.

Comentarios: [vuelta 1](https://github.com/netxgen-2050/lighthouse-platform/pull/129#issuecomment-6477005248) · [vuelta 2](https://github.com/netxgen-2050/lighthouse-platform/pull/129#issuecomment-6477545264)

## Tester: resultado
**Bloqueado: no pasa ni falla.** Sin preview y sin build local, no se probó ninguno de los 7 pasos del guion manual. Detalle arriba, en "Lo que bloquea". Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/129#issuecomment-6477677486

Después de la corrección 2, el implementador sí corrió `pnpm verificar` (1675 tests), `pnpm build` y los e2e de pactos, pactos-dos-partes y privacidad (63/63). Eso es evidencia del implementador, no del tester.

## Para la próxima noche
- Re-correr al tester cuando haya preview, o cuando se aclare el fallo de Vercel y del build local.
- Pedir una revisión del commit dcca12c, que nadie revisó.
- Implementar la regla de quién responde por el Lighthouse, según lo que decidas.
- Cerrar los huecos de tests de pantalla (Perfil sin nombre, Fecha que falta, tribu con (2) pendientes, descarga de Mis datos, Perfil con pacto conciliado).
- Anotar el registro compartido de constancias en el inventario de datos de NS_platform (`backend/01`).
- Opcional: "Pedir cambios" quedó fuera de alcance, por si querés abrir un cambio aparte.
