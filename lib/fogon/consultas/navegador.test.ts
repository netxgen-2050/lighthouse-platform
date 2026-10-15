import { describe, expect, test } from "vitest";
import { agregar } from "@/lib/cuadratico/motor";
import { CLAVES } from "@/lib/demo/claves";
import { buscarConsulta, REPARTOS_EJEMPLO } from "./ejemplo";
import { leer, RepositorioNavegador, type Almacen } from "./navegador";

function almacenSimulado(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return {
    datos,
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
  };
}

const ANTES = new Date("2026-10-20T12:00:00-03:00");
const DESPUES = new Date("2026-11-16T12:00:00-03:00");

function repo(almacen = almacenSimulado(), ahora = ANTES) {
  return { almacen, r: new RepositorioNavegador(() => almacen, () => ahora) };
}

const mio = { regeneracion: 3, resiliencia: 4 };

async function vista(r: RepositorioNavegador, id: string) {
  const l = await r.abrir(id);
  if (!l.ok) throw new Error("no abrió");
  return l.valor;
}

describe("leer", () => {
  test("descarta JSON roto, consultas desconocidas y repartos inválidos", () => {
    expect(leer("{no es json")).toEqual({ repartos: {}, cierres: {} });
    expect(leer(null)).toEqual({ repartos: {}, cierres: {} });
    const crudo = JSON.stringify({
      repartos: { u1: { regeneracion: 3 }, u2: { diez: 50 }, u3: { inexistente: 1 }, zzz: { a: 1 } },
      cierres: { u1: "no es fecha", u4: "2026-10-20T12:00:00.000Z", zzz: "2026-10-20T12:00:00.000Z" },
    });
    expect(leer(crudo)).toEqual({ repartos: { u1: { regeneracion: 3 } }, cierres: { u4: "2026-10-20T12:00:00.000Z" } });
  });
});

