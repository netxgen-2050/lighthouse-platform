# Proposal

## Why

La nota 18 (§1 punto 3) propone **"Mi Raíz"**: un solo lugar donde la persona ve lo que tiene en la red (su pase, sus créditos, su presencia, sus Semillas y su voz). Hoy esos datos están dispersos entre `/sumarte`, `/semillas`, `/congreso`, `/canales` y "Mi recorrido", y la tokenomics los trata como **un solo estado de la persona**. Para el prototipo, es la pantalla que muestra **qué recibe quien pone plata** (el Pase Fundador y sus créditos) junto con lo que gana quien pone trabajo (Semillas), sin abrir pagos ni flujos nuevos: todo sale de lo que ya está guardado en el navegador.

El roadmap la ubica en It.3 ("Mi Raíz" en la actualización del 6-oct). Se propone adelantarla porque es **solo lectura**, cabe en una noche y le da a la demo de la It.1 un cierre para el camino del inversor. Implementarla ya era la pregunta 6 de la nota 18 §7 para el 12-oct: queda para que Gus apruebe o la postergue.

## What Changes

- **Página `/mi-raiz`** ("Mi Raíz"), en el menú de la persona (grupo `persona` de `lib/navegacion.ts`, junto a Perfil, Pasaporte y Mi recorrido). Cinco tarjetas, cada una con un enlace a la pantalla donde se cambia ese dato:
  1. **Pase:** "Pase {nivel} (simulado)" si hay uno activo en `lh-sumarte`; si no, "Sin Pase Fundador" y enlace a `/sumarte`. ⚖ `pasefundador`.
  2. **Créditos comunes y de estadía:** con pase, el total del nivel (de `PASSES` en `lib/sumarte/datos.ts`) y "se liberan a lo largo de 3 años"; "Usados: sin dato (todavía no hay canjes)". Sin pase, "Los créditos vienen con el Pase Fundador" (nunca 0). ⚖ `creditos`.
  3. **Presencia:** con ticket válido en `lh-congreso-ticket`, "Ticket registrado · Genesis pendiente: se confirma con el primer check-in en el territorio"; sin ticket, "Sin ticket registrado" y enlace a `/congreso`. ⚖ `presencia`.
  4. **Semillas:** una fila por comunidad con algo guardado en `/pactos`, con su total (`semillasDeComunidad`) o "sin dato"; sin pactos, "Todavía no sumaste Semillas" y enlace a `/pactos`. 🌱 `semillas`.
  5. **Voz:** las puertas de voz del servicio de permisos (voz en tu tribu, voz en el Fondo Común, voto en la Asamblea de residentes) con su estado en texto ("Abierta · 1 voz" o "Cerrada · se abre con …"), calculadas con `filasDePuertas(personaDesdeSumarte(…))`, igual que `/canales`.
- **Aviso fijo** arriba: "Mi Raíz no es una billetera de plata: nada de esto se compra, se vende ni se transfiere." con ⚖ nuevo `miraiz` (**borrador**).
- Lógica pura en `lib/mi-raiz/estado.ts` que arma las cinco tarjetas a partir de una función `leer(clave)`, para testearla sin navegador.

## Fuera de alcance

- Canjear créditos, vencimientos con fecha, libro de créditos y conciliación con el Guardián (It.3).
- Check-in con QR, días de presencia e insignia Genesis on-chain (It.4).
- Membresía de tribu "aceptada" real: como en `/canales`, la persona se arma solo con lo elegido en Sumarte (sin tribu, sin presencia, no residente).
- Avales, pozo común, wallets embebidas de Privy y cualquier dato on-chain.
- Mostrar pagos simulados (si `sumarte-pago-simulado` se aprueba, se puede enlazar después).

## Capabilities

### New Capabilities
- `mi-raiz`: vista de solo lectura con el pase, los créditos, la presencia, las Semillas y la voz de la persona.

### Modified Capabilities

## Impact

`app/mi-raiz/page.tsx` y un componente cliente, `lib/mi-raiz/estado.ts` (nuevo, con su test), `lib/navegacion.ts` (destino nuevo, icono `Wallet` de lucide-react) y su test, `lib/legal/terminos.ts` (clave `miraiz` con `borrador: true`) y su test, `e2e/mi-raiz.spec.ts`, `e2e/accesibilidad.spec.ts`. Reusa `lib/sumarte/`, `lib/semillas/estado.ts`, `lib/congreso/ticket.ts` y `lib/canales/puertas.ts`. Sin dependencias npm nuevas.
