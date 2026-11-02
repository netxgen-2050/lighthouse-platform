# Tasks

**Antes de empezar:** confirmar que `eventos` ya está en `dev` con `ls app/eventos/page.tsx lib/eventos/quiero-ir.ts`. Si no están, frenar y reportar.
<!-- arquitecto: la tarea 2.2 necesita que /eventos guarde el origen; ajustes también en 7.1 y 7.2 -->
Confirmar también que `app/eventos/page.tsx` monta `GuardarOrigen` (`eventos`, decisión 9): la tarea 2.2 depende de eso. Si no lo monta, frenar y reportar.

## 1. Rail

- [ ] 1.1 Sumar `eventos` a `lib/idioma/glosario.ts` y al diccionario `marco` (es/en). En `DESTINOS`, agregar `/eventos` antes de Congreso y marcar Congreso con `oculto: true`; ampliar el comentario de `oculto` con la decisión del 2-nov-2026 y la nota. Verificar con `pnpm typecheck`.
- [ ] 1.2 En `lib/navegacion.test.ts`: orden de `DESTINOS`; Participar `["Pactos", "Semillas", "Fogón", "Eventos"]` y en inglés con "Events"; test "Congreso existe pero no aparece en ningún grupo". El test `esActivo("/congreso", "/congreso/en")` queda igual. Verificar con `pnpm test -- lib/navegacion.test.ts`, incluido el test de `existe` contra `app/`.
- [ ] 1.3 Ajustar `e2e/marco.spec.ts` (orden, textos y la lista de rutas de la línea 158), `e2e/descubrir-publico.spec.ts:94-98` y `e2e/sumarte-acceso.spec.ts`: Congreso pasa a Eventos, más una aserción de que no hay enlace "Congreso". Verificar con `pnpm test:e2e e2e/marco.spec.ts e2e/descubrir-publico.spec.ts e2e/sumarte-acceso.spec.ts`.

## 2. Redirección

- [ ] 2.1 Agregar `redirects()` a `next.config.ts` (`design.md`, decisión 1). Verificar con `pnpm build` y el e2e de la tarea 2.2.
- [ ] 2.2 Crear `e2e/eventos-reemplazo.spec.ts`, que cubra: `/congreso` y `/congreso/en` responden 307 a `/eventos` (con `request.get(..., { maxRedirects: 0 })`); `/congreso?utm_source=x` llega con la query y guarda el origen; `/congreso#ticket` llega con el ancla; `/congreso/en` sin cookie deja inglés y una dirección sin `lang`; con cookie `es` sigue en español; `/congreso/en?lang=es` termina en `/eventos`; `/congreso/otra` no redirige. Verificar con `pnpm test:e2e e2e/eventos-reemplazo.spec.ts`.
- [ ] 2.3 Si `next.config.ts` usa el nombre literal de la cookie, agregar un test unitario que lo compare con `COOKIE_IDIOMA`. Verificar con `pnpm test -- lib/idioma`.

## 3. Portada y origen

- [ ] 3.1 Hacer los cambios de la decisión 3 en `lib/origen/origen.ts`, `lib/portada.ts` y `lib/idioma/textos/portada.ts`. Actualizar `lib/portada.test.ts` y `lib/origen/origen.test.ts`, con los casos nuevos: `?camino=congreso` y un `lh-origen` guardado con `camino: "congreso"` se leen como `eventos`. Verificar con `pnpm test -- lib/portada lib/origen`.
- [ ] 3.2 Ajustar `e2e/portada.spec.ts` e `e2e/idioma-portada-sumarte.spec.ts`: título "Eventos"/"Events", `href` y `/?camino=congreso` marca Eventos. La línea 122 de `portada.spec.ts` ahora espera `camino: "eventos"`. Verificar con `pnpm test:e2e e2e/portada.spec.ts e2e/idioma-portada-sumarte.spec.ts`.

## 4. Mi recorrido

- [ ] 4.1 Hacer los cambios de la decisión 4 en `lib/panel/proximo-paso.ts` y `lib/idioma/textos/recorrido.ts`, y sus consumidores (buscarlos con `grep -rn "tieneTicket" app lib components`). Tests en `lib/panel/panel.test.ts`: sin nada aparece el paso; con `Quiero ir` no; con un ticket válido no; con `"1234"` sí. Verificar con `pnpm test -- lib/panel`.
- [ ] 4.2 Ajustar `e2e/panel.spec.ts` (líneas 44-46 y 66-69), con un caso que siembre `lh-eventos-quiero-ir`. Verificar con `pnpm test:e2e e2e/panel.spec.ts`.
- [ ] 4.3 En `lib/actividad/eventos.ts`, cambiar el `enlace` de `registrasteTicket` a `/eventos`. El test de `lib/actividad/actividad.test.ts:192` usa `/congreso` como ruta interna genérica y queda como está. Verificar con `pnpm test -- lib/actividad`.

