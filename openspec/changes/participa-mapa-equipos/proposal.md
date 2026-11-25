# Proposal

## Why

En la revisión del 24-nov-2026 Gus pidió sacar Comunidades de Explorar y llevarla a un destino nuevo, **Participa**, con otro diseño:
- los equipos de trabajo van sobre **un mapa ilustrado hecho a medida**, un poco caricaturizado pero fiel al territorio (río Negro, costa, planicie, barda, mesetas, cañadón);
- cada equipo es el **círculo** que ya existe en el Fogón de gobernanza (`CIRCULOS_DEL_COMUN`), pero dibujado **no como un círculo geométrico** sino como algo que existiría en un territorio desarrollado con permacultura (una laguna, un vivero, un fogón, una cortina rompevientos…);
- las formas son **interactivas**: reaccionan al pasar el puntero;
- al hacer clic se abre **el detalle del equipo** con sus **posiciones o necesidades abiertas**: placeholders, **más de una por equipo**.

Pidió que se trabaje con el criterio de un diseñador gráfico profesional y con tendencias actuales.

Es el **tercero de cuatro cambios de corrección**. Depende de `explorar-unificado`.

## What Changes

- **Destino Participa (`/participa`)** pasa a `existe: true`; pública y bilingüe. Tiene dos pestañas: **Equipos** (por defecto) y **Visión** (`?ver=vision`).
- **Pestaña Equipos:** la tarjeta del común (Lighthouse VRN) arriba, y debajo **el mapa ilustrado** con los nueve equipos (`design.md` §2–4). Debajo del mapa, la misma lista de equipos como botones, para quien no usa el mapa.
- **Detalle del equipo:** panel lateral (computadora) u hoja inferior (celular) con la ilustración del equipo, qué decide, sus frentes de trabajo (los de hoy), **las posiciones abiertas** (de 2 a 4 por equipo, de ejemplo) y el botón "Quiero sumarme" que ya existe (`SumarmeEquipo`).
- **Datos de ejemplo nuevos:** `lib/equipos/posiciones.ts`, bilingüe, con marca "Ejemplo · a definir".
- **Pestaña Visión:** por ahora muestra lo que hoy muestra "Tribus · visión" (las tribus de ejemplo). El cambio 4 la reemplaza por el manifiesto 2050.
- **URL viejas:** `/tribus` redirige a `/participa` y `/tribus?ver=tribus` a `/participa?ver=vision`. Las páginas `/tribus/[id]` (incluida `/tribus/lighthouse` y su manifiesto) siguen en su URL y marcan Participa en el menú.

## Fuera de alcance

- Cambiar los círculos del común, sus decisiones o el Fogón (sigue en pausa).
- Pagos, sueldos o contratos: las posiciones son de ejemplo y no prometen remuneración.
- Postulaciones reales a una posición: el botón es el "Quiero sumarme" al equipo que ya existe.

## Capabilities

### New Capabilities
- `participa-mapa`: destino Participa con el mapa ilustrado de equipos y el detalle con posiciones abiertas.

## Impact

- **Nuevo:** `app/participa/page.tsx`, `components/participa/` (mapa SVG, formas de cada equipo, panel de detalle), `lib/equipos/posiciones.ts` (+ test), `lib/idioma/textos/participa.ts`, `e2e/participa.spec.ts`.
- **Cambia:** `lib/navegacion.ts` (Participa existe; `secciones: ["/participa", "/tribus"]`), redirección de `/tribus`, enlaces internos a `/tribus` → `/participa`, lista de rutas públicas y traducidas, `app/globals.css` (tokens de la ilustración en los dos temas).
- **Sin** tablas, migraciones, datos personales ni dependencias nuevas (todo con SVG, CSS y React).
