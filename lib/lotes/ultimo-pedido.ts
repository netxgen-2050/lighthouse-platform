/**
 * Orden de pedidos superpuestos: cada pedido toma un número y solo el más reciente puede aplicar su respuesta, para que un GET
 * viejo que tarda más no pise lo nuevo.
 */
export type OrdenDePedidos = { nuevo: () => number; esElUltimo: (n: number) => boolean };

export function crearOrdenDePedidos(): OrdenDePedidos {
  let ultimo = 0;
  return {
    nuevo: () => ++ultimo,
    esElUltimo: (n) => n === ultimo,
  };
}
