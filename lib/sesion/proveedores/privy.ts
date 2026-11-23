import { PrivyClient } from "@privy-io/server-auth";
import { normalizarEmail } from "../personas";
import type { ClienteIdentidad } from "./puerto";

/** Lo mínimo que usamos del cliente de Privy en el servidor (se simula en los tests). */
export type ClientePrivy = {
  verifyAuthToken(token: string): Promise<{ userId: string }>;
  getUser(userId: string): Promise<{
    id: string;
    email?: { address: string } | null;
    google?: { email: string } | null;
  }>;
};
// `verificar.ts` importa este archivo (y por él el SDK de Privy, que ya se importaba en `servidor.ts`).

/** Privy: token `Bearer` verificado con el secreto de la app. Sin token no hay nada de este proveedor (`null`). */
export function adaptadorPrivy(crearCliente: () => ClientePrivy | null): ClienteIdentidad {
  return {
    proveedor: "privy",
    async identidad(req) {
      const token = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization") ?? "")?.[1]?.trim();
      if (!token) return null;
      const cliente = crearCliente();
      if (!cliente) return "invalida";
      try {
        const claims = await cliente.verifyAuthToken(token);
        const usuario = await cliente.getUser(claims.userId);
        // Privy verifica el email con un código o con Google: los dos caminos cuentan como verificados.
        const email = usuario.email?.address ?? usuario.google?.email ?? null;
        return {
          proveedor: "privy",
          idExterno: usuario.id,
          email: email ? normalizarEmail(email) : null,
          emailVerificado: email !== null,
        };
      } catch {
        return "invalida";
      }
    },
  };
}

export function crearClientePrivy(env: Record<string, string | undefined> = process.env): ClientePrivy | null {
  const appId = env.NEXT_PUBLIC_PRIVY_APP_ID;
  const secreto = env.PRIVY_APP_SECRET;
  return appId && secreto ? new PrivyClient(appId, secreto) : null;
}
