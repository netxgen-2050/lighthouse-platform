import type { Evento, IconoEje } from "@/lib/congreso/evento";

// Íconos de línea decorativos; el color lo pone la hoja (currentColor).
const ICONOS: Record<IconoEje, string> = {
  agua: "M16 4c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z",
  suelo: "M16 28V14M16 14c0-5 4-8 9-8 0 5-4 8-9 8zM16 18c0-4-3-7-8-7 0 4 3 7 8 7z",
  restauracion: "M5 16a11 11 0 1 0 22 0 11 11 0 1 0-22 0M5 16h22M16 5c4 4 4 18 0 22M16 5c-4 4-4 18 0 22",
  habitat: "M4 26h24M7 26V15l9-8 9 8v11M13 26v-7h6v7",
  energia: "M11 16a5 5 0 1 0 10 0 5 5 0 1 0-10 0M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M7 25l3-3M22 10l3-3",
  economia: "M25 12a9 9 0 0 0-16-3M7 20a9 9 0 0 0 16 3M9 4v5h5M23 28v-5h-5",
  gobernanza: "M13 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0M4 24a3 3 0 1 0 6 0 3 3 0 1 0-6 0M22 24a3 3 0 1 0 6 0 3 3 0 1 0-6 0M14 10l-5 11M18 10l5 11M10 24h12",
  cultura: "M6 24c4-10 16-10 20 0M10 12a6 6 0 1 1 12 0",
};

/** "Ejes": los temas del encuentro, cada uno con ícono decorativo, título y texto. */
export function Ejes({ ejes }: { ejes: Evento["ejes"] }) {
  return (
    <section className="ev-seccion ev-ejes-seccion" id="ejes" aria-labelledby="t-ejes">
      <div className="ev-cont">
        <h2 id="t-ejes">{ejes.titulo}</h2>
        <div className="ev-ejes">
          {ejes.items.map((e) => (
            <div className="ev-eje" key={e.id}>
              <svg className="ev-eje-icono" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                <path d={ICONOS[e.icono]} />
              </svg>
              <h3>{e.titulo}</h3>
              <p>{e.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
