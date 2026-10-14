import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { obtenerEvento } from "./evento";

const RAIZ = path.resolve(__dirname, "..", "..");

function textos(valor: unknown): string[] {
  if (typeof valor === "string") return [valor];
  if (Array.isArray(valor)) return valor.flatMap(textos);
  if (valor && typeof valor === "object") return Object.values(valor).flatMap(textos);
  return [];
}

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.(tsx?|css)$/.test(n) ? [p] : [];
  });
}

const TUTEO = /(?<![\p{L}])(?:tú|tienes|puedes|quieres|recibes|vinculas|necesitas|eres|vienes|sabes|llega con tu)(?![\p{L}])/iu;

describe("contenido del evento", () => {
  it("tiene la forma completa", async () => {
    const e = await obtenerEvento();
    expect(e.esEjemplo).toBe(true);
    expect(e.recorrido.paradas).toHaveLength(4);
    const fechas = e.recorrido.paradas.map((p) => p.etiquetaCorta);
    expect(fechas).toEqual(["Vie 5", "Sáb 6", "Dom 7", "8–9"]);
    expect(e.recorrido.paradas.filter((p) => p.destacada)).toHaveLength(1);
    expect(e.recorrido.paradas.find((p) => p.destacada)?.titulo).toBe("Anillo de fuego");
    expect(e.ejes.items).toHaveLength(8);
    expect(e.entradas.tipos).toHaveLength(6);
    expect(e.preguntas.items.length).toBeGreaterThanOrEqual(4);
    expect(e.momentoClave.iso).toBe("2027-02-06T12:00:00-03:00");
  });

  it("ningún precio es cero y todo tipo de entrada es de ejemplo", async () => {
    const e = await obtenerEvento();
    for (const t of e.entradas.tipos) {
      expect(t.esEjemplo).toBe(true);
      if (t.precio) expect(t.precio.monto).toBeGreaterThan(0);
    }
  });

  it("toda voz tiene estado válido y las principales son las cuatro reales, por confirmar", async () => {
    const e = await obtenerEvento();
    const todas = [...e.voces.principales];
    for (const v of todas) expect(["confirmada", "por-confirmar"]).toContain(v.estado);
    expect(todas.every((v) => v.estado === "por-confirmar")).toBe(true);
    expect(e.voces.principales.map((v) => [v.nombre, v.afiliacion])).toEqual([
      ["Roxanne Meadows", "The Venus Project"],
      ["Michel Bauwens", "P2P Foundation"],
      ["Michael Reynolds", "Earthship Biotecture"],
      ["Bill Reed", "Regen Dev Corp"],
    ]);
    // Sin fotos ni citas: la voz solo trae estos campos.
    for (const v of e.voces.principales) {
      expect(Object.keys(v).sort()).toEqual(["afiliacion", "estado", "id", "iniciales", "nombre", "tono"]);
    }
  });

  it("no usa tuteo en ningún texto", async () => {
    const e = await obtenerEvento();
    const malos = textos(e).filter((t) => TUTEO.test(t));
    expect(malos).toEqual([]);
  });

  it("detecta el tuteo de la lista cerrada", () => {
    expect(TUTEO.test("Si quieres ir")).toBe(true);
    expect(TUTEO.test("Llega con tu tribu")).toBe(true);
    expect(TUTEO.test("Llegá con tu tribu")).toBe(false);
    expect(TUTEO.test("Si querés ir, vinculás tu ticket")).toBe(false);
  });

  it("la respuesta sobre la cuenta de NetX usa voseo", async () => {
    const e = await obtenerEvento();
    const p = e.preguntas.items.find((i) => i.pregunta === "¿Necesito una cuenta en NetX para ir?");
    expect(p?.respuesta).toContain("vinculás tu ticket");
  });

  it("trae la página oficial de ejemplo con URL segura", async () => {
    const e = await obtenerEvento();
    expect(e.paginaOficial?.esEjemplo).toBe(true);
    const { url, esEjemplo } = e.paginaOficial!;
    expect(url.startsWith("https://") || (esEjemplo && url.startsWith("#"))).toBe(true);
  });

  it("ningún archivo de app/ ni components/ importa el contenido de ejemplo", () => {
    const malos = [...archivos(path.join(RAIZ, "app")), ...archivos(path.join(RAIZ, "components"))].filter((f) =>
      /evento-ejemplo/.test(readFileSync(f, "utf8")),
    );
    expect(malos).toEqual([]);
  });
});
