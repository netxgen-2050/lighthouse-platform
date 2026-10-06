import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const RAIZ = path.resolve(__dirname, "..");
const PROHIBIDO = /#[0-9a-fA-F]{3,8}\b|\b(?:emerald|stone|amber)-\d/;

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.(tsx?|css)$/.test(n) && !p.endsWith(path.join("app", "globals.css")) ? [p] : [];
  });
}

test("app/ y components/ no usan colores sueltos fuera de globals.css", () => {
  const malos = [...archivos(path.join(RAIZ, "app")), ...archivos(path.join(RAIZ, "components"))].filter((f) =>
    PROHIBIDO.test(readFileSync(f, "utf8")),
  );
  expect(malos).toEqual([]);
});
