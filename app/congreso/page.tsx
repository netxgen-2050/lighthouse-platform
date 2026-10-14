import type { Metadata } from "next";
import { GuardarOrigen } from "@/components/guardar-origen";
import { TerminoLegal } from "@/components/termino-legal";
import { obtenerEvento } from "@/lib/congreso/evento";
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
import { DIALOGO_COMPRA, DIALOGO_PAGINA_OFICIAL } from "./netx/textos";
import { IrAlAncla } from "./netx/ir-al-ancla";
import { TicketNetx } from "./netx/ticket-netx";
import { Territorio } from "./netx/territorio";
import { Tribus } from "./netx/tribus";
import { VistaFuentes } from "./netx/vista-fuentes";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata(): Promise<Metadata> {
  const evento = await obtenerEvento();
  return { title: `${evento.nombre} · Congreso` };
}

const ANCLAS = [
  { href: "#acerca", etiqueta: "El encuentro" },
  { href: "#recorrido", etiqueta: "Recorrido" },
  { href: "#voces", etiqueta: "Voces" },
  { href: "#territorio", etiqueta: "El territorio" },
  { href: "#tribus", etiqueta: "Tribus" },
  { href: "#faq", etiqueta: "Preguntas" },
];

// El ⚖ va en una variante clara (sobre secciones oscuras) o con tinta (sobre secciones claras): ver tema-evento.css.
const LEGAL_OSCURO = "ev-legal";
const LEGAL_CLARO = "ev-legal-claro";

export default async function CongresoPage({ searchParams }: Props) {
  const evento = await obtenerEvento();
  const origen = leerParametros(await searchParams);

  // El ⚖ de "encuentro educativo" va en la frase que lo dice; si no hay una, en el último párrafo.
  const indiceEducativo = evento.encuentro.parrafos.findIndex((p) => /educativ/i.test(p));
  const indiceMarca = indiceEducativo >= 0 ? indiceEducativo : evento.encuentro.parrafos.length - 1;

  const oficial = evento.paginaOficial;
  const botonOficial = oficial ? (
    oficial.esEjemplo ? (
      <BotonDemo texto={oficial.etiqueta} variante="linea-clara" dialogo={DIALOGO_PAGINA_OFICIAL} />
    ) : (
      <a className="ev-boton ev-boton-linea-clara" href={oficial.url} rel="noopener noreferrer">
        {oficial.etiqueta}
      </a>
    )
  ) : undefined;

  return (
    <TemaEvento className="ev-en-netx">
      {hayCampana(origen) && <GuardarOrigen origen={origen} />}
      <IrAlAncla />
      <VistaFuentes>
        <BarraEvento nombre={evento.nombre} anclas={ANCLAS} />
        <BloqueFuente fuente="unityhub" detalle="ficha del evento">
          <Heroe evento={evento} />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle="ficha del evento">
          <Cifras cifras={evento.cifras} />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle="descripción">
          <Encuentro
            encuentro={evento.encuentro}
            marcasParrafo={{ [indiceMarca]: <TerminoLegal clave="encuentroeducativo" claseBoton={LEGAL_OSCURO} /> }}
          />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle="agenda">
          <Recorrido
            recorrido={evento.recorrido}
            marcasParada={{ "manos-en-la-tierra": <TerminoLegal clave="obra" claseBoton={LEGAL_CLARO} /> }}
          />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle="speakers">
          <Voces voces={evento.voces} />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle="temas">
          <Ejes ejes={evento.ejes} />
        </BloqueFuente>
        <BloqueFuente fuente="netx" detalle="mapa del territorio">
          <Territorio />
        </BloqueFuente>
        <BloqueFuente fuente="netx" detalle="tribus">
          <Tribus />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle="tickets y Stripe">
          <Entradas
            entradas={evento.entradas}
            marcaLegal={<TerminoLegal clave="ticket" claseBoton={LEGAL_OSCURO} />}
            accion={(t) => (
              <BotonDemo texto={t.textoBoton} variante={t.destacado ? "corona" : "linea-clara"} dialogo={DIALOGO_COMPRA} />
            )}
          />
        </BloqueFuente>
        <BloqueFuente fuente="netx" detalle="ticket vinculado y presencia">
          <TicketNetx />
        </BloqueFuente>
        <BloqueFuente fuente="unityhub" detalle="FAQ">
          <Preguntas preguntas={evento.preguntas} />
        </BloqueFuente>
        <Cierre cierre={evento.cierre} accionSecundaria={botonOficial} />
        <BarraCompraMovil tipos={evento.entradas.tipos} />
      </VistaFuentes>
    </TemaEvento>
  );
}
