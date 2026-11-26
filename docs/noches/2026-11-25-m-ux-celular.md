# Noche 2026-11-25-m — ux-celular
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/226 (rama `agente/ux-celular`, base `agente/ux-base`) · **Preview:** no hay. Vercel no creó ningún deployment (ver más abajo).

## En una línea
La barra inferior, la hoja Más y el botón flotante único están hechos y revisados, pero **el tester NO aprobó**: queda una falla de test sin corregir (`idioma.spec.ts:304`), Vercel no respondió en ninguna de las dos rondas (nada se probó en preview) y faltan las capturas de la tarea 4.1.

## Qué falló (primero)
- **Falla abierta: `e2e/idioma.spec.ts:304` (f)** "Configuración → English pone el marco en inglés y el selector marca EN". Timeout de 10 s en `abrirSelector` (`idioma.spec.ts:23`). Falló 3 de 3 al repetirla, así que no es intermitente. Causa según el tester: al pasar a English el avatar se llama "Person menu" y el ayudante del test solo busca "Menú de la persona". Es un defecto del test, no de la app. No se corrigió porque la regla permitía una sola vuelta extra tras fallas del tester y ya se usó.
- **Vercel no respondió, dos veces.** `scripts/preview-url.sh agente/ux-celular` esperó 15 min sin deployment para el commit 16fdf76, y en la segunda ronda tampoco hubo deployment para 271fe46. Todo el testeo fue local (build de producción + start). **No hay nada probado en el preview.**
- **Tarea 4.1 sin marcar:** faltan las capturas de `/` y `/explorar` a 390 px en claro y oscuro (la corrida no puede adjuntar imágenes).

## Qué quedó hecho (tareas 4/5)
- [x] 1.1 Hoja (`components/ui/hoja.tsx`): foco atrapado, Escape, arrastre de más de 80 px, variante persistente.
- [x] 2.1 `destinosDeLaBarra()` y `destinosDeMas()` en `lib/navegacion.ts`.
- [x] 2.2 Barra inferior con seis ítems de 48 px o más, `aria-current` y hoja Más. Se borró `components/menu-celular.tsx` y su test.
- [x] 3.1 Barra superior del celular (marca y Sumarte o avatar); idioma fuera de la barra fija (menú del avatar, hoja Más, "⋯" sin sesión en compu).
- [x] 3.2 Un solo flotante: Reportar sale de la barra superior (compu) o de Más (celular); Hifa 12 px sobre la barra inferior.
- [ ] 4.1 Cierre: `pnpm verificar` y `pnpm build` en verde según el implementador, y la suite completa dio 1386 pasaron y 0 fallaron tras la corrección del tester. Pero la última corrida del tester (1401 pasaron, 1 falló) quedó roja por (f), y faltan las capturas.

## Qué decidir a la mañana
1. **Falla (f) de idioma:** acción sugerida, mandar una vuelta corta al implementador para que el ayudante `abrirSelector` acepte también "Person menu". Es un arreglo de test, no toca la app.
2. **Idioma en la hoja Más** como enlaces `?lang` en vez del radio que pide design §2. Se hizo así para que siga funcionando sin JavaScript y con la clave por URL. Sugerido: aceptarlo y ajustar el design; si preferís radio, se cambia.
3. **NetX sumado a Más**, aunque la spec no lo lista. Sin eso era inalcanzable a 390 px. Sugerido: aceptarlo y agregarlo a la spec.
4. **Barra de entradas de `/congreso` subida sobre la barra inferior** (`app/congreso/tema-evento.css`). Esa página está para reutilizar o retirar. Sugerido: aceptarlo por ahora; si se retira `/congreso`, se borra este ajuste.
5. **Tests borrados del botón flotante de Reportar** (posición, anillo punteado, tooltip): el botón ya no existe. Sugerido: confirmar.
6. **Tarea 4.1:** sacar las capturas a mano (`/` y `/explorar`, 390 px, claro y oscuro) y marcar la tarea, o dispensar ese requisito.
7. **Detalle menor (media/baja):** con la app en inglés, el botón Reportar conserva su etiqueta en español ("Reportar un problema o una idea"). Sugerido: pedir en la próxima noche que se traduzca.
8. **Axe en `/lotes?lang=en`:** falló una vez en la suite y no se pudo reproducir; la causa no está confirmada. Como defensa se dejaron hasta 3 mediciones (pasa si una da cero violaciones; una violación real fallaría las tres). Sugerido: mirar si reaparece antes de confiar del todo en esa medida.
9. Que el cambio apila sobre `ux-base`: el PR apunta a `agente/ux-base`, no a `dev`. Decidir el orden de integración.

