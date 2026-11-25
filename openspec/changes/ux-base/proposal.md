# Proposal

## Why

Gus dijo el 25-nov-2026 que la UX/UI "parece de estudiante de un bootcamp de programación de los años 2000" y pidió repararla entera. La auditoría de ese día (artifact "Auditoría UX de Lighthouse", 112 capturas de `dev` en 390 y 1440 px, claro y oscuro) mostró que el problema no es la tipografía ni la paleta, sino el oficio: avisos apilados con borde punteado en todas las pantallas, el menú lateral pintado de verde menta en el tema oscuro, cajas dentro de cajas, tres estilos de pestañas, cuatro de botones, estados vacíos sin próximo paso y el pie de página flotando a mitad de pantalla.

Gus eligió la dirección **B · Territorio vivo** para toda la app, con **C · DeFi solar** para Invertir y Mi tierra. Este es el **primer cambio** de esa serie: la base visual y de componentes sobre la que se apoyan los otros siete (`ux-celular`, `ux-explorar`, `ux-inicio`, `ux-mi-tierra`, `ux-invertir`, `ux-bien-comun`, `ux-sumarte`).

## What Changes

- **Escala de diseño en tokens** (`app/globals.css`): espaciado de 4 y 8 px, tres radios (`--radius-s` 8 px, `--radius-m` 14 px, `--radius-l` 20 px), tres niveles de elevación (`--sombra-1..3`) y una duración y curva de movimiento. Los colores **no cambian**: sigue la paleta de antes (`rediseno-colores-de-antes`).
- **Tema oscuro sin bloque menta:** el rail deja de usar `bg-deep` y pasa a la superficie del tema en los dos temas; el verde (`deep`) queda para el ítem activo y la acción principal. El dorado de "Sumarte" en oscuro se ajusta para que siga leyéndose dorado.
- **Una sola forma de aviso:** componente `Aviso` (tonos `info`, `atencion`, `legal`) sin borde punteado. `AvisoEjemplo`, `SelloPrototipo` y `EstadoAdministrativo` pasan a usarlo. El sello de prototipo deja de repetirse en cada página: queda una **cinta de prototipo** única en la barra superior.
- **Estado administrativo agrupado:** en las vistas con lotes, los avisos de estado administrativo (Ord. 173/2026) se muestran juntos en un solo bloque `legal`, una fila por proyecto, con el mismo texto completo que hoy. No se oculta nada.
- **Componentes base nuevos** en `components/ui/`: `Boton` (principal, secundario, texto; tamaños `m` y `s`), `Pestanas` (pestañas reales con `aria-current` o `role="tab"` según sean enlaces o paneles), `EstadoVacio` (dibujo, título, texto, acción principal y vista previa opcional), `Esqueleto` (carga) y `Seccion` (título, bajada y contenido separados por aire, sin borde).
- **Pie pegado abajo:** el cuerpo ocupa al menos el alto de la pantalla y el pie queda al final aunque la página sea corta.
- **Textos:** se corrigen las bajadas que dicen "Todo es de ejemplo" o "Todo es una simulación" en las pantallas que este cambio toca (ver design §6); la regla es "solo el pago es simulado".

## Fuera de alcance

- Rehacer las páginas (lo hacen los cambios siguientes). Este cambio solo reemplaza los avisos y el rail, y deja los componentes listos.
- La barra inferior del celular y los botones flotantes (`ux-celular`).
- El login y el botón de Google (PR #217, otra sesión). No se toca `components/sesion/`.
- La prueba de Candide (PR #219).

## Capabilities

### New Capabilities
- `ux-base`: escala de diseño, aviso único, cinta de prototipo, rail en los dos temas, componentes base y pie pegado abajo.

## Impact

- **Cambia:** `app/globals.css`, `app/layout.tsx`, `components/rail.tsx`, `components/rail-enlaces.tsx`, `components/barra-superior.tsx`, `components/pie.tsx`, `components/aviso-ejemplo.tsx`, `components/ui/sello-prototipo.tsx`, `components/estado-administrativo.tsx`, las páginas que apilaban sello + aviso (Inicio, Explorar, Participa, Bien común, Invertir, Mi tierra, Sumarte, ficha de lote, Mi recorrido), `lib/idioma/textos/*` de esas bajadas, `lib/tema-contraste.test.ts`.
- **Nuevo:** `components/ui/{aviso,boton,pestanas,estado-vacio,esqueleto,seccion,cinta-prototipo}.tsx` y sus tests.
- **Tests:** `components/ui/componentes.test.tsx`, `e2e/estado-administrativo.spec.ts` (sigue igual: el texto no cambia), `e2e/accesibilidad.spec.ts`, `e2e/marco.spec.ts`, `e2e/configuracion.spec.ts`.
- **Sin** tablas, migraciones, datos personales ni dependencias nuevas.
