# Proposal

## Why

Lo que la persona tiene habilitado aparecía en tres lugares distintos ("Tus caminos" del Pasaporte, las puertas de `/canales` y "Lo que se te abre" de Semillas). Gus propuso la metáfora de un **pasaporte físico con sellos**: cada sello certifica algo y abre puertas concretas. El KYC pasa a ser un sello que se pide solo cuando hace falta. Decisiones de Gus del 9-oct-2026 sobre "Mi lugar" (Perfil, Pasaporte, Mi recorrido, bandeja y rail). Fase de prototipo interno, sin cuentas todavía: todo se guarda en el navegador (ver `CLAUDE.md`).

## What Changes

- `/pasaporte` se rehace como un **pasaporte con sellos** (diseño visual de sello: forma circular u ovalada con borde, nombre, fecha y estado). Sellos:
  - **Explorador/a** (al empezar), **Miembro de la red** (plan Miembro en Sumarte), **Miembro de <comunidad>** (uno por cada comunidad, de `lib/membresia/`), **Identidad verificada** (KYC), **Inversor habilitado** (KYC aprobado + residencia fiscal en Argentina; si es del exterior, explica por qué no), **Pase Fundador** (de Sumarte), **Genesis** (check-in del Congreso), **Residente** (ejemplo: no disponible todavía).
  - Cada sello en uno de tres estados, escrito en texto: **obtenido** (con fecha), **en trámite** o **disponible**, con el botón o el enlace para conseguirlo.
  - Cada sello muestra **qué abre**, a partir del servicio de permisos (`lib/permisos/`): las puertas en lenguaje simple (lo que hoy muestra `/canales`).
- **Verificar mi identidad (KYC a pedido):** botón en el sello que abre un proceso por pasos en un diálogo: 1) datos personales (nombre, documento, fecha de nacimiento), 2) residencia fiscal y nacionalidad, 3) origen de los fondos, 4) tipo de inversor (calificado o no), 5) revisión y envío. Queda **en trámite** y, en el prototipo, "Simular: verificación aprobada". Todo simulado y en el navegador, con el aviso de que en la versión real lo hace el fiduciario.
- El mismo proceso se **ofrece automáticamente** cuando alguien quiere invertir ("Pedir invitación" en Sumarte / sección inversores) o registrar un aporte en plata en Pactos sin tener el sello de identidad.
- **Se quita `/canales`** (redirige a `/pasaporte`) y se quita la escalera "Lo que se te abre" de `/semillas` (Semillas queda como contabilidad, con un enlace "Ver lo que te abre tu pasaporte"). "Tus caminos" desaparece: lo cubren los sellos.

**Fuera de alcance:** KYC real, carga de documentos, fiduciario.

## Capabilities

### New Capabilities
- `pasaporte-sellos`: ver specs.

### Modified Capabilities

## Impact

`app/pasaporte/`, `lib/pasaporte/` (sellos y KYC), `app/canales/` (redirección), `app/semillas/` (sin la escalera), puntos de entrada del KYC en `/sumarte` y `/pactos`, e2e.
