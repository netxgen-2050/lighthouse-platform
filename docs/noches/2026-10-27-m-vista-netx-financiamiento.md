# Noche 2026-10-27 (m) — vista-netx-financiamiento
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/114 · **Preview:** no hay (el deploy de Vercel falló, ver más abajo)

## En una línea
El trabajo está hecho y pasa todo en local (verificar, build y 744 pruebas e2e), pero **Vercel no pudo construir la rama**, así que nada se probó en un entorno real y el PR no tiene preview.

## Qué falló o quedó sin probar (primero lo importante)
- **Deploy de Vercel en falla.** La rama aparece como "failure" en los commits c76b89e, 5ad4720 y 968c669, a los 2 segundos de empezar. `dev` anda y el build local pasa. No se pudo leer el log: el comando para verlo pide aprobación y no hay sesión de Vercel en la nube.
  - Hipótesis sin confirmar: la opción `experimental: { authInterrupts: true }` en `next.config.ts` (hace falta para el 403 con `forbidden()`). Pero una falla a los 2 segundos suena más a permisos, autoría del commit o variables del preview.
- **El tester probó solo en local** (servidor de Playwright), no en Vercel. No está verificado: variables de entorno, `LH_ACCESO`, la cookie `lh-sesion-admin` ni el 403 real en el preview.
- **Veredicto final del revisor: "con observaciones"** (no es un "aprobado" limpio).
- **Tarea 6.4 sin hacer** (capturas de pantalla): el agente no puede subir imágenes. El guion manual del PR las reemplaza.

## Qué quedó hecho (tareas 33/34)
- Números del financiamiento de NetX en `lib/financiamiento/`, con fuente y tests contra los RESULTS de NS_Tokenomics. El Monte Carlo está copiado como tabla.
- Término `ordenanza173` en borrador y gráfico `BarrasReparto`.
- `/admin` con tres pestañas, protegidas en el servidor (403 real con `forbidden()`) y una cookie limitada a `/admin`. Toda ruta bajo `/admin` da 403 a quien no es super admin.
- `/netx` (Vista NetX) abierta a toda persona con sesión, con Resumen, Simulador y Comunidad.
- El simulador salió del Fogón; `/fogon/simulador` ahora redirige.
- Pruebas e2e nuevas: `admin.spec.ts` y `vista-netx.spec.ts`.
- Se arregló un desborde a 390 px que ya existía en Personas y roles.
- Desvíos respecto del diseño: la `Puerta` del layout raíz deja pasar a los hijos de `/admin` mientras la sesión no está lista, para que salga un 403 real (ADR-016); título único "Admin" en las pestañas; sin ⚖ en "Fundación"; `git mv` no está permitido, se usó mv + `git rm`.

## Qué decidir a la mañana
1. **Mirar el log del deploy de Vercel** (deployment `dpl_Eeu49owGfZNyJGUiAtzrj1FeXA1o`). Acción: abrirlo en Vercel; si el motivo es `authInterrupts`, hay que buscar otra forma de dar el 403 o ajustar la configuración. Sin esto no hay preview y no conviene mergear.
2. **Títulos de las pestañas de `/admin`** (hallazgo de decisión). Hoy las tres dicen "Admin"; el diseño pedía uno por pestaña. El motivo del desvío: el título viajaba en la respuesta 403. Acción sugerida: aceptar el título único (es lo más seguro) y actualizar el design, o pedir títulos por pestaña sin exponerlos en el 403.
3. **⚖ en "la tierra queda en una Fundación".** Acción sugerida: dejarlo al cambio 2 (`vista-netx-modelo-financiamiento`), como dice el design; o sumar ahora un término `fundacion` en borrador.
4. **`LH_ACCESO=lista` en Vercel.** Hoy cualquiera con un email válido entra como Explorador y ve la Vista NetX. Es configuración de Vercel, no de código. Acción: decidir si se cambia antes de compartir el preview.
5. **Tarea 6.4.** Acción: aceptar el guion manual del PR en lugar de capturas, o sacar las capturas a mano.

## Revisor: veredicto y hallazgos
**Veredicto final: con observaciones** (sin problemas de seguridad ni regresiones).
- 1.ª pasada: 9 hallazgos (1 media, 8 bajas). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/114#issuecomment-6445661174
- Corregidos en 5ad4720 (hallazgos 1 a 7): `/admin/loquesea` daba 404 y ahora da 403 (ruta comodín); textos de `/netx` alineados con la spec; fuente del consumo con "NS_Tokenomics"; "total sin dato" en vez de "USD 0" en barras; test del Pase reescrito; e2e de "Pendientes · sin dato" y de la postulación; tests de la cookie admin.
- 2.ª pasada: correcciones verificadas, verificar/build/e2e en verde. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/114#issuecomment-6445961032
- El único corregible que quedó (design.md:183 con la fuente vieja) se arregló en 968c669.
- Quedan abiertos los dos de decisión de Gus (puntos 2 y 3 de arriba).
- Límite conocido: que `salir()` borre la cookie solo está verificado leyendo el código, porque no hay jsdom para ejecutarlo en una prueba.

## Tester: resultado
**Solo en local.** No hubo preview utilizable (`scripts/preview-url.sh` informó que el deploy falló para 968c669). Con `pnpm test:e2e` contra el servidor de Playwright: **744 pasaron, 0 fallaron**. Los 8 pasos del guion están cubiertos por pruebas e2e, no se recorrieron a mano. Sin verificar: comportamiento en Vercel. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/114#issuecomment-6446113344

## Para la próxima noche
- Resolver el deploy de Vercel antes que nada y, con el preview andando, que el tester repita el guion allá.
- Archivar este cambio después de `fogon-simulador-parametros`.
- Cambio 2, `vista-netx-modelo-financiamiento`: la pestaña del modelo de financiamiento, y el ⚖ de Fundación si se decide dejarlo ahí.
- Si se vuelve a correr el Monte Carlo, hace falta un cambio nuevo (hoy es una tabla copiada).
