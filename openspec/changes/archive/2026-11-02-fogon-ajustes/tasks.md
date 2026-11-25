# Tasks

## 1. Explicación del ⚖ de "consultivo", en los dos idiomas

- [x] 1.1 En `lib/legal/terminos.ts`, a la entrada `consultivo`: sumar `frase` con el texto actual sin cambios, reemplazar `texto` por la explicación de `design.md` §1 y sumar `en: { titulo, texto, frase }` con los textos de §1. Dejar `borrador: true` y el comentario de "Texto nuevo… borrador"; sumar el de "Traducción nueva: borrador…" sobre `en`. Si al implementar `consultivo` ya tiene `en` (porque entró `idioma-legal`), reemplazar su `texto` y sumarle `frase`. **Verifica:** `pnpm verificar` en verde (tipos incluidos).
- [x] 1.2 En `lib/legal/mostrar-termino.ts`, sumar `fraseConsultiva(idioma: IdiomaTermino = "es"): string` (§1). En `lib/legal/mostrar-termino.test.ts`, un test: en `"es"` da la frase aprobada exacta y en `"en"` la frase en inglés. **Verifica:** `pnpm verificar`.
- [x] 1.3 En `Acta` (`app/fogon/consultas/[id]/resultado-grupo.tsx`), pintar `fraseConsultiva(idioma)` en lugar de `terminoMostrado("consultivo", idioma).texto`, sin el `lang` del `<span>` (y sacar el import de `terminoMostrado` si queda sin uso). **Verifica:** el test "el acta lleva la frase consultiva del catálogo con el botón ⚖" de `resultado-grupo.test.tsx` sigue pasando; sumar en "Resultado y acta en inglés" que el acta en inglés contiene "The result is advisory: it does not replace the decisions reserved by the contract or the statute." y no contiene "El resultado es consultivo".
- [x] 1.4 En `lib/legal/terminos.test.ts`, en "consultivo es borrador": `frase` es exactamente la frase aprobada, `texto` es distinto de `frase` y contiene "no obliga", "contrato o el estatuto" y "no te cuesta plata"; `terminoEn("consultivo")` existe y su `texto` es distinto de `en.frase`. **Verifica:** `pnpm verificar`.
- [x] 1.5 En `e2e/fogon-consultas.spec.ts`, test (e): abrir el ⚖ del acta y comprobar que muestra la explicación ("orienta una decisión") y "Borrador: texto a revisar", y que el acta sigue con la frase completa. **Verifica:** `pnpm test:e2e e2e/fogon-consultas.spec.ts` en verde.
- [x] 1.6 En `e2e/idioma-pendientes.spec.ts`, test "al cerrar, el resultado, la dona y el acta salen en inglés…": cambiar a U1 o sumar un paso en U1 cerrada que compruebe la frase en inglés en el acta y que el ⚖ muestra "Draft: text under review"; borrar el comentario "La frase consultiva todavía no tiene inglés (idioma-legal)…"; `textosEnEspanol(page, "main")` sigue dando `[]`. **Verifica:** `pnpm test:e2e e2e/idioma-pendientes.spec.ts` en verde.

## 2. "sin dato" hasta empezar a repartir, "USD 0" después

- [x] 2.1 En `lib/fogon/consultas/reparto.ts`, `repartoEnPlata`, siguiendo `design.md` §2: con `montoCentavos` `null`, todas las opciones `null`; si ninguna opción tiene un voto distinto de 0, todas `null`; si no, cada `null` del motor pasa a `0`. Actualizar el comentario de la función con la regla ("sin votos, la votación no empezó"). No tocar `lib/cuadratico/` ni `consulta-cliente.tsx`. **Verifica:** `pnpm verificar`; `lib/cuadratico/motor.test.ts` sigue igual y en verde.
- [x] 2.2 En `lib/fogon/consultas/reparto.test.ts`, dentro de "mi reparto en plata (U4)":
  - renombrar "sin votos propios: sin dato" a "sin votos propios: la votación no empezó, sin dato" y sumarle un reparto con todo en 0 (`{ vivero: 0 }`), que también da `null` en todas;
  - nuevo "primer voto: USD 20.000 y el resto en 0": `{ vivero: 1 }` da `2_000_000` en `vivero` y `0` en las otras cuatro;
  - nuevo "solo votos en contra: ya empezó, todo en 0": con `{ ...u4, votosEnContra: true }` y `{ vivero: -1 }`, las cinco opciones dan `0`;
  - nuevo "sacar todos los votos vuelve a sin dato": `repartoEnPlata(u4, mover(u4, { vivero: 1 }, "vivero", -1))` da `null` en todas;
  - "monto sin cargar: sin dato, nunca 0": sumar el caso `{}` además del de 3 votos; las dos dan `null` en todas.
  **Verifica:** `pnpm verificar` en verde con los tests nuevos.
- [x] 2.3 En `e2e/fogon-consultas.spec.ts`, test (g): sin votos, "Vivero de nativas" y "Línea de base y monitoreo" muestran "Con tu reparto irían: sin dato" y la sección no contiene "USD 0"; después de los 3 + 1 votos, lo que ya comprueba; al final, quitar los votos hasta 0 y comprobar que "Vivero de nativas" vuelve a "Con tu reparto irían: sin dato". Renombrar a "(g) U4: monto sugerido y 'Con tu reparto irían': sin dato hasta empezar a repartir, USD 0 después". **Verifica:** `pnpm test:e2e e2e/fogon-consultas.spec.ts` en verde.

## 3. Cierre

- [x] 3.1 Donut: sin cambios de código ni de tests (ya están en `dev`); confirmar que `components/donut.test.tsx` sigue en verde. `pnpm verificar` y `pnpm build` en verde, y `pnpm test:e2e e2e/fogon-consultas.spec.ts e2e/idioma-pendientes.spec.ts e2e/accesibilidad.spec.ts` sin fallas. **Verifica:** los tres comandos terminan en verde.
