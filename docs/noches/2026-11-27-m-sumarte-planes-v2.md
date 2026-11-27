# Noche 2026-11-27-m — sumarte-planes-v2
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/240 (rama `agente/sumarte-planes-v2`, base `spec/sumarte-planes-v2`) · **Preview:** no hubo

## Lo primero: lo que queda pendiente para vos
1. **No hubo preview de Vercel.** `scripts/preview-url.sh` esperó 15 minutos y falló (no apareció el preview del commit f1d1781; revisar si el repo está conectado a Vercel). El tester probó solo en local, sin recorrido visual. Nadie vio a mano la baja simulada, el pedido de Aliados en `/admin` ni el nivel del Fundador en el menú.
2. **Decisiones tuyas abiertas:** hallazgo C y hallazgos 7 a 11 (detalle abajo).
3. **Fallos intermitentes en la suite completa bajo carga.** En dos corridas fallaron cuatro tests distintos: `e2e/idioma.spec.ts` :178 y :304 (implementador), `e2e/consentimiento-alta.spec.ts`:112 y `e2e/participa-vision.spec.ts`:152 (tester). Todos pasan solos. Parecen carga, pero conviene vigilar: si siguen apareciendo en otras noches, hay que ver si son pruebas frágiles.
4. **La segunda revisión no vio el último commit (f1d1781).** Se agotaron las dos vueltas de corrección y el commit con la descripción del PR y el e2e del nivel Aliado no pasó por revisión formal. Lo cubre el tester (66 casos de sumarte en verde), pero nadie lo leyó con ojo de revisor.

## En una línea
Sumarte pasó al modelo nuevo (Explorador, Amigo, Fundador y franja de Aliados, con el FARO de prepago en borrador). Quedó hecho y en verde en local, pero sin preview y con cinco decisiones tuyas pendientes.

## Qué quedó hecho (tareas 10/10)
Todas las tareas de `openspec/changes/sumarte-planes-v2/tasks.md` están marcadas.
- **Datos y estado:** `lib/sumarte/datos.ts` (planes, cohorte "N de 100", reparto del pago, FARO de prepago en borrador). Los pases viejos Semilla/Brote/Raíz pasan a Fundador y el Plan Tribu a Aliado.
- **Acceso:** adherir al manifiesto y sumarse a un equipo piden solo cuenta (Explorador). Nombres visibles Amigo, Fundador y Aliado.
- **Vista:** en compu, tres columnas con "El más elegido" en Amigo, selector Mensual/Anual, franja de Aliados y tabla de comparación. En celular, selector de tres y un plan por vez. `?plan=miembro` lleva a amigo.
- **FARO de prepago:** bloque "Borrador · a definir" con texto legal nuevo `faroprepago` (borrador).
- **Otros:** "Próximamente" en texto, "Darme de baja" simulado, sale "Para inversores"; quedan "Comprar un lote" e "Invertir". e2e reescritos.
- **Fuera de alcance (no se hizo):** saldo de FARO por origen en Mi tierra, bitácora, sesiones, cupos.
- **Verificación:** `pnpm verificar` y `pnpm build` en verde (2995 tests unitarios según la 2ª revisión).

## Qué decidir a la mañana
- **C (baja, nuevo):** un Aliado guardado ve "Hacerme Amigo" y, si lo aprieta, se da de baja sin aviso y pierde Aliado y la administración de su tribu. Acción sugerida: mostrar "Incluido en tu plan Aliado" o un texto que diga que es una baja. Depende de la decisión 7.
- **7 (tribu conservada):** el design dice que el Plan Tribu pasa a Aliado sin tribu elegida, pero se conservó el `tribuId` guardado porque si no se rompían los e2e de funciones en pausa (Pactos, Fogón). Acción: aceptar lo hecho, o pedir la lectura literal (cambio chico en `lib/sumarte/estado.ts` más ajustar esos e2e).
- **8 (voz en el Fondo Común):** el Fundador abre "Voz en el Fondo Común" (`lib/canales/puertas.ts:52`, `lib/pasaporte/sellos.ts:189`), y eso choca con "la voz no se compra". Corregirlo toca `lib/permisos/tabla.ts`, que comparten funciones en pausa. Acción: decidir si se corrige ahora o se deja para cuando se retomen esas funciones.
- **9 (textos legales viejos):** `membresia` y `pasefundador` describen el modelo anterior (influencia, créditos); `plantribu` quedó sin uso. A quién va la plata del Fundador lo deciden vos o Franz. Acción: pedir la reescritura con Gabriel y definir el destino del dinero.
- **10 (porcentaje de Amigo):** el dato de 45% (`parteServicioAmigo`) quedó sin usar; el reparto calculado da 44% mensual y 33% anual (cuota menos 5 FARO por mes o 60 por año). Acción: validar con Vagner cuál vale.
- **11 (sello de Identidad):** promete "Pedir invitación", que ya no existe en Sumarte, y el diálogo de verificación quedó sin disparador. "Pedir una charla" también salió. Acción: decidir si se reubica o se retira el sello.

## Revisor: veredicto y hallazgos
- **1ª revisión:** con observaciones, 11 hallazgos (4 medios, 7 bajos, ninguno alto). Comentario #issuecomment-7224242880.
- Corregibles 1 a 6 (suite e2e sin re-correr, baja poco visible, foco perdido a 390 px, Fundador/Aliado viendo un "Hacerme Amigo" sin efecto, nivel Aliado que preseleccionaba Amigo, beneficios de Aliados duplicados): resueltos en la corrección 1.
- **2ª revisión:** con observaciones. Confirmó que 1 a 6 están bien resueltos, sin regresiones. Comentario #issuecomment-7225310079. Dejó pendientes A (descripción del PR desactualizada) y B (sin e2e del caso nivel Aliado), que se hicieron en la corrección 2 (commit f1d1781) **sin nueva revisión**. Además levantó el hallazgo C y mantuvo 7 a 11 para tu decisión.

## Tester: resultado
Pasa, pero **solo en local** (build y servidor propios, puerto 3100). Comentario #issuecomment-7226296056.
- Playwright: 1504 pasaron, 2 fallaron, 3 saltados (15,2 min). Los dos fallos (`consentimiento-alta.spec.ts`:112 y `participa-vision.spec.ts`:152) pasan solos 3 de 3.
- Guion de prueba 1 a 8 cubierto por e2e (sumarte, sumarte-acceso, sumarte-celular, idioma).
- Sin preview no hubo recorrido visual ni se vio a mano la baja, el pedido de Aliados en `/admin` ni el nivel del Fundador en el menú.

## Para la próxima noche
- Conectar o revisar Vercel para que haya preview, y repetir el recorrido visual (guion del PR, pasos 1 a 8).
- Resolver C y 7 a 11; con eso se puede cerrar el cambio y archivarlo.
- Pasar una revisión corta sobre el commit f1d1781.
- Vigilar los fallos intermitentes de la suite completa; si se repiten, estabilizar esos tests.
- Pendientes que no son de esta noche: reescribir los textos legales con Gabriel y validar el reparto con Vagner.
