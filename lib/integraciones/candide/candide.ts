import { Bundler, CandidePaymaster, JsonRpcNode, SafeAccountV0_3_0, type UserOperationV7 } from "abstractionkit";
import { decodeFunctionResult, encodeFunctionData, parseAbi, type Hex } from "viem";
import { direccionDeSafe } from "@/lib/billetera-prueba/cuenta";
import {
  ABI_EAS,
  ABI_REGISTRO,
  constanciaFuera,
  hashDeLaConstanciaFuera,
  hashDeSafeMessage,
  llamadaAttest,
  llamadaRegister,
  uidDeLaConstanciaFuera,
  uidDelSchema,
} from "@/lib/billetera-prueba/eas";
import { firmaDeOperacion, firmaParaEip1271 } from "@/lib/billetera-prueba/firma-safe";
import { operacionAJson, operacionDeJson, type OperacionJson, type OperacionV7 } from "@/lib/billetera-prueba/operacion";
import type { LlavePublica } from "@/lib/billetera-prueba/passkey";
import { redDelEntorno, type Red } from "@/lib/billetera-prueba/red";
import { sanear } from "@/lib/billetera-prueba/sanear";
import { validarOperacion } from "@/lib/billetera-prueba/validar-operacion";
import { interpretarEip1271, interpretarRecibo } from "./interpretar";
import type { PuertoCandide } from "./puerto";
import {
  ErrorDeCandide,
  type EstadoOperacion,
  type FirmaFueraPreparada,
  type FirmaWebAuthn,
  type OperacionPreparada,
  type Veredicto1271,
} from "./tipos";

type Env = Record<string, string | undefined>;

const ABI_1271 = parseAbi(["function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)"]);

/**
 * Adaptador real (abstractionkit 2.1.0, `SafeAccountV0_3_0`, EntryPoint v0.7). Las URL de bundler y paymaster llevan la clave: se
 * leen solo del `env` del servidor y todo error pasa por `sanear`. No se puede probar sin clave: pendiente de prueba manual (guion).
 */
