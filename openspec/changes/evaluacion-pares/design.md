# Design

## Context

`/semillas` ya tiene la ronda de reconocimiento (`semillas-libro`, `semillas-v2`): la persona puntúa a dos compañeros de ejemplo (Martina y Joaquín) de 1 a 5 en `rol` y `cultura`, con motivo obligatorio, y la ronda se guarda en el navegador (`CLAVES.semillasRonda`, `lib/semillas/estado.ts`). El factor es la constante `FACTOR_EVALUACION = 1` y "Cómo te reconocieron" muestra quién puntuó (`RECONOCIMIENTO_RECIBIDO` con `de`).

Gus decidió el 23-oct-2026 (ADR-012, en Propuesta; `NS_Tokenomics` 07 J-2 y 29 K11; Backlog D13 y D15) que las Semillas sean constancias con forma de EAS en dos pasos y adoptó ocho defensas contra la colusión. Este cambio las lleva a una función pura y a la pantalla, sin base.

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
- `parametros.ts`: `PARAMETROS_DE_PARTIDA = { agregado: "mediana", umbralReciprocidad: 1.5, topePorEvaluador: 1, minimoEvaluadores: 3, pesoRol: 0.5, fuerza: 0.2 }` y `FUERZAS = [0, 0.05, 0.1, 0.15, 0.2]`. Comentario: "valores de partida, se calibran con simulación (NS_Tokenomics 29 K11)".
- `calculo.ts`: `calcularFactorEvaluacion(equipo: string[], evaluaciones: Evaluacion[], persona: string, parametros?: Partial<Parametros>): Resultado` y helpers puros (`mediana`, `mediaRecortada`, `redondearFactor`).
- `guia.ts`: guía por dimensión y nivel, es/en.
- `constancias.ts`: `constanciasDeRonda(...)`.
- `ejemplo.ts`: equipo y evaluaciones de ejemplo.
- `evaluacion.test.ts`.

### 2. Orden del cálculo (para una persona P y cada dimensión)
1. **Validar** cada evaluación sobre P: `de === a` → `autoevaluacion`; `de` o `a` fuera de `equipo` → `fuera-del-equipo`; nota no entera o fuera de 1–5 → `nota-invalida`; `motivo.trim() === ""` → `sin-motivo`. Si un mismo evaluador tiene dos notas para P en la misma dimensión, cuenta la última del arreglo.
2. **Reciprocidad**: para cada nota válida de E sobre P, si existe alguna evaluación válida de P sobre E en la ronda (cualquier dimensión) y `|nota − mediana(notas válidas de los demás sobre P en esa dimensión)| ≥ umbralReciprocidad` → `reciprocidad`. Si los demás son menos de 2, no se aplica (no hay contra qué comparar; el mínimo de evaluadores ya lo neutraliza).
3. **Mínimo**: si quedan menos de `minimoEvaluadores` notas, la dimensión vale 3 y se marca `suficiente: false`.
4. **Tope por evaluador**: cada nota se acota a `[m − tope, m + tope]`, con `m` = mediana de las otras notas que quedaron (calculado sobre las notas originales, no sobre las ya acotadas, para que no dependa del orden).
5. **Agregado**: mediana, o media recortada con `r = max(1, floor(n × 0,2))` por lado.
6. **Combinar**: `nota = pesoRol × rol + (1 − pesoRol) × cultura`; `fuerza` acotada a [0; 0,2]; `f = 1 + fuerza × (nota − 3) / 2`; acotar a [0,8; 1,2]; redondear.

**Redondeo**: `Math.round(Number((f * 100).toFixed(6))) / 100` (evita que 1,025 dé 1,02). Hay un test con 1,025.

**Propiedad del tope** (test): como la mediana y la media recortada mueven su resultado como mucho lo que se mueve una nota, acotar cada nota a ± tope garantiza que reemplazar la nota de un evaluador por la mediana de los demás cambia el agregado como mucho en `tope`. Se prueba con varios conjuntos fijos (sin generadores aleatorios, para que el test sea determinista).

**Alternativas descartadas:** medir la influencia "sacando" al evaluador (leave-one-out) cambia el número de evaluadores y puede cruzar el mínimo de 3, así que no da una cota limpia; ponderar la nota recíproca con 0,5 en vez de descartarla complica la mediana. Ambas quedan para la calibración.

### 3. `Resultado` sin nombres
`{ factor: number; fuerza: number; rango: [number, number]; dimensiones: Record<Dimension, { nota: number | null; evaluadores: number; suficiente: boolean }>; descartes: Record<MotivoDescarte, number>; motivos: string[] }`. `nota` es `null` ("sin dato") cuando no hubo ninguna nota válida; si hubo alguna pero no alcanzó el mínimo, se muestra la regla ("menos de 3 evaluaciones"), no la nota. `motivos` va vacío si alguna dimensión tiene menos del mínimo; si no, son los motivos de las notas que contaron, ordenados alfabéticamente. Test: `JSON.stringify(resultado)` no contiene ningún id de evaluador.

