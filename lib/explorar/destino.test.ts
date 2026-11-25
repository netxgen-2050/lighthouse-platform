import { expect, test } from "vitest";
import { RUTA_SECCION, urlExplorar } from "./destino";

test("cada sección tiene su ruta", () => {
  expect(RUTA_SECCION).toEqual({
    territorio: "/explorar/territorio",
    barrio: "/explorar/barrio-norte",
    lotes: "/explorar/lotes",
  });
});

test("sin parámetros, solo la ruta, sin ancla", () => {
  expect(urlExplorar("territorio")).toBe("/explorar/territorio");
  expect(urlExplorar("barrio", {})).toBe("/explorar/barrio-norte");
  expect(urlExplorar("lotes", {})).toBe("/explorar/lotes");
});

test("conserva vista, fase y sel del mapa", () => {
  expect(urlExplorar("territorio", { vista: "ahora", sel: "x" })).toBe("/explorar/territorio?vista=ahora&sel=x");
  expect(urlExplorar("territorio", { sel: "lote-7", fase: "2", vista: "ahora" })).toBe(
    "/explorar/territorio?vista=ahora&fase=2&sel=lote-7",
  );
});

test("descarta lo que no es del mapa y toma el primer valor repetido", () => {
  expect(urlExplorar("lotes", { utm_source: "x", vista: ["vision", "plan"] })).toBe("/explorar/lotes?vista=vision");
  expect(urlExplorar("lotes", { vista: undefined, sel: "" })).toBe("/explorar/lotes");
});

test("escapa lo que lo necesita", () => {
  expect(urlExplorar("territorio", { sel: "a b&c" })).toBe("/explorar/territorio?sel=a+b%26c");
});
