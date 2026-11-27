import { getSafeMessageEip712Data } from "abstractionkit";
import { concat, decodeFunctionData, encodeAbiParameters, keccak256, parseAbiParameters, toHex, type Hex } from "viem";
import { describe, expect, it } from "vitest";
import {
  ABI_EAS,
  ABI_REGISTRO,
  constanciaFuera,
  hashDeLaConstanciaFuera,
  hashDeSafeMessage,
  llamadaAttest,
  llamadaRegister,
  SCHEMA_PRUEBA,
  uidDeLaConstanciaFuera,
  uidDelSchema,
} from "./eas";
import { BASE_SEPOLIA } from "./red";

const SAFE: Hex = "0x1111111111111111111111111111111111111111";

describe("schema de prueba", () => {
  it("el UID es keccak256(schema, resolver, revocable) y no cambia", () => {
    // Calculado una vez con `uidDelSchema()` y comprobado contra `SchemaRegistry.getSchema` en Base Sepolia (devuelve vacío: sin
    // registrar todavía). Para confirmarlo en EASScan hace falta que alguien lo registre (lo hace la primera operación real).
    expect(uidDelSchema()).toBe("0xe67582ba0db910cb244964d59ca08869905d7c05575e047945f7a56b45e627a0");
    expect(SCHEMA_PRUEBA).toBe("string prueba,uint64 creada_en");
  });
});

describe("llamadas", () => {
  it("register lleva el schema, sin resolver y revocable", () => {
    const d = decodeFunctionData({ abi: ABI_REGISTRO, data: llamadaRegister() });
    expect(d.functionName).toBe("register");
    expect(d.args).toEqual([SCHEMA_PRUEBA, "0x0000000000000000000000000000000000000000", true]);
  });

  it("attest: la destinataria es la Safe, sin valor, sin vencimiento", () => {
    const d = decodeFunctionData({ abi: ABI_EAS, data: llamadaAttest(SAFE, 1_700_000_000n) });
    expect(d.functionName).toBe("attest");
    const pedido = (d.args as unknown as [{ schema: Hex; data: { recipient: Hex; value: bigint; expirationTime: bigint; revocable: boolean } }])[0];
    expect(pedido.schema).toBe(uidDelSchema());
    expect(pedido.data.recipient).toBe(SAFE);
    expect(pedido.data.value).toBe(0n);
    expect(pedido.data.expirationTime).toBe(0n);
    expect(pedido.data.revocable).toBe(true);
  });
});

describe("constancia fuera de la cadena", () => {
  const c = constanciaFuera(SAFE, 1_700_000_000n);

  it("el hash y el UID son determinísticos y cambian con el tiempo", () => {
    const h = hashDeLaConstanciaFuera(BASE_SEPOLIA, "1.4.1-beta.3", c);
    expect(h).toBe(hashDeLaConstanciaFuera(BASE_SEPOLIA, "1.4.1-beta.3", c));
    expect(h).not.toBe(hashDeLaConstanciaFuera(BASE_SEPOLIA, "1.4.1-beta.3", constanciaFuera(SAFE, 1_700_000_001n)));
    expect(uidDeLaConstanciaFuera(c)).toMatch(/^0x[0-9a-f]{64}$/);
    expect(uidDeLaConstanciaFuera(c)).not.toBe(uidDeLaConstanciaFuera(constanciaFuera(SAFE, 1_700_000_001n)));
  });

  it("el dominio usa el nombre del SDK de EAS y la versión leída de la red", () => {
    const a = hashDeLaConstanciaFuera(BASE_SEPOLIA, "1.4.1-beta.3", c);
    const b = hashDeLaConstanciaFuera(BASE_SEPOLIA, "1.0.0", c);
    expect(a).not.toBe(b);
  });

  it("el hash de SafeMessage sigue la fórmula de CompatibilityFallbackHandler", () => {
    const hashConstancia = hashDeLaConstanciaFuera(BASE_SEPOLIA, "1.4.1-beta.3", c);
    // keccak256(0x1901 ‖ domainSeparator ‖ keccak256(abi.encode(SAFE_MSG_TYPEHASH, keccak256(message)))), con message = el hash (32 bytes).
    const domainSeparator = keccak256(
      encodeAbiParameters(parseAbiParameters("bytes32, uint256, address"), [
        keccak256(toHex("EIP712Domain(uint256 chainId,address verifyingContract)")),
        BigInt(BASE_SEPOLIA.chainId),
        SAFE,
      ]),
    );
    const estructura = keccak256(
      encodeAbiParameters(parseAbiParameters("bytes32, bytes32"), [keccak256(toHex("SafeMessage(bytes message)")), keccak256(hashConstancia)]),
    );
    const esperado = keccak256(concat(["0x1901", domainSeparator, estructura]));
    expect(hashDeSafeMessage(BASE_SEPOLIA, SAFE, hashConstancia)).toBe(esperado);
    expect(hashDeSafeMessage(BASE_SEPOLIA, SAFE, hashConstancia)).not.toBe(hashConstancia);
  });

  it("usa el mismo tipo y dominio que abstractionkit para SafeMessage", () => {
    const d = getSafeMessageEip712Data(SAFE, BigInt(BASE_SEPOLIA.chainId), "x");
    expect(d.domain).toEqual({ chainId: BASE_SEPOLIA.chainId, verifyingContract: SAFE });
    expect(d.types).toEqual({ SafeMessage: [{ name: "message", type: "bytes" }] });
  });
});
