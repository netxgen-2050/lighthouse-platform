# Noche 2026-11-26-m — ux-sumarte
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/231 · **Preview:** https://lighthouse-platform-git-agente-ux-sumarte-netxgen-2030-projects.vercel.app (ver la nota en "Qué decidir a la mañana": el tester no pudo probarlo)

**Nadie mergeó nada. No se tocaron `dev` ni `main`.** Todo el trabajo está en la rama `agente/ux-sumarte`, y el PR #231 apunta a `agente/ux-bien-comun` (cambios apilados), no a `dev`.

## En una línea
La página Sumarte quedó más corta y fácil de recorrer en el celular, y la revisión terminó en verde. Falta que decidas dos cosas de la revisión, que mires un par de dudas de diseño y que adjuntes las capturas. Además, la prueba sobre Vercel no se pudo hacer, y en local hubo 4 fallas que no se repitieron.

## Qué quedó hecho (tareas 5 de 6)
Hechas la 1.1 a la 1.4 y la 2.1. Sin hacer: la 2.2 (capturas), que solo podés adjuntar vos.
- **Tres caminos arriba:** Comprar un lote, Invertir y Elegir un plan. Cada uno baja a su parte de la página.
- **Selector de planes:** un plan por vez, con las flechas del teclado para cambiar. El plan elegido queda en la dirección (`?plan=`) y se conserva al recargar. Un `?plan=` inválido cae en el plan por defecto.
- **Cada plan muestra** precio, "Para quién es", lo que incluye y su acción.
- **Comparación:** desde 768 px es una tabla con encabezado fijo y el plan elegido resaltado. En el celular es una lista "Qué incluye y qué no" con el texto Incluido / No incluido, sin tabla ni scroll horizontal.
- **Modo de prueba:** el panel "Entrar como…" pasó a un cajón cerrado al final. No se tocó `components/sesion/`.
- **Alto a 390 px:** antes unos 5.100 px; después, sin sesión, entre 3.368 y 3.987 según el plan (Comunidad 3.368, Explorador 3.559, Miembro 3.661, Fundador 3.987). Con sesión, entre 3.215 y 3.834. Las tarjetas ganaron unos píxeles después de la segunda corrección, así que esas cifras del PR quedaron algo viejas.
- `pnpm verificar` (201 archivos, 2853 tests), `pnpm build` y `openspec validate --strict` en verde. e2e de Sumarte en verde (85 tests), con axe en claro y oscuro, a 390 y 1440 px.

## Qué decidir a la mañana
1. **Entrar desde la barra, sin Privy (hallazgo 5 del revisor, media).** Si la persona ya está en `/sumarte` y toca "Entrar" de la barra, no pasa nada visible: el panel está dentro del cajón cerrado. Arreglarlo exige tocar `components/sesion/`, y la tarea 1.4 lo prohíbe. **Acción sugerida:** autorizar un cambio chico y aparte en `components/sesion/` para que abra el cajón, o aceptar el defecto en el prototipo. Con Privy y con `#entrar-como` o tocando un plan sin cuenta sí se abre solo.
2. **Comunidad en el celular (hallazgo 6, baja).** Con Comunidad elegido a 390 px no aparece la lista "Qué incluye y qué no", porque nadie definió qué incluye ese plan. **Acción sugerida:** decirnos qué incluye Comunidad (y qué no) para agregarlo, o dejarlo sin lista.
3. **Plan por defecto.** Es el de la URL. Si falta y la persona no alcanza el nivel de la página a la que quería entrar, se muestra el plan que la habilita. Si no, el que ya tiene, o Miembro. No estaba en el diseño: lo agregó el implementador porque, sin eso, el aviso decía "Hacete Miembro" y se veía Explorador. **Acción sugerida:** confirmar o pedir que vuelva a Miembro siempre.
4. **Tarjetas del final (Comprar un lote e Invertir).** Conservan todo su contenido (flujos, "En NetX como empresa", pedidos simulados y textos legales con su ⚖). No se achicaron a una línea y una acción porque eso cambiaba flujos y textos legales y la spec no lo detalla. **Acción sugerida:** si las querés más compactas, pedirlo como cambio aparte.
5. **Mensual/Anual** se muestra en Miembro y Comunidad (ambos se cobran por período); el Pase Fundador es pago único. **Acción sugerida:** confirmar que está bien así.
6. **Capturas (tarea 2.2).** Quedaron en `.noches/tmp/sumarte-390-*.png` de la carpeta del carril (ignorada por git): Miembro y Fundador, en claro y oscuro. **Acción sugerida:** adjuntarlas al PR y marcar la 2.2.
7. **Preview de Vercel.** El tester esperó 15 minutos por el preview del último commit (`1de36d5`) y no apareció ("¿Está conectado el repo a Vercel?"), así que **no se probó nada sobre Vercel**. Sin embargo, el bot de Vercel comentó en el PR que hay un despliegue "Ready" (8:43 UTC) en la dirección de arriba. No pude confirmar que sea del último commit. **Acción sugerida:** abrir esa dirección y ver que muestre los cambios; si no, revisar la conexión de Vercel con el repo.
8. **Fallas intermitentes sin confirmar.** Ver "Tester". **Acción sugerida:** si te preocupa, pedir una segunda corrida completa antes de pasar el PR a `dev`.

