import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { CLASE_FONDO_DEL_TEXTO } from "@/components/explorar/heroe-valle-clases";

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

const OSCURO = tokens(bloque(/@theme static/));
const CLARO = { ...OSCURO, ...tokens(bloque(/:root\[data-tema="claro"\]/)) };

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

  // Héroe del valle (Inicio y Barrio Norte): el texto va sobre `bg` con la opacidad de CLASE_FONDO_DEL_TEXTO, y detrás puede
  // haber cualquier parte de la foto: se mide en el peor caso (toda blanca o toda negra). El título grande usa deep-2 (3:1).
  test.each([["blanco", BLANCO], ["negro", NEGRO]] as const)("texto del héroe del valle sobre la foto %s", (_n, base) => {
    const m = /bg-bg\/(\d+)/.exec(CLASE_FONDO_DEL_TEXTO);
    expect(m, "CLASE_FONDO_DEL_TEXTO tiene que traer bg-bg/NN").not.toBeNull();
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

test("la escala de regeneración del tema oscuro es la de la slide", () => {
  expect(REGEN.map((r) => OSCURO[r].toUpperCase())).toEqual(["#D9774A", "#E0A640", "#CFC85A", "#9DB86E", "#6FA35A"]);
});
