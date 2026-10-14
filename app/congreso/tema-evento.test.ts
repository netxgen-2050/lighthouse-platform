import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CSS = readFileSync(path.join(__dirname, "tema-evento.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

type Regla = { selectores: string[]; cuerpo: string };

/** Reglas de la hoja, entrando en @media/@supports y saltando @keyframes. */
function reglas(css: string): Regla[] {
  const salida: Regla[] = [];
  let i = 0;
  while (i < css.length) {
    const abre = css.indexOf("{", i);
    if (abre === -1) break;
    const preludio = css.slice(i, abre).trim();
    let prof = 1;
    let j = abre + 1;
    while (j < css.length && prof > 0) {
      if (css[j] === "{") prof++;
      else if (css[j] === "}") prof--;
      j++;
    }
    const cuerpo = css.slice(abre + 1, j - 1);
    if (preludio.startsWith("@")) {
      if (/^@(media|supports|layer)/.test(preludio)) salida.push(...reglas(cuerpo));
    } else {
      salida.push({ selectores: preludio.split(",").map((s) => s.trim()), cuerpo });
    }
    i = j;
  }
  return salida;
}

const REGLAS = reglas(CSS);

const LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

function tokens(): Record<string, string> {
  const raiz = REGLAS.find((r) => r.selectores.length === 1 && r.selectores[0] === ".tema-evento");
  expect(raiz).toBeDefined();
  const mapa: Record<string, string> = {};
  for (const m of raiz!.cuerpo.matchAll(/--evento-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) mapa[m[1]] = m[2];
  return mapa;
}

function luminancia(hex: string): number {
  const c = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

describe("tema del evento", () => {
  it("la hoja tiene reglas", () => {
    expect(REGLAS.length).toBeGreaterThan(50);
  });

  it("todo selector contiene .tema-evento", () => {
    const sueltos = REGLAS.flatMap((r) => r.selectores).filter((s) => !s.includes(".tema-evento"));
    expect(sueltos).toEqual([]);
  });

  it("los colores literales solo aparecen en declaraciones --evento-* del contenedor", () => {
    const malas: string[] = [];
    for (const r of REGLAS) {
      for (const decl of r.cuerpo.split(";")) {
        if (!LITERAL.test(decl)) continue;
        const esToken = decl.trim().startsWith("--evento-");
        const esContenedor = r.selectores.length === 1 && r.selectores[0] === ".tema-evento";
        if (!esToken || !esContenedor) malas.push(`${r.selectores.join(", ")} → ${decl.trim()}`);
      }
    }
    expect(malas).toEqual([]);
  });

  it("no usa rgba() ni nombres de color sueltos en declaraciones de color", () => {
    expect(CSS).not.toMatch(/\brgba?\(/);
  });

  it("respeta reducir animaciones: preferencia del sistema y ajuste de NetX", () => {
    const solo = (sel: string) => REGLAS.filter((r) => r.selectores.some((s) => s.includes(sel)) && /animation:\s*none/.test(r.cuerpo));
    expect(solo(".ev-luna").length).toBeGreaterThanOrEqual(2);
    expect(REGLAS.some((r) => r.selectores.some((s) => s.startsWith(':root[data-movimiento="reducido"]') && s.includes(".ev-luna")))).toBe(true);
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});

// [texto, fondo, tamaño]: "normal" 4.5:1, "grande" 3:1 (24px o más, o 18,66px en negrita), "borde" 3:1 (foco y bordes de componentes).
type Tam = "normal" | "grande" | "borde";
const PARES: [string, string, Tam][] = [
  // Texto blanco sobre las secciones oscuras (hero, cierre, entradas, ejes) y sobre cada parada del amanecer que queda detrás de texto
  ["blanco", "noche", "normal"],
  ["blanco", "noche-2", "normal"],
  ["blanco", "noche-3", "normal"],
  ["blanco", "resplandor", "normal"],
  ["blanco", "amanecer-1", "normal"],
  ["blanco", "amanecer-2", "normal"],
  ["blanco", "rio", "normal"],
  // Texto claro sobre noche
  ["texto-claro", "noche", "normal"],
  ["texto-claro", "noche-2", "normal"],
  ["texto-claro", "noche-3", "normal"],
  ["texto-claro", "resplandor", "normal"],
  ["texto-claro-2", "noche", "normal"],
  ["texto-claro-2", "resplandor", "normal"],
  ["texto-tenue", "noche", "normal"],
  ["texto-tenue", "noche-2", "normal"],
  ["lila-claro", "noche", "normal"],
  ["lila-claro", "noche-2", "normal"],
  ["lila-claro", "resplandor", "normal"],
  ["corona", "noche", "normal"],
  ["corona", "noche-2", "normal"],
  // Tinta sobre claro
  ["tinta", "dia", "normal"],
  ["tinta", "brote", "normal"],
  ["tinta", "blanco", "normal"],
  ["tinta-2", "dia", "normal"],
  ["tinta-2", "blanco", "normal"],
  ["rio-texto", "dia", "normal"],
  ["rio-texto", "blanco", "normal"],
  // Botón corona y etiqueta destacada
  ["noche", "corona", "normal"],
  ["noche", "corona-hover", "normal"],
  // Iniciales de los retratos (texto grande sobre degradados)
  ["blanco", "noche-3", "grande"],
  ["blanco", "uh", "grande"],
  ["tinta", "rio", "grande"],
  ["tinta", "brote", "grande"],
  ["tinta", "corona-2", "grande"],
  ["tinta", "corona", "grande"],
  // Foco visible y bordes de componentes
  ["corona", "noche", "borde"],
  ["corona", "noche-2", "borde"],
  ["corona", "noche-3", "borde"],
  ["tinta", "blanco", "borde"],
  ["tinta", "dia", "borde"],
  ["tinta", "brote", "borde"],
  ["texto-tenue", "noche-2", "borde"],
  ["blanco", "rio", "borde"],
  ["tinta-2", "blanco", "borde"],
];

describe("contraste AA del tema del evento", () => {
  const t = tokens();
  it("todos los tokens de los pares existen en la hoja", () => {
    const faltan = [...new Set(PARES.flatMap(([a, b]) => [a, b]))].filter((k) => !t[k]);
    expect(faltan).toEqual([]);
  });

  it.each(PARES)("%s sobre %s (%s)", (texto, fondo, tam) => {
    const minimo = tam === "normal" ? 4.5 : 3;
    expect(contraste(t[texto], t[fondo])).toBeGreaterThanOrEqual(minimo);
  });

  it("la corona sobre blanco NO alcanza para foco: por eso el foco sobre claro usa tinta", () => {
    expect(contraste(t["corona"], t["blanco"])).toBeLessThan(3);
    const foco = REGLAS.find((r) => r.selectores.includes(".tema-evento :focus-visible"));
    expect(foco?.cuerpo).toContain("var(--evento-tinta)");
  });
});
