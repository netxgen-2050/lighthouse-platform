import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { CLAVES, establecerPersona } from "@/lib/demo/claves";
import type { CompraLote } from "./compra";
import { guardarReservas, leerReservas } from "./reservas";

class Almacen {
  datos = new Map<string, string>();
  lecturas = 0;
  getItem(k: string) {
    this.lecturas++;
    return this.datos.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.datos.set(k, v);
  }
  removeItem(k: string) {
    this.datos.delete(k);
  }
}

let almacen: Almacen;
beforeEach(() => {
  almacen = new Almacen();
  vi.stubGlobal("window", { localStorage: almacen });
});
afterEach(() => {
  vi.unstubAllGlobals();
  establecerPersona(null);
});

const compra: CompraLote = {
  loteId: "lote-5",
  opcion: "solo-lote",
  paso: "reservado",
  reservadoEl: "2026-11-20T10:00:00.000Z",
  vio: { precio: 1, aporte: 1, expensa: 1, version: "v" },
};
const OK = { estado: "ok" };
const SIN = { estado: "sin-sesion" };

test("guarda y lee las reservas de la persona en sesión", async () => {
  establecerPersona("a");
  expect(await guardarReservas(OK, [compra])).toBe(true);
  expect(await leerReservas(OK)).toEqual([compra]);
});

test("sin sesión devuelve [] y false sin tocar el navegador", async () => {
  establecerPersona("a");
  await guardarReservas(OK, [compra]);
  almacen.lecturas = 0;
  expect(await leerReservas(SIN)).toEqual([]);
  expect(await leerReservas({ estado: "cargando" })).toEqual([]);
  expect(almacen.lecturas).toBe(0);
  expect(await guardarReservas(SIN, [])).toBe(false);
  expect(almacen.datos.size).toBe(1);
});

test("lo guardado que no se puede leer cuenta como sin reservas", async () => {
  establecerPersona("a");
  almacen.setItem(CLAVES.lotes, "{no es json");
  expect(await leerReservas(OK)).toEqual([]);
});

test("si el navegador no deja leer o guardar, [] y false", async () => {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("bloqueado");
      },
      removeItem: () => {
        throw new Error("bloqueado");
      },
    },
  });
  expect(await leerReservas(OK)).toEqual([]);
  expect(await guardarReservas(OK, [compra])).toBe(false);
});

test("una lista vacía borra la clave", async () => {
  establecerPersona("a");
  await guardarReservas(OK, [compra]);
  await guardarReservas(OK, []);
  expect(almacen.datos.size).toBe(0);
});

test("la persona B no ve las reservas de la persona A en el mismo navegador", async () => {
  establecerPersona("a");
  await guardarReservas(OK, [compra]);
  establecerPersona("b");
  expect(await leerReservas(OK)).toEqual([]);
  establecerPersona("a");
  expect(await leerReservas(OK)).toEqual([compra]);
});
