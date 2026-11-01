// La discusión de una propuesta como lista de entradas, en orden. Un grupo de concerns es UNA entrada; las sugerencias del
// Guardián van donde empezó su fase. Módulo puro: lo que se muestra sale de los registros y del estado derivado.
import type { Bi, ConcernVista, EstadoPropuesta, GrupoVista, NivelImplicacion, Propuesta, Registro, SugerenciaVista } from "./tipos";

export type EntradaDiscusion =
  | {
      clave: string;
      cuando: string;
      tipo: "pregunta" | "respuesta" | "comentario" | "resolucion" | "a-un-lado";
      quien: string;
      /** Cómo se relaciona con la decisión quien lo escribió (del ámbito, afectada, de la red…). */
      nivel: NivelImplicacion;
      texto: Bi | string;
      apuntaA?: string;
    }
  | { clave: string; cuando: string; tipo: "concern"; concern: ConcernVista }
  | { clave: string; cuando: string; tipo: "grupo"; grupo: GrupoVista }
  | { clave: string; cuando: string; tipo: "guardian"; sugerencia: SugerenciaVista };

const TIPOS_PLANOS = new Set(["pregunta", "respuesta", "comentario", "resolucion", "a-un-lado"]);

export function entradasDeDiscusion(p: Propuesta, estado: EstadoPropuesta, registros: readonly Registro[]): EntradaDiscusion[] {
  const cuandoDe = new Map(registros.map((r) => [r.id, r.cuando]));
  const enGrupo = new Map<string, GrupoVista>();
  for (const g of estado.grupos) for (const c of g.concerns) enGrupo.set(c.id, g);
  const salida: EntradaDiscusion[] = [];
  const grupoPuesto = new Set<string>();

  for (const r of registros) {
    if (TIPOS_PLANOS.has(r.tipo)) {
      salida.push({
        clave: r.id,
        cuando: r.cuando,
        tipo: r.tipo as "pregunta" | "respuesta" | "comentario" | "resolucion" | "a-un-lado",
        quien: r.quien,
        nivel: r.nivel,
        texto: r.texto ?? "",
        apuntaA: r.apuntaA,
      });
    } else if (r.tipo === "concern" || r.tipo === "bloqueo") {
      const c = estado.concerns.find((x) => x.id === r.id);
      if (!c) continue;
      const g = enGrupo.get(c.id);
      if (g) {
        if (grupoPuesto.has(g.id)) continue;
        grupoPuesto.add(g.id);
        const primero = g.concerns.map((x) => cuandoDe.get(x.id) ?? r.cuando).sort()[0];
        salida.push({ clave: `grupo-${g.id}`, cuando: primero, tipo: "grupo", grupo: g });
      } else {
        salida.push({ clave: c.id, cuando: r.cuando, tipo: "concern", concern: c });
      }
    }
  }

  for (const s of estado.sugerenciasGuardian) {
    const inicioFase = registros.find((r) => r.tipo === "fase" && r.datos?.fase === s.fase)?.cuando ?? registros[0]?.cuando ?? p.inicio;
    salida.push({ clave: s.id, cuando: inicioFase, tipo: "guardian", sugerencia: s });
  }

  // Estable: a igual hora, el orden en que se agregaron.
  return salida.map((e, i) => ({ e, i })).sort((a, b) => Date.parse(a.e.cuando) - Date.parse(b.e.cuando) || a.i - b.i).map((x) => x.e);
}
