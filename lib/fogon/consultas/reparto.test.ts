import { describe, expect, test } from "vitest";
import { buscarConsulta } from "./ejemplo";
import {
  costoDelProximoVoto,
  creditosRestantes,
  mismoReparto,
  motivoNoQuitar,
  motivoNoSumar,
  mover,
  repartoEnPlata,
  textoCreditos,
  textoVotos,
} from "./reparto";

const u1 = buscarConsulta("u1")!;
const u4 = buscarConsulta("u4")!;

describe("mi reparto", () => {
  test("tres votos cuestan 9 créditos y quedan 91", () => {
    let r = {};
    for (let i = 0; i < 3; i++) r = mover(u1, r, "regeneracion", 1);
    expect(r).toEqual({ regeneracion: 3 });
    expect(creditosRestantes(r)).toBe(91);
  });

  test("el tercer voto suma 5 créditos", () => {
    expect(costoDelProximoVoto({ regeneracion: 2 }, "regeneracion")).toBe(5);
  });

  test("bloquea el voto que no alcanza, con el motivo en texto", () => {
    // 4 + 81 + 9 + 1 + 1 = 96 créditos usados: quedan 4 y el tercer voto de la opción suma 5.
    const r = { regeneracion: 2, resiliencia: 9, accesibilidad: 3, retorno: 1, id: 1 };
    expect(creditosRestantes(r)).toBe(4);
    expect(motivoNoSumar(r, "regeneracion")).toBe(
      "No te alcanzan los créditos: el próximo voto en esta opción suma 5 y te quedan 4",
    );
    // Con 5 créditos libres sí alcanza.
    expect(motivoNoSumar({ ...r, id: 0 }, "regeneracion")).toBeNull();
  });

  test("sumar sin créditos no cambia el reparto", () => {
    const lleno = { regeneracion: 10 };
    expect(mover(u1, lleno, "resiliencia", 1)).toEqual(lleno);
  });

  test("quitar no baja de 0 si no hay votos en contra, y un 0 no queda guardado", () => {
    expect(motivoNoQuitar(u1, {}, "regeneracion")).not.toBeNull();
    expect(mover(u1, {}, "regeneracion", -1)).toEqual({});
    expect(mover(u1, { regeneracion: 1 }, "regeneracion", -1)).toEqual({});
  });

  test("con votos en contra permitidos, quitar baja de 0", () => {
    const conContra = { ...u1, votosEnContra: true };
    expect(mover(conContra, {}, "regeneracion", -1)).toEqual({ regeneracion: -1 });
  });

  test("un voto en 0 es igual a no haber puesto nada", () => {
    expect(mismoReparto({ a: 0 }, {})).toBe(true);
    expect(mismoReparto({ a: 1 }, {})).toBe(false);
  });
});

test("textos con singular y plural", () => {
  expect(textoVotos(3)).toBe("3 votos");
  expect(textoVotos(1)).toBe("1 voto");
  expect(textoVotos(0)).toBe("0 votos");
  expect(textoCreditos(9)).toBe("9 créditos");
  expect(textoCreditos(1)).toBe("1 crédito");
});

describe("mi reparto en plata (U4)", () => {
  test("3 votos y 1 voto: USD 15.000 y USD 5.000, el resto en 0", () => {
    const partes = repartoEnPlata(u4, { vivero: 3, hidrologico: 1 });
    expect(partes.vivero).toBe(1_500_000);
    expect(partes.hidrologico).toBe(500_000);
    expect(partes.piedra).toBe(0);
  });

  test("sin votos propios: sin dato", () => {
    const partes = repartoEnPlata(u4, {});
    expect(Object.values(partes).every((p) => p === null)).toBe(true);
  });

  test("monto sin cargar: sin dato, nunca 0", () => {
    const sinMonto = { ...u4, presupuesto: { ...u4.presupuesto!, montoCentavos: null } };
    expect(repartoEnPlata(sinMonto, { vivero: 3 }).vivero).toBeNull();
  });

  test("una consulta de prioridades no tiene plata", () => {
    expect(repartoEnPlata(u1, { regeneracion: 3 })).toEqual({});
  });
});
