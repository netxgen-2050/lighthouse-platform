import {
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  hashTypedData,
  keccak256,
  parseAbi,
  parseAbiParameters,
  stringToHex,
  zeroAddress,
  type Hex,
} from "viem";
import type { Red } from "./red";

/** Schema de la prueba: sin resolver y revocable. Sin datos personales. */
export const SCHEMA_PRUEBA = "string prueba,uint64 creada_en";
export const TEXTO_PRUEBA = "prueba de Candide";
const ZERO_BYTES32: Hex = `0x${"0".repeat(64)}`;

export const ABI_EAS = parseAbi([
  "struct AttestationRequestData { address recipient; uint64 expirationTime; bool revocable; bytes32 refUID; bytes data; uint256 value; }",
  "struct AttestationRequest { bytes32 schema; AttestationRequestData data; }",
  "function attest(AttestationRequest request) payable returns (bytes32)",
  "function version() view returns (string)",
  "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)",
]);

export const ABI_REGISTRO = parseAbi([
  "struct SchemaRecord { bytes32 uid; address resolver; bool revocable; string schema; }",
  "function register(string schema, address resolver, bool revocable) returns (bytes32)",
  "function getSchema(bytes32 uid) view returns (SchemaRecord)",
]);

/** UID del schema: keccak256(abi.encodePacked(schema, resolver, revocable)), igual que `SchemaRegistry._getUID`. */
export function uidDelSchema(): Hex {
  return keccak256(encodePacked(["string", "address", "bool"], [SCHEMA_PRUEBA, zeroAddress, true]));
}

/** Los datos del schema codificados: `(string prueba, uint64 creada_en)`. */
export function datosDeLaConstancia(creadaEn: bigint): Hex {
  return encodeAbiParameters(parseAbiParameters("string, uint64"), [TEXTO_PRUEBA, creadaEn]);
}

export function llamadaRegister(): Hex {
  return encodeFunctionData({ abi: ABI_REGISTRO, functionName: "register", args: [SCHEMA_PRUEBA, zeroAddress, true] });
}

/** `attest` de la constancia de prueba: la destinataria es la propia Safe, sin vencimiento ni `refUID`, sin valor. */
export function llamadaAttest(destinataria: Hex, creadaEn: bigint): Hex {
  return encodeFunctionData({
    abi: ABI_EAS,
    functionName: "attest",
    args: [
      {
        schema: uidDelSchema(),
        data: {
          recipient: destinataria,
          expirationTime: 0n,
          revocable: true,
          refUID: ZERO_BYTES32,
          data: datosDeLaConstancia(creadaEn),
          value: 0n,
        },
      },
    ],
  });
}

// --- Constancia fuera de la cadena (versión 1 de EAS offchain; types y dominio como en `eas-sdk` 2.10.0, offchain.js) ---

export const TIPOS_OFFCHAIN_V1 = {
  Attest: [
    { name: "version", type: "uint16" },
    { name: "schema", type: "bytes32" },
    { name: "recipient", type: "address" },
    { name: "time", type: "uint64" },
    { name: "expirationTime", type: "uint64" },
    { name: "revocable", type: "bool" },
    { name: "refUID", type: "bytes32" },
    { name: "data", type: "bytes" },
  ],
} as const;

/** Nombre del dominio EIP-712 de EAS fuera de la cadena. Ojo: es "EAS Attestation", no "EAS" (eas-sdk `versions.EIP712_NAME`). */
export const NOMBRE_DOMINIO_OFFCHAIN = "EAS Attestation";

export type ConstanciaFuera = {
  version: 1;
  schema: Hex;
  recipient: Hex;
  time: bigint;
  expirationTime: bigint;
  revocable: boolean;
  refUID: Hex;
  data: Hex;
};

export function constanciaFuera(destinataria: Hex, tiempo: bigint): ConstanciaFuera {
  return {
    version: 1,
    schema: uidDelSchema(),
    recipient: destinataria,
    time: tiempo,
    expirationTime: 0n,
    revocable: true,
    refUID: ZERO_BYTES32,
    data: datosDeLaConstancia(tiempo),
  };
}

export function dominioOffchain(red: Red, versionEas: string) {
  return { name: NOMBRE_DOMINIO_OFFCHAIN, version: versionEas, chainId: red.chainId, verifyingContract: red.eas };
}

/** Hash EIP-712 de la constancia (lo que firmaría un EOA con ECDSA). */
export function hashDeLaConstanciaFuera(red: Red, versionEas: string, c: ConstanciaFuera): Hex {
  return hashTypedData({
    domain: dominioOffchain(red, versionEas),
    types: TIPOS_OFFCHAIN_V1,
    primaryType: "Attest",
    message: c,
  });
}

/**
 * UID de la constancia fuera de la cadena, versión 1 (`Offchain.getOffchainUID` del SDK). Detalle heredado del SDK: el campo
 * `schema` entra como los bytes UTF-8 del texto hexadecimal del UID, no como los 32 bytes.
 */
export function uidDeLaConstanciaFuera(c: ConstanciaFuera): Hex {
  return keccak256(
    encodePacked(
      ["uint16", "bytes", "address", "address", "uint64", "uint64", "bool", "bytes32", "bytes", "uint32"],
      [c.version, stringToHex(c.schema), c.recipient, zeroAddress, c.time, c.expirationTime, c.revocable, c.refUID, c.data, 0],
    ),
  );
}

/**
 * Hash de `SafeMessage` que firma la passkey: EIP-712 con el dominio de la Safe (`chainId`, `verifyingContract`) y
 * `message = abi.encode(hashConstancia)` (32 bytes), que es lo que verifica `isValidSignature(bytes32, bytes)` del
 * `CompatibilityFallbackHandler`.
 */
export function hashDeSafeMessage(red: Red, safe: Hex, hashConstancia: Hex): Hex {
  return hashTypedData({
    domain: { chainId: red.chainId, verifyingContract: safe },
    types: { SafeMessage: [{ name: "message", type: "bytes" }] },
    primaryType: "SafeMessage",
    message: { message: hashConstancia },
  });
}
