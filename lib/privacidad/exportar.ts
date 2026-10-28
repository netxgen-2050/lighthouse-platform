import { NOMBRES_BASE } from "@/lib/demo/claves";
import { constanciasDe, leerDelNavegador } from "@/lib/pactos/registro-compartido";
import { NOMBRE_CLAVE_CONSENTIMIENTO, VERSION_POLITICA } from "./consentimiento";

export type AlmacenLectura = Pick<Storage, "getItem">;

function leerValor(almacen: AlmacenLectura, clave: string): unknown {
  let crudo: string | null = null;
  try {
    crudo = almacen.getItem(clave);
  } catch {
    return null;
  }
  if (crudo === null) return null;
  try {
    return JSON.parse(crudo) as unknown;
  } catch {
    // Un valor que no es JSON se entrega tal cual.
    return crudo;
  }
}

/**
 * Todo lo que el prototipo guarda de UNA persona (sus claves con su prefijo `u:<id>:`), listo para descargar como JSON.
 * Lo que falta sale como `null` ("sin dato"), nunca como vacío ni cero. No toca las claves de otra persona.
 */
export function exportarMisDatos(entrada: {
  almacen: AlmacenLectura;
  idPersona: string;
  email: string | null;
  billetera: string | null;
  ahora?: Date;
}): Record<string, unknown> {
  const { almacen, idPersona } = entrada;
  const prefijo = `u:${idPersona}:`;
  const datos: Record<string, unknown> = {};
  for (const [nombre, base] of Object.entries(NOMBRES_BASE)) datos[nombre] = leerValor(almacen, prefijo + base);
  datos.consentimiento = leerValor(almacen, prefijo + NOMBRE_CLAVE_CONSENTIMIENTO);
  // Las constancias viven en un registro compartido: solo se incluyen las de los pactos de esta persona (null = no se pudo leer).
  const registro = leerDelNavegador(almacen);
  datos.pactosConstancias = registro === null ? null : constanciasDe(registro, idPersona);
  return {
    exportadoEn: (entrada.ahora ?? new Date()).toISOString(),
    versionPolitica: VERSION_POLITICA,
    aviso: "Prototipo interno: datos de ejemplo guardados en este navegador. Un valor null significa sin dato.",
    persona: { email: entrada.email, billetera: entrada.billetera },
    datos,
  };
}

/** Nombre del archivo descargado: sin caracteres raros, con la fecha. */
export function nombreArchivoDatos(ahora: Date = new Date()): string {
  return `mis-datos-lighthouse-${ahora.toISOString().slice(0, 10)}.json`;
}
