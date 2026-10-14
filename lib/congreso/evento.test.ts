import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { obtenerEvento, resolverEvento } from "./evento";
import { EVENTO_EJEMPLO } from "./evento-ejemplo";
import { esNeutro } from "./idioma";

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

  it("toda voz (principales y regionales) tiene estado válido, iniciales y está por confirmar", async () => {
    const e = await obtenerEvento();
    expect(e.voces.regionales).toHaveLength(2);
    const todas = [...e.voces.principales, ...e.voces.regionales];
    for (const v of todas) expect(v.iniciales).toMatch(/^\p{Lu}{2}$/u);
    for (const v of todas) expect(["confirmada", "por-confirmar"]).toContain(v.estado);
    expect(todas.every((v) => v.estado === "por-confirmar")).toBe(true);
  });

  it("las principales son las cuatro reales, sin fotos ni citas", async () => {
    const e = await obtenerEvento();
    const todas = [...e.voces.principales, ...e.voces.regionales];
    expect(e.voces.principales.map((v) => [v.nombre, v.afiliacion])).toEqual([
      ["Roxanne Meadows", "The Venus Project"],
      ["Michel Bauwens", "P2P Foundation"],
      ["Michael Reynolds", "Earthship Biotecture"],
      ["Bill Reed", "Regen Dev Corp"],
    ]);
    // Sin fotos ni citas: la voz solo trae estos campos.
    for (const v of todas) {
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

  it("algún párrafo de El encuentro dice que es educativo (ahí va el ⚖ encuentroeducativo)", async () => {
    const e = await obtenerEvento();
    expect(e.encuentro.parrafos.some((p) => /educativ/i.test(p))).toBe(true);
  });

  it("trae la página oficial de ejemplo con URL segura", async () => {
    const e = await obtenerEvento();
    expect(e.paginaOficial?.esEjemplo).toBe(true);
    const { url, esEjemplo } = e.paginaOficial!;
    expect(url.startsWith("https://") || (esEjemplo && url.startsWith("#"))).toBe(true);
  });

  it("sin indicar idioma devuelve el español", async () => {
    const e = await obtenerEvento();
    expect(e.idioma).toBe("es");
    expect(e.entradas.tipos[0].nombre).toBe("Pase completo");
  });

  it("en inglés: textos clave en inglés, sin objetos con las dos versiones y sin textos sin traducir", async () => {
    const e = await obtenerEvento("en");
    expect(e.idioma).toBe("en");
    expect(e.entradas.tipos[0].nombre).toBe("Full pass");
    expect(e.preguntas.items[0].pregunta).toBe("What does the full pass include?");
    expect(e.sinTraducir).toEqual([]);
    expect(JSON.stringify(e)).not.toMatch(/"es":\s*"|"en":\s*"/);
  });

  it("todo texto en español existe y no está vacío", () => {
    const vacios: string[] = [];
    const recorrer = (v: unknown, ruta: string) => {
      if (typeof v !== "object" || v === null) return;
      const o = v as Record<string, unknown>;
      if (typeof o.es === "string" && Object.keys(o).every((k) => k === "es" || k === "en")) {
        if (o.es.trim() === "") vacios.push(ruta);
        return;
      }
      for (const [k, x] of Object.entries(o)) recorrer(x, `${ruta}.${k}`);
    };
    recorrer(EVENTO_EJEMPLO, "evento");
    expect(vacios).toEqual([]);
  });

  it("ningún texto en inglés es igual al español, salvo nombres propios, marcas y números", () => {
    const iguales: string[] = [];
    const recorrer = (v: unknown, ruta: string) => {
      if (typeof v !== "object" || v === null) return;
      const o = v as Record<string, unknown>;
      if (typeof o.es === "string" && Object.keys(o).every((k) => k === "es" || k === "en")) {
        if (o.en === o.es && !esNeutro(o.es)) iguales.push(`${ruta}: ${o.es}`);
        return;
      }
      for (const [k, x] of Object.entries(o)) recorrer(x, `${ruta}.${k}`);
    };
    recorrer(EVENTO_EJEMPLO, "evento");
    expect(iguales).toEqual([]);
  });

  it("si falta una traducción cae al español y anota la ruta", () => {
    const fuente = structuredClone(EVENTO_EJEMPLO);
    fuente.voces.principales[0].afiliacion = { es: "Sin inglés" };
    const e = resolverEvento(fuente, "en");
    expect(e.voces.principales[0].afiliacion).toBe("Sin inglés");
    expect(e.sinTraducir).toContain("voces.principales.0.afiliacion");
    fuente.voces.principales[0].afiliacion = { es: "Sin inglés", en: "" };
    expect(resolverEvento(fuente, "en").voces.principales[0].afiliacion).toBe("Sin inglés");
  });

  it("ningún archivo de app/ ni components/ importa el contenido de ejemplo", () => {
    const malos = [...archivos(path.join(RAIZ, "app")), ...archivos(path.join(RAIZ, "components"))].filter((f) =>
      /evento-ejemplo/.test(readFileSync(f, "utf8")),
    );
    expect(malos).toEqual([]);
  });
});
