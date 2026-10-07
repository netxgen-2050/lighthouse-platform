import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const TOKEN = "ghp_secreto_de_prueba";
const cuerpo = { tipo: "bug", quePaso: "Se rompe", esperabas: "", contacto: "", contexto: { ruta: "/netx" } };

function pedido(datos: unknown) {
  return new Request("http://x.test/api/reportes", { method: "POST", body: JSON.stringify(datos) });
}

describe("POST /api/reportes", () => {
  const fetchOriginal = globalThis.fetch;
  let fetchSimulado: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSimulado = vi.fn();
    globalThis.fetch = fetchSimulado as unknown as typeof fetch;
    vi.stubEnv("REPORTES_GITHUB_TOKEN", TOKEN);
  });
  afterEach(() => {
    globalThis.fetch = fetchOriginal;
    vi.unstubAllEnvs();
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

  it("si GitHub falla responde 502 sin el token", async () => {
    fetchSimulado.mockResolvedValue(new Response("{}", { status: 401 }));
    const res = await POST(pedido(cuerpo));
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain(TOKEN);
  });
});
