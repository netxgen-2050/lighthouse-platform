# Noche 2026-11-23 — token-inversor-y-coherencia
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/197 (base `agente/lote-token-tierra`, no `dev`) · **Preview:** no hay (ver bloqueo 1)

## En una línea
`/netx/financiamiento` ahora tiene una sección del Token Inversor (con los números sacados del modelo del barrio) y los textos del híbrido, la Vista NetX y Sumarte quedaron alineados: FARO no levanta capital y el Token Inversor todavía no se ofrece. El código está completo y probado en local, pero no hay preview de Vercel, la tarea 4.1 quedó sin marcar y 17 pruebas e2e de Fogón fallan por un dato vencido que este PR no toca.

## Primero: bloqueos
1. **No hay preview de Vercel.** `scripts/preview-url.sh` esperó 15 minutos y no apareció ningún deployment para el último commit (1419e57); el estado dice "Vercel success" pero sin URL. El tester probó en local (build y servidor de Playwright). El guion manual dio 6/6 bien, pero en local, no en el preview. **Acción sugerida:** revisá en Vercel por qué la rama no despliega (puede ser porque el PR apunta a otra rama de agente y no a `dev`) y repetí el guion sobre el preview cuando exista.
2. **17 pruebas e2e fallan, ninguna por este PR.** Todas son de Consultas del Fogón. La causa: la consulta u1 muestra "Cierre previsto: 15 de noviembre de 2026" y aparece cerrada. Hoy es 23-nov-2026 y las pruebas suponen que está abierta, así que dependen de la fecha. Afectadas: `e2e/accesibilidad.spec.ts:443` (axe en `/fogon/consultas/u1`), `e2e/fogon-consultas.spec.ts` (casos a, b, c, d, e, f, g2, h, i), `e2e/idioma-pendientes.spec.ts` (4 casos) y `e2e/manifiesto-lighthouse-vrn.spec.ts` (líneas 189, 206 y 218). El tester no las corrió contra `dev` o la base, así que "no es de este PR" sale de la causa, no de una comparación. **Acción sugerida:** un cambio aparte que arregle esas pruebas (fecha de cierre calculada respecto de hoy o movida al futuro). Es el mismo bloqueo que ya figuraba en el reporte de `lote-token-tierra`.
3. **La tarea 4.1 de `tasks.md` quedó sin marcar** (los casos e2e nuevos y su verificación), porque su criterio incluye `accesibilidad.spec.ts` en verde y falla por el punto 2. Lo demás está marcado (7 de 8 tareas). **Acción sugerida:** marcarla cuando se arreglen las pruebas de Fogón, o aceptar que no bloquea este PR.
4. **Orden de entrega.** Este PR apunta a `agente/lote-token-tierra`. Dependen unos de otros `bien-comun-propuesta`, `bien-comun-numeros-barrio`, `lote-token-tierra` y este. **Acción sugerida:** mergear a `dev` en ese orden, o rebasear este PR cuando entre el anterior.

## Qué decidir a la mañana
- **"Precio de FARO": dos pruebas con reglas que se contradicen (hallazgo bajo, decisión tuya, abierto).** `lib/bien-comun/sin-venta-de-faro.test.ts:12` y `lib/lotes/sin-numeros-escritos.test.ts:112` vigilan la misma frase con excepciones distintas. Eso contradice el "un solo vigilante" de `design.md`. Además, `CLAVE_QUE_CAMBIO` se exporta desde un test que nadie importa. **Acción sugerida:** elegir cuál de las dos pruebas manda y sacar la frase de la otra, o aceptar las dos. Es un cambio chico.
- **Sin tercera revisión del último commit.** Las dos vueltas de corrección se agotaron. El commit 1419e57 (siete casos nuevos en el test del detector) solo agrega pruebas y pasa `pnpm verificar`, pero no pasó otra vez por el revisor ni corrió `pnpm build`. **Acción sugerida:** mirarlo por arriba al revisar el PR; el tester corrió el build sobre ese commit y pasó.
- **Plazo máximo del Token Inversor: "sin dato".** La sección lo muestra así porque el modelo no lo define. **Acción sugerida:** confirmar que querés dejarlo así hasta que haya un dato.
- **Caso "no terminaría de cobrar dentro del horizonte del modelo".** Cuando el mes de cobro es nulo, la sección lo dice sin traer el número de años que usa `/bien-comun`. **Acción sugerida:** confirmar el texto.
- **Inglés sin revisión de nativo.** Los textos nuevos están en `docs/idioma/revisar-nativo.md` (se regeneró). **Acción sugerida:** que alguien lo revise antes de mostrarlo fuera del equipo.
- **Incidente en la rama local `agente/lote-token-tierra`.** El primer commit del implementador cayó ahí por error. Lo movió a la rama correcta y devolvió la local a `origin` (79b637d). No se pusheó nada a esa rama. **Acción sugerida:** nada; solo verificar que la rama remota sigue en 79b637d.

