// Textos del relato de la pestaña "Modelo de financiamiento", como datos tipados con su fuente (NS_Tokenomics doc 28, 29
// y 30, v0.1, 17-oct-2026). Los montos NO se escriben acá: se piden por referencia (`ref`) y la página los toma de
// lib/financiamiento y lib/series, para que haya una sola copia de cada número. Sin React ni Next.
// Tono: el Juego A es "el camino conocido", con datos y sin nombrar a nadie.

import { ESCENARIOS } from "@/lib/series/escenarios";
import { SIN_DATO, numero, usd } from "@/lib/series/formato";
import { COMISION_DESARROLLO, CONSUMO_MENSUAL_USD, META_SAFE_USD } from "./fuentes";
import { RETORNO_SERIE_MADRE } from "./recorridos";

/** Un tamaño es un texto o una referencia a un número que arma la página. */
export type Tamano = string | { ref: "metaSafe" | "gestionAnual" };

export type ItemEtapa = { que: string; tamano: Tamano; depende: string; fuente: string };
export type Etapa = { id: "semilla" | "construir" | "escalar"; nombre: string; cuando: string; items: readonly ItemEtapa[] };

const A_COTIZAR = `${SIN_DATO} (a cotizar)`;
const F30_2 = "NS_Tokenomics doc 30 §2";

export const ETAPAS: readonly Etapa[] = [
  {
    id: "semilla",
    nombre: "Semilla",
    cuando: "Ahora a marzo 2027",
    items: [
      {
        que: "SAFE en el holding nuevo (tickets de USD 5.000)",
        tamano: { ref: "metaSafe" },
        depende: "Holding nuevo fuera de Próspera; abogado; presentación",
        fuente: F30_2,
      },
      {
        que: "Círculo Fundador (SAFE + Pase, USD 2.000 a 5.000)",
        tamano: "decenas de miles",
        depende: "Doc 15",
        fuente: F30_2,
      },
      {
        que: "Contrato de diseño regional con BioPueblo (agua, suelo y plan maestro)",
        tamano: A_COTIZAR,
        depende: "Que los dueños de BioPueblo digan que sí",
        fuente: F30_2,
      },
      { que: "Subsidios para la plataforma", tamano: "chicos e inciertos", depende: "Postulaciones", fuente: F30_2 },
    ],
  },
  {
    id: "construir",
    nombre: "Construir",
    cuando: "2027–2028",
    items: [
      {
        que: "Comisión de desarrollo por serie",
        tamano: `${Math.round(COMISION_DESARROLLO.min * 100)} a ${Math.round(COMISION_DESARROLLO.max * 100)} % del capex, una vez`,
        depende: "Series levantadas",
        fuente: F30_2,
      },
      {
        que: "Comisión de gestión por serie",
        tamano: { ref: "gestionAnual" },
        depende: "Series funcionando",
        fuente: F30_2,
      },
      {
        que: "Comisiones de plataforma (fijas)",
        tamano: `chicas, recurrentes (${SIN_DATO})`,
        depende: "Plataforma en uso",
        fuente: F30_2,
      },
      {
        que: "Contratos de operación (por ejemplo, el vivero)",
        tamano: `margen del servicio (${SIN_DATO})`,
        depende: "Series que contraten a NetX",
        fuente: F30_2,
      },
    ],
  },
  {
    id: "escalar",
    nombre: "Escalar",
    cuando: "2028 en adelante",
    items: [
      {
        que: "Gestión de la Serie Madre",
        tamano: `crece con los activos (${SIN_DATO})`,
        depende: "Programa CNV, tokenización",
        fuente: F30_2,
      },
      { que: "Licencias del kit a otros lotes y nodos", tamano: `por nodo (${SIN_DATO})`, depende: "Replicación", fuente: F30_2 },
      { que: "Valor de la empresa", tamano: SIN_DATO, depende: "Todo lo anterior", fuente: F30_2 },
    ],
  },
];

export type Bolsillo = { id: string; nombre: string; queEs: string; plata: string; netxPuedeTomar: string; fuente: string };

