import { SafeAccountV0_3_0 } from "abstractionkit";
import { describe, expect, it } from "vitest";
import { direccionDeSafe } from "./cuenta";
import { llamadaAttest, llamadaRegister } from "./eas";
import { llaveDeSpki } from "./passkey";
import { BASE_SEPOLIA as RED } from "./red";
import { validarOperacion } from "./validar-operacion";

const SPKI = "3059301306072a8648ce3d020106082a8648ce3d03010703420004f4e20f0719c321dd7cd9531c62c4d10a10a9fc87c31637341841b9efa97cc9ba12de54db4e9a67f0f1161276458ad3d17287e8554b3b10f7b1a1cc9a6ab2129d";
const LLAVE = llaveDeSpki(Uint8Array.from(Buffer.from(SPKI, "hex")));
const SAFE = direccionDeSafe(LLAVE);

async function callDataPrimeraOperacion(): Promise<string> {
  const cuenta = SafeAccountV0_3_0.initializeNewAccount([{ x: LLAVE.x, y: LLAVE.y }]);
  const op = await cuenta.createUserOperation(
    [
      { to: RED.registro, value: 0n, data: llamadaRegister() },
      { to: RED.eas, value: 0n, data: llamadaAttest(SAFE, 1_700_000_000n) },
    ],
    undefined,
    undefined,
    { nonce: 0n, maxFeePerGas: 1n, maxPriorityFeePerGas: 1n, callGasLimit: 1n, verificationGasLimit: 1n, preVerificationGas: 1n },
  );
  return op.callData;
}

describe("validarOperacion", () => {
  it("la primera operación (con las dos llamadas extras) pasa con nonce 0", async () => {
    const callData = await callDataPrimeraOperacion();
    expect(validarOperacion(LLAVE, { sender: SAFE, callData, nonce: 0n }, RED).ok).toBe(true);
  });

  it("las dos llamadas extras se rechazan con nonce distinto de 0", async () => {
    const callData = await callDataPrimeraOperacion();
    for (const nonce of [1n, 2n ** 64n]) {
      const r = validarOperacion(LLAVE, { sender: SAFE, callData, nonce }, RED);
      expect(r).toMatchObject({ ok: false, tipo: "politica" });
    }
  });

  it("un remitente que no es la Safe de la passkey se rechaza como sender", async () => {
    const callData = await callDataPrimeraOperacion();
    const r = validarOperacion(LLAVE, { sender: "0x2222222222222222222222222222222222222222", callData, nonce: 0n }, RED);
    expect(r).toMatchObject({ ok: false, tipo: "sender" });
  });
});
