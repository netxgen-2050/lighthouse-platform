# Noche 2026-11-26-m — ux-mi-tierra
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/227 (base `agente/ux-celular`) · **Preview:** no disponible (ver "Bloqueo del preview")

## En una línea
Mi tierra ya funciona como "billetera de tierra" y pasa todas las pruebas en un build local, pero **no se pudo probar en el preview de Vercel**, la tarea 3.1 sigue abierta y hay cuatro decisiones que son tuyas.

## Qué quedó hecho (tareas 2/4 marcadas)
- [x] 1.1 Encabezado: lo pagado como número principal, barra de avance, cuotas y acciones que ya existían. Nunca aparece rendimiento, APY ni ganancia.
- [x] 1.2 Posiciones en filas (lote, FARO, tu voz). FARO sin primer pago dice "sin dato". La mini curva sale solo con 2 o más acreditaciones.
- [x] 1.3 Actividad con 8 filas, "Ver toda la actividad (N movimientos)" y filtro Todo, Pagos, Reservas, FARO. En el celular cada movimiento va en dos líneas, sin scroll horizontal.
- [ ] 2.1 Estado vacío: el dibujo, la acción "Explorar los lotes" y la vista previa "Así se va a ver" están hechos, pero la spec pide que lleve a `/explorar/lotes`, que no existe en esta base. Hoy lleva a `/explorar#lotes`. Queda sin marcar hasta que cambies la decisión o llegue la ruta.
- [ ] 3.1 Cierre. Hecho: `pnpm verificar` (199 archivos, 2858 tests), `pnpm build`, `openspec validate --strict`, e2e y axe de Mi tierra, y la suite completa en local. Falta: la suite en el preview y las capturas (390 y 1440 px, claro y oscuro, con y sin lote).

Los datos nuevos salen de `lib/mi-tierra/portafolio.ts`. No se tocó `lib/lotes/compra.ts`.

## Qué decidir a la mañana
1. **Los primeros 4 lotes: ¿suman a "lo pagado" y con qué precio?** (media, el más importante)
   - Hoy suman, y usan el precio del paquete (que incluye casa, una estimación sin presupuesto) y no el del lote. Ver `lib/mi-tierra/portafolio.ts` líneas 202-203. Eso mezcla bases distintas.
   - Contradice lo decidido en `rediseno-mi-tierra` (design, línea 40) y el código original. La spec admite las dos lecturas.
   - Acción sugerida: elegir una. Lo más seguro es que los primeros 4 no sumen, como antes, o que sumen solo el precio del lote. Dime cuál y se corrige en una ronda corta.
2. **Texto de las cuotas: "Cuota N de M" o "0 de 24 cuotas pagadas".** El prototipo solo simula el primer pago, así que hoy dice "0 de 24 cuotas pagadas". Acción sugerida: dejarlo así mientras no haya más pagos simulados, o decir la redacción final.
3. **Destino de "Explorar los lotes".** La spec dice `/explorar/lotes`, que llega con `explorar-unificado` (en `dev`). Hoy apunta a `/explorar#lotes` mediante la constante `RUTA_LOTES`. Acción sugerida: aceptar `/explorar#lotes` por ahora y cambiar la constante y el e2e cuando entre esa ruta, o esperar a ese cambio antes de mergear. Esto cierra la tarea 2.1.
4. **Cierre de la tarea 3.1.** Acción sugerida: cuando el preview funcione, correr la suite ahí y sacar las capturas; recién entonces marcar 3.1.

## Bloqueo del preview (lo primero que falló en las pruebas)
- `scripts/preview-url.sh` esperó 15 minutos y falló: "No apareció el preview de agente/ux-mi-tierra (1a06675…) en 15 minutos". Vercel marca éxito pero GitHub no registra ningún deployment.
- La URL que dejó el bot (`lighthouse-platform-git-agente-ux-2bc632-netxgen-2030-projects.vercel.app`) redirige a un login SSO.
- `scripts/curl-preview.sh` falla con "CABECERAS[@]: unbound variable" porque no hay cabecera de bypass configurada.
- Una consulta posterior a `preview-url.sh`, lanzada en segundo plano, se cortó por el límite de tiempo sin devolver URL.
- Consecuencia: el tester probó sobre un build local de producción del commit `1a06675`, no sobre el preview. Es una prueba válida del código, pero no de lo que ve el equipo en Vercel.
- Acción sugerida: revisar en Vercel si el preview de la rama existe y si tiene protección SSO, y darle al tester una cabecera de bypass (o desactivar la protección en previews). Revisar también el error de `curl-preview.sh` cuando no hay cabeceras.

