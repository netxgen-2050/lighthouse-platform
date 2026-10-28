# Design

## Context

`/semillas` ya tiene la ronda de reconocimiento (`semillas-libro`, `semillas-v2`): la persona puntúa a dos compañeros de ejemplo (Martina y Joaquín) de 1 a 5 en `rol` y `cultura`, con motivo obligatorio, y la ronda se guarda en el navegador (`CLAVES.semillasRonda`, `lib/semillas/estado.ts`). El factor es la constante `FACTOR_EVALUACION = 1` y "Cómo te reconocieron" muestra quién puntuó (`RECONOCIMIENTO_RECIBIDO` con `de`).

Gus decidió el 23-oct-2026 (ADR-012, en Propuesta; `NS_Tokenomics` 07 J-2 y 29 K11; Backlog D13 y D15) que las Semillas sean constancias con forma de EAS en dos pasos y adoptó ocho defensas contra la colusión. Este cambio las lleva a una función pura y a la pantalla, sin base.

El 28-oct-2026 Gus respondió las preguntas del PR #127:
- Rol y cultura pesan **50/50** de partida. Más adelante los admins podrán proponer otro peso en la gobernanza (anotado, fuera de alcance).
- **Punto de partida: todos son honestos** y se calibra desde ahí. La defensa (e) de parejas recíprocas queda implementada y testeada, pero **apagada** por defecto. El tope (f) y la mediana (d) se mantienen (efecto en equipos divididos en §2).
- Los motivos escritos **no se muestran crudos**: una IA arma un resumen del feedback de todas las personas. En el prototipo es un texto de ejemplo marcado (§3 bis). Contestar el feedback queda como diseño futuro.
- La fuerza del ajuste **queda fija al abrir la ronda** (§2 bis).
- El ajuste también alcanzará a las Semillas de pactos puntuales (D20), con un peso a repensar (pregunta abierta).

## Goals / Non-Goals

**Goals:**
- Una función pura, determinista y testeable que dé el `f_eval` de cada persona del equipo de una ronda.
- Que cada defensa tenga al menos un test propio y que haya tests de colusión (pareja y anillo chico).
- Mostrar el resultado agregado y las dos constancias con datos de ejemplo.

**Non-Goals:**
- Base, firmas, EAS real, calibración (ver proposal, "Fuera de alcance").
- Cambiar el saldo del panel de Semillas.

## Decisions

### 1. Módulo `lib/evaluacion/`
Separado de `lib/semillas/` porque la evaluación entre pares también va a servir para círculos, convocatorias (D31) y el pacto en dos partes. Archivos:
- `tipos.ts`: `Dimension = "rol" | "cultura"`, `Evaluacion = { de: string; a: string; dimension: Dimension; nota: number; motivo: string }`, `Parametros`, `Resultado`, `MotivoDescarte = "autoevaluacion" | "fuera-del-equipo" | "sin-motivo" | "nota-invalida" | "reciprocidad"`.
- `parametros.ts`: `PARAMETROS_DE_PARTIDA = { agregado: "mediana", reciprocidadActiva: false, umbralReciprocidad: 1.5, topePorEvaluador: 1, minimoEvaluadores: 3, pesoRol: 0.5, fuerza: 0.2 }` y `FUERZAS = [0, 0.05, 0.1, 0.15, 0.2]`. Comentario: "valores de partida, se calibran con simulación (NS_Tokenomics 29 K11). Partimos de que todos son honestos: la reciprocidad está apagada hasta que la comunidad la active o K11 lo pida. El peso 50/50 lo podrán cambiar los admins por gobernanza más adelante".
  <!-- arquitecto: versión del algoritmo para que cada ajuste sea reproducible (ADR-018, como ADR-010 con los modelos de tokenomics). -->
  También `VERSION_EVALUACION = 1`: se sube con cada cambio del orden del cálculo o de los parámetros de partida.
- `calculo.ts`: `calcularFactorEvaluacion(equipo: string[], evaluaciones: Evaluacion[], persona: string, parametros?: Partial<Parametros>): Resultado` y helpers puros (`mediana`, `mediaRecortada`, `redondearFactor`).
- `guia.ts`: guía por dimensión y nivel, es/en.
- `constancias.ts`: `constanciasDeRonda(...)`.
- `ejemplo.ts`: equipo y evaluaciones de ejemplo.
- `evaluacion.test.ts`.

