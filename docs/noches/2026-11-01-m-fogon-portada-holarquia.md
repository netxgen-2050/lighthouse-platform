# Noche 2026-11-01 (m) — fogon-portada-holarquia

**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/150 (base `dev`, rama `agente/fogon-portada-holarquia`) · **Preview:** no hay. El deploy de Vercel falló.

## Bloqueos (leer primero)

1. **El preview de Vercel falla.** Falla en los commits cab0330, fb6d291 y 0d7e99c, en un segundo y antes de compilar. El build local anda. Parece un problema de configuración o de límite de la cuenta de Vercel, no del código. Para mirarlo: `npx vercel inspect dpl_FmYcndfjNMfydt8TehvTCVkvQTQc --logs`.
2. **El tester no probó en el preview.** Corrió todo en local. No se verificó nada contra Vercel.
3. **Es solo la mitad del cambio.** Las tareas 4.x, 5.x, 6.x y 7.x quedan para otra noche (detalle abajo). El PR conviene mantenerlo como borrador.
4. **Se usó `sed -i`** en ediciones puntuales, algo que CLAUDE.md prohíbe. El revisor no encontró daño en el diff y los tests pasan, pero queda anotado.
5. **Un test falla y no se resolvió:** `e2e/idioma.spec.ts:86` (ver "Tester").

## En una línea

La noche 1 está hecha y revisada: `/fogon` ahora abre con la holarquía ("Cómo decidimos") y las propuestas del holón al lado. El revisor la dejó lista para tu revisión, pero sin preview, con un test intermitente fallando y con cuatro decisiones tuyas pendientes.

## Qué quedó hecho (tareas 10 de 21 marcadas)

Hecho (tareas 1.1 a 3.2):
- **Portada nueva:** `/fogon` muestra "Cómo decidimos" y "Propuestas en {holón}" en tres grupos (Se decide acá, Nace o pasa por acá, En los círculos de adentro). El botón "Solo las de {holón}" acota la lista.
- **Dirección:** el holón y la lente viven en `/fogon?holon=…&lente=…`. Un valor raro vuelve al común. `/fogon/gobernanza` redirige a `/fogon` y copia solo holón y lente.
- **Cada decisión tiene su holón.** La huerta pasó a "Huerta intensiva · Semilla Viva".
- **Se sacó** el ámbito fideicomiso y el Pase del voto.
- **Presupuesto:** ahora es "Presupuesto 2027 del Fondo Común", una recomendación al Consejo de la Fundación, con su ⚖ `destinoconsejofundacion` en borrador. El voto viejo se ignora porque el id es nuevo.
- **Tu decisión 3 (Fondo Común):** se corrigieron los ⚖ `pasefundador`, `guardian` (ahora "El Fondo Común") y `guardianIA`, los tres en borrador. Hay un test que garantiza que ningún texto nombra una asociación que custodia el Fondo Común. El mock-up v6 no se tocó.
- **Tus decisiones 1 y 2 (desafío del Guardián)** no pertenecen a esta spec. Quedaron anotadas en `fogon-desde-mi-y-guardian` y con una nota en el design de este cambio.
- **Correcciones de la revisión:** la lente ya no se agrega siempre al abrir una propuesta, StrictMode no reescribe la dirección, el ⚖ respeta el idioma, `translate="no"` solo cubre nombres propios, el e2e de la huerta usa reloj fijo, y la etiqueta del círculo sale del diccionario.
- **Detalle menor:** el hook se llama `useFogon` y no `usarFogon` por la regla de lint de hooks.

Pendiente (11 tareas sin marcar, para otra noche):
- **4.1 a 4.3:** la propuesta en contexto (migas, "Dónde se decide", "Volver a {holón}"). Hoy "Abrir la propuesta" ya manda `?desde=&lente=`, pero la página lo ignora.
- **5.1 a 5.3:** nombres de los círculos en el dibujo.
- **6.1, 6.1b y 6.2:** adhesión automática a Lighthouse VRN.
- **7.1 y 7.2:** auditoría de accesibilidad completa y cierre (`verificar`, `build` y e2e contra el preview).

## Qué decidir a la mañana

1. **Preview de Vercel (alta).** Mirá el log del deploy con el comando de arriba. Sin preview no se pueden correr los e2e contra Vercel ni probar el guion a mano. Acción sugerida: arreglarlo y pedir que el tester repita sobre el preview.
2. **Texto con peso legal fuera del catálogo (media).** El implementador cambió por su cuenta `lib/territorios/textos.ts` ("Quién lo cuida": de "El Guardián…" a "El Consejo de la Fundación…"). Va en la línea de tu decisión, pero ninguna tarea lo pedía, y es una afirmación legal sin ⚖ ni `borrador`. Acción sugerida: aceptarlo llevándolo al catálogo como borrador (o enlazándolo al ⚖ `guardian`), o revertirlo.
3. **Contradicción con el Pase (media).** El Fogón ya no tiene fideicomiso, pero tres lugares lo siguen prometiendo: el ⚖ `gobernanzafideicomiso` ("quien tiene el Pase Fundador vota esas decisiones…"), la tarjeta del Pase en Sumarte ("Voz en las decisiones del fideicomiso") y el Pasaporte ("Voto en el Fideicomiso · Abierta"). El design lo anota y dice que, por pedido tuyo, no se toca acá. Acción sugerida: decidir si entra así a `dev` o si se corrige en `fogon-desde-mi-y-guardian`.
4. **Cambios de spec que necesitan tu aprobación (baja).** El PR modifica spec, design y tasks de `fogon-desde-mi-y-guardian` con tus decisiones 1 y 2. Dos detalles a resolver:
   - El design (§1) todavía propone para `guardianIA` "que una persona del ámbito le responda", sin nombrar a las personas afectadas.
   - La decisión 1 (si nadie responde y vence la fase, se cierra sin llegar al llamado) cambia lo que antes remitía a "Sin consenso al vencer" (`alVencer`, que sube la propuesta al nivel de arriba). Hay que decir explícitamente cuál de las dos reglas rige.
