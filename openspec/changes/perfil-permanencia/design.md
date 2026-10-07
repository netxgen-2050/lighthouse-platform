# Design

## Context

`/perfil` tiene la entrevista (`app/perfil/entrevista.tsx`, estado puro en `lib/perfil/estado.ts`). `/panel` resume lo guardado con `resumirDemo` (`lib/demo/resumen.ts`), que recibe una función `leer` para poder testearse sin navegador, y borra todo recorriendo `CLAVES` (`lib/demo/borrar.ts`). La sección de inversores de `/sumarte` ya tiene `id="inversores"` (`app/sumarte/sumarte-cliente.tsx`). El mock-up v6 no dibuja el gradiente: los textos salen de la US-05 de la nota 15.

## Goals / Non-Goals

**Goals:**
- Un selector chico, accesible y persistente, sin tocar la lógica de la entrevista.
- Un atajo visible a inversores para quien solo quiere invertir.
- Que `/panel` refleje el nivel y adapte un único caso del próximo paso.

**Non-Goals:**
- Reordenar menú, portada u otras pantallas; combinar el nivel con la sugerencia de tribus; medirlo en la Vista NetX.

## Decisions

1. **`lib/perfil/permanencia.ts`** (puro): `NIVELES` como arreglo `readonly` de `{ id, nombre, explicacion }` con ids `invertir | visitar | temporada | mudarme` y estos textos:
   - `invertir` · "Solo invertir" · "Quiero aportar plata al proyecto, sin vivir ahí."
   - `visitar` · "Visitar" · "Quiero conocer el lugar y venir de vez en cuando."
   - `temporada` · "Vivir parte del año" · "Me imagino pasando temporadas en el Lighthouse."
   - `mudarme` · "Mudarme" · "Quiero vivir en el Lighthouse."
   Y `leerPermanencia(crudo: string | null): NivelId | null`, que devuelve `null` ante cualquier valor que no sea un id válido (nunca un nivel por defecto).
2. **Clave nueva** `permanencia: "lh-permanencia"` en `CLAVES`. Se guarda el id como texto plano. `borrarDemo` ya recorre `Object.values(CLAVES)`, así que "Borrar todo" la incluye sin código nuevo (el test de claves se actualiza con el valor nuevo).
3. **Componente** `app/perfil/permanencia.tsx` (`"use client"`): `<fieldset>` con `<legend>` "¿Cuánto te querés quedar?" y cuatro `<input type="radio" name="permanencia">` con `<label>` (nombre en negrita y explicación debajo). Radios nativos: flechas y Tab funcionan sin código extra y el lector anuncia el elegido. Lee después de hidratar, como `entrevista.tsx`. Se inserta en `app/perfil/page.tsx` antes de la entrevista, sin `<main>` propio. Debajo: "Podés cambiarlo cuando quieras."
4. **Recuadro de inversores:** solo con `invertir`. `bg-surface`, `border-line`, texto "¿Venís solo a invertir? Mirá **Para inversores**: sumarte al proyecto del Lote 7 por invitación o invertir en NetX. Si después querés encontrar tribu, la entrevista sigue acá abajo." con `<Link href="/sumarte#inversores">`. Sin cifras ni términos legales propios.
5. **Permiso para guardar (C16):** si `privacidad-consentimiento` ya está en `main`, el guardado usa su función de guardado con permiso (como las demás pantallas); si no, se guarda directo como hoy hacen perfil y compromisos, y se anota en el PR.
6. **`resumirDemo`** suma `permanencia: NivelId | null` al `ResumenDemo` y `"inversores"` al tipo `Paso`. Regla: si `permanencia === "invertir"` y (`!perfil` o `perfil.confirmados < perfil.total`) → `"inversores"`; si no, la regla actual sin cambios. La tarjeta y el texto del paso (`"Mirá cómo invertir"` → `/sumarte#inversores`) van en `app/panel/resumen.tsx`, con el mismo estilo de las otras tarjetas.
7. **Estilo:** solo tokens del tema; el radio elegido se distingue por el control nativo y por `font-semibold` en su nombre, no solo por color.

## Risks / Trade-offs

- [El nivel guardado sin consentimiento si `privacidad-consentimiento` no entró] → mismo comportamiento que las pantallas existentes; se corrige junto con ellas cuando entre.
- [Agregar un `Paso` nuevo puede romper un `switch` exhaustivo del panel] → el chequeo de tipos lo detecta en `pnpm verificar`.
- [Los textos de los niveles no los validó nadie] → no tienen peso legal; se ajustan con una línea en `NIVELES`.

## Open Questions

- ¿"Solo invertir" debería saltar la entrevista por completo (la US-05 dice "salta directo a P7 con la opción de volver")? Esta propuesta solo agrega el atajo y deja la entrevista; decide Gus.
