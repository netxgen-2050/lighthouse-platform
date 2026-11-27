import { firmaDeCuerpo, rutaDeLaPrueba } from "@/lib/billetera-prueba/ruta";
import { ErrorDeCandide } from "@/lib/integraciones/candide";

export const dynamic = "force-dynamic";

/** Paso 5 (parte 2): le pregunta a la Safe `isValidSignature` (EIP-1271) con la firma de la passkey. 409 si no está desplegada. */
export async function POST(req: Request) {
  return rutaDeLaPrueba(req, { metodo: "POST", conLlave: true }, async ({ puerto, llave, cuerpo }) => {
    const firma = firmaDeCuerpo(cuerpo.firma);
    const tiempo = cuerpo.tiempo;
    if (!firma || typeof tiempo !== "string" || !/^[0-9]{1,12}$/.test(tiempo)) throw new ErrorDeCandide("Firma o tiempo inválidos.", "entrada");
    return { veredicto: await puerto.verificarFirma1271(llave!, BigInt(tiempo), firma) };
  });
}
