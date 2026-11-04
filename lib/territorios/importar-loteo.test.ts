import { describe, expect, it } from "vitest";
import { macrolote7, type Anillo } from "./biopueblo";
import { METROS_POR_GRADO_LAT, METROS_POR_GRADO_LNG, puntoEnAnillo } from "./geometria";
import {
  AVISO_RIO,
  armarSalida,
  clasificar,
  convertirConMapeo,
  convertirKml,
  leerKml,
  serializar,
  validarLoteo,
} from "./importar-loteo";
import { fuenteDelLoteo, loteoDe, rasgosDelLoteo, type ArchivoLoteo, type RasgoLoteo } from "./loteo";
import { ESTADOS_EJEMPLO } from "./loteo-estados";

// Un punto bien adentro del 7A: el promedio de sus vértices, comprobado.
const anillo7A = macrolote7().anillo;
const base: [number, number] = [
  anillo7A.reduce((s, p) => s + p[0], 0) / anillo7A.length,
  anillo7A.reduce((s, p) => s + p[1], 0) / anillo7A.length,
];

/** Rectángulo de `ancho` × `alto` metros con la esquina inferior izquierda a `dx`, `dy` metros de la base. */
function rect(dx: number, dy: number, ancho = 32, alto = 42): Anillo {
  const x0 = base[0] + dx / METROS_POR_GRADO_LNG;
  const y0 = base[1] + dy / METROS_POR_GRADO_LAT;
  const x1 = x0 + ancho / METROS_POR_GRADO_LNG;
  const y1 = y0 + alto / METROS_POR_GRADO_LAT;
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
}

const coordenadas = (a: Anillo) => a.map(([x, y]) => `${x},${y},0`).join(" ");
const placemark = (nombre: string, a: Anillo) =>
  `<Placemark><name>${nombre}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${coordenadas(a)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
const kml = (...p: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>${p.join("")}</Document></kml>`;

function lote(n: number, a: Anillo): RasgoLoteo {
  return {
    properties: { tipo: "lote", id: `lote-${n}`, numero: n, nombre: `Lote ${n}`, superficie_m2: 1344 },
    geometry: { type: "Polygon", coordinates: [a] },
  };
}

describe("el punto de partida de los tests", () => {
  it("está dentro del 7A", () => {
    expect(puntoEnAnillo(base, anillo7A)).toBe(true);
  });
});

describe("leerKml", () => {
  it("lee nombres (con CDATA y entidades) y el polígono exterior", () => {
    const a = rect(0, 0);
    const xml = kml(placemark("<![CDATA[Lote 1]]>", a), placemark("Espacio &amp; común", rect(100, 0)));
    const p = leerKml(xml);
    expect(p.map((x) => x.nombre)).toEqual(["Lote 1", "Espacio & común"]);
    expect(p[0].anillo).toHaveLength(5);
    expect(p[0].anillo![0][0]).toBeCloseTo(a[0][0], 9);
  });

  it("un Placemark sin polígono queda con anillo null", () => {
    const p = leerKml(`<kml><Placemark><name>Pileta</name><Point><coordinates>1,2,0</coordinates></Point></Placemark></kml>`);
    expect(p).toEqual([{ nombre: "Pileta", anillo: null, trazo: null, numero: null }]);
  });
});

describe("clasificar", () => {
  it("lotes: Lote 12, L-12, L12 dan lote-12", () => {
    for (const n of ["Lote 12", "L-12", "L12", "lote 012", "LOTE_12"]) {
      expect(clasificar(n), n).toEqual({ tipo: "lote", id: "lote-12", numero: 12 });
    }
  });

  it("zonas, sin distinguir mayúsculas ni acentos", () => {
    expect(clasificar("Espacio de uso común")?.tipo).toBe("uso-comun");
    expect(clasificar("ESPACIO COMUN")?.id).toBe("sector-norte-comun");
    expect(clasificar("Producción de alimentos")?.tipo).toBe("produccion");
    expect(clasificar("Camino")?.tipo).toBe("calle");
    expect(clasificar("Calle interna")?.tipo).toBe("calle");
    expect(clasificar("Sector norte")?.tipo).toBe("sector");
  });

  it("lo que no entiende da null", () => {
    expect(clasificar("Pileta")).toBeNull();
    expect(clasificar("Lote")).toBeNull();
  });
});

