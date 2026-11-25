# Proposal

## Why

La regla **C11** (Defensa del consumidor, Ley 24.240: "qué se mostró y cuándo"; Desarrollo/03) entra en la It.1 del roadmap junto con C1 y C16. Pide una **bitácora de exposición por persona y pantalla, con el estado administrativo mostrado**. Ahora que el prototipo muestra planes con precios, el Pase Fundador, el círculo de inversores y fincas de Soluna, la pregunta "¿qué texto legal y qué estado del loteo tenía esta persona en pantalla cuando pidió contacto o 'pagó' (simulado)?" ya tiene sentido, y la respuesta depende de qué versión de cada ⚖ se vio. `privacidad-consentimiento` dejó la bitácora explícitamente para otro cambio.

Sin cuentas ni servidor, la bitácora real no se puede guardar todavía. Lo que sí se puede hacer ahora es **fijar la forma del registro** (qué se anota, con qué huella de versión, cuándo) y mostrarla en el prototipo, para que el día que lleguen login y base solo cambie dónde se guarda.

## What Changes

- **Registro en el navegador** (`lib/demo/bitacora.ts`, clave `lh-bitacora` en `lib/demo/claves.ts`, así "Borrar todo lo de este navegador" también la borra). Cada entrada guarda: fecha y hora, ruta, tipo, qué se mostró y una **huella** del texto (un código corto calculado del título y el texto), más la marca de borrador si la tiene.
- **Qué se anota** (solo dos cosas en este cambio):
  - Cada vez que se ve el componente `EstadoAdministrativo` (tipo "estado del loteo": proyecto, estado, norma y expediente mostrados).
  - Cada vez que se abre un ⚖ (tipo "término legal": clave, título, huella y si es borrador).
  - La misma cosa en la misma ruta con la misma huella se anota una sola vez cada 30 minutos, y la bitácora guarda como máximo las últimas 300 entradas.
- **Página `/panel/bitacora`** ("Lo que te mostramos"), enlazada desde `/panel`: una tabla con fecha y hora, pantalla, qué se mostró, huella y "Borrador: sí/no", la más nueva primero; botón "Descargar (JSON)"; vacío: "Todavía no hay nada anotado en este navegador."; un párrafo que explica para qué sirve, con el ⚖ `bitacora`.
- **Un ⚖ nuevo, `bitacora`** ("Bitácora de lo que te mostramos"), redactado por el agente, con `borrador: true`.

**Fuera de alcance:**
- Guardar la bitácora en un servidor o atarla a una cuenta: llega con el login y la base (Neon + Drizzle).
- Plazo de conservación (C5 habla de 10 años para KYC; para C11 no está definido): lo decide el equipo legal.
- Anotar cada visita a cada página, los precios vistos en `/sumarte`, los pagos simulados o los pedidos de contacto: se suman cuando se decida qué hace falta probar (ver preguntas abiertas).
- Consentimiento previo (C16): lo trae `privacidad-consentimiento` (en espera); cuando entre, la bitácora pasa a guardar con `guardarSiHayOk`.
- Mostrar la bitácora en la Vista NetX.

## Capabilities

### New Capabilities
- `bitacora-exposicion`: el registro de qué estado administrativo y qué textos legales se le mostraron a la persona y cuándo, y la página para verlo y descargarlo.

### Modified Capabilities

## Impact

Código nuevo en `lib/demo/bitacora.ts` (con tests de Vitest) y `app/panel/bitacora/`; cambios chicos en `components/termino-legal.tsx` (anotar al abrir), `components/estado-administrativo.tsx` (anotar al verse), `app/panel/` (enlace), `lib/demo/claves.ts` y `lib/legal/terminos.ts` (término `bitacora`); `e2e/bitacora.spec.ts`. **Depende de** `estado-administrativo` en `main` (componente y marca `borrador`). No depende de `contactos-bandeja`. Sin dependencias npm nuevas.
