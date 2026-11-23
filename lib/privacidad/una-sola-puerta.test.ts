import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const RAIZ = path.resolve(__dirname, "..", "..");
const PERMITIDOS = [path.join("components", "sesion", "privy-puente.tsx"), path.join("components", "sesion", "proveedor-sesion.tsx")];

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return n === "node_modules" ? [] : archivos(p);
    return /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : [];
  });
}

const FUENTES = ["app", "components", "lib"].flatMap((d) => archivos(path.join(RAIZ, d)));
const fuera = (f: string) => !PERMITIDOS.some((p) => f.endsWith(p));

// Una sola puerta al login (consentimiento-alta, design §1): el login solo se abre desde el paso, al aceptar.
test("el login de Privy solo aparece en privy-puente.tsx y proveedor-sesion.tsx", () => {
  const malos = FUENTES.filter(fuera).filter((f) => {
    const t = readFileSync(f, "utf8");
    return /\buseLogin\b/.test(t) || /\bprivy\??\.login\b/.test(t) || /\{[^}]*\blogin\b[^}]*\}\s*=\s*usePrivy\(/.test(t);
  });
  expect(malos).toEqual([]);
});

test("ningún archivo fuera del proveedor llama a abrirLogin", () => {
  const malos = FUENTES.filter((f) => !f.endsWith(path.join("components", "sesion", "proveedor-sesion.tsx"))).filter((f) =>
    readFileSync(f, "utf8").includes("abrirLogin"),
  );
  expect(malos).toEqual([]);
});
