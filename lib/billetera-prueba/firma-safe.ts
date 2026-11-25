import { SafeAccountV0_3_0, webauthnSignatureFromAssertion } from "abstractionkit";
import { desdeBase64Url, ErrorDePasskey, type LlavePublica } from "./passkey";

/** La firma de la passkey como la manda el navegador (base64url). */
export type FirmaCruda = { authenticatorData: string; clientDataJSON: string; signature: string };

function datosWebAuthn(f: FirmaCruda) {
  try {
    return webauthnSignatureFromAssertion({
      authenticatorData: desdeBase64Url(f.authenticatorData),
      clientDataJSON: new TextDecoder().decode(desdeBase64Url(f.clientDataJSON)),
      signature: desdeBase64Url(f.signature),
    });
  } catch (e) {
    throw new ErrorDePasskey(e instanceof Error ? e.message : "Firma ilegible.");
  }
}

/**
 * Firma de una UserOperation de la Safe: la de WebAuthn en el formato del módulo 4337. Con `primera` (nonce 0) el dueño que ve la
 * Safe es el firmante compartido; después, el verificador de la passkey.
 */
export function firmaDeOperacion(llave: LlavePublica, f: FirmaCruda, primera: boolean): string {
  const webauthn = SafeAccountV0_3_0.createWebAuthnSignature(datosWebAuthn(f));
  return SafeAccountV0_3_0.formatSignaturesToUseroperationSignature(
    [{ signer: { x: llave.x, y: llave.y }, signature: webauthn, isContractSignature: true }],
    { isInit: primera },
  );
}

/** Firma para `isValidSignature` de la Safe ya desplegada (sin la ventana de validez de las UserOperations). */
export function firmaParaEip1271(llave: LlavePublica, f: FirmaCruda): string {
  const webauthn = SafeAccountV0_3_0.createWebAuthnSignature(datosWebAuthn(f));
  return SafeAccountV0_3_0.buildSignaturesFromSingerSignaturePairs(
    [{ signer: { x: llave.x, y: llave.y }, signature: webauthn, isContractSignature: true }],
    { isInit: false },
  );
}
