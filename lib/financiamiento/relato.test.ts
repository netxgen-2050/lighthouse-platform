import { describe, expect, test } from "vitest";
import { MODELO_LOTES } from "@/lib/lotes/modelo";
import { HIBRIDO, PALABRAS_QUE_NO_VAN, PROCOMUN_EN_SIMPLE } from "./hibrido";
import {
  AL_LADO_DE_LA_ESCALERA,
  BOLSILLOS,
  CASCADA,
  COMISION_POR_VENDER_LOTES,
  ESCALERA_SAFU,
  ETAPAS,
  HALLAZGOS_RIESGO,
  INSTRUMENTOS,
  SERIES_POSIBLES,
  SUPUESTOS_A_CONFIRMAR,
  num,
  veces,
} from "./relato";

describe("num y veces", () => {
  test("el dato que falta es sin dato, nunca cero", () => {
    for (const falta of [undefined, null, Number.NaN]) {
      expect(num(falta)).toBe("sin dato");
      expect(veces(falta)).toBe("sin dato");
    }
  });

  test("7,5 sale 7,5 veces y un entero sin decimales", () => {
    expect(veces(7.5)).toBe("7,5 veces");
    expect(veces(8)).toBe("8 veces");
  });
});

function textos(x: unknown): string[] {
  if (typeof x === "string") return [x];
  if (Array.isArray(x)) return x.flatMap(textos);
  if (x && typeof x === "object") return Object.values(x).flatMap(textos);
  return [];
}

describe("relato", () => {
  test("cada ítem tiene fuente", () => {
    for (const e of ETAPAS) for (const i of e.items) expect(i.fuente.trim()).toBeTruthy();
    for (const lista of [BOLSILLOS, CASCADA, SERIES_POSIBLES, ESCALERA_SAFU, AL_LADO_DE_LA_ESCALERA, INSTRUMENTOS, HALLAZGOS_RIESGO, SUPUESTOS_A_CONFIRMAR]) {
      for (const i of lista) expect(i.fuente.trim()).toBeTruthy();
    }
    expect(HIBRIDO.fuente.trim()).toBeTruthy();
  });
  test("las etapas son Semilla, Construir y Escalar, en ese orden", () => {
    expect(ETAPAS.map((e) => e.nombre)).toEqual(["Semilla", "Construir", "Escalar"]);
  });
  test("la cascada tiene siete pasos en orden", () => {
    expect(CASCADA).toHaveLength(7);
    expect(CASCADA.map((p) => p.id)).toEqual(["costos", "fundacion", "comision", "notas", "unidades", "primeraperdida", "excedente"]);
    expect(CASCADA.map((p) => p.orden)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(CASCADA[6].texto).toContain("80 % bien común · 20 % Unidades");
  });
  test("solo la agrovoltaica y el viñedo tienen modelo", () => {
    expect(SERIES_POSIBLES.filter((s) => s.conModelo).map((s) => s.modelo)).toEqual(["agrovoltaica", "vinedo"]);
    expect(SERIES_POSIBLES.map((s) => s.nombre)).toEqual(["S0", "S1", "S2", "S3", "S4", "S5", "Serie Madre"]);
  });
  test("los supuestos tienen quién y fuente; la vivienda es sin dato", () => {
    for (const s of SUPUESTOS_A_CONFIRMAR) {
      expect(s.quien).toBeTruthy();
      expect(s.fuente.trim()).toBeTruthy();
    }
    const v = SUPUESTOS_A_CONFIRMAR.find((s) => s.etiqueta.startsWith("Entrada y canon anual de la vivienda"));
    expect(v?.valor).toBe("sin dato");
    expect(v?.quien).toBe("martinFranz");
  });
  test("los valores de Vagner salen de las constantes", () => {
    const vagner = SUPUESTOS_A_CONFIRMAR.filter((s) => s.quien === "vagner").map((s) => s.valor).join(" | ");
    expect(vagner).toContain("USD 31.000 por mes");
    expect(vagner).toContain("1 a 1,5 % anual");
    expect(vagner).toContain("6 veces (viñedo) · 3 veces (agrovoltaica)");
    expect(vagner).toContain("3 · 6 · 9 %");
  });
  test("los textos del modelo híbrido no tienen ninguna palabra que no va", () => {
    const t = textos([HIBRIDO, PROCOMUN_EN_SIMPLE, COMISION_POR_VENDER_LOTES]).map((x) => x.toLowerCase());
    for (const x of t) for (const p of PALABRAS_QUE_NO_VAN) expect(x).not.toContain(p.toLowerCase());
  });
  test("la Fundación es parte del modelo híbrido y todavía no existe", () => {
    const f = BOLSILLOS.find((b) => b.id === "fundacion")!;
    expect(f.queEs).toContain("en el modelo híbrido, la tierra común queda en ella (todavía no existe)");
    expect(f.netxPuedeTomar).toContain("nunca un porcentaje");
  });
  test("ningún texto dice Juego A, Juego B, procomún, diseño B ni invita a reservar", () => {
    const todo = textos([ETAPAS, BOLSILLOS, CASCADA, SERIES_POSIBLES, ESCALERA_SAFU, AL_LADO_DE_LA_ESCALERA, INSTRUMENTOS, HALLAZGOS_RIESGO, SUPUESTOS_A_CONFIRMAR, HIBRIDO, PROCOMUN_EN_SIMPLE]);
    for (const x of todo) {
      expect(x).not.toContain("Juego A");
      expect(x).not.toContain("Juego B");
      expect(x.toLowerCase()).not.toContain("procomún");
      expect(x).not.toContain("diseño B");
      expect(x).not.toContain("reservá");
      expect(x).not.toContain("reservar tu");
    }
  });
  test("el SAFE toma sus tickets de TICKETS_SAFE y los supuestos del modelo híbrido salen del módulo de lotes", () => {
    const safe = ETAPAS[0].items[0].que;
    expect(safe).toContain("USD 5.000 a 50.000 o más");
    const de = (etiqueta: string) => SUPUESTOS_A_CONFIRMAR.find((s) => s.etiqueta === etiqueta)!;
    const precio = de("Precio de referencia de los lotes");
    expect(precio.quien).toBe("martinFranz");
    expect(precio.valor).toContain(`USD ${MODELO_LOTES.precioLote.min.toLocaleString("es-AR")}`);
    const aporte = de("Aporte único y expensas de los lotes");
    expect(aporte.quien).toBe("vagner");
    expect(aporte.valor).toContain(`${MODELO_LOTES.aporteUnico * 100} %`);
    const quien = de("Quién vende los lotes y si el aporte se suma al precio");
    expect(quien.quien).toBe("abogado");
    expect(quien.valor).toBe("sin dato");
  });
  test("los instrumentos tienen forma legal", () => {
    expect(INSTRUMENTOS).toHaveLength(5);
    for (const i of INSTRUMENTOS) expect(i.formaLegal.trim()).toBeTruthy();
  });
});
