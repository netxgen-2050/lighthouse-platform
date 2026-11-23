# Proposal

## Why

Gus quiere "una nueva clase de web app que lleve la experiencia DeFi a la tierra" (pedido del 23-nov-2026, lienzo "Lighthouse · direcciones visuales"). Eligió mezclar la dirección **A · Valle de noche** (Explorar) con la **C · Terminal solar** (Invertir y Mi tierra), y tomar la paleta clara de la **B · Cartografía viva** como tema claro. Hoy la app usa la paleta y las fuentes del mock-up v6 (verde profundo sobre crema, Anek Latin y Figtree), con el tema claro por defecto, y no tiene piezas para mostrar números como una app financiera (indicadores, barras de avance, libro de movimientos).

Este es el **primero de cinco cambios** en los que se partió el pedido `rediseno-defi-tierra`: pone la base visual sobre la que se pintan los otros cuatro. No cambia ninguna pantalla en su contenido.

## What Changes

- **Tipografía de la slide de Lighthouse:** Fraunces para títulos (con el eje SOFT alto, puntas suaves), Inter Tight para el texto y JetBrains Mono para los números. Reemplazan a Anek Latin y Figtree. Se cargan como hoy (fuentes de Google por `next/font`), sin librerías nuevas.
- **Paleta nueva en los tokens del tema** (`app/globals.css`), con los **mismos nombres de token** de hoy para que toda la app se repinte sin tocar cada página:
  - **Oscuro (por defecto):** fondo `#0E0F0B`, texto `#F1EEE6`, secundario `#B9B49B`, acento dorado oliva `#D8CC92`.
  - **Claro (dirección B):** hueso `#F3EFE6`, texto `#16170F`, secundario `#57543F`.
  - **Escala de regeneración** (tokens nuevos, de menos a más avance): terracota `#D9774A`, ocre `#E0A640`, oliva `#CFC85A`, salvia `#9DB86E`, verde `#6FA35A`; en el tema claro, tonos más oscuros de los mismos cinco que pasen contraste.
  - **Vidrio:** un token de fondo translúcido para los paneles sobre foto.
- **Tema oscuro por defecto.** Quien ya eligió "Claro" o "Sistema" en Configuración lo conserva.
- **Contraste AA verificado por un test** sobre todos los pares de tokens que se usan juntos, en los dos temas.
- **Seis componentes base**, chicos, bilingües por props y sin datos propios:
  - **Indicador:** número grande y etiqueta; sin dato, "sin dato".
  - **Barra de avance:** con la escala de regeneración, siempre con número o etiqueta.
  - **Panel de vidrio:** fondo translúcido con desenfoque, legible sobre cualquier foto.
  - **Tabla tipo libro:** fecha, motivo y monto en monoespaciada, con título.
  - **Sello de prototipo:** "Prototipo interno · datos de ejemplo" y, donde haya lotes o plata, "venta simulada · aprobación municipal pendiente".
  - **Chip de estado:** abierta, en discusión, decidida, disponible, reservado, en cuotas, vendido, en financiamiento; cada estado con texto e ícono o forma, nunca solo color.

## Fuera de alcance

- Cambiar el contenido o la estructura de cualquier página (son los cambios 3 a 5).
- El menú de cinco destinos (cambio 2, `rediseno-menu-cinco`).
- El tema propio del Congreso (ADR-002): sigue como está.
- Rediseñar las páginas en pausa (Fogón, Pactos, Semillas, Compromisos): se repintan solas con los tokens nuevos y no se tocan más allá de que sigan pasando axe.
- Librerías de componentes, de íconos o de gráficos nuevas.

## Cambios hermanos (el pedido `rediseno-defi-tierra` partido en cinco)

1. **`rediseno-sistema-visual`** (este): fuentes, tokens, tema oscuro por defecto y componentes base.
2. **`rediseno-menu-cinco`**: el menú de cinco destinos. Depende de 1.
3. **`rediseno-explorar-valle`**: Inicio y la vista "Barrio Norte" con la dirección A. Depende de 1, 2 y `portada-vrn`.
4. **`rediseno-mi-tierra`**: la página Mi tierra con la dirección C. Depende de 1, 2 y `lote-token-tierra`.
5. **`rediseno-invertir`**: el destino Invertir con la dirección C. Depende de 1, 2, `bien-comun-numeros-barrio` y `token-inversor-y-coherencia`.

## Capabilities

### New Capabilities
- `sistema-visual`: tipografía, escala de regeneración, contraste verificado y los seis componentes base del rediseño.

### Modified Capabilities
- `marco-visual`: "Paleta y tipografías del mock-up" pasa a la paleta y las fuentes de la slide de Lighthouse.
- `barra-superior-configuracion`: "Apariencia" suma que el tema por defecto es el oscuro.

## Impact

- **Cambia:** `app/globals.css` (tokens de los dos temas, escala de regeneración, vidrio, fuentes), `app/layout.tsx` (carga de fuentes), `lib/configuracion/preferencias.ts` y `lib/configuracion/script-apariencia.ts` (tema por defecto), sus tests.
- **Nuevo:** `components/ui/` con los seis componentes y sus tests; `lib/tema-contraste.test.ts`; textos de estados y del sello en `lib/idioma/textos/marco.ts`.
- **Toda la app cambia de aspecto** porque los tokens cambian de valor: hay que revisar axe en todas las páginas y los dos temas.
- **Sin** tablas, migraciones, permisos, integraciones, datos personales ni dependencias nuevas.
