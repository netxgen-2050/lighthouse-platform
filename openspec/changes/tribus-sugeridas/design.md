# Design

## Context

El perfil se guarda en `localStorage` con `CLAVES.perfil` y se lee con `leerGuardado` (`lib/perfil/estado.ts`): una lista de `{ respuesta, propuesta, confirmado }`, texto libre. Las tribus (`lib/tribus/datos.ts`) tienen `foco`, `subtitulo`, `declaracion`, `tiene` y `busca`. El mock-up v6 (`V.tribus`) trae la afinidad escrita a mano por persona de ejemplo (`fit.lucia`, `fit.lucas`); como Gus descartó las personas de ejemplo (`pasaporte-caminos`, actualización 7-oct), la afinidad se calcula con lo que escribió la persona. `/tribus` es un Server Component; el perfil solo se puede leer en el cliente.

## Goals / Non-Goals

**Goals:**
- Un cálculo puro, determinista y explicable, con un contrato que el agente de IA pueda cumplir después.
- La sección de sugerencias en `/tribus` y el cierre de la entrevista hacia ella.

**Non-Goals:**
- Precisión semántica (sinónimos, intención): es trabajo del agente.
- Afinidad en la ficha de tribu o en el mapa; usar el nivel de permanencia.

## Decisions

1. **Contrato** en `lib/tribus/afinidad.ts`:
   `sugerirTribus(respuestas: string[], tribus: Tribu[]): Sugerencia[]` con `Sugerencia = { tribu: Tribu; nivel: "alta" | "media" | "baja"; coinciden: string[]; aportas: string[] }`. Recibe solo los textos confirmados (`item.confirmado` no nulo), así la pantalla no decide nada. Es la única función que la IA reemplaza.
2. **Palabras:** `normalizar(texto)` pasa a minúsculas, quita tildes (`normalize("NFD")` sin marcas diacríticas), parte por todo lo que no sea letra y descarta palabras de menos de 4 letras y una lista corta de palabras vacías (`para, como, pero, porque, quiero, quisiera, gustaria, sobre, desde, entre, donde, cuando, mucho, poco, algo, todo, toda, todos, todas, esta, este, estos, estas, tengo, tener, hacer, puedo, podria, seria, nada, cosas`).
3. **Coincidencia de palabras:** dos palabras coinciden si son iguales o si ambas tienen al menos 5 letras y comparten las primeras 5 ("huerta"/"huertas", "solar"/"solares"). Una frase de la tribu (por ejemplo, un elemento de `busca`) coincide si alguna de sus palabras coincide con alguna palabra de las respuestas.
4. **Puntaje:** 2 puntos por cada elemento de `busca` que coincide (va a `aportas`, con su texto original) + 1 punto por cada elemento de `tiene` que coincide y 1 punto si coincide `foco`, `subtitulo` o `declaracion` (van a `coinciden`, con el texto original del elemento o el `foco`). Máximo 3 textos en cada lista. Nivel: `alta` si puntaje ≥ 4, `media` si 2 o 3, `baja` si 0 o 1.
5. **Selección:** se excluyen las tribus `vacante`. Se ordenan por puntaje descendente y barrio ascendente; se toman las dos primeras y, de las restantes, la de menor puntaje (empate: barrio ascendente). Si hay menos de tres candidatas, se muestran las que haya. Si no hay respuestas confirmadas, devuelve `[]`.
6. **Porqué en pantalla:** `coinciden` → "Coinciden en: a, b y c."; `aportas` → "Vos aportás: x, que hoy buscan."; ambas vacías → "No encontramos puntos en común con lo que contaste." La tarjeta `baja` agrega el aviso respetuoso y no muestra "Proponer mi pacto".
7. **Pantalla:** `app/tribus/sugeridas.tsx` (`"use client"`) lee el perfil después de hidratar (mientras tanto "Cargando sugerencias…"), recibe la lista de tribus como prop desde `app/tribus/page.tsx` y renderiza una `<section aria-labelledby="sugeridas">` con `<h2 id="sugeridas">Sugeridas para vos</h2>`. Tarjetas con `SelloTribu`, `bg-surface`, `border-line`; el nivel como `<span>` de texto con `TerminoLegal` `afinidad`. Si `localStorage` lanza, muestra el error en texto (`role="alert"`), como `/panel`.
8. **⚖ `afinidad`:** título "Afinidad", texto copiado de `LEGAL.afinidad` del mock-up v6: "Es una sugerencia para vos, nunca un filtro de ingreso. Las reglas de la comunidad se aplican sobre conductas medibles (agroquímicos, talas, agua, obras sin permiso), no sobre lo que pensás." Viene del mock-up, por eso no lleva `borrador: true`.
9. **Cierre de la entrevista:** en `entrevista.tsx`, el `<Link>` final pasa a "Ver mis tribus" con `href="/tribus#sugeridas"`, manteniendo el `ref` que le da el foco.

## Risks / Trade-offs

- [La coincidencia por prefijo da falsos positivos ("comunidad"/"comunicación")] → es un prototipo; el porqué muestra la palabra exacta que coincidió, así la persona entiende y no confía a ciegas. El agente de IA lo reemplaza.
- [Con perfiles muy cortos casi todo da "baja"] → se muestran igual tres tarjetas con su nivel real; nunca se sube un nivel para que se vea mejor.
- [Mostrar una tribu "distinta" puede leerse como juicio de valores] → el aviso es respetuoso, el ⚖ aclara que no filtra, y el directorio completo sigue debajo.

## Open Questions

- ¿Los barrios vacantes deberían aparecer como sugerencia para quien quiere fundar una tribu? Hoy se excluyen; decide Gus.
