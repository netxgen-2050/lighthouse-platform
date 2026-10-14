import type { Evento } from "@/lib/congreso/evento";

/** "Preguntas": cada una es un desplegable nativo (`details`), que se abre y cierra con el teclado. */
export function Preguntas({ preguntas }: { preguntas: Evento["preguntas"] }) {
  return (
    <section className="ev-seccion ev-faq-seccion" id="faq" aria-labelledby="t-faq">
      <div className="ev-cont">
        <h2 id="t-faq">{preguntas.titulo}</h2>
        <div className="ev-faq">
          {preguntas.items.map((p) => (
            <details key={p.id}>
              <summary>{p.pregunta}</summary>
              <p>{p.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
