import { operacionDeJson, type OperacionJson } from "@/lib/billetera-prueba/operacion";
import { firmaDeCuerpo, rutaDeLaPrueba } from "@/lib/billetera-prueba/ruta";
import { ErrorDeCandide } from "@/lib/integraciones/candide";

export const dynamic = "force-dynamic";

/**
 * Paso 3 (parte 2): recibe la operación firmada. El navegador no elige destino ni datos: el servidor vuelve a validar la política
 * y que el remitente sea la Safe de esta passkey (adentro del puerto) antes de mandar nada al bundler.
 */
export async function POST(req: Request) {
  return rutaDeLaPrueba(req, { metodo: "POST", conLlave: true }, async ({ puerto, llave, cuerpo }) => {
    const firma = firmaDeCuerpo(cuerpo.firma);
    if (!operacionDeJson(cuerpo.operacion) || !firma) throw new ErrorDeCandide("Operación o firma inválidas.", "entrada");
    const { hashOperacion } = await puerto.enviarOperacion(llave!, cuerpo.operacion as OperacionJson, firma);
    return { hashOperacion };
  });
}
