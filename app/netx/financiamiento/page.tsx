import type { Metadata } from "next";
import { VERSIONES, fechaCorta } from "@/lib/financiamiento/fuentes";
import { FUTUROS_SIMULADOS } from "@/lib/financiamiento/riesgo";
import { TERMINOS } from "@/lib/legal/terminos";
import { VERSION_MODELO } from "@/lib/series/escenarios";
import { numero } from "@/lib/series/formato";
import { FOCO } from "./estilos";
import { SeccionRecorridos, SeccionRiesgo, SeccionJuegos, SeccionSupuestos } from "./secciones-modelo";
import { SeccionBolsillos, SeccionCascada, SeccionDineroTemprano, SeccionEtapas } from "./secciones-plata";

export const metadata: Metadata = { title: "Vista NetX · Modelo de financiamiento" };

// Sin permisos propios: /netx/financiamiento cae en la capacidad `vista-netx` (toda persona con sesión). No lee datos de
// personas. El orden de las secciones es el de la reunión.
const INDICE = [
  { id: "m-etapas", texto: "La plata entra por etapas" },
  { id: "m-bolsillos", texto: "Quién es quién con la plata" },
  { id: "m-cascada", texto: "Cómo paga una serie" },
  { id: "m-temprano", texto: "Dinero temprano" },
  { id: "m-recorridos", texto: "Recorridos de inversores" },
  { id: "m-riesgo", texto: "¿Y si sale mal?" },
  { id: "m-juegos", texto: "Juego A o Juego B" },
  { id: "m-supuestos", texto: "Supuestos a confirmar" },
] as const;

export default function ModeloFinanciamientoPage() {
  return (
    <div>
      <p className="text-sm font-medium text-muted">Vista NetX · para el equipo de NetXGen</p>
      <h1 className="text-3xl font-semibold">Modelo de financiamiento</h1>

      <p className="mt-3 mb-4 max-w-3xl rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {TERMINOS.avisosimulador.texto}
      </p>

      <p className="mb-4 max-w-3xl text-lg">
        El detalle de cómo entra la plata: en qué orden cobra cada uno, cómo se puede invertir hoy, qué pasa si sale mal y
        por qué vender lotes no es el atajo.
      </p>

      <nav aria-label="Índice de la página" className="mb-6">
        <ul className="flex flex-wrap gap-2">
          {INDICE.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} className={`block rounded-full border border-faint px-3 py-1.5 text-sm hover:bg-surface-2 ${FOCO}`}>
                {i.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <SeccionEtapas />
      <SeccionBolsillos />
      <SeccionCascada />
      <SeccionDineroTemprano />
      <SeccionRecorridos />
      <SeccionRiesgo />
      <SeccionJuegos />
      <SeccionSupuestos />

      <p className="text-xs text-muted">
        Fuentes: NS_Tokenomics doc 28 (diseño B) y 29 ({VERSIONES.capitalizacion.version},{" "}
        {fechaCorta(VERSIONES.capitalizacion.fecha)}) y doc 30; series_waterfall_sim.py {VERSION_MODELO.version},{" "}
        {fechaCorta(VERSION_MODELO.fecha)}; series_montecarlo_sim.py {VERSIONES.monteCarlo.version},{" "}
        {fechaCorta(VERSIONES.monteCarlo.fecha)} ({numero(FUTUROS_SIMULADOS)} futuros, semilla 7). Los textos legales son
        borradores a verificar con abogado.
      </p>
    </div>
  );
}
