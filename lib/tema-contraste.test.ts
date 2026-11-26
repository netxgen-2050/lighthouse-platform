import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { CLASE_DEGRADADO_DEL_HEROE } from "@/components/explorar/heroe-valle-clases";

// Lee los tokens de app/globals.css y comprueba el contraste WCAG de los pares que la app usa juntos.
// Agregá acá cada par nuevo de texto y fondo que empiece a usarse.
const CSS = readFileSync(path.resolve(__dirname, "..", "app", "globals.css"), "utf8");

type Rgba = [number, number, number, number];

function bloque(inicio: RegExp): string {
  const m = inicio.exec(CSS);
  if (!m) throw new Error(`No encontré el bloque ${inicio}`);
  const desde = CSS.indexOf("{", m.index) + 1;
  return CSS.slice(desde, CSS.indexOf("\n}", desde));
}

function tokens(texto: string): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const m of texto.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6,8})\s*;/g)) salida[m[1]] = m[2];
  return salida;
}

const CLARO = tokens(bloque(/@theme static/));
const OSCURO = { ...CLARO, ...tokens(bloque(/:root\[data-tema="oscuro"\]/)) };

function aRgba(hex: string): Rgba {
  const h = hex.slice(1);
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
}

function mezclar(arriba: Rgba, abajo: Rgba): Rgba {
  const a = arriba[3];
  return [0, 1, 2].map((i) => arriba[i] * a + abajo[i] * (1 - a)).concat(1) as Rgba;
}

function luminancia([r, g, b]: Rgba): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contraste(a: Rgba, b: Rgba): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const BLANCO: Rgba = [255, 255, 255, 1];
const NEGRO: Rgba = [0, 0, 0, 1];

