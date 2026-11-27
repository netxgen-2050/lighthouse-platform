import { DibujoAgua, DibujoComunidad, DibujoTrabajo } from "./dibujos";

export type Pilar = { id: "agua" | "trabajo" | "comunidad"; titulo: string; texto: string };

const DIBUJOS = { agua: DibujoAgua, trabajo: DibujoTrabajo, comunidad: DibujoComunidad } as const;

/**
 * Agua, Trabajo y Comunidad (ux-inicio, design §3): tres columnas en compu, una debajo de otra en el celular, con un dibujo de línea,
 * el título en Fraunces y el texto. Sin tarjetas ni bordes: las separa el aire.
 */
export function FranjaPilares({ pilares }: { pilares: Pilar[] }) {
  return (
    <ul className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-3 sm:gap-12 sm:px-10">
      {pilares.map((p) => {
        const Dibujo = DIBUJOS[p.id];
        return (
          <li key={p.id} className="grid content-start gap-3 text-ink">
            <span className="text-deep-2">
              <Dibujo tamano={40} />
            </span>
            <h2 className="text-xl font-bold">{p.titulo}</h2>
            <p>{p.texto}</p>
          </li>
        );
      })}
    </ul>
  );
}