export function crearCandide(env: Env = process.env): PuertoCandide {
  const urlBundler = env.CANDIDE_BUNDLER_URL?.trim();
  const urlPaymaster = env.CANDIDE_PAYMASTER_URL?.trim();
  const politica = env.CANDIDE_SPONSORSHIP_POLICY_ID?.trim() || undefined;
  const red: Red = redDelEntorno(env);
  const secretos = [urlBundler, urlPaymaster, politica, env.LH_PRUEBA_CANDIDE_RPC];
  const nodo = new JsonRpcNode(red.rpc);

  const configurado = () => Boolean(urlBundler && urlPaymaster);
  function exigirConfiguracion() {
    if (!urlBundler || !urlPaymaster) throw new ErrorDeCandide("Falta configurar Candide (ver el guion)", "sin-configurar");
  }
  /** Todo error externo se reduce a un mensaje sin URL ni clave. */
  async function seguro<T>(f: () => Promise<T>): Promise<T> {
    try {
      return await f();
    } catch (e) {
      if (e instanceof ErrorDeCandide) throw e;
      const motivo = sanear(e, secretos);
      console.error(`[candide] ${motivo}`);
      throw new ErrorDeCandide(motivo, "candide");
    }
  }

  async function llamar(to: Hex, data: Hex): Promise<string> {
    return nodo.call({ to, data });
  }

  async function desplegada(direccion: string): Promise<boolean> {
    return SafeAccountV0_3_0.isDeployed(direccion, nodo);
  }

  async function registrado(): Promise<boolean> {
    const r = await llamar(red.registro, encodeFunctionData({ abi: ABI_REGISTRO, functionName: "getSchema", args: [uidDelSchema()] }));
    if (!/^0x[0-9a-fA-F]+$/.test(r)) throw new ErrorDeCandide("respuesta inesperada de la red", "candide");
    const registro = decodeFunctionResult({ abi: ABI_REGISTRO, functionName: "getSchema", data: r as Hex });
    return registro.uid.toLowerCase() === uidDelSchema().toLowerCase();
  }

  async function versionDeEas(): Promise<string> {
    const r = await llamar(red.eas, encodeFunctionData({ abi: ABI_EAS, functionName: "version" }));
    if (!/^0x[0-9a-fA-F]+$/.test(r)) throw new ErrorDeCandide("respuesta inesperada de la red", "candide");
    return decodeFunctionResult({ abi: ABI_EAS, functionName: "version", data: r as Hex });
  }

  function aOperacionLibreria(o: OperacionV7): UserOperationV7 {
    return { ...o } as UserOperationV7;
  }

  return {
    estado: () => (configurado() ? "listo" : "sin-configurar"),
    calcularDireccion: (l) => direccionDeSafe(l),
    estaDesplegada: (d) => seguro(() => desplegada(d)),
    schemaRegistrado: () => seguro(registrado),

    prepararPrimeraOperacion: (l: LlavePublica): Promise<OperacionPreparada> =>
      seguro(async () => {
        exigirConfiguracion();
        const bundler = new Bundler(urlBundler!);
        const paymaster = new CandidePaymaster(urlPaymaster!);
        // Nunca datos viejos: se vuelve a leer el código de la Safe, el nonce (adentro de createUserOperation) y el schema.
        const safe = direccionDeSafe(l);
        const yaRegistrado = await registrado();
        const creadaEn = BigInt(Math.floor(Date.now() / 1000));
        const llamadas = [
          ...(yaRegistrado ? [] : [{ to: red.registro, value: 0n, data: llamadaRegister() }]),
          { to: red.eas, value: 0n, data: llamadaAttest(safe, creadaEn) },
        ];
        const cuenta = SafeAccountV0_3_0.initializeNewAccount([{ x: l.x, y: l.y }]);
        const sinPatrocinio = await cuenta.createUserOperation(llamadas, nodo, bundler, {
          multisendContractAddress: red.multiSend,
        });
        const previa = validarOperacion(l, sinPatrocinio, red);
        if (!previa.ok) throw new ErrorDeCandide("La operación no cumple la política de gas", "politica");
        const { userOperation } = await paymaster.createSponsorPaymasterUserOperation(cuenta, sinPatrocinio, bundler, politica);
        // Otra vez después del patrocinio: lo que se firma es lo que se validó.
        const final = validarOperacion(l, userOperation, red);
        if (!final.ok) throw new ErrorDeCandide("La operación no cumple la política de gas", "politica");
        const hashAFirmar = SafeAccountV0_3_0.getUserOperationEip712Hash(userOperation, BigInt(red.chainId)) as Hex;
        return { operacion: operacionAJson(userOperation), hashAFirmar };
      }),

    enviarOperacion: (l: LlavePublica, json: OperacionJson, firma: FirmaWebAuthn) =>
      seguro(async () => {
        exigirConfiguracion();
        const op = operacionDeJson(json);
        if (!op) throw new ErrorDeCandide("Operación ilegible.", "entrada");
        const v = validarOperacion(l, op, red);
        if (!v.ok) {
          throw v.tipo === "sender"
            ? new ErrorDeCandide(v.motivo, "entrada")
            : new ErrorDeCandide("La operación no cumple la política de gas", "politica");
        }
        const bundler = new Bundler(urlBundler!);
        const firmada = { ...op, signature: firmaDeOperacion(l, firma, op.nonce === 0n) };
        const hash = await bundler.sendUserOperation(aOperacionLibreria(firmada), SafeAccountV0_3_0.DEFAULT_ENTRYPOINT_ADDRESS);
        if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) throw new ErrorDeCandide("respuesta inesperada de la red", "candide");
        return { hashOperacion: hash as Hex };
      }),

    consultarOperacion: (hash: Hex): Promise<EstadoOperacion> =>
      seguro(async () => {
        exigirConfiguracion();
        const bundler = new Bundler(urlBundler!);
        return interpretarRecibo(await bundler.getUserOperationReceipt(hash), red);
      }),

    prepararFirmaFuera: (l: LlavePublica): Promise<FirmaFueraPreparada> =>
      seguro(async () => {
        const safe = direccionDeSafe(l);
        if (!(await desplegada(safe))) throw new ErrorDeCandide("Primero hacé la primera operación", "estado");
        const versionEas = await versionDeEas();
        const tiempo =BigInt(Math.floor(Date.now() / 1000));
        const c = constanciaFuera(safe, tiempo);
        const hashConstancia = hashDeLaConstanciaFuera(red, versionEas, c);
        return {
          hashAFirmar: hashDeSafeMessage(red, safe, hashConstancia),
          hashConstancia,
          uidConstancia: uidDeLaConstanciaFuera(c),
          tiempo: tiempo.toString(),
          versionEas,
        };
      }),

    verificarFirma1271: (l: LlavePublica, tiempo: bigint, firma: FirmaWebAuthn): Promise<Veredicto1271> =>
      seguro(async () => {
        const safe = direccionDeSafe(l);
        if (!(await desplegada(safe))) throw new ErrorDeCandide("Primero hacé la primera operación", "estado");
        const versionEas = await versionDeEas();
        const hashConstancia = hashDeLaConstanciaFuera(red, versionEas, constanciaFuera(safe, tiempo));
        const data = encodeFunctionData({
          abi: ABI_1271,
          functionName: "isValidSignature",
          args: [hashConstancia, firmaParaEip1271(l, firma) as Hex],
        });
        let fallbackHandler: Hex | undefined;
        try {
          fallbackHandler = (await SafeAccountV0_3_0.initializeNewAccount([{ x: l.x, y: l.y }]).getFallbackHandler(nodo)) as Hex;
        } catch {
          fallbackHandler = undefined;
        }
        try {
          return interpretarEip1271({ devuelto: await llamar(safe, data) }, fallbackHandler);
        } catch (e) {
          // El nodo contestó con un error de ejecución (revert). Un fallo de red u otro error no es un veredicto.
          const mensaje = sanear(e, secretos);
          if (/revert|execution|GS0\d\d/i.test(mensaje)) return interpretarEip1271({ revert: mensaje }, fallbackHandler);
          throw e;
        }
      }),
  };
}
