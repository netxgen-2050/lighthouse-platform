"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { abreviarDireccion } from "@/lib/ui/direccion";
import { aBase64Url, desdeBase64Url, llaveAHex, llaveDeSpki } from "@/lib/billetera-prueba/passkey";
import { BASE_SEPOLIA, urlConstancia, urlDireccion, urlTransaccion } from "@/lib/billetera-prueba/red";
import { formatearSegundos, SIN_DATO, totalDe, type Tiempos } from "@/lib/billetera-prueba/tiempos";

const CLAVE = "lh-prueba-candide";
const NOMBRE_PASSKEY = "Prueba Candide · NetX";
const ESPERA_MS = 2000;
const TOPE_MS = 60_000;

const BOTON =
  "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-60";
const BOTON_SUAVE =
  "w-fit rounded-lg border border-faint bg-surface px-4 py-1.5 font-medium text-ink hover:bg-warn-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-60";
const ENLACE = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const TARJETA = "rounded-lg border border-faint bg-surface p-4";

type Guardada = { idCredencial: string; x: string; y: string; creadaEn: number; direccion?: string; ultimoHash?: string };
type FirmaJson = { authenticatorData: string; clientDataJSON: string; signature: string };
type Estado = "sin desplegar" | "preparando" | "esperando tu firma" | "enviada" | "incluida" | "falló";
type Veredicto = { resultado: "valida" | "no-valida" | "sin-eip1271" | "sin-respuesta"; valorDevuelto?: string; fallbackHandler?: string; detalle: string };
type Resultado = { estado: string; hashTransaccion?: string; uidConstancia?: string; motivo?: string };

function leerGuardada(): Guardada | null {
  try {
    const t = window.localStorage.getItem(CLAVE);
    return t ? (JSON.parse(t) as Guardada) : null;
  } catch {
    return null;
  }
}

function guardar(g: Guardada | null) {
  if (g) window.localStorage.setItem(CLAVE, JSON.stringify(g));
  else window.localStorage.removeItem(CLAVE);
}

const aBuffer = (b: Uint8Array): ArrayBuffer => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Palabras simples para el error de una passkey que se cancela o no se puede usar. */
function motivoDePasskey(e: unknown): string {
  const nombre = e instanceof DOMException ? e.name : "";
  if (nombre === "NotAllowedError") return "Cancelaste el diálogo o se acabó el tiempo.";
  if (nombre === "NotSupportedError" || nombre === "SecurityError") return "Este navegador o esta dirección no permite passkeys.";
  if (nombre === "InvalidStateError") return "Ya hay una passkey para esto en tu dispositivo.";
  return e instanceof Error && e.message ? e.message : "No se pudo usar la passkey.";
}