export const BOLSILLOS: readonly Bolsillo[] = [
  {
    id: "netx",
    nombre: "NetX Gen (holding + SAS)",
    queEs: "La empresa",
    plata: "SAFE, comisiones, contratos, licencias",
    netxPuedeTomar: "— (es NetX)",
    fuente: "NS_Tokenomics doc 30 §1",
  },
  {
    id: "fundacion",
    nombre: "Fundación (procomún)",
    queEs: "Fondo del Procomún; en el Juego B, la tierra queda en ella (todavía no existe)",
    plata: "Canon, regalía, excedente, subsidios, RAIZ",
    netxPuedeTomar:
      "No: nunca un porcentaje; solo una tarifa fija y pública si la Fundación contrata la plataforma",
    fuente: "NS_Tokenomics doc 30 §1",
  },
  {
    id: "series",
    nombre: "Series (proyectos)",
    queEs: "El fideicomiso de cada proyecto",
    plata: "Plata de inversores e ingresos del proyecto",
    netxPuedeTomar: "Solo las comisiones del contrato del fideicomiso, aprobadas por sus inversores",
    fuente: "NS_Tokenomics doc 30 §1",
  },
  {
    id: "biopueblo",
    nombre: "BioPueblo",
    queEs: "Dueña de las otras ~9.000 ha",
    plata: "Sus ventas de lotes",
    netxPuedeTomar: "Solo por contratos (diseño, regeneración); nunca comisión por venta sin matrícula de corredor",
    fuente: "NS_Tokenomics doc 30 §1",
  },
];

export type PasoCascada = { orden: number; id: string; texto: string; fuente: string };

export const CASCADA: readonly PasoCascada[] = [
  { id: "costos", texto: "Costos de operación" },
  { id: "fundacion", texto: "Fundación: canon y regalía (antes que cualquier inversor)" },
  { id: "comision", texto: "Comisión de gestión de NetX" },
  { id: "notas", texto: "Notas Verdes: interés y capital" },
  { id: "unidades", texto: "Unidades de Regeneración: hasta el tope" },
  { id: "primeraperdida", texto: "Primera pérdida: hasta su meta" },
  { id: "excedente", texto: "Excedente sobre los topes: 80 % procomún · 20 % Unidades" },
].map((p, i) => ({ ...p, orden: i + 1, fuente: "NS_Tokenomics doc 28 §1" }));

export const CASCADA_NOTA =
  "No todas las series tienen las tres clases: un viñedo joven no puede cargar deuda; un parque solar con contrato de energía puede ser 60 % deuda.";

export type SeriePosible = {
  id: string;
  nombre: string;
  descripcion: string;
  conModelo: boolean;
  /** Escenario del Simulador, si tiene modelo. */
  modelo?: "vinedo" | "agrovoltaica";
  fuente: string;
};

export const SERIES_POSIBLES: readonly SeriePosible[] = [
  { id: "s0", nombre: "S0", descripcion: "Hectárea piloto, vivero y cursos", conModelo: false },
  { id: "s1", nombre: "S1", descripcion: "Centro de materia orgánica (biochar, compost, captura de carbono)", conModelo: false },
  { id: "s2", nombre: "S2", descripcion: "Agrovoltaica (energía con contrato)", conModelo: true, modelo: "agrovoltaica" },
  { id: "s3", nombre: "S3", descripcion: "Viñedo y frutales", conModelo: true, modelo: "vinedo" },
  { id: "s4", nombre: "S4", descripcion: "Hospitalidad", conModelo: false },
  { id: "s5", nombre: "S5", descripcion: "Vivienda (después de la aprobación)", conModelo: false },
  { id: "madre", nombre: "Serie Madre", descripcion: "Invierte en todas las demás", conModelo: false },
].map((s): SeriePosible => ({ ...s, fuente: "NS_Tokenomics doc 28 §2" }) as SeriePosible);

export const SIN_MODELO = "sin modelo todavía";

export const ESCALERA_SAFU: readonly { cuando: string; texto: string; fuente: string }[] = [
  {
    cuando: "Hoy",
    texto: "SAFU de Regeneración (colocación privada o plataforma de financiamiento colectivo)",
  },
  { cuando: "2027", texto: "Primer cierre de la Serie Madre: el SAFU convierte con descuento" },
  { cuando: "2027–2028", texto: "La Serie Madre invierte en S0, S1, S2, S3…" },
  {
    cuando: "2028+",
    texto: "Unidades de la Serie Madre tokenizadas en rieles regulados por la CNV (mercado secundario = liquidez)",
  },
].map((p) => ({ ...p, fuente: "NS_Tokenomics doc 28 §3" }));

export const AL_LADO_DE_LA_ESCALERA: readonly { id: string; texto: string; marca?: string; fuente: string }[] = [
  {
    id: "raiz",
    texto: "Membresía RAIZ: rendimiento en especie (estadías, vino, cursos)",
    marca: "fecha a re-anclar: suponía el encuentro de febrero 2027 (I-15)",
    fuente: "NS_Tokenomics doc 28 §3",
  },
  { id: "safe", texto: "SAFE de NetX: participación en la empresa, sin rendimiento", fuente: "NS_Tokenomics doc 28 §3" },
];

