# Noche 2026-10-07 — tribu-ficha-completa
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/26 · **Preview:** https://lighthouse-platform-bw88nybj9-net-xg-en.vercel.app

## En una línea
La ficha de cada tribu quedó completa (plata, roles, licencia, red de confianza y acciones simuladas) y está lista para tu revisión, pero 3 tests de la suite completa fallan en el preview (parecen del entorno, no del PR) y falta que decidas un detalle de texto.

## Qué quedó hecho (tareas 8/9)
Hechas: 0.1, 1.1, 1.2, 2.1, 2.2, 3.1, 4.1, 4.2. Pendiente: 5.1 (marcarla en `tasks.md`).

- Las 12 tribus tienen plata, roles y avales copiados del mock-up v6 (un test los compara con el HTML).
- Los textos legales de licencia y adherente son copia textual del mock-up, por eso no llevan marca de borrador.
- El medidor ahora vive en `components/medidor.tsx` y Sumarte lo usa desde ahí.
- Ficha de tribu activa o en formación: medidores de plata y roles, licencia y adhesión con ⚖, tarjeta "Red de confianza" (avatares decorativos, marcada "(ejemplo)") y acciones.
  - "Proponer mi pacto" aparece solo si `/pactos` existe en la navegación.
  - "Entrar a la sala" es simulado y avisa con un mensaje accesible.
- Barrio vacante: texto del mock-up con ⚖, medidores y tarjeta "¿Tenés una tribu?" con "Proponer mi tribu" simulado.
- Aviso "Prototipo interno · datos de ejemplo" en las fichas.
- Ningún cobro real; todo es simulado.
- La tarea 5.1 (e2e contra el preview) la corrió el tester y pasó para `tribus.spec.ts` (23 de 23). Falta que la marques si la das por cumplida. Tampoco hay capturas en el PR, que la tarea pedía.

## Qué decidir a la mañana
1. **Las 3 fallas del e2e completo en el preview** (alta).
   - Fallan `fogon.spec.ts:33`, `pactos.spec.ts:49` y `perfil.spec.ts:97`. Son tests que cuentan pedidos de red.
   - En el preview aparecen pedidos extra (la barra de Vercel `vercel.live` y precargas del propio sitio). Ninguno toca archivos del PR.
   - El tester no los corrió en local para confirmarlo, y no se hizo vuelta de corrección por eso.
   - Acción sugerida: correr esos 3 tests en local o en CI (sin la barra de Vercel). Si pasan, son del entorno; si fallan, hay que corregir antes de mergear.
2. **Singular de avales** (baja, el revisor pide tu decisión).
   - La spec pide "<N> personas de la red avalan a esta tribu". Con 1 aval (Barda Productiva) la ficha dice "1 persona de la red avala a esta tribu". El mock-up dice "1 personas".
   - Acción sugerida: aceptar el singular (es gramaticalmente correcto) y ajustar la spec al archivar. Si no, pedir que se cambie.
3. **Al archivar el cambio**: quitar de las specs vigentes los requisitos viejos "sin USD ni avales" de `tribus-directorio` y `accesibilidad-auditoria`. Ahora solo aplican al listado `/tribus`.
4. **Marcar 5.1 en `tasks.md`** si das por buena la prueba contra el preview.
5. **Sin revisión visual a ojo**: nadie miró la ficha en pantalla ni hay capturas. Conviene que la abras en el preview (`/tribus/valle`, `/tribus/avelan`, `/tribus/grano`).

## Revisor: veredicto y hallazgos
Primera vuelta: con observaciones. Segunda vuelta: **listo para revisión humana**.
- Hallazgo 1 (bajo): el test del ⚖ de licencia apretaba Tab una vez y luego forzaba el foco por código, así que no probaba el acceso por teclado. **Resuelto** (commit 17eb13a): ahora llega con Tab, hasta 80 pulsaciones, sin forzar el foco. El revisor miró el diff pero no corrió el test.
- Hallazgo 2 (bajo): el singular de avales. **Queda para vos** (ver arriba).
- Proceso: `tasks.md` se editó con `sed -i`, que CLAUDE.md prohíbe. El contenido quedó correcto.
- Las 7 exigencias de la spec quedaron cubiertas; sin cobros reales, solo colores del tema y sin `<main>` propio.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/26#issuecomment-6044987394 y https://github.com/netxgen-2050/lighthouse-platform/pull/26#issuecomment-6045012129

## Tester: resultado
Pasa, con 3 fallas del e2e completo que parecen del preview (ver arriba).
- `e2e/tribus.spec.ts` contra el preview: 23 pasaron, 0 fallaron.
- Suite completa contra el preview: 187 pasaron, 3 fallaron (también en el reintento).
- Guion manual de 7 pasos, todos bien: medidores, ⚖ con Tab, red de confianza, sala simulada sin cambiar la URL, mapa y pactos, Barrio 3 vacante, listado sin USD ni avales.
- Aviso de prototipo en las 12 fichas y la auditoría de accesibilidad (axe) pasa.
- Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/26#issuecomment-6045060428

## Para la próxima noche
- Confirmar las 3 fallas en local o CI y, si son reales, corregirlas.
- Que `pnpm build` corra completo tras la última corrección (en la vuelta de corrección no se corrió; solo compiló el build de Playwright). `pnpm verificar` sí quedó en verde (304 tests).
- Sacar capturas de las fichas para el PR.
- Editar `tasks.md` siempre con Edit, no con `sed -i`.
- Archivar el cambio con `/opsx:archive`, ajustando las specs (requisitos viejos y singular de avales) según tu decisión.
- Nadie mergeó ni tocó `main`; el merge es tuyo.
