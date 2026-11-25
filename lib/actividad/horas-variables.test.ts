import { describe, expect, it } from "vitest";
import { registrar, textoDeEvento } from "./actividad";
import { EVENTOS } from "./eventos";

const t0 = new Date("2026-11-10T10:00:00Z");

describe("eventos de las horas de cada mes", () => {
  it("declarar se lee en los dos idiomas con el mes en el idioma de quien lo lee", () => {
    const e = registrar([], EVENTOS.declarasteHoras(24, "2026-11", "Valle Solar", "valle"), t0, "e1")[0];
    expect(textoDeEvento(e, "es").texto).toBe("Declaraste 24 h de noviembre de 2026 en Valle Solar");
    expect(textoDeEvento(e, "en").texto).toBe("You declared 24 h for November 2026 in Valle Solar");
  });
  it("corregir no agrega otro evento: una sola vez por comunidad y mes", () => {
    const uno = registrar([], EVENTOS.declarasteHoras(24, "2026-11", "Valle Solar", "valle"), t0, "e1");
    const dos = registrar(uno, EVENTOS.declarasteHoras(20, "2026-11", "Valle Solar", "valle"), t0, "e2");
    expect(dos).toHaveLength(1);
    expect(dos[0].texto).toContain("24 h");
    expect(registrar(dos, EVENTOS.declarasteHoras(10, "2026-12", "Valle Solar", "valle"), t0, "e3")).toHaveLength(2);
  });
  it("la confirmación se registra una sola vez y es una notificación", () => {
    const uno = registrar([], EVENTOS.horasDelMesConfirmadas("2026-11", "Valle Solar", "valle"), t0, "e1");
    expect(registrar(uno, EVENTOS.horasDelMesConfirmadas("2026-11", "Valle Solar", "valle"), t0, "e2")).toHaveLength(1);
    expect(uno[0].notificacion).toBe(true);
    expect(textoDeEvento(uno[0], "es").texto).toBe("Valle Solar confirmó tus horas de noviembre de 2026");
    expect(textoDeEvento(uno[0], "en").texto).toBe("Valle Solar confirmed your hours for November 2026");
  });
});