### 2. Orden del cálculo (para una persona P y cada dimensión)
1. **Validar** cada evaluación sobre P: `de === a` → `autoevaluacion`; `de` o `a` fuera de `equipo` → `fuera-del-equipo`; nota no entera o fuera de 1–5 → `nota-invalida`; `motivo.trim() === ""` → `sin-motivo`. Si un mismo evaluador tiene dos notas para P en la misma dimensión, cuenta la última del arreglo.
2. **Reciprocidad** (solo si `reciprocidadActiva`; con el valor de partida `false` este paso no descarta nada): para cada nota válida de E sobre P, si existe alguna evaluación válida de P sobre E en la ronda (cualquier dimensión) y `|nota − mediana(notas válidas de los demás sobre P en esa dimensión)| ≥ umbralReciprocidad` → `reciprocidad`. Si los demás son menos de 2, no se aplica (no hay contra qué comparar; el mínimo de evaluadores ya lo neutraliza).
3. **Mínimo**: si quedan menos de `minimoEvaluadores` notas, la dimensión vale 3 y se marca `suficiente: false`.
4. **Tope por evaluador**: cada nota se acota a `[m − tope, m + tope]`, con `m` = mediana de las otras notas que quedaron (calculado sobre las notas originales, no sobre las ya acotadas, para que no dependa del orden).
5. **Agregado**: mediana, o media recortada con `r = max(1, floor(n × 0,2))` por lado.
6. **Combinar**: `nota = pesoRol × rol + (1 − pesoRol) × cultura`; `fuerza` acotada a [0; 0,2]; `f = 1 + fuerza × (nota − 3) / 2`; acotar a [0,8; 1,2]; redondear.

**Redondeo**: `Math.round(Number((f * 100).toFixed(6))) / 100` (evita que 1,025 dé 1,02). Hay un test con 1,025.

**Propiedad del tope** (test): como la mediana y la media recortada mueven su resultado como mucho lo que se mueve una nota, acotar cada nota a ± tope garantiza que reemplazar la nota de un evaluador por la mediana de los demás cambia el agregado como mucho en `tope`. Se prueba con varios conjuntos fijos (sin generadores aleatorios, para que el test sea determinista).
<!-- arquitecto: la propiedad no está demostrada porque la ventana de cada nota depende de las notas de los demás. -->
**Ojo:** la cota no está demostrada en general: al reemplazar la nota de E también se mueven las ventanas de los otros evaluadores. Los conjuntos fijos tienen que incluir al menos un equipo polarizado (1, 1, 5, 5 más una quinta nota) y uno con todas las notas iguales salvo una. Si algún conjunto rompe la cota, **no se ajusta el algoritmo para que pase**: se deja el conjunto en el test marcado como caso conocido (`it.fails`) y se reporta, porque cambiar el orden del cálculo es una decisión de calibración (K11).

**Con la reciprocidad apagada, ¿alcanza?** En un equipo mayormente honesto, sí: los anillos de 2 (equipo de 6) y de 3 (equipo de 7) que se ponen 5 entre sí, con el resto en 3, quedan en 1,00 solo con el tope y la mediana (cada 5 se acota a 4 y la mediana sigue en 3). La reciprocidad suma protección en equipos chicos (3–4 personas), donde una pareja pesa la mitad del equipo. Por eso queda lista para activarse.

**Efecto del tope y la mediana en un equipo dividido** (se mantienen, decisión de Gus). Cuando el equipo está partido de verdad, el tope acerca cada nota a lo que dijo "el otro lado":
- **Mitad y mitad** (1, 1, 5, 5): cada 1 se acota a 4 (la mediana de los otros es 5) y cada 5 a 2 (la mediana de los otros es 1). Resultado: 3, neutro. Una persona que divide opiniones queda en `f_eval` 1,00, sin premio ni castigo, y la pantalla no muestra que hubo división.
- **Mayoría y minoría** (5, 5, 5, 1, 1): cada 5 se acota a 4 (la mediana de los otros es 3) y cada 1 sube a 4 (la mediana de los otros es 5). Resultado: 4, en vez del 5 que daría la mediana sola. Gana la mayoría, pero moderada, y la opinión de la minoría casi no se ve.
- Lo que se gana: nadie (ni un grupo chico) puede llevar a alguien a un extremo. Lo que se pierde: un desacuerdo real se ve como "neutro". Si con datos se ve que pasa seguido, la calibración (K11) puede subir el tope o probar otra forma de acotar. Hay un test de caracterización con estos dos casos (tarea 1.5), que no se "arregla": documenta el comportamiento.

