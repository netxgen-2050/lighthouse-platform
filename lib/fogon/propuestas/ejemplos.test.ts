import { describe, expect, it } from "vitest";
import { DECISIONES_BASE } from "@/lib/fogon/datos";
import { buscarNodo, construirHolarquia } from "@/lib/gobernanza/holarquia";
import { PROPUESTAS_DE_EJEMPLO, propuestaDe } from "./ejemplos";
import { fuentePrincipios } from "./principios";
import { MATERIAS_SIN_URGENCIA, topeUrgenciaDe } from "./reglas";
import type { Bi } from "./tipos";

const decision = (id: string) => DECISIONES_BASE.find((d) => d.id === id);
const arbol = construirHolarquia("es");
const principios = new Set(fuentePrincipios.principios().map((p) => p.id));

describe("propuestas de ejemplo (design §8)", () => {
  it("son cinco", () => {
    expect(PROPUESTAS_DE_EJEMPLO.map((p) => p.decisionId).sort()).toEqual(["consejo-bomba", "cisterna-compartida", "huerta", "regalia", "siembra"].sort());
  });

  it("cada decisionId existe y ninguna decisión del fideicomiso tiene propuesta", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) expect(decision(p.decisionId), p.decisionId).toBeDefined();
    for (const d of DECISIONES_BASE.filter((x) => x.ambito === "fideicomiso")) expect(propuestaDe(d.id), d.id).toBeNull();
  });

  it("propuestaDe devuelve null si no hay", () => {
    expect(propuestaDe("no-existe")).toBeNull();
    expect(propuestaDe("siembra")?.decisionId).toBe("siembra");
  });

  it("cada holonId que no es null existe en la holarquía", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) if (p.holonId !== null) expect(buscarNodo(arbol, p.holonId), p.decisionId).not.toBeNull();
  });

  it("solo las del consejo tienen ámbito del consejo (7 personas) y vos no está", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) {
      expect(p.ambitoConsejo !== undefined, p.decisionId).toBe(p.holonId === "consejo");
      if (p.ambitoConsejo) {
        expect(p.ambitoConsejo.personas).toHaveLength(7);
        expect(p.ambitoConsejo.personas).not.toContain("vos");
      }
    }
  });

  it("plata.pide es true si y solo si la decisión tiene monto", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) expect(p.plata.pide, p.decisionId).toBe(decision(p.decisionId)?.monto !== undefined);
  });

  it("todo principio citado existe en la fuente", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) {
      for (const id of p.principios) expect(principios.has(id), id).toBe(true);
      for (const r of p.registros) if (r.principio) expect(principios.has(r.principio), r.principio).toBe(true);
      for (const g of p.guion.guardian) if (g.principio) expect(principios.has(g.principio), g.principio).toBe(true);
    }
  });

  it("toda decisión previa del Guardián es una propuesta ya cerrada por consenso", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) {
      for (const g of p.guion.guardian) {
        if (!g.decisionPrevia) continue;
        const previa = propuestaDe(g.decisionPrevia);
        expect(previa, g.decisionPrevia).not.toBeNull();
        expect(previa?.registros.some((r) => r.tipo === "cierre" && r.datos?.resultado === "consenso")).toBe(true);
      }
    }
  });

  it("toda sugerencia de urgencia cita un registro urgencia que existe", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) {
      for (const g of p.guion.guardian.filter((x) => x.tipo === "posible-no-urgente" || x.tipo === "posible-no-reversible")) {
        expect(p.registros.some((r) => r.tipo === "urgencia" && r.id === g.urgencia), g.id).toBe(true);
      }
    }
  });

  it("ninguna propuesta de una materia sin urgencia tiene un registro urgencia", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO.filter((x) => x.materia && (MATERIAS_SIN_URGENCIA as readonly string[]).includes(x.materia))) {
      expect(p.registros.some((r) => r.tipo === "urgencia")).toBe(false);
    }
  });

  it("toda urgencia de plata trae destino, qué se compra y un monto conocido dentro del tope", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) {
      for (const r of p.registros.filter((x) => x.tipo === "urgencia" && p.plata.pide)) {
        expect(r.datos?.destinoPlata).toBeTruthy();
        expect(r.datos?.queSeCompra).toBeTruthy();
        const monto = decision(p.decisionId)?.monto?.cantidad;
        expect(typeof monto).toBe("number");
        expect(monto as number).toBeLessThanOrEqual(topeUrgenciaDe(p.holonId));
      }
    }
  });

  it("ningún registro de ejemplo es de Hifa ni del Guardián", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) for (const r of p.registros) expect(["hifa", "guardian"]).not.toContain(r.quien);
  });

  it("los registros son simulados y apuntan a su propuesta", () => {
    for (const p of PROPUESTAS_DE_EJEMPLO) for (const r of p.registros) {
      expect(r.simulado).toBe(true);
      expect(r.propuestaId).toBe(p.decisionId);
    }
  });

  it("todo texto tiene es y en", () => {
    const revisar = (v: unknown, donde: string) => {
      if (Array.isArray(v)) v.forEach((x, i) => revisar(x, `${donde}[${i}]`));
      else if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        if ("es" in o || "en" in o) {
          const bi = o as Bi;
          expect(bi.es?.trim().length, `${donde}.es`).toBeGreaterThan(0);
          expect(bi.en?.trim().length, `${donde}.en`).toBeGreaterThan(0);
        } else for (const [k, x] of Object.entries(o)) revisar(x, `${donde}.${k}`);
      }
    };
    for (const p of PROPUESTAS_DE_EJEMPLO) revisar(p, p.decisionId);
  });
});
