# Noche 2026-10-13 — descubrir-publico
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/60 · **Preview:** https://lighthouse-platform-5scqwh4u2-net-xg-en.vercel.app

## En una línea
Ahora cualquiera puede explorar el Inicio, el Territorio y las Tribus sin entrar; el tester pasó (tras una primera falla que era de los tests, no de la app), pero quedan 3 cosas que tenés que decidir vos y una ruta (el login real de Privy) que nadie probó.

Nada falló al final. Lo único que falló en el camino: la primera prueba del tester (7 tests rotos porque asumían que no había Privy); se arregló en los tests, sin tocar la app. No hubo bloqueos de permisos ni de Vercel. Nadie mergeó.

## Qué quedó hecho (tareas 4/4)
- Lista única de rutas públicas: `/`, `/territorios/[id]`, `/tribus`, `/tribus/[id]`, `/tribus/[id]/manifiesto`. El resto (por ejemplo `/pactos` y `/sumarte`) sigue mostrando la pantalla de entrada.
- Los botones que necesitan cuenta se reemplazaron por llamados a entrar: "Entrá para adherir", "Entrá para proponer una comunidad", "Entrá para consultar por este lote". La persona vuelve a la misma página al entrar.
- Menú lateral con candado y "Entrá para ver" en Participar y Sumarte; la barra de arriba solo tiene "Entrar"; "Reportar" solo con sesión; Hifa funciona sin sesión pero pasarle una idea al equipo pide entrar.
- Sin sesión no se guarda nada en el navegador.
- Se agregó el aviso "Prototipo interno · datos de ejemplo" en `/territorios/[id]` y `/tribus`, que no lo tenían.
- Tests: 581 unitarios, e2e local 454, todo en verde. Hay un e2e nuevo: `e2e/descubrir-publico.spec.ts`. `e2e/login.spec.ts` y `e2e/territorio-mapa.spec.ts` se ajustaron.

## Qué decidir a la mañana
1. **Hifa pisa la idea al entrar (media, sin corregir).** `components/hifa/hifa.tsx:59-60`. Si alguien con una charla vieja escribe una idea sin sesión y toca "Entrá para pasárselo al equipo", al entrar ve la charla vieja y la idea se pierde. Acción sugerida: pedir al implementador que, al entrar, conserve la idea pendiente y no cargue la charla guardada encima (o que la ofrezca como continuación). Hay que decidir cuál comportamiento querés.
2. **Enlaces del Inicio a Perfil, Congreso y Sumarte.** Sin sesión llevan directo a la pantalla de entrada, sin avisar, mientras el menú sí muestra candado y "Entrá para ver". Acción sugerida: elegir entre (a) dejarlos así, (b) ponerles candado y "Entrá para ver" también en el Inicio, o (c) ocultarlos sin sesión.
3. **"Seguir explorando" no estaba en la spec.** El implementador lo agregó: es un botón en la pantalla de entrada, cuando se pidió entrar en una página pública y no hay Privy, para poder volver sin entrar. El revisor lo ve justificado. Acción sugerida: confirmarlo o pedir que se saque.
4. **"Entrá para pedir tu pacto" no se hizo.** Lo mencionaba la propuesta, pero no hay ninguna página pública donde iría (Proponer mi pacto solo lo ven miembros, que ya tienen sesión). Acción sugerida: decirme en qué página querés ese llamado, o sacarlo de la propuesta.
5. **Origen de campaña `?camino=` del Inicio.** Se sigue guardando sin sesión, sin prefijo de persona (no es dato de persona). Acción sugerida: dejarlo, o pedir que tampoco se guarde (cambio chico).
6. **Login real de Privy sin probar.** El tester no pudo hacer el paso 7 del guion (entrar con Privy real y volver a la misma página), y los 6 tests de la pantalla "Entrar como…" no corren contra el preview, solo en e2e local. Acción sugerida: probarlo a mano una vez en una ventana privada contra el preview antes de mergear.
7. **Comentarios viejos en el PR.** Hay tres comentarios de sepu85 que solo dicen "--body" (intentos fallidos de los agentes, a las 17:55, 18:06 y 18:28). Conviene borrarlos desde GitHub.
8. **Detalle de proceso.** El implementador marcó las tareas con `sed -i`, que CLAUDE.md desaconseja. Sin consecuencias en el resultado, pero hay que recordárselo.

## Revisor: veredicto y hallazgos
Tres vueltas. Veredicto final: **listo para revisión humana**, con dos hallazgos bajos sin corregir (se alcanzó el máximo de dos vueltas de corrección).
- Vuelta 1: ⚠️. Sin Privy, "Entrá para…" mandaba a `/perfil` en vez de volver a la página (media, corregido); la finca elegida se perdía al entrar (baja, corregido: ahora va en `?sel=` de la URL); test condicional del barrio vacante (baja, corregido). Lo de Hifa quedó para vos.
- Vuelta 2: ⚠️ sin altas ni medias. El pedido de entrar reaparecía al volver a una página (corregido); el foco del teclado se perdía al tocar "Entrá para…" (corregido: pasa al contenido).
- Vuelta 3: ✅. Quedan dos bajos:
  - Sin Privy, al elegir una persona en "Entrar como…" el foco del teclado cae al inicio del documento (`components/sesion/proveedor-sesion.tsx:123-127`). Solo afecta al modo de prueba.
  - Informativo: tras "Entrá para pasárselo al equipo" el foco sale del chat de Hifa al contenido, y Escape ya no devuelve el foco al botón de Hifa. No lo consideran un error.
- Sin problemas con las reglas de CLAUDE.md (sin cobros reales, sin textos legales nuevos, solo tokens del tema, un único main, aviso de prototipo).

## Tester: resultado
- Vuelta 1: ❌. Contra el preview (que tiene Privy real) fallaron 7 tests de `e2e/descubrir-publico.spec.ts`. Eran de los tests, no de la app: esperaban la pantalla "Entrar como…" (que con Privy no existe) y el de almacenamiento no ignoraba las claves propias de Privy.
- Corrección: los 6 tests dependientes de "Entrar como…" se saltan cuando hay Privy y el de almacenamiento ignora claves de Privy y WalletConnect. La app no cambió.
- Vuelta 2: ✅ pasa. 444 pasaron, 0 fallaron, 9 saltados. Un flaky que pasó al reintentar (`e2e/panel.spec.ts:221`, no relacionado con este cambio). `descubrir-publico.spec.ts`: 15 pasaron, 6 saltados. Axe sin violaciones en las páginas públicas.
- Guion manual: pasos 1 a 6 cubiertos y en verde; **el paso 7 (login real de Privy) sin probar**. Limitación: no se pudo comprobar que el preview corresponda exactamente al commit b62d342.

## Para la próxima noche
- Resolver la decisión de Hifa (punto 1) y, si confirmás, el foco de teclado en `entrarComo`.
- Cubrir con una prueba la vuelta a la misma página con Privy real (hoy solo existe en modo sin Privy).
- Según lo que decidas en los puntos 2 y 4: candados en los enlaces del Inicio y/o el llamado "Entrá para pedir tu pacto".
- Antes de mostrar la plataforma fuera del equipo, sigue pendiente la revisión R14 de las reglas del prototipo.
