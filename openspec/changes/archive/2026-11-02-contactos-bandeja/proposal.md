# Proposal

## Why

El prototipo tiene que dejar claro que la plataforma **va a captar plata de inversores y usuarios** (decisión de Gus, 7-oct). Hoy hay tres botones donde una persona levanta la mano para poner plata o comprar, y los tres terminan en un cartel "(simulado)" sin dejar nada que el equipo pueda mirar:
- "Consultar por este lote" en la ficha de una finca de Soluna (`territorio-macrolote`, NetX como agencia).
- "Pedir invitación" al círculo del Lote 7 en `/sumarte` (fideicomiso).
- "Pedir una charla" para invertir en NetX como empresa en `/sumarte` (SAFE).

El roadmap pone la integración con **HubSpot** en la It.1 (Desarrollo/06) y la nota 18 deja abierto si el CRM es HubSpot o la propia plataforma (§6 punto 10). Antes de decidir el CRM y el login, conviene tener **una sola forma de registrar un pedido de contacto** y verlos juntos en la Vista NetX: así se muestra en la demo el embudo de punta a punta (alguien pide → el equipo lo ve) sin cobrar nada y sin enviar datos a ningún servidor.

## What Changes

- **Formulario corto de pedido de contacto** (`components/pedido-contacto.tsx`), que se abre en línea (no modal) al apretar cualquiera de los tres botones:
  - El **motivo** y la **referencia** vienen dados por el botón (por ejemplo, "Consulta por un lote · Finca 502").
  - **Cómo preferís que te contactemos:** Email, Telegram o WhatsApp (obligatorio, solo la preferencia).
  - **Mejor momento** (opcional: Mañana, Tarde, Noche) y **Mensaje** (opcional, hasta 500 caracteres).
  - Un aviso: "En el prototipo no te pedimos email ni teléfono: el pedido queda solo en este navegador."
  - Con el ⚖ `contacto` (borrador) y, en la consulta por un lote, el aviso compacto de `EstadoAdministrativo`.
  - Botones "Enviar pedido (simulado)" y "Cancelar". Al enviar: "Pedido recibido (simulado). Lo vería: <destino>."
- **Bandeja de pedidos** en el navegador (`lib/contactos/`, clave `lh-contactos` en `lib/demo/claves.ts`, así "Borrar todo" del panel también la borra). Cada pedido guarda fecha, motivo, referencia, canal, momento, mensaje, **destino** (quién lo atendería: "BioPueblo, vía NetX como agencia" o "Equipo NetX") y, si es de un lote, el estado administrativo que se le mostró.
- **Integración con las pantallas:** "Consultar por este lote" deja de guardar su propia marca y usa el formulario; "Pedir invitación" y "Pedir una charla" abren el formulario y, al enviar, hacen lo mismo que hoy (marcan "Invitación pedida (simulado)" / "Charla pedida (simulado)" y suman al medidor del círculo). Cancelar no cambia nada.
- **Vista NetX** (`/netx`): nueva sección "Pedidos de contacto · este navegador (simulado)" con una tabla (fecha, motivo, referencia, canal, destino, estado "Recibido (simulado)") y la nota "En el producto real irían al CRM". Sin pedidos: "Todavía no hay pedidos en este navegador."
- **Un ⚖ nuevo, `contacto`** ("Pedir contacto"), redactado por el agente, con `borrador: true`.

**Fuera de alcance:**
- HubSpot real, envío a cualquier servidor, emails o notificaciones: no hay CRM decidido ni claves.
- Pedir email, teléfono o nombre: llega con el login (Privy o alternativa, a decidir).
- Captura de UTM y origen del tráfico (US-01): otro cambio, cuando se decida el CRM.
- Mostrar los pedidos en `/panel` ("Mi recorrido"): queda para después.
- Consentimiento antes de guardar (C16): lo trae `privacidad-consentimiento` (en espera); cuando entre, la bandeja pasa a guardar con `guardarSiHayOk` como las demás pantallas.
- Cambiar los textos, precios o medidores de `/sumarte` y la ficha de la finca más allá de lo dicho.

## Capabilities

### New Capabilities
- `contactos-bandeja`: el pedido de contacto único para lotes, círculo de inversores e inversión en NetX, y la bandeja simulada en la Vista NetX.

### Modified Capabilities

## Impact

Código nuevo en `lib/contactos/` (tipos, validación, lectura y guardado, con tests de Vitest) y `components/pedido-contacto.tsx`; cambios chicos en `app/sumarte/sumarte-cliente.tsx`, en la ficha de finca de `app/territorios/[id]/` y en `app/netx/page.tsx` (sección cliente); `lib/demo/claves.ts`; `lib/legal/terminos.ts` (término `contacto`); `e2e/contactos.spec.ts` y ajustes en `e2e/sumarte.spec.ts` y en el e2e del territorio. **Depende de** `territorio-macrolote`, `sumarte-planes` y `estado-administrativo` en `main` (este último trae el aviso compacto y la marca `borrador`). Sin dependencias npm nuevas.
