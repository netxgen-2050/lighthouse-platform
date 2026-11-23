import { REGION, TARJETA, TD, TH } from "./estilos";

// Las decisiones del doc 34 §7: pregunta, recomendación de Gus y estado, dicho en texto (no solo con color).
export type FilaDecision = { id: string; pregunta: string; recomendacion: string; estado: string };

export type PropsDecisiones = {
  titulo: string;
  intro: string;
  caption: string;
  columnas: { pregunta: string; recomendacion: string; estado: string };
  filas: FilaDecision[];
};

export function TablaDecisiones(p: PropsDecisiones) {
  return (
    <section aria-labelledby="h-decisiones" className={TARJETA}>
      <h2 id="h-decisiones" className="text-xl font-semibold">
        {p.titulo}
      </h2>
      <p className="max-w-3xl text-sm">{p.intro}</p>
      <div role="region" tabIndex={0} aria-label={p.caption} className={REGION}>
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">{p.caption}</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className={TH}>
                {p.columnas.pregunta}
              </th>
              <th scope="col" className={TH}>
                {p.columnas.recomendacion}
              </th>
              <th scope="col" className={TH}>
                {p.columnas.estado}
              </th>
            </tr>
          </thead>
          <tbody>
            {p.filas.map((f) => (
              <tr key={f.id} className="border-t border-line">
                <th scope="row" className={`${TD} text-left font-medium`}>
                  {f.pregunta}
                </th>
                <td className={TD}>{f.recomendacion}</td>
                <td className={TD}>
                  <span className="w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium">
                    {f.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
