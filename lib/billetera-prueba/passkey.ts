/**
 * Passkey (WebAuthn, P-256): funciones puras para pasar de lo que da el navegador a lo que pide la Safe. Sin red y sin
 * criptografía propia: solo se leen estructuras (SPKI, DER, JSON) y se comprueba que un punto está en la curva.
 */

// Parámetros de la curva P-256 (secp256r1, FIPS 186-4): y² = x³ + ax + b (mod p), con a = -3.
const P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;
const B = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn;
const ORDEN = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;

export type LlavePublica = { x: bigint; y: bigint };

/** Prefijo SPKI de una llave P-256 sin comprimir: SEQUENCE { SEQUENCE { id-ecPublicKey, prime256v1 }, BIT STRING 0x04… }. */
const PREFIJO_SPKI_P256 = Uint8Array.from([
  0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07,
  0x03, 0x42, 0x00,
]);

export class ErrorDePasskey extends Error {}

function aBigint(bytes: Uint8Array): bigint {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  return n;
}

function modulo(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r >= 0n ? r : r + m;
}

/** ¿Es (x, y) un punto de la curva P-256? (Los dos en el rango del campo y la ecuación se cumple.) */
export function esPuntoDeP256(x: bigint, y: bigint): boolean {
  if (x <= 0n || y <= 0n || x >= P || y >= P) return false;
  return modulo(y * y, P) === modulo(x * x * x - 3n * x + B, P);
}

/** SPKI DER de P-256 → `{ x, y }`. Rechaza otro algoritmo, otra curva, un punto comprimido o un punto fuera de la curva. */
export function llaveDeSpki(spki: Uint8Array): LlavePublica {
  if (spki.length !== PREFIJO_SPKI_P256.length + 65) throw new ErrorDePasskey("La llave pública no es una P-256 sin comprimir.");
  for (let i = 0; i < PREFIJO_SPKI_P256.length; i++) {
    if (spki[i] !== PREFIJO_SPKI_P256[i]) throw new ErrorDePasskey("La llave pública no es una P-256.");
  }
  const punto = spki.subarray(PREFIJO_SPKI_P256.length);
  if (punto[0] !== 0x04) throw new ErrorDePasskey("La llave pública está comprimida.");
  const x = aBigint(punto.subarray(1, 33));
  const y = aBigint(punto.subarray(33, 65));
  if (!esPuntoDeP256(x, y)) throw new ErrorDePasskey("La llave pública no es un punto de P-256.");
  return { x, y };
}

function leerEntero(der: Uint8Array, pos: number): { valor: bigint; siguiente: number } {
  if (der[pos] !== 0x02) throw new ErrorDePasskey("Firma DER inválida.");
  const largo = der[pos + 1];
  if (largo === undefined || largo === 0 || largo > 33 || pos + 2 + largo > der.length) throw new ErrorDePasskey("Firma DER inválida.");
  const bytes = der.subarray(pos + 2, pos + 2 + largo);
  if ((bytes[0]! & 0x80) !== 0) throw new ErrorDePasskey("Firma DER inválida.");
  return { valor: aBigint(bytes), siguiente: pos + 2 + largo };
}

/** Firma ECDSA en DER (lo que da WebAuthn) → `{ r, s }`. */
export function firmaDerARS(der: Uint8Array): { r: bigint; s: bigint } {
  if (der.length < 8 || der[0] !== 0x30) throw new ErrorDePasskey("Firma DER inválida.");
  let pos = 2;
  if ((der[1]! & 0x80) !== 0) {
    // Largo largo (no pasa con P-256: el máximo es 72 bytes), se rechaza.
    throw new ErrorDePasskey("Firma DER inválida.");
  }
  if (der[1] !== der.length - 2) throw new ErrorDePasskey("Firma DER inválida.");
  const r = leerEntero(der, pos);
  pos = r.siguiente;
  const s = leerEntero(der, pos);
  if (s.siguiente !== der.length) throw new ErrorDePasskey("Firma DER inválida.");
  if (r.valor <= 0n || s.valor <= 0n || r.valor >= ORDEN || s.valor >= ORDEN) throw new ErrorDePasskey("Firma fuera de rango.");
  return { r: r.valor, s: s.valor };
}

/**
 * Lo que va en `clientDataJSON` después del challenge, tal cual lo firmó el autenticador (sin la coma inicial ni la llave final):
 * por ejemplo `"origin":"https://x.test","crossOrigin":false`. La Safe reconstruye el JSON con eso.
 */
export function camposDeClientData(clientDataJSON: string): string {
  const m = /^\{"type":"webauthn\.get","challenge":"[A-Za-z0-9_-]+",(.+)\}$/s.exec(clientDataJSON);
  if (!m || !m[1]) throw new ErrorDePasskey("clientDataJSON inesperado.");
  return m[1];
}

/** Base64url (con o sin relleno) → bytes. */
export function desdeBase64Url(texto: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*={0,2}$/.test(texto)) throw new ErrorDePasskey("Base64url inválido.");
  const normal = texto.replace(/=+$/, "").replace(/-/g, "+").replace(/_/g, "/");
  const relleno = normal + "=".repeat((4 - (normal.length % 4)) % 4);
  const binario = atob(relleno);
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

/** Bytes → base64url sin relleno. */
export function aBase64Url(bytes: Uint8Array): string {
  let binario = "";
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** `{ x, y }` como texto hexadecimal de 32 bytes cada uno (así viajan por JSON y se guardan en el navegador). */
export function llaveAHex(l: LlavePublica): { x: string; y: string } {
  return { x: `0x${l.x.toString(16).padStart(64, "0")}`, y: `0x${l.y.toString(16).padStart(64, "0")}` };
}

/** Lo inverso; devuelve null si algo no es un hex de hasta 32 bytes o el punto no está en la curva. */
export function llaveDeHex(entrada: unknown): LlavePublica | null {
  if (typeof entrada !== "object" || entrada === null) return null;
  const { x, y } = entrada as Record<string, unknown>;
  if (typeof x !== "string" || typeof y !== "string") return null;
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(x) || !/^0x[0-9a-fA-F]{1,64}$/.test(y)) return null;
  const l = { x: BigInt(x), y: BigInt(y) };
  return esPuntoDeP256(l.x, l.y) ? l : null;
}
