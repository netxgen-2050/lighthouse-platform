import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BloqueFuente } from "./bloque-fuente";
import { textosNetx, todosLosTextos } from "./textos";

const DIALOGO_COMPRA = textosNetx("es").dialogoCompra;
const DIALOGO_PAGINA_OFICIAL = textosNetx("es").dialogoPaginaOficial;
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

describe("BloqueFuente en inglés", () => {
  it("dice From, y avisa solo si a su sección le falta una traducción", () => {
    const con = renderToStaticMarkup(
      <BloqueFuente
        fuente="unityhub"
        detalle="speakers"
        idioma="en"
        sinTraducir={["voces.principales.0.afiliacion"]}
        campos={["voces"]}
      >
        <p>hola</p>
      </BloqueFuente>,
    );
    expect(con).toContain("From UnityHub · speakers");
    expect(con).toContain("Part of this section is only available in Spanish.");
    const otra = renderToStaticMarkup(
      <BloqueFuente fuente="unityhub" detalle="FAQ" idioma="en" sinTraducir={["voces.titulo"]} campos={["preguntas"]}>
        <p>hola</p>
      </BloqueFuente>,
    );
    expect(otra).not.toContain("only available in Spanish");
    const prefijoParcial = renderToStaticMarkup(
      <BloqueFuente fuente="unityhub" detalle="x" idioma="en" sinTraducir={["vocesX.a"]} campos={["voces"]}>
        <p>hola</p>
      </BloqueFuente>,
    );
    expect(prefijoParcial).not.toContain("only available in Spanish");
  });

  it("avisa en el cierre si su frase o la etiqueta de la página oficial llegan solo en español", () => {
    for (const ruta of ["cierre.frase", "paginaOficial.etiqueta"]) {
      const html = renderToStaticMarkup(
        <BloqueFuente fuente="unityhub" detalle="event card" idioma="en" sinTraducir={[ruta]} campos={["cierre", "paginaOficial"]}>
          <p>cierre</p>
        </BloqueFuente>,
      );
      expect(html).toContain("only available in Spanish");
    }
  });

  it("en español no muestra la nota aunque falte algo", () => {
    const html = renderToStaticMarkup(
      <BloqueFuente fuente="netx" detalle="tribus" sinTraducir={["voces.titulo"]} campos={["voces"]}>
        <i />
      </BloqueFuente>,
    );
    expect(html).not.toContain("ev-nota-idioma");
  });
});

describe("Territorio y Tribus en inglés", () => {
  it("traducen los textos y avisan que el destino está en español", () => {
    const terr = renderToStaticMarkup(<Territorio idioma="en" />);
    expect(terr).toContain("Explore the map in NetX (in Spanish)");
    expect(terr).toContain('hrefLang="es"');
    expect(terr).toContain("of surface area");
    const tribus = renderToStaticMarkup(<Tribus idioma="en" />);
    expect(tribus).toContain("Don&#x27;t come alone. Arrive with your tribe.");
    expect(tribus.match(/\d+ of \d+ are going/g)).toHaveLength(3);
    expect(tribus).not.toMatch(/\d+ de \d+ van/);
    expect(tribus).toContain('href="/tribus"');
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
