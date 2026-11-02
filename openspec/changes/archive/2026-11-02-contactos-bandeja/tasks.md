## 0. Prerrequisitos

- [x] 0.1 Confirmar que `territorio-macrolote`, `sumarte-planes` y `estado-administrativo` están en `main` (ficha de finca con "Consultar por este lote", `app/sumarte/sumarte-cliente.tsx`, `components/estado-administrativo.tsx` y `borrador` en `lib/legal/terminos.ts`). Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls components lib/legal`.

## 1. Modelo

- [x] 1.1 Crear `lib/contactos/tipos.ts` y `lib/contactos/pedidos.ts` (tabla de etiquetas y destinos por motivo, `validar`, `crearPedido`, `leerBandeja`, `agregar`) y sumar `contactos: "lh-contactos"` a `lib/demo/claves.ts`. Verificar con tests de Vitest: canal obligatorio; mensaje de 501 caracteres rechazado; destino por motivo; JSON inválido → `[]`; el más nuevo primero; `borrarDemo` quita `lh-contactos`. Correr `pnpm test`.
- [x] 1.2 Agregar el término `contacto` a `lib/legal/terminos.ts` con el texto del design y `borrador: true`. Verificar con `pnpm test` (test del catálogo).

## 2. Formulario y pantallas

- [x] 2.1 Crear `components/pedido-contacto.tsx` según el design (en línea, radios de canal, momento, mensaje con contador, aviso de "no te pedimos email ni teléfono", ⚖ `contacto`, errores accesibles, anuncio en región en vivo, foco al abrir y al cancelar; solo tokens). Verificar en `pnpm dev` solo con teclado.
- [x] 2.2 Usar el formulario en la ficha de finca de `app/territorios/[id]/` (con el aviso compacto de `EstadoAdministrativo` y `estadoMostrado`), reemplazando la marca propia de la consulta. Verificar en `pnpm dev` con la finca 502: enviar, recargar y ver "Consulta enviada (simulado)".
- [x] 2.3 En `app/sumarte/sumarte-cliente.tsx`, hacer que "Pedir invitación" y "Pedir una charla" abran el formulario y hagan el `dispatch` actual solo al enviar. Verificar en `pnpm dev`: enviar suma uno al medidor; cancelar no cambia nada.
- [x] 2.4 Crear `app/netx/bandeja-pedidos.tsx` y sumarlo a `app/netx/page.tsx` (tabla, nota del CRM, vacío, "sin dato" en opcionales). Verificar en `pnpm dev` con y sin pedidos.

## 3. Tests

- [x] 3.1 Escribir `e2e/contactos.spec.ts` con los escenarios de la spec (finca 502, canal obligatorio, mensaje largo, cancelar, invitación al círculo, cancelar la charla, bandeja en `/netx`, vacío, borrar todo desde `/panel`, ⚖ borrador, solo teclado) y ajustar `e2e/sumarte.spec.ts` y el e2e del territorio al nuevo paso del formulario. Verificar con `pnpm test:e2e`.
- [x] 3.2 Sumar a `e2e/accesibilidad.spec.ts` `/sumarte` con el formulario abierto y `/netx` con un pedido. Verificar sin violaciones `serious` ni `critical`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/contactos-bandeja` con guion de prueba (consultar la finca 502 → pedir invitación → pedir charla → ver los tres en `/netx` → borrar todo desde `/panel`). Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/contactos-bandeja> pnpm test:e2e e2e/contactos.spec.ts`.
