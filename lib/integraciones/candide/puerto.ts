import type { LlavePublica } from "@/lib/billetera-prueba/passkey";
import type { OperacionJson } from "@/lib/billetera-prueba/operacion";
import type { Hex } from "viem";
import type { Cuenta, EstadoOperacion, FirmaFueraPreparada, FirmaWebAuthn, OperacionPreparada, Veredicto1271 } from "./tipos";

/** Lo que la prueba necesita de Candide y de la red, y nada más. Las pantallas y rutas piden esto vía `index.ts`. */
export interface PuertoCandide {
  /** `sin-configurar` si falta la URL del bundler o la del paymaster (en el mock, siempre `listo`). */
  estado(): "listo" | "sin-configurar";
  /** Sin red ni gas: CREATE2. */
  calcularDireccion(llave: LlavePublica): Hex;
  /** `eth_getCode` de la Safe. */
  estaDesplegada(direccion: Hex): Promise<boolean>;
  /** ¿Está registrado el schema de prueba en el registro de EAS? */
  schemaRegistrado(): Promise<boolean>;
  /** Arma la operación (despliegue + attest, con register antes si falta), la patrocina y valida la política. */
  prepararPrimeraOperacion(llave: LlavePublica): Promise<OperacionPreparada>;
  /** Arma la firma de la Safe, vuelve a validar la política y manda la operación al bundler. */
  enviarOperacion(llave: LlavePublica, operacion: OperacionJson, firma: FirmaWebAuthn): Promise<{ hashOperacion: Hex }>;
  consultarOperacion(hashOperacion: Hex): Promise<EstadoOperacion>;
  /** Paso 5: arma la constancia fuera de la cadena y el hash que firma la passkey. Exige la Safe desplegada. */
  prepararFirmaFuera(llave: LlavePublica): Promise<FirmaFueraPreparada>;
  /** Paso 5: le pregunta a la Safe `isValidSignature` con la firma de la passkey. */
  verificarFirma1271(llave: LlavePublica, tiempo: bigint, firma: FirmaWebAuthn): Promise<Veredicto1271>;
}
