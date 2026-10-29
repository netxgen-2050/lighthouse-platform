import { describe, expect, it } from "vitest";
import { CLAVES } from "@/lib/demo/claves";
import { leerProgreso } from "@/lib/panel/proximo-paso";
import { afirmaComunidad, afirmaPersona, agregar, sobreDe, type ConstanciaPacto } from "@/lib/pactos/constancias";
import { semillasDeComunidad } from "./estado";

const PERSONA = "prueba:persona@prueba.test";
const pactoEnviado = JSON.stringify({
  pestana: "tiempo",
  comunidades: { valle: { tiempo: { rol: "jardineria", rolOtro: "", descripcion: "Huerta", horas: 10, paso: 1 }, aportes: [] } },
});

function registro(acepta: boolean): ConstanciaPacto[] {
  const base = agregar(
    [],
    {
      esquema: "pacto-propone",
      afirma: afirmaPersona(PERSONA),
      por: PERSONA,
      sobre: sobreDe("valle", PERSONA),
      version: 1,
      datos: { tipo: "nuevo", rol: "jardineria", rolOtro: "", descripcion: "Huerta", horas: "10" },
    },
    "2026-10-28T10:00:00.000Z",
  );
  return agregar(
    base,
    {
      esquema: acepta ? "pacto-acepta" : "pacto-no-acepta",
      afirma: afirmaComunidad("valle"),
      por: "prueba:admin@prueba.test",
      sobre: sobreDe("valle", PERSONA),
      version: 1,
      apuntaA: base[0].id,
      datos: { motivo: "x" },
    },
    "2026-10-28T11:00:00.000Z",
  );
}

describe("pactos conciliados en los lectores", () => {
  it("Semillas cuenta un pacto en paso 1 con aceptación en el registro", () => {
    const s = semillasDeComunidad(pactoEnviado, "valle", PERSONA, registro(true));
    expect(s.pactoAceptado).toBe(true);
    expect(s.horas).toBe(10);
  });

  it("sin aceptación, o con el registro ilegible, no cuenta", () => {
    expect(semillasDeComunidad(pactoEnviado, "valle", PERSONA, registro(false)).pactoAceptado).toBe(false);
    expect(semillasDeComunidad(pactoEnviado, "valle", PERSONA, null).horas).toBeNull();
  });

  it("el panel ve el pacto no aceptado como no propuesto", () => {
    const lector = (c: string) => (c === CLAVES.pactos ? pactoEnviado : null);
    expect(leerProgreso(lector, PERSONA, registro(true)).propusoPacto).toBe(true);
    expect(leerProgreso(lector, PERSONA, registro(false)).propusoPacto).toBe(false);
    expect(leerProgreso(lector, PERSONA, null).propusoPacto).toBe(true);
  });
});
