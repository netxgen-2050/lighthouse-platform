# Proposal

## Why

La US-01 de la nota 15 (prioridad M, It.1 "Explorar") pide que quien llega desde un link de una campaña vea **preseleccionado su camino** (inversor, nodo o Congreso). `portada-caminos` dejó afuera ese criterio "hasta la integración con HubSpot", pero la preselección **no necesita el CRM**: alcanza con leer el link de entrada. Además, en esta fase de prototipo interno (`CLAUDE.md`) la plataforma tiene que dejar claro que **va a servir para captar plata de inversores**, y hoy un inversor que llega desde una campaña ve la misma portada que alguien que busca tribu, sin ninguna puerta directa a "Para inversores".

## What Changes

- **Lectura del origen en la portada** (`/`): el parámetro `camino` (`explorar`, `tribu`, `congreso`, `inversor`) o, si no está, el `utm_campaign` del link (las campañas de HubSpot) se traduce a un camino recomendado. Valores desconocidos o ausentes: la portada queda exactamente como hoy.
- **Camino recomendado:** la tarjeta correspondiente de "Por dónde empezar" muestra el texto "Recomendado para vos" (dentro del enlace, así lo lee el lector de pantalla) y un borde más marcado. El orden de las tarjetas no cambia.
- **Puerta para inversores:** con el origen `inversor`, aparece arriba de "Por dónde empezar" una sección "¿Venís a invertir?" con las dos puertas de `/sumarte` (sumarte al proyecto del territorio por invitación, con el ⚖ `circulo` que ya existe, o invertir en NetX como empresa) y un enlace "Ver Para inversores" → `/sumarte#inversores`.
- Nada se guarda ni se envía: el origen se usa solo para dibujar esa visita a la portada.

**Fuera de alcance:**
- Guardar el origen, mandarlo a HubSpot o mostrar visitas por origen en la Vista NetX: depende de la decisión del CRM (nota 18, §6 punto 10) y del permiso de `privacidad-consentimiento`.
- Nodos del corredor (Valle del Río Negro, San Martín de los Andes, Atlántico Sur): siguen fuera, como decidió `territorios-modelo`. El origen `nodo` lleva al camino "Explorar el Lighthouse".
- Cambiar el titular, el subtítulo o el orden de los caminos.
- Mencionar lotes o el Lote 7 en la portada (por eso no lleva el aviso de la Ordenanza 173).
- Textos legales nuevos: se reutiliza el ⚖ `circulo`.

## Capabilities

### New Capabilities
- `portada-origen`: el camino recomendado según el link de entrada y la puerta para inversores en la portada.

### Modified Capabilities

## Impact

`lib/portada.ts` (función pura que traduce el origen, con tests en `lib/portada.test.ts`), `app/page.tsx` (lee `searchParams`; la portada pasa a renderizarse por pedido), `e2e/portada.spec.ts`. Sin dependencias nuevas. No toca HubSpot ni guarda nada.
