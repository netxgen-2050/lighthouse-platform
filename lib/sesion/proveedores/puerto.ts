import type { IdentidadExterna, ProveedorLogin } from "../identidad";

/**
 * Qué encontró un proveedor de login en el pedido: su identidad, `null` si el pedido no trae nada de este proveedor, o
 * `"invalida"` si trae algo pero no se pudo verificar (token vencido, Neon Auth caído o con otra forma).
 */
export type ResultadoProveedor = IdentidadExterna | null | "invalida";

/** Puerto de ADR-009 (antes `ClientePrivy`): cada proveedor traduce el pedido a la identidad de `base-neon`. */
export type ClienteIdentidad = {
  proveedor: ProveedorLogin;
  identidad(req: Request): Promise<ResultadoProveedor>;
};
