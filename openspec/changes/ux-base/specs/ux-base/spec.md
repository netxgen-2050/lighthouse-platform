# Spec Delta

## Purpose

La base visual y de componentes de la dirección B + C (Gus, 25-nov-2026): menos ruido, una sola forma de aviso, un rail que funciona en los dos temas y componentes comunes para el resto de los cambios `ux-*`.

## ADDED Requirements

### Requirement: Escala de diseño
La app SHALL definir en `app/globals.css` tres radios, tres niveles de sombra y una duración y curva de movimiento como tokens, sin cambiar ningún color de la paleta vigente. Con movimiento reducido (preferencia de la app o del sistema), las transiciones MUST durar 0.

#### Scenario: Tokens disponibles
- **WHEN** un componente usa `rounded-[var(--radius-m)]` o `shadow-[var(--sombra-1)]`
- **THEN** el valor sale de los tokens de `app/globals.css`

#### Scenario: Movimiento reducido
- **WHEN** una persona eligió reducir animaciones en Configuración
- **THEN** ningún componente base anima su transición

### Requirement: Rail en los dos temas
El rail SHALL usar la superficie del tema como fondo en claro y en oscuro. El destino actual MUST distinguirse por una píldora detrás del ícono, negrita y `aria-current="page"`, no solo por color.

#### Scenario: Tema oscuro
- **WHEN** una persona abre `/` en tema oscuro a 1440 px
- **THEN** el fondo del rail es la superficie oscura del tema y solo el ítem activo lleva el verde de acento

#### Scenario: Destino actual
- **WHEN** una persona está en `/invertir`
- **THEN** el ítem Invertir tiene `aria-current="page"`, su etiqueta en negrita y la píldora detrás del ícono

### Requirement: Cinta de prototipo única
La app SHALL mostrar el aviso de prototipo una sola vez, en una cinta fija en la parte superior, en toda página. Las páginas MUST NOT repetir el sello de prototipo en su contenido.

#### Scenario: Una página cualquiera
- **WHEN** una persona abre `/invertir` con sesión
- **THEN** ve "Prototipo interno · datos de ejemplo" una sola vez, en la cinta, y no dentro del contenido

#### Scenario: Página de venta
- **WHEN** una persona abre una vista con lotes
- **THEN** la cinta suma que la venta es simulada y la aprobación municipal está pendiente

### Requirement: Aviso único sin borde punteado
Todo aviso de la app SHALL usar el componente `Aviso`, con ícono y texto, sin borde punteado. Ningún aviso MUST comunicar su tono solo con color.

#### Scenario: Aviso de ejemplo
- **WHEN** una página muestra comunidades o personas de ejemplo
- **THEN** el aviso "Comunidades, personas y cifras de ejemplo" usa `Aviso` con su ícono y sin borde punteado

### Requirement: Estado administrativo agrupado y completo
Toda vista con lotes SHALL mostrar el estado administrativo de cada uno de sus proyectos dentro de un solo bloque, antes del mapa o de la lista, con el mismo texto completo que exige la Ord. 173/2026 (proyecto, estado, norma, titular, expediente, aprobación municipal, fecha y ⚖). Ningún dato del estado administrativo MUST quedar oculto detrás de un control.

#### Scenario: Explorar
- **WHEN** una persona abre una vista de Explorar con lotes
- **THEN** ve un único bloque legal con una fila por proyecto, cada una con su región "Estado administrativo · <proyecto>" y su texto completo

#### Scenario: Pruebas legales
- **WHEN** corre `e2e/estado-administrativo.spec.ts`
- **THEN** pasa sin cambiar sus expectativas de texto

### Requirement: Componentes base
La app SHALL ofrecer en `components/ui/` los componentes `Boton` (principal, secundario, texto), `Pestanas`, `EstadoVacio`, `Esqueleto` y `Seccion`. Los botones MUST medir al menos 44 px de alto en celular y tener foco visible. Las pestañas de navegación MUST marcar la actual con `aria-current="page"`, y las de panel MUST usar `role="tablist"` con flechas del teclado.

#### Scenario: Pestañas de Mi recorrido
- **WHEN** una persona abre `/panel`
- **THEN** las pestañas Tu camino y Bitácora usan el componente `Pestanas`, con la activa subrayada y en negrita

#### Scenario: Estado vacío
- **WHEN** una persona sin actividad abre `/panel`
- **THEN** ve un `EstadoVacio` con título, texto y una acción principal

### Requirement: Pie al final de la pantalla
El pie de página SHALL quedar al final de la ventana cuando el contenido es más corto que la pantalla.

#### Scenario: Página corta
- **WHEN** una persona sin sesión abre `/invertir` en un celular de 390×844
- **THEN** el pie queda pegado al borde inferior de la pantalla, sin espacio vacío debajo

### Requirement: Textos sin "todo es simulado"
Las bajadas de Explorar, Barrio Norte, Invertir y Mi tierra SHALL NOT decir que todo es de ejemplo o una simulación. Donde haga falta, MUST decir que el pago es simulado.

#### Scenario: Mi tierra
- **WHEN** una persona abre `/mi-tierra`
- **THEN** la bajada dice que el pago es simulado y no que todo es una simulación