const PARES_TEXTO: [string, string][] = [
  ["ink", "bg"],
  ["ink", "surface"],
  ["ink", "surface-2"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["muted", "surface-2"],
  ["faint", "bg"],
  ["on-deep", "deep"],
  ["on-deep", "deep-2"],
  ["on-deep-muted", "deep"],
  ["gold-ink", "gold-soft"],
  ["warn-ink", "warn-bg"],
  ["danger", "bg"],
  ["danger", "surface"],
  ["ink", "gold"],
  // ux-base: cinta de prototipo (bg sobre ink).
  ["bg", "ink"],
  // ux-base, rail sobre `surface`: reposo (muted/surface), hover (muted/surface-2), etiqueta activa (ink/surface) y píldora
  // (on-deep/deep) ya están en la lista de arriba; no se repiten.
];

const REGEN = ["regen-1", "regen-2", "regen-3", "regen-4", "regen-5"];

describe.each([
  ["oscuro", OSCURO],
  ["claro", CLARO],
])("tema %s", (nombre, t) => {
  const c = (n: string): Rgba => {
    if (!t[n]) throw new Error(`Falta el token ${n} en el tema ${nombre}`);
    return aRgba(t[n]);
  };

  test.each(PARES_TEXTO)("texto %s sobre %s llega a 4,5:1", (texto, fondo) => {
    const r = contraste(c(texto), c(fondo));
    expect(r, `${texto} sobre ${fondo} en el tema ${nombre}: ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });

  test.each([["blanco", BLANCO], ["negro", NEGRO]] as const)("ink sobre el vidrio mezclado con %s llega a 4,5:1", (_n, base) => {
    const vidrio = mezclar(c("vidrio"), base);
    const r = contraste(c("ink"), vidrio);
    expect(r, `ink sobre vidrio con ${_n} en el tema ${nombre}: ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });

  // Héroe del valle (Inicio y Barrio Norte): el texto va sobre `bg` con la opacidad de CLASE_DEGRADADO_DEL_HEROE, y detrás puede
  // haber cualquier parte de la foto: se mide en el peor caso (toda blanca o toda negra). El título grande usa deep-2 (3:1).
  test.each([["blanco", BLANCO], ["negro", NEGRO]] as const)("texto del héroe del valle sobre la foto %s", (_n, base) => {
    const m = /via-bg\/(\d+)/.exec(CLASE_DEGRADADO_DEL_HEROE);
    expect(m, "CLASE_DEGRADADO_DEL_HEROE tiene que traer via-bg/NN").not.toBeNull();
    const [r, g, b] = aRgba(t.bg);
    const fondo = mezclar([r, g, b, Number(m![1]) / 100], base);
    const ink = contraste(c("ink"), fondo);
    expect(ink, `ink sobre el héroe con foto ${_n} en el tema ${nombre}: ${ink.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    const titulo = contraste(c("deep-2"), fondo);
    expect(titulo, `deep-2 (título grande) sobre el héroe con foto ${_n} en el tema ${nombre}: ${titulo.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
  });

  test.each(REGEN.flatMap((r) => [[r, "bg"], [r, "surface"]]))("escala %s contra %s llega a 3:1", (tono, fondo) => {
    const r = contraste(c(tono), c(fondo));
    expect(r, `${tono} contra ${fondo} en el tema ${nombre}: ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
  });
});

// Paleta de antes del rediseño (git show 1b6ed24^:app/globals.css). Única excepción: "faint" claro, oscurecido para llegar a AA.
// regen-* y vidrio son tokens nuevos del rediseño: no tienen valor de antes.
const ANTES_CLARO: Record<string, string> = {
  bg: "#f6f3ea", surface: "#fffdf7", "surface-2": "#efeadd", ink: "#14241a", muted: "#566258", line: "#e0d9c8",
  deep: "#154626", "deep-2": "#1d5731", "on-deep": "#f6f3ea", "on-deep-muted": "#b7d4bf",
  green: "#3c8c4b", "green-soft": "#dcebdf", gold: "#eda100", "gold-soft": "#fdf0c9", "gold-ink": "#6e4d00",
  blue: "#2a78d6", "blue-soft": "#dde9f8", gray: "#9b978a", "warn-bg": "#fff3d6", "warn-ink": "#5d4300",
  water: "#dbe7e4", danger: "#991b1b", violet: "#6b3fa0", "violet-soft": "#e6dcf3", clay: "#c2571a",
  "clay-ink": "#7a3408", rose: "#a8325e", "rose-soft": "#f6dbe5",
};
const ANTES_OSCURO: Record<string, string> = {
  bg: "#101a14", surface: "#17251d", "surface-2": "#203128", ink: "#eef1e8", muted: "#b9c4bb", faint: "#93a095", line: "#33473b",
  deep: "#8fd0a0", "deep-2": "#aadfb8", "on-deep": "#0d1f14", "on-deep-muted": "#1f4a2c",
  green: "#6fc283", "green-soft": "#1d3a28", gold: "#8a5d00", "gold-soft": "#3a2d0a", "gold-ink": "#f2c25a",
  blue: "#6aa8f0", "blue-soft": "#1c2f4a", gray: "#8a9a8f", "warn-bg": "#3a2d0a", "warn-ink": "#f3d58a",
  water: "#1a2e2e", danger: "#f19a9a", violet: "#b799e0", "violet-soft": "#2f2347", clay: "#e08a4f",
  "clay-ink": "#f0b48a", rose: "#e58aab", "rose-soft": "#3d1f2d",
};

test.each([
  ["claro", CLARO, ANTES_CLARO],
  ["oscuro", OSCURO, ANTES_OSCURO],
] as const)("la paleta del tema %s es la de antes del rediseño, token por token", (_n, actual, antes) => {
  for (const [token, valor] of Object.entries(antes)) {
    expect(actual[token]?.toLowerCase(), `token ${token}`).toBe(valor);
  }
});

test("la escala de diseño (radios, sombras, movimiento) está en los tokens", () => {
  for (const t of ["--radius-s: 8px", "--radius-m: 14px", "--radius-l: 20px", "--sombra-1:", "--sombra-2:", "--sombra-3:", "--dur: 180ms", "--curva: cubic-bezier(0.2, 0.8, 0.2, 1)"]) {
    expect(CSS, t).toContain(t);
  }
  // Movimiento reducido (preferencia de la app o del sistema): la duración pasa a 0.
  expect(CSS).toMatch(/:root\[data-movimiento="reducido"\] \{\s*--dur: 0ms;/);
  expect(CSS).toMatch(/prefers-reduced-motion: reduce\) \{\s*:root \{\s*--dur: 0ms;/);
});

test("faint claro es la única excepción: oscurecido de #8a8678 a #6f6b5d para llegar a AA", () => {
  expect(CLARO.faint).toBe("#6f6b5d");
});