export type Instrumento = {
  id: string;
  nombre: string;
  emite: string;
  paraQuien: string;
  recibis: string;
  formaLegal: string;
  fuente: string;
};

export const INSTRUMENTOS: readonly Instrumento[] = [
  {
    id: "safu",
    nombre: "SAFU de Regeneración",
    emite: "Serie 0",
    paraQuien: "Primeros creyentes, USD 1.000 a 50.000",
    recibis:
      "Convierte en Unidades de la Serie Madre con descuento (20 %); si la Serie Madre no abre a tiempo, en Unidades de la Serie 0",
    formaLegal:
      "Colocación privada (~35 por emisión, hasta 15 no calificados) o plataforma de financiamiento colectivo registrada en la CNV",
  },
  {
    id: "safe",
    nombre: "SAFE de NetX",
    emite: "Holding de NetX",
    paraQuien: "Inversores de riesgo",
    recibis: "Participación en la empresa (comisiones, licencias)",
    formaLegal: "Colocación privada",
  },
  {
    id: "raiz",
    nombre: "Membresía RAIZ",
    emite: "Fundación",
    paraQuien: "Cualquiera",
    recibis: "Estadías, productos, voz; rendimiento en especie",
    formaLegal: "Membresía y contrato de servicios",
  },
  {
    id: "unidades",
    nombre: "Unidades de una serie",
    emite: "Cada serie",
    paraQuien: "Inversores de impacto",
    recibis: "Rendimiento con tope de un proyecto",
    formaLegal: "Privada, después oferta pública CNV",
  },
  {
    id: "madre",
    nombre: "Unidades de la Serie Madre → tokens",
    emite: "Serie Madre",
    paraQuien: "Cualquiera con KYC",
    recibis: "Una parte de todos los proyectos, después negociable",
    formaLegal: "Oferta pública CNV + tokenización (rieles PSAV)",
  },
].map((i) => ({ ...i, fuente: "NS_Tokenomics doc 28 §3" }));

export const A_VERIFICAR_CON_ABOGADO = "a verificar con abogado";

export const HALLAZGOS_RIESGO: readonly { id: string; titulo: string; texto: string; fuente: string }[] = [
  {
    id: "primera-perdida",
    titulo: "El lugar de la primera pérdida está mal",
    // {pct} lo reemplaza la página con los porcentajes de MONTE_CARLO.
    texto:
      "Detrás de Unidades con tope, la plata catalítica se recupera completa solo en los buenos futuros (no se recupera en {pct}). Próximo modelo: retorno preferente para las Unidades, después la primera pérdida, después el tope.",
    fuente: "NS_Tokenomics doc 29 §5, hallazgo 1",
  },
  {
    id: "procomun-gana",
    titulo: "El procomún gana mucho en los buenos futuros",
    texto:
      "Su P90 es 8 a 11 veces su P50. Es el propósito, pero hay que afinar el tope y el reparto del excedente con inversores reales.",
    fuente: "NS_Tokenomics doc 29 §5, hallazgo 2",
  },
  {
    id: "demoras-heladas",
    titulo: "Las demoras y las heladas mandan las pérdidas",
    texto:
      "Respuestas a modelar: la Serie Madre repartida entre motores cuyos riesgos no se mueven juntos, un seguro o reserva contra heladas, y abrir series solo con los permisos dados.",
    fuente: "NS_Tokenomics doc 29 §5, hallazgo 3",
  },
];

export const LOTES_INTRO =
  "El Juego A es el camino conocido y lo que hace la mayoría. Acá están sus costos y lo que cambia en el Juego B.";

export type FilaLotes = {
  id: "ley" | "tierra" | "ingresos" | "aguaTierra" | "comision" | "quienVende";
  titulo: string;
  juegoA: string;
  juegoB: string;
  aVerificar: boolean;
  fuente: string;
};

