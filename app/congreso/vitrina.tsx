import type { Metadata } from "next";
import { GuardarOrigen } from "@/components/guardar-origen";
import { TerminoLegal } from "@/components/termino-legal";
import { obtenerEvento } from "@/lib/congreso/evento";
import type { Idioma } from "@/lib/congreso/idioma";
import { hayCampana, leerParametros } from "@/lib/origen/origen";
import { BarraEvento } from "./evento/barra-evento";
import { BarraCompraMovil } from "./evento/secciones/barra-compra-movil";
import { Cierre } from "./evento/secciones/cierre";
import { Cifras } from "./evento/secciones/cifras";
import { Ejes } from "./evento/secciones/ejes";
import { Encuentro } from "./evento/secciones/encuentro";
import { Entradas } from "./evento/secciones/entradas";
import { Heroe } from "./evento/secciones/heroe";
import { Preguntas } from "./evento/secciones/preguntas";
import { Recorrido } from "./evento/secciones/recorrido";
import { Voces } from "./evento/secciones/voces";
import { TemaEvento } from "./evento/tema-evento";
import { BloqueFuente } from "./netx/bloque-fuente";
import { BotonDemo } from "./netx/boton-demo";
import { IrAlAncla } from "./netx/ir-al-ancla";
import { PreferenciaIdioma } from "./netx/preferencia-idioma";
import { SelectorIdioma } from "./netx/selector-idioma";
import { Territorio } from "./netx/territorio";
import { textosNetx } from "./netx/textos";
import { TicketNetx } from "./netx/ticket-netx";
import { Tribus } from "./netx/tribus";
import { VistaFuentes } from "./netx/vista-fuentes";

export type ParametrosVitrina = Record<string, string | string[] | undefined>;

/** Título y descripción de la página en su idioma, con las dos versiones enlazadas (`hreflang`). */
export async function metadataVitrina(idioma: Idioma): Promise<Metadata> {
  const evento = await obtenerEvento(idioma);
  const t = textosNetx(idioma).pagina;
  return {
    title: `${evento.nombre} · ${t.sufijoTitulo}`,
    description: t.descripcion,
    alternates: {
      canonical: idioma === "en" ? "/congreso/en" : "/congreso",
      languages: { es: "/congreso", en: "/congreso/en" },
    },
  };
}

// El ⚖ va en una variante clara (sobre secciones oscuras) o con tinta (sobre secciones claras): ver tema-evento.css.
const LEGAL_OSCURO = "ev-legal";
const LEGAL_CLARO = "ev-legal-claro";

/**
 * La vitrina del Congreso en un idioma. La arman `/congreso` (español) y `/congreso/en` (inglés): las mismas
 * secciones, las mismas anclas y las mismas reglas; el idioma solo cambia los textos.
 */
export async function Vitrina({ idioma, parametros }: { idioma: Idioma; parametros: ParametrosVitrina }) {
  const evento = await obtenerEvento(idioma);
  const origen = leerParametros(parametros);
  const t = textosNetx(idioma);
  const d = t.fuente.detalles;
  const sinTraducir = evento.sinTraducir;

  const ANCLAS = [
    { href: "#acerca", etiqueta: t.anclas.encuentro },
    { href: "#recorrido", etiqueta: t.anclas.recorrido },
    { href: "#voces", etiqueta: t.anclas.voces },
    { href: "#territorio", etiqueta: t.anclas.territorio },
    { href: "#tribus", etiqueta: t.anclas.tribus },
    { href: "#faq", etiqueta: t.anclas.preguntas },
  ];

  // El ⚖ de "encuentro educativo" va solo en la frase que lo dice; si ninguna lo dice, no se dibuja.
  const indiceEducativo = evento.encuentro.parrafos.findIndex((p) => /educativ|educational/i.test(p));

  const oficial = evento.paginaOficial;
  const botonOficial = oficial ? (
    oficial.esEjemplo ? (
      <BotonDemo texto={oficial.etiqueta} variante="linea-clara" dialogo={t.dialogoPaginaOficial} />
    ) : (
      <a className="ev-boton ev-boton-linea-clara" href={oficial.url} rel="noopener noreferrer">
        {oficial.etiqueta}
      </a>
    )
  ) : undefined;

  const bloque = { idioma, sinTraducir } as const;

  return (
    <TemaEvento className="ev-en-netx" lang={idioma}>
      {hayCampana(origen) && <GuardarOrigen origen={origen} />}
      {idioma === "es" && <PreferenciaIdioma />}
      <IrAlAncla />
      <VistaFuentes idioma={idioma}>
        <BarraEvento
          nombre={evento.nombre}
          anclas={ANCLAS}
          idioma={idioma}
          selectorIdioma={<SelectorIdioma idioma={idioma} />}
        />
        <BloqueFuente fuente="unityhub" detalle={d.fichaEvento} campos={["sobreTitulo", "lema", "bajada", "momentoClave", "lugar"]} {...bloque}>
          <Heroe evento={evento} idioma={idioma} />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle={d.fichaEvento} campos={["cifras"]} {...bloque}>
          <Cifras cifras={evento.cifras} idioma={idioma} />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle={d.descripcion} campos={["encuentro"]} {...bloque}>
          <Encuentro
            encuentro={evento.encuentro}
            marcasParrafo={
              indiceEducativo >= 0
                ? { [indiceEducativo]: <TerminoLegal clave="encuentroeducativo" claseBoton={LEGAL_OSCURO} idioma={idioma} /> }
                : undefined
            }
          />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle={d.agenda} campos={["recorrido"]} {...bloque}>
          <Recorrido
            recorrido={evento.recorrido}
            idioma={idioma}
            marcasParada={{ "manos-en-la-tierra": <TerminoLegal clave="obra" claseBoton={LEGAL_CLARO} idioma={idioma} /> }}
          />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle={d.speakers} campos={["voces"]} {...bloque}>
          <Voces voces={evento.voces} idioma={idioma} />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle={d.temas} campos={["ejes"]} {...bloque}>
          <Ejes ejes={evento.ejes} />
        </BloqueFuente>
        <BloqueFuente fuente="netx" detalle={d.mapa} {...bloque}>
          <Territorio idioma={idioma} />
        </BloqueFuente>
        <BloqueFuente fuente="netx" detalle={d.tribus} {...bloque}>
          <Tribus idioma={idioma} />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle={d.tickets} campos={["entradas"]} {...bloque}>
          <Entradas
            entradas={evento.entradas}
            idioma={idioma}
            marcaLegal={<TerminoLegal clave="ticket" claseBoton={LEGAL_OSCURO} idioma={idioma} />}
            accion={(tipo) => (
              <BotonDemo texto={tipo.textoBoton} variante={tipo.destacado ? "corona" : "linea-clara"} dialogo={t.dialogoCompra} />
            )}
          />
        </BloqueFuente>
        <BloqueFuente fuente="netx" detalle={d.ticketVinculado} {...bloque}>
          <TicketNetx idioma={idioma} />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle={d.faq} campos={["preguntas"]} {...bloque}>
          <Preguntas preguntas={evento.preguntas} />
        </BloqueFuente>
        <Cierre cierre={evento.cierre} accionSecundaria={botonOficial} idioma={idioma} />
        <BarraCompraMovil tipos={evento.entradas.tipos} idioma={idioma} />
      </VistaFuentes>
    </TemaEvento>
  );
}
