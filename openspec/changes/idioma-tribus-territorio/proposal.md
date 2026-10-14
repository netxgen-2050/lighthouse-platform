# Proposal

## Why

Segunda zona de la plataforma bilingüe (ver `idioma-base` y ADR-004): lo que se descubre sin cuenta después de la portada. Un inversor del exterior que entra a ver las tribus y el territorio del Lighthouse tiene que entender qué es cada tribu, qué busca, en qué estado está y qué hay en el mapa. Acá se aplica por primera vez a fondo la regla de qué datos de ejemplo se traducen. Entra en una noche.

## What Changes

- **Tribus en inglés:** `/tribus` (listado, filtros, vacantes), `/tribus/[id]` (ficha, acciones de membresía, avales, plata comprometida, roles), `/tribus/[id]/manifiesto` (la interfaz de lectura y adhesión) y `/tribus/[id]/postular` (formulario de postulación de una comunidad, con sus errores).
- **Territorio en inglés:** `/territorios/[id]` (vitrina, ficha lateral, controles y leyenda del mapa, lugares de interés, terreno común, barrios). El aviso del estado administrativo (Ord. 173) queda para `idioma-legal` porque tiene peso legal.
- **Datos de ejemplo, según la regla de `idioma-base` (design §10):**
  - Se traducen como `Bilingue`: los campos descriptivos de cada tribu (`foco`, `subtitulo`, `tiene`, `busca`, `areas`, `areasAbiertas`, `ritual`, `formaJuridica`, `etapa`, `hogares`, `pozo`), los textos del territorio (`lib/territorios/textos.ts`: terreno común y descripciones de lugares) y los nombres **descriptivos** de lugares ("Restaurante, coliving, cowork…" → "Restaurant, coliving, cowork…").
  - No se traducen (se muestran en el original con `lang="es"` y "Written in Spanish"): la `declaracion` de cada tribu y los **manifiestos** (`lib/manifiestos/datos.ts`), porque son la voz de la comunidad. Si Gus decide traducirlos, se suma como `Bilingue` en una tarea aparte (pregunta abierta).
  - No se traducen nunca: nombres de tribus, barrios, territorios y lugares propios (Valle Solar, Macrolote 7, Soluna, Temazcal, Gaia Sapiens Institute), que van con `translate="no"`.
- **Estados y textos de membresía** (`components/membresia-acciones.tsx`, `lib/membresia/`, `lib/postulaciones/` mensajes) y `components/sello-tribu.tsx` (nombre accesible).
- Montos (plata comprometida y meta) y cantidades con el formato del idioma.
- Las cinco rutas se suman a `RUTAS_TRADUCIDAS`.

### Fuera de alcance

- Traducir los manifiestos y las declaraciones (pregunta para Gus).
- ⚖ de estas páginas (`art32`, `loteo`, etc.) y el aviso de la Ord. 173: `idioma-legal`.
- Nombres de capas o etiquetas que vienen dentro del GeoJSON del territorio (se regeneran con `datos/generar_territorios.py`, L4).
- Calendly real de la postulación (L7).

## Capabilities

### New Capabilities
- `idioma-tribus-territorio`: tribus, manifiesto (interfaz), postulación y territorio en inglés, con la regla de qué datos de ejemplo se traducen.

### Modified Capabilities
- (ninguna)

## Impact

- Código: `lib/idioma/textos/tribus.ts` y `lib/idioma/textos/territorio.ts` (nuevos), `app/tribus/**`, `app/territorios/[id]/**`, `lib/tribus/datos.ts` y `tipos.ts` (campos `Bilingue`), `lib/territorios/textos.ts`, `components/membresia-acciones.tsx`, `components/sello-tribu.tsx`, `lib/membresia/estado.ts`, `lib/postulaciones/postulaciones.ts` (mensajes), `lib/idioma/rutas.ts`.
- Lo que lee esos campos fuera de esta zona (Sumarte, Pactos, Vista NetX) pasa a resolverlos con el idioma; en español no cambia nada.
- Tests: `lib/tribus/datos.test.ts` (todos los campos descriptivos con `en`), `e2e/idioma-tribus-territorio.spec.ts`; los e2e en español (`tribus`, `territorio`, `territorio-mapa`, `postulacion`, `membresia`, `descubrir-publico`) siguen iguales.
- Sin datos personales nuevos, sin permisos, sin base, sin plata nueva.
- Depende de `idioma-base`; conviene después de `idioma-portada-sumarte` (reutiliza `TEXTO_ESTADO`).
