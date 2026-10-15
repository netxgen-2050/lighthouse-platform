# Proposal

## Why

Gus decidió el 14-oct-2026 que **una persona puede liderar más de una tribu** (backlog **L8**, cerrado como **C13** en "Pendientes de segunda revisión"): al pedir (o simular) la aprobación del super admin para liderar otra, un **aviso de confirmación** le recuerda que ya lidera una y le pregunta si quiere sumar otra. Hoy el POC guarda una sola tribu por líder: "Cambiar de tribu" en el Plan Tribu reemplaza la anterior. Es el paso que falta para que el Plan Tribu (USD 60/mes **por tribu**, nota 18 §4.2) se pueda mostrar con su modelo de ingresos real.

## What Changes

- **Varias tribus por líder.** Lo elegido en Sumarte guarda una **lista** de tribus lideradas en lugar de una sola. Lo ya guardado con una sola tribu se lee como una lista de una.
- **Plan Tribu en Sumarte**, para quien ya lidera:
  - lista las tribus que lidera, cada una con **"Dejar de liderar"**;
  - suma el botón **"Sumar otra tribu"**, que abre el mismo selector de hoy sin las tribus que ya lidera;
  - al confirmar, aparece un **diálogo de confirmación**: "Ya sos líder de Valle Solar. ¿Querés sumar también Taller Común? Vas a administrar las dos." con **"Sí, sumar Taller Común"** y **"Cancelar"**, y la aclaración "Simulado: en la versión real lo aprueba el super admin";
  - el precio del Plan Tribu dice que es **por tribu** y muestra el total mensual (cantidad de tribus × precio de ejemplo).
- **Dejar de liderar la última tribu** deja a la persona como Miembro (conserva el Pase si lo tiene). Cambiar a Miembro o a Explorador desde Sumarte deja de liderar todas, como hoy.
- **Marca "Admin de …"**: aparece en la página de **cada** tribu que la persona lidera, y el menú del avatar las lista todas.
- **"Proponer una tribu nueva"** sigue disponible, pero solo puede haber **una** tribu nueva pendiente a la vez.
- La tribu asignada por `LH_PERSONAS` (rol `admin-tribu`) sigue siendo un piso: entra en la lista y no se puede dejar desde Sumarte.

**Fuera de alcance:**
- La aprobación real del super admin (va con `aprobaciones-admin`, después de `base-neon` y de la decisión R28).
- Guardar la lista en la base: `base-neon` hoy prevé una sola "tribu que administra"; cuando se implemente `datos-en-la-nube` tiene que pasar a lista (queda anotado en el design).
- Cobros reales, facturación o descuentos por liderar varias tribus.
- Cambiar qué puede hacer un líder dentro de su tribu (sigue igual que hoy).

## Capabilities

### New Capabilities
- `liderar-varias-tribus`: una persona con el Plan Tribu puede liderar más de una tribu, con confirmación al sumar otra.

### Modified Capabilities

## Impact

`lib/sumarte/estado.ts` (lista de tribus, lectura de lo guardado con el formato anterior), `lib/sesion/nivel.ts` y el contexto de sesión (`tribusLider` en lugar de `tribuLider`), `app/sumarte/sumarte-cliente.tsx` (lista, "Sumar otra tribu", diálogo, precio por tribu), `components/sesion/marca-admin.tsx`, `components/menu-persona.tsx`, tests de Vitest y e2e de Sumarte. Si `pase-fundador-gobernanza` ya está en `main`, el nivel Fundador no cambia: liderar sigue siendo el escalón Líder.
