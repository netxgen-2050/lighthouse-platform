import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fijarBaseParaTests, type Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { cambiosDeRol, personas } from "@/lib/db/schema";
import { GET as sesion } from "../sesion/route";
import { GET, PATCH, POST } from "./route";

let base: Db;

function pedir(metodo: "GET" | "POST" | "PATCH", como: string | null, cuerpo?: unknown) {
  const req = new Request("http://x/api/personas", {
    method: metodo,
    headers: { ...(como ? { "x-lh-prueba": como } : {}), "content-type": "application/json" },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  return { GET, POST, PATCH }[metodo](req);
}

async function idDe(email: string) {
  const [f] = await base.select({ id: personas.id }).from(personas).where(eq(personas.email, email));
  return f!.id;
}

beforeEach(async () => {
  base = (await crearPglite()) as unknown as Db;
  fijarBaseParaTests(base);
  vi.stubEnv("LH_AUTH_PRUEBA", "1");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("LH_ACCESO", "");
  vi.stubEnv("LH_PERSONAS", "super@prueba.test=superadmin:usuario;otro@prueba.test=superadmin:usuario;ana@prueba.test=persona:usuario");
});
afterEach(() => {
  fijarBaseParaTests(null);
  vi.unstubAllEnvs();
});

describe("/api/personas", () => {
  it("quien no es super admin recibe 403 y no cambia nada", async () => {
    await pedir("GET", "ana@prueba.test"); // carga inicial
    const antes = await base.select().from(personas);
    const r = await pedir("PATCH", "ana@prueba.test", { id: await idDe("ana@prueba.test"), rol: "superadmin" });
    expect(r.status).toBe(403);
    expect((await pedir("GET", "ana@prueba.test")).status).toBe(403);
    expect((await pedir("POST", "ana@prueba.test", { email: "z@prueba.test" })).status).toBe(403);
    expect(await base.select().from(personas)).toEqual(antes);
  });

  it("sin sesión, 401", async () => {
    expect((await pedir("GET", null)).status).toBe(401);
  });

  it("el super admin lista, cambia un rol y queda auditado; la próxima sesión trae el rol nuevo", async () => {
    expect((await pedir("GET", "super@prueba.test")).status).toBe(200);
    const id = await idDe("ana@prueba.test");
    const r = await pedir("PATCH", "super@prueba.test", { id, rol: "admin-tribu", tribuAdmin: "valle" });
    expect(r.status).toBe(200);
    expect((await r.json()).persona).toMatchObject({ rol: "admin-tribu", tribuAdmin: "valle" });
    const s = await sesion(new Request("http://x/api/sesion", { headers: { "x-lh-prueba": "ana@prueba.test" } }));
    expect(await s.json()).toMatchObject({ rol: "admin-tribu", tribuAdmin: "valle" });
    const [cambio] = await base.select().from(cambiosDeRol).where(eq(cambiosDeRol.campo, "rol"));
    expect(cambio).toMatchObject({ personaId: id, cambiadoPor: await idDe("super@prueba.test"), valorAnterior: "persona", valorNuevo: "admin-tribu" });
    expect(cambio?.cambiadoAt).toBeInstanceOf(Date);
  });

  it("pasar a persona borra la tribu; el perfil y el acceso también se cambian y se auditan", async () => {
    await pedir("GET", "super@prueba.test");
    const id = await idDe("ana@prueba.test");
    await pedir("PATCH", "super@prueba.test", { id, rol: "admin-tribu" });
    await pedir("PATCH", "super@prueba.test", { id, rol: "persona", perfil: "inversor", acceso: false });
    const [f] = await base.select().from(personas).where(eq(personas.id, id));
    expect(f).toMatchObject({ rol: "persona", perfil: "inversor", tribuAdmin: null, acceso: false });
    const campos = (await base.select().from(cambiosDeRol).where(eq(cambiosDeRol.personaId, id))).map((c) => c.campo).sort();
    expect(campos).toEqual(["acceso", "perfil", "rol", "rol", "tribu_admin", "tribu_admin"].sort());
    // Sin acceso: 403 en su próximo pedido.
    expect((await sesion(new Request("http://x/api/sesion", { headers: { "x-lh-prueba": "ana@prueba.test" } }))).status).toBe(403);
  });

  it("suma una persona por email (sin repetir) y la audita como alta", async () => {
    await pedir("GET", "super@prueba.test");
    const r = await pedir("POST", "super@prueba.test", { email: " Nueva@Prueba.test ", rol: "admin-tribu" });
    expect(r.status).toBe(201);
    expect((await r.json()).persona).toMatchObject({ email: "nueva@prueba.test", rol: "admin-tribu", tribuAdmin: "valle", acceso: true });
    expect((await pedir("POST", "super@prueba.test", { email: "NUEVA@prueba.test" })).status).toBe(409);
    expect((await pedir("POST", "super@prueba.test", { email: "sin-arroba" })).status).toBe(400);
    expect((await base.select().from(cambiosDeRol).where(eq(cambiosDeRol.campo, "alta"))).length).toBe(1);
  });

  it("valida el cuerpo", async () => {
    await pedir("GET", "super@prueba.test");
    const id = await idDe("ana@prueba.test");
    expect((await pedir("PATCH", "super@prueba.test", { id, rol: "dios" })).status).toBe(400);
    expect((await pedir("PATCH", "super@prueba.test", { id: "no-es-uuid", rol: "persona" })).status).toBe(400);
    expect((await pedir("PATCH", "super@prueba.test", { id: "00000000-0000-0000-0000-000000000000", rol: "persona" })).status).toBe(404);
  });

  it("nunca deja la plataforma sin un super admin con acceso", async () => {
    await pedir("GET", "super@prueba.test");
    const superId = await idDe("super@prueba.test");
    const otroId = await idDe("otro@prueba.test");
    // Con dos, uno puede quitarse el rol.
    expect((await pedir("PATCH", "super@prueba.test", { id: otroId, rol: "persona" })).status).toBe(200);
    // El único que queda no puede quitarse el rol ni el acceso.
    const r = await pedir("PATCH", "super@prueba.test", { id: superId, rol: "persona" });
    expect(r.status).toBe(409);
    expect((await r.json()).error).toMatch(/al menos un super admin/);
    expect((await pedir("PATCH", "super@prueba.test", { id: superId, acceso: false })).status).toBe(409);
    const [f] = await base.select().from(personas).where(eq(personas.id, superId));
    expect(f).toMatchObject({ rol: "superadmin", acceso: true });
  });

  it("dos bajas a la vez de los dos únicos super admin: una sola pasa", async () => {
    await pedir("GET", "super@prueba.test");
    const a = await idDe("super@prueba.test");
    const b = await idDe("otro@prueba.test");
    const rs = await Promise.all([
      pedir("PATCH", "super@prueba.test", { id: b, rol: "persona" }),
      pedir("PATCH", "otro@prueba.test", { id: a, rol: "persona" }),
    ]);
    const estados = rs.map((r) => r.status).sort();
    expect(estados.filter((e) => e === 200).length).toBeLessThanOrEqual(1);
    const quedan = await base.select().from(personas).where(eq(personas.rol, "superadmin"));
    expect(quedan.length).toBeGreaterThanOrEqual(1);
  });
});
