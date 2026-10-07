# Noche 2026-10-07 — pasaporte-caminos
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/28 · **Preview:** https://lighthouse-platform-beqyu7dsp-net-xg-en.vercel.app

## En una línea
Ya existe la página /pasaporte: la persona carga sus datos (simulado, se guarda en su navegador) y ve cinco caminos con su estado en texto. Todo pasa, con una cosa chica sin corregir y cuatro decisiones tuyas.

## Qué decidir a la mañana
1. **Spec: tres estados o cuatro.** La spec dice que cada camino es "Abierto", "Por ahora, no" o "Con condiciones", pero también pide "Completá tus datos". El código usa ese cuarto estado (y también en Sumarte cuando falta el tipo de inversor). Acción sugerida: actualizar la spec a cuatro estados antes del archive.
2. **Texto para residente argentino calificado.** La spec no lo define. Hoy dice "Abierto, por invitación." sin mostrar cupo. Acción sugerida: elegir el texto definitivo.
3. **Regla fiscal.** Se simplificó como en el mock-up: cualquier residente fiscal en el exterior queda en "Por ahora, no" para Sumarte. Ya figura como riesgo en design.md. Acción sugerida: validarla con legal antes de mostrarla fuera del equipo.
4. **/sumarte no respeta la elegibilidad.** "Pedir invitación" sigue igual, sin mirar lo que calcula el Pasaporte. Estaba declarado fuera de alcance. Acción sugerida: abrir un cambio aparte si querés que lo respete.
5. **Horas fuera de rango.** Si alguien escribe más de 744 horas por mes, se muestra un mensaje y el texto escrito se guarda aparte para repetir el mensaje al recargar (decisión del implementador). Acción sugerida: dejarlo así, o pedir que el campo vuelva vacío (cambio chico).

## Pendiente sin corregir
- **Borrado incompleto (severidad baja).** La clave nueva `lh-pasaporte:horas-texto` no está en CLAVES (`lib/demo/claves.ts`), así que "Borrar todo lo de este navegador" del panel no la quita. Se nota así: en /pasaporte elegir Obra presencial, escribir 800, borrar todo desde /panel y volver: el 800 y el mensaje reaparecen. Arreglo: agregar la clave a CLAVES y usarla desde ahí. Se agotaron las dos vueltas de corrección, por eso quedó.
- **Dos tests ajenos fallan contra el preview** (ver Tester): no son de este PR.
- **Sin verificar:** ningún test comprueba que membresía y tribus digan "Abierto" cuando corresponde.

## Qué quedó hecho (tareas 7/7)
- Datos y catálogo: formulario "Tus datos" guardado en el navegador y términos legales nuevos (`pasaporte`, `chacra`, `calificado`) textuales del mock-up.
- Cinco caminos con estado en texto; "Completá tus datos" cuando falta un dato (nunca se trata el dato faltante como cero).
- Lugares para no calificados desde EMISION (15, quedan 4).
- "Pasaporte" en el rail, entre Perfil y Compromisos.
- Tests unitarios (311), e2e de /pasaporte (7) y accesibilidad con la página vacía y con datos.
- `pnpm verificar` y `pnpm build` en verde.
- Del mock-up quedaron afuera "Identidad: documento verificado" y "Presencia".

## Revisor: veredicto y hallazgos
Tres rondas, veredicto final: con observaciones, nada bloquea. Los 8 requirements de la spec están cubiertos, sin hallazgos altos ni medios abiertos.
- Ronda 1: un hallazgo medio (Sumarte con residencia Argentina y sin tipo de inversor decía "Abierto, por invitación.") y cuatro bajos (faltaban dos ⚖, el campo de horas se vaciaba sin mensaje, el país anterior seguía guardado, código sin uso). Corregidos.
- Ronda 2: uno alto (el e2e de teclado del ⚖ de tierra ribereña fallaba porque ahora hay dos botones ⚖ en Sumarte) y bajos (falta de `aria-invalid`, horas fuera de rango se perdían al recargar, faltaban e2e). Corregidos.
- Ronda 3: queda solo el hallazgo bajo de la clave sin registrar (arriba).

## Tester: resultado
Pasa, sin bloqueos. Playwright contra el preview: 189 pasaron, 2 fallaron, 1 inestable.
- Los 7 de /pasaporte, accesibilidad (incluida /pasaporte con datos) y marco pasan.
- Fallan `e2e/fogon.spec.ts:33` y `e2e/pactos.spec.ts:49`; inestable `e2e/sumarte.spec.ts:43`. Esperan cero pedidos de red y el preview de Vercel hace un `POST https://vercel.live/login/validate` (la barra de Vercel). El PR no toca esas áreas.
- Guion manual, pasos 1 a 7, cubiertos por e2e: formulario vacío, perfil exterior y remoto, ⚖ con teclado, cambio a Argentina en vivo, chacra abierta con 60 h/mes y quedan 4, datos que sobreviven al recargar, rail con Pasaporte.

## Para la próxima noche
- Agregar `lh-pasaporte:horas-texto` a CLAVES (arreglo chico).
- Actualizar la spec a cuatro estados antes de archivar el cambio.
- Arreglar los tests de Fogón, Pactos y Sumarte para que ignoren `vercel.live` cuando corren contra un preview.
- Agregar un test que compruebe "Abierto" en membresía y tribus.
- Según tu decisión: texto del calificado argentino, revisión legal de la regla fiscal y cambio aparte para que /sumarte respete la elegibilidad.
