# Design

Estilo según `ux-base` (tokens, `Boton`, aviso). Referencias: barra inferior de Airbnb y Rainbow, hojas de Family.

## 1. Barra inferior

- Visible solo por debajo de `md` (768 px). Fija abajo, fondo `surface`, borde superior `line`, `padding-bottom: env(safe-area-inset-bottom)`.
- Seis ítems de igual ancho: Inicio, Explorar, Participa, Invertir, Mi tierra, Más. Ícono 22 px (los de `lib/navegacion.ts`) y etiqueta 11 px. El activo: ícono y etiqueta en `deep`, etiqueta en negrita y `aria-current="page"`; usa `itemActivo` y `secciones` como hoy.
- `nav` con `aria-label` del marco ("Navegación principal"). Cada ítem mide al menos 48 px de alto.
- Qué va en la barra: se agrega a `Destino` un campo `barra?: true` en Inicio, Explorar, Participa, Invertir y Mi tierra. El resto de `destinosDelMenu()` va a Más. Si un destino en pausa vuelve (pierde `oculto`), aparece en Más sin tocar la barra.
- El `main` suma un espacio inferior igual al alto de la barra para que nada quede debajo.

## 2. Hoja Más

Hoja (`components/ui/hoja.tsx`) con, en este orden: destinos principales que no están en la barra (Bien común, Sumarte), destinos de la persona (Perfil, Pasaporte, Mi recorrido, Configuración, Mis datos) si hay sesión, idioma (dos opciones Español / English como `radio`), "Reportar un error", y Admin si es super admin. Sin sesión: "Entrar" arriba de todo.

## 3. Hoja (componente)

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al título. Foco al primer control al abrir, foco atrapado, Escape cierra y devuelve el foco al disparador.
- Asa visible de 36×4 px; arrastrar hacia abajo más de 80 px cierra. Fondo detrás `ink` al 40 %. Radio superior `--radius-l`, sombra `--sombra-3`.
- Alto: según contenido, como máximo 85 dvh con scroll interno. Animación de subida con `--dur`/`--curva`; sin animación con movimiento reducido.
- API pensada para reutilizar: `abierta`, `alCerrar`, `titulo`, `hijos`, y una variante `persistente` (siempre visible con un alto mínimo, se expande al arrastrar) que usará `ux-explorar` para la lista de lotes sobre el mapa.

## 4. Barra superior

- Celular: marca "Lighthouse" (Fraunces 18 px, enlace a `/`) a la izquierda; a la derecha "Sumarte" (`Boton` principal `s`) sin sesión o el avatar con sesión. "Entrar" pasa a la hoja Más y a la página de Sumarte.
- Compu: igual que hoy salvo que el selector de idioma sale y entra un botón texto "Reportar" con ícono `Bug`, al lado de la campanita.
- El selector de idioma se ofrece en el menú del avatar (compu), en la hoja Más (celular) y en Configuración; sin sesión en compu, dentro de un menú "⋯" junto a Entrar. La detección por idioma del navegador y la cookie no cambian.

## 5. Botones flotantes

- `BotonReportar`: se separa el disparador del formulario. El formulario (diálogo actual) se abre desde la barra superior en compu y desde la hoja Más en el celular. El disparador flotante con anillo punteado se borra.
- HIFA: queda como único flotante, abajo a la derecha. En el celular va a `bottom: alto de la barra + 12 px`. El espaciador del layout se ajusta para que no tape el final.

## 6. Accesibilidad

axe sin violaciones con la hoja abierta y cerrada, en claro y oscuro, a 390 px. Orden de tabulación: contenido, luego barra inferior. Los e2e que hoy abren "Menú" pasan a abrir "Más" o a tocar la pestaña de la barra.
