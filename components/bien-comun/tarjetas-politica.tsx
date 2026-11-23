import { SUBTARJETA, TARJETA } from "./estilos";

// La política de FARO en tarjetas cortas: la regla propuesta y de dónde viene.
export type TarjetaPolitica = { id: string; titulo: string; regla: string; fuente: string };

export function TarjetasPolitica(p: { titulo: string; intro: string; deDondeEtiqueta: string; tarjetas: TarjetaPolitica[] }) {
  return (
    <section aria-labelledby="h-politica" className={TARJETA}>
      <h2 id="h-politica" className="text-xl font-semibold">
        {p.titulo}
      </h2>
      <p className="max-w-3xl text-sm">{p.intro}</p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {p.tarjetas.map((t) => (
          <li key={t.id} className={SUBTARJETA} data-politica={t.id}>
            <h3 className="font-semibold">{t.titulo}</h3>
            <p>{t.regla}</p>
            <p className="text-muted">
              {p.deDondeEtiqueta}: {t.fuente}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
