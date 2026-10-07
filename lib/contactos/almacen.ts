import { CLAVES } from "@/lib/demo/claves";
import { agregar, leerBandeja } from "./pedidos";
import type { Pedido } from "./tipos";

/** Lee la bandeja del navegador. Sin almacenamiento o con datos dañados devuelve una lista vacía. */
export function leerBandejaDelNavegador(): Pedido[] {
  try {
    return leerBandeja(window.localStorage.getItem(CLAVES.contactos));
  } catch {
    return [];
  }
}

/** Guarda un pedido en la bandeja del navegador. Devuelve false si el navegador no deja guardar. */
export function guardarPedido(pedido: Pedido): boolean {
  try {
    const nueva = agregar(leerBandejaDelNavegador(), pedido);
    window.localStorage.setItem(CLAVES.contactos, JSON.stringify(nueva));
    return true;
  } catch {
    return false;
  }
}
