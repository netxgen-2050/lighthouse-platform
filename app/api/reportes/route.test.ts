import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sesionDelPedido } from "@/lib/sesion/servidor";
import { limiteSinCuenta } from "@/lib/reportes/limite";
import { POST } from "./route";

vi.mock("@/lib/sesion/servidor", () => ({ sesionDelPedido: vi.fn() }));
const sesionSimulada = vi.mocked(sesionDelPedido);

const TOKEN = "ghp_secreto_de_prueba";
const cuerpo = { tipo: "bug", quePaso: "Se rompe", esperabas: "", contacto: "", contexto: { ruta: "/netx" } };

function pedido(datos: unknown, cabeceras: Record<string, string> = {}) {
  return new Request("http://x.test/api/reportes", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cabeceras },
    body: JSON.stringify(datos),
  });
}

const creado = (n = 51) => new Response(JSON.stringify({ number: n }), { status: 201 });

describe("POST /api/reportes", () => {
  const fetchOriginal = globalThis.fetch;
  let fetchSimulado: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    limiteSinCuenta.reiniciar();
    fetchSimulado = vi.fn();
    globalThis.fetch = fetchSimulado as unknown as typeof fetch;
    vi.stubEnv("REPORTES_GITHUB_TOKEN", TOKEN);
    sesionSimulada.mockResolvedValue({
      estado: 200,
      idPersona: "p1",
      personaId: null,
      persona: { email: "persona@prueba.test", rol: "persona", perfil: "usuario", tribuAdmin: null } as never,
    });
  });
  afterEach(() => {
    globalThis.fetch = fetchOriginal;
    vi.unstubAllEnvs();
  });

  it("sin sesión crea el issue con la etiqueta `sin-cuenta`", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    fetchSimulado.mockResolvedValue(creado());
    const res = await POST(pedido(cuerpo));
    expect(await res.json()).toEqual({ ok: true, numero: 51 });
    const enviado = JSON.parse(fetchSimulado.mock.calls[0][1].body);
    expect(enviado.labels).toEqual(["reporte", "bug", "sin-cuenta"]);
    expect(enviado.body).toContain("**Enviado sin cuenta**");
  });

  it("con 403 (fuera de la lista) se trata como sin cuenta", async () => {
    sesionSimulada.mockResolvedValue({ estado: 403 });
    fetchSimulado.mockResolvedValue(creado());
    const res = await POST(pedido(cuerpo));
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchSimulado.mock.calls[0][1].body).labels).toContain("sin-cuenta");
  });

  it("con credenciales que el servidor no acepta responde 401 sin crear nada ni contar", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    const credenciales: Record<string, string>[] = [{ Authorization: "Bearer vencido" }, { "x-lh-prueba": "x@prueba.test" }];
    for (const h of credenciales) {
      const res = await POST(pedido(cuerpo, h));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ ok: false, sesion: false });
    }
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("con sesión no lleva `sin-cuenta`", async () => {
    fetchSimulado.mockResolvedValue(creado());
    await POST(pedido(cuerpo));
    expect(JSON.parse(fetchSimulado.mock.calls[0][1].body).labels).toEqual(["reporte", "bug"]);
  });

  it("sin cuenta ignora `privacidad` y valida el email", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    fetchSimulado.mockResolvedValue(creado());
    const malo = await POST(pedido({ ...cuerpo, contacto: "juan" }));
    expect(malo.status).toBe(400);
    expect(fetchSimulado).not.toHaveBeenCalled();
    await POST(pedido({ ...cuerpo, tipo: "pregunta", privacidad: true }));
    expect(JSON.parse(fetchSimulado.mock.calls[0][1].body).labels).toEqual(["reporte", "pregunta", "sin-cuenta"]);
  });

  it("sin cuenta el issue no lleva la IP ni la query", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    fetchSimulado.mockResolvedValue(creado());
    await POST(
      pedido(
        { ...cuerpo, contexto: { url: "http://x.test/sumarte?volver=%2Fpactos", ruta: "/sumarte?volver=%2Fpactos" } },
        { "x-forwarded-for": "203.0.113.7" },
      ),
    );
    const bruto = fetchSimulado.mock.calls[0][1].body as string;
    expect(bruto).not.toContain("203.0.113.7");
    expect(bruto).not.toContain("volver=");
    expect(bruto).toContain("/sumarte");
  });

  it("el 6.º pedido sin sesión desde la misma IP da 429 sin llamar a GitHub y sin loguear la IP", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    fetchSimulado.mockImplementation(async () => creado());
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const h = { "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 5; i++) expect((await POST(pedido(cuerpo, h))).status).toBe(200);
    const res = await POST(pedido(cuerpo, h));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect((await res.json()).reintentarEnSegundos).toBeGreaterThan(0);
    expect(fetchSimulado).toHaveBeenCalledTimes(5);
    expect(JSON.stringify(log.mock.calls)).not.toContain("203.0.113.7");
    log.mockRestore();
  });

  it("con sesión, 6 pedidos en 10 minutos crean 6 issues", async () => {
    fetchSimulado.mockImplementation(async () => creado());
    for (let i = 0; i < 6; i++) expect((await POST(pedido(cuerpo, { "x-forwarded-for": "203.0.113.7" }))).status).toBe(200);
    expect(fetchSimulado).toHaveBeenCalledTimes(6);
  });

  it("lo que falla en GitHub no consume cupo", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchSimulado.mockImplementation(async () => new Response("{}", { status: 500 }));
    const h = { "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 5; i++) expect((await POST(pedido(cuerpo, h))).status).toBe(502);
    expect((await POST(pedido(cuerpo, h))).status).toBe(502);
  });

  it("sin token tampoco consume cupo", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    vi.stubEnv("REPORTES_GITHUB_TOKEN", "");
    const h = { "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 6; i++) expect((await POST(pedido(cuerpo, h))).status).toBe(503);
  });

  it("413 con Content-Length grande y con cuerpo grande sin Content-Length", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    const declarado = await POST(pedido(cuerpo, { "Content-Length": "100000" }));
    expect(declarado.status).toBe(413);
    const grande = { ...cuerpo, quePaso: "a".repeat(100 * 1024) };
    expect((await POST(pedido(grande))).status).toBe(413);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("el campo trampa sin sesión no llama a GitHub ni cuenta para el límite", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    fetchSimulado.mockImplementation(async () => creado());
    const h = { "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 6; i++) {
      const res = await POST(pedido({ ...cuerpo, sitioWeb: "spam" }, h));
      expect(await res.json()).toEqual({ ok: true, numero: 0 });
    }
    expect(fetchSimulado).not.toHaveBeenCalled();
    expect((await POST(pedido(cuerpo, h))).status).toBe(200);
  });

  it("Content-Type distinto de JSON responde 415 sin llamar a GitHub", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    const res = await POST(pedido(cuerpo, { "Content-Type": "text/plain" }));
    expect(res.status).toBe(415);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("Origin de otro host responde 403; del mismo host pasa", async () => {
    sesionSimulada.mockResolvedValue({ estado: 401 });
    fetchSimulado.mockResolvedValue(creado());
    const ajeno = await POST(pedido(cuerpo, { Origin: "https://otro.example", Host: "x.test" }));
    expect(ajeno.status).toBe(403);
    expect(fetchSimulado).not.toHaveBeenCalled();
    const propio = await POST(pedido(cuerpo, { Origin: "http://x.test", host: "x.test" }));
    expect(propio.status).toBe(200);
  });

  it("un pedido de privacidad lleva la etiqueta `privacidad`", async () => {
    fetchSimulado.mockResolvedValue(new Response(JSON.stringify({ number: 43 }), { status: 201 }));
    const res = await POST(pedido({ ...cuerpo, tipo: "pregunta", privacidad: true }));
    expect(res.status).toBe(200);
    const enviado = JSON.parse(fetchSimulado.mock.calls[0][1].body);
    expect(enviado.labels).toEqual(["reporte", "pregunta", "privacidad"]);
  });

  it("crea el issue con título, etiquetas y token, y no filtra el token", async () => {
    fetchSimulado.mockResolvedValue(new Response(JSON.stringify({ number: 42 }), { status: 201 }));
    const res = await POST(pedido(cuerpo));
    const texto = await res.text();
    expect(JSON.parse(texto)).toEqual({ ok: true, numero: 42 });
    expect(texto).not.toContain(TOKEN);
    const [url, init] = fetchSimulado.mock.calls[0];
    expect(url).toBe("https://api.github.com/repos/netxgen-2050/lighthouse-platform/issues");
    expect(init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    const enviado = JSON.parse(init.body);
    expect(enviado.title).toBe("[bug] Se rompe");
    expect(enviado.labels).toEqual(["reporte", "bug"]);
    expect(enviado.body).toContain("/netx");
  });

  it("sin token responde 503 configurado:false", async () => {
    vi.stubEnv("REPORTES_GITHUB_TOKEN", "");
    const res = await POST(pedido(cuerpo));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ configurado: false });
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("con el campo trampa no crea nada", async () => {
    const res = await POST(pedido({ ...cuerpo, sitioWeb: "spam" }));
    expect(res.status).toBe(200);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("rechaza datos inválidos", async () => {
    const res = await POST(pedido({ ...cuerpo, quePaso: "" }));
    expect(res.status).toBe(400);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("registra solo el status y el message de GitHub, sin el token ni el reporte", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchSimulado.mockResolvedValue(
      new Response(JSON.stringify({ message: "Bad credentials" }), { status: 401 }),
    );
    const res = await POST(pedido(cuerpo));
    expect(await res.json()).toEqual({ ok: false, configurado: true });
    const registrado = JSON.stringify(log.mock.calls);
    expect(registrado).toContain("401");
    expect(registrado).toContain("Bad credentials");
    expect(registrado).not.toContain(TOKEN);
    expect(registrado).not.toContain("Se rompe");
    log.mockRestore();
  });

  it("si GitHub falla responde 502 sin el token", async () => {
    fetchSimulado.mockResolvedValue(new Response("{}", { status: 401 }));
    const res = await POST(pedido(cuerpo));
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain(TOKEN);
  });
});