**Alternativas descartadas:** medir la influencia "sacando" al evaluador (leave-one-out) cambia el número de evaluadores y puede cruzar el mínimo de 3, así que no da una cota limpia; ponderar la nota recíproca con 0,5 en vez de descartarla complica la mediana. Ambas quedan para la calibración.

### 2 bis. Qué significa que la fuerza quede fija al abrir la ronda (en palabras simples)
La **fuerza** dice cuánto pueden mover tus Semillas las notas de tus compañeros: con 0 no mueven nada (siempre 1,0); con 0,2, como mucho un 20 % para arriba o para abajo.

Que quede **fija al abrir la ronda** quiere decir que la comunidad la elige **antes** de que nadie puntúe, y durante esa ronda nadie la puede cambiar. Es como acordar las reglas del partido antes de jugarlo:
- Todos puntúan sabiendo cuánto pesa su nota.
- Nadie puede subirla o bajarla después de ver los resultados para favorecer o perjudicar a alguien.
- Si la comunidad quiere otra fuerza, la decide ahora y **vale desde la ronda siguiente**. Las constancias de ajuste ya emitidas no se tocan, así que no hace falta revocar ni volver a emitir las de todo el equipo.
- La constancia de ajuste guarda la fuerza con que se calculó (ADR-018), así que siempre se puede ver con qué regla salió.

En el prototipo el selector **no cambia la fuerza de la ronda**: muestra "cómo habría dado con otra fuerza". Por eso cada fuerza simulada arma una constancia de ajuste con otro `uid` (nunca se edita una constancia) que apunta a la misma base, y la pantalla lo aclara.

### 3. `Resultado` sin nombres ni motivos
`{ factor: number; fuerza: number; rango: [number, number]; dimensiones: Record<Dimension, { nota: number | null; evaluadores: number; suficiente: boolean }>; descartes: Record<MotivoDescarte, number>; resumenDisponible: boolean }`. `nota` es `null` ("sin dato") cuando no hubo ninguna nota válida; si hubo alguna pero no alcanzó el mínimo, se muestra la regla ("menos de 3 evaluaciones"), no la nota. `resumenDisponible` es `true` solo si las dos dimensiones tienen el mínimo de evaluadores. El `Resultado` **no lleva los motivos**. Test: `JSON.stringify(resultado)` no contiene ningún id de evaluador ni el texto de ningún motivo.

### 3 bis. Resumen del feedback (en vez de motivos crudos)
- Decisión de Gus: la persona no lee lo que cada uno escribió; lee **un resumen** del feedback de todas las personas. Así no se reconoce a nadie por su forma de escribir (riesgo que marcó el arquitecto en equipos de 3 a 5).
- **Prototipo:** `ejemplo.ts` exporta `RESUMEN_FEEDBACK_EJEMPLO` (es/en), un texto fijo escrito a mano, coherente con los motivos de ejemplo pero sin copiar ninguna frase. La pantalla lo muestra con la etiqueta "Resumen de ejemplo (simulado) · en la versión real lo arma una IA con lo que escribieron todas las personas". No se llama a ningún modelo.
- Se muestra solo si `resumenDisponible`; si no, "Todavía no hay resumen: hacen falta 3 evaluaciones o más en cada dimensión".
- **Versión real (fuera de alcance):** el servidor pasa al modelo solo los motivos de las notas que contaron, sin autor ni ids, y al navegador llega únicamente el resumen. Qué modelo, qué instrucciones, cómo se evita que el resumen cite frases textuales y qué se guarda es un cambio propio con revisión del arquitecto.
- **Contestar el feedback** (responder, pedir aclaraciones): tarea de diseño futura, anotada.

### 4. Datos de ejemplo (`ejemplo.ts`)
Equipo de la ronda (mismo círculo, período `2026-10`): `vos`, `martina`, `joaquin`, `lucia`, `tomas`. Evaluaciones de ejemplo **sobre `vos`** (con motivo es/en, sin autor visible):

| de | rol | cultura |
|---|---|---|
| lucia | 3 | 4 |
| tomas | 3 | 4 |
| martina | 4 | 4 |
| joaquin | 5 | 5 |
| bruno (fuera del equipo) | 5 | 5 |

