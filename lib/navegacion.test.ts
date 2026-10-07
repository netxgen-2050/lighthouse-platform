import { expect, test } from "vitest";
import { DESTINOS, destinosDisponibles, filtrarDestinos } from "./navegacion";
import { esActivo } from "./ruta-activa";

test("el orden de la lista es el de la spec", () => {
  expect(DESTINOS.map((d) => d.etiqueta)).toEqual([
    "Inicio",
    "Territorio",
    "Tribus",
    "Perfil",
    "Compromisos",
    "Congreso",
    "Sumarte",
    "Mi recorrido",
  ]);
});

test("sin la ruta /panel no se muestra Mi recorrido", () => {
  const etiquetas = filtrarDestinos((h) => h !== "/panel").map((d) => d.etiqueta);
  expect(etiquetas).not.toContain("Mi recorrido");
  expect(etiquetas).toContain("Tribus");
});

test("destinosDisponibles solo trae rutas con página en app/", () => {
  const hrefs = destinosDisponibles().map((d) => d.href);
  expect(hrefs).toContain("/");
  expect(hrefs).toContain("/tribus");
  expect(hrefs).not.toContain("/panel");
});

test("las subrutas marcan su sección y Inicio solo la raíz", () => {
  expect(esActivo("/tribus", "/tribus/valle")).toBe(true);
  expect(esActivo("/tribus", "/tribusx")).toBe(false);
  expect(esActivo("/", "/tribus")).toBe(false);
});
