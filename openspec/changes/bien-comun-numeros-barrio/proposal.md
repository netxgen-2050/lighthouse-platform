# Proposal

## Why

La propuesta v0.1 (`NS_Tokenomics` doc 34 §4) se apoya en un modelo de un barrio: 21 lotes a USD 27.500, unos USD 317.000 de infraestructura que traería el Token Inversor, un margen fino, una recompra a fecha fija que no cierra con lotes en cuotas, y un cobro a medida que entran las cuotas que sí cierra pero tarda (48 meses en el caso base). Lo común no vive solo de los lotes. Gus quiere que el equipo pueda mover esos números en `/bien-comun` y ver el efecto (pedido del 23-nov, punto "Los números del barrio").

Es el segundo de los cuatro cambios del pedido; depende de `bien-comun-propuesta`.

## What Changes

- **Sección "Los números del barrio" en `/bien-comun`**, con una calculadora simple y accesible. Valores de partida del doc 34 y de `sim/barrio_stack_sim.py` v0.1, editables: precio del lote, lotes vendidos por trimestre, cantidad de cuotas, infraestructura por lote y prima anual del inversor. Muestra:
  - cuánta plata tiene que traer el Token Inversor;
  - en qué mes se le termina de devolver al inversor si cobra a medida que entran las cuotas, y cuánto recibe en total (o "no en 6 años");
  - qué parte de lo que debe tendría el fideicomiso si se hubiera prometido devolver a los 12 meses (por qué no hay fecha fija);
  - cuánto le llega al común cada año durante 6 años (parte de cada pago + expensas) y qué parte del presupuesto anual del común cubre.
  - Nada se guarda: al recargar vuelven los valores de partida.
- **Parámetros del barrio** en `lib/bien-comun/modelo.ts` (el módulo del cambio 1), cada uno con su fuente. Los que ya están en `lib/lotes/modelo.ts` (precio del lote, infraestructura, parte del dueño, parte para el común, expensa, presupuesto del común) se importan de ahí.
- **Cálculo puro en `lib/bien-comun/barrio.ts`**, una traducción fiel de `barrio_stack_sim.py` v0.1, con tests que reproducen `RESULTS_barrio_stack.md`.

## Fuera de alcance

- Guardar escenarios, compartirlos por URL o exportarlos.
- Los costos de Vagner (todavía no están en el modelo: se dice "sin dato").
- Las casas: cada familia paga la suya; el modelo cuenta solo lotes.
- El Token Inversor en `/netx/financiamiento` (cambio 4, que reutiliza este cálculo).
- Editar `NS_Tokenomics` o el simulador en Python.
- Cualquier cobro, oferta o reserva.

## Capabilities

### New Capabilities
- `bien-comun-numeros-barrio`: la calculadora del barrio de la propuesta v0.1.

### Modified Capabilities
- Ninguna (suma una sección a la página de `bien-comun-propuesta`).

## Impact

- **Nuevo:** `lib/bien-comun/barrio.ts` y su test, `components/bien-comun/calculadora-barrio.tsx` (cliente), textos `barrio` en `lib/idioma/textos/bien-comun.ts`.
- **Cambia:** `lib/bien-comun/modelo.ts` (parámetros del barrio), `app/bien-comun/page.tsx` (una sección), `lib/lotes/sin-numeros-escritos.test.ts` (números nuevos vigilados), `e2e/bien-comun.spec.ts`.
- **Sin** tablas, migraciones, permisos, integraciones ni dependencias nuevas.
