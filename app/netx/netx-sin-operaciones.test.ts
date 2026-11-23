import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Regla del cambio vista-netx-financiamiento: ninguna pestaña de /netx lee datos de personas. Las operaciones (pendientes,
// personas y roles) están en /admin, protegido en el servidor.
// (Armados con "@/lib/" + nombre para que un grep de esos imports en app/netx no encuentre este archivo.)
const LIB = "@/lib/";
const PROHIBIDOS = ["panel-personas", `${LIB}contactos/almacen`, `${LIB}postulaciones/almacen`, `${LIB}sesion`, `${LIB}db`];

function archivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? archivos(join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".test.ts") ? [join(dir, e.name)] : [],
  );
}

describe("app/netx no lee datos de personas", () => {
  for (const f of archivos(__dirname)) {
    test(f.slice(__dirname.length + 1), () => {
      const src = readFileSync(f, "utf8");
      for (const p of PROHIBIDOS) {
        expect(src, `${f} importa ${p}`).not.toMatch(new RegExp(`from\\s+["'][^"']*${p.replace(/[/@.-]/g, "\\$&")}`));
      }
    });
  }
});
