# Proposal

## Why

La nota 18 (§1 punto 9 y §6 punto 6) pide un **pozo común por tribu**: lo que cada tribu se compromete a entregar al Lighthouse (verduras, horas de taller, noches) **y lo que efectivamente entregó**. Es lo que después alimenta la confianza entre tribus, el Fondo Común y la Ronda 0. El roadmap lo agrupa con el registro de compromisos de la It.1.

Hoy la ficha de cada tribu activa muestra "Lo que aporta al pozo común" (lo comprometido, del mock-up), pero no hay forma de registrar entregas. `compromisos-registro` lo dejó explícitamente para "otro cambio" ("compromisos de tribus y el pozo común con lo entregado"). Con el login ya existe quien administra una tribu (`tribuAdmin`; con `sumarte-acceso`, el Líder de tribu), así que se puede simular el lado de la tribu.

## What Changes

- En la ficha de una tribu activa (`/tribus/[id]`), cada ítem de "Lo que aporta al pozo común" muestra debajo **sus entregas registradas** (fecha, cantidad en texto libre y una nota opcional), de la más reciente a la más vieja. Sin entregas: **"Sin entregas registradas todavía"** (nunca "0").
- **Registrar una entrega** (solo quien administra esa tribu según la sesión): formulario con ítem del pozo (uno de los comprometidos), fecha (no futura), cantidad (texto, obligatoria, hasta 60 caracteres, por ejemplo "4 noches") y nota (opcional, hasta 140). Cada entrega se puede quitar.
- Cada entrega lleva la marca escrita **"Registrada por la tribu · sin verificar"**: en el prototipo nadie la confirma.
- ⚖ nuevo **`pozocomun`** (borrador): en palabras simples, qué es el pozo común, que las entregas son compromisos de la tribu con el Lighthouse (no una venta ni una inversión) y que en el prototipo las registra la propia tribu sin verificación.
- Las entregas se guardan **en el navegador**, con el prefijo de la persona (`lib/demo/claves.ts`), y se borran con "Borrar todo" del panel. Aviso: "Modo demostración: las entregas quedan solo en este navegador."

**Fuera de alcance:**
- Verificación de las entregas por el Guardián o por otra tribu (y los vouchers del pozo, nota 18 §2, L6).
- Que las entregas de una persona las vean las demás: llega con la base (`base-neon` y las specs que siguen). Hasta entonces, quien no administra la tribu ve "Sin entregas registradas todavía".
- Cantidades numéricas, totales o porcentajes de cumplimiento (lo comprometido es texto libre del mock-up; sumar o comparar sería inventar datos).
- Compromisos de las tribus en `/compromisos` y emparejamiento con necesidades.
- Tribus en formación y barrios vacantes (no tienen pozo comprometido).

## Capabilities

### New Capabilities
- `pozo-comun-entregas`: registrar y ver lo que una tribu entregó al pozo común frente a lo que comprometió.

### Modified Capabilities

## Impact

`lib/pozo/` (tipos, validación, estado y lectura del navegador, con tests), `app/tribus/[id]/` (sección del pozo con entregas y formulario para el admin), `lib/demo/claves.ts` y `lib/demo/borrar.ts` (clave nueva), `lib/legal/terminos.ts` (⚖ `pozocomun` con `borrador: true`), `e2e/pozo.spec.ts` (con el login de prueba como admin de Valle Solar y como persona común). Sin dependencias nuevas.
