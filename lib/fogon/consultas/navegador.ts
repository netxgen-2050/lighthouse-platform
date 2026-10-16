import { agregar, validarReparto, TEXTO_MOTIVO, type Reparto } from "@/lib/cuadratico/motor";
import { CLAVES } from "@/lib/demo/claves";
import { buscarConsulta, CONSULTAS, PADRON, REPARTOS_EJEMPLO, VOS } from "./ejemplo";
import type { Lectura, RepositorioConsultas, ResultadoGuardar } from "./repositorio";
import { estado, reglasDe, resultadoVisible } from "./reglas";
import type { Consulta, PadronVista, Participantes, ResumenConsulta, VistaConsulta } from "./tipos";

/** Lo que se guarda en este navegador: el reparto propio y los cierres simulados, por consulta. */
export type EstadoGuardado = {
  repartos: Record<string, Reparto>;
  cierres: Record<string, string>;
};

export const SIN_GUARDADO: EstadoGuardado = { repartos: {}, cierres: {} };

/** Lo que hace falta del almacenamiento (`window.localStorage` o uno simulado en los tests). */
export type Almacen = Pick<Storage, "getItem" | "setItem">;

/** Lee lo guardado; todo lo raro (JSON roto, consultas desconocidas, repartos inválidos) se descarta campo por campo. */
export function leer(crudo: string | null): EstadoGuardado {
  if (!crudo) return SIN_GUARDADO;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    const repartosCrudos = esObjeto(o.repartos) ? o.repartos : {};
    const cierresCrudos = esObjeto(o.cierres) ? o.cierres : {};
    const repartos: Record<string, Reparto> = {};
    const cierres: Record<string, string> = {};
    for (const c of CONSULTAS) {
      const r = repartosCrudos[c.id];
      if (esObjeto(r) && validarReparto(reglasDe(c), r as Reparto).ok) repartos[c.id] = r as Reparto;
      const cierre = cierresCrudos[c.id];
      if (typeof cierre === "string" && !Number.isNaN(new Date(cierre).getTime())) cierres[c.id] = cierre;
    }
    return { repartos, cierres };
  } catch {
    return SIN_GUARDADO;
  }
}

function esObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Una persona "repartió" si su reparto tiene al menos un voto distinto de 0. */
function repartio(r: Reparto | undefined): r is Reparto {
  return !!r && Object.values(r).some((v) => v !== 0);
}

/** Las consultas de ejemplo con los datos guardados solo en este navegador (nada viaja por la red). */
export class RepositorioNavegador implements RepositorioConsultas {
  constructor(
    private readonly almacen: () => Almacen = () => window.localStorage,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  private cargar(): EstadoGuardado | null {
    try {
      return leer(this.almacen().getItem(CLAVES.fogonConsultas));
    } catch {
      return null;
    }
  }

  private escribir(e: EstadoGuardado): boolean {
    try {
      this.almacen().setItem(CLAVES.fogonConsultas, JSON.stringify(e));
      return true;
    } catch {
      return false;
    }
  }

  /** Repartos de todo el padrón que repartió: los de ejemplo y el propio. */
  private repartosDe(consulta: Consulta, guardado: EstadoGuardado): Map<string, Reparto> {
    const mapa = new Map<string, Reparto>();
    for (const [persona, r] of Object.entries(REPARTOS_EJEMPLO[consulta.id] ?? {})) if (repartio(r)) mapa.set(persona, r);
    const mio = guardado.repartos[consulta.id];
    if (repartio(mio)) mapa.set(VOS.id, mio);
    return mapa;
  }

  private participantes(repartos: Map<string, Reparto>): Participantes {
    return { repartieron: repartos.size, padron: PADRON.length };
  }

  async listar(): Promise<Lectura<ResumenConsulta[]>> {
    const guardado = this.cargar();
    if (!guardado) return { ok: false, error: "falla" };
    const ahora = this.ahora();
    return {
      ok: true,
      valor: CONSULTAS.map((consulta): ResumenConsulta => {
        const repartos = this.repartosDe(consulta, guardado);
        return {
          consulta,
          estado: estado(consulta, guardado.cierres[consulta.id], ahora),
          yaReparti: repartos.has(VOS.id),
          participantes: this.participantes(repartos),
        };
      }),
    };
  }

  async abrir(id: string): Promise<Lectura<VistaConsulta>> {
    const consulta = buscarConsulta(id);
    if (!consulta) return { ok: false, error: "no-encontrada" };
    const guardado = this.cargar();
    if (!guardado) return { ok: false, error: "falla" };

    const est = estado(consulta, guardado.cierres[id], this.ahora());
    const repartos = this.repartosDe(consulta, guardado);
    const yaReparti = repartos.has(VOS.id);
    const visible = resultadoVisible(consulta, est, yaReparti);
    const participantes = this.participantes(repartos);

    const resultado: VistaConsulta["resultado"] = visible
      ? {
          visible: true,
          agregado: agregar(
            consulta.opciones.map((o) => o.id),
            [...repartos.values()],
          ),
          participantes,
        }
      : { visible: false, participantes };

    let padron: PadronVista | null = null;
    if (consulta.voto === "abierto") {
      padron = {
        faltan: PADRON.filter((p) => !repartos.has(p.id)),
        sinAceptar: 0,
        repartos: visible
          ? PADRON.filter((p) => repartos.has(p.id)).map((persona) => ({
              persona,
              reparto: repartos.get(persona.id)!,
              propio: persona.id === VOS.id,
            }))
          : null,
      };
    }

    return {
      ok: true,
      valor: {
        consulta,
        estado: est,
        puedeCerrar: est === "abierta",
        cierreManual: guardado.cierres[id] ?? null,
        // Un reparto sin ningún voto cuenta como "no repartió", igual que en la lista y en "Faltan votar".
        miReparto: repartio(guardado.repartos[id]) ? guardado.repartos[id] : null,
        resultado,
        padron,
      },
    };
  }

  async guardarReparto(id: string, reparto: Reparto): Promise<ResultadoGuardar> {
    const consulta = buscarConsulta(id);
    if (!consulta) return { ok: false, error: "invalido" };
    const guardado = this.cargar();
    if (!guardado) return { ok: false, error: "falla" };
    if (estado(consulta, guardado.cierres[id], this.ahora()) === "cerrada") return { ok: false, error: "cerrada" };
    const v = validarReparto(reglasDe(consulta), reparto);
    if (!v.ok) return { ok: false, error: "invalido", motivos: v.motivos.map((m) => TEXTO_MOTIVO[m]) };
    const limpio: Reparto = Object.fromEntries(Object.entries(reparto).filter(([, votos]) => votos !== 0));
    const ok = this.escribir({ ...guardado, repartos: { ...guardado.repartos, [id]: limpio } });
    return ok ? { ok: true } : { ok: false, error: "falla" };
  }

  async cerrar(id: string): Promise<{ ok: boolean }> {
    const consulta = buscarConsulta(id);
    const guardado = this.cargar();
    if (!consulta || !guardado) return { ok: false };
    if (estado(consulta, guardado.cierres[id], this.ahora()) === "cerrada") return { ok: false };
    return { ok: this.escribir({ ...guardado, cierres: { ...guardado.cierres, [id]: this.ahora().toISOString() } }) };
  }

  async reabrir(id: string): Promise<{ ok: boolean }> {
    const guardado = this.cargar();
    if (!buscarConsulta(id) || !guardado || !guardado.cierres[id]) return { ok: false };
    const { [id]: _quitado, ...cierres } = guardado.cierres;
    void _quitado;
    return { ok: this.escribir({ ...guardado, cierres }) };
  }
}
