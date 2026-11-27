# Design

Estilo según `ux-base`; caminos como en `ux-inicio`. Referencia: páginas de planes de Linear y Vercel (un control para elegir, un plan claro a la vez en el celular).

## 1. Orden

1. Título "Elegí cómo sumarte" y la bajada actual.
2. Tres caminos (vivir → "Comprar un lote"; invertir → "Invertir"; cuidar el bien común → planes).
3. Planes: selector y plan elegido.
4. Qué incluye cada plan (tabla en compu, lista en el celular).
5. Tarjetas de destino: Comprar un lote, Invertir, En NetX como empresa.
6. Modo de prueba (solo si está activo), plegado.

## 2. Selector de planes

- `role="radiogroup"` con cuatro `radio` visibles como segmentos (Explorador, Miembro, Fundador, Comunidad); flechas del teclado cambian de plan. En el celular el control puede desplazarse de costado si no entra, con el elegido siempre a la vista.
- El plan elegido se refleja en la URL (`?plan=miembro`); por defecto, el que la persona ya tiene o Miembro.
- Plan: nombre (Fraunces), precio en mono con su período, "Para quién es", lista de hasta 6 beneficios, la acción del plan (la que ya existe en `sumarte-cliente.tsx`, con su lógica intacta) y las notas legales del plan con su ⚖.
- El selector Mensual / Anual se queda dentro del plan Miembro, como hoy.

## 3. Comparación

- ≥ 768 px: la tabla actual con el encabezado de columnas `sticky` y la columna del plan elegido resaltada (fondo `surface-2` y encabezado en negrita).
- < 768 px: no se muestra la tabla; dentro del plan elegido, "Qué incluye y qué no" con ✓ / — y el texto (nunca solo el símbolo).

## 4. Modo de prueba

`details` al final, cerrado por defecto, con el título "Modo de prueba" y el panel "Entrar como…" adentro. Solo se renderiza si `/api/sesion/prueba` dice `activo: true`, como hoy. Los e2e que usan "Entrar como…" abren el `details` primero.

## 5. Accesibilidad

axe sin violaciones con cada plan elegido, claro y oscuro, a 390 y 1440 px. A 390 px la página no tiene scroll horizontal.
