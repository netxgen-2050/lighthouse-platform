import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACCIONES_DE_PROCESO, celdasDe, MATRIZ, NIVELES_IMPLICACION, permiso, RESTRICCIONES_DE_QUIEN_PRESENTA } from "./permisos";
import type { Accion, AccionDeProceso, AccionMatriz, Celda, NivelImplicacion } from "./tipos";

// La tabla del design §2, escrita a mano acá (no importada). Orden: visita, red, común, ámbito, afectada, proceso, presenta.
const S = "si";
const N = "no";
const ESPERADA: Record<AccionMatriz, string[]> = {
  "leer-propuesta": [N, S, S, S, S, S, S],
  "leer-discusion": [N, "solo-comun", S, S, S, S, S],
  preguntar: [N, "solo-comun", S, S, S, S, S],
  comentar: [N, N, "solo-comun", S, S, S, S],
  "levantar-concern": [N, N, "solo-comun", S, S, S, S],
  "sumarse-concern": [N, N, "solo-comun", S, S, S, S],
  "proponer-resolucion": [N, N, N, S, S, S, S],
  editar: [N, N, N, N, N, "solo-forma", S],
  "pasar-fase": [N, N, N, N, N, "quien-facilita", N],
  "hacerse-a-un-lado": [N, N, N, S, S, S, N],
  bloquear: [N, N, N, S, S, "solo-como-miembro", S],
  "decidir-legitimidad": [N, N, N, "por-consenso-del-grupo", "participa-en-la-discusion", "facilita-nunca-decide", N],
  "derivar-o-pausar": [N, N, N, "con-acuerdo-del-grupo", N, "lo-propone", N],
  "escribir-acta": [N, N, N, N, N, "rol-memoria", N],
  "recibir-avisos": [N, "si-se-suscribe", "si-se-suscribe", S, S, S, S],
};

const texto = (c: Celda): string => (typeof c === "string" ? c : c.condicion);
const ctxComun = { ambito: "comun" } as const;
const ctxTribu = { ambito: "tribu" } as const;

describe("MATRIZ (design §2)", () => {
  it("tiene las 15 acciones y 7 niveles: 105 celdas iguales a la tabla del design", () => {
    expect(Object.keys(MATRIZ)).toHaveLength(15);
    expect(NIVELES_IMPLICACION).toHaveLength(7);
    let celdas = 0;
    for (const accion of Object.keys(ESPERADA) as AccionMatriz[]) {
      NIVELES_IMPLICACION.forEach((nivel, i) => {
        expect(texto(MATRIZ[accion][nivel]), `${accion} / ${nivel}`).toBe(ESPERADA[accion][i]);
        celdas++;
      });
    }
    expect(celdas).toBe(105);
  });

  it("la columna visita es toda no, también en las acciones de proceso (A2)", () => {
    for (const a of Object.keys(MATRIZ) as AccionMatriz[]) expect(MATRIZ[a].visita).toBe("no");
    for (const a of Object.keys(ACCIONES_DE_PROCESO) as AccionDeProceso[]) expect(ACCIONES_DE_PROCESO[a].visita).toBe("no");
    for (const a of [...Object.keys(MATRIZ), ...Object.keys(ACCIONES_DE_PROCESO)] as Accion[]) {
      expect(permiso(a, ["visita"], ctxComun).estado).toBe("no");
    }
  });
});