## 5. Pasaporte, Semillas y Sumarte

- [ ] 5.1 Hacer los cambios de la decisión 5 en `lib/pasaporte/sellos.ts` y `lib/idioma/textos/pasaporte.ts` (es/en), y cambiar el texto de la puerta `registrar-ticket` a "Anotarte a eventos"/"Sign up for events", sin tocar `lib/permisos/`. Actualizar los tests de sellos y `lib/canales/puertas.test.ts:60`. Verificar con `pnpm test -- lib/pasaporte lib/canales lib/permisos` y con `git diff --stat lib/permisos`, que debe salir vacío.
- [ ] 5.2 En `app/semillas/semillas-cliente.tsx` y `lib/idioma/textos/semillas.ts`: sin ticket, el texto pasa a "La presencia la confirma quien organiza cada evento. Mirá los" + enlace `/eventos` con `G.eventos` (más su inglés). Los textos de quien ya tiene ticket quedan igual. Ajustar `e2e/semillas.spec.ts:97`. Verificar con `pnpm test:e2e e2e/semillas.spec.ts`.
- [ ] 5.3 En `lib/idioma/textos/sumarte.ts` (es/en) y `lib/sumarte/datos.ts`: quitar el registro del ticket de Explorador, sin repetir "Eventos abiertos", y cambiar "Hifa, Congreso y tu espacio personal" por "Hifa, Eventos y tu espacio personal". No tocar `cohorte`, `registroGenesis` ni `avisos.rutas.congreso`. Verificar con `pnpm test -- lib/sumarte lib/idioma` y `pnpm test:e2e e2e/idioma-portada-sumarte.spec.ts e2e/sumarte-acceso.spec.ts`.

## 6. e2e de la vitrina en pausa

- [ ] 6.1 Dejar `e2e/congreso.spec.ts` y `e2e/congreso-en.spec.ts` con `test.describe.skip` y el comentario de la decisión 7, sin borrar ningún test. Verificar con `pnpm test:e2e e2e/congreso.spec.ts e2e/congreso-en.spec.ts`, que debe informarlos como saltados.
- [ ] 6.2 Hacer lo mismo con: `e2e/accesibilidad.spec.ts` (sacar las dos rutas de la lista, con un comentario, y saltar los bloques de las líneas 284, 294, 382 y 392); `e2e/idioma.spec.ts` (la línea 104, el bloque de la 125 y la lista de la 200); `e2e/descubrir-publico.spec.ts:145-175`; `e2e/bandeja.spec.ts:134`; y `e2e/configuracion.spec.ts:229` (`/eventos` en lugar de las dos rutas). Verificar con `pnpm test:e2e` sobre esos cuatro archivos.
- [ ] 6.3 Ajustar `e2e/semillas.spec.ts:132` y `e2e/panel.spec.ts:86-94` si dependen de la página; los que siembran `lh-congreso-ticket` directamente siguen valiendo. Verificar con `pnpm test:e2e e2e/semillas.spec.ts e2e/panel.spec.ts`.

## 7. Documentación

- [ ] 7.1 Crear `docs/notas/congreso-en-pausa.md` (decisión 8), en palabras simples y con ruta o referencia en cada afirmación. Incluir `app/congreso/netx/ir-al-ancla.tsx` entre lo que no se puede borrar, y como pendientes el botón para quitar el ticket y ADR-028. Verificar con `ls` de cada ruta citada.
- [ ] 7.2 Agregar una "Nota 2-nov-2026" a ADR-002 (cierra su pendiente: se reutiliza como Eventos; la vitrina queda en pausa) y a ADR-003 (las direcciones redirigen con un 307 porque es una pausa; se conserva la regla por si se vuelve; si la vitrina se retira para siempre, `/congreso/en` pasa a redirección permanente). Verificar con `git diff docs/decisiones`.
- [ ] 7.3 Verificar los comentarios: `grep -rn "congreso-en-pausa" lib e2e next.config.ts` debe devolver `lib/navegacion.ts`, los e2e saltados y `next.config.ts`.

## 8. Integración

- [ ] 8.1 Confirmar que no se tocó la vitrina: `git diff --stat` no incluye `app/congreso/`, `lib/congreso/`, `lib/permisos/`, `lib/idioma/middleware.ts`, `lib/idioma/rutas.ts`, `lib/privacidad/` ni `lib/legal/terminos.ts`.
- [ ] 8.2 Confirmar que no quedan enlaces: `grep -rn "\"/congreso" app components lib` solo devuelve `app/congreso/`, `lib/congreso/`, `lib/navegacion.ts`, `lib/permisos/`, `lib/idioma/`, `lib/sesion/` y los tests. Cada excepción se justifica en el PR.
- [ ] 8.3 `pnpm verificar` y `pnpm build` en verde.
- [ ] 8.4 `pnpm test:e2e` completo en verde, con el número de tests saltados informado en el PR.