describe("convertirKml", () => {
  it("lee lotes y zonas; un lote de 32 × 42 m da 1.344 m² y el sector trae sus hectáreas", () => {
    const sector = rect(-1000, -1000, 1000, 1000); // 100 ha
    const { rasgos, errores } = convertirKml(kml(placemark("Sector norte", sector), placemark("L-1", rect(0, 0)), placemark("Lote 2", rect(32, 0))));
    expect(errores).toEqual([]);
    const l1 = rasgos.find((r) => r.properties.id === "lote-1")!;
    expect(l1.properties.superficie_m2).toBe(1344);
    expect(l1.properties.nombre).toBe("Lote 1");
    expect(rasgos.find((r) => r.properties.tipo === "sector")!.properties.area_ha).toBe(100);
  });

  it("un Placemark desconocido da error con su nombre y no se descarta en silencio", () => {
    const { errores } = convertirKml(kml(placemark("Lote 1", rect(0, 0)), placemark("Pileta", rect(100, 0))));
    expect(errores).toHaveLength(1);
    expect(errores[0]).toContain('"Pileta"');
  });

  it("un punto con nombre de lote da error", () => {
    const { errores } = convertirKml(`<kml><Placemark><name>Lote 3</name><Point><coordinates>1,2</coordinates></Point></Placemark></kml>`);
    expect(errores[0]).toContain("Lote 3");
  });

  it("un archivo sin polígonos da error", () => {
    expect(convertirKml("<kml></kml>").errores).toHaveLength(1);
  });
});

describe("validarLoteo", () => {
  it("el archivo vigente pasa sin errores (vecinos que comparten lados), y el aviso del río siempre está", () => {
    const v = validarLoteo(rasgosDelLoteo(), anillo7A);
    expect(v.errores).toEqual([]);
    expect(v.avisos).toContain(AVISO_RIO);
  });

  it("vecinos que comparten un lado no se superponen", () => {
    const v = validarLoteo([lote(1, rect(0, 0)), lote(2, rect(32, 0)), lote(3, rect(0, 42))], anillo7A);
    expect(v.errores).toEqual([]);
  });

  it("un lote fuera del 7A da error con su id", () => {
    const fuera = rect(0, 0).map(([x, y]): [number, number] => [x + 5, y]);
    const v = validarLoteo([lote(1, rect(0, 0)), lote(9, fuera)], anillo7A);
    expect(v.errores).toEqual(["lote-9: queda fuera del polígono del 7A."]);
  });

  it("dos lotes superpuestos dan error con los dos ids", () => {
    const v = validarLoteo([lote(1, rect(0, 0)), lote(2, rect(10, 5))], anillo7A);
    expect(v.errores).toEqual(["lote-1 y lote-2 se superponen."]);
  });

  it("dos lotes iguales o uno dentro del otro también se superponen", () => {
    expect(validarLoteo([lote(1, rect(0, 0)), lote(2, rect(0, 0))], anillo7A).errores).toHaveLength(1);
    expect(validarLoteo([lote(1, rect(0, 0)), lote(2, rect(5, 5, 10, 10))], anillo7A).errores).toHaveLength(1);
  });

  it("dos lotes que se cruzan en cruz (sin vértices adentro) se superponen", () => {
    const v = validarLoteo([lote(1, rect(0, 10, 32, 10)), lote(2, rect(10, 0, 10, 32))], anillo7A);
    expect(v.errores).toEqual(["lote-1 y lote-2 se superponen."]);
  });

  it("un id repetido da error", () => {
    const v = validarLoteo([lote(1, rect(0, 0)), lote(1, rect(100, 0))], anillo7A);
    expect(v.errores.some((e) => e.startsWith("lote-1: el id está repetido"))).toBe(true);
  });

  it("un id con formato inválido da error", () => {
    const l = lote(1, rect(0, 0));
    l.properties.id = "lote-uno";
    expect(validarLoteo([l], anillo7A).errores.some((e) => e.includes("lote-uno") && e.includes("formato"))).toBe(true);
  });

  it("un anillo sin cerrar o con menos de 3 vértices distintos da error", () => {
    const abierto = rect(0, 0).slice(0, -1);
    expect(validarLoteo([lote(1, abierto)], anillo7A).errores.some((e) => e.startsWith("lote-1:"))).toBe(true);
    const lineal: Anillo = [[base[0], base[1]], [base[0] + 0.0001, base[1]], [base[0], base[1]], [base[0], base[1]]];
    expect(validarLoteo([lote(1, lineal)], anillo7A).errores.some((e) => e.startsWith("lote-1:"))).toBe(true);
  });

  it("sin lotes da error", () => {
    expect(validarLoteo([], anillo7A).errores).toContain("No hay ningún lote.");
  });

  it("dos caminos con el mismo id de zona dan error con los dos nombres", () => {
    const camino = (nombre: string, a: Anillo): RasgoLoteo => ({
      properties: { tipo: "calle", id: "sector-norte-calle", nombre },
      geometry: { type: "Polygon", coordinates: [a] },
    });
    const v = validarLoteo([lote(1, rect(0, 0)), camino("Camino A", rect(100, 0)), camino("Camino B", rect(200, 0))], anillo7A);
    expect(v.errores).toEqual(['sector-norte-calle: "Camino A" y "Camino B" dan el mismo id de zona.']);
  });

  it("sin sector ni zonas hay avisos, no errores", () => {
    const v = validarLoteo([lote(1, rect(0, 0))], anillo7A);
    expect(v.errores).toEqual([]);
    expect(v.avisos.filter((a) => a.startsWith("Falta"))).toHaveLength(4);
  });

  it("un id del archivo anterior que falta da aviso", () => {
    const v = validarLoteo([lote(1, rect(0, 0))], anillo7A, ["lote-1", "lote-13"], []);
    expect(v.avisos.filter((a) => a.startsWith("lote-13 ya no está"))).toHaveLength(1);
    expect(v.avisos.some((a) => a.startsWith("lote-1 "))).toBe(false);
  });

  it("un lote con estado de ejemplo que ya no existe da aviso", () => {
    const v = validarLoteo([lote(1, rect(0, 0))], anillo7A);
    for (const id of Object.keys(ESTADOS_EJEMPLO)) expect(v.avisos.some((a) => a.startsWith(`${id} tiene un estado de ejemplo`))).toBe(true);
  });
});

