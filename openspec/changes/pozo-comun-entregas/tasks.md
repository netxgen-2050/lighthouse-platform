## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `login-privy` está en `main` (sesión con `tribuAdmin` y "Entrar como…" en modo de prueba). Si no, frenar y reportar. Verificar revisando `components/sesion/marca-admin.tsx` y `e2e/fixtura.ts` en `origin/main`. Si `sumarte-acceso` ya está en `main`, el admin es el Líder de tribu de esa tribu: usar lo que exponga la sesión para "administra esta tribu", sin duplicar la lógica.

## 1. Lógica

- [ ] 1.1 Crear `lib/pozo/` (`tipos.ts`, `validar.ts`, `estado.ts`): entrega `{ id, tribu, item, fecha, cantidad, nota? }`; validar ítem dentro de los comprometidos de la tribu, fecha no futura, cantidad 1–60 y nota hasta 140 (tras recortar espacios); registrar, quitar, listar por ítem (más reciente primero) y leer con JSON inválido como lista vacía. Clave nueva en `lib/demo/claves.ts` y en el borrado de `lib/demo/borrar.ts`. Tests en `lib/pozo/*.test.ts` con todos los casos de borde. Verificar con `pnpm test`.
- [ ] 1.2 Agregar el ⚖ `pozocomun` en `lib/legal/terminos.ts` con `borrador: true` y el comentario de texto nuevo. Verificar con `pnpm test lib/legal`.

## 2. Página

- [ ] 2.1 En `app/tribus/[id]/`, componente cliente para la sección del pozo: entregas por ítem, "Sin entregas registradas todavía", marca "Registrada por la tribu · sin verificar", ⚖ en el título, formulario y "Quitar" solo para quien administra la tribu, aviso de demostración, región `aria-live`. Solo tokens del tema y sin `<main>`. Verificar en `pnpm dev` con "Entrar como…" el admin de Valle Solar y una persona común, solo con teclado.

## 3. E2E

- [ ] 3.1 `e2e/pozo.spec.ts` con todos los escenarios de la spec (persona común sin formulario, registrar, errores de cantidad y fecha futura, quitar, otra tribu, recarga, sin pedidos de red con la cantidad, Borrar todo, solo teclado) y la ficha con el formulario visible en `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/pozo.spec.ts e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/pozo-comun-entregas` con guion de prueba (entrar como admin de Valle Solar → registrar dos entregas → entrar como persona común → ver "Sin entregas registradas todavía") y el texto borrador de `pozocomun` para Gabriel.
