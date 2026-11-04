import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { macrolote7 } from "../lib/territorios/biopueblo";
import { armarSalida, convertirConMapeo, convertirKml, serializar, validarLoteo, type MapeoPlano } from "../lib/territorios/importar-loteo";
import type { ArchivoLoteo } from "../lib/territorios/loteo";

/**
 * Convierte un KMZ o KML del loteo al formato de `lib/territorios/loteo-norte.json` (spec loteo-norte).
 *
 *   pnpm exec tsx scripts/importar-loteo.ts <entrada.kmz|.kml> [--salida lib/territorios/loteo-norte.json] [--comprobar] [--mapeo <archivo.json>]
 *
 * Con `--mapeo`, para planos sin nombres (CAD): qué es cada Placemark lo dice ese archivo, no su nombre.
 *
 * Valida contra el polígono del 7A. Con errores NO escribe nada y sale con código 1. Con `--comprobar` valida sin escribir.
 */

const SALIDA_POR_DEFECTO = "lib/territorios/loteo-norte.json";

function leerKmlDe(entrada: string): string {
  if (!/\.kmz$/i.test(entrada)) return readFileSync(entrada, "utf8");
  // El KMZ es un zip: se abre con `unzip` (ya está en la Mac y en Linux) y se toma el primer .kml.
  const nombres = execFileSync("unzip", ["-Z1", entrada], { encoding: "utf8" }).split("\n");
  const kml = nombres.find((n) => /\.kml$/i.test(n.trim()));
  if (!kml) throw new Error(`El KMZ no tiene ningún archivo .kml (tiene: ${nombres.filter(Boolean).join(", ") || "nada"}).`);
  return execFileSync("unzip", ["-p", entrada, kml.trim()], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

/** Ids de lote del archivo anterior (si existe), para avisar los que desaparecen. */
function idsAnteriores(salida: string): string[] {
  if (!existsSync(salida)) return [];
  try {
    const previo = JSON.parse(readFileSync(salida, "utf8")) as ArchivoLoteo;
    return previo.features.filter((f) => f.properties.tipo === "lote").map((f) => f.properties.id);
  } catch {
    return [];
  }
}

function main(argv: string[]): number {
  let entrada: string | undefined;
  let salida = SALIDA_POR_DEFECTO;
  let comprobar = false;
  let mapeo: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--comprobar") comprobar = true;
    else if (a === "--salida") salida = argv[++i] ?? "";
    else if (a === "--mapeo") mapeo = argv[++i] ?? "";
    else if (a.startsWith("--")) {
      console.error(`Opción desconocida: ${a}`);
      return 2;
    } else if (!entrada) entrada = a;
    else {
      console.error(`Sobra el argumento: ${a}`);
      return 2;
    }
  }
  if (!entrada || !salida) {
    console.error("Uso: tsx scripts/importar-loteo.ts <entrada.kmz|.kml> [--salida <archivo.json>] [--comprobar] [--mapeo <archivo.json>]");
    return 2;
  }

  let xml: string;
  try {
    xml = leerKmlDe(entrada);
  } catch (e) {
    console.error(`No pude leer ${entrada}: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }

  const { rasgos, errores } = mapeo
    ? convertirConMapeo(xml, JSON.parse(readFileSync(mapeo, "utf8")) as MapeoPlano)
    : convertirKml(xml);
  const validacion = validarLoteo(rasgos, macrolote7().anillo, idsAnteriores(salida));
  const todosLosErrores = [...errores, ...validacion.errores];

  const lotes = rasgos.filter((r) => r.properties.tipo === "lote").length;
  console.log(`Plano: ${path.basename(entrada)} · ${lotes} lotes · ${rasgos.length - lotes} zonas y parcelas`);
  for (const a of validacion.avisos) console.log(`Aviso: ${a}`);

  if (todosLosErrores.length > 0) {
    for (const e of todosLosErrores) console.error(`Error: ${e}`);
    console.error(`${todosLosErrores.length} errores. No se escribió nada.`);
    return 1;
  }

  if (comprobar) {
    console.log("Comprobado: el plano es válido. No se escribió nada (--comprobar).");
    return 0;
  }

  const hoy = new Date().toISOString().slice(0, 10);
  writeFileSync(salida, serializar(armarSalida(rasgos, path.basename(entrada), hoy)));
  console.log(`Escrito: ${salida}`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
