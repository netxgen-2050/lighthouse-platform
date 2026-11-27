# Noche 2026-11-25-m — lotes-en-la-base (noche 1: reservas)
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/224 (base `spec/lotes-en-la-base`) · **Preview:** https://lighthouse-platform-git-agente-lot-4016db-netxgen-2030-projects.vercel.app (ver nota abajo: el tester no pudo usarlo)

## En una línea
El código de reservas quedó hecho y revisado, pero **no se probó contra el preview** y hay cinco decisiones tuyas pendientes, una de ellas (la política de privacidad) que conviene resolver antes de que esto pase a `dev`.

## Lo que falló o quedó sin probar (primero)
- **El tester no pudo probar contra el preview.** `scripts/preview-url.sh` esperó 15 minutos y no encontró el deployment del commit 25fc2f5. El estado de Vercel decía "success" pero sin URL, y `scripts/curl-preview.sh` falló con `CABECERAS[@]: unbound variable` (puede faltar el secreto de bypass; no se verificó). Ojo: el bot de Vercel comentó en el PR que el preview figura "Ready" (actualizado 22:40 UTC, antes de que el tester probara), así que puede ser un problema de cómo el script lo busca y no del deploy. Conviene que lo mires vos.
- **El guion manual no se ejecutó.** Faltan sin probar: el paso 5 (liberar un lote como super admin), el paso 7 (limpieza de `lh-lotes` en un navegador con datos viejos) y confirmar que la migración 0002 esté aplicada en la rama de Neon del preview.
- **Dos fallas de axe en local, intermitentes:** `e2e/lotes-en-la-base.spec.ts:167` y `e2e/membresia.spec.ts:182` (regla `document-title` en `/territorios/lighthouse`). Fallaron en la suite completa y pasaron al repetirlas solas (4 de 4). Causa desconocida.
- Un aviso de lint previo en `app/territorios/[id]/vistas/paneles.tsx` (no es de este PR).

## Qué quedó hecho (tareas 5 completas, 3 parciales)
Alcance de esta noche: solo reservas. Quedan fuera a propósito los grupos 4, 5, 6 y 9.1 y el resto de 7.1, 7.2 y 8.1 (noche 2).

Completas en `tasks.md`:
- **1.1** Una sola migración `drizzle/0002_lotes_en_la_base.sql` con las tablas `reservas`, `contactos` y `bitacora`, los enums y `personas.origen`. `reservas` y `bitacora` rechazan modificar y borrar (triggers); `contactos` no. Se sumó un control en la base: una reserva siempre trae opción y lo que la persona vio.
- **2.1 a 2.3** Servidor de reservas (`lib/lotes/servidor.ts`), rutas `/api/lotes/estados` (pública, sin ninguna identidad) y `/api/lotes/reservas` (GET y POST), y `liberarLotes` para los e2e. Un lote reservado por una persona lo ven reservado todas, y dos reservas a la vez del mismo lote: gana una sola.
- **3.1** Cliente: `useCompras` con la misma forma de antes, `useEstadosLotes`, los textos de error de la spec y el aviso de estados sin respuesta. Ficha, compra, lista, vitrina y mapa adaptados. No se tocó `app/explorar/*`.

Parciales (sin marcar, con nota en `tasks.md`):
- **7.1** Hecho para `lh-lotes` y `lh-consultas-lotes` (se borran del navegador sin copiar nada). Falta `lh-contactos` y `lh-bitacora`.
- **7.2** Hecho GET y DELETE de `/api/mis-datos/actividad` con reservas y origen; la descarga y el retiro de Mis datos lo usan. Faltan contactos y bitácora.
- **8.1** Hecho (a), (b) y la parte de reservas de (d) y (e); los e2e de lotes, Mi tierra, híbrido, barrio norte y accesibilidad pasan a la API. Falta (c), el resto de (d) y (e).

Verificación: `pnpm verificar` (198 archivos, 2879 tests) y `pnpm build` en verde; e2e locales del implementador: 1371 pasados, 3 salteados.

