"use client";

import { createAuthClient } from "@neondatabase/auth/next";

type Cliente = ReturnType<typeof createAuthClient>;
let cliente: Cliente | null = null;

/**
 * Cliente del SDK de Neon Auth en el navegador (habla con nuestro `/api/auth`). Solo lo usan `formulario-login.tsx` y el
 * proveedor de sesión (para salir); hay un test de fuente que lo vigila.
 */
export function clienteNeonAuth(): Cliente {
  cliente ??= createAuthClient();
  return cliente;
}
