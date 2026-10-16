# Noche 2026-10-16-1742 — liderar-varias-tribus
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/86 · **Preview:** no disponible (el deploy de Vercel falló)

## En una línea
El cambio está hecho y probado en local, pero el preview de Vercel falló y quedan dos hallazgos del revisor que necesitan tu decisión.

## Qué quedó hecho (tareas 4/4)
- Una persona con el Plan Tribu ahora puede liderar varias tribus. En `/sumarte` se ve la lista, con "Dejar de liderar" y "Sumar otra tribu" (pide confirmación al sumar la segunda).
- El precio se muestra por tribu y hay un total mensual.
- La marca "Admin de …" aparece en cada tribu liderada y el menú del avatar las nombra todas ("A, B y C").
- Dejar la última tribu te deja como Miembro y conserva el Pase.
- Lo guardado con el formato anterior (una sola tribu) se lee sin romperse.
- Tareas: 1.1, 1.2, 2.1 y F.1 marcadas como hechas.
- En local pasan `pnpm verificar` (997 tests), la suite de Playwright completa (573 pasaron, 0 fallaron, incluye axe en 31 rutas) y `pnpm build` en el entorno del implementador.

## Qué decidir a la mañana
1. **Deploy de Vercel fallido (lo más urgente).** El deploy del último commit (`db0e10b`) falló y `scripts/preview-url.sh` dijo "El deploy de Vercel falló". No se sabe la causa. El tester vio además que `pnpm build` suelto falló en su local con "Can't resolve @vercel/turbopack-next/internal/font/google/font" (16 errores de fuentes de Google), mientras que el build del implementador y el que levanta Playwright anduvieron. Puede ser un problema del entorno, pero no está confirmado que sea la misma causa. Además el PR apunta a la base `agente/pactos-proponer-cambio` y no a `dev`. Acción sugerida: mirar el log del deploy en Vercel; si es por las fuentes, es ajeno al cambio.
2. **Hallazgo media: el pedido de tribu hecho sin sesión se suma sin confirmación.** Si alguien que lidera Valle Solar sale, elige Taller Común en `/sumarte` y vuelve a entrar, queda liderando las dos sin ver el diálogo. Pasa porque `lh-sumarte` no se borra al salir (`app/sumarte/sumarte-cliente.tsx` ~172/192, `lib/sumarte/estado.ts` ~73 y ~116). Opciones: (a) abrir el diálogo después de entrar, (b) descartar el pedido si ya lidera alguna tribu, (c) aceptarlo como está. Sugerencia: (a), que es lo que dice la spec. Sin tu decisión no se tocó.
3. **Hallazgo baja: el total mensual cuenta la tribu fija.** La tribu asignada en `LH_PERSONAS` (la que no se puede dejar) entra en el total. Una persona admin-tribu sin plan ve "Total: USD 60/mes". Acción: decidir si la tribu fija suma al total simulado o se muestra aparte.
4. **Efecto no pedido por la spec.** Una persona de `LH_PERSONAS` con rol admin-tribu que no eligió nada en Sumarte ahora ve el Plan Tribu como líder de su tribu asignada (antes veía Explorador). Acción: confirmar que está bien así.
5. **Para cuando se haga `datos-en-la-nube`.** La columna "tribu que administra" de `base-neon` hoy prevé una sola tribu por persona; tiene que pasar a lista o tabla. Está anotado en el PR y no se tocó.

## Revisor: veredicto y hallazgos
Veredicto en las dos vueltas: con observaciones (sin hallazgos altos). Reglas de CLAUDE.md, seguridad y alcance sin problemas.
- Primera revisión (0 altos, 1 medio, 3 bajos): https://github.com/netxgen-2050/lighthouse-platform/pull/86#issuecomment-6221427890
  - Corregido: el menú del avatar decía "A y B y C" con tres tribus. Ahora usa `unirConY` (movida a `lib/unir-con-y.ts`) y también se usa en Sumarte.
  - Corregido: faltaban pruebas del botón Cancelar (solo se probaba Escape) y del menú del avatar con dos tribus. Se agregaron dos e2e.
  - Abiertos: los puntos 2 y 3 de la sección anterior.
- Segunda revisión (1 media, 1 baja, 0 altos): https://github.com/netxgen-2050/lighthouse-platform/pull/86#issuecomment-6221479441. Confirmó las dos correcciones; siguen abiertos solo los dos puntos para vos.
- Cobertura según la primera revisión: 5 de 7 requisitos completos. Los incompletos eran "Sumar otra tribu con confirmación" y "Marca de admin en cada tribu"; las pruebas nuevas cubren parte de eso, pero la segunda revisión no lo volvió a medir.

## Tester: resultado
Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/86#issuecomment-6221531159
- **No se pudo probar contra el preview de Vercel** (el deploy falló).
- En local: Playwright 573 pasaron, 0 fallaron.
- El guion manual no se recorrió contra preview. Los pasos 1 a 4, 6 y 7 los cubre un e2e cada uno.
- **Paso 5 sin verificar:** ningún test comprueba que `/tribus/semilla` quede sin marca de admin.
- `pnpm build` suelto falló en la tarea del tester (ver punto 1 de las decisiones).

## Para la próxima noche
- Resolver el deploy de Vercel y volver a correr el tester contra el preview.
- Aplicar tu decisión sobre el pedido pendiente sin diálogo y sobre el total con la tribu fija, con sus pruebas.
- Agregar un e2e que confirme que `/tribus/semilla` no muestra la marca de admin.
- Correr la suite e2e completa tras la corrección (el implementador solo corrió `verificar` y `build` en esa vuelta; el tester sí corrió la completa).
- Cuando el PR se integre, decidir la base: hoy apunta a `agente/pactos-proponer-cambio`, no a `dev`.
