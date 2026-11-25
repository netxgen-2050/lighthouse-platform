# Noche 2026-11-23-m — rediseno-sistema-visual
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/201 (base `dev`) · **Preview:** no apareció (ver abajo)

## En una línea
La base visual nueva (fuentes, paleta oscura por defecto y seis componentes) quedó hecha y pasó las pruebas en local, pero **nadie la vio en un preview**: Vercel no publicó el preview en 15 minutos, así que la revisión visual (tarea 4.2) sigue pendiente y es tuya.

## Qué quedó hecho (tareas 12/13)
- Fuentes Fraunces (títulos h1 a h3 con SOFT 100), Inter Tight y JetBrains Mono, en lugar de Anek Latin y Figtree.
- Los mismos nombres de colores con valores nuevos: el oscuro es la base y el claro (dirección B) lo pisa. Se sumaron la escala de regeneración (regen-1 a regen-5) y el vidrio.
- Un test (`lib/tema-contraste.test.ts`) comprueba contraste AA en los dos temas.
- Tema oscuro por defecto; si la persona ya había elegido claro o "El del sistema", se respeta.
- Seis componentes en `components/ui/` con tests: Indicador, BarraAvance, PanelVidrio, TablaLibro, SelloPrototipo y ChipEstado. Textos en es/en en `lib/idioma/textos/marco.ts`.
- Pruebas e2e adaptadas, y axe (accesibilidad) en oscuro y claro sobre 18 rutas.
- Hubo una vuelta de corrección tras la primera revisión (ver más abajo).
- **Sin hacer:** tarea 4.2 (revisión manual con capturas, 390 y 1280 px, dos temas).
- Los componentes todavía no se usan en ninguna página; eso lo hacen los cambios 3 a 5.

## Qué decidir a la mañana
1. **Hacer la tarea 4.2 con un preview** (media). Hace falta una persona: abrir el preview y seguir el guion del PR (oscuro por defecto, claro persistente, "El del sistema", recorrido de `/`, `/lotes`, `/territorios/lighthouse`, `/bien-comun`, `/sumarte`, `/netx`, `/fogon` en dos temas a 390 y 1280 px). Poné las capturas en el PR y anotá lo raro para los cambios 3 a 5. Mientras no se haga, el cambio no está terminado.
2. **El preview de Vercel no apareció.** `scripts/preview-url.sh` esperó 15 minutos y dijo: "No apareció el preview de agente/rediseno-sistema-visual (86838ec…) en 15 minutos. ¿Está conectado el repo a Vercel?". Acción sugerida: revisar en Vercel si el despliegue de esa rama falló o no arrancó. Puede estar relacionado con el punto 5. Sin preview no se puede hacer el punto 1.
3. **El sello de venta no lleva ⚖.** Dice "aprobación municipal pendiente" sin el símbolo legal con su explicación (`sello-prototipo.tsx:18`, `marco.ts:843`). La spec no lo pedía, así que el implementador no lo tocó. Acción sugerida: decidir si se agrega el ⚖ (y pasarlo a `lib/legal/terminos.ts` como borrador) o si se deja así. Mejor definirlo antes de que los cambios 3 a 5 usen el sello en `/lotes`.
4. **Una falla intermitente en e2e** (baja). `e2e/idioma-pendientes.spec.ts:24` (axe, "document-title") falló una vez. Repetida 3 veces (21 tests) pasó todo; parece un problema de arranque en frío, no del cambio. El orquestador no hizo corrección porque no había nada claro que corregir. Acción sugerida: si vuelve a aparecer en otras noches, investigarla.
5. **El build falló una vez** con "módulo no encontrado" sin identificar (baja). Las dos corridas siguientes pasaron. El build necesita bajar fuentes de Google, así que puede ser un tema de red. Acción sugerida: si se repite, mirar si las fuentes se descargan bien en Vercel (puede tener que ver con el preview que no apareció).
6. **Aviso menor:** el build muestra un warning de lint en `app/territorios/[id]/vistas/paneles.tsx:83` (`_` sin usar). No es de este cambio. Acción sugerida: limpiarlo en algún cambio que toque ese archivo.

## Revisor: veredicto y hallazgos
- **1ª revisión: con observaciones** (5 hallazgos: 1 media, 4 bajas). Comentario: pull/201#issuecomment-7111832272.
  - Media: tarea 4.2 sin hacer (quedó para vos).
  - Bajas, corregidas por el implementador: el color de BarraAvance salía de la fracción sin redondear (0,199 se pintaba terracota pero decía "20 %"); el lector de pantalla leía dos veces; TablaLibro era enfocable con teclado aunque no desbordara; faltaban tests (vidrio con transparencia reducida, tabla a 390x844, tipografía en `/lotes`, primera visita en `/`).
- **Vuelta de corrección:** el color se calcula desde el porcentaje redondeado (tests en los bordes 20/40/60/80); la fila visible lleva `aria-hidden`; TablaLibro solo se enfoca si desborda (ResizeObserver); tests nuevos. Dos aclaraciones: el test del vidrio mira el texto del CSS, no un render; y el e2e de la tabla a 390x844 inyecta en `/lotes` el mismo marcado a mano, porque la tabla aún no está en ninguna página, así que es una comprobación aproximada.
- **2ª revisión: listo para revisión humana.** Correcciones confirmadas. Comentario: pull/201#issuecomment-7112088157.
  - Hallazgo bajo nuevo: `e2e/marco.spec.ts:247-261` usa una copia a mano del HTML de la tabla y no el componente. Acción sugerida: apuntarlo a una página real cuando alguna use la tabla.
  - Siguen para vos: tarea 4.2 y el ⚖ del sello. Esta revisión no corrió e2e ni build.

## Tester: resultado
**Pasó con una falla intermitente, pero probó en local, no en el preview.** Comentario: pull/201#issuecomment-7113211733.
- Preview: no apareció (ver punto 2), así que se probó con `PORT=3020 pnpm test:e2e`.
- Resultado local: 1286 pasaron, 1 falló, 3 omitidos (ya eran omitidos).
- La falla es la del punto 4 y no se repitió.
- Build correcto, con el warning del punto 6.
- **El guion manual (pasos 1 a 4) quedó sin verificar** por falta de preview.

## Para la próxima noche
- No arrancar los cambios 3 a 5 sin que se haya mirado el sistema visual en un preview (punto 1). Lo que anotes ahí es su insumo.
- Decidir lo del ⚖ del sello antes de usar el sello en páginas de lotes.
- Cuando una página use la tabla, apuntar el e2e de `e2e/marco.spec.ts` a esa página en lugar de la copia a mano.
- Si el preview de Vercel vuelve a no aparecer, el tester necesita otra vía (o se avisa antes de gastar 15 minutos de espera).
- Los componentes nuevos no reemplazan a `medidor` ni a `estado-del-lote`; los cambios siguientes tienen que decidir página por página cuándo migrar.
