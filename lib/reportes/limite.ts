import { createHash, randomBytes } from "node:crypto";

/** Máximo de reportes sin cuenta por clave (IP) en la ventana corta. */
export const MAX_POR_CLAVE = 5;
export const VENTANA_CLAVE_MS = 10 * 60 * 1000;
/** Máximo total sin cuenta por instancia en la ventana larga. */
export const MAX_TOTAL = 30;
export const VENTANA_TOTAL_MS = 60 * 60 * 1000;

export type ResultadoLimite = { permitido: true } | { permitido: false; reintentarEnSegundos: number };

type Cabeceras = { get(nombre: string): string | null };

/**
 * Primeros 4 grupos (el bloque /64) de una IPv6, expandiendo `::`.
 * Un hogar o un celular recibe un /64 entero: por IP exacta el límite no limitaría nada.
 */
function bloque64(ip: string): string {
  // IPv4 mapeada en IPv6 (::ffff:1.2.3.4): se usa la IPv4.
  if (ip.includes(".")) return ip.slice(ip.lastIndexOf(":") + 1);
  const [izq, der] = ip.split("::");
  const a = izq ? izq.split(":") : [];
  const b = der === undefined ? [] : der ? der.split(":") : [];
  const relleno = der === undefined ? [] : Array<string>(Math.max(0, 8 - a.length - b.length)).fill("0");
  return [...a, ...relleno, ...b]
    .slice(0, 4)
    .map((g) => g.toLowerCase().replace(/^0+(?=.)/, ""))
    .join(":");
}

/** La IP del pedido: primera entrada de `x-forwarded-for`, si no `x-real-ip`, si no "desconocida". */
export function ipDelPedido(headers: Cabeceras): string {
  const reenviada = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = reenviada || headers.get("x-real-ip")?.trim() || "desconocida";
  return ip.includes(":") ? bloque64(ip) : ip;
}

/**
 * Solo pedidos que salen de nuestras páginas: sin `Origin` (curl, tests) se deja pasar;
 * con `Origin` el host tiene que ser el del pedido.
 */
export function origenPermitido(headers: Cabeceras): boolean {
  const origen = headers.get("origin");
  if (origen === null) return true;
  try {
    return new URL(origen).host === headers.get("host");
  } catch {
    return false;
  }
}

export function crearLimite(opciones: { sal?: string } = {}) {
  const sal = opciones.sal ?? randomBytes(16).toString("hex");
  const porClave = new Map<string, number[]>();
  let total: number[] = [];

  function limpiar(ahora: number) {
    for (const [clave, marcas] of porClave) {
      const vigentes = marcas.filter((t) => ahora - t < VENTANA_CLAVE_MS);
      if (vigentes.length === 0) porClave.delete(clave);
      else if (vigentes.length !== marcas.length) porClave.set(clave, vigentes);
    }
    total = total.filter((t) => ahora - t < VENTANA_TOTAL_MS);
  }

  /** Clave de memoria: SHA-256 con sal por instancia; la IP no se guarda en claro. */
  function claveDeIp(headers: Cabeceras): string {
    return createHash("sha256").update(sal).update(ipDelPedido(headers)).digest("hex");
  }

  /** Si pasa, registra el envío (antes de llamar a GitHub, para que dos pedidos simultáneos no pasen). */
  function intentar(clave: string, ahora: number): ResultadoLimite {
    limpiar(ahora);
    const marcas = porClave.get(clave) ?? [];
    const esperas: number[] = [];
    if (marcas.length >= MAX_POR_CLAVE) esperas.push(marcas[0] + VENTANA_CLAVE_MS - ahora);
    if (total.length >= MAX_TOTAL) esperas.push(total[0] + VENTANA_TOTAL_MS - ahora);
    if (esperas.length > 0) {
      return { permitido: false, reintentarEnSegundos: Math.max(1, Math.ceil(Math.max(...esperas) / 1000)) };
    }
    porClave.set(clave, [...marcas, ahora]);
    total.push(ahora);
    return { permitido: true };
  }

  /** Devuelve el cupo de un envío que no llegó a GitHub. */
  function descontar(clave: string, ahora: number) {
    const marcas = porClave.get(clave);
    if (marcas) {
      const i = marcas.lastIndexOf(ahora);
      if (i !== -1) marcas.splice(i, 1);
      if (marcas.length === 0) porClave.delete(clave);
    }
    const j = total.lastIndexOf(ahora);
    if (j !== -1) total.splice(j, 1);
  }

  function reiniciar() {
    porClave.clear();
    total = [];
  }

  return { claveDeIp, intentar, descontar, reiniciar };
}

/** Instancia de la ruta: vive en la memoria de la función y se pierde al apagarse. */
export const limiteSinCuenta = crearLimite();