## Revisor: veredicto y hallazgos
Tres pasadas. Veredicto final: **listo para revisión humana**.
- **1.ª pasada (con observaciones, 11 hallazgos).**
  - Alta: "escriturado/deeded" en el estado vendido, un término legal sin ⚖ que además sugiere una aprobación municipal otorgada.
  - Media: `aria-labelledby` a un id que no existe en el estado vacío; lo pagado solo sumaba lotes del plan; la actividad en celular tenía scroll horizontal; faltaban axe, e2e y capturas.
  - Baja: test "Ver todo" solo con 8 filas; test de FARO sin primer pago que no dibujaba la fila; `aria-labelledby` en un `<p>`; pastilla del filtro marcada solo por color.
  - Para Gus: los puntos 2 y 3 de arriba.
- **Corrección 1:** arregló los hallazgos 1 a 9 (vendido igual al chip, aria-label, suma de ambos tipos de lote, actividad en dos líneas, axe en 8 combinaciones, tests nuevos, `role=group`, marca ✓ en el filtro). Quedaron las capturas.
- **2.ª pasada (con observaciones).** Nuevos: [media] precio del paquete vs. lote (punto 1 de arriba); [baja] "Todavía no pagaste ninguna cuota" en lotes que no tienen cuotas; [baja] descripción del PR desactualizada. No pudo correr el e2e local porque `next build` no baja las fuentes de Google en su entorno.
- **Corrección 2 (`1a06675`):** texto nuevo sin cuotas ("Todavía no hiciste ningún pago" / "You have not made any payment yet") con test, y descripción del PR reescrita. No tocó el precio paquete vs. lote, porque es decisión tuya.
- **3.ª pasada: listo.** Sin hallazgos nuevos. Hay un aviso de lint que ya existía en `app/territorios/[id]/vistas/paneles.tsx` y no es de este cambio.

## Tester: resultado
**Pasa, pero probado en local, no en el preview.** Build de producción del commit `1a06675` en el puerto 3100.
- Suite completa de Playwright: 1398 pasaron, 1 falló, 3 omitidos. La que falla es `e2e/idioma.spec.ts:304` (f) "Configuración → English". Ya fallaba antes y viene de `ux-celular`; no toca Mi tierra.
- `e2e/mi-tierra` pasa completo.
- axe sobre `/mi-tierra`: sin violaciones en es y en, claro y oscuro, 390 y 1440 px, estado vacío y con compra en cuotas.
- Sin scroll horizontal. No aparecen las palabras rendimiento, APY, ganancia ni escriturado.
- Guion manual (pasos 1 a 5) y los 5 escenarios de la spec: cumplidos.
- El tema oscuro se verificó solo con axe y e2e, sin capturas.
- Las capturas quedaron en `/tmp/qa-mt-*.png`, fuera del repo, así que no están en el PR.
- Reporte completo: https://github.com/netxgen-2050/lighthouse-platform/pull/227#issuecomment-7184376559

## Para la próxima noche
- Con tu decisión del punto 1, ajustar `portafolio.ts` (líneas 202-203) y su test.
- Cambiar `RUTA_LOTES` y el e2e a `/explorar/lotes` cuando llegue `explorar-unificado`, y marcar 2.1.
- Arreglar el acceso al preview (SSO y cabecera de bypass) y corregir `scripts/curl-preview.sh`.
- Correr la suite en el preview, sacar las 8 capturas (390 y 1440, claro y oscuro, con y sin lote), subirlas al PR y marcar 3.1.
- Arreglar `e2e/idioma.spec.ts:304` (f), que viene de `ux-celular`, antes de mergear la serie.
