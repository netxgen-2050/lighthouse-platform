# Proposal

## Why

La fase 1 vende lotes en Lighthouse VRN (ADR-030), y hoy el mapa no tiene ninguno. Hace falta verlos sobre el territorio para la reunión del lunes 9-nov. Los datos son un boceto improvisado, pero Gus recibe esta semana el KMZ de Martín: reemplazar uno por el otro no tiene que tocar pantallas.

## What Changes

- **Vista "Lotes" nueva** en el registro `VISTAS`, primera en el selector y **vista por defecto** de `/territorios/lighthouse`, encuadrada en los lotes. `?vista=ahora`, `plan` y `vision` siguen como están.
- **Capa de lotes:** el sector norte (~102 ha), 25 lotes de 1.344 a 2.200 m², el espacio de uso común, la producción y el camino.
- **Datos provisorios:** `datos/loteo-norte-boceto.geojson` (copia de `NS_platform/Documentation/datos/`, generada por `boceto_loteo_norte.py`). Todo marcado en texto como **"Loteo provisorio, ilustrativo"**, y se aclara que el boceto no considera la línea de inundación, la costa ni el relieve.
- **Lista equivalente** navegable con teclado, estados (disponible, reservado, vendido) en texto y forma, y 390 px sin scroll horizontal.
- **Estado administrativo:** el mapa muestra también el de `lighthouse-norte`.
- **Importador** de KMZ a ese mismo formato, con validación: dentro del polígono del 7A, sin superposiciones e ids estables. Si algo falla, no escribe nada.

## Fuera de alcance

- **Ficha, precio, reservar y comprar:** son `lote-ficha-y-compra`. En este cambio el lote muestra superficie, estado y estado administrativo, sin acciones ni precios.
- **`/lotes`:** la crea `lote-ficha-y-compra`.
- **Importar el KMZ de Martín:** acá va la herramienta. Reemplazar los datos lo hace Gus, cuando lo tenga, con otro PR chico.
- **Verificar la franja del río:** el boceto no tiene ese dato. El importador avisa "sin verificar" (ver preguntas de `modelo-hibrido-procomun`).
- **Masterplan, zonas A–D y capas nuevas** (T2, L4, P24): el KMZ del loteo no es el masterplan. La fila "Masterplan de Martín" de la vista Plan sigue igual.
- **Lighthouse SMA y plata real.**

## Capabilities

### New Capabilities
- `loteo-norte`: la capa, la lista y los estados de los lotes del sector norte, sus datos y su importador.

### Modified Capabilities
- `territorio-vistas`: cuarta vista y nueva vista por defecto. Cambian "Selector de vistas del mapa", "Línea de tiempo por fases", "Soluna en todas las vistas" y "Accesibilidad y calidad de las vistas".
- `estado-administrativo`: "Aviso en las vistas con lotes" suma Norte.

## Impact

- **Código nuevo:** `lib/territorios/loteo-norte.json`, `lib/territorios/loteo.ts`, `lib/territorios/loteo-estados.ts`, `lib/territorios/importar-loteo.ts`, `scripts/importar-loteo.ts`, `docs/notas/importar-loteo.md`.
- **Código que cambia:** `lib/territorios/vistas.ts`, `app/territorios/[id]/capas.ts`, `mapa-leaflet.tsx`, `vitrina-territorio.tsx`, `ficha-lateral.tsx` o `vistas/paneles.tsx`, `page.tsx`, y `lib/idioma/textos/territorio.ts`.
- **Tests:** `lib/territorios/vistas.test.ts`, tests nuevos de `loteo` e `importar-loteo`, `e2e/loteo-norte.spec.ts`, y los e2e que asumían "Ahora" por defecto (`e2e/territorio-vistas.spec.ts`, `e2e/territorio.spec.ts`, `e2e/territorio-mapa.spec.ts`, `e2e/estado-administrativo.spec.ts`).
- **Sin** tablas, migraciones, permisos ni dependencias nuevas. El KMZ se abre con `unzip`, que ya está en la Mac y en Linux.
- **Depende de** `venta-lotes-regla` (proyecto `lighthouse-norte`): se apila sobre ese cambio en el mismo carril.
- **Revisión de arquitectura:** recomendada porque suma datos con los que después se venderá y un importador. La corre el script de Gus en un paso aparte.
