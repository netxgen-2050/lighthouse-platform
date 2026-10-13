# Noche 2026-10-13-2332 — sumarte-acceso
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/62 · **Preview:** https://lighthouse-platform-9gqedjzt4-net-xg-en.vercel.app

## En una línea
Sumarte pasó a ser la puerta de entrada: cualquier persona con email verificado entra como Explorador y los niveles (Explorador, Miembro, Líder de tribu, Super admin) salen de cómo se suma. Todo lo automático pasó; falta probar a mano el login real de Privy y tomar dos decisiones.

## Qué quedó hecho (tareas 5/5)
- Niveles de acceso en `lib/permisos/niveles.ts`: sin cuenta, Explorador, Miembro, Líder de tribu y Super admin. El nivel sale de lo que la persona elige en Sumarte y se guarda en el navegador.
- Acceso abierto: cualquier email verificado entra como Explorador. `LH_PERSONAS` solo ajusta el nivel por email. Para volver a la lista cerrada hay que poner `LH_ACCESO=lista` (documentado en `.env.example`).
- Sumarte es pública. Incluye Plan Tribu con Valle Solar u otra tribu, "Proponer una tribu nueva" (lleva a barrios vacantes) y subir o bajar de plan.
- El menú lateral muestra los destinos bloqueados (`aria-disabled`) con un enlace a Sumarte. Las páginas internas sin nivel redirigen a `/sumarte` con un aviso.
- "Entrá para…" pasó a "Sumate para…". Hifa y Reportar quedan desde Explorador.
- Corrección tras la revisión: se rechaza `volver` con caracteres de control o barra invertida (había una redirección abierta). El plan pendiente vence a los 5 minutos. Al volver se conserva la query.

## Qué decidir a la mañana
1. **Reportes con acceso abierto (media).** Cualquier cuenta de Privy puede crear issues vía `/api/reportes` con el token de GitHub, sin límite por persona. Opciones: (a) poner un límite por persona, (b) poner `LH_ACCESO=lista` en Production, (c) dejar Reportar solo para quienes estén en `LH_PERSONAS`. Sugerencia: (b) o (c) hasta tener el límite, porque el prototipo se va a abrir a más gente.
2. **Admin de tribu que propone una tribu nueva (baja).** Un admin-tribu en `LH_PERSONAS` que propone tribu nueva sigue figurando como admin de Valle Solar, mientras Sumarte dice "Tu tribu nueva está por proponerse". Acción sugerida: definir si deja de ser admin de Valle Solar al proponer o si ambas cosas conviven.
3. **Prueba manual del login real de Privy.** No se puede automatizar (el modal y Google recargan la página). Seguir los pasos 8 y 9 del guion del PR. El paso 9 (vencimiento a 5 minutos) tampoco se probó.
4. **Cuenta Privy sin email válido.** Recibe 403 con el aviso viejo "Pedíselo a Gus". Acción sugerida: cambiar el texto o aceptarlo para el prototipo.
5. **Pedido de adhesión guardado.** No se muestra en Explorador. Acción sugerida: decidir si debe mostrarse.
6. **Hifa sin cuenta.** Ya no aparece. Confirmar que es lo que querés.
7. **Aviso en Vercel.** `LH_PERSONAS` ya no es lista de acceso. Si querés lista cerrada hay que poner `LH_ACCESO=lista` en Vercel.

## Revisor: veredicto y hallazgos
- **1ª vuelta:** con observaciones. 0 altos, 2 medios, 4 bajos. La spec quedó cubierta y no hubo problemas con CLAUDE.md.
  - Corregidos: redirección abierta vía `volver` (media), plan pendiente abandonado que se aplicaba después (baja), query perdida al volver (baja). El e2e del login real quedó como prueba manual (baja).
  - Pendientes de tu decisión: reportes abiertos (media) y admin-tribu contra tribu nueva (baja). Ver puntos 1 y 2.
- **2ª vuelta:** con observaciones. 0 altos, 0 medios, 4 bajos. Las correcciones se verificaron (tests 33/33).
  - Hallazgo nuevo (baja): el vencimiento de 5 minutos no cubre todo. Si cierra el modal de Privy y entra con "Entrar" antes de los 5 minutos, igual se aplica lo pendiente. Si registrarse tarda más de 5 minutos, se pierde la elección sin aviso. La solución completa es borrar lo pendiente al cancelar el login, y para eso hace falta un evento de cancelación fiable. No se hizo una tercera vuelta.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/62#issuecomment-6156926937 y https://github.com/netxgen-2050/lighthouse-platform/pull/62#issuecomment-6156964620

## Tester: resultado
Pasó. Playwright contra el preview: 456 pasaron, 0 fallaron, 8 salteados. Un test inestable (`perfil.spec.ts:80`, sin relación) pasó al reintentar.
- Pasos 1 a 7 del guion: verificados solo con `e2e/sumarte-acceso.spec.ts` contra el preview, no a mano.
- Paso 8 (`/sumarte?volver=/%09/sitio.com`): carga con 200. No se probó el login ni que no salga del sitio (solo hay test unitario).
- Paso 9 (vencimiento a 5 minutos): no probado.
- Login real de Privy (modal y Google): no automatizable, queda para prueba manual.
- Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/62#issuecomment-6157014019

## Para la próxima noche
- Borrar el plan pendiente al cancelar el login, si se encuentra un evento de cancelación fiable.
- Agregar el límite de reportes por persona, según lo que decidas en el punto 1.
- Resolver el caso del admin de tribu que propone una tribu nueva, según el punto 2.
- Pensar cómo cubrir el login real de Privy con una prueba automática (por ejemplo, una cuenta de prueba).
- Después de la corrección, `pnpm verificar` (619 tests) y `pnpm build` quedaron verdes, pero no se volvió a correr la suite e2e completa en local. La corrida del tester sobre el preview la cubre.
