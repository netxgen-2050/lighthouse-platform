# Noche 2026-10-06 — navegacion-base
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/2 · **Preview:** https://lighthouse-platform-8pbp48823-net-xg-en.vercel.app

## En una línea
Quedó hecho el marco común del sitio (colores, tipografías, encabezado, pie, "Saltar al contenido" y portada nueva) y pasó revisión y pruebas; faltan dos decisiones tuyas sobre los sellos de las tribus.

Nada falló al final. Sí hubo un problema en la primera revisión (las tipografías no se aplicaban) y se corrigió en dos rondas.

## Qué quedó hecho (tareas 5/5)
- [x] 1.1 Colores del mock-up v6 en `app/globals.css` y tipografías Anek Latin, Figtree y JetBrains Mono con `next/font`.
- [x] 2.1 Encabezado (`components/encabezado.tsx`), pie (`components/pie.tsx`), enlace "Saltar al contenido" y `<main id="contenido">` en el layout.
- [x] 2.2 Portada nueva ("Encontrá tu tribu. Construí en común.", botón "Ver las tribus") y colores sueltos de `app/tribus/**` y `components/` pasados a los colores del mock-up.
- [x] 2.3 `e2e/marco.spec.ts` con los escenarios del marco.
- [x] 3.1 `pnpm verificar`, `pnpm build` y e2e en verde.

Cómo se llegó acá: la primera revisión dio "no cumple" porque las fuentes no se aplicaban (se veía la tipografía del sistema). La corrección 1 (88125de) lo arregló y sumó pruebas. La corrección 2 (faeb7b2) hizo que el pie traiga el año también sin JavaScript.

## Qué decidir a la mañana
1. **Sello "activa" / "en formación" solo por color en el detalle de una tribu** (`components/sello-tribu.tsx:4-5`, `app/tribus/[id]/page.tsx:67`). Hoy la diferencia se comunica solo con color y el sello tiene `aria-hidden`, sin texto de estado (el listado sí dice "Estado: …"). Choca con la regla "nada se comunica solo con color". Es un problema que ya existía antes de este PR. Acción sugerida: decidir si se arregla en este PR o en un cambio aparte (el revisor opina que excede esta spec).
2. **Aprobar o rechazar el cambio visual del sello "en formación".** Pasó de ámbar sólido con texto blanco a fondo `gold-soft` con texto `gold-ink`. La spec no lo pidió; lo decidió el implementador. Contraste calculado a mano: ~6,8:1. Acción sugerida: mirarlo en el preview y aprobarlo o pedir que vuelva al ámbar.
3. **Contraste de color (AA) sin prueba automática.** Solo se calculó a mano (revisor); nadie lo midió con herramienta. Acción sugerida: decidir si alcanza o si hace falta una medición.
4. **Limitación conocida del año del pie.** Sin JavaScript se ve el año del momento del build, que puede quedar viejo hasta el siguiente deploy. Con JavaScript se muestra el año actual. El revisor lo considera aceptable como respaldo. Acción sugerida: nada, salvo que quieras otra cosa.

## Revisor: veredicto y hallazgos
Ronda 3 (final, sobre faeb7b2): **con observaciones, sin nada corregible pendiente.** Los 5 requirements tienen código y prueba.

Historial:
- Ronda 1: no cumple. [alta] las fuentes no se aplicaban (`@theme` sin `inline`; `next/font` define las variables en el `body`, no en `:root`). [baja] año del pie fijo al build. [baja] faltaban pruebas (skip-link solo en /tribus; nada sobre fuentes ni colores sueltos). [baja] token inventado `--color-line-strong`.
- Ronda 2: con observaciones. Los 4 hallazgos quedaron corregidos (verificado en el CSS del build). Quedaba [baja] el HTML estático sin año cuando no hay JavaScript.
- Ronda 3: ese último punto quedó corregido. Solo quedan las decisiones 1 y 2 de arriba.

Comentarios en el PR: issuecomment-6026226955, -6026269883, -6026289964.

## Tester: resultado
**Pasa.** Playwright: 20 pasaron, 0 fallaron. Sin fallas ni bloqueos.

Guion manual de 5 pasos, todos OK: 1 portada con encabezado, Inicio con `aria-current`, titular y botón; 2 Tribus marca `aria-current`; 3 `/tribus/valle` y `/tribus/grano` responden 200 con Tribus marcado y pie; 4 "Saltar al contenido" es el primer foco y lleva el foco al contenido; 5 el ⚖ se usa con teclado.

Ojo: los pasos 1 a 3 se hicieron con `curl` sobre el HTML del preview; los pasos 4 y 5 (teclado y foco) los cubren los e2e, no se probaron a mano.

No se cubrió: contraste ni revisión visual. Los sellos, en especial "en formación", los tiene que mirar una persona.

Nota: el comentario del tester en el PR (issuecomment-6026302675) quedó en una sola línea sin formato, porque la herramienta de escritura bloqueó el archivo del reporte y se usó `--body` en vez de `--body-file`.

Aviso menor del implementador: aparece un `NoFallbackError` en el log de e2e, en el test de id de tribu desconocido. El test pasa y no está relacionado con este cambio.

## Para la próxima noche
- Según lo que decidas en los puntos 1 y 2: un cambio aparte para que el estado de la tribu se lea también con texto (no solo color), o ajustar el sello en este PR.
- Evaluar una prueba automática de contraste, hoy solo hay cálculo a mano.
- Después de tu aprobación, mergear el PR #2 (lo hacés vos; los agentes no tocan `main`).
