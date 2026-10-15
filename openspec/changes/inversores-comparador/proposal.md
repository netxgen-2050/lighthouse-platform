# Proposal

## Why

La sección "Para inversores" de `/sumarte` muestra dos tarjetas sueltas (el círculo del Lote 7 y el SAFE) y el Pase Fundador vive más arriba, entre los planes. Quien llega a invertir (Lucía, el "inversor financiero puro" de la nota 15) no puede ver **en un solo lugar** las formas de poner plata, qué recibe con cada una y a quién va esa plata. Es la **US-10 de la nota 15** ("Simulador de plantillas de participación", prioridad M, nunca especificada) actualizada con el modelo de la **nota 18 §4.4**: dos puertas separadas, el **Pase Fundador** para quien busca uso y el **SAFE** para quien busca retorno, más el **círculo del fideicomiso** por invitación. Ningún producto promete las dos cosas, y el comparador lo tiene que dejar a la vista. En la fase de prototipo interno la plataforma tiene que mostrar que va a servir para captar plata de inversores: este comparador es la pieza que lo explica.

## What Changes

- **Tabla "Compará cómo participar"** al principio de "Para inversores" en `/sumarte#inversores`, con tres columnas: **Pase Fundador**, **Proyecto del Lote 7 (círculo por invitación)** e **Invertir en NetX (SAFE)**. Filas, en lenguaje llano: qué es; qué recibís; qué no recibís; a quién va la plata; cómo salir; riesgos principales; estado. Cada columna lleva el ⚖ que ya existe (`pasefundador`, `circulo`/`sumarte`, `safe`) y la fila "a quién va la plata" usa `guardian` y `caja`.
- **Monto ilustrativo:** un campo numérico en USD (con un deslizador opcional asociado al mismo valor) que recalcula, solo como ejemplo:
  - Pase Fundador: el nivel más alto que alcanza ese monto (Semilla, Brote o Raíz) y sus créditos, con los precios y créditos de ejemplo que ya existen; si no alcanza para Semilla, lo dice.
  - Lote 7: qué porción de la emisión de ejemplo representaría ese monto, en porcentaje con un decimal, y el aviso de que el aporte va a la caja del fiduciario.
  - SAFE: **ninguna cifra**. Dice que las condiciones (valuación, tope, descuento) se ven en la charla privada y ofrece el botón "Pedir una charla" que ya existe.
- **Un ⚖ nuevo en borrador**, `ilustrativo`: explica que los cálculos son ejemplos, no una oferta ni una promesa de rendimiento. Va en `lib/legal/terminos.ts` con `borrador: true`.
- Las dos tarjetas actuales (círculo y SAFE) quedan debajo de la tabla, sin cambios de comportamiento.

**Fuera de alcance:**
- Proyecciones de rendimiento o retorno para cualquiera de las tres puertas (la plantilla de Vagner no está; el SAFE no se ofrece públicamente).
- Personalizar la tabla según la persona (residencia fiscal, KYC, permanencia): la elegibilidad sigue como hoy, en la tarjeta del círculo.
- Pase en cuotas, tiempo compartido tipo TDF y "crédito sobre la licencia o el canon" (nota 18 §7, punto 3, sin decidir).
- Pagar, reservar o dejar un monto registrado: el monto ilustrativo no se guarda en ningún lado.
- Cambios en la tabla "Qué incluye cada plan" ni en las tarjetas de planes.

## Capabilities

### New Capabilities
- `inversores-comparador`: comparación lado a lado de las tres formas de poner plata (Pase Fundador, círculo del Lote 7 y SAFE) con un monto ilustrativo que no se guarda.

### Modified Capabilities

## Impact

`app/sumarte/sumarte-cliente.tsx` (sección "Para inversores"), un componente nuevo `app/sumarte/comparador-inversion.tsx`, una función pura en `lib/sumarte/` (nivel alcanzado y porción de la emisión) con tests de Vitest, un término nuevo en `lib/legal/terminos.ts` (y su test), y `e2e/sumarte.spec.ts`. Sin dependencias npm nuevas. No toca datos personales, tablas, permisos ni pagos: el monto vive solo en el estado del componente.