describe("la salida del importador se lee sin tocar pantallas", () => {
  it("armarSalida + loteoDe: fuente martin, lotes, sector con hectáreas y rango de superficies", () => {
    const sector = rect(-1000, -1000, 1000, 1000);
    const { rasgos, errores } = convertirKml(
      kml(placemark("Sector norte", sector), placemark("Lote 2", rect(32, 0)), placemark("Lote 1", rect(0, 0))),
    );
    expect(errores).toEqual([]);
    const salida = armarSalida(rasgos, "plano.kmz", "2026-11-09");
    const leida = loteoDe(JSON.parse(serializar(salida)) as ArchivoLoteo);
    expect(leida.fuenteDelLoteo()).toBe("martin");
    expect(leida.fechaDelLoteo()).toBe("2026-11-09");
    expect(leida.listarLotes().map((l) => l.id)).toEqual(["lote-1", "lote-2"]);
    expect(leida.listarLotes()[0].superficieM2).toBe(1344);
    expect(leida.sectorNorte()?.areaHa).toBe(100);
    expect(leida.zonasDelLoteo()).toEqual([]);
    expect(salida.metadata).toMatchObject({ fuenteId: "martin", archivo: "plano.kmz", importado: "2026-11-09" });
  });

  it("el archivo vigente se lee con la misma función", () => {
    expect(loteoDe({ features: rasgosDelLoteo(), metadata: { fuenteId: fuenteDelLoteo() } }).listarLotes().length).toBeGreaterThan(0);
  });
});

