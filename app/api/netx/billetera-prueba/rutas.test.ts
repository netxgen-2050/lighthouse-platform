import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fijarBaseParaTests, type Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { llaveAHex } from "@/lib/billetera-prueba/passkey";
import { puertoCandide, reiniciarMock } from "@/lib/integraciones/candide";
import { FIRMA_DE_PRUEBA, LLAVE_DE_PRUEBA } from "@/lib/integraciones/candide/__fixtures__/datos";
import { POST as cuenta } from "./cuenta/route";
import { POST as enviar } from "./enviar/route";
import { GET as operacion } from "./operacion/route";
import { POST as preparar } from "./preparar/route";
import { POST as firmaFuera } from "./firma-fuera/route";
import { POST as verificarFirma } from "./verificar-firma/route";

const BASE = "http://x/api/netx/billetera-prueba";
const LLAVE = llaveAHex(LLAVE_DE_PRUEBA);
let base: Db;

function pedir(
  manejador: (r: Request) => Promise<Response>,
  ruta: string,
  como: string | null,
  cuerpo?: unknown,
  metodo: "GET" | "POST" = "POST",
) {
  return manejador(
    new Request(`${BASE}/${ruta}`, {
      method: metodo,
      headers: { ...(como ? { "x-lh-prueba": como } : {}), "content-type": "application/json" },
      body: metodo === "POST" ? JSON.stringify(cuerpo ?? {}) : undefined,
    }),
  );
}

