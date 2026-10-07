# Noche 2026-10-07-1705 — territorio-mapa
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/21 · **Preview:** https://lighthouse-platform-1kwnsqfqv-net-xg-en.vercel.app

## En una línea
El mapa de los 12 barrios en `/territorios/lighthouse` funciona y pasó revisión y pruebas, pero quedan dos cosas sin cerrar: la geometría real de Soluna (bloqueada, necesita tu decisión) y la captura del mapa.

## Qué quedó hecho (tareas 9 de 11)
**Pendiente y bloqueado primero:**
- **A.1 (bloqueada):** usar la geometría real de `soluna.geojson`. El archivo trae solo fincas de Soluna, no los 12 barrios. La spec actual pide 12 barrios y prohíbe fincas y lotes, así que el implementador frenó en vez de improvisar.
- **4.1 (pendiente):** falta adjuntar una captura del mapa al PR. Las pruebas contra el preview sí se hicieron.

**Hecho:**
- 0.1, 1.1, 2.1 a 2.4, 3.1 y 3.2.
- Mapa con Leaflet y los 12 barrios (datos ilustrativos del mock-up v6, marcados como tales).
- Cada barrio es un sello al que se llega con Tab, y Enter lleva a su tribu (por ejemplo `/tribus/valle`). Las tribus vacantes llevan un "+".
- Leyenda en texto, nota de datos ilustrativos y atribución de OpenStreetMap.
- Si un territorio no tiene geometría, se muestra "Mapa: sin dato".
- El mapa sigue funcionando con el teclado aunque el mapa base no cargue.
- Tests nuevos: e2e del mapa, componente sin geometría, accesibilidad actualizada.

## Qué decidir a la mañana
1. **A.1, Soluna en el mapa (alta).** Opciones: mostrar Soluna como capa o selector aparte y reescribir los requisitos "Sin lotes ni plata en el mapa", "Mapa en la ficha" y `proposal.md`; o dejar los 12 barrios ilustrativos y sacar A.1 de este cambio. Hasta que decidas, no se toca.
2. **Dos archivos de test para el mismo componente (baja).** Existen `app/territorios/[id]/mapa-territorio.test.ts` y `.test.tsx`. Acción sugerida: pasar el caso de uno al otro, dejar el `.tsx` y borrar el sobrante con `git rm`. No se pierde ningún caso. (El implementador no pudo borrarlo porque `rm` está denegado.)
3. **Captura del mapa (4.1, baja).** Sacala a mano desde el preview y adjuntala al PR, o pedí otra pasada con una forma de capturar que envíe la cabecera de acceso del preview.
4. **Aviso de proceso (baja).** El implementador usó `cat >>` para editar `app/globals.css`, contra la regla de usar Write/Edit. El resultado es correcto; solo queda como nota.

## Revisor: veredicto y hallazgos
**Ronda 1: con observaciones** (0 altas, 1 media, 3 bajas).
- Media: "Tribu activa" y "En formación" se distinguían solo por color.
- Baja: las iniciales del sello se metían sin escapar en el HTML.
- Baja: el test con el mapa base bloqueado no probaba Tab ni Enter.
- Baja: "Mapa: sin dato" no tenía test de componente.

**Ronda 2 (commit 81b42a3): listo para revisión humana.** Los 4 hallazgos quedaron resueltos: borde punteado para "En formación", sello armado con `textContent`, test de Tab y Enter sin mapa base, y test de componente. También se agregó una opción en `vitest.config.mts` (necesaria para probar archivos con JSX; no afecta el build). Corrió `pnpm verificar` (231 tests), e2e del mapa local 8/8 y accesibilidad 20/20.
- Hallazgo nuevo, baja, sin corregir: los dos archivos de test (ver decisión 2).

## Tester: resultado
**Pasa.** Preview: https://lighthouse-platform-1kwnsqfqv-net-xg-en.vercel.app (responde 200 en `/territorios/lighthouse`).
- Playwright completo contra el preview: 134 pasaron, 0 fallaron (incluye mapa, territorio y accesibilidad).
- Guion manual, 5 pasos cubiertos por los e2e: portada y Territorio, mapa con 12 sellos y leyenda, Tab y Enter al barrio 6, sello vacante con "+", sin mapa base.
- Limitaciones: no hay captura del mapa. Tampoco hay una prueba propia del clic con mouse en un sello "+" hasta la tribu vacante.

## Para la próxima noche
- Resolver A.1 según lo que decidas y, si hace falta, actualizar primero la spec.
- Fusionar los dos tests de `mapa-territorio` en el `.tsx`.
- Cerrar 4.1 con la captura del mapa.
- Agregar una prueba del clic con mouse en un sello "+" de tribu vacante.
