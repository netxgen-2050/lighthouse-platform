import { SUBTARJETA, TARJETA } from "./estilos";

// Los dos carriles y los tres puentes, en HTML: dos secciones con sus nodos en listas y los puentes como una lista ordenada
// entre ambas, cada uno con "de → a" dicho en texto. Las flechas son decorativas. En pantallas angostas se apila.
export type NodoDiagrama = { id: string; nombre: string; texto: string };
export type CarrilDiagrama = { titulo: string; bajada: string; nodos: NodoDiagrama[] };
export type PuenteDiagrama = {
  id: string;
  nombre: string;
  texto: string;
  desde: string;
  hacia: string;
};

export type PropsDiagrama = {
  titulo: string;
  intro: string;
  carrilA: CarrilDiagrama;
  carrilB: CarrilDiagrama;
  puentesTitulo: string;
  deEtiqueta: string;
  aEtiqueta: string;
  puentes: PuenteDiagrama[];
};

function Carril({ carril, id }: { carril: CarrilDiagrama; id: string }) {
  return (
    <section aria-labelledby={id} className={TARJETA}>
      <h3 id={id} className="text-lg font-semibold">
        {carril.titulo}
      </h3>
      <p className="text-sm text-muted">{carril.bajada}</p>
      <ul className="grid gap-2">
        {carril.nodos.map((n) => (
          <li key={n.id} className={SUBTARJETA}>
            <strong>{n.nombre}</strong>
            <span>{n.texto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DiagramaCarriles(p: PropsDiagrama) {
  return (
    <section aria-labelledby="h-carriles" className="grid gap-3">
      <h2 id="h-carriles" className="text-xl font-semibold">
        {p.titulo}
      </h2>
      <p className="max-w-3xl text-sm">{p.intro}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Carril carril={p.carrilA} id="h-carril-a" />
        <Carril carril={p.carrilB} id="h-carril-b" />
      </div>
      <section aria-labelledby="h-puentes" className={TARJETA}>
        <h3 id="h-puentes" className="text-lg font-semibold">
          {p.puentesTitulo}
        </h3>
        <ol className="grid gap-2 md:grid-cols-3">
          {p.puentes.map((b) => (
            <li key={b.id} className={SUBTARJETA}>
              <strong>{b.nombre}</strong>
              <span>{b.texto}</span>
              <span className="font-medium">
                {p.deEtiqueta}: {b.desde}
                <span aria-hidden="true"> → </span>
                <span className="sr-only">. </span>
                {p.aEtiqueta}: {b.hacia}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
