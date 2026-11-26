import { CAJA } from "./estilos";

// Las tres puertas para tener FARO. Solo se describen: no hay ningún botón para comprar ni prepagar.
// El título y la introducción de la sección los pone la página (`Seccion`).
export type PuertaFaro = { id: string; nombre: string; texto: string };

export function ListaPuertas({ puertas }: { puertas: PuertaFaro[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {puertas.map((p) => (
        <li key={p.id} className={CAJA}>
          <strong>{p.nombre}</strong>
          <span>{p.texto}</span>
        </li>
      ))}
    </ol>
  );
}
