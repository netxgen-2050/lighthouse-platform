# Importar el KMZ del loteo (sector norte)

Cómo reemplazar el boceto de lotes por el plano de Martín. Spec: `openspec/changes/loteo-norte-7a/` (capacidad `loteo-norte`).

Hoy `lib/territorios/loteo-norte.json` es un **boceto improvisado** (25 lotes sobre el polígono del 7A) que no considera la línea de inundación, la costa ni el relieve. Todas las pantallas leen ese único archivo a través de `lib/territorios/loteo.ts`: reemplazarlo alcanza para cambiar el mapa, la lista y el panel, sin tocar ninguna pantalla.

## Pasos

1. **Comprobar** el KMZ (o KML) sin escribir nada:

   ```
   pnpm exec tsx scripts/importar-loteo.ts ruta/al/plano.kmz --comprobar
   ```

   Muestra cuántos lotes y zonas leyó, los avisos y los errores. Sale con 0 si el plano es válido y con 1 si no lo es.

2. **Importar** (escribe `lib/territorios/loteo-norte.json`):

   ```
   pnpm exec tsx scripts/importar-loteo.ts ruta/al/plano.kmz
   ```

   Con cualquier error **no escribe nada**. Opciones: `--salida <archivo.json>` para escribir en otro lado, `--comprobar` para validar sin escribir.

3. **Revisar** el diff: tiene que cambiar **solo** `lib/territorios/loteo-norte.json`. Después `pnpm verificar` y `pnpm build`, y un PR chico con ese archivo.

Volver atrás es revertir ese PR. El KMZ se abre con `unzip` (ya está en la Mac y en Linux) y se toma su primer `.kml`.

## Planos sin nombres (CAD): el mapeo

El KML de Martín del 3-nov (`datos/planos/261103_Masterplan_KLM.kml`) sale de CAD: 140 líneas, sin nombres ni capas, muchas repetidas. Qué es cada una lo dice un archivo aparte, escrito a mano (`datos/planos/261103_Masterplan_KLM.mapeo.json`), por número de Placemark:

```
pnpm exec tsx scripts/importar-loteo.ts datos/planos/261103_Masterplan_KLM.kml --mapeo datos/planos/261103_Masterplan_KLM.mapeo.json
```

Todo Placemark tiene que estar en el mapeo o ser copia exacta de uno que esté: lo que no se usa va en `ignorar`, con su motivo. **El mapeo es nuestra lectura, no un dato de Martín:** la pantalla lo dice. Hoy lee 21 lotes, un sector de 32,3 ha y 27 "parcelas sin uso definido", que se dibujan sin clic y no cuentan como lotes. Los 4 lotes del oeste quedan afuera porque caen fuera del polígono del 7A.

## Cómo se leen los nombres

Cada polígono (`Placemark`) se clasifica por su nombre, sin distinguir mayúsculas ni acentos:

| Nombre | Tipo | Id |
|---|---|---|
| `Lote 12`, `L-12`, `L12` | lote | `lote-12` |
| contiene `comun` | uso común | `sector-norte-comun` |
| contiene `produccion` | producción | `sector-norte-produccion` |
| contiene `camino` o `calle` | camino | `sector-norte-calle` |
| contiene `sector` | sector | `sector-norte` |

**Un polígono con otro nombre (por ejemplo "Pileta") se informa y hace fallar la importación**: nunca se descarta en silencio. No sabemos todavía cómo nombra Martín sus polígonos: ajustar esta tabla (`clasificar` en `lib/territorios/importar-loteo.ts`) al recibir el KMZ es parte del PR del reemplazo.

## Qué valida

**Errores** (no escribe nada, y nombra los ids afectados):

- un lote fuera del polígono del 7A (todos sus vértices adentro y ningún lado cruzando el borde);
- dos lotes superpuestos (compartir un lado entre vecinos no cuenta; la tolerancia es 0,5 m);
- un id repetido o con formato distinto de `lote-<número>`;
- un anillo sin cerrar o con menos de 3 vértices distintos;
- dos polígonos que dan el mismo id de zona (por ejemplo, dos caminos);
- ningún lote.

**Avisos** (escribe igual):

- falta el sector o alguna zona: la pantalla dice "sin dato";
- un id del archivo anterior que ya no está: afecta a los estados de ejemplo y a las reservas guardadas en el navegador;
- un lote con estado de ejemplo (`lib/territorios/loteo-estados.ts`) que ya no existe;
- **"Franja del río: sin verificar (sin dato)"**, en cada corrida. No tenemos ese dato: el importador no da a entender que los lotes estén fuera de esa franja.

## Ids estables

El id sale del número de lote (`Lote 7` es siempre `lote-7`), así que importar otra versión del plano conserva el id de cada número aunque cambie su forma.

## Qué cambia en las pantallas

El archivo importado trae `metadata.fuenteId: "martin"` y la fecha de importación: la vista Lotes pasa a decir "Plano de Martín (KMZ, <fecha>)" y deja de decir que el boceto no considera inundación, costa ni relieve. Sigue diciendo **"Loteo provisorio, ilustrativo"** y `ilustrativo: true` se mantiene: sacar esa marca es una decisión, no una importación.

Los tests que dependen de los 25 lotes del boceto (cantidad, 1.344 y 2.200 m², 102 ha, `lote-13` vendido) se saltean solos cuando la fuente deja de ser el boceto.

## Para mirar con el plano real

Los lotes del boceto caen dentro del Barrio 1 de la vista Visión, que lo muestra con su tribu de ejemplo. Con el plano real hay que mirar ese cruce.

## Los primeros 4 lotes y las parcelas (4-nov-2026)

- `primeros` en el mapeo: número de finca de BioPueblo → Placemark y superficie oficial. Salen como `lote-535`, con `grupo: "primeros"`. Si cambian, hay que actualizar `FINCAS_PRIMEROS_LOTES` en `lib/territorios/biopueblo.ts`. Están fuera del 7A a propósito (R40): el validador no se lo exige solo a ellos.
- `parcelas` pasó de lista a código → Placemark. Los códigos salen de cruzar superficie y posición con la tabla 2.3.2 de la memoria técnica de Martín del 3-nov. Es lectura nuestra, a confirmar con él.
- Si cambia la superficie mínima o máxima de los lotes, hay que actualizar `precioLote` en `lib/lotes/modelo.ts`: lo vigila un test.
