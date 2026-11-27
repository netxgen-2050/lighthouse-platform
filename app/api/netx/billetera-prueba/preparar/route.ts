import { rutaDeLaPrueba } from "@/lib/billetera-prueba/ruta";

export const dynamic = "force-dynamic";

/** Paso 3 (parte 1): arma la operación con gas patrocinado, valida la política y devuelve el hash que firma la passkey. */
export async function POST(req: Request) {
  return rutaDeLaPrueba(req, { metodo: "POST", conLlave: true }, async ({ puerto, llave }) => {
    const { operacion, hashAFirmar } = await puerto.prepararPrimeraOperacion(llave!);
    return { operacion, hashAFirmar };
  });
}
