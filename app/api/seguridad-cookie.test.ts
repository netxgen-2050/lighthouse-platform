import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test, vi } from "vitest";
import { POST as reportar } from "./reportes/route";
import { PATCH, POST } from "./personas/route";

const COOKIE = "__Secure-neon-auth.session_token=abc";

function ajeno(url: string, metodo: "POST" | "PATCH") {
  return new Request(url, {
    method: metodo,
    headers: { cookie: COOKIE, origin: "https://sitio-ajeno.example", host: "lh.test", "content-type": "application/json" },
    body: JSON.stringify({}),
  });
}

// La sesión de Neon Auth viaja en una cookie que el navegador manda solo: cada ruta que escribe mantiene el molde de ADR-006.
test("las rutas que escriben con sesión rechazan con 403 un Origin ajeno, aunque traigan la cookie de Neon Auth", async () => {
  vi.stubEnv("LH_AUTH_PRUEBA", "");
  expect((await POST(ajeno("http://lh.test/api/personas", "POST"))).status).toBe(403);
  expect((await PATCH(ajeno("http://lh.test/api/personas", "PATCH"))).status).toBe(403);
  expect((await reportar(ajeno("http://lh.test/api/reportes", "POST"))).status).toBe(403);
  vi.unstubAllEnvs();
});

test("las rutas que escriben rechazan con 415 un tipo de contenido que no es JSON", async () => {
  const req = new Request("http://lh.test/api/personas", { method: "POST", headers: { cookie: COOKIE }, body: "a=b" });
  expect((await POST(req)).status).toBe(415);
});

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : [];
  });
}

test("ninguna ruta de app/api importa un adaptador de lib/sesion/proveedores: todo pasa por sesionDelPedido", () => {
  const raiz = path.resolve(__dirname);
  const malos = archivos(raiz).filter((f) => /lib\/sesion\/proveedores\/(privy|neon-auth|index)\b|lib\/sesion\/proveedores["']/.test(readFileSync(f, "utf8")));
  expect(malos.map((f) => path.relative(raiz, f))).toEqual([]);
});
