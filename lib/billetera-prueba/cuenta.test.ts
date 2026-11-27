import { SafeAccountV0_3_0 } from "abstractionkit";
import { describe, expect, it } from "vitest";
import { direccionDeSafe, extrasPrimeraOperacion } from "./cuenta";
import { llamadaAttest, llamadaRegister } from "./eas";
import { llaveDeSpki } from "./passkey";
import { validarPolitica } from "./politica";
import { BASE_SEPOLIA as RED } from "./red";

const SPKI = "3059301306072a8648ce3d020106082a8648ce3d03010703420004f4e20f0719c321dd7cd9531c62c4d10a10a9fc87c31637341841b9efa97cc9ba12de54db4e9a67f0f1161276458ad3d17287e8554b3b10f7b1a1cc9a6ab2129d";
const LLAVE = llaveDeSpki(Uint8Array.from(Buffer.from(SPKI, "hex")));

describe("cuenta de la Safe", () => {
  it("misma passkey, misma dirección; otra passkey, otra dirección", () => {
    const a = direccionDeSafe(LLAVE);
    expect(a).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(direccionDeSafe({ ...LLAVE })).toBe(a);
    expect(direccionDeSafe({ x: LLAVE.x, y: LLAVE.y + 1n })).not.toBe(a);
  });

  it("las llamadas extras coinciden con las que arma abstractionkit en la primera operación", async () => {
    const safe = direccionDeSafe(LLAVE);
    const cuenta = SafeAccountV0_3_0.initializeNewAccount([{ x: LLAVE.x, y: LLAVE.y }]);
    expect(cuenta.accountAddress).toBe(safe);
    const operacion = await cuenta.createUserOperation(
      [
        { to: RED.registro, value: 0n, data: llamadaRegister() },
        { to: RED.eas, value: 0n, data: llamadaAttest(safe as `0x${string}`, 1_700_000_000n) },
      ],
      undefined,
      undefined,
      {
        nonce: 0n,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
        callGasLimit: 1n,
        verificationGasLimit: 1n,
        preVerificationGas: 1n,
      },
    );
    const r = validarPolitica(operacion.callData, RED, { safe, extras: extrasPrimeraOperacion(LLAVE) });
    expect(r).toMatchObject({ ok: true });
    // Sin las extras declaradas, la misma operación no pasa: la excepción es exacta y acotada.
    expect(validarPolitica(operacion.callData, RED, { safe }).ok).toBe(false);
  });
});
