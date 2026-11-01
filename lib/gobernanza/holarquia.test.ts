import { describe, expect, it } from "vitest";
import { listarTribusBilingues } from "@/lib/tribus/datos";
import { CIRCULOS_DEL_COMUN, MAXIMO_RELLENO, PERSONAS_DE_EJEMPLO, ROLES_CRUZADOS, ROLES_DE_VOS } from "./datos";
import { empaquetar } from "./empaquetar";
import {
  buscarNodo,
  caminoHasta,
  construirHolarquia,
  hijosDe,
  lugaresMios,
  recorrer,
  rolesDe,
  type NodoContenedor,
  type NodoH,
} from "./holarquia";

const raiz = construirHolarquia("es");
const comun = (n: NodoH) => n as NodoContenedor;
const nombres = (n: NodoH) => hijosDe(n).map((h) => (h.tipo === "rol" ? h.persona : "nombre" in h ? h.nombre : h.id));

describe("datos de ejemplo de roles", () => {
  it("todo personaId y todo círculo de ROLES_CRUZADOS existe", () => {
    const personas = new Set(PERSONAS_DE_EJEMPLO.map((p) => p.id));
    for (const r of [...ROLES_CRUZADOS, ...ROLES_DE_VOS]) {
      expect(personas.has(r.personaId), r.personaId).toBe(true);
      expect(buscarNodo(raiz, r.circuloId)?.tipo, r.circuloId).toBe("circulo");
    }
  });

  it("ninguna persona tiene dos roles en el mismo círculo", () => {
    recorrer(raiz, (n) => {
      if (n.tipo !== "circulo") return;
      const ids = hijosDe(n).map((h) => (h.tipo === "rol" ? h.personaId : ""));
      expect(new Set(ids).size, n.id).toBe(ids.length);
    });
  });

  it("los nombres de ROLES_CRUZADOS no se reusan como relleno: un nombre es una sola persona", () => {
    const porNombre = new Map<string, Set<string>>();
    recorrer(raiz, (n) => {
      if (n.tipo !== "rol") return;
      porNombre.set(n.persona, (porNombre.get(n.persona) ?? new Set()).add(n.personaId));
    });
    for (const [nombre, ids] of porNombre) expect(ids.size, nombre).toBe(1);
  });

  it("alcanza el relleno para todos los círculos", () => {
    const ids = new Set<string>();
    recorrer(raiz, (n) => {
      if (n.tipo === "rol" && n.personaId.startsWith("p")) ids.add(n.personaId);
    });
    expect(ids.size).toBeLessThan(MAXIMO_RELLENO);
  });
});

