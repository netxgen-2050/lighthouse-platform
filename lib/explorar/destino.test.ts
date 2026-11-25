import { expect, test } from "vitest";
import { urlExplorar } from "./destino";

test("sin parámetros, solo la sección", () => {
  expect(urlExplorar("territorio")).toBe("/explorar#territorio");
  expect(urlExplorar("barrio", {})).toBe("/explorar#barrio");
  expect(urlExplorar("lotes", {})).toBe("/explorar#lotes");
});

test("conserva vista, fase y sel del mapa", () => {
  expect(urlExplorar("territorio", { vista: "ahora", sel: "x" })).toBe("/explorar?vista=ahora&sel=x#territorio");
  expect(urlExplorar("territorio", { sel: "lote-7", fase: "2", vista: "ahora" })).toBe(
    "/explorar?vista=ahora&fase=2&sel=lote-7#territorio",
  );
});

test("descarta lo que no es del mapa y toma el primer valor repetido", () => {
  expect(urlExplorar("lotes", { utm_source: "x", vista: ["vision", "plan"] })).toBe("/explorar?vista=vision#lotes");
  expect(urlExplorar("lotes", { vista: undefined, sel: "" })).toBe("/explorar#lotes");
});

test("escapa lo que lo necesita", () => {
  expect(urlExplorar("territorio", { sel: "a b&c" })).toBe("/explorar?sel=a+b%26c#territorio");
});
