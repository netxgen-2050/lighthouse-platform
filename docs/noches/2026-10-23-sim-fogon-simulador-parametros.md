# Noche 2026-10-23 (carril sim) — fogon-simulador-parametros
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/107 · **Preview:** no disponible (el deploy de Vercel falló)

## En una línea
El simulador del Fogón quedó hecho y revisado, pero el preview de Vercel falló, así que todas las pruebas se hicieron en local y falta confirmarlas en el preview.

## Lo que falló (leer primero)
- **El preview de Vercel falla** en los dos últimos commits (7284fb8 y a9f6a2b). El estado queda en "failure" a los pocos segundos de arrancar. Link del intento: https://vercel.com/net-xg-en/lighthouse-platform/qAjdbML5R9CXRq6ZUyRFMZQp8uSX
- El build local (`pnpm build`) pasa. La causa no se investigó porque los agentes no tienen acceso al log de Vercel.
- Por eso **el tester quedó bloqueado para el preview**. Todas las pruebas de abajo corrieron en local, no en el preview.
- El guion manual del tester no se recorrió a mano. El paso 7 quedó cubierto a medias: no se verificaron punto por punto el costo por MW (400.000), la energía (150) ni el excedente (50 %).

## Qué quedó hecho (tareas 12/12)
- El modelo de cascada de series (`series_waterfall_sim.py`, v0.1 del 17-oct-2026) se pasó a TypeScript en `lib/series/`. Corre en el navegador, sin red y sin dependencias nuevas.
- Los tests reproducen las filas y totales del Viñedo y la Agrovoltaica, y los USD 1.000 en Unidades (2.663 y 2.835), sin diferencias con el .py.
- Agregados propios de la plataforma: conversión del SAFU y TIR por encima de 100 % anual.
- Pantalla nueva `/fogon/simulador`, enlazada desde `/fogon`.
- `lib/legal/terminos.ts` suma seis términos legales con ⚖, todos marcados `borrador: true`. `components/donut.tsx` suma la prop `columnaEtiqueta`.
- `pnpm verificar` y `pnpm build` en verde.

## Qué decidir a la mañana
1. **Revisar Vercel (acción sugerida: mirar el log del deploy).** Sin preview no hay prueba en el entorno real. Hay que ver por qué falla y, una vez resuelto, pedir que el tester confirme en el preview.
2. **Hallazgo 5, frases literales (acción sugerida: decidir entre cambiar la spec o la pantalla).** La spec pide frases completas como "Parte de Notas Verdes: 60 %", "Tasa de las Notas Verdes: 7 %" y "Múltiplo de salida: 3 veces". La pantalla muestra la etiqueta y el valor por separado (`simulador-cliente.tsx:46-50`). Si la separación te sirve, se ajusta la spec. Si no, se cambia la pantalla.
3. **Hallazgo 6, bitácora (acción sugerida: aceptarlo como excepción o pedir que se quite).** Abrir un ⚖ escribe en la bitácora de localStorage (`lib/demo/anotar-en-bitacora.ts:13`). Eso choca con la frase de la spec "Sin red ni guardado". Es un guardado local, no sale a la red. Hay que decidir si es una excepción aceptada.
4. **Supuestos a confirmar con Vagner (acción sugerida: pasarle la lista).** Múltiplo de salida, estructura de capital, reserva y curva escalada.
5. **Capturas pendientes.** No se adjuntaron capturas de los dos escenarios (Viñedo y Agrovoltaica). Quedan para cuando haya preview.
6. **ADR-010.** No hay choque con el simulador y sigue en estado Propuesta. No requiere acción ahora.

## Revisor: veredicto y hallazgos
- **1.ª pasada: con observaciones** (6 hallazgos bajos, ninguno alto ni medio). Seguridad limpia y sin alcance fuera de spec. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/107#issuecomment-6372263513
  1. Se mostraba "USD 0" en "Pone" de Procomún y NetX, contra la regla "el dato que falta no es cero".
  2. "—" en Múltiplo y TIR sin explicación para la clase sin capital.
  3. El e2e no verificaba la marca de borrador del ⚖ de Primera pérdida.
  4. El e2e de Más regalía solo probaba 5,5 % y año 7.
  5. Frases literales de la spec (ver decisión 2).
  6. Escritura en la bitácora (ver decisión 3).
- **Vuelta de corrección:** el implementador resolvió 1 a 4 (commit a9f6a2b) y dejó 5 y 6 sin tocar a propósito, porque son decisiones tuyas. Ahora "Pone" muestra "—", hay una nota que explica el "—" y la clase con 0 %, y se sumaron tests nuevos. No había corrido axe después del cambio.
- **2.ª pasada: listo para revisión humana, 0 hallazgos nuevos.** Comprobó que 1 a 4 están resueltos. Corrió `pnpm verificar` (verde) y Playwright del simulador con axe (23 tests, pasan, incluido axe en los dos escenarios). Señaló que el preview de Vercel falla. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/107#issuecomment-6372356799

## Tester: resultado
- **Bloqueado para el preview.** `scripts/preview-url.sh` devolvió "El deploy de Vercel falló", y el orquestador lo confirmó con la API de status del commit. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/107#issuecomment-6372410466
- **En local (no es el preview):** `pnpm test:e2e` con servidor propio dio 612 pasaron y 0 fallaron, incluidos el simulador y axe en las 32 rutas.
- No hizo falta segunda vuelta del tester porque no hubo fallas.
- Pendiente: confirmar en el preview cuando Vercel funcione.

## Para la próxima noche
- Una vez resuelto Vercel, correr al tester contra el preview: guion manual completo, con el paso 7 punto por punto (costo por MW 400.000, energía 150, excedente 50 %).
- Sacar las capturas de los dos escenarios en el preview.
- Aplicar lo que decidas sobre los hallazgos 5 y 6.
- Incorporar las respuestas de Vagner sobre los supuestos.
- Nadie mergeó ni tocó `dev` ni `main`.
