import { describe, expect, it } from "vitest";
import { copiaParaElConsejo, DECISIONES_BASE } from "@/lib/fogon/datos";
import { CAMINOS, caminoDe, caminoEnArbol, decisionesDeLaLente } from "./caminos";
import { buscarNodo, construirHolarquia } from "./holarquia";

const raiz = construirHolarquia("es");
const porId = (id: string) => DECISIONES_BASE.find((d) => d.id === id)!;

describe("caminos de decisiones", () => {
  it("todo id de CAMINOS existe en el Fogón y en la holarquía", () => {
    for (const c of CAMINOS) {
      expect(DECISIONES_BASE.map((d) => d.id), c.decisionId).toContain(c.decisionId);
      for (const id of c.camino) expect(buscarNodo(raiz, id), `${c.decisionId} → ${id}`).not.toBeNull();
    }
  });

  it("la bomba sube por Cuidado de la tierra, Valle Solar, el consejo y el común", () => {
    expect(caminoDe(porId("consejo-bomba"))).toEqual({ camino: ["valle-0", "valle", "consejo", "lighthouse"], tipo: "sube" });
  });

  it("la cisterna compartida se deriva al círculo Agua del Lighthouse", () => {
    const c = caminoDe(porId("cisterna-compartida"))!;
    expect(c.tipo).toBe("deriva");
    expect(c.camino[c.camino.length - 1]).toBe("comun-agua");
  });

  it("la siembra se decide abajo, en dos pasos dentro de Valle Solar", () => {
    expect(caminoDe(porId("siembra"))).toEqual({ camino: ["valle-0", "valle"], tipo: "queda" });
  });

  it("la copia al consejo de la cisterna de Valle Solar da Valle Solar → Consejo aunque el original no tenga camino", () => {
    expect(CAMINOS.some((c) => c.decisionId === "cisterna")).toBe(false);
    expect(caminoDe(copiaParaElConsejo(porId("cisterna")))).toEqual({ camino: ["valle", "consejo"], tipo: "sube" });
  });

  it("una copia hereda el camino de su original cuando lo tiene", () => {
    const original = { ...porId("siembra"), tribuId: "valle", pideAlComun: true };
    const c = caminoDe(copiaParaElConsejo(original))!;
    expect(c.camino).toEqual(["valle-0", "valle", "consejo"]);
    expect(c.tipo).toBe("sube");
  });

  it("una decisión sin camino da null", () => {
    expect(caminoDe(porId("huerta"))).toBeNull();
    expect(caminoDe({ id: "otra" })).toBeNull();
  });

  it("un id que no existe en el árbol se descarta sin romper", () => {
    expect(caminoEnArbol(raiz, ["valle", "no-existe", "consejo"])).toEqual(["valle", "consejo"]);
  });

  it("la lente lista las de CAMINOS y suma al final las copias del navegador, sin repetir", () => {
    const base = decisionesDeLaLente().map((d) => d.id);
    expect(base).toEqual(["consejo-bomba", "regalia", "siembra", "cisterna-compartida"]);
    expect(decisionesDeLaLente(["cisterna"]).map((d) => d.id)).toEqual([...base, "consejo-cisterna"]);
    expect(decisionesDeLaLente(["huerta", "no-existe"]).map((d) => d.id)).toEqual(base);
  });
});
