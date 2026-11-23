# Proposal

## Why

La actualización del roadmap del 6-oct suma a la It.1 **"planes y permisos (modelo)"**, y la nota 18 (§1 punto 7 y §3) dice que el acceso a salas, foros, voz y créditos **es** la utilidad del Pase y de la membresía: "token gating sin token". El servicio de permisos ya existe (`lib/permisos/`, mergeado) y esta noche entró `/sumarte` con la elección simulada de plan y Pase Fundador, pero **nada los conecta**: en la demo, elegir el Pase no cambia nada visible. Una pantalla "Canales" que lea el plan y el pase elegidos y muestre qué puertas se abren (y por qué) hace tangible lo que se vende en Sumarte, que es justo lo que el prototipo tiene que mostrar a inversores y usuarios. También deja lista la pieza que después consulta el bot de Telegram (It.2).

## What Changes

- Página `/canales` ("Qué te abre tu lugar en la red") con dos bloques:
  - **Tu situación:** plan y Pase Fundador leídos de lo que se eligió en `/sumarte` (modo demostración, mismo navegador). Tribu aceptada: "ninguna todavía". Presencia Genesis: "pendiente" (la confirma el anfitrión en el check-in, aunque haya ticket registrado). Residente: "no".
  - **Las puertas:** una fila por cada puerta del servicio de permisos, con nombre en lenguaje simple, estado **en texto** ("Abierta", "Abierta como visita", "Cerrada"), el motivo ("por tu plan", "por tu pase"…) y, si está cerrada, **qué la abre** según la tabla de la nota 18 ("Se abre con: Pase Fundador").
- **"Probá otra situación"**: controles para cambiar plan, pase, una tribu aceptada, presencia Genesis y residencia, y ver cómo cambian las puertas al instante. No se guarda; un botón "Volver a mi situación" lo deshace.
- Lo no decidido se muestra como tal: el refuerzo de la voz por presencia figura "a decidir", nunca un número.
- Enlace "Ver qué te abre cada plan" desde `/sumarte`, debajo de la tabla de planes.
- Los ⚖ que ya existen en el catálogo (`pasefundador`, `presencia`, `guardian`, `creditos`) acompañan las filas correspondientes.

**Fuera de alcance:**
- Salas y foros reales, bot de Telegram, invitaciones o enlaces a grupos.
- La fila "Descuentos y prioridad en estadías y eventos" de la nota 18 (pendiente R7).
- Cambiar la tabla de permisos o la lógica de `lib/permisos/`: solo se lee.
- Cuentas, base de datos, membresías reales de tribu (ritual de entrada): la tribu aceptada solo existe en el simulador.
- Ítem nuevo en el rail de navegación (ver preguntas abiertas).
- Términos ⚖ nuevos.

## Capabilities

### New Capabilities
- `canales-acceso`: la vista de qué puertas (salas, foros, voz, créditos) tiene abiertas una persona según su plan, pase, tribu, presencia y rol, y por qué.

### Modified Capabilities

## Impact

Código nuevo en `app/canales/` y `lib/canales/` (textos de las puertas y armado de la persona a partir del estado de Sumarte); un enlace en `app/sumarte/sumarte-cliente.tsx`; `e2e/canales.spec.ts`. Lee `lib/permisos/` (`calcularPermisos`, `puede`, `tabla.ts`) y `lib/sumarte/estado.ts` (`leer`). **Depende de** `servicio-permisos` (ya en `main`) y `sumarte-planes` en `main`. Sin dependencias npm nuevas.
