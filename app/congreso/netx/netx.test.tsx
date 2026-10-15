import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BloqueFuente } from "./bloque-fuente";
import { DIALOGO_COMPRA, DIALOGO_PAGINA_OFICIAL, todosLosTextos } from "./textos";
import { Territorio } from "./territorio";
import { Tribus } from "./tribus";

// Mismo patrón de tuteo que lib/congreso/evento.test.ts.
const TUTEO = /(?<![\p{L}])(?:tú|tienes|puedes|quieres|recibes|vinculas|necesitas|eres|vienes|sabes|llega con tu)(?![\p{L}])/iu;

describe("BloqueFuente", () => {
  it("marca el origen con el atributo y con texto visible", () => {
    const html = renderToStaticMarkup(
      <BloqueFuente fuente="unityhub" detalle="agenda">
        <p>hola</p>
      </BloqueFuente>,
    );
    expect(html).toContain('data-fuente="unityhub"');
    expect(html).toContain("Viene de UnityHub · agenda");
    expect(html).toContain("<p>hola</p>");
  });

  it("distingue NetX", () => {
    const html = renderToStaticMarkup(
      <BloqueFuente fuente="netx" detalle="tribus">
        <i />
      </BloqueFuente>,
    );
    expect(html).toContain('data-fuente="netx"');
    expect(html).toContain("Viene de NetX · tribus");
  });
});

describe("textos fijos de NetX", () => {
  it("no usan tuteo", () => {
    expect(todosLosTextos().filter((t) => TUTEO.test(t))).toEqual([]);
  });

  it("el diálogo de compra no nombra a UnityHub, Stripe ni NetX", () => {
    const texto = Object.values(DIALOGO_COMPRA).join(" ");
    expect(texto).not.toMatch(/UnityHub|Stripe|NetX/i);
    expect(DIALOGO_COMPRA.titulo).toBe("Acá se abriría la compra del ticket");
    expect(DIALOGO_COMPRA.prototipo).toContain("no se cobra nada");
  });

  it("el diálogo de la página oficial tampoco dice quién cobra", () => {
    expect(Object.values(DIALOGO_PAGINA_OFICIAL).join(" ")).not.toMatch(/UnityHub|Stripe|NetX/i);
  });
});

describe("Territorio", () => {
  it("tiene los datos del catálogo, la ilustración con texto alternativo y el enlace al mapa", () => {
    const html = renderToStaticMarkup(<Territorio />);
    expect(html).toContain('id="territorio"');
    expect(html).toContain("~993 ha");
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Ilustración del valle');
    expect(html).toContain('href="/territorios/lighthouse"');
    expect(html).toContain("Explorar el mapa en NetX");
    expect(html).not.toMatch(/<b>0<\/b>/);
  });
});

describe("Tribus", () => {
  it("muestra 'N de M van' en texto, la marca de ejemplo y el enlace a /tribus", () => {
    const html = renderToStaticMarkup(<Tribus />);
    expect(html).toContain("No vengas solo. Llegá con tu tribu.");
    expect(html.match(/\d+ de \d+ van/g)).toHaveLength(3);
    expect(html.match(/ejemplo/g)?.length).toBeGreaterThanOrEqual(3);
    expect(html).toContain('href="/tribus"');
    // La barra es decorativa: la cifra ya está en texto.
    expect(html).toContain('aria-hidden="true"');
  });
});
