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
