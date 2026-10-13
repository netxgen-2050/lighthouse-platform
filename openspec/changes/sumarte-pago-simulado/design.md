# Design

## Reparto

`reparto(concepto, totalUsd)` devuelve una lista de partes `{ quien: "netx" | "guardian", etiqueta, montoUsd }` cuya suma es **exactamente** el total:

| Concepto | Partes |
|---|---|
| `membresia-mensual` (USD 10) / `membresia-anual` (USD 100) | NetX: total |
| `pase-semilla` / `pase-brote` / `pase-raiz` | NetX: `Math.round(total × TARIFA_SERVICIO_EJEMPLO)`; Guardián: total − tarifa |

`TARIFA_SERVICIO_EJEMPLO = 0.05` vive en `lib/sumarte/datos.ts` con el comentario "valor de ejemplo, a definir (nota 18 §7 punto 2)". Con los precios actuales: Semilla 300 → NetX 15 / Guardián 285; Brote 1.500 → 75 / 1.425; Raíz 5.000 → 250 / 4.750. La pantalla muestra junto a la tarifa el texto "tarifa de ejemplo". Si mañana se decide un monto fijo en lugar de un porcentaje, cambia solo esta función.

## Comprobante

```ts
type Comprobante = {
  id: string;           // crypto.randomUUID() o fecha + contador
  fecha: string;        // ISO
  concepto: Concepto;
  totalUsd: number;
  partes: Parte[];      // copia del reparto al momento de pagar
};
```

`lh-pagos` guarda un arreglo de comprobantes, el más nuevo primero. `leerPagos(crudo)` descarta entradas mal formadas una por una (no tira todo); JSON roto o no arreglo → lista vacía. El comprobante guarda el reparto calculado en ese momento, para que un cambio futuro de tarifa no reescriba pagos viejos.

## Flujo en la pantalla

- El resumen es una región dentro de la tarjeta del plan (no un modal), con encabezado "Resumen del pago (simulado)". Al abrirse recibe el foco; "Cancelar" lo cierra y devuelve el foco al botón que lo abrió.
- Con un resumen abierto, el selector Mensual/Anual y el nivel del pase siguen funcionando y el resumen se recalcula (lo que se confirma es lo que se ve).
- Confirmar despacha la acción existente del reducer (`plan: "miembro"` o `pase`), agrega el comprobante y deja el estado "(simulado)" que ya existe.
- "Volver a Explorador" no borra comprobantes: son historial.
- Ningún `input` de tarjeta, CVV, vencimiento ni CBU. Un test lo controla.

## Textos legales (borrador)

Dos claves nuevas en `lib/legal/terminos.ts`, con el comentario de siempre y `borrador: true`:

- `pagodividido`: "Pago dividido. La pasarela de pago reparte cada cobro en el momento: la parte del vendedor (acá, el Guardián del Fondo Común) va directo a su cuenta y la plataforma solo recibe su tarifa por el servicio. NetX no guarda ni administra la plata del Guardián."
- `arrepentimiento`: "Derecho de arrepentimiento. Si comprás a distancia, tenés 10 días corridos desde la compra para arrepentirte sin dar motivos y recuperar lo que pagaste (Ley 24.240 de Defensa del Consumidor, art. 34). En el prototipo no se cobra nada, así que no hay nada que devolver."

Los textos exactos los puede ajustar quien revise; lo obligatorio es que estén en el catálogo, con ⚖ y marcados como borrador.