/** Pantalla de la prueba (design §5, tarea 5.2): cinco pasos, todo lo de Candide por `/api/netx/billetera-prueba/…`. */
export function PruebaCliente({ simulado, faltaConfigurar }: { simulado: boolean; faltaConfigurar: boolean }) {
  const { cabeceras } = useSesion();
  const [guardada, setGuardada] = useState<Guardada | null>(null);
  const [cargado, setCargado] = useState(false);
  const [direccion, setDireccion] = useState<string | null>(null);
  const [desplegada, setDesplegada] = useState(false);
  const [estado, setEstado] = useState<Estado>("sin desplegar");
  const [anuncio, setAnuncio] = useState("");
  const [errorPasskey, setErrorPasskey] = useState<string | null>(null);
  const [errorOperacion, setErrorOperacion] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [sinConfirmacion, setSinConfirmacion] = useState(false);
  const [tiempos, setTiempos] = useState<Tiempos>({});
  const [ocupado, setOcupado] = useState(false);
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [uidFuera, setUidFuera] = useState<string | null>(null);
  const [errorFirmaFuera, setErrorFirmaFuera] = useState<string | null>(null);
  const vigente = useRef(true);

  useEffect(() => {
    vigente.current = true;
    return () => {
      vigente.current = false;
    };
  }, []);

  const llamar = useCallback(
    async (ruta: string, cuerpo?: unknown) => {
      const h = await cabeceras();
      const res = await fetch(`/api/netx/billetera-prueba/${ruta}`, {
        method: cuerpo === undefined ? "GET" : "POST",
        headers: { ...h, ...(cuerpo === undefined ? {} : { "Content-Type": "application/json" }) },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        cache: "no-store",
      });
      const datos = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: string };
      return { ok: res.ok, estado: res.status, datos };
    },
    [cabeceras],
  );

  const avisar = (e: Estado, texto?: string) => {
    setEstado(e);
    setAnuncio(texto ?? `Estado: ${e}.`);
  };

  /** Paso 2: pide la dirección. Si cambió respecto de la guardada, lo dice y no sigue. */
  const pedirCuenta = useCallback(
    async (g: Guardada): Promise<boolean> => {
      const { ok, datos } = await llamar("cuenta", { x: g.x, y: g.y });
      if (!ok || typeof datos.direccion !== "string") {
        setErrorOperacion(datos.error ?? "No se pudo calcular la dirección.");
        return false;
      }
      if (g.direccion && g.direccion.toLowerCase() !== datos.direccion.toLowerCase()) {
        setAviso("La dirección calculada cambió: anotalo en el reporte");
        setDireccion(datos.direccion);
        return false;
      }
      if (!g.direccion) {
        const con = { ...g, direccion: datos.direccion };
        guardar(con);
        setGuardada(con);
      }
      setDireccion(datos.direccion);
      setDesplegada(datos.desplegada === true);
      if (datos.desplegada === true) avisar("incluida", "Aviso: la Safe ya existe en la red.");
      return true;
    },
    [llamar],
  );

  // Volver a la página: reconoce la passkey guardada y consulta el último hash guardado (design §3). Si quedó enviada, sigue
  // esperándola; si ya estaba incluida o falló, muestra el resultado. Esos tiempos no se midieron: quedan en "sin dato".
  useEffect(() => {
    const g = leerGuardada();
    setGuardada(g);
    setCargado(true);
    if (!g) return;
    void (async () => {
      const cuentaOk = await pedirCuenta(g);
      if (!cuentaOk || !g.ultimoHash || !vigente.current) return;
      setOcupado(true);
      try {
        await esperarInclusion(g.ultimoHash, null);
      } finally {
        if (vigente.current) setOcupado(false);
      }
    })();
    // Solo al montar: `esperarInclusion` usa estado que no hace falta observar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedirCuenta]);

  async function crearPasskey() {
    if (ocupado) return;
    setOcupado(true);
    setErrorPasskey(null);
    setAviso(null);
    const t0 = performance.now();
    try {
      if (!window.PublicKeyCredential || !navigator.credentials) throw new Error("Este navegador no ofrece WebAuthn.");
      const cred = (await navigator.credentials.create({
        publicKey: {
          rp: { name: "NetX Lighthouse", id: window.location.hostname },
          user: { id: aBuffer(crypto.getRandomValues(new Uint8Array(16))), name: NOMBRE_PASSKEY, displayName: NOMBRE_PASSKEY },
          challenge: aBuffer(crypto.getRandomValues(new Uint8Array(32))),
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
          attestation: "none",
          timeout: 60_000,
        },
      })) as PublicKeyCredential | null;
      if (!cred) throw new Error("No se recibió la passkey.");
      const respuesta = cred.response as AuthenticatorAttestationResponse;
      if (typeof respuesta.getPublicKey !== "function") {
        throw new Error("Este navegador no entrega la llave pública (getPublicKey). Anotalo en el reporte.");
      }
      const spki = respuesta.getPublicKey();
      if (!spki) throw new Error("El navegador no entregó la llave pública.");
      const { x, y } = llaveAHex(llaveDeSpki(new Uint8Array(spki)));
      const g: Guardada = { idCredencial: aBase64Url(new Uint8Array(cred.rawId)), x, y, creadaEn: Date.now() };
      guardar(g);
      setGuardada(g);
      setTiempos({ passkey: performance.now() - t0 });
      setAnuncio("Listo: tu dispositivo guardó la passkey.");
      await pedirCuenta(g);
    } catch (e) {
      setErrorPasskey(motivoDePasskey(e));
    } finally {
      setOcupado(false);
    }
  }

  async function firmarConPasskey(hash: string, g: Guardada): Promise<FirmaJson> {
    const cred = (await navigator.credentials.get({
      publicKey: {
        challenge: aBuffer(hexABytes(hash)),
        rpId: window.location.hostname,
        allowCredentials: [{ type: "public-key", id: aBuffer(desdeBase64Url(g.idCredencial)) }],
        userVerification: "required",
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;
    if (!cred) throw new Error("No se recibió la firma.");
    const r = cred.response as AuthenticatorAssertionResponse;
    return {
      authenticatorData: aBase64Url(new Uint8Array(r.authenticatorData)),
      clientDataJSON: aBase64Url(new Uint8Array(r.clientDataJSON)),
      signature: aBase64Url(new Uint8Array(r.signature)),
    };
  }

  /**
   * Consulta cada 2 s hasta 60 s; después "Todavía sin confirmación". Un error al consultar se reintenta hasta el límite.
   * `inicio` es cuándo se mandó la operación en esta sesión; al retomar una guardada es `null`: no se midió y queda "sin dato".
   */
  async function esperarInclusion(hash: string, inicio: number | null) {
    const limite = performance.now() + TOPE_MS;
    while (vigente.current) {
      let ok = false;
      let datos: Record<string, unknown> & { error?: string } = {};
      try {
        ({ ok, datos } = await llamar(`operacion?hash=${hash}`));
      } catch {
        ok = false;
      }
      if (!ok) {
        if (performance.now() >= limite) {
          avisar("falló");
          setErrorOperacion(datos.error ?? "No se pudo consultar la operación.");
          return;
        }
        await dormir(ESPERA_MS);
        continue;
      }
      const r = datos as unknown as Resultado;
      if (r.estado === "incluida") {
        setResultado(r);
        if (inicio !== null) setTiempos((t) => ({ ...t, inclusion: performance.now() - inicio }));
        setDesplegada(true);
        avisar("incluida", "Aviso: la operación entró en un bloque.");
        return;
      }
      if (r.estado === "fallo") {
        setResultado(r);
        avisar("falló", "Aviso: la operación no se completó.");
        setErrorOperacion(r.motivo ?? "La operación falló.");
        return;
      }
      avisar("enviada");
      if (performance.now() >= limite) {
        setSinConfirmacion(true);
        setAnuncio("Aviso: pasó un minuto sin respuesta de la red.");
        return;
      }
      await dormir(ESPERA_MS);
    }
  }

  async function primeraOperacion() {
    if (ocupado || !guardada) return;
    setOcupado(true);
    setErrorOperacion(null);
    setSinConfirmacion(false);
    setResultado(null);
    try {
      // Antes de preparar otra operación, mira la última que se mandó: puede haber quedado pendiente o ya incluida.
      if (guardada.ultimoHash) {
        const { ok, datos } = await llamar(`operacion?hash=${guardada.ultimoHash}`);
        const previa = datos as unknown as Resultado;
        if (ok && (previa.estado === "enviada" || previa.estado === "incluida")) {
          avisar("enviada", "Retomando la última operación enviada.");
          await esperarInclusion(guardada.ultimoHash, null);
          return;
        }
      }
      avisar("preparando");
      const t1 = performance.now();
      const prep = await llamar("preparar", { x: guardada.x, y: guardada.y });
      if (!prep.ok || typeof prep.datos.hashAFirmar !== "string") {
        avisar("falló");
        setErrorOperacion(prep.datos.error ?? "No se pudo preparar la operación.");
        return;
      }
      const tPrep = performance.now() - t1;
      avisar("esperando tu firma");
      const t2 = performance.now();
      const firma = await firmarConPasskey(prep.datos.hashAFirmar, guardada);
      const tFirma = performance.now() - t2;
      const t3 = performance.now();
      const env = await llamar("enviar", { x: guardada.x, y: guardada.y, operacion: prep.datos.operacion, firma });
      if (!env.ok || typeof env.datos.hashOperacion !== "string") {
        avisar("falló");
        setErrorOperacion(env.datos.error ?? "No se pudo enviar la operación.");
        return;
      }
      const g = { ...guardada, ultimoHash: env.datos.hashOperacion };
      guardar(g);
      setGuardada(g);
      setTiempos((t) => ({ ...t, preparar: tPrep, firmar: tFirma }));
      avisar("enviada");
      await esperarInclusion(env.datos.hashOperacion, t3);
    } catch (e) {
      avisar("falló");
      setErrorOperacion(motivoDePasskey(e));
    } finally {
      setOcupado(false);
    }
  }

  async function firmarFuera() {
    if (ocupado || !guardada || !desplegada) return;
    setOcupado(true);
    setErrorFirmaFuera(null);
    setVeredicto(null);
    try {
      const prep = await llamar("firma-fuera", { x: guardada.x, y: guardada.y });
      if (!prep.ok || typeof prep.datos.hashAFirmar !== "string") {
        setErrorFirmaFuera(prep.datos.error ?? "No se pudo armar la constancia.");
        return;
      }
      const firma = await firmarConPasskey(prep.datos.hashAFirmar, guardada);
      const ver = await llamar("verificar-firma", { x: guardada.x, y: guardada.y, tiempo: prep.datos.tiempo, firma });
      if (!ver.ok) {
        setErrorFirmaFuera(ver.datos.error ?? "No se pudo verificar la firma.");
        return;
      }
      setUidFuera(typeof prep.datos.uidConstancia === "string" ? prep.datos.uidConstancia : null);
      setVeredicto(ver.datos.veredicto as Veredicto);
      setAnuncio("Aviso: terminó la verificación de la firma.");
    } catch (e) {
      setErrorFirmaFuera(motivoDePasskey(e));
    } finally {
      setOcupado(false);
    }
  }

  function empezarDeNuevo() {
    guardar(null);
    setGuardada(null);
    setDireccion(null);
    setDesplegada(false);
    setEstado("sin desplegar");
    setResultado(null);
    setSinConfirmacion(false);
    setTiempos({});
    setVeredicto(null);
    setUidFuera(null);
    setErrorOperacion(null);
    setErrorPasskey(null);
    setErrorFirmaFuera(null);
    setAviso(null);
    setAnuncio("Aviso: empezaste de nuevo; la passkey sigue en tu dispositivo, borrala del llavero.");
  }

  // Antes de leer el almacenamiento del navegador se dibuja igual (así sale en el HTML del servidor), con los botones apagados.
  const total = totalDe(tiempos);

  return (
    <div className="grid max-w-3xl gap-4">
      <h1 className="text-2xl font-semibold">Prueba de billetera con passkey</h1>
      <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {BASE_SEPOLIA.nombre}, red de prueba: nada de esto tiene valor
      </p>
      {simulado ? (
        <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          Modo simulado: no se habla con Candide ni con la red
        </p>
      ) : null}
      {faltaConfigurar ? (
        <p role="alert" className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          Falta configurar Candide (ver el guion)
        </p>
      ) : null}
      <p className="text-muted">
        Recorre el camino &quot;sin saber de cripto&quot;: una passkey de tu dispositivo, una cuenta Safe, una primera operación con el gas pagado
        por NetX y una constancia de EAS. Solo para el super admin.
      </p>

      <div role="status" aria-live="polite" className="rounded-lg border border-faint bg-surface px-3 py-2 text-sm">
        <span className="font-medium">Estado: </span>
        {mayuscula(estado)}
        <span className="sr-only"> {anuncio}</span>
      </div>

      <section aria-labelledby="paso-1" className={TARJETA}>
        <h2 id="paso-1" className="text-lg font-semibold">
          Paso 1 · Passkey
        </h2>
        {guardada ? (
          <div className="mt-2 grid gap-2">
            <p>
              Passkey creada <span className="text-muted">({formatearSegundos(tiempos.passkey)})</span>
            </p>
            <button type="button" className={BOTON_SUAVE} onClick={empezarDeNuevo} disabled={ocupado}>
              Empezar de nuevo
            </button>
          </div>
        ) : (
          <div className="mt-2 grid gap-2">
            <p className="text-muted">Tu dispositivo guarda la llave privada. Acá solo se guarda la pública.</p>
            <button type="button" className={BOTON} onClick={crearPasskey} disabled={ocupado || !cargado}>
              Usar tu huella o tu cara
            </button>
          </div>
        )}
        {errorPasskey ? (
          <p role="alert" className="mt-2 text-warn-ink">
            No se creó la passkey. {errorPasskey}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="paso-2" className={TARJETA}>
        <h2 id="paso-2" className="text-lg font-semibold">
          Paso 2 · Dirección de la Safe
        </h2>
        {direccion ? (
          <div className="mt-2 grid gap-1">
            <p>
              <span className="text-muted">Dirección: </span>
              <span data-testid="direccion" className="break-all font-mono text-sm">
                {direccion}
              </span>
            </p>
            <p>
              <span className="text-muted">Abreviada: </span>
              {abreviarDireccion(direccion)}
            </p>
            <p>
              <a className={ENLACE} href={urlDireccion(BASE_SEPOLIA, direccion)} target="_blank" rel="noreferrer">
                Ver la dirección en Basescan
              </a>
            </p>
            <p>{desplegada ? "Safe desplegada" : "Safe sin desplegar"}</p>
          </div>
        ) : (
          <p className="mt-2 text-muted">Primero creá la passkey.</p>
        )}
        {aviso ? (
          <p role="alert" className="mt-2 text-warn-ink">
            {aviso}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="paso-3" className={TARJETA}>
        <h2 id="paso-3" className="text-lg font-semibold">
          Paso 3 · Primera operación
        </h2>
        <p className="mt-2 text-muted">Despliega la Safe y emite una constancia de prueba en la cadena. El gas lo paga NetX.</p>
        <button
          type="button"
          className={`${BOTON} mt-2`}
          onClick={primeraOperacion}
          disabled={!guardada || !direccion || ocupado || faltaConfigurar || Boolean(aviso)}
        >
          Hacer la primera operación
        </button>
        {errorOperacion ? (
          <p role="alert" className="mt-2 text-warn-ink">
            Falló. {errorOperacion}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="paso-4" className={TARJETA}>
        <h2 id="paso-4" className="text-lg font-semibold">
          Paso 4 · Resultado
        </h2>
        <p className="mt-2">
          Operación: <strong>{mayuscula(estado)}</strong>
        </p>
        {sinConfirmacion ? (
          <p className="mt-1">
            Todavía sin confirmación.{" "}
            {direccion ? (
              <a className={ENLACE} href={urlDireccion(BASE_SEPOLIA, direccion)} target="_blank" rel="noreferrer">
                Mirá la Safe en Basescan
              </a>
            ) : null}{" "}
            Podés tocar &quot;Hacer la primera operación&quot; para consultar de nuevo.
          </p>
        ) : null}
        {resultado?.estado === "incluida" ? (
          <ul className="mt-1 grid gap-1">
            <li>
              {resultado.hashTransaccion ? (
                <a className={ENLACE} href={urlTransaccion(BASE_SEPOLIA, resultado.hashTransaccion)} target="_blank" rel="noreferrer">
                  Ver la transacción en Basescan
                </a>
              ) : (
                `Transacción: ${SIN_DATO}`
              )}
            </li>
            <li>
              {resultado.uidConstancia ? (
                <a className={ENLACE} href={urlConstancia(BASE_SEPOLIA, resultado.uidConstancia)} target="_blank" rel="noreferrer">
                  Ver la constancia en EASScan
                </a>
              ) : (
                `Constancia: ${SIN_DATO}`
              )}
            </li>
            <li>Safe desplegada</li>
          </ul>
        ) : null}
        {resultado?.estado === "fallo" && resultado.hashTransaccion ? (
          <p className="mt-1">
            <a className={ENLACE} href={urlTransaccion(BASE_SEPOLIA, resultado.hashTransaccion)} target="_blank" rel="noreferrer">
              Ver la transacción en Basescan
            </a>
          </p>
        ) : null}
        <table className="mt-3 w-full max-w-md text-left text-sm">
          <caption className="mb-1 text-left font-medium">Tiempos</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Paso</th>
              <th scope="col">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            <FilaTiempo nombre="Crear la passkey" ms={tiempos.passkey} />
            <FilaTiempo nombre="Preparar la operación" ms={tiempos.preparar} />
            <FilaTiempo nombre="Firmar con la passkey" ms={tiempos.firmar} />
            <FilaTiempo nombre="Esperar la inclusión" ms={tiempos.inclusion} />
            <FilaTiempo nombre="Total" ms={total} />
          </tbody>
        </table>
      </section>

      <section aria-labelledby="paso-5" className={TARJETA}>
        <h2 id="paso-5" className="text-lg font-semibold">
          Paso 5 · Firma fuera de la cadena (EIP-1271)
        </h2>
        <p className="mt-2 text-muted">
          La passkey firma una constancia de EAS fuera de la cadena y le preguntamos a la Safe si la firma vale.
        </p>
        <button type="button" className={`${BOTON} mt-2`} onClick={firmarFuera} disabled={!desplegada || ocupado || faltaConfigurar}>
          Firmar una constancia fuera de la cadena
        </button>
        {!desplegada ? <p className="mt-1 text-muted">Primero hacé la primera operación</p> : null}
        {errorFirmaFuera ? (
          <p role="alert" className="mt-2 text-warn-ink">
            {errorFirmaFuera}
          </p>
        ) : null}
        {veredicto ? (
          <div className="mt-2 grid gap-1">
            <p>
              <strong>{textoVeredicto(veredicto)}</strong>
            </p>
            <p className="text-sm">{veredicto.detalle}</p>
            {veredicto.valorDevuelto ? <p className="text-sm">Valor devuelto: {veredicto.valorDevuelto}</p> : null}
            {veredicto.fallbackHandler ? <p className="break-all text-sm">Fallback handler de la Safe: {veredicto.fallbackHandler}</p> : null}
            <p className="break-all text-sm">UID de la constancia fuera de la cadena: {uidFuera ?? SIN_DATO}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function textoVeredicto(v: Veredicto): string {
  if (v.resultado === "valida") return "Válida para la Safe (EIP-1271)";
  if (v.resultado === "sin-respuesta") return "Sin respuesta del nodo";
  return "No válida";
}

function FilaTiempo({ nombre, ms }: { nombre: string; ms: number | null | undefined }) {
  return (
    <tr>
      <th scope="row" className="py-0.5 pr-4 font-normal">
        {nombre}
      </th>
      <td>{formatearSegundos(ms)}</td>
    </tr>
  );
}

function hexABytes(hex: string): Uint8Array {
  const limpio = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(limpio.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(limpio.slice(i * 2, i * 2 + 2), 16);
  return out;
}
