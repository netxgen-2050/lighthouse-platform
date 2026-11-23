# Proposal

## Why

En la dirección **A · Valle de noche** del lienzo "Lighthouse · direcciones visuales" (elegida por Gus el 23-nov-2026), quien quiere vivir en Lighthouse ve **primero el territorio y después los números**: la foto aérea del valle a sangre, el título encima y las cifras en paneles de vidrio. Hoy el barrio en venta está repartido entre `/territorios/lighthouse` (el mapa) y `/lotes` (la lista), y no hay una vista que responda en una pantalla "¿dónde viviría, con quién y cuánto cuesta?".

Es el **tercero de los cinco cambios** del pedido `rediseno-defi-tierra`. Depende de `rediseno-sistema-visual`, `rediseno-menu-cinco` y `portada-vrn` (PR #190); la parte "Barrio Norte" también de `bien-comun-numeros-barrio` y `lote-token-tierra`.

## What Changes

- **Inicio (`/`) con la dirección A:** mismo contenido que deja `portada-vrn` (promesa a 2030, Argentina, cinco capitales, cifras con fuente, por dónde empezar), repintado:
  - foto aérea del valle a sangre dentro del área de contenido, con la leyenda "Imagen ilustrativa" (`lighthouse-valle.webp`, la que ya está en el repo; decisión de Gus, 23-nov-2026);
  - título y llamado "Ver los lotes" sobre la foto;
  - las cifras con fuente de `portada-vrn` en paneles de vidrio, con la fuente visible;
  - el sello "Prototipo interno · datos de ejemplo".
- **Vista nueva "Barrio Norte" en `/barrios/norte`**, pública y bilingüe:
  - título sobre la foto y el sello de venta ("venta simulada · aprobación municipal pendiente");
  - **los lotes del barrio por estado** (disponibles, reservados, en cuotas, vendidos), con indicadores y chips, y enlace a `/lotes`;
  - **lo que va al bien común**: qué parte de cada pago va al común y la expensa, leídas de `lib/lotes/modelo.ts`, con enlace a `/bien-comun`;
  - **panel de la obra del barrio** (solo con sesión, como "Los números del barrio"): la infraestructura que financiaría el Token Inversor, cuánto se juntó ("sin dato" mientras no haya plata real), cómo se devuelve (a medida que entran las cuotas, mes calculado) y lo que le llega al común por año; sin sesión, un aviso para entrar.
- **"Barrios" aparece en la subnavegación de Explorar** (la lista única pasa `/barrios/norte` a `existe: true`).

## Fuera de alcance

- Cambiar los textos o las cifras de `portada-vrn`: solo cambia cómo se ven.
- Una lista de barrios (`/barrios`): hay uno solo en venta. "Barrios" apunta a Barrio Norte.
- Cambiar `/territorios/lighthouse` o `/lotes` más allá de los tokens nuevos y la subnavegación.
- Plata real, avance real de la obra o fecha de aprobación municipal (siempre "sin dato" o pendiente).
- Lighthouse SMA, el deck de inversores y la nota de las "300 razones".
- Rendimiento prometido: el panel dice plazo y forma de devolución, nunca un rendimiento anual.

## Capabilities

### New Capabilities
- `explorar-valle`: el Inicio y la vista Barrio Norte con la dirección A (foto a sangre, título sobre la foto, números en vidrio).

### Modified Capabilities
- Ninguna spec vigente cambia de requisito. `portada-narrativa` (de `portada-vrn`, sin archivar) conserva su contenido; este cambio solo define su presentación.

## Impact

- **Cambia:** `app/page.tsx` (presentación), `lib/navegacion.ts` (`/barrios/norte` existe), `lib/idioma/textos/portada.ts` (leyenda de la imagen), `public/imagenes/` (la imagen de la memoria, si Gus la pasa).
- **Nuevo:** `app/barrios/norte/page.tsx` y sus componentes, `lib/barrios/norte.ts` (arma los números de la vista desde `lib/lotes/*` y `lib/bien-comun/*`, sin escribir ninguno), `lib/idioma/textos/barrios.ts`, `e2e/barrio-norte.spec.ts`.
- **Tests:** `lib/lotes/sin-numeros-escritos.test.ts` vigila los archivos nuevos; `e2e/portada.spec.ts`, `e2e/accesibilidad.spec.ts`, `e2e/descubrir-publico.spec.ts`.
- **Ruta pública nueva** (`/barrios/norte`): se suma a la lista de rutas públicas; el panel de la obra se muestra solo con sesión.
- **Sin** tablas, migraciones, integraciones, datos personales ni dependencias nuevas.

## Decisiones de Gus (23-nov-2026)

- **Imagen:** `lighthouse-valle.webp`, la que ya está en el repo, con la leyenda "Imagen ilustrativa". Se cambia después si hay otra.
- **Tema oscuro también en la Vista NetX:** toda la app usa el tema oscuro por defecto; quien prefiera el claro lo elige en Configuración.
