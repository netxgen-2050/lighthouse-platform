# Noche 2026-11-01-m — fogon-desde-mi-y-guardian
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/152 · **Preview:** no disponible (el deploy de Vercel falla)

## En una línea
**El cambio quedó PARCIAL y el preview de Vercel falla.** Está hecho el desafío del Guardián (modelo, reglas y pantalla de solo lectura) y el Pase Fundador con influencia en el Fondo Común. Faltan el formulario para responder el desafío y "Tus propuestas", y hay cinco decisiones tuyas que destraban el resto.

## Qué quedó hecho (tareas 4 de 9 hechas: 1.1, 1.2, 2.2, 4.1)
Si algo falló, primero eso:
- **Vercel:** los deploys de los commits 5ddd13a y d55d311 figuran como fallidos ("Deployment has failed"); el de 9cd1f21 quedó pendiente. El último commit (b633f12) también falló según el tester. Todo compila en local (`pnpm verificar` con 2193 tests y `pnpm build` en verde). La causa solo se ve en los logs de Vercel y los agentes no tienen credencial. No hay evidencia de que sea nuestro código, pero hay que mirarlo.
- **Nada se probó en el preview.** El tester corrió todo en local.

Lo que sí está:
- **Desafío del Guardián (1.1, 1.2):** existe el registro de respuesta al desafío. "Pasar de fase" hacia el llamado o la objeción queda no disponible, con el motivo "Falta responder el desafío del Guardián", mientras haya desafíos sin respuesta. El estado calculado aplica el mismo criterio: un cambio de fase sin respuesta se ignora y queda en el historial. En la bomba solar, Gala responde `b-g-impacto` y `b-g-reversible` queda sin responder.
- **Pantalla (parte de 2.1, solo lectura, es/en):** sección "El Guardián desafía esta propuesta", motivo junto a "Pasar de fase" y enlace desde la discusión.
- **Textos (2.2):** el ⚖ `guardianIA` presenta al Guardián como quien defiende la Voz de la Tierra, que desafía y nunca pausa ni decide. Un test de 4 casos verifica que ningún texto del Guardián ni de Hifa diga que un agente pausa o decide.
- **Pase Fundador (4.1):** la puerta pasa a `influencia-fondo-comun`, con etiquetas es/en y el ⚖ `influenciafondocomun` en borrador. No se construyó conviction voting.
- **Tus decisiones del 1-nov:** (1) desafío sin respuesta y fase vencida: se cierra sin llegar al llamado (aplicado solo a la decisión simple, ver abajo); (2) las afectadas respaldan y responden; (3) el Fondo Común lo administra el Consejo de la Fundación y ningún texto nombra una asociación custodia. El mock-up v6 conserva el texto viejo y no se tocó (está congelado).

**Qué falta:**
- **2.1 y 2.3:** el formulario para responder el desafío, el anuncio y el foco en la respuesta nueva, y sus e2e. No se hicieron porque la página es de solo lectura y no existe un almacén de registros en el navegador; el implementador no lo improvisó (el revisor confirmó que la razón es cierta).
- **3.1 y 3.2:** "Tus propuestas" en la lente Desde mí. Sin empezar.
- **5.1:** parcial. No se corrió el e2e contra el preview porque el preview falla.
- **Spec `pase-fundador-gobernanza`:** sigue desactualizada (design §4). Hay que corregirla antes de archivar este cambio, y antes hay que archivar `fogon-portada-holarquia`.

