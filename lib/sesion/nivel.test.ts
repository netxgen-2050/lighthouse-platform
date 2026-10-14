import { describe, expect, it } from "vitest";
import { INICIAL, reducir } from "@/lib/sumarte/estado";
import {
  aplicarAcciones,
  calcularNivel,
  CLAVE_PENDIENTE,
  CLAVE_PENDIENTE_HORA,
  guardarPendiente,
  leerPendiente,
  renovarPendiente,
} from "./nivel";

const persona = { rol: "persona", tribuAdmin: null } as const;

function almacenEnMemoria() {
  const datos = new Map<string, string>();
  return {
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
  };
}

describe("calcularNivel", () => {
  it("sin persona no hay cuenta", () => {
    expect(calcularNivel(INICIAL, null)).toEqual({ nivel: "sin-cuenta", tribuLider: null });
  });
  it("quien se registra entra como Explorador como mínimo", () => {
    expect(calcularNivel(INICIAL, persona).nivel).toBe("explorador");
  });
  it("el plan Miembro es Miembro y el Pase Fundador (de cualquier nivel) es Fundador", () => {
    expect(calcularNivel(reducir(INICIAL, { tipo: "plan", plan: "miembro" }), persona).nivel).toBe("miembro");
    for (const nivel of ["semilla", "brote", "raiz"] as const) {
      const conPase = reducir(reducir(INICIAL, { tipo: "nivel", nivel }), { tipo: "pase" });
      expect(calcularNivel(conPase, persona).nivel).toBe("fundador");
    }
  });
  it("deshacer el Pase (volver a Explorador) saca el nivel Fundador", () => {
    const conPase = reducir(INICIAL, { tipo: "pase" });
    expect(calcularNivel(reducir(conPase, { tipo: "plan", plan: "explorador" }), persona).nivel).toBe("explorador");
  });
  it("con Pase y Plan Tribu el nivel es Líder, y conserva el Pase", () => {
    const e = reducir(reducir(INICIAL, { tipo: "pase" }), { tipo: "tribu", tribuId: "valle" });
    expect(calcularNivel(e, persona)).toEqual({ nivel: "lider", tribuLider: "valle" });
    expect(e.pase).toBe("brote");
  });
  it("el Plan Tribu hace líder de la tribu elegida", () => {
    expect(calcularNivel(reducir(INICIAL, { tipo: "tribu", tribuId: "valle" }), persona)).toEqual({ nivel: "lider", tribuLider: "valle" });
  });
  it("proponer una tribu nueva es líder sin tribu todavía", () => {
    expect(calcularNivel(reducir(INICIAL, { tipo: "tribu" }), persona)).toEqual({ nivel: "lider", tribuLider: null });
  });
  it("bajar de plan quita Participar y la tribu", () => {
    const lider = reducir(INICIAL, { tipo: "tribu", tribuId: "valle" });
    expect(calcularNivel(reducir(lider, { tipo: "plan", plan: "explorador" }), persona)).toEqual({ nivel: "explorador", tribuLider: null });
    expect(calcularNivel(reducir(lider, { tipo: "plan", plan: "miembro" }), persona).nivel).toBe("miembro");
  });
  it("el super admin lo es solo por LH_PERSONAS y no baja", () => {
    expect(calcularNivel(INICIAL, { rol: "superadmin", tribuAdmin: null }).nivel).toBe("superadmin");
  });
  it("un nivel asignado de antemano es el piso", () => {
    expect(calcularNivel(INICIAL, { rol: "admin-tribu", tribuAdmin: "valle" })).toEqual({ nivel: "lider", tribuLider: "valle" });
    const otra = reducir(INICIAL, { tipo: "tribu", tribuId: "agua" });
    expect(calcularNivel(otra, { rol: "admin-tribu", tribuAdmin: "valle" }).tribuLider).toBe("agua");
  });
});

describe("pendiente", () => {
  it("se guarda y se lee, descartando lo que no es una acción de Sumarte", () => {
    const a = almacenEnMemoria();
    guardarPendiente(a, [{ tipo: "plan", plan: "miembro" }, { tipo: "tribu", tribuId: "valle" }]);
    expect(leerPendiente(a)).toHaveLength(2);
    a.setItem(CLAVE_PENDIENTE, JSON.stringify([{ tipo: "plan", plan: "rey" }, { tipo: "nivel", nivel: "oro" }, 3, null, { tipo: "pase" }]));
    expect(leerPendiente(a)).toEqual([{ tipo: "pase" }]);
    a.setItem(CLAVE_PENDIENTE, "{no json");
    expect(leerPendiente(a)).toEqual([]);
  });
  it("una elección abandonada vence y no se aplica al entrar más tarde", () => {
    const a = almacenEnMemoria();
    guardarPendiente(a, [{ tipo: "plan", plan: "miembro" }]);
    expect(leerPendiente(a, Date.now() + 60_000)).toHaveLength(1);
    expect(leerPendiente(a, Date.now() + 60 * 60_000)).toEqual([]);
  });
  it("renovar el pedido (al aceptar la privacidad) vuelve a empezar el plazo", () => {
    const a = almacenEnMemoria();
    guardarPendiente(a, [{ tipo: "plan", plan: "miembro" }]);
    const tarde = Date.now() + 10 * 60_000;
    expect(leerPendiente(a, tarde)).toEqual([]);
    renovarPendiente(a, tarde);
    expect(leerPendiente(a, tarde + 60_000)).toHaveLength(1);
  });
  it("renovar sin pedido pendiente no crea nada", () => {
    const a = almacenEnMemoria();
    renovarPendiente(a);
    expect(a.getItem(CLAVE_PENDIENTE_HORA)).toBeNull();
  });
  it("las acciones pendientes se aplican en orden", () => {
    const e = aplicarAcciones(INICIAL, [{ tipo: "nivel", nivel: "raiz" }, { tipo: "pase" }]);
    expect(e).toMatchObject({ plan: "miembro", pase: "raiz" });
  });
});
