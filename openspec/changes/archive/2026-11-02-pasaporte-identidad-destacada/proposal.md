# Proposal

## Why

Gus lo reportó con el botón de bugs (**issue #59**, 13-oct, en `/pasaporte`): "la identidad verificada tiene poco protagonismo; me gustaría algo más explícito de completar mi KYC". Hoy la verificación es **un sello más** en una grilla de diez, en el medio, y el botón "Verificar mi identidad" se pierde. Es el paso que el fiduciario pide antes de que alguien aporte plata (nota 03, C5), y el backlog **B5** ("Pasaporte como KYC a pedido") ya marca que no se exige al entrar pero tiene que estar a mano cuando la persona quiere invertir.

## What Changes

- **Tarjeta "Verificá tu identidad (KYC)"** arriba de todo en `/pasaporte`, antes de "Tus sellos", con el ⚖ `kyc` que ya existe:
  - un **indicador de tres pasos escrito** (Sin empezar → En trámite → Verificada), con el paso actual marcado con texto y forma, no solo con color;
  - **para qué sirve**, en una línea: "Lo pide el fiduciario antes de que aportes plata: para pedir la invitación al proyecto del Lote 7 o registrar un aporte en plata en Pactos";
  - **qué no requiere**: "No hace falta para recorrer, sumarte a una tribu ni proponer pactos de tiempo";
  - **qué se te va a pedir**: los cinco pasos del trámite que ya existen (datos personales, residencia fiscal y nacionalidad, origen de los fondos, tipo de inversor, revisión);
  - el botón principal **"Completar mi verificación (KYC)"**, que abre el diálogo de verificación de hoy.
- **Según el estado:**
  - En trámite: "Enviaste tus datos el <fecha>" y "Simular: verificación aprobada".
  - Verificada: la tarjeta se achica a una línea "Identidad verificada el <fecha> (simulado)" y dice si quedó habilitado como inversor o, si la residencia fiscal es del exterior, que por ahora no (con el ⚖ `inversorexterior` que ya existe).
- **Enlace directo:** `/pasaporte#identidad` lleva a la tarjeta y le pone el foco, para poder enlazarla desde otras pantallas.
- El sello "Identidad verificada" sigue en la grilla, sin su botón (la acción vive en la tarjeta) y con un enlace "Ver la verificación" que lleva a la tarjeta.

**Fuera de alcance:**
- KYC real con un proveedor o el fiduciario (sigue simulado y en el navegador).
- Pedir la verificación en otros lugares (Mi recorrido, el rail, la barra superior): depende de B5 ("qué acciones lo disparan"), queda como pregunta.
- Cambiar los pasos o los datos que pide el diálogo de verificación.
- Textos legales nuevos: se usan `kyc` e `inversorexterior`, que ya están en el catálogo.

## Capabilities

### New Capabilities
- `pasaporte-identidad-destacada`: la verificación de identidad como tarjeta principal del Pasaporte, con su estado y para qué sirve.

### Modified Capabilities

## Impact

`app/pasaporte/pasaporte-cliente.tsx` (tarjeta nueva, sello sin botón, enlace a la tarjeta), quizás un componente `app/pasaporte/tarjeta-identidad.tsx`, `lib/pasaporte/sellos.ts` (la acción del sello de identidad pasa a ser un enlace a `#identidad`), tests de Vitest de sellos y `e2e/pasaporte.spec.ts`. Cierra el issue #59.
