import { describe, expect, it } from "vitest";
import { borrarDemo } from "../demo/borrar";
import { CLAVES } from "../demo/claves";
import { formatoOrigen, guardarSiNoHay, leerOrigen, leerParametros, limpiar } from "./origen";

function almacenFalso() {
  const datos = new Map<string, string>();
  return {
    datos,
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
  };
}

describe("limpiar", () => {
  it("pasa a minúsculas y quita símbolos", () => {
    expect(limpiar("<script>Promo Feb</script>")).toBe("scriptpromofebscript");
    expect(limpiar("Congreso_2027.v1-A")).toBe("congreso_2027.v1-a");
  });
  it("corta a 60 caracteres", () => {
    expect(limpiar("a".repeat(100))).toHaveLength(60);
  });
  it("vacío o sin valor es undefined; toma el primero si viene repetido", () => {
    expect(limpiar("@@ ")).toBeUndefined();
    expect(limpiar(undefined)).toBeUndefined();
    expect(limpiar(["uno", "dos"])).toBe("uno");
  });
});

describe("leerParametros", () => {
  it("descarta parámetros no permitidos", () => {
    const p = leerParametros({ utm_source: "ig", email: "ana@ejemplo.com" });
    expect(p).toEqual({ fuente: "ig" });
    expect(JSON.stringify(p)).not.toContain("ana");
  });
  it("ignora un camino desconocido y acepta uno válido", () => {
    expect(leerParametros({ camino: "lotes" })).toEqual({});
    expect(leerParametros({ camino: "Congreso" })).toEqual({ camino: "congreso" });
  });
});

describe("guardarSiNoHay", () => {
  const ahora = new Date("2026-10-12T10:00:00Z");
  it("sin utm_* no guarda", () => {
    const a = almacenFalso();
    expect(guardarSiNoHay(a, { camino: "perfil" }, ahora)).toBe(false);
    expect(a.datos.size).toBe(0);
  });
  it("guarda el primero y no lo pisa", () => {
    const a = almacenFalso();
    expect(guardarSiNoHay(a, { fuente: "newsletter", campana: "congreso-2027", camino: "congreso" }, ahora)).toBe(true);
    expect(guardarSiNoHay(a, { fuente: "telegram" }, ahora)).toBe(false);
    expect(leerOrigen(a.getItem(CLAVES.origen))).toMatchObject({
      fuente: "newsletter",
      campana: "congreso-2027",
      camino: "congreso",
      fecha: ahora.toISOString(),
    });
  });
  it("reemplaza un valor guardado inválido", () => {
    const a = almacenFalso();
    a.setItem(CLAVES.origen, "{roto");
    expect(guardarSiNoHay(a, { fuente: "ig" }, ahora)).toBe(true);
  });
});

describe("leerOrigen", () => {
  it("JSON inválido o sin partes de campaña es null", () => {
    expect(leerOrigen(null)).toBeNull();
    expect(leerOrigen("{roto")).toBeNull();
    expect(leerOrigen("[]")).toBeNull();
    expect(leerOrigen(JSON.stringify({ camino: "perfil", fecha: "x" }))).toBeNull();
  });
  it("vuelve a limpiar cada campo", () => {
    expect(leerOrigen(JSON.stringify({ fuente: "<b>IG</b>", fecha: "x" }))?.fuente).toBe("bigb");
  });
});

describe("formatoOrigen", () => {
  it("muestra sin dato en lo que falta", () => {
    expect(formatoOrigen({ fuente: "newsletter", campana: "congreso-2027" })).toBe("newsletter · sin dato · congreso-2027");
  });
  it("sin origen es sin dato", () => {
    expect(formatoOrigen(undefined)).toBe("sin dato");
    expect(formatoOrigen({})).toBe("sin dato");
  });
});

describe("borrarDemo", () => {
  it("quita lh-origen", () => {
    const quitadas: string[] = [];
    borrarDemo((c) => quitadas.push(c));
    expect(quitadas).toContain("lh-origen");
  });
});