export const LOTES_VS_MODELO: readonly FilaLotes[] = [
  {
    id: "ley",
    titulo: "Ley",
    juegoA: "Antes de la aprobación municipal no se puede vender, reservar ni dar prioridad (Ordenanza 173)",
    juegoB: "Nada a la venta antes de la aprobación; la plata viene de inversores y contratos",
    aVerificar: true,
  },
  {
    id: "tierra",
    titulo: "La tierra",
    juegoA: "Se vende una vez y deja de ser del proyecto",
    juegoB:
      "Queda en una Fundación que no la vende; viviendas más adelante en derecho de superficie (entrada + canon anual), después de la aprobación",
    aVerificar: true,
  },
  {
    id: "ingresos",
    titulo: "Ingresos",
    juegoA: "Entran una sola vez, el día de la venta",
    juegoB:
      "Siguen entrando: comisiones de desarrollo y de gestión, contratos de diseño y de operación; cada serie paga al procomún antes que a cualquier inversor",
    aVerificar: false,
  },
  {
    id: "aguaTierra",
    titulo: "Tierra y agua",
    juegoA:
      "Lotes dibujados antes de leer el agua: algunos sin agua, otros se inundan; quien compra lo descubre y el valor cae",
    juegoB: "Primero el diseño (agua, suelo, accesos), después la venta",
    aVerificar: false,
  },
  {
    id: "comision",
    titulo: "Comisión",
    juegoA: "NetX no puede cobrar comisión por venta de lotes sin matrícula de corredor",
    juegoB: "NetX cobra por diseño y regeneración, no por venta",
    aVerificar: true,
  },
  {
    id: "quienVende",
    titulo: "Quién vende",
    juegoA: "—",
    juegoB:
      "BioPueblo vende sus propios lotes en sus otras ~9.000 ha, ya diseñados y aprobados; una contribución por lote va a la Fundación",
    aVerificar: false,
  },
].map((f) => ({ ...f, fuente: "NS_Tokenomics doc 30 §3" })) as readonly FilaLotes[];

export const PROPUESTA_PARA_QUIEN_VENDE =
  "La forma más rápida de vender más y mejor es diseñar la tierra primero. NetX y su socio de permacultura hacen ese diseño, cobrado ahora. BioPueblo vende después, con agua, árboles y una comunidad que se puede visitar, y cada venta financia el procomún que hace más fácil la venta siguiente.";

// ---------------------------------------------------------------------------------------------------------------------
// Supuestos a confirmar. Los valores numéricos se arman desde las constantes existentes.

export type Quien = "vagner" | "martinFranz" | "abogado" | "enologo" | "desarrollador" | "biopueblo";

export const GRUPOS_SUPUESTOS: readonly { quien: Quien; titulo: string }[] = [
  { quien: "vagner", titulo: "A confirmar con Vagner" },
  { quien: "martinFranz", titulo: "A confirmar con Martín y Franz (después de la aprobación)" },
  { quien: "abogado", titulo: "A verificar con abogado" },
  { quien: "enologo", titulo: "A confirmar con un enólogo local" },
  { quien: "desarrollador", titulo: "A confirmar con un desarrollador y la red" },
  { quien: "biopueblo", titulo: "A confirmar con BioPueblo" },
];

export type SupuestoAConfirmar = {
  etiqueta: string;
  valor: string;
  /** Aclaración que va después del valor, por ejemplo "(después de la aprobación)". */
  nota?: string;
  quien: Quien;
  fuente: string;
};

function porciento(n: number): string {
  return numero(n, Number.isInteger(n) ? 0 : 1);
}

/** Número de un supuesto: sin decimales si es entero, uno si no; "sin dato" si falta. */
function num(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) ? porciento(n) : SIN_DATO;
}

/** "N veces" o "sin dato" si falta el número. */
function veces(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) ? `${num(n)} veces` : SIN_DATO;
}

const vin = ESCENARIOS.vinedo;
const agro = ESCENARIOS.agrovoltaica;
const comisionMin = Math.min(vin.decididos.comisionNetx.partida, agro.decididos.comisionNetx.partida);
const comisionMax = Math.max(vin.decididos.comisionNetx.partida, agro.decididos.comisionNetx.partida);
const consumo = CONSUMO_MENSUAL_USD.valor;
const agroNotas = agro.supuestos.parteNotas?.partida;
const agroTasa = agro.supuestos.tasaNotas?.partida;
const agroPp = agro.supuestos.partePrimeraPerdida?.partida;
const rendimiento = vin.medidos.rendimientoMadurezTHa.partida;
const precioVino = vin.medidos.precioVinoUsd.partida;
const usdPorMw = agro.medidos.costoUsdPorMw.partida;
const precioEnergia = agro.medidos.precioEnergiaUsdMwh.partida;

const F30 = "NS_Tokenomics doc 30";
const F28 = "NS_Tokenomics doc 28";

