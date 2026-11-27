import { SafeAccountV0_3_0 } from "abstractionkit";
import { describe, expect, it } from "vitest";
import { pruebaHabilitada, modoSimulado } from "./habilitada";
import { BASE_SEPOLIA, redDelEntorno, urlConstancia, urlDireccion, urlTransaccion } from "./red";
import { formatearSegundos, SIN_DATO, totalDe } from "./tiempos";
import { sanear } from "./sanear";

describe("red", () => {
  it("Base Sepolia: chain id y predeploys de EAS", () => {
    expect(BASE_SEPOLIA.chainId).toBe(84532);
    expect(BASE_SEPOLIA.eas).toBe("0x4200000000000000000000000000000000000021");
    expect(BASE_SEPOLIA.registro).toBe("0x4200000000000000000000000000000000000020");
  });

  it("el MultiSend es el mismo que usa abstractionkit", () => {
    expect(BASE_SEPOLIA.multiSend).toBe(SafeAccountV0_3_0.DEFAULT_MULTISEND_CONTRACT_ADDRESS);
  });

  it("arma las URL del explorador", () => {
    const d = "0x" + "ab".repeat(20);
    const h = "0x" + "cd".repeat(32);
    expect(urlDireccion(BASE_SEPOLIA, d)).toBe(`https://sepolia.basescan.org/address/${d}`);
    expect(urlTransaccion(BASE_SEPOLIA, h)).toBe(`https://sepolia.basescan.org/tx/${h}`);
    expect(urlConstancia(BASE_SEPOLIA, h)).toBe(`https://base-sepolia.easscan.org/attestation/view/${h}`);
  });

  it("el RPC se reemplaza con LH_PRUEBA_CANDIDE_RPC", () => {
    expect(redDelEntorno({}).rpc).toBe("https://sepolia.base.org");
    expect(redDelEntorno({ LH_PRUEBA_CANDIDE_RPC: "https://otro.test/k" }).rpc).toBe("https://otro.test/k");
  });
});

describe("pruebaHabilitada", () => {
  it("solo con LH_PRUEBA_CANDIDE=1, también en Production", () => {
    expect(pruebaHabilitada({})).toBe(false);
    expect(pruebaHabilitada({ LH_PRUEBA_CANDIDE: "" })).toBe(false);
    expect(pruebaHabilitada({ LH_PRUEBA_CANDIDE: "true" })).toBe(false);
    expect(pruebaHabilitada({ LH_PRUEBA_CANDIDE: "1" })).toBe(true);
    expect(pruebaHabilitada({ VERCEL_ENV: "production" })).toBe(false);
    expect(pruebaHabilitada({ VERCEL_ENV: "production", LH_PRUEBA_CANDIDE: "1" })).toBe(true);
  });

  it("modo simulado solo con 1", () => {
    expect(modoSimulado({})).toBe(false);
    expect(modoSimulado({ LH_PRUEBA_CANDIDE_SIMULADO: "yes" })).toBe(false);
    expect(modoSimulado({ LH_PRUEBA_CANDIDE_SIMULADO: "1" })).toBe(true);
  });
});

describe("tiempos", () => {
  it("segundos con un decimal y sin dato para lo no medido", () => {
    expect(formatearSegundos(1340)).toBe("1,3 s");
    expect(formatearSegundos(0)).toBe("0,0 s");
    expect(formatearSegundos(undefined)).toBe(SIN_DATO);
    expect(formatearSegundos(null)).toBe(SIN_DATO);
    expect(formatearSegundos(NaN)).toBe(SIN_DATO);
    expect(formatearSegundos(-5)).toBe(SIN_DATO);
  });

  it("el total suma lo medido y sin nada es sin dato", () => {
    expect(totalDe({})).toBeNull();
    expect(totalDe({ passkey: 1000, inclusion: 2500 })).toBe(3500);
  });
});

describe("sanear", () => {
  it("quita URL, parámetros de clave y secretos", () => {
    const m = sanear(new Error("fallo en https://api.candide.dev/v3/84532/SECRETO123?apikey=SECRETO123 por política"), ["SECRETO123"]);
    expect(m).not.toMatch(/https?:/);
    expect(m).not.toMatch(/SECRETO123/);
    expect(m).toContain("por política");
  });

  it("sin texto devuelve un mensaje genérico y corta lo largo", () => {
    expect(sanear(undefined)).toBe("Error sin detalle.");
    expect(sanear("x".repeat(1000)).length).toBeLessThanOrEqual(300);
    expect(sanear("clave abcdef12345 suelta", ["abcdef12345"])).not.toContain("abcdef12345");
  });
});
