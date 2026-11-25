import { rutaDeLaPrueba } from "@/lib/billetera-prueba/ruta";

export const dynamic = "force-dynamic";

/** Paso 5 (parte 1): arma la constancia de EAS fuera de la cadena y el hash que firma la passkey. 409 si la Safe no está desplegada. */
export async function POST(req: Request) {
  return rutaDeLaPrueba(req, { metodo: "POST", conLlave: true }, async ({ puerto, llave }) => ({
    ...(await puerto.prepararFirmaFuera(llave!)),
  }));
}
