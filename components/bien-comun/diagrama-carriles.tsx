import { CAJA, SEPARADOR } from "./estilos";

// Los dos carriles y los tres puentes, en HTML: dos secciones con sus nodos en listas y los puentes como una lista ordenada
// entre ambas, cada uno con "de → a" dicho en texto. Las flechas son decorativas. En pantallas angostas se apila.
// Una sola capa de cajas: cada carril y cada puente es una caja; lo que lleva adentro se separa con una línea.
// El título y la introducción de la sección los pone la página (`Seccion`).
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
  carrilA: CarrilDiagrama;
  carrilB: CarrilDiagrama;
  puentesTitulo: string;
  deEtiqueta: string;
  aEtiqueta: string;
  puentes: PuenteDiagrama[];
};

function Carril({ carril, id }: { carril: CarrilDiagrama; id: string }) {
  return (
    <section aria-labelledby={id} className={`${CAJA} gap-3`}>
      <h3 id={id} className="text-lg font-semibold">
        {carril.titulo}
      </h3>
      <p className="text-muted">{carril.bajada}</p>
      <ul className="grid gap-3">
        {carril.nodos.map((n) => (
          <li key={n.id} className={`grid gap-1 ${SEPARADOR}`}>
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
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Carril carril={p.carrilA} id="h-carril-a" />
        <Carril carril={p.carrilB} id="h-carril-b" />
      </div>
      <section aria-labelledby="h-puentes" className="grid gap-3">
        <h3 id="h-puentes" className="text-lg font-semibold">
          {p.puentesTitulo}
        </h3>
        <ol className="grid gap-4 md:grid-cols-3">
          {p.puentes.map((b) => (
            <li key={b.id} className={CAJA}>
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
    </div>
  );
}
