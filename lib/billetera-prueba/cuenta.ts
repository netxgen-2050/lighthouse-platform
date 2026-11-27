import { createCallData, SafeAccountV0_3_0 } from "abstractionkit";
import type { Hex } from "viem";
import type { LlavePublica } from "./passkey";
import type { Extra } from "./politica";

/**
 * Cálculos de la Safe que no necesitan red (CREATE2 y las llamadas que `abstractionkit` antepone en la primera operación).
 * Solo del servidor. Los usan el adaptador real, el mock y las rutas, para que los tres vean la misma cuenta.
 */

const CLASE = SafeAccountV0_3_0;
// `swapOwner(address prevOwner, address oldOwner, address newOwner)` de Safe: lo que `abstractionkit` usa para cambiar el firmante
// compartido (el dueño durante el despliegue) por el verificador WebAuthn de esta passkey.
const SELECTOR_SWAP_OWNER = "0xe318b52b";
const CENTINELA = "0x0000000000000000000000000000000000000001";

/** Dirección de la Safe de una passkey (sin red, sin gas). */
export function direccionDeSafe(l: LlavePublica): Hex {
  return CLASE.createAccountAddress([{ x: l.x, y: l.y }]) as Hex;
}

/** Dirección del verificador WebAuthn (proxy determinístico) que pasa a ser la dueña de la Safe después de la primera operación. */
export function verificadorDe(l: LlavePublica): Hex {
  return CLASE.createWebAuthnSignerVerifierAddress(l.x, l.y, {
    eip7212WebAuthnPrecompileVerifier: CLASE.DEFAULT_WEB_AUTHN_PRECOMPILE,
    eip7212WebAuthnContractVerifier: CLASE.DEFAULT_WEB_AUTHN_CONTRACT_VERIFIER,
    webAuthnSignerFactory: CLASE.DEFAULT_WEB_AUTHN_SIGNER_FACTORY,
    webAuthnSignerSingleton: CLASE.DEFAULT_WEB_AUTHN_SIGNER_SINGLETON,
    webAuthnSignerProxyCreationCode: CLASE.DEFAULT_WEB_AUTHN_SIGNER_PROXY_CREATION_CODE,
  }) as Hex;
}

/** Las dos llamadas que `abstractionkit` pone antes de las nuestras cuando la Safe todavía no existe. */
export function extrasPrimeraOperacion(l: LlavePublica): Extra[] {
  const safe = direccionDeSafe(l);
  const desplegar = CLASE.createDeployWebAuthnVerifierMetaTransaction(l.x, l.y, {
    eip7212WebAuthnPrecompileVerifier: CLASE.DEFAULT_WEB_AUTHN_PRECOMPILE,
    eip7212WebAuthnContractVerifier: CLASE.DEFAULT_WEB_AUTHN_CONTRACT_VERIFIER,
    webAuthnSignerFactory: CLASE.DEFAULT_WEB_AUTHN_SIGNER_FACTORY,
  });
  const cambiarDueno = createCallData(SELECTOR_SWAP_OWNER, ["address", "address", "address"], [
    CENTINELA,
    CLASE.DEFAULT_WEB_AUTHN_SHARED_SIGNER,
    verificadorDe(l),
  ]);
  return [
    { to: desplegar.to, data: desplegar.data },
    { to: safe, data: cambiarDueno },
  ];
}

export const SAFE_V0_3_0 = {
  entryPoint: CLASE.DEFAULT_ENTRYPOINT_ADDRESS as Hex,
  modulo4337: CLASE.DEFAULT_SAFE_4337_MODULE_ADDRESS as Hex,
};
