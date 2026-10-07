# Design

## Context

Tres botones simulados piden contacto: la ficha de finca de `territorio-macrolote` (guarda su propia marca en el navegador), y "Pedir invitación" / "Pedir una charla" en `app/sumarte/sumarte-cliente.tsx` (reducer de `lib/sumarte/estado.ts`). `lib/demo/claves.ts` centraliza las claves del modo demostración y `lib/demo/borrar.ts` las borra todas. No hay login ni servidor; el CRM (HubSpot o la plataforma) no está decidido.

## Decisions

- **Modelo** (`lib/contactos/tipos.ts`): `Motivo = "consulta-lote" | "invitacion-circulo" | "charla-netx"`; `Pedido = { id; fecha: string (ISO); motivo; referencia: string; canal: "email" | "telegram" | "whatsapp"; momento?: "manana" | "tarde" | "noche"; mensaje?: string; destino: string; estadoMostrado?: string }`. Las etiquetas visibles ("Consulta por un lote", "Invitación al círculo", "Charla para invertir en NetX") y el destino salen de una tabla por motivo, no se escriben en los componentes.
- **Funciones puras** (`lib/contactos/pedidos.ts`): `validar(borrador)` → errores por campo; `crearPedido(borrador, ahora, id)`; `leerBandeja(texto)` tolera JSON inválido (devuelve `[]`); `agregar(bandeja, pedido)` deja el más nuevo primero. Tests con Vitest. El componente hace la lectura/escritura de `localStorage` con la clave `CLAVES.contactos = "lh-contactos"`.
- **Formulario** (`components/pedido-contacto.tsx`, cliente): props `{ motivo; referencia; estadoMostrado?; alEnviar(pedido); alCancelar() }`. Se renderiza debajo del botón que lo abrió (sin modal ni trampa de foco); al abrir, el foco va al título; al cancelar, vuelve al botón. Canal con `fieldset` + radios; errores con `aria-describedby` y `aria-invalid`; anuncio con `role="status"`.
- **Sumarte:** el botón pasa a abrir el formulario; `alEnviar` guarda el pedido y recién ahí hace el `dispatch` que existe hoy (`invitacion` o `charla`). El reducer no cambia.
- **Finca:** se reemplaza la marca propia de la consulta por la bandeja; "Consulta enviada (simulado)" se mantiene si ya hay un pedido para esa finca. El `estadoMostrado` es el texto compacto de `EstadoAdministrativo` ("Loteo en trámite · Ord. 173/2026").
- **Vista NetX:** `app/netx/page.tsx` sigue siendo de servidor; la sección nueva es un componente cliente `app/netx/bandeja-pedidos.tsx` que lee la bandeja al montar (antes de leer muestra "Cargando pedidos…" para no romper la hidratación).
- **Texto del ⚖ `contacto` (borrador):** "Pedir contacto no es una reserva, una oferta ni una inversión: no te compromete a nada, no se paga nada y no asegura un lote ni un lugar en el círculo. Una persona del equipo te escribe. Si es por un lote de Chacras de Soluna, la compra es privada entre vos y BioPueblo; NetX actúa como agencia."

## Risks / Trade-offs

- [Guardar sin consentimiento] → no se guardan datos personales (ni nombre, ni email, ni teléfono); el mensaje libre lleva la ayuda "No escribas datos personales acá". Cuando entre `privacidad-consentimiento`, la bandeja se suma a la lista de pantallas que guardan con OK.
- [La Vista NetX muestra datos de un solo navegador] → el título y la nota lo dicen; sirve para la demo, no para medir.
- [El medidor del círculo ya suma 1 al pedir invitación] → se respeta el comportamiento actual de `sumarte-planes`; no se toca.