## Qué quedó hecho (tareas 7/8)
Hechas 1.1, 1.2, 2.1, 2.2, 2.3, 3.1 y 5.1. Sin marcar: 4.1.
- **Sección Token Inversor** en `/netx/financiamiento` (`app/netx/financiamiento/seccion-token-inversor.tsx`): lee monto, cobertura a 12 y 24 meses y prima de `lib/bien-comun/barrio.ts`; el plazo máximo dice "sin dato". Ningún número escrito en pantalla. Con los ⚖ de `primaobjetivo`, `noesoferta` y `tokeninversor` (las claves ya existían, no hay textos legales nuevos).
- **Coherencia:** el texto del híbrido (español e inglés) dice "FARO no levanta capital" y enlaza a `/bien-comun`; la tarjeta "Bien común" de `/netx` también enlaza; Sumarte tiene una línea del Token Inversor que dice que todavía no se ofrece.
- **Test nuevo** `lib/bien-comun/sin-venta-de-faro.test.ts`: falla si aparecen "tramo", "tranche", "staking", "precio de FARO" o "FARO price" fuera de donde corresponde, y (tras la corrección) también "rendimiento de FARO", "vender FARO", "FARO yield" y variantes.
- `/netx/financiamiento` entra a la auditoría de accesibilidad (46 rutas).
- `pnpm verificar` (2469 tests) en verde; `pnpm build` y `openspec validate --strict` pasaron. Queda un aviso de lint anterior en `app/territorios/[id]/vistas/paneles.tsx`.

## Revisor: veredicto y hallazgos
Veredicto final: **con observaciones**.
- Vuelta 1 (5 hallazgos): (1) media: faltaba el ⚖ de `primaobjetivo`; (2) baja: el caso con mes nulo estaba mal explicado; (3) baja: la lista de frases prohibidas no cubría "rendimiento de FARO" ni "vender FARO"; (4) baja, decisión tuya: las dos pruebas de "precio de FARO"; (5) baja: dos frases con peso legal sin ⚖. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/197#issuecomment-7107190492
- Vuelta 2 (2 bajos): los arreglos 1, 2, 3 y 5 quedaron bien, sin regresiones. Quedaron: la prueba del detector no ejercitaba las frases nuevas (arreglado después con 1419e57) y el hallazgo 4 para vos. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/197#issuecomment-7107318803

## Tester: resultado
**Falla, pero por pruebas de Fogón que este PR no toca; sin preview.** En local: 1206 pasaron, 17 fallaron, 1 omitido. Las specs propias del PR (`netx-financiamiento`, `hibrido`, `vista-netx`, `sumarte`, `bien-comun`) pasan 115/115, y axe de `/netx/financiamiento` y `/sumarte` pasa. Guion manual 6/6 bien, pero en local. Pendiente repetirlo sobre el preview. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/197#issuecomment-7107946525

## Para la próxima noche
- Cambio aparte para arreglar los e2e de Fogón que dependen de la fecha (consulta u1), para dejar la suite en verde.
- Con eso, marcar la tarea 4.1 y repetir `accesibilidad.spec.ts`.
- Resolver el hallazgo 4: una sola prueba vigilante de "precio de FARO" y sacar la exportación `CLAVE_QUE_CAMBIO` del test.
- Cuando haya preview, repetir el guion manual (6 pasos) y probar `?lang=en` y 390 px.
- Pedir revisión de nativo del inglés nuevo.