## Revisor: veredicto y hallazgos
**Veredicto final (tercera pasada, commit `1de36d5`): listo para revisión humana, sin hallazgos nuevos.**

Primera ronda (6 hallazgos) y cómo quedaron:
- Un e2e de neon-auth entraba sin `?plan=` y habría fallado con un build nuevo. **Corregido** (ahora entra con `?plan=explorador`; el revisor lo comprobó con un build nuevo).
- Faltaba "para quién es" en cada plan. **Corregido**, en español e inglés.
- El plan se leía de la dirección solo al cargar y podía desincronizarse. **Corregido** (queda sincronizado, con test; "atrás" vuelve al plan anterior).
- La tarea 2.1 estaba marcada sin capturas. **Corregido:** se sacó el pedido de capturas de la 2.1 y quedó la 2.2 pendiente.
- Entrar desde la barra sin Privy: **pendiente, decisión tuya** (punto 1).
- Comunidad en celular sin lista: **pendiente, decisión tuya** (punto 2).

Segunda ronda: las 4 correcciones estaban bien. Un hallazgo bajo nuevo: la línea "para quién es" repetía casi palabra por palabra la descripción de cada plan, y alargaba la página. **Corregido:** se sacó la descripción repetida en Explorador, Miembro y Comunidad y se reescribió la de Fundador.

Tercera ronda: sin regresiones. Reglas de CLAUDE.md sin problemas (sin textos legales nuevos, solo tokens del tema, un solo `<main>`, nada se comunica solo con color). Una observación menor: el camino "cuidar" no tiene test propio.

## Tester: resultado
**Pasa en local, pero sobre Vercel no se pudo probar (bloqueo).** Detalles en el comentario del PR: https://github.com/netxgen-2050/lighthouse-platform/pull/231#issuecomment-7187953067
- **Corrida completa en local:** 1413 pasaron, 4 fallaron, 3 omitidas (14 minutos de corrida). Fallaron:
  - `e2e/bien-comun.spec.ts:258` (Tab no suelta la sección elegida, pero scrollear sí)
  - `e2e/bien-comun.spec.ts:494` (el rail lleva a Bien común, y desde Lotes y Sumarte hay un enlace)
  - `e2e/idioma-pendientes.spec.ts:24` (axe, document-title)
  - `e2e/pacto-puntual.spec.ts:385` (axe, document-title)
- Ninguna es de Sumarte. Al repetir esos cuatro archivos más `sumarte-celular.spec.ts`, pasaron 75 de 75. Parecen intermitentes por la carga, **pero no está confirmado** con más repeticiones.
- `sumarte-celular.spec.ts`: 12 de 12, con axe en claro y oscuro, cada plan, a 390 y 1440 px.
- **Guion manual:** pasos 1, 2 (flechas), 4 y 5 (cajón cerrado y se abre) cubiertos por tests. **Sin probar aparte:** `?plan=` con recarga, el paso 3 (Semilla/Brote/Raíz, comunidad, Mensual/Anual), las anclas de los tres caminos, `#entrar-como` y tocar un plan sin cuenta. La suite completa pasó, pero no hay una prueba dirigida de esos puntos.

## Para la próxima noche
- Si respondés los puntos 1 y 2, un cambio chico los cierra (el 1 toca `components/sesion/`, así que tiene que quedar autorizado en la spec).
- Verificar el preview de Vercel y repetir la corrida completa de e2e para confirmar o descartar las 4 fallas intermitentes.
- Agregar pruebas dirigidas para `?plan=` con recarga, anclas de los caminos, `#entrar-como` y el camino "cuidar".
- Actualizar en el PR las cifras de alto a 390 px, que quedaron levemente viejas.
- Recordatorio: el PR #231 está apilado sobre `agente/ux-bien-comun`; hay que decidir el orden en que entran a `dev`.
