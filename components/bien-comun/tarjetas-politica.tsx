import { CAJA } from "./estilos";

// La política de FARO en tarjetas cortas: la regla propuesta y de dónde viene. Cada regla es una caja.
export type TarjetaPolitica = { id: string; titulo: string; regla: string; fuente: string };

export function TarjetasPolitica(p: { deDondeEtiqueta: string; tarjetas: TarjetaPolitica[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {p.tarjetas.map((t) => (
        <li key={t.id} className={CAJA} data-politica={t.id}>
          <h3 className="font-semibold">{t.titulo}</h3>
          <p>{t.regla}</p>
          <p className="text-muted">
            {p.deDondeEtiqueta}: {t.fuente}
          </p>
        </li>
      ))}
    </ul>
  );
}
