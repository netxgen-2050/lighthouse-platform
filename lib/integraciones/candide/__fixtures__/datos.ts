import { aBase64Url, llaveDeSpki } from "@/lib/billetera-prueba/passkey";
import type { FirmaWebAuthn } from "../tipos";

/** Passkey y firma de ejemplo para tests (vector fijo; ver `lib/billetera-prueba/passkey.test.ts`). Sin valor. */
const SPKI = "3059301306072a8648ce3d020106082a8648ce3d03010703420004f4e20f0719c321dd7cd9531c62c4d10a10a9fc87c31637341841b9efa97cc9ba12de54db4e9a67f0f1161276458ad3d17287e8554b3b10f7b1a1cc9a6ab2129d";
const DER = "3045022100f4ac4d9d47d45c5107ede15cd13feaf546b35b2c8339a7dc2d0b46b50227d34d0220036262dfc6a908a72f12be30717cbf390f38a027445fbf56bed2b751609ac8b7";

const deHex = (h: string) => Uint8Array.from(Buffer.from(h, "hex"));

export const LLAVE_DE_PRUEBA = llaveDeSpki(deHex(SPKI));

export const FIRMA_DE_PRUEBA: FirmaWebAuthn = {
  authenticatorData: aBase64Url(new Uint8Array(37).fill(1)),
  clientDataJSON: aBase64Url(
    new TextEncoder().encode('{"type":"webauthn.get","challenge":"dGVzdA","origin":"https://x.test","crossOrigin":false}'),
  ),
  signature: aBase64Url(deHex(DER)),
};
