import { describe, expect, it } from "vitest";
import { copiarClavesAnteriores } from "./importar";

function almacen(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial));
  return {
    datos,
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
    key: (i: number) => [...datos.keys()][i] ?? null,
    get length() {
      return datos.size;
    },
  };
}

const NUEVA = "11111111-1111-1111-1111-111111111111";

describe("copia única de las claves del navegador", () => {
  it("copia lo que falta desde la clave de Privy (sin prefijo) y desde la de Neon Auth", () => {
    const a = almacen({ "u:did:privy:ana:lh-perfil": "P", "u:neon-auth:u1:lh-pactos": "X", "u:otra:lh-perfil": "NO" });
    expect(copiarClavesAnteriores(a, NUEVA, ["did:privy:ana", "neon-auth:u1"])).toBe(2);
    expect(a.datos.get(`u:${NUEVA}:lh-perfil`)).toBe("P");
    expect(a.datos.get(`u:${NUEVA}:lh-pactos`)).toBe("X");
    expect(a.datos.has(`u:${NUEVA}:lh-claves-copiadas`)).toBe(true);
  });

  it("no pisa lo que ya está en la clave nueva", () => {
    const a = almacen({ "u:did:privy:ana:lh-perfil": "VIEJO", [`u:${NUEVA}:lh-perfil`]: "NUEVO", "u:did:privy:ana:lh-kyc": "K" });
    expect(copiarClavesAnteriores(a, NUEVA, ["did:privy:ana"])).toBe(1);
    expect(a.datos.get(`u:${NUEVA}:lh-perfil`)).toBe("NUEVO");
  });

  it("no repite en la segunda carga", () => {
    const a = almacen({ "u:did:privy:ana:lh-perfil": "P" });
    copiarClavesAnteriores(a, NUEVA, ["did:privy:ana"]);
    a.datos.set("u:did:privy:ana:lh-kyc", "K");
    expect(copiarClavesAnteriores(a, NUEVA, ["did:privy:ana"])).toBe(0);
    expect(a.datos.has(`u:${NUEVA}:lh-kyc`)).toBe(false);
  });

  it("no borra las claves viejas", () => {
    const a = almacen({ "u:did:privy:ana:lh-perfil": "P" });
    copiarClavesAnteriores(a, NUEVA, ["did:privy:ana"]);
    expect(a.datos.get("u:did:privy:ana:lh-perfil")).toBe("P");
  });

  it("sin claves anteriores (o solo la nueva) no escribe nada, ni la marca", () => {
    const a = almacen({ [`u:${NUEVA}:lh-perfil`]: "P" });
    expect(copiarClavesAnteriores(a, NUEVA, [NUEVA])).toBe(0);
    expect(copiarClavesAnteriores(a, NUEVA, [])).toBe(0);
    expect([...a.datos.keys()]).toEqual([`u:${NUEVA}:lh-perfil`]);
  });

  it("si no había nada que copiar tampoco deja la marca", () => {
    const a = almacen({ "u:otra:lh-perfil": "X" });
    expect(copiarClavesAnteriores(a, NUEVA, ["did:privy:ana"])).toBe(0);
    expect(a.datos.has(`u:${NUEVA}:lh-claves-copiadas`)).toBe(false);
  });

  it("no copia la marca de la clave anterior", () => {
    const a = almacen({ "u:did:privy:ana:lh-claves-copiadas": "1" });
    expect(copiarClavesAnteriores(a, NUEVA, ["did:privy:ana"])).toBe(0);
  });
});