beforeEach(async () => {
  base = (await crearPglite()) as unknown as Db;
  fijarBaseParaTests(base);
  reiniciarMock();
  vi.stubEnv("LH_AUTH_PRUEBA", "1");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("LH_ACCESO", "");
  vi.stubEnv("LH_PERSONAS", "super@prueba.test=superadmin:usuario;ana@prueba.test=persona:usuario;adm@prueba.test=admin-tribu:usuario");
  vi.stubEnv("LH_PRUEBA_CANDIDE", "1");
  vi.stubEnv("LH_PRUEBA_CANDIDE_SIMULADO", "1");
});
afterEach(() => {
  fijarBaseParaTests(null);
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("la prueba está apagada por defecto", () => {
  it("404 sin la variable, también en Production sin ella, y no llama al puerto", async () => {
    const espia = vi.spyOn(puertoCandide(), "calcularDireccion");
    vi.stubEnv("LH_PRUEBA_CANDIDE", "");
    expect((await pedir(cuenta, "cuenta", "super@prueba.test", LLAVE)).status).toBe(404);
    vi.stubEnv("VERCEL_ENV", "production");
    expect((await pedir(cuenta, "cuenta", "super@prueba.test", LLAVE)).status).toBe(404);
    expect((await pedir(operacion, "operacion", "super@prueba.test", undefined, "GET")).status).toBe(404);
    expect(espia).not.toHaveBeenCalled();
  });

  it("en Production con la variable funciona como en un preview", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    // En Production no hay modo de prueba de login (se ignora), así que sin sesión real es 401: llega hasta la sesión, no 404.
    expect((await pedir(cuenta, "cuenta", null, LLAVE)).status).toBe(401);
  });
});

describe("solo el super admin", () => {
  it("401 sin sesión, 403 con persona o admin de tribu, y no se llama al puerto", async () => {
    const p = puertoCandide();
    const espias = [vi.spyOn(p, "calcularDireccion"), vi.spyOn(p, "prepararPrimeraOperacion"), vi.spyOn(p, "enviarOperacion"), vi.spyOn(p, "consultarOperacion")];
    expect((await pedir(cuenta, "cuenta", null, LLAVE)).status).toBe(401);
    for (const quien of ["ana@prueba.test", "adm@prueba.test"]) {
      expect((await pedir(cuenta, "cuenta", quien, LLAVE)).status).toBe(403);
      expect((await pedir(preparar, "preparar", quien, LLAVE)).status).toBe(403);
      expect((await pedir(enviar, "enviar", quien, { ...LLAVE, operacion: {}, firma: FIRMA_DE_PRUEBA })).status).toBe(403);
      expect((await pedir(operacion, "operacion", quien, undefined, "GET")).status).toBe(403);
      expect((await pedir(firmaFuera, "firma-fuera", quien, LLAVE)).status).toBe(403);
      expect((await pedir(verificarFirma, "verificar-firma", quien, LLAVE)).status).toBe(403);
    }
    for (const e of espias) expect(e).not.toHaveBeenCalled();
  });

  it("las respuestas no se guardan en caché", async () => {
    const r = await pedir(cuenta, "cuenta", "super@prueba.test", LLAVE);
    expect(r.headers.get("cache-control")).toBe("no-store");
  });
});

describe("recorrido completo con el mock", () => {
  it("cuenta → preparar → enviar → operación (enviada, incluida) → firma fuera → verificar", async () => {
    const como = "super@prueba.test";
    const c = await (await pedir(cuenta, "cuenta", como, LLAVE)).json();
    expect(c).toMatchObject({ ok: true, desplegada: false, configurado: true });
    expect(c.direccion).toMatch(/^0x[0-9a-fA-F]{40}$/);
    // Misma passkey, misma dirección.
    expect((await (await pedir(cuenta, "cuenta", como, LLAVE)).json()).direccion).toBe(c.direccion);

    expect((await pedir(firmaFuera, "firma-fuera", como, LLAVE)).status).toBe(409);
    expect((await pedir(verificarFirma, "verificar-firma", como, { ...LLAVE, tiempo: "1", firma: FIRMA_DE_PRUEBA })).status).toBe(409);

    const pr = await (await pedir(preparar, "preparar", como, LLAVE)).json();
    expect(pr.ok).toBe(true);
    const env = await pedir(enviar, "enviar", como, { ...LLAVE, operacion: pr.operacion, firma: FIRMA_DE_PRUEBA });
    expect(env.status).toBe(200);
    const { hashOperacion } = await env.json();

    const consultar = async () =>
      (await (await pedir(operacion, `operacion?hash=${hashOperacion}`, como, undefined, "GET")).json()) as { estado: string };
    expect((await consultar()).estado).toBe("enviada");
    expect((await consultar()).estado).toBe("incluida");

    const f = await (await pedir(firmaFuera, "firma-fuera", como, LLAVE)).json();
    expect(f).toMatchObject({ ok: true });
    const v = await (await pedir(verificarFirma, "verificar-firma", como, { ...LLAVE, tiempo: f.tiempo, firma: FIRMA_DE_PRUEBA })).json();
    expect(v.veredicto.resultado).toBe("valida");
  });
});

describe("entradas inválidas", () => {
  it("400 'Llave pública inválida' sin llamar al puerto", async () => {
    const espia = vi.spyOn(puertoCandide(), "calcularDireccion");
    for (const mala of [{}, { x: "0x1", y: "0x2" }, { x: 1, y: 2 }]) {
      const r = await pedir(cuenta, "cuenta", "super@prueba.test", mala);
      expect(r.status).toBe(400);
      expect((await r.json()).error).toBe("Llave pública inválida");
    }
    expect(espia).not.toHaveBeenCalled();
  });

  it("400 'La operación no cumple la política de gas' con un callData alterado, y no se envía", async () => {
    const como = "super@prueba.test";
    const pr = await (await pedir(preparar, "preparar", como, LLAVE)).json();
    const espia = vi.spyOn(puertoCandide(), "consultarOperacion");
    const alterada = { ...pr.operacion, callData: pr.operacion.callData.slice(0, -4) + "ffff" };
    const r = await pedir(enviar, "enviar", como, { ...LLAVE, operacion: alterada, firma: FIRMA_DE_PRUEBA });
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe("La operación no cumple la política de gas");
    expect(espia).not.toHaveBeenCalled();
  });

  it("400 si el remitente no es la Safe de esta passkey", async () => {
    const como = "super@prueba.test";
    const pr = await (await pedir(preparar, "preparar", como, LLAVE)).json();
    const ajena = { ...pr.operacion, sender: "0x2222222222222222222222222222222222222222" };
    const r = await pedir(enviar, "enviar", como, { ...LLAVE, operacion: ajena, firma: FIRMA_DE_PRUEBA });
    expect(r.status).toBe(400);
  });

  it("400 con cuerpo que no es JSON, operación mal formada, hash inválido y firma inválida", async () => {
    const como = "super@prueba.test";
    const malo = await cuenta(new Request(`${BASE}/cuenta`, { method: "POST", headers: { "x-lh-prueba": como, "content-type": "application/json" }, body: "no json" }));
    expect(malo.status).toBe(400);
    expect((await pedir(enviar, "enviar", como, { ...LLAVE, operacion: { sender: "x" }, firma: FIRMA_DE_PRUEBA })).status).toBe(400);
    expect((await pedir(operacion, "operacion?hash=0x12", como, undefined, "GET")).status).toBe(400);
    const pr = await (await pedir(preparar, "preparar", como, LLAVE)).json();
    expect((await pedir(enviar, "enviar", como, { ...LLAVE, operacion: pr.operacion, firma: { signature: "x" } })).status).toBe(400);
  });

  it("415 si el pedido de escritura no es JSON", async () => {
    const r = await cuenta(new Request(`${BASE}/cuenta`, { method: "POST", headers: { "x-lh-prueba": "super@prueba.test" }, body: "{}" }));
    expect(r.status).toBe(415);
  });
});