export const SUPUESTOS_A_CONFIRMAR: readonly SupuestoAConfirmar[] = [
  {
    etiqueta: "Consumo del equipo",
    valor: consumo === null ? SIN_DATO : `${usd(consumo)} por mes (de los cuales ~USD 10.000 "otros" sin desglosar)`,
    quien: "vagner",
    fuente: `${F30} §2b (doc 12)`,
  },
  {
    etiqueta: "Meta del SAFE de la empresa",
    valor: `${usd(META_SAFE_USD.min)} a ${numero(META_SAFE_USD.max)} (hay cuatro valuaciones en circulación)`,
    quien: "vagner",
    fuente: `${F30} §4`,
  },
  {
    etiqueta: "Comisión de gestión",
    valor: `${porciento(comisionMin)} a ${porciento(comisionMax)} % anual`.replace(".", ","),
    quien: "vagner",
    fuente: `${F28} §7 (parámetro)`,
  },
  {
    etiqueta: "Comisión de desarrollo",
    valor: `${Math.round(COMISION_DESARROLLO.min * 100)} a ${Math.round(COMISION_DESARROLLO.max * 100)} % del capex`,
    quien: "vagner",
    fuente: `${F30} §2 (parámetro)`,
  },
  {
    etiqueta: "Múltiplo de salida",
    valor: `${veces(vin.supuestos.multiploSalida?.partida)} (viñedo) · ${veces(agro.supuestos.multiploSalida?.partida)} (agrovoltaica)`,
    quien: "vagner",
    fuente: `${F28} §7`,
  },
  {
    etiqueta: "Estructura de capital de la agrovoltaica",
    valor:
      agroNotas === undefined || agroTasa === undefined || agroPp === undefined
        ? SIN_DATO
        : `${num(agroNotas)} % Notas Verdes al ${num(agroTasa)} % · ${num(agroPp)} % primera pérdida · ${num(100 - agroNotas - agroPp)} % Unidades`,
    quien: "vagner",
    fuente: `${F28} §7`,
  },
  {
    etiqueta: "Retorno neto de la Serie Madre",
    valor: `${RETORNO_SERIE_MADRE.valores.map((r) => Math.round(r * 100)).join(" · ")} %`,
    quien: "vagner",
    fuente: RETORNO_SERIE_MADRE.fuente,
  },
  {
    etiqueta: "Supuestos de incertidumbre del Monte Carlo",
    valor: "los de la sección ¿Y si sale mal?",
    quien: "vagner",
    fuente: "NS_Tokenomics doc 29 §5",
  },
  {
    etiqueta: "Membresías y Pase Fundador sin el Congreso",
    valor: "falta re-correr (NS_Tokenomics I-15)",
    quien: "vagner",
    fuente: `${F30} §2b`,
  },
  {
    etiqueta: "Entrada y canon anual de la vivienda",
    valor: SIN_DATO,
    nota: "(después de la aprobación)",
    quien: "martinFranz",
    fuente: `${F28} §2 (S5)`,
  },
  {
    etiqueta: "Si un fideicomiso privado puede emitir un SAFU convertible en Unidades de otra serie",
    valor: SIN_DATO,
    quien: "abogado",
    fuente: `${F28} §8`,
  },
  { etiqueta: "Distribuciones en especie", valor: SIN_DATO, quien: "abogado", fuente: `${F28} §8` },
  {
    etiqueta: "Usar Unidades para pagar una vivienda sin que sea una reserva prohibida",
    valor: SIN_DATO,
    quien: "abogado",
    fuente: `${F28} §8`,
  },
  {
    etiqueta: "Si la Serie Madre puede tener Unidades de otras series",
    valor: SIN_DATO,
    quien: "abogado",
    fuente: `${F28} §8`,
  },
  {
    etiqueta: "Rendimiento del viñedo y precio del vino",
    valor: `${num(rendimiento)} t por ha · ${usd(precioVino)} neto por botella`,
    quien: "enologo",
    fuente: "Supuesto del modelo (lib/series/escenarios)",
  },
  {
    etiqueta: "Costo del parque solar y precio de la energía",
    valor: `${usd(usdPorMw)} por MW · ${usd(precioEnergia)} por MWh`,
    quien: "desarrollador",
    fuente: "Supuesto del modelo (lib/series/escenarios)",
  },
  {
    etiqueta: "Contrato de diseño regional",
    valor: `${SIN_DATO} (a cotizar)`,
    quien: "biopueblo",
    fuente: `${F30} §2`,
  },
];
