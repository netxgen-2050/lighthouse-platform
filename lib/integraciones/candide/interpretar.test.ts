import { describe, expect, it } from "vitest";
import { BASE_SEPOLIA } from "@/lib/billetera-prueba/red";
import incluido from "./__fixtures__/recibo-incluido.json";
import revertido from "./__fixtures__/recibo-revertido.json";
import sinAttested from "./__fixtures__/recibo-sin-attested.json";
import { esRevert, interpretarEip1271, interpretarRecibo } from "./interpretar";

describe("interpretarRecibo", () => {
  it("sin recibo todavía: enviada", () => {
    expect(interpretarRecibo(null, BASE_SEPOLIA)).toEqual({ estado: "enviada" });
  });

  it("éxito con el evento Attested: incluida con el UID de la constancia", () => {
    expect(interpretarRecibo(incluido, BASE_SEPOLIA)).toEqual({
      estado: "incluida",
      hashTransaccion: `0x${"22".repeat(32)}`,
      uidConstancia: `0x${"ab".repeat(32)}`,
    });
  });

  it("success false: fallo 'entró en un bloque pero se revirtió', nunca incluida", () => {
    expect(interpretarRecibo(revertido, BASE_SEPOLIA)).toEqual({
      estado: "fallo",
      motivo: "entró en un bloque pero se revirtió",
      hashTransaccion: `0x${"22".repeat(32)}`,
    });
  });

  it("sin evento Attested: incluida sin uidConstancia (la página dice sin dato)", () => {
    const r = interpretarRecibo(sinAttested, BASE_SEPOLIA);
    expect(r.estado).toBe("incluida");
    expect(r).not.toHaveProperty("uidConstancia");
  });

  it("un Attested de otro contrato no cuenta", () => {
    const otro = { ...incluido, logs: [{ ...incluido.logs[0], address: "0x3333333333333333333333333333333333333333" }] };
    expect(interpretarRecibo(otro, BASE_SEPOLIA)).not.toHaveProperty("uidConstancia");
  });

  it("forma desconocida: fallo 'respuesta inesperada de la red'", () => {
    for (const rara of ["hola", 42, {}, { success: "si" }, { success: true }, { success: true, receipt: { transactionHash: "xyz" } }]) {
      expect(interpretarRecibo(rara, BASE_SEPOLIA)).toEqual({ estado: "fallo", motivo: "respuesta inesperada de la red" });
    }
  });
});

describe("esRevert", () => {
  it("reconoce un revert y un código de Safe", () => {
    expect(esRevert("execution reverted")).toBe(true);
    expect(esRevert("VM Exception: revert")).toBe(true);
    expect(esRevert("execution reverted: GS026")).toBe(true);
  });

  it("un timeout o un error de red no es un revert", () => {
    expect(esRevert("execution timeout")).toBe(false);
    expect(esRevert("request failed: fetch failed")).toBe(false);
    expect(esRevert("Execution client unavailable")).toBe(false);
    expect(esRevert("")).toBe(false);
  });
});

describe("interpretarEip1271", () => {
  const handler = "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226" as const;

  it("devolvió 0x1626ba7e (bytes4, con el relleno de 32 bytes): válida", () => {
    const r = interpretarEip1271({ devuelto: `0x1626ba7e${"0".repeat(56)}` }, handler);
    expect(r.resultado).toBe("valida");
    expect(r.valorDevuelto).toBe("0x1626ba7e");
  });

  it("otro valor: no válida, con el valor", () => {
    const r = interpretarEip1271({ devuelto: `0xffffffff${"0".repeat(56)}` }, handler);
    expect(r).toMatchObject({ resultado: "no-valida", valorDevuelto: "0xffffffff" });
  });

  it("respuesta vacía: sin respuesta del nodo, no 'no válida'", () => {
    const r = interpretarEip1271({ devuelto: "0x" }, handler);
    expect(r.resultado).toBe("sin-respuesta");
    expect(r.detalle).toContain("sin respuesta del nodo");
  });

  it("revert sin código de Safe: la Safe no responde EIP-1271, con el fallback handler", () => {
    const r = interpretarEip1271({ revert: "execution reverted" }, handler);
    expect(r.resultado).toBe("sin-eip1271");
    expect(r.detalle).toContain(`fallback handler ${handler}`);
  });

  it("revert con código GS026: firma rechazada por la Safe", () => {
    expect(interpretarEip1271({ revert: "execution reverted: GS026" }, handler).resultado).toBe("no-valida");
  });
});