describe("plano sin nombres (CAD) con mapeo", () => {
  const linea = (n: number, a: Anillo) =>
    `<Placemark id="plano.${n}"><LineString><coordinates>${coordenadas(a)}</coordinates></LineString></Placemark>`;
  const abierta: Anillo = [rect(0, 0)[0], rect(0, 0)[1]];
  const mapeo = { sector: 1, lotes: { "7": 2 }, parcelas: { P3: 3 }, ignorar: { "4": "Línea abierta" } };
  const plano = kml(linea(1, rect(0, 0, 500, 500)), linea(2, rect(10, 10)), linea(3, rect(60, 10)), linea(4, abierta));

  it("lee el número del Placemark y el trazo", () => {
    const [p] = leerKml(plano);
    expect(p.numero).toBe(1);
    expect(p.anillo).toBeNull();
    expect(p.trazo).toHaveLength(5);
  });

  it("clasifica por número, sin mirar nombres, y no usa lo ignorado", () => {
    const { rasgos, errores } = convertirConMapeo(plano, mapeo);
    expect(errores).toEqual([]);
    expect(rasgos.map((r) => r.properties.id)).toEqual(["sector-norte", "lote-7", "parcela-P3"]);
  });

  it("los primeros lotes llevan letra y grupo, y el 7A no se les exige", () => {
    const { rasgos, errores } = convertirConMapeo(plano, { ...mapeo, lotes: {}, primeros: { a: 2 } });
    expect(errores).toEqual([]);
    const lote = rasgos.find((r) => r.properties.tipo === "lote");
    expect(lote?.properties).toMatchObject({ id: "lote-a", nombre: "Lote A", etiqueta: "A", grupo: "primeros" });
    const lejos: Anillo = [[0, 0], [0, 0.0001], [0.0001, 0.0001], [0, 0]];
    expect(validarLoteo([lote!], lejos, [], []).errores).toEqual([]);
    expect(validarLoteo([{ ...lote!, properties: { ...lote!.properties, grupo: undefined } }], lejos, [], []).errores.join()).toContain("queda fuera del polígono del 7A");
  });

  it("una copia exacta hereda la clase de su original", () => {
    const { rasgos, errores } = convertirConMapeo(kml(linea(1, rect(0, 0, 500, 500)), linea(2, rect(10, 10)), linea(5, rect(10, 10))), {
      sector: 1,
      lotes: { "7": 2 },
      parcelas: {},
      ignorar: {},
    });
    expect(errores).toEqual([]);
    expect(rasgos.filter((r) => r.properties.tipo === "lote")).toHaveLength(1);
  });

  it("lo que el mapeo no explica es un error: nada se descarta en silencio", () => {
    expect(convertirConMapeo(kml(linea(1, rect(0, 0)), linea(9, rect(60, 0))), { sector: 1, lotes: {}, parcelas: {}, ignorar: {} }).errores).toEqual([
      "El Placemark 9 no está en el mapeo.",
    ]);
  });

  it("nombrar un Placemark que no está, clasificarlo dos veces o usar una línea abierta como lote son errores", () => {
    expect(convertirConMapeo(plano, { ...mapeo, parcelas: { P3: 3, P8: 8 } }).errores).toContain("El mapeo nombra el Placemark 8 (parcela-P8), que no está en el plano.");
    expect(convertirConMapeo(plano, { ...mapeo, parcelas: { P2: 2, P3: 3 } }).errores).toContain("El mapeo clasifica dos veces el Placemark 2: lote-7 y parcela-P2.");
    expect(convertirConMapeo(plano, { ...mapeo, parcelas: { P3: 3, P4: 4 }, ignorar: {} }).errores).toContain("El Placemark 4 (parcela-P4) no es un polígono cerrado.");
  });

  it("una parcela que pisa un lote es un error; compartir un borde casi sobre la misma línea, no", () => {
    const l = lote(1, rect(0, 0));
    const pisa: RasgoLoteo = { properties: { tipo: "parcela", id: "parcela-1", nombre: "Parcela" }, geometry: { type: "Polygon", coordinates: [rect(10, 10)] } };
    expect(validarLoteo([l, pisa], anillo7A, [], []).errores).toEqual(["parcela-1 y lote-1 se superponen."]);
    const m = 1 / METROS_POR_GRADO_LNG;
    const vecina: Anillo = [[base[0] + 32 * m + 1e-8, base[1] - 0.0001], [base[0] + 90 * m, base[1]], [base[0] + 90 * m, base[1] + 0.001], [base[0] + 32 * m - 1e-8, base[1] + 0.001], [base[0] + 32 * m + 1e-8, base[1] - 0.0001]];
    const roza: RasgoLoteo = { properties: { tipo: "parcela", id: "parcela-2", nombre: "Parcela" }, geometry: { type: "Polygon", coordinates: [vecina] } };
    expect(validarLoteo([l, roza], anillo7A, [], []).errores).toEqual([]);
  });
});
