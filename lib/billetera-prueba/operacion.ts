/**
 * La UserOperation viaja entre el servidor y el navegador como JSON: los `bigint` van como texto decimal y el resto como hex.
 * El navegador no la edita; el servidor la vuelve a leer con validación estricta antes de enviarla.
 */
export type OperacionJson = {
  sender: string;
  nonce: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  signature: string;
  factory: string | null;
  factoryData: string | null;
  paymaster: string | null;
  paymasterVerificationGasLimit: string | null;
  paymasterPostOpGasLimit: string | null;
  paymasterData: string | null;
};

export type OperacionV7 = {
  sender: string;
  nonce: bigint;
  callData: string;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  signature: string;
  factory: string | null;
  factoryData: string | null;
  paymaster: string | null;
  paymasterVerificationGasLimit: bigint | null;
  paymasterPostOpGasLimit: bigint | null;
  paymasterData: string | null;
};

const CAMPOS_BIGINT = ["nonce", "callGasLimit", "verificationGasLimit", "preVerificationGas", "maxFeePerGas", "maxPriorityFeePerGas"] as const;
const CAMPOS_BIGINT_NULOS = ["paymasterVerificationGasLimit", "paymasterPostOpGasLimit"] as const;
const CAMPOS_HEX = ["sender", "callData", "signature"] as const;
const CAMPOS_HEX_NULOS = ["factory", "factoryData", "paymaster", "paymasterData"] as const;

export function operacionAJson(o: OperacionV7): OperacionJson {
  return {
    sender: o.sender,
    nonce: o.nonce.toString(),
    callData: o.callData,
    callGasLimit: o.callGasLimit.toString(),
    verificationGasLimit: o.verificationGasLimit.toString(),
    preVerificationGas: o.preVerificationGas.toString(),
    maxFeePerGas: o.maxFeePerGas.toString(),
    maxPriorityFeePerGas: o.maxPriorityFeePerGas.toString(),
    signature: o.signature,
    factory: o.factory,
    factoryData: o.factoryData,
    paymaster: o.paymaster,
    paymasterVerificationGasLimit: o.paymasterVerificationGasLimit?.toString() ?? null,
    paymasterPostOpGasLimit: o.paymasterPostOpGasLimit?.toString() ?? null,
    paymasterData: o.paymasterData,
  };
}

const esHex = (v: unknown): v is string => typeof v === "string" && /^0x[0-9a-fA-F]*$/.test(v);
const esDecimal = (v: unknown): v is string => typeof v === "string" && /^[0-9]{1,78}$/.test(v);

/** Lee lo que mandó el navegador. Devuelve null si falta un campo, si sobra uno o si algún valor no tiene la forma esperada. */
export function operacionDeJson(entrada: unknown): OperacionV7 | null {
  if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) return null;
  const e = entrada as Record<string, unknown>;
  const esperados = new Set<string>([...CAMPOS_BIGINT, ...CAMPOS_BIGINT_NULOS, ...CAMPOS_HEX, ...CAMPOS_HEX_NULOS]);
  if (Object.keys(e).some((k) => !esperados.has(k))) return null;
  for (const k of CAMPOS_BIGINT) if (!esDecimal(e[k])) return null;
  for (const k of CAMPOS_HEX) if (!esHex(e[k])) return null;
  for (const k of CAMPOS_BIGINT_NULOS) if (e[k] !== null && !esDecimal(e[k])) return null;
  for (const k of CAMPOS_HEX_NULOS) if (e[k] !== null && !esHex(e[k])) return null;
  const n = (k: string) => (e[k] === null ? null : BigInt(e[k] as string));
  return {
    sender: e.sender as string,
    nonce: BigInt(e.nonce as string),
    callData: e.callData as string,
    callGasLimit: BigInt(e.callGasLimit as string),
    verificationGasLimit: BigInt(e.verificationGasLimit as string),
    preVerificationGas: BigInt(e.preVerificationGas as string),
    maxFeePerGas: BigInt(e.maxFeePerGas as string),
    maxPriorityFeePerGas: BigInt(e.maxPriorityFeePerGas as string),
    signature: e.signature as string,
    factory: e.factory as string | null,
    factoryData: e.factoryData as string | null,
    paymaster: e.paymaster as string | null,
    paymasterVerificationGasLimit: n("paymasterVerificationGasLimit"),
    paymasterPostOpGasLimit: n("paymasterPostOpGasLimit"),
    paymasterData: e.paymasterData as string | null,
  };
}
