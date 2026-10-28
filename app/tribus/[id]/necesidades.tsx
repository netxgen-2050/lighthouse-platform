import { formatearFecha } from "@/lib/idioma/formatos";
import type { Idioma } from "@/lib/idioma/tipos";
import { textos } from "@/lib/idioma/textos";
import { buscarRol, textoDeRol } from "@/lib/pactos/datos";
import {
  administradorDe,
  avalDe,
  circuloDeNecesidad,
  holonDe,
  necesidadesDe,
  type Necesidad,
} from "@/lib/tribus/necesidades";
import { AbrirPorAncla } from "./abrir-por-ancla";

const marca = "rounded-full border border-faint px-2 py-0.5 text-xs";

export function Necesidades({ tribuId, tribuNombre, idioma }: { tribuId: string; tribuNombre: string; idioma: Idioma }) {
  const tx = textos("tribus", idioma);
  const n = tx.ficha.necesidad;
  const lista = necesidadesDe(tribuId, idioma);
  if (lista.length === 0) return null;

  const esCirculo = (x: Necesidad) => holonDe(x).tipo === "circulo";
  const nombreDelHolon = (x: Necesidad): string => (esCirculo(x) ? (circuloDeNecesidad(x, idioma) ?? "") : tribuNombre);

  return (
    <>
      <AbrirPorAncla />
      <ul className="grid gap-2">
        {lista.map((x) => {
          const sinAval = x.tipo === "diseno" && !avalDe(x);
          const estado = x.estado === "abierta" ? (sinAval ? n.abiertaEsperandoAval : n.abierta) : x.estado === "tomada" ? n.tomada : n.hecha;
          const rol = buscarRol(x.habilidad);
          const habilidad = x.habilidadOtra ?? (rol ? textoDeRol(rol, idioma).nombre : n.sinDato);
          const circulo = circuloDeNecesidad(x, idioma);
          const hifa = administradorDe(holonDe(x)).tipo === "hifa";
          const tipo = x.tipo === "diseno" ? n.tipoDiseno : n.tipoCampo;
          return (
            <li key={x.id}>
              <details id={`necesidad-${x.id}`} className="rounded-lg border border-faint px-3 py-2">
                <summary className="cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
                  {x.titulo} · {tipo} · {estado} <span className={marca}>{n.ejemplo}</span>
                </summary>
                <div className="mt-2 grid gap-1 text-sm">
                  <p>
                    <strong>{n.que}:</strong> {x.que}
                  </p>
                  <p className="text-muted">
                    {tipo}: {x.tipo === "diseno" ? n.explicacionDiseno : n.explicacionCampo}
                  </p>
                  <p>
                    <strong>{n.horas}:</strong> {x.horas === null ? n.sinDato : `~${x.horas} h`}
                  </p>
                  <p>
                    <strong>{n.paraCuando}:</strong> {x.paraCuando === null ? n.sinDato : formatearFecha(x.paraCuando, idioma)}
                  </p>
                  <p>
                    <strong>{n.habilidad}:</strong> {habilidad}
                  </p>
                  {circulo && (
                    <p>
                      <strong>{n.circulo}:</strong> {circulo}
                    </p>
                  )}
                  {hifa && <p>{n.administraHifa}</p>}
                  {x.tope && (
                    <p>
                      {x.tope.unidad === "horas" ? n.maximoHoras(x.tope.valor) : n.maximoSemillas(x.tope.valor)} · {n.horasDeMas}
                    </p>
                  )}
                  {x.topeTotal && (
                    <p>
                      {x.topeTotal.unidad === "horas" ? n.maximoTotalHoras(x.topeTotal.valor) : n.maximoTotalSemillas(x.topeTotal.valor)} ·{" "}
                      {n.totalAclaracion}
                    </p>
                  )}
                  {x.tipo === "diseno" && <p>{sinAval ? n.esperandoAval(nombreDelHolon(x), esCirculo(x)) : n.avalada(nombreDelHolon(x), esCirculo(x))}</p>}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </>
  );
}
