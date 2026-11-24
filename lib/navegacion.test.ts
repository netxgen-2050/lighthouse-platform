import { readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { DESTINOS, destinoActivo, destinosDeGrupo, destinosDelMenu, destinosDisponibles, etiquetaDeDestino } from "./navegacion";
import { esActivo } from "./ruta-activa";

const APP = path.resolve(__dirname, "..", "app");

/** Rutas con page.* en app/, ignorando route groups "(x)" y carpetas privadas "_x". */
function rutasDeApp(dir = APP, ruta = ""): string[] {
  const entradas = readdirSync(dir, { withFileTypes: true });
  const propia = entradas.some((e) => e.isFile() && /^page\.(tsx?|jsx?|mdx)$/.test(e.name)) ? [ruta || "/"] : [];
  const hijas = entradas
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .flatMap((e) => {
      const grupo = /^\(.*\)$/.test(e.name);
      return rutasDeApp(path.join(dir, e.name), grupo ? ruta : `${ruta}/${e.name}`);
    });
  return [...propia, ...hijas];
}

test("el orden de la lista es el de la spec", () => {
  expect(DESTINOS.map((d) => etiquetaDeDestino(d, "es"))).toEqual([
    "Inicio",
    "Explorar",
    "Participa",
    "Bien común",
    "Invertir",
    "Sumarte",
    "Mi tierra",
    "Pactos",
    "Semillas",
    "Fogón",
    "Compromisos",
    "Congreso",
    "Perfil",
    "Pasaporte",
    "Mi recorrido",
    "Configuración",
    "Mis datos",
    "NetX",
    "Admin",
  ]);
});

test("los grupos del menú y del menú de la persona salen de la lista única", () => {
  const etiquetas = (g: Parameters<typeof destinosDeGrupo>[0]) => destinosDeGrupo(g).map((d) => etiquetaDeDestino(d, "es"));
  // Participa se declara pero todavía no existe su página: no se muestra.
  expect(etiquetas("principal")).toEqual(["Inicio", "Explorar", "Bien común", "Invertir", "Sumarte", "Mi tierra"]);
  expect(etiquetas("persona")).toEqual(["Perfil", "Pasaporte", "Mi recorrido", "Configuración", "Mis datos"]);
  expect(etiquetas("interno")).toEqual(["NetX", "Admin"]);
  expect(etiquetas("pausa")).toEqual([]);
});

test("en inglés los destinos dicen lo que fija el glosario", () => {
  const ingles = (g: Parameters<typeof destinosDeGrupo>[0]) => destinosDeGrupo(g).map((d) => etiquetaDeDestino(d, "en"));
  expect(ingles("principal")).toEqual(["Home", "Explore", "Commons", "Invest", "Join", "My land"]);
  expect(DESTINOS.find((d) => d.href === "/participa")).toBeDefined();
  expect(etiquetaDeDestino(DESTINOS.find((d) => d.href === "/participa")!, "en")).toBe("Take part");
  expect(ingles("persona")).toEqual(["Profile", "Passport", "My journey", "Settings", "My data"]);
  const todos = DESTINOS.map((d) => etiquetaDeDestino(d, "en"));
  expect(todos).toEqual(expect.arrayContaining(["Invest", "My land", "Semillas"]));
});

test("Explorar, Invertir y Mi tierra ya existen", () => {
  for (const href of ["/explorar", "/invertir", "/mi-tierra"]) {
    expect(DESTINOS.find((d) => d.href === href)?.existe, href).toBe(true);
  }
});

test("los cinco destinos en pausa existen, están ocultos y no aparecen en ningún grupo", () => {
  const pausa = ["/fogon", "/pactos", "/semillas", "/compromisos", "/congreso"];
  const grupos = ["principal", "pausa", "persona", "interno"] as const;
  const visibles = grupos.flatMap((g) => destinosDeGrupo(g)).map((d) => d.href);
  for (const href of pausa) {
    const d = DESTINOS.find((x) => x.href === href);
    expect(d?.existe, href).toBe(true);
    expect(d?.oculto, href).toBe(true);
    expect(visibles, href).not.toContain(href);
  }
});

test("destinoActivo: Inicio solo en la raíz, Explorar abarca sus secciones y las páginas en pausa no marcan ninguno", () => {
  const clave = (ruta: string) => destinoActivo(ruta)?.clave;
  expect(clave("/")).toBe("inicio");
  expect(clave("/explorar")).toBe("explorar");
  expect(clave("/lotes/hibrido")).toBe("explorar");
  expect(clave("/lotes/x")).toBe("explorar");
  expect(clave("/lotes")).toBe("explorar");
  expect(clave("/territorios/lighthouse")).toBe("explorar");
  expect(clave("/barrios/norte")).toBe("explorar");
  expect(clave("/tribus/valle")).toBeUndefined();
  expect(clave("/bien-comun")).toBe("biencomun");
  expect(clave("/sumarte")).toBe("sumarte");
  expect(clave("/fogon")).toBeUndefined();
  expect(clave("/pactos/x")).toBeUndefined();
  expect(clave("/congreso/en")).toBeUndefined();
  expect(clave("/perfil")).toBeUndefined();
});

test("con `oculto` puesto el menú trae solo los principales; quitándolo, Compromisos vuelve después de los cinco", () => {
  const etiquetas = () => destinosDelMenu().map((d) => etiquetaDeDestino(d, "es"));
  expect(etiquetas()).toEqual(["Inicio", "Explorar", "Bien común", "Invertir", "Sumarte", "Mi tierra"]);
  const compromisos = DESTINOS.find((d) => d.href === "/compromisos") as { oculto?: true };
  compromisos.oculto = undefined;
  try {
    expect(etiquetas()).toEqual(["Inicio", "Explorar", "Bien común", "Invertir", "Sumarte", "Mi tierra", "Compromisos"]);
    expect(destinoActivo("/compromisos")?.clave).toBe("compromisos");
  } finally {
    compromisos.oculto = true;
  }
  expect(etiquetas()).toEqual(["Inicio", "Explorar", "Bien común", "Invertir", "Sumarte", "Mi tierra"]);
});

test("la subnavegación de Explorar ya no existe: no hay destinos de Territorio, Barrios, Lotes ni Comunidades", () => {
  const hrefs = DESTINOS.map((d) => d.href);
  for (const href of ["/territorios/lighthouse", "/barrios/norte", "/lotes", "/tribus"]) expect(hrefs).not.toContain(href);
});

test("todo destino oculto existe", () => {
  expect(DESTINOS.filter((d) => d.oculto).every((d) => d.existe)).toBe(true);
});

test("ningún destino apunta a /canales", () => {
  expect(DESTINOS.some((d) => d.href.startsWith("/canales"))).toBe(false);
});

/** ¿Alguna ruta de app/ (incluidas las dinámicas, como /territorios/[id]) atiende este href? */
function atiende(href: string, rutas: string[]) {
  return rutas.some((r) => new RegExp(`^${r.replace(/\[[^\]]+\]/g, "[^/]+")}$`).test(href));
}

test("`existe` de cada destino coincide con las páginas reales de app/", () => {
  const reales = rutasDeApp();
  for (const d of DESTINOS) {
    expect(d.existe, `${d.href}: existe=${d.existe} pero app/ ${atiende(d.href, reales) ? "sí" : "no"} la tiene`).toBe(
      atiende(d.href, reales),
    );
  }
});

test("solo destinos que existen: sin la ruta /panel no se muestra Mi recorrido", () => {
  const etiquetas = destinosDisponibles().map((d) => etiquetaDeDestino(d, "es"));
  // Mientras app/ no tenga /panel; el día que exista, el test de coincidencia obliga a poner existe: true.
  expect(atiende("/panel", rutasDeApp())).toBe(etiquetas.includes("Mi recorrido"));
  expect(etiquetas).toContain("Explorar");
  expect(destinosDisponibles().every((d) => d.existe)).toBe(true);
});

test("las subrutas marcan su sección y Explorar solo la raíz por su propio href", () => {
  expect(esActivo("/tribus", "/tribus/valle")).toBe(true);
  expect(esActivo("/tribus", "/tribusx")).toBe(false);
  expect(esActivo("/fogon", "/fogon/consultas")).toBe(true);
  expect(esActivo("/fogon", "/fogon/consultas/u1")).toBe(true);
  expect(esActivo("/", "/tribus")).toBe(false);
});

test("el rail marca Congreso también en la versión en inglés", () => {
  expect(esActivo("/congreso", "/congreso/en")).toBe(true);
  expect(esActivo("/congreso", "/congreso")).toBe(true);
});
