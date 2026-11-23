# Noche 2026-10-27-m — fogon-gobernanza-fractal
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/112 · **Preview:** no hay. El deploy de Vercel falló (ver más abajo).

## En una línea
El código está hecho y pasa `pnpm verificar`, `pnpm build` y casi todos los e2e en local, pero **la noche no cerró limpia**: el preview de Vercel falla, el tester quedó bloqueado, un e2e falló y varios puntos esperan tu decisión.

## Qué falló o quedó trabado (primero)
- **El preview de Vercel no se genera.** El deploy falla un segundo después de arrancar, en los dos commits del PR y también en el de la base, mientras el build local pasa. Parece un problema de configuración o de la cuenta de Vercel, no del código. Hay que mirarlo con `vercel inspect`.
- **El tester no pudo probar sobre el preview** y no recorrió el guion manual de 8 pasos. En Playwright local pasaron 738 y falló 1.
- **El PR está encadenado:** su base es `agente/fogon-limpieza`, no `dev`.
- **No se hizo la vuelta extra de corrección** después del revisor 2 ni del tester.

## Qué quedó hecho (tareas 8/9)
Todas las tareas de `tasks.md` están hechas menos la **5.1**, que quedó sin marcar porque depende de que `fogon-limpieza` esté integrado en `dev` (punto 1 de abajo).

- Modelo y registros en `lib/gobernanza`: círculos de ejemplo por tribu, un círculo transversal "Comunicación del común", y un Consejo con 8 lugares que dicen "Sin representante elegido". Los registros tienen forma de attestation y viven solo en el navegador (clave `lh-gobernanza`).
- Página nueva `/fogon/gobernanza` ("Cómo decidimos"): un dibujo SVG (se ve desde 640 px de ancho) y una lista anidada equivalente. Está en español e inglés. Suma 4 términos con ⚖ (círculo de trabajo, consejo, representante, validación del común), todos marcados `borrador: true`.
- El Fogón tiene filtros nuevos (Círculo, Lighthouse, Consejo) y el botón "Llevar al consejo" para quien lidera la tribu de origen.
- Las validaciones se ven en la ficha de tribu y en Mi recorrido.
- Tras la revisión: se corrigió el test de "sin red" y el SVG ahora dibuja los círculos como satélites (29 en total) con la marca "la tribu valida a la persona" (es/en). Se regeneró `docs/idioma/revisar-nativo.md`.

Decisiones propias del implementador, para que las conozcas:
- Agregó una decisión de ejemplo, "cisterna para la huerta de Valle Solar", como la que se puede llevar al consejo (la bomba solar ya aparece en Consejo).
- No hay botón para revocar una validación.
- Solo la página nueva tiene diccionario es/en.
- Que las 8 tribus estén validadas por el común es dato de ejemplo.

## Qué decidir a la mañana
1. **Base del PR (media).** La tarea pedía partir de `dev` con `fogon-limpieza` ya integrado, y no lo está en `origin/dev`. El PR quedó apuntando a `agente/fogon-limpieza`. Acción sugerida: decidir si integrás primero `fogon-limpieza` a `dev` y después se reapunta este PR (y se marca la 5.1), o si se revisa todo encadenado.
2. **Botón "Llevar al consejo" (media).** Actúa sobre la cisterna, pero la bomba solar ya está en Consejo sin el registro de "llevada al consejo" que exige la spec. Opciones: (a) dejar la cisterna y cargar un registro de ejemplo para la bomba solar; (b) que el botón actúe sobre la bomba solar y sacar la copia fija. Acción sugerida: (a), es el cambio más chico; vos decidís.
3. **Revocar validación (baja).** No hay botón. Acción sugerida: dejarlo para otra noche, salvo que la spec lo pida ahora.
4. **Textos nuevos del Fogón sin es/en (baja).** `fogon-cliente.tsx` y `page.tsx` tienen textos nuevos escritos a mano en español, sin diccionario. Acción sugerida: pasarlos al diccionario en una noche de idioma.
5. **Deploy de Vercel (bloqueante para probar el preview).** Revisar con `vercel inspect` por qué falla al segundo de arrancar. Sin esto no hay preview ni prueba manual.
6. **Falla e2e en `e2e/idioma.spec.ts:86`** ("sin sesión › el enlace del selector sigue la query cambiada sin navegar…"). Esperaba `/tribus?sel=valle&lang=en` y recibió `/tribus?lang=en`; se reprodujo 2 veces. El PR no toca `components/`, `app/layout.tsx` ni ese spec, así que probablemente ya fallaba en la base, pero **no se confirmó**. Acción sugerida: correr ese test en `agente/fogon-limpieza` para confirmar de dónde viene.
7. **Flecha del SVG (baja, no corregida).** En `estructura-svg.tsx:150` la flecha "sube al consejo" arranca suelta en (490,540), unos 40 px debajo de la caja de Valle Solar, y puede leerse como que solo Valle Solar sube. La lista lo dice bien. Acción sugerida: anclar la flecha al borde del grupo de círculos en una vuelta corta.

## Revisor: veredicto y hallazgos
**Primera revisión:** con observaciones, 7 hallazgos (los puntos 1 a 4 de arriba, más 3 corregibles):
- Test "sin red" de Mi recorrido no validaba nada. **Corregido.**
- SVG sin satélites de círculos ni marca de validación. **Corregido.**
- Tarea 5.1 sin marcar. Sigue pendiente, depende del punto 1.

**Segunda revisión:** con observaciones. Confirmó que los dos arreglos están bien y que no hay regresiones. `pnpm verificar` (1345 tests) y `pnpm build` en verde; e2e de gobernanza 28/28. Un hallazgo nuevo, de gravedad baja y sin corregir (punto 7). Siguen pendientes los puntos 1 a 4, y apareció el problema del deploy de Vercel (punto 5).

## Tester: resultado
**Falló / bloqueado.**
- `scripts/preview-url.sh` informó que el deploy de Vercel falló para el commit `0e1934f`, así que no se probó nada sobre el preview ni se hizo el guion manual de 8 pasos.
- Playwright local: 738 pasaron, 1 falló (punto 6).
- No se hizo la vuelta extra de corrección del tester.
- **Sin probar:** el SVG a 640 px o más y el flujo de líder "Llevar al consejo" (solo hay cobertura por e2e).

## Para la próxima noche
- Resolver el deploy de Vercel y volver a correr al tester sobre el preview, con el guion manual completo.
- Confirmar si la falla de `e2e/idioma.spec.ts:86` ya existía en `agente/fogon-limpieza`.
- Aplicar lo que decidas en los puntos 1 y 2; después marcar la 5.1.
- Anclar la flecha "sube al consejo" del SVG.
- Pasar a diccionario es/en los textos nuevos del Fogón, y evaluar el botón para revocar validación.
- Nada se mergeó ni se tocó en `dev` ni en `main`.
