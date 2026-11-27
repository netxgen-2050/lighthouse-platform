import { Operation, SafeAccountV0_3_0 } from "abstractionkit";
import { describe, expect, it } from "vitest";
import { llamadaAttest, llamadaRegister } from "./eas";
import { validarPolitica } from "./politica";
import { BASE_SEPOLIA as RED } from "./red";

const SAFE = "0x1111111111111111111111111111111111111111";
const OTRO = "0x2222222222222222222222222222222222222222";

const attest = { to: RED.eas, value: 0n, data: llamadaAttest(SAFE, 1_700_000_000n) };
const register = { to: RED.registro, value: 0n, data: llamadaRegister() };

const unica = (t: { to: string; value: bigint; data: string; operation?: Operation }) =>
  SafeAccountV0_3_0.createAccountCallDataSingleTransaction(t);
const lote = (ts: Array<{ to: string; value: bigint; data: string; operation?: Operation }>) =>
  SafeAccountV0_3_0.createAccountCallDataBatchTransactions(ts);

describe("validarPolitica: lo que acepta", () => {
  it("attest solo", () => {
    const r = validarPolitica(unica(attest), RED, { safe: SAFE });
    expect(r.ok).toBe(true);
  });

  it("register + attest en lote", () => {
    const r = validarPolitica(lote([register, attest]), RED, { safe: SAFE });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.llamadas).toHaveLength(2);
  });

  it("las llamadas extras exactas de la primera operación no cuentan para el tope", () => {
    const extra = { to: OTRO, value: 0n, data: "0xabcdef" };
    const r = validarPolitica(lote([extra, register, attest]), RED, { safe: SAFE, extras: [{ to: extra.to, data: extra.data }] });
    expect(r.ok).toBe(true);
    // Sin declararlas como extras, se rechazan.
    expect(validarPolitica(lote([extra, register, attest]), RED, { safe: SAFE }).ok).toBe(false);
  });
});

describe("validarPolitica: lo que rechaza", () => {
  it("otro destino, otro selector y valor", () => {
    expect(validarPolitica(unica({ ...attest, to: OTRO }), RED).ok).toBe(false);
    expect(validarPolitica(unica({ to: RED.eas, value: 0n, data: "0x12345678" }), RED).ok).toBe(false);
    expect(validarPolitica(unica({ ...attest, value: 1n }), RED).ok).toBe(false);
  });

  it("attest a otra destinataria que la Safe", () => {
    expect(validarPolitica(unica({ ...attest, data: llamadaAttest(OTRO, 1n) }), RED, { safe: SAFE }).ok).toBe(false);
  });

  it("delegatecall que no es al MultiSend, y delegatecall suelto al MultiSend", () => {
    expect(validarPolitica(unica({ ...attest, operation: Operation.Delegate }), RED).ok).toBe(false);
    const otroMulti = SafeAccountV0_3_0.createAccountCallDataBatchTransactions([register, attest], {
      multisendContractAddress: OTRO,
    });
    expect(validarPolitica(otroMulti, RED).ok).toBe(false);
  });

  it("una llamada interna con delegatecall", () => {
    expect(validarPolitica(lote([register, { ...attest, operation: Operation.Delegate }]), RED).ok).toBe(false);
  });

  it("más de dos llamadas", () => {
    expect(validarPolitica(lote([register, attest, attest]), RED).ok).toBe(false);
  });

  it("callData basura", () => {
    expect(validarPolitica("0x", RED).ok).toBe(false);
    expect(validarPolitica("no es hex", RED).ok).toBe(false);
    expect(validarPolitica("0xdeadbeef", RED).ok).toBe(false);
    expect(validarPolitica(unica(attest) + "00", RED).ok).toBe(false);
  });
});
