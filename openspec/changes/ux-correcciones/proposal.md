# Proposal

## Why

La cadena del rediseño B + C (`ux-base` a `ux-sumarte`, PR #222) entró a `dev` el 27-nov-2026 con la integración #234, con el OK de Gus. En la integración quedaron anotados detalles que los carriles no cerraron. Gus pidió el 27-nov una vuelta de corrección con esos pendientes.

Antes de escribir esta spec se revisó `dev` (17439f0). De lo que faltaba de `ux-base`, la mayoría ya entró: componentes base (`Boton`, `Pestanas`, `EstadoVacio`, `Esqueleto`, `Seccion`), pestañas en Mi recorrido y Participa, avisos de estado administrativo agrupados y bajadas sin "Todo es…". Quedan estos cuatro puntos.

## What Changes

- **Filtro de lotes en el celular:** en `/explorar/lotes` a 390 px, con la hoja en reposo, el filtro por estado no se ve: hay que abrir la hoja para encontrarlo. Pasa a verse y a poder usarse sin abrir la hoja.
- **Estado "idea" en la tabla de Ostrom:** en `/bien-comun`, los ocho principios muestran el chip "En discusión", pero el texto vigente (`bien-comun.ostrom.idea`) dice "idea". El chip pasa a decir "Idea" con un ícono propio.
- **Pie pegado abajo con prueba:** el pie ya queda abajo, pero falta el e2e de `ux-base` (tarea 4.1) que lo asegura en una página corta.
- **Comentario viejo:** `app/invertir/page.tsx` dice en un comentario "todo es una simulación de ejemplo". Pasa a decir que solo el pago es simulado.

## Fuera de alcance

- Cómo se dice "0 de 24 cuotas pagadas" en Mi tierra y si los primeros lotes suman a lo pagado: espera una decisión de Gus.
- El login (PR #217) y Candide (PR #219). No se toca `components/sesion/`.
- Colores: sigue la paleta de antes.

## Capabilities

### New Capabilities
- `ux-correcciones`: detalles pendientes de la cadena `ux-*` después de la integración #234.
