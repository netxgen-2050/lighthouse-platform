# Noche 2026-10-27-m — idioma-pendientes
**PR:** no hay (no se abrió) · **Preview:** no hay

## En una línea
La noche quedó bloqueada y no hay PR: el implementador frenó en la tarea 0.1 porque los dos cambios de los que depende (`idioma-fogon-mercado` e `idioma-pasaporte-semillas-pactos`) todavía no están implementados. No se escribió código.

## Qué quedó hecho (tareas 0/14)
Nada. La rama `agente/idioma-pendientes` existe solo en tu máquina, creada desde `origin/agente/sumarte-periodo-coherente`, sin commits del implementador y sin push. Este reporte es el único archivo que se agrega.

Por qué frenó (lo manda la propia tarea 0.1: "si no, frenar y reportar"):
- En `lib/idioma/textos/` solo existen los diccionarios de comunes, marco, portada, sumarte, territorio y tribus. No hay de Fogón ni de pactos.
- La rama `origin/integracion/idioma-2026-10-23` tampoco los tiene.
- Los dos cambios figuran todavía como abiertos en `openspec/changes/`.
- Los grupos 1 (consultas del Fogón) y 2 (cambios a un pacto) reutilizan esos diccionarios. Crearlos acá sería inventar una estructura que chocaría con esos cambios.

No se abrió un PR vacío: la rama no tiene diferencias con la base y GitHub no permite un PR así.

## Qué decidir a la mañana
1. **Orden de implementación (bloquea todo).** Acción sugerida: correr primero `idioma-fogon-mercado` e `idioma-pasaporte-semillas-pactos`, como indica la propuesta, y recién después relanzar `idioma-pendientes`.
2. **Alternativa parcial: hacer ahora solo el grupo 3** (regla de cobertura en `lib/idioma/rutas.test.ts` y regla "toda pantalla nueva nace bilingüe" en `docs/agentes.md`). No depende de los diccionarios, pero la tarea 3.1 pide que el test falle si una ruta no está traducida, así que quedaría en rojo hasta que se hagan los grupos 1 y 2. Acción sugerida: no hacerlo así; es mejor esperar y mantener `pnpm verificar` en verde.
3. **Rama local.** Acción sugerida: dejarla o borrarla; no tiene trabajo adentro.

## Revisor: veredicto y hallazgos
No corrió: no hay PR ni código que revisar.

## Tester: resultado
No corrió: no hay PR ni código que probar.

## Para la próxima noche
- Implementar y mergear a la base `idioma-fogon-mercado` e `idioma-pasaporte-semillas-pactos`.
- Relanzar `idioma-pendientes` desde una base que ya tenga `lib/idioma/textos/fogon*.ts` y el diccionario de pactos.
- Al retomar, verificar la tarea 0.2: si el rediseño holocrático del Fogón cambió `/fogon/consultas`, traducir la versión vigente y anotarlo.
