import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { macrolote7, type Anillo } from "@/lib/territorios/biopueblo";
import { METROS_POR_GRADO_LAT, METROS_POR_GRADO_LNG } from "@/lib/territorios/geometria";
import { loteoDe, type ArchivoLoteo } from "@/lib/territorios/loteo";

// El comando se prueba de punta a punta sobre un KML escrito en una carpeta temporal, con --salida en esa misma carpeta:
// nunca escribe sobre lib/territorios/loteo-norte.json.

const raiz = process.cwd();
const tsx = path.join(raiz, "node_modules", ".bin", "tsx");
const script = path.join(raiz, "scripts", "importar-loteo.ts");
const archivoVigente = path.join(raiz, "lib", "territorios", "loteo-norte.json");

const a7 = macrolote7().anillo;
const base = [a7.reduce((s, p) => s + p[0], 0) / a7.length, a7.reduce((s, p) => s + p[1], 0) / a7.length];

function rect(dx: number, dy: number, ancho = 32, alto = 42): Anillo {
  const x0 = base[0] + dx / METROS_POR_GRADO_LNG;
  const y0 = base[1] + dy / METROS_POR_GRADO_LAT;
  const x1 = x0 + ancho / METROS_POR_GRADO_LNG;
  const y1 = y0 + alto / METROS_POR_GRADO_LAT;
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
}
const placemark = (nombre: string, a: Anillo) =>
  `<Placemark><name>${nombre}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${a.map(([x, y]) => `${x},${y},0`).join(" ")}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
const kml = (...p: string[]) => `<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>${p.join("")}</Document></kml>`;

function correr(args: string[]): { codigo: number; salida: string } {
  const r = spawnSync(tsx, [script, ...args], { encoding: "utf8", cwd: raiz });
  return { codigo: r.status ?? -1, salida: `${r.stdout}${r.stderr}` };
}

let carpeta: string;
let vigenteAntes: string;
beforeAll(() => {
  carpeta = mkdtempSync(path.join(os.tmpdir(), "importar-loteo-"));
  vigenteAntes = readFileSync(archivoVigente, "utf8");
});
afterAll(() => {
  // El archivo real no se toca nunca.
  expect(readFileSync(archivoVigente, "utf8")).toBe(vigenteAntes);
});

const bueno = kml(
  placemark("Sector norte", rect(-500, -500, 1000, 1000)),
  placemark("Lote 1", rect(0, 0)),
  placemark("L-2", rect(32, 0)),
  placemark("Lote 3", rect(0, 42)),
);

describe("scripts/importar-loteo.ts", () => {
  it("--comprobar no crea la salida, sale con 0 y muestra cantidad, avisos y el aviso del río", () => {
    const entrada = path.join(carpeta, "comprobar.kml");
    const salida = path.join(carpeta, "comprobar.json");
    writeFileSync(entrada, bueno);
    const r = correr([entrada, "--salida", salida, "--comprobar"]);
    expect(r.codigo).toBe(0);
    expect(r.salida).toContain("3 lotes");
    expect(r.salida).toContain("Franja del río: sin verificar (sin dato)");
    expect(existsSync(salida)).toBe(false);
  });

  it("sin --comprobar escribe la salida, con area_ha en el sector, y se lee sin tocar pantallas", () => {
    const entrada = path.join(carpeta, "bueno.kml");
    const salida = path.join(carpeta, "bueno.json");
    writeFileSync(entrada, bueno);
    const r = correr([entrada, "--salida", salida]);
    expect(r.codigo).toBe(0);
    const escrito = JSON.parse(readFileSync(salida, "utf8")) as ArchivoLoteo;
    expect(escrito.features.find((f) => f.properties.tipo === "sector")?.properties.area_ha).toBe(100);
    expect(escrito.metadata).toMatchObject({ fuenteId: "martin", archivo: "bueno.kml" });
    // La salida del importador se lee con el mismo módulo que las pantallas, ahora con la fuente de Martín.
    const leido = loteoDe(escrito);
    expect(leido.fuenteDelLoteo()).toBe("martin");
    expect(leido.listarLotes().map((l) => [l.id, l.superficieM2])).toEqual([["lote-1", 1344], ["lote-2", 1344], ["lote-3", 1344]]);
    expect(leido.sectorNorte()?.areaHa).toBe(100);
  });

  it("un lote fuera del 7A sale con 1, nombra el lote y no crea la salida", () => {
    const entrada = path.join(carpeta, "fuera.kml");
    const salida = path.join(carpeta, "fuera.json");
    writeFileSync(entrada, kml(placemark("Lote 1", rect(0, 0)), placemark("Lote 7", rect(5_000_000, 0))));
    const r = correr([entrada, "--salida", salida]);
    expect(r.codigo).toBe(1);
    expect(r.salida).toContain("lote-7: queda fuera del polígono del 7A");
    expect(existsSync(salida)).toBe(false);
  });

  it("un polígono desconocido sale con 1, lo nombra y no crea la salida", () => {
    const entrada = path.join(carpeta, "pileta.kml");
    const salida = path.join(carpeta, "pileta.json");
    writeFileSync(entrada, kml(placemark("Lote 1", rect(0, 0)), placemark("Pileta", rect(100, 0))));
    const r = correr([entrada, "--salida", salida]);
    expect(r.codigo).toBe(1);
    expect(r.salida).toContain('"Pileta"');
    expect(existsSync(salida)).toBe(false);
  });

  it("dos lotes superpuestos salen con 1 y nombran los dos", () => {
    const entrada = path.join(carpeta, "pisados.kml");
    const salida = path.join(carpeta, "pisados.json");
    writeFileSync(entrada, kml(placemark("Lote 1", rect(0, 0)), placemark("Lote 2", rect(10, 5))));
    const r = correr([entrada, "--salida", salida]);
    expect(r.codigo).toBe(1);
    expect(r.salida).toContain("lote-1 y lote-2 se superponen");
    expect(existsSync(salida)).toBe(false);
  });

  it("reimportar avisa los ids que ya no están respecto de la salida anterior", () => {
    const entrada = path.join(carpeta, "reimportar.kml");
    const salida = path.join(carpeta, "reimportar.json");
    writeFileSync(entrada, bueno);
    expect(correr([entrada, "--salida", salida]).codigo).toBe(0);
    writeFileSync(entrada, kml(placemark("Lote 1", rect(0, 0))));
    const r = correr([entrada, "--salida", salida, "--comprobar"]);
    expect(r.codigo).toBe(0);
    expect(r.salida).toContain("lote-2 ya no está");
    expect(r.salida).toContain("lote-3 ya no está");
  });

  it("sin archivo de entrada o con una opción desconocida sale con 2", () => {
    expect(correr([]).codigo).toBe(2);
    expect(correr(["x.kml", "--rara"]).codigo).toBe(2);
  });

  it("un archivo que no existe sale con 1", () => {
    expect(correr([path.join(carpeta, "no-existe.kml"), "--comprobar"]).codigo).toBe(1);
  });

  const hayZip = spawnSync("zip", ["-v"]).error === undefined;
  it.skipIf(!hayZip)("también abre un .kmz (primer .kml del zip)", () => {
    const interno = path.join(carpeta, "doc.kml");
    const entrada = path.join(carpeta, "plano.kmz");
    writeFileSync(interno, bueno);
    execFileSync("zip", ["-j", "-q", entrada, interno]);
    const r = correr([entrada, "--salida", path.join(carpeta, "kmz.json"), "--comprobar"]);
    expect(r.codigo).toBe(0);
    expect(r.salida).toContain("3 lotes");
  });
});