describe("permiso()", () => {
  it("solo-comun da sí en el común y no en una tribu", () => {
    expect(permiso("comentar", ["comun"], ctxComun).estado).toBe("si");
    expect(permiso("comentar", ["comun"], ctxTribu).estado).toBe("no");
  });

  it("une los niveles: red + afectada puede levantar un concern", () => {
    expect(permiso("levantar-concern", ["red"], ctxTribu).estado).toBe("no");
    expect(permiso("levantar-concern", ["red", "afectada"], ctxTribu).estado).toBe("si");
  });

  it("quien presenta puede levantar concern, sumarse y bloquear (C4) y no puede hacerse a un lado", () => {
    expect(permiso("levantar-concern", ["presenta"], ctxTribu).estado).toBe("si");
    expect(permiso("sumarse-concern", ["presenta"], ctxTribu).estado).toBe("si");
    expect(permiso("bloquear", ["presenta"], ctxTribu).estado).toBe("si");
    expect(permiso("hacerse-a-un-lado", ["presenta"], ctxTribu).estado).toBe("no");
  });

  it("ámbito + presenta no decide legitimidad (F3) ni se hace a un lado (C4), y sí edita y firma el acuse", () => {
    const niveles: NivelImplicacion[] = ["ambito", "presenta"];
    expect(permiso("decidir-legitimidad", niveles, ctxTribu).estado).toBe("no");
    expect(permiso("hacerse-a-un-lado", niveles, ctxTribu).estado).toBe("no");
    expect(permiso("editar", niveles, ctxTribu).estado).toBe("si");
    expect(permiso("acusar-conformidad", niveles, ctxTribu).estado).toBe("si");
  });

  it("RESTRICCIONES_DE_QUIEN_PRESENTA", () => {
    expect([...RESTRICCIONES_DE_QUIEN_PRESENTA]).toEqual(["decidir-legitimidad", "hacerse-a-un-lado", "respaldar-urgencia"]);
  });
});

describe("ACCIONES_DE_PROCESO", () => {
  const mismas = (a: AccionDeProceso, b: AccionMatriz) => {
    for (const n of NIVELES_IMPLICACION) expect(texto(ACCIONES_DE_PROCESO[a][n])).toBe(texto(MATRIZ[b][n]));
  };
  const soloEn = (a: AccionDeProceso, esperados: NivelImplicacion[]) => {
    for (const n of NIVELES_IMPLICACION) expect(ACCIONES_DE_PROCESO[a][n] === "si", `${a} / ${n}`).toBe(esperados.includes(n));
  };

  it("sugerir-mecanismo tiene las mismas celdas que comentar (D2)", () => mismas("sugerir-mecanismo", "comentar"));
  it("sacar-propio-del-grupo y objetar-urgencia tienen las mismas celdas que levantar-concern", () => {
    mismas("sacar-propio-del-grupo", "levantar-concern");
    mismas("objetar-urgencia", "levantar-concern");
  });
  it("acusar-conformidad solo es sí en ámbito y afectada (B5)", () => soloEn("acusar-conformidad", ["ambito", "afectada"]));
  it("agrupar-concerns solo es sí en proceso", () => soloEn("agrupar-concerns", ["proceso"]));
  it("marcar-urgente solo es sí en presenta", () => soloEn("marcar-urgente", ["presenta"]));
  it("respaldar-urgencia: ámbito sí, facilitación con condición; quien presenta no", () => {
    expect(permiso("respaldar-urgencia", ["ambito"], ctxTribu).estado).toBe("si");
    expect(permiso("respaldar-urgencia", ["proceso"], ctxTribu)).toEqual({ estado: "condicion", condiciones: ["quien-facilita"] });
    expect(permiso("respaldar-urgencia", ["ambito", "presenta"], ctxTribu).estado).toBe("no");
  });
  it("abrir-revision solo es quien-facilita en proceso", () => {
    for (const n of NIVELES_IMPLICACION) {
      expect(texto(ACCIONES_DE_PROCESO["abrir-revision"][n])).toBe(n === "proceso" ? "quien-facilita" : "no");
    }
  });
  it("celdasDe encuentra las dos tablas", () => {
    expect(celdasDe("comentar")).toBe(MATRIZ.comentar);
    expect(celdasDe("evaluar")).toBe(ACCIONES_DE_PROCESO.evaluar);
  });
});

describe("aislamiento de las puertas de la plataforma (2.6)", () => {
  const raiz = join(__dirname);
  const fuentes = readdirSync(raiz).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
  it("lib/fogon/propuestas no importa lib/permisos ni lib/sesion", () => {
    for (const f of fuentes) {
      const src = readFileSync(join(raiz, f), "utf8");
      expect(src, f).not.toMatch(/from\s+["']@\/lib\/(permisos|sesion)/);
      expect(src, f).not.toMatch(/from\s+["']@\/components\/sesion/);
    }
  });
  it("lib/permisos no importa lib/fogon/propuestas", () => {
    const dir = join(__dirname, "..", "..", "permisos");
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
      expect(readFileSync(join(dir, f), "utf8"), f).not.toMatch(/from\s+["'][^"']*fogon\/propuestas/);
    }
  });
});
