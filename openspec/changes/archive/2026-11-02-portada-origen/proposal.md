# Proposal

## Why

La US-01 (nota 15) tiene un segundo criterio que quedó afuera de `portada-caminos`: **"Si vengo con un link de campaña, el camino se preselecciona"** (inversor, nodo, Congreso). Y la integración con el CRM es parte de la It.1 del roadmap (Desarrollo/06): para medir el embudo de la Vista NetX hay que saber **de dónde vino** cada persona que pide contacto. `contactos-bandeja` dejó la captura del origen "para otro cambio, cuando se decida el CRM".

Capturar el origen **no depende** de elegir HubSpot o la propia plataforma: los parámetros `utm_*` son el estándar que leen los dos. Si lo guardamos ya en el navegador y lo pegamos a cada pedido de contacto, en la demo se ve el embudo de punta a punta (link de campaña → portada con su camino → pedido → bandeja con el origen) y, cuando se decida el CRM, solo cambia a dónde se manda.

## What Changes

- **Camino recomendado por link:** `/?camino=tribus|perfil|congreso` marca esa tarjeta de "Por dónde empezar" con la etiqueta visible "Recomendado para vos" y un borde destacado. Un valor desconocido se ignora. El orden de las tarjetas no cambia.
- **Origen de la visita:** si la portada se abre con `utm_source`, `utm_medium` o `utm_campaign`, se guarda en el navegador el **primer origen** (fuente, medio, campaña, camino y fecha) con la clave `lh-origen`. Solo se aceptan esos tres parámetros y `camino`, limpiados (letras, números, `-`, `_`, `.`; hasta 60 caracteres). Cualquier otro parámetro de la URL se descarta.
- **Origen en los pedidos de contacto:** cada pedido nuevo copia el origen guardado (si hay).
- **Vista NetX:** la tabla "Pedidos de contacto" suma la columna "Origen" ("fuente · medio · campaña", con "sin dato" en lo que falte o si no hay origen).
- "Borrar todo lo de este navegador" también borra `lh-origen`.

## Fuera de alcance

- Enviar el origen o los pedidos a HubSpot o a cualquier servidor; exportar a CSV.
- Atribución por último contacto, varias visitas o caminos fuera de la portada (`/sumarte`, `/territorios/...` con `utm_*`).
- Cookies, analítica, píxeles o cualquier seguimiento de terceros.
- Camino "inversor" que lleve a Sumarte: hoy la portada no tiene esa tarjeta (ver preguntas abiertas).
- Generador de links de campaña para el equipo.

## Capabilities

### New Capabilities
- `portada-origen`: el camino recomendado por link y el origen de la visita guardado y pegado a los pedidos de contacto.

### Modified Capabilities

## Impact

`app/page.tsx` (lee los parámetros y marca la tarjeta), un componente cliente chico que guarda el origen, `lib/origen/` (lectura, limpieza y almacenamiento, con tests), `lib/demo/claves.ts` (`origen: "lh-origen"`), `lib/contactos/` (campo `origen` opcional en `Pedido`, `crearPedido` y `leerBandeja`), `components/pedido-contacto.tsx`, `app/netx/bandeja-pedidos.tsx`, `e2e/portada.spec.ts` y `e2e/contactos.spec.ts`. La portada pasa a renderizarse por pedido (lee `searchParams`). Sin dependencias nuevas.