## Qué decidir a la mañana
1. **Política de privacidad (media, la que más importa).** `lib/privacidad/politica.ts:102`, fila "Lotes (simulado)", dice "Solo en tu navegador: no se envía a ningún lado", y ya no es cierto: las reservas van al servidor. La descarga de Mis datos ya dice la verdad, así que hoy se contradicen. Cambiarla sube `VERSION_POLITICA` y le vuelve a pedir el consentimiento a todo el equipo. Acción sugerida: aprobar el cambio de texto y la nueva versión antes de pasar a `dev`; si no, que este PR no pase a `dev` así.
2. **Conteos de Explorar (baja).** `lib/barrios/norte.ts:27` (usado por `app/explorar/page.tsx:44`): los números de disponibles, reservados y vendidos de Explorar ignoran las reservas reales, mientras la lista y el mapa de la misma página sí las muestran. Arreglarlo exige tocar `app/explorar/*`, vedado esta noche. Acción sugerida: dejarlo para la noche 2, o aceptar que es cifra de ejemplo y decirlo en pantalla.
3. **Sin tope de reservas por persona (baja).** `app/api/lotes/reservas/route.ts:60`: una cuenta con consentimiento puede reservar todos los lotes con un bucle y bloquearlos hasta que el super admin los libere uno por uno. La spec no lo pide. Acción sugerida: aceptarlo en el prototipo interno; si querés un freno, es un requisito nuevo en la spec.
4. **Orden del retiro en Mis datos (sin hallazgo).** El borrado de la actividad corre antes del retiro del consentimiento (así lo ordena la spec). Si el borrado sale bien y el retiro falla, los lotes ya quedaron liberados. Si falla el borrado, no se retira nada. Acción sugerida: dejarlo como está salvo que prefieras otro orden.
5. **Mi tierra queda en "Cargando…" si falla la primera lectura (baja).** `app/mi-tierra/mi-tierra-cliente.tsx:53` y `components/lotes/usar-compras.ts:39-41`: si la lectura de reservas falla (error 500, sin red, 403 por falta de consentimiento), la pantalla no avisa nada. Es mejor que antes (decía "no tenés lotes"), pero no se corrigió porque se alcanzó el tope de dos vueltas de revisión y otros carriles tocan Mi tierra. Arreglo propuesto: que `useCompras` exponga el fallo y Mi tierra muestre un aviso con `role="alert"`. El texto del aviso conviene que lo apruebes vos.
6. **La migración 0002 todavía no está aplicada fuera de los previews.** Hay que aplicarla donde corresponda antes de usar esto fuera de ellos, y confirmar que está en la rama de Neon del preview.
7. **Dato menor:** el test de dos reservas simultáneas corre en PGlite, donde las transacciones se serializan; prueba la lógica, no el lock real en Neon. Eso lo cubre el e2e (a) contra el preview, que no se pudo correr (ver arriba).

## Revisor: veredicto y hallazgos
Tres pasadas, veredicto final **con observaciones, ninguna alta ni media abierta**.
- Primera pasada: 1 media (política de privacidad, ahora punto 1) y 5 bajas. Se corrigieron tres: faltaba un control en la base para reservas sin opción, las compras no se releían al volver a la pestaña, y un comentario viejo en `compra-cliente.tsx`.
- Segunda pasada: una media nueva producida por la corrección anterior (una lectura fallida se mostraba como "sin reservas", rompiendo la regla del dato que falta) y una baja (pedidos superpuestos sin orden). Corregidas con `leerReservas` que devuelve `null` si falla y un contador de pedidos (`lib/lotes/ultimo-pedido.ts`).
- Tercera pasada: correcciones verificadas. Queda una baja sin corregir (punto 5). No hay test que monte el hook completo.
- Cobertura de la spec de reservas: todos los requisitos de la noche 1 cumplidos; fuera de la noche quedan contactos, bitácora, Congreso y 8.1 (c).

## Tester: resultado
No se pudo probar contra el preview (ver arriba). En local con build propio, proyecto chromium: suite completa 1369 pasados, 2 fallados (axe, intermitentes, pasan al repetirlos), 3 salteados. `e2e/lotes-en-la-base.spec.ts` solo: 7 de 7. El guion manual no se ejecutó. No hubo vuelta de corrección porque no había fallas reproducibles. Informe completo en el PR (comentario 7177235126).

## Para la próxima noche
- Noche 2: grupos 4 (contactos y origen) y 5 (bitácora); el resto de 7.1, 7.2 y 8.1 (sumar `lh-contactos` y `lh-bitacora` a la limpieza, borrar contactos en el DELETE, traer contactos y bitácora en el GET y la descarga, e2e (c), resto de (d) y (e)); y decidir lo de los conteos de Explorar.
- Grupo 6 (Congreso) y tarea 9.1 (incluye el guion en `docs/guiones/` para que el super admin libere un lote) siguen sin hacerse.
- Antes de arrancar: resolver los puntos 1, 2 y 5 de arriba y comprobar por qué el script del preview no encuentra el deployment.
