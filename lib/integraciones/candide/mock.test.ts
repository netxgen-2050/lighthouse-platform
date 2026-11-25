import { describe, expect, it } from "vitest";
import { operacionAJson, operacionDeJson } from "@/lib/billetera-prueba/operacion";
import { crearMock } from "./mock";
import { puertoCandide, reiniciarMock } from "./index";
import { ErrorDeCandide } from "./tipos";
import { FIRMA_DE_PRUEBA, LLAVE_DE_PRUEBA as LLAVE } from "./__fixtures__/datos";

describe("mock de Candide", () => {
  it("recorrido completo: dirección, preparar, enviar, enviada → incluida, firma fuera", async () => {
    const p = crearMock();
    const dir = p.calcularDireccion(LLAVE);
    expect(dir).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(await p.estaDesplegada(dir)).toBe(false);
    expect(await p.schemaRegistrado()).toBe(false);

    await expect(p.prepararFirmaFuera(LLAVE)).rejects.toThrow("Primero hacé la primera operación");

    const { operacion, hashAFirmar } = await p.prepararPrimeraOperacion(LLAVE);
    expect(hashAFirmar).toMatch(/^0x[0-9a-f]{64}$/);
    const { hashOperacion } = await p.enviarOperacion(LLAVE, operacion, FIRMA_DE_PRUEBA);

    expect(await p.consultarOperacion(hashOperacion)).toEqual({ estado: "enviada" });
    const incluida = await p.consultarOperacion(hashOperacion);
    expect(incluida.estado).toBe("incluida");
    expect(await p.estaDesplegada(dir)).toBe(true);
    expect(await p.schemaRegistrado()).toBe(true);

    const fuera = await p.prepararFirmaFuera(LLAVE);
    expect(fuera.hashAFirmar).toMatch(/^0x[0-9a-f]{64}$/);
    const v = await p.verificarFirma1271(LLAVE, BigInt(fuera.tiempo), FIRMA_DE_PRUEBA);
    expect(v.resultado).toBe("valida");
  });

  it("una segunda operación ya no lleva init ni register", async () => {
    const p = crearMock();
    const a = await p.prepararPrimeraOperacion(LLAVE);
    const { hashOperacion } = await p.enviarOperacion(LLAVE, a.operacion, FIRMA_DE_PRUEBA);
    await p.consultarOperacion(hashOperacion);
    await p.consultarOperacion(hashOperacion);
    const b = await p.prepararPrimeraOperacion(LLAVE);
    expect(b.operacion.nonce).toBe("1");
    expect(b.operacion.factory).toBeNull();
    expect(b.operacion.callData.length).toBeLessThan(a.operacion.callData.length);
  });

  it("rechaza una operación alterada (política) y una de otra Safe (sender)", async () => {
    const p = crearMock();
    const { operacion } = await p.prepararPrimeraOperacion(LLAVE);
    const alterada = { ...operacion, callData: operacion.callData.slice(0, -4) + "ffff" };
    await expect(p.enviarOperacion(LLAVE, alterada, FIRMA_DE_PRUEBA)).rejects.toThrow("La operación no cumple la política de gas");
    const ajena = { ...operacion, sender: "0x2222222222222222222222222222222222222222" };
    await expect(p.enviarOperacion(LLAVE, ajena, FIRMA_DE_PRUEBA)).rejects.toBeInstanceOf(ErrorDeCandide);
    expect(operacionDeJson(operacion)).not.toBeNull();
    expect(operacionAJson(operacionDeJson(operacion)!)).toEqual(operacion);
  });

  it("una operación desconocida es un fallo, no un cero", async () => {
    const r = await crearMock().consultarOperacion(`0x${"00".repeat(32)}`);
    expect(r.estado).toBe("fallo");
  });
});

describe("puertoCandide: elección del adaptador", () => {
  it("con LH_PRUEBA_CANDIDE_SIMULADO=1 usa el mock y siempre el mismo (guarda estado)", () => {
    reiniciarMock();
    const a = puertoCandide({ LH_PRUEBA_CANDIDE_SIMULADO: "1" });
    expect(puertoCandide({ LH_PRUEBA_CANDIDE_SIMULADO: "1" })).toBe(a);
    expect(a.estado()).toBe("listo");
  });

  it("sin modo simulado y sin URL: sin configurar, no pasa solo al mock", () => {
    expect(puertoCandide({}).estado()).toBe("sin-configurar");
    expect(puertoCandide({ CANDIDE_BUNDLER_URL: "https://b.test/k" }).estado()).toBe("sin-configurar");
    expect(puertoCandide({ CANDIDE_BUNDLER_URL: "https://b.test/k", CANDIDE_PAYMASTER_URL: "https://p.test/k" }).estado()).toBe("listo");
  });

  it("el real sin configurar rechaza preparar sin hablar con nadie", async () => {
    await expect(puertoCandide({}).prepararPrimeraOperacion(LLAVE)).rejects.toThrow("Falta configurar Candide (ver el guion)");
  });
});
