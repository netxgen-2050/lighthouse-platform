import { describe, expect, it } from "vitest";
import { esNeutro } from "@/lib/idioma/neutros";
import type { BilingueConOriginal } from "@/lib/idioma/tipos";
import { listarLugares } from "./biopueblo";
import { buscarTerritorio } from "./datos";
import {
  TEXTOS_BILINGUES,
  descripcionDeLugar,
  esNombrePropioDeLugar,
  nombreDeLugar,
  territorioEn,
} from "./textos";

function revisar(ruta: string, v: BilingueConOriginal) {
  expect(v.es.trim(), `${ruta}.es`).not.toBe("");
  expect(v.en?.trim(), `${ruta}.en`).toBeTruthy();
  if (!esNeutro(v.es)) expect(v.en, `${ruta}: el inglés es igual al español`).not.toBe(v.es);
}

describe("textos del territorio", () => {
  it("el terreno común, los lugares y los nombres descriptivos tienen español e inglés", () => {
    const { TEXTO_COMUN, LUGARES, NOMBRES, TERRITORIOS } = TEXTOS_BILINGUES;
    revisar("comun.para", TEXTO_COMUN.para);
    revisar("comun.cuida", TEXTO_COMUN.cuida);
    for (const [id, v] of Object.entries(LUGARES)) revisar(id, v);
    for (const [id, v] of Object.entries(NOMBRES)) revisar(id, v);
    for (const [id, t] of Object.entries(TERRITORIOS)) {
      revisar(`${id}.ubicacion`, t.ubicacion);
      revisar(`${id}.descripcion`, t.descripcion);
      t.bienesComunes.forEach((b, i) => revisar(`${id}.bienes.${i}`, b));
    }
  });

  it("cada lugar del mapa con descripción la tiene en los dos idiomas; Compound House Kernel no tiene dato", () => {
    for (const l of listarLugares()) {
      const sinDescripcion = l.id === "lugar-compound-house-kernel";
      expect(descripcionDeLugar(l.id, "es") === "sin dato", l.id).toBe(sinDescripcion);
      expect(descripcionDeLugar(l.id, "en") === "no data", l.id).toBe(sinDescripcion);
    }
  });

  it("el lugar de servicios compartidos se traduce y Temazcal queda igual", () => {
    const servicios = "lugar-restaurant-coliving-cowork-sala-de-practicas-banos";
    expect(nombreDeLugar(servicios, "x", "en")).toBe("Restaurant, coliving, cowork, practice room and restrooms");
    expect(nombreDeLugar(servicios, "x")).toBe("Restaurante, coliving, cowork, sala de prácticas y baños");
    expect(nombreDeLugar("lugar-temazcal", "x", "en")).toBe("Temazcal");
    expect(nombreDeLugar("lugar-temazcal", "x")).toBe("Temazcal");
  });

  it("un nombre propio sin mapeo se muestra tal cual en los dos idiomas", () => {
    expect(nombreDeLugar("lugar-gaia-sapiens-institute", "Gaia Sapiens Institute", "en")).toBe("Gaia Sapiens Institute");
  });

  it("sin dato: 'sin dato' en español y 'no data' en inglés, nunca vacío", () => {
    expect(descripcionDeLugar("lugar-que-no-existe")).toBe("sin dato");
    expect(descripcionDeLugar("lugar-que-no-existe", "en")).toBe("no data");
  });

  it("el español de los textos coincide con lib/territorios/datos.ts (si cambia el dato, hay que actualizar el inglés)", () => {
    for (const [id, textos] of Object.entries(TEXTOS_BILINGUES.TERRITORIOS)) {
      const t = buscarTerritorio(id)!;
      expect(t, id).toBeDefined();
      expect(textos.ubicacion.es).toBe(t.ubicacion);
      expect(textos.descripcion.es).toBe(t.descripcion);
      expect(textos.bienesComunes.map((b) => b.es)).toEqual(t.bienesComunes);
    }
  });

  it("solo los nombres propios van sin traducir", () => {
    expect(esNombrePropioDeLugar("lugar-olivos")).toBe(false);
    expect(esNombrePropioDeLugar("lugar-restaurant-coliving-cowork-sala-de-practicas-banos")).toBe(false);
    expect(esNombrePropioDeLugar("lugar-temazcal")).toBe(true);
    expect(esNombrePropioDeLugar("lugar-gaia-sapiens-institute")).toBe(true);
  });

  it("el territorio en inglés traduce la descripción y deja el nombre", () => {
    const t = buscarTerritorio("lighthouse")!;
    expect(territorioEn(t, "es")).toBe(t);
    const en = territorioEn(t, "en");
    expect(en.nombre).toBe("Lighthouse");
    expect(en.descripcion).toBe("~993 ha, twelve neighborhoods and the tribes forming them.");
    expect(en.bienesComunes).toHaveLength(t.bienesComunes.length);
    expect(en.superficie).toBe(t.superficie);
  });
});