## Qué decidir a la mañana
1. **Hallazgo 2 (media): bomba vencida en Resolver.** Si vence con un desafío sin respuesta, hoy puede terminar "provisoria" o "sube" sin haber llegado al llamado. Aplicar tu decisión 1 acá rompía 7 tests de urgencia y revisión de la bomba, así que solo se aplicó a la simple. Acción sugerida: decidir si en la importante también se cierra sin llegar al llamado (y entonces se reescriben esos tests), o se acepta la regla de siempre.
2. **Hallazgo 3 (media): formulario de respuesta.** "Qué podés hacer" ofrece "Responder el desafío" pero no se puede hacer. Quedan sin cubrir los casos "Responde alguien del ámbito", "La persona afectada respalda y responde", "Respuesta vacía" y "Afectada en otro holón". Acción sugerida: elegir entre sumar el almacén de registros a este cambio o hacerlo en un cambio aparte (ADR-012/015), y mientras tanto sacar la oferta que no funciona.
3. **Hallazgo 4 (media): quién ve la sección.** La sección solo se muestra a quien puede leer la discusión; en la bomba (ámbito consejo) la red no la ve, y la spec dice que quien no es del ámbito "no responde" pero sí debería verla. La spec choca con la matriz de lectura A2. Acción sugerida: decidir cuál manda; si la red debe ver el desafío, se muestra en solo lectura y se ajusta la matriz.
4. **Hallazgo 6 (baja): "Guardián" en inglés.** La spec dice "The Guardián…" (con tilde) y el código usa "The Guardian…". Parece un error de tipeo de la spec. Acción sugerida: dejar "Guardian" y corregir la spec.
5. **Hallazgo 10 (baja): proceso.** El PR está apilado sobre `agente/fogon-portada-holarquia`, y en `dev` solo está la spec (PR 148), no la implementación. La noche 1 pedía un PR borrador con el Guardián completo. Acción sugerida: marcar el PR como borrador a mano (`scripts/pr.sh` no tiene esa opción) y definir en qué orden entran los dos PR a `dev`.
6. **'Pausada' para la simple vencida (revisor, 2ª vuelta, media): elegir (a) o (b).**
   - (a) Una simple que no llegó a objetar nunca se adopta, haya o no desafío, con un motivo neutro.
   - (b) Se acepta la excepción y se corrigen `design.md` §2 (dice "no se suma ningún Resultado 'pausada'") y el ⚖ `guardianIA` (`terminos.ts` líneas 623 y 627, promete cerrar "como cualquier propuesta que nadie hace avanzar", lo que no es exacto para la simple).
   - Está atada al punto 1: la bomba vencida en Resolver como "Pausada: no hubo consenso" tampoco cuadra con design §2. Si elegís (b), hay que cambiar el prefijo del motivo en `fogon-propuestas.ts` líneas 187 y 490. Hoy el texto es "Pausada: venció sin que nadie la llevara al período de objeción" (sin nombrar el desafío).
7. **Vercel:** revisar en el panel por qué falla el deploy. Sin eso no hay preview ni e2e contra preview.

## Revisor: veredicto y hallazgos
- **1ª vuelta: no cumple la spec** (1 alta, 3 medias, 6 bajas). No pudo publicar el comentario por permisos.
- **Corregidos tras la 1ª vuelta:** el 1 (alta: una simple con desafío sin respuesta que vencía terminaba "adoptada · nadie objetó", contra tu decisión 1), el 5 (faltaba axe y e2e en inglés), el 7 ("conviction voting" sin `translate="no"`), el 8 (comentario de `niveles.ts` que hablaba de Fideicomiso) y el 9 (texto `verEnDiscusion` sin uso).
- **Pendientes de decisión:** 2, 3, 4, 6 y 10 (arriba).
- **Regla 3 (Fondo Común): cumplida.** Solo el mock-up congelado conserva el texto viejo.
- **2ª vuelta: con observaciones** (0 altas, 1 media, 2 bajas), sin regresiones. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/152#issuecomment-6563452091. La media es lo de 'pausada' (punto 6). Las dos bajas (texto "Cerrada sin adoptar" dentro del grupo pausada con el desafío como causa, y "conviction voting" sin `translate=no` en el tooltip del ⚖) se corrigieron en el commit b633f12.
- **Sin 3ª revisión** (tope de dos vueltas). Las correcciones del commit b633f12 no fueron re-revisadas por el revisor; el tester sí corrió la suite sobre ellas.
- Un aviso de lint que ya estaba antes: `app/territorios/[id]/vistas/paneles.tsx:82`.

## Tester: resultado
Pasa en local; **no se probó en el preview** porque el deploy de Vercel del último commit falló. Con `pnpm build` en verde y el servidor de Playwright: 212 pruebas pasaron y 0 fallaron (fogon-propuestas, accesibilidad, pasaporte, sumarte, sumarte-acceso, idioma-portada-sumarte, idioma-pasaporte-semillas-pactos).

Verificado por aserciones e2e y curl, sin navegador a mano: la sección del desafío en la bomba (con la respuesta de Gala y un desafío sin respuesta, con "No pausa ni decide nada"), el motivo junto a "Pasar de fase", `?lang=en`, y `/sumarte` y `/pasaporte` con "Influencia en el Fondo Común". Ningún texto nombra una asociación custodia.

**No probado:** la regla de la simple vencida como 'pausada' (solo tests unitarios), el formulario de respuesta y "Tus propuestas" (no están hechos). Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/152#issuecomment-6563528458

## Para la próxima noche
- Resolver tus decisiones 1 a 6 antes de seguir; las tareas 2.1/2.3 dependen de la 2 (almacén de registros) y de la 3 (quién ve la sección).
- Hacer 3.1 y 3.2 ("Tus propuestas"), que no dependen del formulario salvo el caso "desafío sin respuesta deja la bomba en `responder`".
- Completar 5.1 (e2e contra el preview) cuando Vercel vuelva a desplegar.
- Corregir la spec `pase-fundador-gobernanza` y archivar primero `fogon-portada-holarquia`.
- Marcar el PR como borrador hasta que el Guardián y "Tus propuestas" estén completos.
