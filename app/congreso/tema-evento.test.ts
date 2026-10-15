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
    const NOMBRES = /\b(?:white|black|red|green|blue|yellow|orange|purple|pink|brown|gray|grey|silver|gold|navy|teal|aqua|cyan|magenta|lime|maroon|olive|fuchsia|indigo|violet|crimson|coral|salmon|tan|ivory|beige|khaki|lavender|plum|orchid|turquoise|azure|snow)\b/i;
    const malas: string[] = [];
    for (const r of REGLAS) {
      for (const decl of r.cuerpo.split(";")) {
        const [prop, ...resto] = decl.split(":");
        const valor = resto.join(":");
        if (!/(color|background|border|outline|fill|stroke|shadow)/i.test(prop)) continue;
        // Los nombres dentro de var(--evento-…) son tokens, no colores sueltos.
        if (NOMBRES.test(valor.replace(/var\(--evento-[a-z0-9-]+\)/g, ""))) malas.push(`${r.selectores.join(", ")} → ${decl.trim()}`);
      }
    }
    expect(malas).toEqual([]);
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
  ["texto-tenue", "noche-3", "normal"],
  ["lila-claro", "noche", "normal"],
  ["lila-claro", "noche-2", "normal"],
  ["lila-claro", "resplandor", "normal"],
  ["corona", "noche", "normal"],
  ["corona", "noche-2", "normal"],
  ["corona", "resplandor", "normal"],
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
  ["corona", "resplandor", "borde"],
  ["tinta", "blanco", "borde"],
  ["tinta", "dia", "borde"],
  ["tinta", "brote", "borde"],
  ["texto-tenue", "noche-2", "borde"],
  ["blanco", "rio", "borde"],
  ["tinta-2", "blanco", "borde"],
  // Vitrina (design §8): El encuentro. El texto queda sobre la parte oscura del amanecer; las paradas claras
  // (amanecer-3 y corona-2) quedan bajo el último párrafo (padding-bottom) y solo son transición, sin texto encima.
  ["blanco", "noche", "normal"],
  ["blanco", "amanecer-1", "normal"],
  ["blanco", "amanecer-2", "normal"],
  // Tribus (sobre brote), ejes (sobre río), entradas (sobre noche-2) y cifras (sobre noche)
  ["tinta", "brote", "normal"],
  ["blanco", "rio", "normal"],
  ["texto-claro", "noche-2", "normal"],
  ["texto-tenue", "noche", "normal"],
  ["texto-claro", "noche", "normal"],
  ["corona", "noche", "normal"],
  // Ticket y puente con NetX (degradado de noche a bosque)
  ["blanco", "bosque", "normal"],
  ["texto-bosque", "noche", "normal"],
  ["texto-bosque", "bosque", "normal"],
  ["texto-bosque", "noche-2", "normal"],
  ["texto-claro-2", "noche-2", "normal"],
  ["uh-claro", "noche", "normal"],
  ["uh-claro", "bosque", "normal"],
  ["brote", "noche", "normal"],
  ["brote", "bosque", "normal"],
  ["brote", "noche-2", "normal"],
  ["error", "noche-2", "normal"],
  ["noche", "brote", "normal"],
  ["corona", "bosque", "borde"],
  ["texto-tenue", "noche-2", "borde"],
  // Mapa del territorio (rótulo con texto, sobre tierra) y modo de origen (contornos)
  ["tinta", "tierra", "normal"],
  ["blanco", "noche", "borde"],
  ["netx", "noche", "borde"],
  ["netx", "blanco", "borde"],
  ["uh", "noche", "borde"],
  ["uh", "blanco", "borde"],
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

  it("el foco de cada sección oscura lo fija la propia sección, con un color que llega a 3:1", () => {
    const colorDeFoco = (seccion: string) => {
      const r = REGLAS.find((x) => x.selectores.includes(`.tema-evento ${seccion} :focus-visible`));
      return /outline-color:\s*var\(--evento-([a-z0-9-]+)\)/.exec(r?.cuerpo ?? "")?.[1];
    };
    const fondos: Record<string, string> = {
      ".ev-hero": "noche",
      ".ev-acerca": "amanecer-1",
      ".ev-entradas-seccion": "noche",
      ".ev-cierre": "noche",
      ".ev-ejes-seccion": "rio",
      ".ev-ticket-seccion": "bosque",
    };
    for (const [seccion, fondo] of Object.entries(fondos)) {
      const foco = colorDeFoco(seccion);
      expect(foco, seccion).toBeDefined();
      expect(contraste(t[foco!], t[fondo]), seccion).toBeGreaterThanOrEqual(3);
    }
  });

  it("la bajada de cada sección oscura se aclara por la propia sección y llega a 4,5:1", () => {
    const fondos: Record<string, string> = {
      ".ev-hero": "noche",
      ".ev-acerca": "amanecer-1",
      ".ev-entradas-seccion": "noche",
      ".ev-cierre": "noche",
      ".ev-ejes-seccion": "rio",
      ".ev-ticket-seccion": "bosque",
    };
    for (const [seccion, fondo] of Object.entries(fondos)) {
      const r = REGLAS.find((x) => x.selectores.includes(`.tema-evento ${seccion} .ev-bajada`));
      const token = /color:\s*var\(--evento-([a-z0-9-]+)\)/.exec(r?.cuerpo ?? "")?.[1];
      expect(token, seccion).toBeDefined();
      expect(contraste(t[token!], t[fondo]), seccion).toBeGreaterThanOrEqual(4.5);
      if (seccion === ".ev-acerca") expect(contraste(t[token!], t["amanecer-2"]), seccion).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("la corona sobre río NO alcanza para foco: por eso ahí el foco es blanco", () => {
    expect(contraste(t["corona"], t["rio"])).toBeLessThan(3);
  });
});
