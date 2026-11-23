import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { TipoEntrada } from "@/lib/congreso/evento";
import { BarraEvento } from "./barra-evento";
import { Boton } from "./boton";
import { ChipFecha } from "./chip-fecha";
import { CuentaRegresiva } from "./cuenta-regresiva";
import { Eclipse } from "./eclipse";
import { TarjetaEntrada } from "./tarjeta-entrada";

const TIPO: TipoEntrada = {
  id: "pase-completo",
  nombre: "Pase completo",
  etiqueta: "Preventa",
  descripcion: "Los cinco días.",
  precio: { monto: 290, moneda: "USD" },
  esEjemplo: true,
  destacado: true,
  textoBoton: "Comprar pase completo",
};

describe("Boton", () => {
  it("con destino es un enlace con la variante pedida", () => {
    const html = renderToStaticMarkup(<Boton variante="linea" href="#entradas">Ver</Boton>);
    expect(html).toContain('<a class="ev-boton ev-boton-linea" href="#entradas">');
  });
  it("sin destino es un botón", () => {
    const html = renderToStaticMarkup(<Boton variante="corona">Ir</Boton>);
    expect(html).toContain('<button type="button" class="ev-boton ev-boton-corona">');
  });
});

describe("BarraEvento", () => {
  it("tiene la navegación con sus anclas y el botón Entradas", () => {
    const html = renderToStaticMarkup(
      <BarraEvento
        nombre="Solarpunk Patagonia"
        anclas={[
          { href: "#acerca", etiqueta: "El encuentro" },
          { href: "#faq", etiqueta: "Preguntas" },
        ]}
      />,
    );
    expect(html).toContain('aria-label="Secciones del evento"');
    expect(html).toContain('<a href="#acerca">El encuentro</a>');
    expect(html).toContain('<a href="#faq">Preguntas</a>');
    expect(html).toContain('href="#entradas">Entradas</a>');
    expect(html).toContain("Solarpunk Patagonia");
    expect(html).toContain(">ES<");
  });
});

describe("ChipFecha", () => {
  it("muestra los días y el mes con año", () => {
    const html = renderToStaticMarkup(<ChipFecha inicio="2027-02-05" fin="2027-02-09" />);
    expect(html).toContain("5–9");
    expect(html).toContain("febrero 2027");
  });
});

describe("TarjetaEntrada", () => {
  it("muestra el precio con la marca ejemplo", () => {
    const html = renderToStaticMarkup(<TarjetaEntrada tipo={TIPO} />);
    expect(html).toContain("USD 290");
    expect(html).toContain("ejemplo");
    expect(html).toContain("ev-entrada-destacada");
    expect(html).not.toContain("⚖");
  });
  it("sin precio dice Precio sin dato y no muestra 0", () => {
    const html = renderToStaticMarkup(<TarjetaEntrada tipo={{ ...TIPO, precio: undefined, destacado: false }} />);
    expect(html).toContain("Precio sin dato");
    expect(html).not.toMatch(/>\s*0\s*</);
    expect(html).not.toContain("USD 0");
    expect(html).not.toContain("ejemplo");
  });
  it("la marca legal y la acción entran por props", () => {
    const html = renderToStaticMarkup(
      <TarjetaEntrada tipo={TIPO} marcaLegal={<i data-marca>⚖</i>} accion={<a href="#x">Elegir</a>} />,
    );
    expect(html).toContain("<i data-marca");
    expect(html).toContain('<a href="#x">Elegir</a>');
    expect(html).not.toContain("Comprar pase completo");
  });
});

describe("piezas en inglés", () => {
  it("la barra, el chip y la tarjeta hablan inglés", () => {
    const barra = renderToStaticMarkup(
      <BarraEvento nombre="Solarpunk Patagonia" anclas={[{ href: "#faq", etiqueta: "Questions" }]} idioma="en" />,
    );
    expect(barra).toContain('aria-label="Event sections"');
    expect(barra).toContain(">EN<");
    expect(barra).toContain("Tickets</a>");
    expect(renderToStaticMarkup(<ChipFecha inicio="2027-02-05" fin="2027-02-09" idioma="en" />)).toContain("February 2027");
    const tarjeta = renderToStaticMarkup(<TarjetaEntrada tipo={TIPO} idioma="en" />);
    expect(tarjeta).toContain("USD 290");
    expect(tarjeta).toContain("sample");
    expect(tarjeta).not.toContain("ejemplo");
    expect(renderToStaticMarkup(<TarjetaEntrada tipo={{ ...TIPO, precio: undefined }} idioma="en" />)).toContain("Price not available");
  });
  it("el selector de idioma entra por el hueco de la barra", () => {
    const html = renderToStaticMarkup(<BarraEvento nombre="X" anclas={[]} selectorIdioma={<i data-selector>sel</i>} />);
    expect(html).toContain("<i data-selector");
    expect(html).not.toContain("ev-idioma");
  });
  it("la cuenta regresiva en inglés dice Calculating", () => {
    const html = renderToStaticMarkup(<CuentaRegresiva momentoIso="2027-02-06T12:00:00-03:00" idioma="en" />);
    expect(html).toContain("Calculating the countdown");
    expect(html).toContain("days");
  });
});

describe("Eclipse", () => {
  it("es decorativo", () => {
    const html = renderToStaticMarkup(<Eclipse />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("ev-luna");
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}"/);
  });
});

describe("CuentaRegresiva (render del servidor)", () => {
  it("muestra — con texto accesible y ningún 0 como valor", () => {
    const html = renderToStaticMarkup(<CuentaRegresiva momentoIso="2027-02-06T12:00:00-03:00" />);
    expect(html).toContain("—");
    expect(html).toContain("Calculando la cuenta regresiva");
    expect(html).not.toMatch(/<b>\s*0\s*<\/b>/);
    expect(html).not.toContain("Llegó el día");
  });
});
