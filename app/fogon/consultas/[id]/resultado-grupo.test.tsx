import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { ProveedorIdioma } from "@/lib/idioma/cliente";
import type { Agregado } from "@/lib/cuadratico/motor";
import { RepositorioNavegador, type Almacen } from "@/lib/fogon/consultas/navegador";
import { buscarConsulta, PADRON } from "@/lib/fogon/consultas/ejemplo";
import type { VistaConsulta } from "@/lib/fogon/consultas/tipos";
import { Acta, QuienFalta, ResultadoDelGrupo } from "./resultado-grupo";

function repo(ahora: Date) {
  const datos = new Map<string, string>();
  const almacen: Almacen = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => void datos.set(k, v) };
  return new RepositorioNavegador(() => almacen, () => ahora);
}

async function vistaDe(id: string, ahora: Date): Promise<VistaConsulta> {
  const l = await repo(ahora).abrir(id);
  if (!l.ok) throw new Error("no abrió");
  return l.valor;
}

const CERRADA = new Date("2026-12-05T12:00:00-03:00");

describe("Resultado y acta de U4 cerrada", () => {
  test("muestra el monto de cada opción, que suman USD 20.000, y no muestra 'Sin asignar'", async () => {
    const vista = await vistaDe("u4", CERRADA);
    const html = renderToStaticMarkup(<ResultadoDelGrupo vista={vista} />);
    expect(html).toContain("Monto: USD 5.555,56");
    expect(html).toContain("Monto: USD 4.722,22");
    expect(html).toContain("Monto: USD 3.055,56");
    expect(html).toContain("Monto: USD 1.944,44");
    expect(html).not.toContain("Sin asignar");
    const acta = renderToStaticMarkup(<Acta vista={vista} />);
    expect(acta).toContain("Vivero de nativas · 20 votos · 28 % · USD 5.555,56");
    expect(acta).toContain("Estudio hidrológico · 17 votos");
    expect(acta).toContain("USD 1.944,44");
  });

  test("el acta de una consulta cerrada a mano dice cuándo se cerró", async () => {
    const r = repo(new Date("2026-10-20T12:00:00-03:00"));
    await r.cerrar("u1");
    const l = await r.abrir("u1");
    if (!l.ok) throw new Error("no abrió");
    expect(renderToStaticMarkup(<Acta vista={l.valor} />)).toContain("Cerrada a mano el 20 de octubre de 2026 (simulado)");
  });

  test("el acta lleva la frase consultiva del catálogo con el botón ⚖", async () => {
    const html = renderToStaticMarkup(<Acta vista={await vistaDe("u1", CERRADA)} />);
    expect(html).toContain("El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.");
    expect(html).toContain("⚖");
  });
});

describe("porcentajes", () => {
  test("barras y leyenda del donut muestran el mismo porcentaje por opción (empates en el redondeo)", async () => {
    const consulta = buscarConsulta("u2")!;
    const [a, b, c, d] = consulta.opciones;
    const agregado: Agregado = [
      { opcion: a.id, neto: 1, apoyos: 1, enContra: 0 },
      { opcion: b.id, neto: 3, apoyos: 1, enContra: 0 },
      { opcion: c.id, neto: 4, apoyos: 1, enContra: 0 },
      { opcion: d.id, neto: 0, apoyos: 0, enContra: 0 },
    ];
    const base = await vistaDe("u2", CERRADA);
    const vista: VistaConsulta = {
      ...base,
      resultado: { visible: true, agregado, participantes: { repartieron: 3, padron: 7 } },
      miReparto: null,
    };
    const html = renderToStaticMarkup(<ResultadoDelGrupo vista={vista} />);
    // 1, 3 y 4 votos: la leyenda del donut, su tabla y las barras muestran todas 12 / 38 / 50.
    for (const [votos, pct] of [["1 voto", 12], ["3 votos", 38], ["4 votos", 50]] as const) {
      expect(html).toContain(`${votos} · ${pct} %`); // barra
      expect(html).toContain(`<td>${pct} %</td>`); // tabla del donut
      expect(html).toContain(`· ${pct} %</li>`); // leyenda
    }
    expect(html).not.toContain("13 %");
    expect(html).not.toContain("37 %");
  });
});

describe("Resultado y acta en inglés", () => {
  const enIngles = (nodo: React.ReactNode) =>
    renderToStaticMarkup(<ProveedorIdioma idioma="en">{nodo}</ProveedorIdioma>);

  test("el resultado de U4 cerrada sale en inglés, con montos y fechas en formato en-US", async () => {
    const vista = await vistaDe("u4", CERRADA);
    const html = enIngles(<ResultadoDelGrupo vista={vista} />);
    expect(html).toContain("Group result");
    expect(html).toContain("Amount: USD 5,555.56");
    expect(html).toContain("Group votes");
    expect(html).toContain("Native plant nursery");
    expect(html).toContain("View as table");
    expect(html).not.toContain("Resultado del grupo");
    expect(html).not.toContain("Vivero de nativas");
  });

  test("el acta nombra la consulta y las fechas en inglés", async () => {
    const r = repo(new Date("2026-10-20T12:00:00-03:00"));
    await r.cerrar("u1");
    const l = await r.abrir("u1");
    if (!l.ok) throw new Error("no abrió");
    const html = enIngles(<Acta vista={l.valor} />);
    expect(html).toContain("Minutes (sample)");
    expect(html).toContain("Closed by hand on October 20, 2026 (simulated)");
    expect(html).toContain("What does the Lighthouse optimize for?");
  });

  test("quienes faltan se nombran en inglés", () => {
    const html = enIngles(<QuienFalta padron={{ faltan: [PADRON[5]], sinAceptar: 2, repartos: null }} cerrada={false} />);
    expect(html).toContain("Yet to vote");
    expect(html).toContain("Sample person 6");
    expect(html).toContain("and 2 people on the roll who haven&#x27;t joined yet");
  });
});

describe("Faltan votar", () => {
  test("cuando todo el padrón repartió dice 'Ya repartió todo el padrón'", () => {
    const html = renderToStaticMarkup(
      <QuienFalta padron={{ faltan: [], sinAceptar: 0, repartos: null }} cerrada={false} />,
    );
    expect(html).toContain("Faltan votar");
    expect(html).toContain("Ya repartió todo el padrón");
  });

  test("con gente que falta la nombra y no dice que repartió todo", () => {
    const html = renderToStaticMarkup(
      <QuienFalta padron={{ faltan: [PADRON[5]], sinAceptar: 0, repartos: null }} cerrada />,
    );
    expect(html).toContain("No repartieron");
    expect(html).toContain("Persona de ejemplo 6");
    expect(html).not.toContain("Ya repartió todo el padrón");
  });
});
