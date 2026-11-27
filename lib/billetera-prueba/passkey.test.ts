import { webauthnSignatureFromAssertion } from "abstractionkit";
import { describe, expect, it } from "vitest";
import {
  aBase64Url,
  camposDeClientData,
  desdeBase64Url,
  ErrorDePasskey,
  esPuntoDeP256,
  firmaDerARS,
  llaveAHex,
  llaveDeHex,
  llaveDeSpki,
} from "./passkey";

// Vector fijo, generado una vez con `crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" })` de Node y
// `crypto.sign("sha256", …, { dsaEncoding: "der" })`; x e y salen del JWK de la misma llave. Sin valor, solo de prueba.
const SPKI = "3059301306072a8648ce3d020106082a8648ce3d03010703420004f4e20f0719c321dd7cd9531c62c4d10a10a9fc87c31637341841b9efa97cc9ba12de54db4e9a67f0f1161276458ad3d17287e8554b3b10f7b1a1cc9a6ab2129d";
const X = "f4e20f0719c321dd7cd9531c62c4d10a10a9fc87c31637341841b9efa97cc9ba";
const Y = "12de54db4e9a67f0f1161276458ad3d17287e8554b3b10f7b1a1cc9a6ab2129d";
const FIRMA_DER = "3045022100f4ac4d9d47d45c5107ede15cd13feaf546b35b2c8339a7dc2d0b46b50227d34d0220036262dfc6a908a72f12be30717cbf390f38a027445fbf56bed2b751609ac8b7";

const bytes = (hex: string) => Uint8Array.from(Buffer.from(hex, "hex"));

describe("llaveDeSpki", () => {
  it("saca x e y de una llave P-256", () => {
    expect(llaveDeSpki(bytes(SPKI))).toEqual({ x: BigInt(`0x${X}`), y: BigInt(`0x${Y}`) });
  });

  it("rechaza otro largo, otro algoritmo, un punto comprimido y un punto fuera de la curva", () => {
    expect(() => llaveDeSpki(bytes(SPKI.slice(0, -2)))).toThrow(ErrorDePasskey);
    // Otro identificador de curva (secp256k1: 2b8104000a) en lugar de prime256v1.
    expect(() => llaveDeSpki(bytes(SPKI.replace("2a8648ce3d030107", "2b8104000a0000000"))))
      .toThrow(ErrorDePasskey);
    const comprimida = SPKI.replace("0004f4e2", "0002f4e2");
    expect(() => llaveDeSpki(bytes(comprimida))).toThrow(/comprimida/);
    const fuera = SPKI.slice(0, -2) + "9e";
    expect(() => llaveDeSpki(bytes(fuera))).toThrow(/no es un punto/);
  });
});

describe("esPuntoDeP256", () => {
  it("acepta el punto del vector y rechaza ceros, el campo entero y un punto alterado", () => {
    expect(esPuntoDeP256(BigInt(`0x${X}`), BigInt(`0x${Y}`))).toBe(true);
    expect(esPuntoDeP256(0n, 0n)).toBe(false);
    expect(esPuntoDeP256(1n, 1n)).toBe(false);
    expect(esPuntoDeP256(BigInt(`0x${X}`), BigInt(`0x${Y}`) + 1n)).toBe(false);
    expect(esPuntoDeP256(2n ** 256n, 2n ** 256n)).toBe(false);
  });
});

describe("firmaDerARS", () => {
  it("separa r y s", () => {
    const { r, s } = firmaDerARS(bytes(FIRMA_DER));
    expect(r.toString(16)).toBe("f4ac4d9d47d45c5107ede15cd13feaf546b35b2c8339a7dc2d0b46b50227d34d");
    expect(s.toString(16)).toBe("36262dfc6a908a72f12be30717cbf390f38a027445fbf56bed2b751609ac8b7");
  });

  it("rechaza una firma que no es DER", () => {
    expect(() => firmaDerARS(bytes("00"))).toThrow(ErrorDePasskey);
    expect(() => firmaDerARS(bytes(FIRMA_DER.slice(2)))).toThrow(ErrorDePasskey);
    expect(() => firmaDerARS(bytes(FIRMA_DER + "00"))).toThrow(ErrorDePasskey);
    expect(() => firmaDerARS(bytes(FIRMA_DER.replace("3045", "3044")))).toThrow(ErrorDePasskey);
  });
});

describe("camposDeClientData", () => {
  const challenge = "dGVzdA";
  const json = `{"type":"webauthn.get","challenge":"${challenge}","origin":"https://x.test","crossOrigin":false}`;

  it("devuelve lo que sigue al challenge, sin la coma ni la llave final", () => {
    expect(camposDeClientData(json)).toBe('"origin":"https://x.test","crossOrigin":false');
  });

  it("coincide con la función de abstractionkit (en hexadecimal)", () => {
    const r = webauthnSignatureFromAssertion({
      authenticatorData: new Uint8Array(37),
      clientDataJSON: json,
      signature: bytes(FIRMA_DER),
    });
    const esperado = `0x${Buffer.from(camposDeClientData(json), "utf8").toString("hex")}`;
    expect(String(r.clientDataFields).toLowerCase()).toBe(esperado);
  });

  it("rechaza un JSON de otra forma", () => {
    expect(() => camposDeClientData("{}")).toThrow(ErrorDePasskey);
    expect(() => camposDeClientData(json.replace("webauthn.get", "webauthn.create"))).toThrow(ErrorDePasskey);
    expect(() => camposDeClientData(`{"type":"webauthn.get","challenge":"abc"}`)).toThrow(ErrorDePasskey);
  });
});

describe("base64url y hex", () => {
  it("va y vuelve", () => {
    const b = bytes(SPKI);
    expect(desdeBase64Url(aBase64Url(b))).toEqual(b);
    expect(() => desdeBase64Url("a b")).toThrow(ErrorDePasskey);
  });

  it("la llave viaja como hex y se valida al volver", () => {
    const l = llaveDeSpki(bytes(SPKI));
    const h = llaveAHex(l);
    expect(h.x).toBe(`0x${X}`);
    expect(llaveDeHex(h)).toEqual(l);
    expect(llaveDeHex({ x: "0x1", y: "0x2" })).toBeNull();
    expect(llaveDeHex({ x: 1, y: 2 })).toBeNull();
    expect(llaveDeHex(null)).toBeNull();
  });
});
