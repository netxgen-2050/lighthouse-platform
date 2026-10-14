import type { EstadoVoz, Evento } from "@/lib/congreso/evento";

const TEXTO_ESTADO: Record<EstadoVoz, string> = {
  confirmada: "Confirmada",
  "por-confirmar": "Por confirmar",
};

/** "Voces": retratos con degradado e iniciales (sin fotos), estado visible, voces de la región y nota del escenario híbrido. */
export function Voces({ voces }: { voces: Evento["voces"] }) {
  return (
    <section className="ev-seccion ev-voces-seccion" id="voces" aria-labelledby="t-voces">
      <div className="ev-cont">
        <h2 id="t-voces">{voces.titulo}</h2>
        <ul className="ev-voces">
          {voces.principales.map((v) => (
            <li key={v.id} className={`ev-voz ev-tono-${v.tono}`}>
              <div className="ev-retrato">
                <span className="ev-retrato-iniciales" aria-hidden="true">
                  {v.iniciales}
                </span>
                <span className="ev-voz-estado">{TEXTO_ESTADO[v.estado]}</span>
              </div>
              <h3>{v.nombre}</h3>
              <p>{v.afiliacion}</p>
            </li>
          ))}
        </ul>
        {voces.regionales.length > 0 ? (
          <div className="ev-voces-locales">
            <b>{voces.regionalesTitulo}</b>
            {voces.regionales.map((v) => (
              <span key={v.id}>
                {v.nombre}, {v.afiliacion} · {TEXTO_ESTADO[v.estado]}
              </span>
            ))}
          </div>
        ) : null}
        <div className="ev-hibrido">
          <span className="ev-pantalla" aria-hidden="true" />
          <p>{voces.notaHibrido}</p>
        </div>
      </div>
    </section>
  );
}
