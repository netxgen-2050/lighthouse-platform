# Noche 2026-10-07 — contactos-bandeja
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/33 (base `agente/estado-administrativo`) · **Preview:** https://lighthouse-platform-n9zjxruk8-net-xg-en.vercel.app

## En una línea
Nada falló y la prueba sobre el preview pasó completa, pero queda un detalle sin corregir (un aviso que dice algo impreciso en un caso raro de guardado) y hay cinco cosas que te toca decidir.

## Qué quedó hecho (tareas 9/10)
Ahora toda consulta o pedido (consultar por un lote, pedir invitación al círculo, pedir una charla) pasa por un mismo formulario. El pedido se guarda en una bandeja y se ve en la Vista NetX (`/netx`). Es todo simulado: no se piden email ni teléfono y nada sale del navegador.

- Hecho: tareas 0.1 a 3.2 (modelo, término legal `contacto` en borrador, formulario, finca de Soluna con aviso del estado administrativo, `/sumarte`, bandeja en `/netx`, tests e2e y de accesibilidad).
- Falta marcar: la tarea 4.1 sigue sin tildar en `tasks.md`. Lo que pedía ya está hecho: `pnpm verificar` en verde (358 tests), PR abierto y e2e de contactos pasado sobre el preview. Se puede tildar al aprobar.
- "Borrar todo" del panel también limpia la bandeja.

## Qué decidir a la mañana
1. **Quedó sin corregir (baja, el revisor lo dejó por el límite de dos vueltas).** En `app/sumarte/sumarte-cliente.tsx:94`, si se guarda el pedido pero falla guardar la página de `/sumarte` (por ejemplo, almacenamiento lleno), la alerta dice "la elección no se puede guardar" aunque el pedido sí quedó guardado, y el formulario queda abierto sin confirmación. Acción sugerida: cambiar el texto a "el pedido se guardó, pero la página no puede recordar la invitación/charla". Es texto de interfaz, no legal. Es un arreglo chico para la próxima noche.
2. **Mismo caso, qué hacer con el pedido (decisión tuya).** Hoy en ese caso la bandeja tiene el pedido, pero `/sumarte` no muestra "Invitación pedida" ni suma al medidor. Opciones: (a) dejarlo y solo corregir el aviso (punto 1), o (b) borrar el pedido de la bandeja si falla guardar la página. Sugerencia: (a); es un caso muy raro y en un prototipo no vale la complejidad.
3. **Consultas viejas.** Las consultas hechas antes de este cambio (guardadas en `lh-consultas-lotes`) ya no muestran "Consulta enviada (simulado)". ¿Se migran? Sugerencia: no migrar; es un prototipo con datos de ejemplo. La clave se sigue borrando con "Borrar todo".
4. **Referencias inventadas.** La spec no las definía: la charla de inversión se llama "Invertir en NetX" y una finca sin número se muestra como "Finca sin número (<id>)". Acción: confirmar o cambiar los textos.
5. **Columnas extra en `/netx`.** Se agregaron "Mejor momento" y "Mensaje". Son texto libre que escribe la persona y la spec no las enumeraba. Acción: dejarlas o sacarlas.
6. **Texto del ⚖ contacto.** Está marcado como borrador (`borrador: true`), como dice el design. Hay que revisarlo antes de cualquier uso real.
7. **Consentimiento.** La bandeja guarda sin consentimiento porque no pide datos personales; el consentimiento (C16) llega con `privacidad-consentimiento`.

## Revisor: veredicto y hallazgos
Veredicto final: ⚠️ con observaciones menores, no bloquean. Hizo tres pasadas.

- Pasada 1: 1 alta (el e2e del territorio esperaba "Consulta enviada" sin enviar el formulario), 1 media (la lectura de la bandeja no validaba tipos y aceptaba claves heredadas como `toString`, lo que podía romper `/netx`) y 3 bajas. Se corrigió todo salvo la migración de consultas viejas (punto 3).
- Pasada 2: apareció una regresión media. En el caso de fallo parcial, reenviar duplicaba el pedido. También faltaban tests de esas ramas. Se corrigió: cada formulario tiene un id estable, la bandeja no duplica por id, y hay un test unitario y dos e2e.
- Pasada 3: quedan solo los puntos 1 y 2 de arriba. Confirmó que lo anterior quedó bien. `pnpm verificar` en verde (358 tests).
- Reglas de CLAUDE.md: sin hallazgos (tokens del tema, un solo `main`, errores con texto y ▲, "sin dato" en opcionales, sin secretos).

## Tester: resultado
✅ Pasa, sin bloqueos. Suite completa sobre el preview: 241/241. `e2e/contactos.spec.ts`: 16/16. Los pasos 1 a 8 del guion quedaron verificados mediante los tests e2e contra el preview. **No hubo una pasada manual aparte en un navegador**; si querés verlo con tus ojos, el recorrido es: finca 502, consultar, pedir invitación, pedir charla, ver los tres en `/netx`, borrar todo desde `/panel`. Detalle: https://github.com/netxgen-2050/lighthouse-platform/pull/33#issuecomment-6047936463

## Para la próxima noche
- Corregir el texto de la alerta en el caso "avisado" (punto 1), o implementar (b) si la elegís.
- Aplicar lo que decidas sobre referencias, columnas extra y migración de consultas viejas.
- Tildar la tarea 4.1 y archivar el cambio (`/opsx:archive`) después de que lo apruebes.
- Este PR apunta a `agente/estado-administrativo`: mergear primero esa base, o reencauzar el PR a `main`.
- Pendiente aparte: `privacidad-consentimiento` (C16) y revisar el texto legal antes de mostrar la plataforma fuera del equipo.