### 4. Datos de ejemplo (`ejemplo.ts`)
Equipo de la ronda (mismo círculo, período `2026-10`): `vos`, `martina`, `joaquin`, `lucia`, `tomas`. Evaluaciones de ejemplo **sobre `vos`** (con motivo es/en, sin autor visible):

| de | rol | cultura |
|---|---|---|
| lucia | 3 | 4 |
| tomas | 3 | 4 |
| martina | 4 | 4 |
| joaquin | 5 | 5 |
| bruno (fuera del equipo) | 5 | 5 |

Al enviar, la pantalla agrega las notas que la persona dio a Martina (`martina`) y Joaquín (`joaquin`) como evaluaciones de `vos`. Resultado esperado con fuerza 0,2: Bruno descartado (2 notas "fuera del equipo"); Joaquín en `rol` descartado por reciprocidad (5 vs. mediana 3 de Lucía, Tomás y Martina); `rol` = mediana(3, 3, 4) = 3; `cultura` = mediana(4, 4, 4, 5) = 4; nota combinada 3,5; `f_eval` = 1,05. Con fuerza 0,1: 1,03. Estos números son los de los escenarios de la spec y de los tests.

Martina y Joaquín conservan sus nombres en el formulario de puntuar (la persona sabe a quién evalúa); lo que deja de tener nombres es lo **recibido**.

### 5. Constancias (`constancias.ts`, forma de ADR-012)
```
type Constancia = { uid: string; schema: "semillas-base" | "semillas-ajuste"; afirma: "netx"; sobre: string;
  apunta_a: string | null; datos: Record<string, string | number>; creada_en: string; revocada_en: null; vence_en: null };
```
- Base: `uid = ejemplo-base-<comunidad>-<periodo>`, `datos = { pacto, horas, valor_hora_usd: HOUR_REF_USD, periodo, version_pacto: "v1-ejemplo", semillas: Math.round(horas × HOUR_REF_USD) }` (una ronda = un mes; 10 h → 50).
- Ajuste: `uid = ejemplo-ajuste-<comunidad>-<periodo>`, `apunta_a = uid de la base`, `datos = { f_eval, semillas: Math.round(base × f_eval) }` (50 × 1,05 → 53).
- `creada_en` fija (`2026-10-31T00:00:00Z`) para que sea determinista. `afirma` siempre `"netx"` (ADR-012: nunca la billetera de una persona).
- Sin pacto aceptado: la función no se llama y la pantalla muestra "sin dato".

### 6. Pantalla
- La fuerza vive en el estado del componente (no se guarda). El resultado y las constancias se calculan en render a partir de la ronda guardada (`enviada`) y la fuerza.
- La guía del nivel se asocia con `aria-describedby` al grupo de botones; "Ver la guía de los 5 niveles" es un `<details>` (usable con teclado).
- Nada se comunica solo con color: los descartes son texto; el rango del factor se escribe ("0,80–1,20").
- Los números con `formatearNumero`/`LOCALES` (coma en español, punto en inglés).

### 7. Textos y ⚖
- Textos en `lib/idioma/textos/semillas.ts` (es/en). Se reemplazan `factorFijo` y `pie`.
- `lib/legal/terminos.ts`: `evaluacionPares` ("Evaluación entre pares": quién evalúa, que es privada y agregada, que las Semillas no son plata ni se transfieren y que los parámetros son de prueba) y `constanciaSemillas` ("Constancia de Semillas": registro que no se edita, se revoca y se vuelve a emitir; hoy vive en el navegador como ejemplo; nunca datos personales en una cadena). Ambos `borrador: true` y con `en`.

## Risks / Trade-offs

- [Equipos chicos: con 3–4 personas el descuento recíproco puede dejar casi todo en 1,0] → Es lo buscado en un prototipo; la calibración (K11) lo revisa.
- [El descuento recíproco puede castigar una nota honesta alta] → El umbral 1,5 deja pasar diferencias de 1 estrella; queda como pregunta para Gus.
- [Motivos sin autor pueden igual delatar a quien escribió en equipos chicos] → Solo se muestran con 3 evaluadores o más; la decisión final de mostrarlos queda abierta.
- [Los e2e actuales esperan "1,0" y "De Martina"] → Se actualizan en las tareas.

## Open Questions

Ver la sección de preguntas del resumen del especificador (peso entre dimensiones, umbral, mostrar motivos, aplicar el ajuste al saldo).
