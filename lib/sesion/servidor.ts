import { PrivyClient } from "@privy-io/server-auth";
import { entornoDeSesion } from "./entorno";
import { parsearPersonas } from "./personas";
import { resolverSesion, type Resultado } from "./verificar";

/** Personas de `LH_PERSONAS`; las entradas mal formadas se avisan en el log del servidor. */
export function personasDelEntorno() {
  return parsearPersonas(process.env.LH_PERSONAS, (m) => console.warn(`[sesion] ${m}`));
}

function crearClientePrivy() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const secreto = process.env.PRIVY_APP_SECRET;
  return appId && secreto ? new PrivyClient(appId, secreto) : null;
}

/** Quién hace el pedido: token de Privy (o el modo de prueba fuera de producción) y la lista de acceso. */
export function sesionDelPedido(req: Request): Promise<Resultado> {
  return resolverSesion(
    { authorization: req.headers.get("authorization"), prueba: req.headers.get("x-lh-prueba") },
    personasDelEntorno(),
    entornoDeSesion(),
    crearClientePrivy,
  );
}