Al enviar, la pantalla agrega las notas que la persona dio a Martina (`martina`) y Joaquín (`joaquin`) como evaluaciones de `vos`.

**Con los parámetros de partida (reciprocidad apagada), fuerza 0,2:** Bruno descartado (2 notas "fuera del equipo"); ningún descarte por reciprocidad.
- `rol`: notas 3, 3, 4, 5. Tope: cada 3 queda en 3 (la mediana de los otros es 4); el 4 de Martina queda en 4 (mediana de los otros 3); el 5 de Joaquín se acota a 4 (mediana de los otros 3). Mediana(3, 3, 4, 4) = **3,5** (4 evaluadores).
- `cultura`: notas 4, 4, 4, 5; el 5 queda en 5 (mediana de los otros 4). Mediana = **4** (4 evaluadores).
- Nota combinada 3,75; `f_eval` = 1 + 0,2 × 0,75 / 2 = 1,075 → **1,08**. Con fuerza 0,1: 1,0375 → **1,04**.

**Con `reciprocidadActiva: true`** (solo en tests): Joaquín en `rol` se descarta (5 contra mediana 3 de Lucía, Tomás y Martina); `rol` = mediana(3, 3, 4) = 3; `cultura` = 4; nota 3,5; `f_eval` 1,05 (fuerza 0,2) y 1,03 (fuerza 0,1); 1 descarte "reciprocidad".

Estos números son los de los escenarios de la spec y de los tests.

Martina y Joaquín conservan sus nombres en el formulario de puntuar (la persona sabe a quién evalúa); lo que deja de tener nombres es lo **recibido**.

### 5. Constancias (`constancias.ts`, forma de ADR-012)
```
type Constancia = { uid: string; schema: "semillas-base" | "semillas-ajuste"; afirma: "netx"; sobre: string;
  apunta_a: string | null; datos: Record<string, string | number>; creada_en: string; revocada_en: null; vence_en: null };
```
- Base: `uid = ejemplo-base-<comunidad>-<periodo>`, `datos = { pacto, horas, valor_hora_usd: HOUR_REF_USD, periodo, version_pacto: "v1-ejemplo", semillas: Math.round(horas × HOUR_REF_USD) }` (una ronda = un mes; 10 h → 50).
- Ajuste: `uid = ejemplo-ajuste-<comunidad>-<periodo>-f<fuerza × 100>`, `apunta_a = uid de la base`, `datos = { f_eval, semillas, version_evaluacion, fuerza, agregado, reciprocidad_activa, umbral_reciprocidad, tope_por_evaluador, minimo_evaluadores, peso_rol, evaluadores_rol, evaluadores_cultura }` (50 × 1,08 → 54; con reciprocidad activa, 50 × 1,05 = 52,5 → 53). `reciprocidad_activa` va como `"si"`/`"no"` porque `datos` solo admite texto o número.
<!-- arquitecto: ADR-012 dice "nunca se edita"; con el mismo uid y otra fuerza el ejemplo enseñaría a editar. Parámetros congelados por ADR-018. -->
  - El `uid` del ajuste cambia con la fuerza: otra fuerza es **otra** constancia que apunta a la misma base. Como en la versión real la fuerza queda fija al abrir la ronda (§2 bis), eso solo pasa en la simulación. La pantalla lo dice en una línea ("simulación: con otra fuerza sería otra constancia que apunta a la misma base; en una comunidad real la fuerza se fija al abrir la ronda").
  - `datos` guarda los parámetros con que se calculó (ADR-018) y solo conteos agregados: **nunca** ids de evaluadores ni motivos. Test: `JSON.stringify(constancias)` no contiene ningún id de evaluador.
  - `semillas` del ajuste = `Math.round(semillasBase × f_eval)` sobre la base **entera** ya emitida (no sobre las horas), con el mismo cuidado de coma flotante que `redondearFactor` (50 × 1,05 = 52,5 está justo en el medio).
  - Las Semillas base salen de una sola función mensual reutilizada (la misma cuenta que `semillasTiempo` sin el × `MESES`), para que el bloque de constancias y el panel no diverjan. El bloque aclara que la constancia es **por ronda (un mes)**, porque el panel muestra 3 meses (150).
