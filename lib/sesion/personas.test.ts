import { describe, expect, it, vi } from "vitest";
import { buscarPersona, modoPruebaActivo, parsearPersonas } from "./personas";

describe("parsearPersonas", () => {
  it("lee varias entradas, sin importar espacios ni mayúsculas", () => {
    const p = parsearPersonas(" Ana@X.com = Admin-Tribu : usuario ; b@x.com=persona:inversor ;");
    expect(p).toEqual([
      { email: "ana@x.com", rol: "admin-tribu", perfil: "usuario", tribuAdmin: "valle" },
      { email: "b@x.com", rol: "persona", perfil: "inversor", tribuAdmin: null },
    ]);
  });

  it("el super admin no administra una tribu", () => {
    expect(parsearPersonas("s@x.com=superadmin:comunidad")[0]?.tribuAdmin).toBeNull();
  });

  it("ignora las entradas mal formadas y avisa", () => {
    const avisar = vi.fn();
    const p = parsearPersonas("sinigual;a@x.com=jefe:usuario;b@x.com=persona:raro;noemail=persona:usuario;c@x.com=persona:usuario:extra;ok@x.com=persona:usuario", avisar);
    expect(p.map((x) => x.email)).toEqual(["ok@x.com"]);
    expect(avisar).toHaveBeenCalledTimes(5);
  });

  it("sin variable o vacía, no hay personas", () => {
    expect(parsearPersonas(undefined)).toEqual([]);
    expect(parsearPersonas("")).toEqual([]);
  });

  it("si un email se repite, queda el último", () => {
    const p = parsearPersonas("a@x.com=persona:usuario;A@x.com=superadmin:usuario");
    expect(p).toHaveLength(1);
    expect(p[0]?.rol).toBe("superadmin");
  });
});

describe("buscarPersona", () => {
  const lista = parsearPersonas("a@x.com=persona:usuario");
  it("compara en minúsculas", () => {
    expect(buscarPersona(lista, " A@X.com ")?.email).toBe("a@x.com");
  });
  it("devuelve null si no está o no hay email", () => {
    expect(buscarPersona(lista, "z@x.com")).toBeNull();
    expect(buscarPersona(lista, null)).toBeNull();
  });
});

describe("modoPruebaActivo", () => {
  it("solo con LH_AUTH_PRUEBA=1 y fuera de producción", () => {
    expect(modoPruebaActivo({ LH_AUTH_PRUEBA: "1" })).toBe(true);
    expect(modoPruebaActivo({ LH_AUTH_PRUEBA: "1", VERCEL_ENV: "preview" })).toBe(true);
    expect(modoPruebaActivo({ LH_AUTH_PRUEBA: "1", VERCEL_ENV: "production" })).toBe(false);
    expect(modoPruebaActivo({ VERCEL_ENV: "preview" })).toBe(false);
    expect(modoPruebaActivo({ LH_AUTH_PRUEBA: "true" })).toBe(false);
  });
});
