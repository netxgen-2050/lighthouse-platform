import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { VERSION_MANIFIESTO_VRN } from "@/lib/manifiestos/lighthouse-vrn";
import { adhesionDesactualizada, adhirioAlManifiestoVrn, puedeParticiparEnGobernanza } from "./participar";

const AL_DIA = { lighthouse: VERSION_MANIFIESTO_VRN };

describe("la regla de adhesión", () => {
  it("'pedido' y 'miembro' permiten participar; 'no-miembro' no", () => {
    expect(puedeParticiparEnGobernanza({ lighthouse: "pedido" }, AL_DIA)).toBe(true);
    expect(puedeParticiparEnGobernanza({ lighthouse: "miembro" }, AL_DIA)).toBe(true);
    expect(puedeParticiparEnGobernanza({}, AL_DIA)).toBe(false);
  });

  it("ser miembro de Valle Solar sin adhesión al común no alcanza", () => {
    expect(puedeParticiparEnGobernanza({ valle: "miembro" }, AL_DIA)).toBe(false);
    expect(adhirioAlManifiestoVrn({ valle: "pedido" }, AL_DIA)).toBe(false);
  });

  it("si el manifiesto cambió de versión hay que volver a adherir", () => {
    const vieja = { lighthouse: "2026-01-01-borrador" };
    expect(puedeParticiparEnGobernanza({ lighthouse: "miembro" }, vieja)).toBe(false);
    expect(adhesionDesactualizada({ lighthouse: "miembro" }, vieja)).toBe(true);
    // Al adherir de nuevo (versión vigente) vuelve a participar.
    expect(puedeParticiparEnGobernanza({ lighthouse: "miembro" }, AL_DIA)).toBe(true);
    expect(adhesionDesactualizada({ lighthouse: "miembro" }, AL_DIA)).toBe(false);
  });

  it("quien adhirió antes de que se guardara la versión también vuelve a adherir", () => {
    expect(puedeParticiparEnGobernanza({ lighthouse: "pedido" }, {})).toBe(false);
    expect(adhesionDesactualizada({ lighthouse: "pedido" }, {})).toBe(true);
  });

  it("sin ninguna adhesión no está 'desactualizada': simplemente no adhirió", () => {
    expect(adhesionDesactualizada({}, {})).toBe(false);
  });

  it("la versión vigente se puede pasar (para el servidor o para un cambio de versión)", () => {
    expect(puedeParticiparEnGobernanza({ lighthouse: "pedido" }, { lighthouse: "v2" }, "v2")).toBe(true);
    expect(puedeParticiparEnGobernanza({ lighthouse: "pedido" }, { lighthouse: "v1" }, "v2")).toBe(false);
  });

  it("el archivo no depende del navegador (ADR-023): no usa window, localStorage ni la lectura del navegador", () => {
    const fuente = readFileSync(path.join(__dirname, "participar.ts"), "utf8");
    expect(fuente).not.toMatch(/window|localStorage|leerMembresiaDelNavegador|leerAdhesionDelNavegador/);
  });
});
