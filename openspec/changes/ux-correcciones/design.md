# Design

## 1. Filtro de lotes en el celular

Hoy `components/explorar/explorador-lotes.tsx` pone el filtro (`role="group"` con las pastillas de estado y el selector de orden) dentro de la `Hoja` persistente. En reposo la hoja deja ver unos 2 rem y su contenido no se recorre con Tab (ver el arreglo de la integración #234 en `components/ui/hoja.tsx`: `overflow-hidden` en reposo, por la regla `scrollable-region-focusable` de axe).

Propuesta: en el celular, sacar la fila de pastillas de estado de la hoja y ponerla **sobre el mapa, arriba**, como una fila con scroll horizontal propio (estilo Airbnb). El selector de orden puede quedarse en la hoja, porque solo importa con la lista abierta. Si el agente encuentra una forma mejor (por ejemplo, que la franja visible de la hoja en reposo muestre las pastillas), vale, siempre que cumpla la spec: el filtro se ve y se usa sin abrir la hoja, sigue en la URL y axe no da violaciones.

Cuidados:
- La fila no tapa el aviso de estado administrativo (Ord. 173), que va antes del mapa y se ve completo.
- Áreas táctiles de 44 px como mínimo.
- Si la fila tiene scroll horizontal, tiene que poder enfocarse (`tabIndex={0}` con `aria-label`) o no tener scroll a 390 px.
- En compu (1440 px) no cambia nada.

## 2. Chip "Idea"

`components/ui/chip-estado.tsx` suma el estado `idea` a `ESTADOS_CHIP`, con el ícono `Lightbulb` de lucide y su texto en `marco.estados.idea` ("Idea" en es, "Draft idea" en en). En `app/bien-comun/page.tsx`, las filas de Ostrom usan `<ChipEstado estado="idea" />`. Si `bien-comun.ostrom.idea` queda sin uso, se borra de es y en y se regenera `docs/idioma/revisar-nativo.md` con `pnpm idioma:pendientes`.

## 3. Pie

e2e nuevo en `e2e/marco.spec.ts`, como decía `ux-base` 4.1: en `/invertir` sin sesión a 390×844, el borde inferior del pie está a 8 px o menos del final del documento y el documento no es más corto que la pantalla. Si falla, se arregla el layout (`app/layout.tsx`), no la prueba.

## 4. Comentario

`app/invertir/page.tsx` línea 8: "Ningún cobro, oferta ni botón de invertir: solo el pago es simulado y los números son de ejemplo."