describe("RepositorioNavegador", () => {
  test("guardar y volver a leer un reparto", async () => {
    const { almacen, r } = repo();
    expect(await r.guardarReparto("u1", mio)).toEqual({ ok: true });
    expect(almacen.datos.has(CLAVES.fogonConsultas)).toBe(true);
    const otra = new RepositorioNavegador(() => almacen, () => ANTES);
    expect((await vista(otra, "u1")).miReparto).toEqual(mio);
  });

  test("rechaza un reparto inválido y uno de una consulta cerrada", async () => {
    const { almacen, r } = repo();
    const malo = await r.guardarReparto("u1", { regeneracion: 10, resiliencia: 5 });
    expect(malo).toMatchObject({ ok: false, error: "invalido" });
    expect(almacen.datos.size).toBe(0);
    expect(await r.guardarReparto("zzz", mio)).toMatchObject({ ok: false, error: "invalido" });
    const tarde = repo(almacen, DESPUES).r;
    expect(await tarde.guardarReparto("u1", mio)).toEqual({ ok: false, error: "cerrada" });
  });

  test("el agregado suma ejemplo + propio y cuenta solo el último reparto propio", async () => {
    const { r } = repo();
    await r.guardarReparto("u1", { regeneracion: 9 });
    await r.guardarReparto("u1", { regeneracion: 2, accesibilidad: 1 });
    await r.cerrar("u1");
    const v = await vista(r, "u1");
    if (!v.resultado.visible) throw new Error("debía verse");
    const c = buscarConsulta("u1")!;
    const esperado = agregar(
      c.opciones.map((o) => o.id),
      [...Object.values(REPARTOS_EJEMPLO.u1), { regeneracion: 2, accesibilidad: 1 }],
    );
    expect(v.resultado.agregado).toEqual(esperado);
    expect(v.resultado.participantes).toEqual({ repartieron: 6, padron: 7 });
  });

  test("cerrar y reabrir", async () => {
    const { r } = repo();
    expect((await vista(r, "u1")).estado).toBe("abierta");
    expect(await r.cerrar("u1")).toEqual({ ok: true });
    const cerrada = await vista(r, "u1");
    expect(cerrada.estado).toBe("cerrada");
    expect(cerrada.puedeCerrar).toBe(false);
    expect(cerrada.cierreManual).toBe(true);
    expect(await r.cerrar("u1")).toEqual({ ok: false });
    expect(await r.reabrir("u1")).toEqual({ ok: true });
    expect((await vista(r, "u1")).estado).toBe("abierta");
    expect(await r.reabrir("u1")).toEqual({ ok: false });
  });

  test("consulta cerrada por fecha no se puede reabrir", async () => {
    const { r } = repo(almacenSimulado(), DESPUES);
    const v = await vista(r, "u1");
    expect(v.estado).toBe("cerrada");
    expect(v.cierreManual).toBe(false);
    expect(await r.reabrir("u1")).toEqual({ ok: false });
  });

  test("con el resultado oculto no trae el agregado, solo participantes", async () => {
    const { r } = repo();
    await r.guardarReparto("u1", mio);
    const v = await vista(r, "u1");
    expect(v.resultado).toEqual({ visible: false, participantes: { repartieron: 6, padron: 7 } });
  });

  test("voto abierto: faltan lista a quien no repartió, incluido Vos hasta guardar", async () => {
    const { r } = repo();
    const antes = await vista(r, "u1");
    expect(antes.padron!.faltan.map((p) => p.nombre)).toEqual(["Persona de ejemplo 6", "Vos"]);
    expect(antes.padron!.repartos).toBeNull();
    expect(antes.padron!.sinAceptar).toBe(0);
    await r.guardarReparto("u1", mio);
    const despues = await vista(r, "u1");
    expect(despues.padron!.faltan.map((p) => p.nombre)).toEqual(["Persona de ejemplo 6"]);
    expect(despues.padron!.repartos).toBeNull();
  });

  test("voto abierto con el resultado visible trae a cada persona con su reparto, y marca el propio", async () => {
    const { r } = repo();
    await r.guardarReparto("u1", mio);
    await r.cerrar("u1");
    const { padron } = await vista(r, "u1");
    expect(padron!.repartos).toHaveLength(6);
    expect(padron!.repartos!.map((f) => f.persona.nombre).at(-1)).toBe("Vos");
    expect(padron!.repartos!.filter((f) => f.propio)).toHaveLength(1);
    expect(padron!.repartos![0].reparto).toEqual(REPARTOS_EJEMPLO.u1.p1);
  });

  test("voto abierto con resultado al votar muestra la tabla apenas guarda", async () => {
    const { r } = repo();
    expect((await vista(r, "u2")).padron!.repartos).toBeNull();
    await r.guardarReparto("u2", { diez: 2 });
    expect((await vista(r, "u2")).padron!.repartos).toHaveLength(6);
  });

  test("voto secreto: padron es null siempre", async () => {
    const { r } = repo();
    expect((await vista(r, "u3")).padron).toBeNull();
    await r.guardarReparto("u3", { residencial: 2 });
    await r.cerrar("u3");
    const v = await vista(r, "u3");
    expect(v.padron).toBeNull();
    expect(v.resultado.visible).toBe(true);
  });

  test("listar trae estado, yaReparti y participantes", async () => {
    const { r } = repo();
    await r.guardarReparto("u4", { vivero: 2 });
    const l = await r.listar();
    if (!l.ok) throw new Error("no listó");
    expect(l.valor.map((x) => x.consulta.id)).toEqual(["u1", "u2", "u3", "u4"]);
    expect(l.valor.map((x) => x.yaReparti)).toEqual([false, false, false, true]);
    expect(l.valor.every((x) => x.estado === "abierta")).toBe(true);
    expect(l.valor[3].participantes).toEqual({ repartieron: 6, padron: 7 });
  });

  test("consulta desconocida: no-encontrada; almacenamiento roto: falla", async () => {
    const { r } = repo();
    expect(await r.abrir("zzz")).toEqual({ ok: false, error: "no-encontrada" });
    const roto = new RepositorioNavegador(
      () => ({
        getItem: () => {
          throw new Error("bloqueado");
        },
        setItem: () => {},
      }),
      () => ANTES,
    );
    expect(await roto.abrir("u1")).toEqual({ ok: false, error: "falla" });
    expect(await roto.listar()).toEqual({ ok: false, error: "falla" });
    expect(await roto.guardarReparto("u1", mio)).toEqual({ ok: false, error: "falla" });
  });
});
