# Noche 2026-11-03-m — lote-ficha-y-compra
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/169 · **Preview:** no hay. El secreto de Vercel venció y `scripts/preview-url.sh` no funciona. Todo se probó en local.

Base del PR: `agente/loteo-plano-martin` (PR #168). Rama: `agente/lote-ficha-y-compra`.

## Lo importante primero
1. **No se pudo probar contra el preview de Vercel.** El secreto venció. Por eso la tarea 5.3 quedó sin hacer. Todo se probó en local (build y tests en verde, con tres fallas de tests que se explican abajo).
2. **La spec aprobada quedó desactualizada** (decisión tuya, punto 6 abajo).
3. **La política de privacidad subió de versión** y cada persona del equipo tiene que volver a aceptarla una vez (punto 3 abajo).
4. **El polígono del mapa no se repinta** cuando alguien reserva (decisión tuya, punto 7 abajo).

## En una línea
Ya se puede recorrer la compra de un lote de punta a punta como simulación (ver la lista, la ficha, reservar, "pagar", ver el boleto de ejemplo). No se cobra nada y todo queda guardado solo en el navegador. El revisor lo dejó "listo para revisión humana". El tester dice que pasa, con una falla intermitente que no es de este cambio.

## Qué quedó hecho (tareas 14/15)
- Hechas las tareas 1.1 a 5.2: modelo de lotes, compra simulada, textos legales, pantallas `/lotes` y `/lotes/[id]`, conexión con el mapa, "Hablar con alguien" y calidad.
- **Falta la 5.3:** probar contra el preview de Vercel. Imposible hoy por el secreto vencido.
- Sobre el plano de Martín (PR #168): 21 lotes de 1.680 a 2.798 m² en 32,3 ha. Las zonas "parcela" no son lotes y no se muestran como tales.
- El precio del lote va de USD 15.000 a USD 40.000, en forma lineal entre 1.680 y 2.798 m². Un test comprueba que esos extremos son los del plano.
- Estados de ejemplo: lotes 5 y 18 reservados, lote 13 vendido.
- Los tests leen los valores del loteo y del módulo; no los escriben a mano.
- La compra simulada se guarda en la clave `lh-lotes`, sin datos de identidad ni de pago. Entra en la descarga de "Mis datos" y en "Borrar todo".
- El boleto muestra lo que la persona vio al reservar: precio, aporte, expensa, precio de la casa, versión del modelo y fuente. Los registros viejos se siguen leyendo, con "sin dato".
- Motivo nuevo de contacto `consulta-lote-vrn`, con destino Equipo NetX.
- Cinco términos legales nuevos (⚖), todos en borrador y con inglés.
- No se tocó `datos/planos/`, `loteo-norte.json` ni `importar-loteo.ts`.
- **`modelo-hibrido-procomun` NO se implementó** (estaba frenado). Las lecciones del aporte y de las expensas sí están en el módulo y con tests.

## Qué decidir a la mañana
1. **(Media) Spec desactualizada: hay que aprobar el texto nuevo.** Las specs `lotes-ficha` y `modelo-lotes` y las tareas 1.1 y 3.5 (marcadas como hechas) siguen con los valores del boceto: lote-1 de 1.344 m², USD 750, USD 3.000, total USD 253.000, aporte USD 12.650, extremos 1.344 y 2.200 m². El código usa los del plano de Martín (1.680 y 2.798 m²). *Acción sugerida:* aprobar un texto nuevo de las specs con los valores del plano, antes de archivar el cambio. Hasta entonces, no archivar.
2. **(Baja) Polígono del mapa sin repintar.** El polígono conserva el color del estado de ejemplo. Lo reservado se ve en el panel, en la lista del mapa, en `/lotes` y en la ficha, pero el polígono no cambia ("Del mapa a la ficha"). *Acción sugerida:* decidir si entra en este PR o queda como mejora para otra noche. Mi sugerencia es dejarlo como mejora, porque no rompe nada.
3. **Privacidad (ADR-017): re-aceptación.** La política sube a `2026-11-03-borrador`. Cada persona del equipo va a ver el pedido de aceptar de nuevo, una sola vez. *Acción sugerida:* avisar al equipo antes de mergear. Si no querés ese efecto ahora, hay que frenar el PR y revisar la tarea 2.2.
4. **Tarea 5.3 pendiente y preview bloqueado.** Hay que renovar el secreto de Vercel. *Acción sugerida:* renovarlo y correr `BASE_URL=<url> pnpm test:e2e e2e/lotes.spec.ts` contra el preview antes de dar el PR por cerrado. Después, marcar la 5.3.
5. **Inventario de datos en NS_platform.** La clave `lh-lotes` no figura en el inventario de datos de NS_platform. Es otro repo y no se tocó; quedó anotado como pendiente en el cuerpo del PR. *Acción sugerida:* anotarla ahí.
6. **Falla en configuración.** `e2e/configuracion.spec.ts:38` (el test de "Borrar todo lo guardado en este navegador") tuvo un timeout y falló también al repetir con 4 procesos. Pasó el archivo solo (34/34). Como este cambio toca "Borrar todo", conviene mirarlo antes de mergear. No se comparó contra la base. *Acción sugerida:* correr ese archivo en `agente/loteo-plano-martin` para ver si ya fallaba.
7. **Sin aserciones explícitas.** Ningún test comprueba "21 lotes", "1.680 a 2.798 m²", la exclusión de las parcelas ni los estados de lote-5, lote-18 y lote-13 (los tests leen del loteo y del módulo). Tampoco hay una aserción propia del aviso "Prototipo interno · datos de ejemplo" en `lotes.spec.ts`. *Acción sugerida:* decidir si querés esos tests; son chicos y se pueden pedir para una próxima noche.

## Revisor: veredicto y hallazgos
- **Revisión 1** (comentario #issuecomment-6615192549): "con observaciones". Siete hallazgos (0 altos, 2 medios, 5 bajos).
  - Corregidos en la vuelta de corrección 1 (commit 8f8f38e):
    1. (Media) El boleto usaba el precio de la casa y la fuente del modelo actual, en vez de lo que la persona vio. Ahora se guardan al reservar.
    2. (Baja) El pago simulado recalculaba precio y aporte. Ahora usa lo guardado.
    3. (Baja) "Volver" del pago no movía el foco. Ahora va al título de la reserva.
    4. (Baja) "sin dato" salía siempre en español. Ahora sale "no data" en inglés (helper `lib/lotes/formato.ts`).
    5. (Baja) `lh-lotes` faltaba en el inventario. Anotado como pendiente en el PR.
  - Quedan para vos: el 6 (media, spec) y el 7 (baja, polígono), arriba.
- **Revisión 2** (comentario #issuecomment-6615365921): "listo para revisión humana". Los cinco corregidos, sin regresiones. `pnpm verificar` pasa (156 archivos, 2336 tests). Hay un warning de lint que ya existía en `app/territorios/[id]/vistas/paneles.tsx`. `e2e/lotes.spec.ts` pasa 18/18.
- Nota: en la corrección, `pnpm build` falló una vez por la descarga de la fuente de Google y pasó al repetir.

## Tester: resultado
**Pasa, con una falla intermitente ajena** (comentario #issuecomment-6615527118). Prueba **local**, no contra el preview.
- `lotes.spec.ts`: 18 pasaron.
- Accesibilidad sin violaciones en `/lotes`, `/lotes/lote-1`, en inglés y en los pasos de la compra. (El implementador había corregido antes una lista de definición mal formada en el boleto.)
- Suite completa: 1126 pasaron, 3 fallaron, 1 omitido.
  - `idioma.spec.ts:86`: intermitente conocida (selector de idioma en `/tribus`, página que este cambio no toca). Pasó al repetir.
  - `pacto-puntual.spec.ts:385`: axe `document-title`. Pasó al repetir. No toca lotes.
  - `configuracion.spec.ts:38`: timeout en "Borrar todo lo guardado en este navegador". Falló también al repetir con 4 procesos; pasó el archivo solo (34/34). No se comparó contra la base (ver punto 6).
- No probado: el preview de Vercel. El guion manual se recorrió vía e2e, no con navegación manual aparte.

## Para la próxima noche
- Renovar el secreto de Vercel y cerrar la 5.3 contra el preview.
- Actualizar las specs `lotes-ficha` y `modelo-lotes` y las tareas 1.1 y 3.5 con los valores del plano de Martín, una vez que lo apruebes. Después, archivar.
- Decidir el repintado del polígono del mapa según el estado reservado.
- Comparar `configuracion.spec.ts:38` contra la base para saber si es de este cambio.
- Sumar aserciones explícitas (21 lotes, 1.680 a 2.798 m², sin parcelas, estados de lote-5, lote-18 y lote-13, aviso de prototipo) si las querés.
- Anotar `lh-lotes` en el inventario de datos de NS_platform.
- `modelo-hibrido-procomun` sigue frenado.
