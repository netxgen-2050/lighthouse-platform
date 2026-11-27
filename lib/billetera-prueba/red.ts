/**
 * Red de la prueba: Base Sepolia (testnet de Base, OP Stack). Cambiar a OP Sepolia es cambiar este archivo: otro chain id, otro
 * RPC y otros exploradores; las direcciones de EAS son las mismas (son predeploys de OP Stack).
 *
 * Fuentes (confirmadas el 25-nov-2026 leyendo la red con `eth_getCode` y `version()` en https://sepolia.base.org):
 * - `EAS` y `SchemaRegistry`: predeploys de OP Stack, documentación de EAS (docs.attest.org, "Contracts"). EAS responde
 *   `version()` = "1.4.1-beta.3" y el registro "1.3.1-beta.2".
 * - `MultiSendCallOnly` 1.4.1: despliegue canónico de Safe (safe-global/safe-deployments) y la misma dirección que usa
 *   `abstractionkit` 2.1.0 (`SafeAccount.DEFAULT_MULTISEND_CONTRACT_ADDRESS`; un test las compara).
 */
export type Red = {
  chainId: number;
  nombre: string;
  rpc: string;
  eas: `0x${string}`;
  registro: `0x${string}`;
  multiSend: `0x${string}`;
  explorador: string;
  easscan: string;
};

export const BASE_SEPOLIA: Red = {
  chainId: 84532,
  nombre: "Base Sepolia",
  rpc: "https://sepolia.base.org",
  eas: "0x4200000000000000000000000000000000000021",
  registro: "0x4200000000000000000000000000000000000020",
  multiSend: "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526",
  explorador: "https://sepolia.basescan.org",
  easscan: "https://base-sepolia.easscan.org",
};

/** La red de la prueba con el RPC de `LH_PRUEBA_CANDIDE_RPC` si está cargado (se trata como secreto: puede llevar clave). */
export function redDelEntorno(env: Record<string, string | undefined> = process.env): Red {
  const rpc = env.LH_PRUEBA_CANDIDE_RPC?.trim();
  return rpc ? { ...BASE_SEPOLIA, rpc } : BASE_SEPOLIA;
}

export function urlDireccion(red: Red, direccion: string): string {
  return `${red.explorador}/address/${direccion}`;
}

export function urlTransaccion(red: Red, hash: string): string {
  return `${red.explorador}/tx/${hash}`;
}

export function urlConstancia(red: Red, uid: string): string {
  return `${red.easscan}/attestation/view/${uid}`;
}
