import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

// Ninguna pantalla de lotes ni su diccionario escribe un número del modelo: salen de `lib/lotes/modelo.ts` (spec modelo-lotes).

const RAIZ = path.resolve(__dirname, "..", "..");

// Valores del modelo, de la superficie de los lotes del plano y términos de la tesis de inversión que no van en estas pantallas.
// Incluye los de los tres escenarios del bien común (30.000, 72.000 y 240.000), el aporte del paquete promedio y los de la cobertura.
const NUMEROS = [
  "15.000",
  "40.000",
  "238.000",
  "500.000",
  "1.200",
  "2.880",
  "72.000",
  "1.680",
  "2.798",
  "1.344",
  "152.100",
  "30.000",
  "240.000",
  "7.605",
  "25.200",
  // Valores de ejemplo de los tokens del bien común (`lib/bien-comun/modelo.ts`): suministro, tramos y precios.
  "10.000.000",
  "750.000",
  "3.500.000",
  "0,05",
  "0,08",
  "0,12",
  "0,18",
];
const TERMINOS = /\b(?:SMA|111|TIR|recupero)\b/;

function archivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : [];
  });
}

const ARCHIVOS = [
  ...archivos(path.join(RAIZ, "app", "lotes")),
  path.join(RAIZ, "lib", "idioma", "textos", "lotes.ts"),
  // Qué es tuyo y qué es de todos (`/lotes/hibrido`): sus números salen de los módulos, no del diccionario.
  path.join(RAIZ, "lib", "idioma", "textos", "hibrido.ts"),
  path.join(RAIZ, "lib", "lotes", "hibrido.ts"),
  // La puerta "Comprar un lote" de Sumarte lee el precio del módulo del modelo.
  path.join(RAIZ, "lib", "idioma", "textos", "sumarte.ts"),
  // El bien común con tokens (`/bien-comun`): sus números salen de `lib/bien-comun/modelo.ts`.
  ...archivos(path.join(RAIZ, "app", "bien-comun")),
  ...archivos(path.join(RAIZ, "components", "bien-comun")),
  path.join(RAIZ, "lib", "idioma", "textos", "bien-comun.ts"),
].filter(existsSync);

// Nada sobre FARO o el tesoro del común habla de ganancia, retorno, valorización ni precio de FARO (spec bien-comun-propuesta).
// "Retorno" solo se permite bajo `carriles.a` del diccionario (Token Tierra, Token Inversor, fideicomiso).
const PROMESAS = /ganancia|retorno|valorizaci[oó]n|profit|return|appreciation|precio de FARO|FARO price/i;
// En el código de las pantallas "return" es una palabra reservada: ahí solo se vigila el resto.
const PROMESAS_EN_CODIGO = /ganancia|retorno|valorizaci[oó]n|profit|\breturns\b|appreciation|precio de FARO|FARO price/i;

test("hay pantallas de lotes que vigilar", () => {
  expect(ARCHIVOS.length).toBeGreaterThan(1);
});

test("app/lotes/ y el diccionario de lotes no escriben números del modelo", () => {
  const malos = ARCHIVOS.flatMap((f) => {
    const texto = readFileSync(f, "utf8");
    return NUMEROS.filter((n) => texto.includes(n)).map((n) => `${path.relative(RAIZ, f)}: ${n}`);
  });
  expect(malos).toEqual([]);
});

test("app/lotes/ y el diccionario de lotes no hablan de SMA, TIR ni recupero", () => {
  const malos = ARCHIVOS.filter((f) => TERMINOS.test(readFileSync(f, "utf8"))).map((f) => path.relative(RAIZ, f));
  expect(malos).toEqual([]);
});

// Textos de un diccionario como lista de [ruta, texto]; las funciones se leen por su código fuente.
function textosConRuta(valor: unknown, ruta = ""): [string, string][] {
  if (typeof valor === "string") return [[ruta, valor]];
  if (typeof valor === "function") return [[ruta, String(valor)]];
  if (Array.isArray(valor)) return valor.flatMap((v, i) => textosConRuta(v, `${ruta}[${i}]`));
  if (valor !== null && typeof valor === "object") {
    return Object.entries(valor).flatMap(([k, v]) => textosConRuta(v, ruta ? `${ruta}.${k}` : k));
  }
  return [];
}

test("el bien común no habla de ganancia, retorno ni valorización, ni en pantalla ni en sus ⚖", async () => {
  const { TERMINOS } = await import("../legal/terminos");
  const { biencomun } = await import("../idioma/textos/bien-comun");
  const claves = ["nftlote", "tokenbiencomun", "tesorocomun", "retribucionraiz"] as const;
  const diccionario = path.join(RAIZ, "lib", "idioma", "textos", "bien-comun.ts");
  const malos = [
    // Las pantallas y componentes no escriben estas palabras: sus textos vienen del diccionario.
    ...ARCHIVOS.filter((f) => f !== diccionario && /bien-comun/.test(f) && PROMESAS_EN_CODIGO.test(readFileSync(f, "utf8"))).map((f) =>
      path.relative(RAIZ, f),
    ),
    // El diccionario, en los dos idiomas, solo puede decir "retorno" bajo `carriles.a`.
    ...(["es", "en"] as const).flatMap((i) =>
      textosConRuta(biencomun[i])
        .filter(([ruta, texto]) => !ruta.startsWith("carriles.a") && PROMESAS.test(texto))
        .map(([ruta]) => `${i}:${ruta}`),
    ),
    ...claves.filter((c) => PROMESAS.test(JSON.stringify(TERMINOS[c]))),
  ];
  expect(malos).toEqual([]);
});

test("el detector de promesas atrapa 'retorno' fuera de carriles.a", () => {
  const dic = { carriles: { a: { titulo: "capital con retorno" } }, puertas: { conElLote: { texto: "da retorno" } } };
  const fuera = textosConRuta(dic).filter(([r, t]) => !r.startsWith("carriles.a") && PROMESAS.test(t));
  expect(fuera.map(([r]) => r)).toEqual(["puertas.conElLote.texto"]);
});
