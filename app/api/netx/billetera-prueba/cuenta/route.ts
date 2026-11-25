import { rutaDeLaPrueba } from "@/lib/billetera-prueba/ruta";

export const dynamic = "force-dynamic";

/** Paso 2: la dirección de la Safe de esta passkey (sin red ni gas) y si ya está desplegada. */
export async function POST(req: Request) {
  return rutaDeLaPrueba(req, { metodo: "POST", conLlave: true }, async ({ puerto, llave }) => {
    const direccion = puerto.calcularDireccion(llave!);
    return { direccion, desplegada: await puerto.estaDesplegada(direccion), configurado: puerto.estado() === "listo" };
  });
}
