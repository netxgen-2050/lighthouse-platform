import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Las piezas del evento no pueden depender del marco de NetX (spec: "Piezas del evento portables").
const PERMITIDOS = [
  /^react$/,
  /^react\/jsx-runtime$/,
  /^@\/lib\/congreso\/evento$/,
  /^@\/lib\/congreso\/formatos$/,
  /^\.\/[a-z-]+$/, // archivos de la misma carpeta
  /^\.\.\/tema-evento\.css$/, // la hoja del tema
];
const PERMITIDOS_SOLO_FUENTES = /^next\/font\/google$/;

// Las secciones (carpeta `secciones/`) pueden además usar las piezas de la carpeta de arriba.
const PERMITIDOS_SECCIONES = [/^\.\.\/[a-z-]+$/];

const CARPETA_PIEZAS = __dirname;
const CARPETA_SECCIONES = path.join(__dirname, "secciones");
const CARPETAS = [CARPETA_PIEZAS, CARPETA_SECCIONES];

/** Rutas relativas a `evento/` ("boton.tsx", "secciones/heroe.tsx"). */
const FUENTES = CARPETAS.flatMap((dir) =>
  readdirSync(dir)
    .filter((n) => /\.(tsx?|css)$/.test(n) && !/\.test\./.test(n))
    .map((n) => path.relative(__dirname, path.join(dir, n))),
);

function importaciones(codigo: string): string[] {
  const salida: string[] = [];
  for (const m of codigo.matchAll(/(?:^|\n)\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']/g)) salida.push(m[1]);
  for (const m of codigo.matchAll(/(?:^|\n)\s*import\s+["']([^"']+)["']/g)) salida.push(m[1]);
  for (const m of codigo.matchAll(/\b(?:require|import)\(\s*["']([^"']+)["']\s*\)/g)) salida.push(m[1]);
  return salida;
}

describe("portabilidad de las piezas del evento", () => {
  it("hay piezas para revisar", () => {
    expect(FUENTES.length).toBeGreaterThanOrEqual(7);
  });

  it("incluye las diez piezas de la carpeta de secciones", () => {
    const secciones = FUENTES.filter((f) => f.startsWith("secciones"));
    expect(secciones.length).toBeGreaterThanOrEqual(10);
  });

  it.each(FUENTES)("%s importa solo lo permitido", (archivo) => {
    const codigo = readFileSync(path.join(__dirname, archivo), "utf8");
    const enSecciones = archivo.startsWith("secciones");
    const malos = importaciones(codigo).filter((ruta) => {
      if (PERMITIDOS.some((p) => p.test(ruta))) return false;
      if (enSecciones && PERMITIDOS_SECCIONES.some((p) => p.test(ruta))) return false;
      if (archivo === "fuentes.ts" && PERMITIDOS_SOLO_FUENTES.test(ruta)) return false;
      return true;
    });
    expect(malos).toEqual([]);
  });

  it("detecta importaciones prohibidas", () => {
    const prohibidas = [
      "@/components/termino-legal",
      "@/lib/demo/bitacora",
      "@/lib/legal/terminos",
      "@/components/sesion/proveedor-sesion",
      "@/components/rail",
      "@/components/barra-superior",
      "next/navigation",
      "next/link",
    ];
    for (const ruta of prohibidas) expect(PERMITIDOS.some((p) => p.test(ruta))).toBe(false);
  });

  it("las piezas usan enlaces simples (sin next/link ni next/navigation)", () => {
    for (const archivo of FUENTES) {
      const codigo = readFileSync(path.join(__dirname, archivo), "utf8");
      expect(codigo).not.toMatch(/next\/(link|navigation)/);
    }
  });
});