## Revisor: veredicto y hallazgos
Tres rondas, todas "con observaciones", ninguna con hallazgos altos.
- **Ronda 1:** 2 medios y 4 bajos. Medios: faltaba el test e2e de cambiar a inglés en el celular; en `/congreso` la barra fija tapaba el menú del avatar y el "⋯". Bajos: foco de retorno de Reportar en Safari/Firefox macOS, variante "barra" del selector sin uso, un test de barra inferior con título que no coincidía con lo que medía, y la tarea 4.1 sin marcar sin resultados en el PR. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/226#issuecomment-7179803729
- **Ronda 2:** los hallazgos previos quedaron corregidos. Nuevo medio: la barra superior (z-[55]) quedaba encima del panel de Hifa (z-50) en pantallas bajas y tapaba el botón de cerrar. Nuevo bajo: comentario desactualizado en `selector-idioma.tsx`. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/226#issuecomment-7180383922
- **Ronda 3 (final):** 0 hallazgos corregibles pendientes y sin regresiones de z-index. Queda solo lo que decide Gus (puntos 2 a 4 y la tarea 4.1). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/226#issuecomment-7181165441

## Tester: resultado
**NO aprobado en ninguna de las dos rondas.** Todo local, porque Vercel no respondió.
- **Ronda 1:** 1382 pasaron, 4 fallaron, 3 omitidos (`accesibilidad.spec.ts:643`, axe en `/lotes?lang=en`; `idioma.spec.ts:163`, `:287`, `:322`). Al repetirlas solas pasaban. Eran carreras de los tests con la hidratación, no un bug de la app. Se corrigieron agregando `components/marca-hidratada.tsx` (pone `data-hidratado` en `<html>`), `esperarHidratacion` en `e2e/ayudas.ts`, reintentos en `idioma.spec.ts` y hasta 3 mediciones de axe. Después, la suite completa dio 1386 pasaron, 0 fallaron. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/226#issuecomment-7181523653
- **Ronda 2:** 1401 pasaron, 1 falló, 3 omitidos (incluye 16 tests temporales del tester, ya borrados). La falla es (f), descrita arriba. Pasaron (g), (h) y el axe de `/lotes?lang=en`. Recorrido a 390x844 y 375x667, claro y oscuro: 16 tests pasaron (barra inferior en `/`, `/explorar` y `/congreso` sin desborde; Hifa sobre la barra; hoja Más con Escape y foco de vuelta; Reportar desde Más con foco de vuelta; inglés desde Más persiste tras recargar). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/226#issuecomment-7182053159

## Para la próxima noche
- Arreglar el ayudante `abrirSelector` de `e2e/idioma.spec.ts` para que acepte "Person menu" y volver a correr la suite completa.
- Traducir la etiqueta del botón Reportar cuando la app está en inglés.
- Reintentar la prueba en el preview de Vercel cuando el deployment exista; revisar por qué Vercel no desplegó la rama.
- Capturas de la tarea 4.1 (a mano) y, con eso, marcarla.
- Cuando se decidan los puntos 2 a 4, ajustar design y spec (radio o enlaces, NetX en Más) y, si se retira `/congreso`, borrar el ajuste de su barra.
- Seguir con el próximo cambio de la serie `ux-*` (el de explorar usa la variante persistente de la hoja).
