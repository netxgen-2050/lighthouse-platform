# Design

## Context

- `lib/fogon/datos.ts` define `Ambito = "tribu" | "asamblea" | "fideicomiso"`, cinco `DECISIONES` (dos de `asamblea`, con requisito `residente`) y `AMBITOS` con "Asamblea de residentes".
- `app/fogon/fogon-cliente.tsx` lee la residencia fiscal del Pasaporte para el motivo "Solo residentes" y muestra un párrafo de residencia al pie.
- El botón de reportes ya es global: `components/boton-reportar.tsx` se monta en `app/layout.tsx` (specs `reportes` y `reportar-circulo`: "una persona abre cualquier página → ve el círculo"). No hay que moverlo ni duplicarlo.
- `/fogon` no tiene eventos hoy; los eventos con página propia son los de `/congreso`.

## Goals / Non-Goals

**Goals:**
- Quitar la asamblea de residentes de la vista y de los datos visibles, sin romper los votos simulados ya guardados en el navegador.
- Dejar las dos decisiones de la asamblea disponibles como ejemplos para `fogon-gobernanza-fractal`.
- Blindar con una prueba que el reporte siga en todas las páginas.

**Non-Goals:**
- Tocar `lib/permisos/` (el requisito `residente` sigue existiendo para el resto de la plataforma).
- Crear `/eventos`.

## Decisions

1. **Las decisiones de la asamblea se mueven, no se borran.** Pasan de `DECISIONES` a un export `EJEMPLOS_COMUN` en `lib/fogon/datos.ts` (sin ámbito `asamblea`; su ámbito lo define `fogon-gobernanza-fractal`). Alternativa descartada: borrarlas y reescribirlas después (se pierde el texto del mock-up y su ⚖).
2. **El tipo `Ambito` pierde `asamblea`.** El estado guardado en el navegador puede tener votos de `bomba` o `animales`: `leer` ignora ids de decisiones que no existen (si hoy no lo hace, se agrega con un test). Así nadie ve un error al abrir el Fogón con datos viejos.
3. **El párrafo y el motivo de residencia salen del Fogón**, pero `leerPasaporteDelNavegador` sigue en uso donde corresponda; si `/fogon` deja de necesitarlo, se quita el import (lint en verde).
4. **Prueba de reportes:** `e2e/reportar-en-todas.spec.ts` recorre los destinos con `existe: true` de `lib/navegacion.ts` más `/fogon/consultas` y verifica el botón por su nombre accesible. Alternativa descartada: un test unitario del layout (no detecta una página que monte su propio layout sin el botón).

## Risks / Trade-offs

- [Alguien buscaba el ejemplo de la bomba solar en una demo] → vuelve con `fogon-gobernanza-fractal` en el ámbito del común; mientras tanto el Fogón muestra tres decisiones.
- [La prueba recorre muchas páginas y tarda] → una sola prueba con un bucle, sin capturas; si pasa de 60 s se parte por grupos del rail.

## Open Questions

- ¿Una página `/eventos` propia (encuentros de tribu, jornadas de obra) o todo bajo `/congreso` hasta febrero? No cambia este cambio: acá solo se fija que el Fogón no los muestra.
