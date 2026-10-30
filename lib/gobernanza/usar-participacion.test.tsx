import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useParticipacion } from "./usar-participacion";

// Las pantallas del Fogón y de las consultas muestran la acción o el aviso solo cuando `listo` es true.
function Sonda() {
  const p = useParticipacion();
  return <p>{`listo=${p.listo} puede=${p.puede} vieja=${p.desactualizada}`}</p>;
}

describe("useParticipacion antes de leer la membresía guardada", () => {
  it("no está listo: ni 'Votar' ni el aviso de adhesión se muestran todavía", () => {
    const html = renderToString(<Sonda />);
    expect(html).toContain("listo=false");
    expect(html).toContain("puede=false");
    expect(html).toContain("vieja=false");
  });
});
