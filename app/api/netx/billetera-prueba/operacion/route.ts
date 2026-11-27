import { rutaDeLaPrueba } from "@/lib/billetera-prueba/ruta";
import { ErrorDeCandide } from "@/lib/integraciones/candide";

export const dynamic = "force-dynamic";

/** Paso 4: el estado de la operación (enviada, incluida o fallo) a partir del recibo del bundler. */
export async function GET(req: Request) {
  return rutaDeLaPrueba(req, { metodo: "GET", conLlave: false }, async ({ puerto, url }) => {
    const hash = url.searchParams.get("hash") ?? "";
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) throw new ErrorDeCandide("Hash de operación inválido.", "entrada");
    return { ...(await puerto.consultarOperacion(hash as `0x${string}`)) };
  });
}
