# Proposal

## Why

Gus, 27-nov-2026: los cuatro planes de Sumarte (Explorador, Miembro de la red, Pase Fundador Semilla/Brote/Raíz y Plan Tribu) venden cosas que hoy están en pausa: salas, pactos, voz en tu tribu, liderar una tribu e influencia en el Fondo Común con conviction voting. Desde entonces la plataforma cambió: se sacó por ahora la gobernanza y las comunidades, apareció Invertir y la participación se simplificó en Participa. Raíz es del modelo viejo de FARO y Semilla no está definida en esta versión.

En el mismo chat se analizó qué tiene que hacer Sumarte en la fase 1. La plata grande viene de la venta de lotes, así que Sumarte tiene tres trabajos: llevar a la gente de "me interesa" a "visito el lugar" y de ahí al lote, sumar un ingreso recurrente chico y fondear el bien común desde el día uno. El Pase Fundador viejo competía con el anticipo de un lote y con el Token Inversor (Raíz de USD 5.000, créditos que se liberan, influencia) y se parecía a una preventa.

También apareció una incoherencia de acceso: para sumarse a un equipo de Participa o adherir al manifiesto hace falta un plan pago (capacidad `adherir` = Miembro). Así, la voz y el trabajo se compran, y eso contradice la puerta "Aportando" de FARO y el principio de Ostrom que adoptamos.

## What Changes

- **Tres planes y una franja:** **Explorador** (gratis), **Amigo** (por mes o por año), **Fundador** (pago único, cohorte limitada) y **Aliados** (organizaciones, "Hablemos"). Desaparecen Miembro de la red, los niveles Semilla/Brote/Raíz y el Plan Tribu.
- **FARO de prepago:** Amigo y Fundador acreditan FARO para canjear después por lo que ofrece el plan (tercera puerta de FARO, "Prepagando servicios"). Sus reglas (precio, cupo, quema, vencimiento, sin voz) se muestran como **borrador a definir**: los valores viven en un solo archivo de datos y la página los presenta como placeholders.
- **Vista en compu:** tabla clásica de precios con tres columnas (Amigo destacado), selector Mensual/Anual y la franja de Aliados abajo; debajo, la comparación con encabezado fijo. **En el celular** sigue el selector de un plan por vez (ux-sumarte), con tres opciones y Aliados como tarjeta aparte.
- **Matriz de acceso coherente:** adherir al manifiesto y sumarse a un equipo de Participa pasan a Explorador (gratis, con cuenta). Bien común e Invertir no dependen de ningún plan. Los planes pagos solo abren utilidades (bitácora, sesiones, cupos antes que nadie, FARO de prepago).
- **Lo que todavía no existe se dice:** cada beneficio que no está construido lleva la marca "próximamente".
- **Comprar un lote e Invertir** quedan fuera de la tabla, como dos tarjetas de destino. Ningún plan da prioridad, reserva ni crédito sobre un lote, y ninguno es una inversión.
- **Darme de baja** visible para quien tiene Amigo (simulado).
- **Sale la sección "Para inversores"** de Sumarte (el círculo por invitación y "Invertir en NetX como empresa"): ese camino es Invertir.

## Fuera de alcance

- Mostrar en Mi tierra el saldo de FARO por origen (lote, aportes, prepago): cambio aparte.
- Construir la bitácora de obra, las sesiones o los cupos de eventos: acá solo se nombran como beneficios ("próximamente" si no existen).
- Renombrar los identificadores internos de nivel (`miembro`, `lider`) en el código y en los e2e de funciones en pausa (Pactos, Semillas, Fogón, Compromisos): ver design §5.
- El login (#217) y Candide (#219). No se toca `components/sesion/` salvo lo que pida el nombre de un nivel.
- Precios definitivos: son de ejemplo, a validar con Vagner.

## Capabilities

### Modified Capabilities
- `sumarte`: planes nuevos, FARO de prepago en borrador, vista de tabla en compu, solo el pago es simulado.
- `sumarte-acceso`: qué habilita cada nivel con los planes nuevos.

## Impact

- **Cambia:** `app/sumarte/` (vista), `components/sumarte/`, `lib/sumarte/datos.ts` y `lib/sumarte/estado.ts` (planes y migración del estado guardado), `lib/permisos/niveles.ts` (`adherir` pasa a Explorador), `lib/idioma/textos/sumarte.ts` y `lib/idioma/glosario.ts` (es/en), `lib/pasaporte/sellos.ts` (el sello de miembro).
- **Tests:** `e2e/sumarte*.spec.ts`, `e2e/idioma-portada-sumarte.spec.ts`, `e2e/membresia.spec.ts`, `e2e/participa*.spec.ts`, `e2e/manifiesto-lighthouse-vrn.spec.ts`, `e2e/accesibilidad.spec.ts` y los unitarios de `lib/sumarte` y `lib/permisos`.
- **Sin** tablas nuevas en la base ni dependencias nuevas.