describe("construirHolarquia", () => {
  it("el común contiene sus 9 círculos, el consejo, el transversal y las 12 tribus", () => {
    const h = hijosDe(raiz);
    expect(h.filter((x) => x.id.startsWith("comun-"))).toHaveLength(CIRCULOS_DEL_COMUN.length);
    expect(h.filter((x) => x.tipo === "consejo")).toHaveLength(1);
    expect(h.filter((x) => x.tipo === "circulo" && comun(x).clase === "transversal")).toHaveLength(1);
    expect(h.filter((x) => x.tipo === "tribu")).toHaveLength(12);
    expect(nombres(raiz)).toContain("Agua");
    expect(nombres(raiz)).toContain("Tokenomics y Semillas");
  });

  it("las 4 vacantes tienen solo Lugar libre", () => {
    const vacantes = hijosDe(raiz).filter((x) => x.tipo === "tribu" && comun(x).estado === "vacante");
    expect(vacantes).toHaveLength(4);
    for (const v of vacantes) expect(hijosDe(v).map((x) => x.tipo)).toEqual(["lugar-libre"]);
    expect(comun(vacantes[0]).decide).toEqual([]);
  });

  it("el consejo tiene un lugar por tribu validada y ninguno con representante", () => {
    const consejo = buscarNodo(raiz, "consejo")!;
    const lugares = hijosDe(consejo);
    expect(lugares).toHaveLength(8);
    for (const l of lugares) {
      expect(l.tipo).toBe("lugar");
      if (l.tipo === "lugar") expect(l.representante).toBeNull();
    }
  });

  it("todo nodo de persona es de ejemplo", () => {
    let personas = 0;
    recorrer(raiz, (n) => {
      if (n.tipo === "rol") {
        personas++;
        expect(n.ejemplo).toBe(true);
      }
    });
    expect(personas).toBeGreaterThan(100);
  });

  it("el camino hasta Cuidado de la tierra es común › Valle Solar › Cuidado de la tierra", () => {
    expect(caminoHasta(raiz, "valle-0").map((n) => ("nombre" in n ? n.nombre : n.id))).toEqual([
      "Lighthouse VRN Procomún",
      "Valle Solar",
      "Cuidado de la tierra",
    ]);
    expect(caminoHasta(raiz, "no-existe")).toEqual([]);
  });

  it("ningún id se repite en el árbol", () => {
    const vistos = new Set<string>();
    recorrer(raiz, (n) => {
      expect(vistos.has(n.id), n.id).toBe(false);
      vistos.add(n.id);
    });
  });

  it("dos llamadas dan el mismo árbol", () => {
    expect(JSON.stringify(construirHolarquia("es"))).toBe(JSON.stringify(construirHolarquia("es")));
  });

  it("el inglés traduce círculos y 'Decide sobre'", () => {
    const en = construirHolarquia("en");
    expect(comun(buscarNodo(en, "valle-0")!).nombre).toBe("Land care");
    expect(comun(buscarNodo(en, "comun-agua")!).decide).toContain("Shared cisterns");
    expect(nombres(buscarNodo(en, "comun-permacultura")!)).toContain("You");
  });

  it("Barrio 3 busca tribu, sin círculos y sin lugar en el consejo", () => {
    const b3 = hijosDe(raiz).find((x) => x.tipo === "tribu" && x.nombre === "Barrio 3")!;
    expect(comun(b3).estado).toBe("vacante");
    expect(comun(b3).validada).toBe(false);
    expect(hijosDe(buscarNodo(raiz, "consejo")!).map((l) => l.id)).not.toContain(`consejo-${b3.id}`);
  });

  it("el transversal muestra las tribus que participan y cuelga del común", () => {
    const t = comun(buscarNodo(raiz, "comunicacion-comun")!);
    expect(t.tribus).toEqual(["valle", "taller"]);
    expect(caminoHasta(raiz, t.id)).toHaveLength(2);
  });

  it("cada tribu activa o en formación trae sus círculos", () => {
    for (const t of listarTribusBilingues().filter((x) => x.estado !== "vacante")) {
      expect(hijosDe(buscarNodo(raiz, t.id)!).length, t.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("rolesDe", () => {
  it("Ana: Facilita en Huerta intensiva (Semilla Viva) y Miembro en Agua (el común)", () => {
    const r = rolesDe(raiz, "ana");
    expect(r).toHaveLength(2);
    expect(r.map((x) => [x.rol, x.circulo])).toEqual([
      ["miembro", "Agua"],
      ["facilita", "Huerta intensiva"],
    ]);
    expect(r[0].lugar).toEqual({ tipo: "comun" });
    expect(r[1].lugar).toMatchObject({ tipo: "tribu", nombre: "Semilla Viva" });
  });

  it("Bruno tiene tres roles: común, Agua Clara y Valle Solar", () => {
    const r = rolesDe(raiz, "bruno");
    expect(r.map((x) => [x.rol, x.circulo, x.lugar.tipo === "tribu" ? x.lugar.nombre : "el común"])).toEqual([
      ["facilita", "Agua", "el común"],
      ["enlace-arriba", "Toma y cisterna", "Agua Clara"],
      ["memoria", "Energía solar", "Valle Solar"],
    ]);
  });

  it("una persona de relleno tiene un solo rol", () => {
    const relleno = hijosDe(buscarNodo(raiz, "taller-1")!).find((x) => x.tipo === "rol" && x.personaId.startsWith("p"))!;
    expect(relleno.tipo === "rol" && rolesDe(raiz, relleno.personaId)).toHaveLength(1);
  });

  it("un rol en el transversal da lugar común", () => {
    const rol = hijosDe(buscarNodo(raiz, "comunicacion-comun")!).find((x) => x.tipo === "rol")!;
    const r = rolesDe(raiz, rol.tipo === "rol" ? rol.personaId : "");
    expect(r[0].lugar).toEqual({ tipo: "comun" });
  });

  it("Vos tiene sus dos roles de ejemplo", () => {
    expect(rolesDe(raiz, "yo").map((x) => [x.rol, x.circuloId])).toEqual([
      ["miembro", "comun-permacultura"],
      ["enlace-arriba", "valle-0"],
    ]);
  });

  it("busca por id, no por nombre", () => {
    expect(rolesDe(raiz, "Ana")).toEqual([]);
  });
});

describe("lugaresMios", () => {
  it("sin datos del navegador da los dos roles de ejemplo", () => {
    const l = lugaresMios({}, null);
    expect(l.map((x) => [x.nodoId, x.rol, x.ejemplo])).toEqual([
      ["comun-permacultura", "miembro", true],
      ["valle-0", "enlace-arriba", true],
    ]);
  });

  it("con Taller Común aceptado suma Miembro en Taller Común", () => {
    const l = lugaresMios({ lighthouse: "miembro", taller: "miembro", valle: "pedido" }, null);
    expect(l).toContainEqual({ nodoId: "taller", rol: "miembro", ejemplo: false });
    expect(l.find((x) => x.nodoId === "valle")).toBeUndefined();
    expect(l).toHaveLength(3);
  });

  it("liderar Valle Solar suma Facilita", () => {
    expect(lugaresMios({}, "valle")).toContainEqual({ nodoId: "valle", rol: "facilita", ejemplo: false });
  });

  it("con datos rotos quedan los dos de ejemplo", () => {
    expect(lugaresMios(null, undefined)).toHaveLength(2);
    expect(lugaresMios({}, null)).toHaveLength(2);
  });

  it("no cambia el árbol", () => {
    const antes = JSON.stringify(raiz);
    lugaresMios({ taller: "miembro" }, "valle");
    expect(JSON.stringify(raiz)).toBe(antes);
  });
});

describe("empaquetar", () => {
  const celdas = empaquetar(raiz, 800);

  it("cada hijo queda dentro de su padre", () => {
    recorrer(raiz, (n) => {
      const p = celdas.get(n.id)!;
      for (const h of hijosDe(n)) {
        const c = celdas.get(h.id)!;
        const dist = Math.hypot(c.x - p.x, c.y - p.y);
        expect(dist + c.r, h.id).toBeLessThanOrEqual(p.r + 0.001);
      }
    });
  });

  it("da el mismo resultado en dos llamadas", () => {
    expect([...empaquetar(raiz, 800)]).toEqual([...celdas]);
  });
});