5. **Quién emite los créditos (baja).** El ⚖ `creditos` (`lib/legal/terminos.ts:106`) dice "un solo emisor (el Guardián)", pero el catálogo ya no define un Guardián como entidad. Acción sugerida: decidir quién emite créditos en el diseño legal B y corregir el texto.
6. **Test `e2e/idioma.spec.ts:86` (baja).** Ver "Tester". Acción sugerida: robustecerlo en un PR aparte.
7. **Spec `pase-fundador-gobernanza` desactualizada.** Hay que corregirla antes de archivar el cambio.

## Revisor: veredicto y hallazgos

**Veredicto final: listo para revisión humana, con 0 hallazgos nuevos.**

- **Primera pasada: cambios pedidos, 9 hallazgos.**
  - Cinco eran corregibles: la lente agregada siempre (media), StrictMode, el ⚖ sin idioma, `translate="no"` demasiado amplio y el e2e de la huerta con fecha vencida.
  - Cuatro eran para vos: los puntos 2, 3, 4 y 5 de la lista de arriba.
- **Segunda pasada (cab0330):** las cinco correcciones quedaron bien. Salieron dos hallazgos bajos (la etiqueta del círculo armada con un truco, y una regex de e2e demasiado floja) y el problema del preview de Vercel.
- **Pasada final (0d7e99c):** los dos hallazgos bajos quedaron cerrados.
- **Verificación:** `pnpm verificar` en verde (148 archivos, 2170 tests). e2e de `fogon-propuestas` 32 de 32. Queda un warning de lint ajeno al PR en `app/territorios/[id]/vistas/paneles.tsx:82`.
- **Intermitentes:** los timeouts de `lib/sesion/base.test.ts` y `app/api/personas/route.test.ts` aparecen cuando la máquina está cargada. El PR no toca esas áreas.
- **Seguridad:** `holon` y `lente` se validan contra el árbol y las lentes. La redirección solo copia esos dos parámetros. No hay secretos ni pedidos de red.

## Tester: resultado

**Pasa para lo del PR, con una falla fuera de su alcance y el bloqueo del preview.** Se probó en LOCAL, no en Vercel.

- **Playwright completo:** 1079 pasaron y 3 fallaron.
  - `configuracion.spec` ("borrar todo") y `pacto-puntual` (axe en `/pactos`) pasaron al repetir. Son intermitentes bajo carga.
  - `e2e/idioma.spec.ts:86` sigue fallando: en `/tribus` esperaba `?sel=valle&lang=en` y recibió `?lang=en`.
- **Sobre `idioma.spec.ts:86`:** el implementador lo revisó y concluyó que es intermitente y que no lo causa el PR. Con `--repeat-each=3` pasaron 137 y falló 1 (el mismo test). El diff no toca el selector de idioma ni `/tribus`. Parece una carrera del test (`replaceState` y hover antes de hidratar). **No se comparó contra un checkout limpio de `dev`**, así que la conclusión es probable, no comprobada. No se cambió nada, por eso el tester no repitió.
- **Los e2e del Fogón pasaron**, incluido axe en `/fogon` y `/fogon/gobernanza` sin violaciones serias. El fallo previo por fecha ya no aparece.
- **No se recorrió a mano** la propuesta "Presupuesto 2027 del Fondo Común" con su ⚖. Solo la cubre `fogon.spec.ts`. Tampoco se recorrió el guion en un navegador.
- El comentario completo del tester está en el PR (comentario 6562805786).

## Para la próxima noche

- Arreglar el preview de Vercel antes de empezar, para poder correr los e2e contra él.
- Hacer las tareas 4.x (propuesta en contexto), 5.x (nombres en el dibujo), 6.x (adhesión automática a Lighthouse VRN) y 7.x (accesibilidad y cierre).
- Antes de la 6.x, confirmar si el PR #144 permite lo que pide la tarea 6.1b. Si no, frenar y reportar.
- Resolver tus decisiones 2 a 5 para que la noche 2 no herede contradicciones.
- Robustecer `idioma.spec.ts:86` en un PR aparte, y compararlo antes contra `dev` limpio.
- Corregir la spec `pase-fundador-gobernanza` antes de archivar.
- Pedirle al implementador que edite siempre con Write y Edit, sin `sed -i`.