- `creada_en` fija (`2026-10-31T00:00:00Z`) para que sea determinista. `afirma` siempre `"netx"` (ADR-012: nunca la billetera de una persona).
- Sin pacto aceptado: la función no se llama y la pantalla muestra "sin dato".

### 6. Pantalla
- La fuerza vive en el estado del componente (no se guarda). El resultado y las constancias se calculan en render a partir de la ronda guardada (`enviada`) y la fuerza.
- La guía del nivel se asocia con `aria-describedby` al grupo de botones; "Ver la guía de los 5 niveles" es un `<details>` (usable con teclado).
- Nada se comunica solo con color: los descartes son texto; el rango del factor se escribe ("0,80–1,20").
- Los números con `formatearNumero`/`LOCALES` (coma en español, punto en inglés).

### 7. Textos y ⚖
- Textos en `lib/idioma/textos/semillas.ts` (es/en). Se reemplazan `factorFijo` y `pie`.
- `lib/legal/terminos.ts`: `evaluacionPares` ("Evaluación entre pares": quién evalúa, que es privada y agregada, que lo escrito no se muestra tal cual sino resumido, que las Semillas no son plata ni se transfieren y que los parámetros son de prueba) y `constanciaSemillas` ("Constancia de Semillas": registro que no se edita, se revoca y se vuelve a emitir; hoy vive en el navegador como ejemplo; nunca datos personales en una cadena). Ambos `borrador: true` y con `en`.

### 8. Camino a la versión real (no se construye ahora)
<!-- arquitecto: para que el prototipo no fije un patrón que con datos reales filtraría quién evaluó a quién (ADR-018, ADR-015). -->
- `calcularFactorEvaluacion` es pura y se puede importar desde el servidor tal cual. En la versión real corre **solo en el servidor**; al navegador llega únicamente el `Resultado`. Las evaluaciones con `de` nunca viajan al navegador de otra persona.
- El `equipo` lo arma el servidor desde la membresía del pacto o círculo en el período, nunca desde lo que mande el navegador.
- Las evaluaciones van a una tabla propia (`evaluaciones`, skill `base-de-datos`), de solo agregar, nunca en `jsonb` ni en logs, y entran en "Mis datos" (lo que la persona **dio**; lo recibido, solo agregado).
- La fuerza de cada ronda se guarda con la ronda al abrirla y no se puede modificar mientras esté abierta. Cambiarla es una decisión de gobernanza que vale para la próxima.
- El resumen del feedback lo arma el servidor con una IA (§3 bis); los motivos nunca llegan al navegador de la persona evaluada.
- Hoy la ronda (con los motivos que la persona escribe sobre Martina y Joaquín, de ejemplo) ya vive en `localStorage` (`lh-semillas-ronda`, desde `semillas-v2`) y ya sale en "Mis datos". Este cambio no agrega nada guardado: la fuerza no se guarda y el resultado se calcula en render.

## Risks / Trade-offs

- [Con la reciprocidad apagada, una pareja en un equipo de 3–4 personas puede inflarse un poco] → Decisión de Gus: partir de la confianza. El tope limita a cada uno a ± 1 estrella sobre los demás y la defensa queda lista para activarse (comunidad o K11).
- [El tope y la mediana esconden un desacuerdo real del equipo] → Documentado en §2 con dos casos y un test de caracterización; la calibración lo revisa.
- [Un resumen de IA podría citar frases textuales y delatar a quien escribió] → En el prototipo el resumen es fijo y no copia ninguna frase; en la versión real es un requisito del cambio que integre el modelo.
- [Los e2e actuales esperan "1,0" y "De Martina"] → Se actualizan en las tareas.

## Open Questions

- **Semillas de pactos puntuales (D20):** el ajuste las alcanza, pero ¿cuánto pesa? Opciones: (1) la misma fórmula con una fuerza menor para puntuales (por ejemplo, tope 0,1); (2) sin notas de pares: solo la confirmación de quien recibe la tarea, que da 1,0 o retiene la constancia; (3) ajuste solo si la tarea tuvo 3 personas o más en el equipo, y si no, 1,0. Decide Gus.
- ¿El ajuste cambia el saldo del panel de Semillas en este prototipo? Hoy queda solo en el bloque de ejemplo.
- ¿Quién fija la fuerza al abrir la ronda (admin, consulta del Fogón o consenso) y qué fuerza usa una comunidad nueva? Hoy, 0,2.
- ¿Gus acepta ADR-018 junto con ADR-012?
