import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import { obtenerEvento, type Evento } from "@/lib/congreso/evento";
import { BarraCompraMovil } from "./barra-compra-movil";
import { Cierre } from "./cierre";
import { Cifras } from "./cifras";
import { Ejes } from "./ejes";
import { Encuentro } from "./encuentro";
import { Entradas } from "./entradas";
import { Heroe } from "./heroe";
import { Preguntas } from "./preguntas";
import { Recorrido } from "./recorrido";
import { Voces } from "./voces";

let evento: Evento;
beforeAll(async () => {
  evento = await obtenerEvento();
});

const cuantas = (html: string, patron: RegExp) => (html.match(patron) ?? []).length;

describe("Heroe", () => {
  it("tiene un solo h1 con el nombre y el lema, y los dos botones", () => {
    const html = renderToStaticMarkup(<Heroe evento={evento} />);
    expect(cuantas(html, /<h1[ >]/g)).toBe(1);
    expect(html).toContain("Solarpunk Patagonia");
    expect(html).toContain("5–9");
    expect(html).toContain("febrero 2027");
    expect(html).toContain('href="#entradas">Quiero ir<');
    expect(html).toContain('href="#recorrido">Ver el recorrido<');
    expect(html).toContain('id="inicio"');
  });
});

describe("Cifras", () => {
  it("muestra cada cifra y nunca un 0 inventado", () => {
    const html = renderToStaticMarkup(<Cifras cifras={[...evento.cifras, { valor: "", etiqueta: "sin cargar" }]} />);
    for (const c of evento.cifras) expect(html).toContain(c.etiqueta);
    expect(html).toContain("sin dato");
  });
});

describe("Encuentro", () => {
  it("lleva el id acerca y deja entrar la marca por párrafo", () => {
    const html = renderToStaticMarkup(
      <Encuentro encuentro={evento.encuentro} marcasParrafo={{ 1: <i data-marca>⚖</i> }} />,
    );
    expect(html).toContain('id="acerca"');
    expect(cuantas(html, /data-marca/g)).toBe(1);
    expect(html).toContain("Primero la cultura. Después, la tierra.");
  });
});

describe("Recorrido", () => {
  it("es una lista ordenada de 4 con la etiqueta visible del día del eclipse", () => {
    const html = renderToStaticMarkup(<Recorrido recorrido={evento.recorrido} />);
    expect(html).toContain('id="recorrido"');
    expect(cuantas(html, /<ol[ >]/g)).toBe(1);
    expect(cuantas(html, /<li[ >]/g)).toBe(4);
    expect(cuantas(html, /ev-parada-etiqueta/g)).toBe(1);
    expect(html).toContain("Día del eclipse");
    expect(html.indexOf("Llegadas")).toBeLessThan(html.indexOf("Anillo de fuego"));
    expect(html.indexOf("Anillo de fuego")).toBeLessThan(html.indexOf("El Gathering"));
    expect(html.indexOf("El Gathering")).toBeLessThan(html.indexOf("Manos en la tierra"));
  });

  it("la marca de una parada entra por id", () => {
    const html = renderToStaticMarkup(
      <Recorrido recorrido={evento.recorrido} marcasParada={{ "manos-en-la-tierra": <i data-marca>⚖</i> }} />,
    );
    expect(cuantas(html, /data-marca/g)).toBe(1);
  });
});

describe("Voces", () => {
  it("muestra las 4 voces con 'Por confirmar' y las iniciales ocultas para lectores de pantalla", () => {
    const html = renderToStaticMarkup(<Voces voces={evento.voces} />);
    for (const v of evento.voces.principales) expect(html).toContain(v.nombre);
    // 4 principales + 2 regionales, todas por confirmar.
    expect(cuantas(html, /Por confirmar/g)).toBe(6);
    expect(cuantas(html, /<span class="ev-retrato-iniciales" aria-hidden="true">/g)).toBe(4);
    expect(html).toContain(evento.voces.notaHibrido);
  });
});

describe("Ejes", () => {
  it("muestra los 8 ejes con ícono decorativo", () => {
    const html = renderToStaticMarkup(<Ejes ejes={evento.ejes} />);
    expect(cuantas(html, /class="ev-eje"/g)).toBe(8);
    expect(cuantas(html, /<svg[^>]*aria-hidden="true"/g)).toBe(8);
  });
});

describe("Entradas", () => {
  it("muestra 6 precios con la marca ejemplo", () => {
    const html = renderToStaticMarkup(<Entradas entradas={evento.entradas} />);
    expect(cuantas(html, /<small>ejemplo<\/small>/g)).toBe(6);
  });

  it("dibuja el hueco de acción de cada tipo", () => {
    const html = renderToStaticMarkup(
      <Entradas entradas={evento.entradas} accion={(t) => <button data-tipo={t.id}>Elegir</button>} />,
    );
    for (const t of evento.entradas.tipos) expect(html).toContain(`data-tipo="${t.id}"`);
    expect(cuantas(html, /Elegir/g)).toBe(6);
  });

  it("sin hueco de acción, ninguna tarjeta tiene un enlace: la pieza nunca inventa un destino de compra", () => {
    const html = renderToStaticMarkup(<Entradas entradas={evento.entradas} />);
    expect(html).not.toMatch(/href=/);
  });

  it("la marca legal entra por props", () => {
    const html = renderToStaticMarkup(<Entradas entradas={evento.entradas} marcaLegal={<i data-marca>⚖</i>} />);
    expect(cuantas(html, /data-marca/g)).toBe(1);
  });
});

describe("Preguntas", () => {
  it("cada pregunta es un details", () => {
    const html = renderToStaticMarkup(<Preguntas preguntas={evento.preguntas} />);
    expect(cuantas(html, /<details[ >]/g)).toBe(evento.preguntas.items.length);
    expect(cuantas(html, /<summary>/g)).toBe(evento.preguntas.items.length);
    expect(html).toContain('id="faq"');
  });
});

describe("Cierre", () => {
  it("tiene las dos acciones y el pie, y ningún botón secundario si no se pasa", () => {
    const html = renderToStaticMarkup(<Cierre cierre={evento.cierre} />);
    expect(html).toContain('href="#entradas">Reservar mi lugar<');
    expect(html).toContain('href="#tribus">Llegar con mi tribu<');
    expect(html).toContain("Convocan NetX Gen, BioPueblo y Rubania");
    expect(html).toContain("Entradas y check-in con UnityHub");
    expect(cuantas(html, /<a /g)).toBe(2);
    expect(html).not.toContain("<button");
  });

  it("dibuja la acción secundaria si se pasa", () => {
    const html = renderToStaticMarkup(<Cierre cierre={evento.cierre} accionSecundaria={<button>Oficial</button>} />);
    expect(html).toContain("<button>Oficial</button>");
  });
});

describe("BarraCompraMovil", () => {
  it("muestra el precio de la entrada destacada con 'ejemplo' y el enlace a Entradas", () => {
    const html = renderToStaticMarkup(<BarraCompraMovil tipos={evento.entradas.tipos} />);
    expect(html).toContain("USD 290");
    expect(html).toContain("ejemplo");
    expect(html).toContain('href="#entradas"');
  });

  it("sin precio dice 'Precio sin dato', no 0", () => {
    const html = renderToStaticMarkup(
      <BarraCompraMovil tipos={[{ ...evento.entradas.tipos[0], precio: undefined }]} />,
    );
    expect(html).toContain("Precio sin dato");
    expect(html).not.toContain("USD 0");
  });
});
