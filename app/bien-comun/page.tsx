import type { Metadata } from "next";
import Link from "next/link";
import { SeccionBarrio } from "@/components/bien-comun/calculadora-barrio";
import { DiagramaCarriles } from "@/components/bien-comun/diagrama-carriles";
import { LECTURA } from "@/components/bien-comun/estilos";
import { ListaCambios } from "@/components/bien-comun/lista-cambios";
import { ListaPuertas } from "@/components/bien-comun/lista-puertas";
import { TablaDecisiones } from "@/components/bien-comun/tabla-decisiones";
import { TablaFilas } from "@/components/bien-comun/tabla-filas";
import { TarjetasPolitica } from "@/components/bien-comun/tarjetas-politica";
import { TerminoLegal } from "@/components/termino-legal";
import { Aviso } from "@/components/ui/aviso";
import { ChipEstado } from "@/components/ui/chip-estado";
import { IndicePagina, IndicePaginaMovil } from "@/components/ui/indice-pagina";
import { Seccion } from "@/components/ui/seccion";
import { SeccionPlegable } from "@/components/ui/seccion-plegable";
import { ENTRADAS_DE_PARTIDA } from "@/lib/bien-comun/barrio";
import { textoDeEstado } from "@/lib/bien-comun/estado-decision";
import { enteroEn, faroEn } from "@/lib/bien-comun/formato";
import {
  CAMBIOS_DESDE_V_ANTERIOR,
  CARRILES,
  DECISIONES,
  FARO_POR_M2,
  POLITICA,
  PREGUNTAS_ABOGADO,
  PUENTES,
  PUERTAS,
  QUE_DA,
  QUE_NO_TIENE,
  VERSION_PROPUESTA,
  type IdDecision,
  type IdPolitica,
} from "@/lib/bien-comun/modelo";
import { formatearFecha, sinDato } from "@/lib/idioma/formatos";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { parteDelSectorPrivada } from "@/lib/lotes/escenarios";
import { porcentajeEn } from "@/lib/lotes/formato";
import { parcelasPorUso } from "@/lib/territorios/loteo-textos";

// La propuesta v0.1 del bien común y los tokens, como PROPUESTA EN DISCUSIÓN (spec bien-comun-propuesta). Se ve sin sesión.
// Con índice, secciones con aire y lo largo plegado (spec ux-bien-comun).
// Ningún número se escribe acá: salen de `lib/bien-comun/modelo.ts` (o de `lib/lotes/modelo.ts`). No se emite ni se cobra nada.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("biencomun", await idiomaDelPedido()).titulo };
}

export default async function BienComunPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("biencomun", idioma);
  const parte = parteDelSectorPrivada();
  const usos = parcelasPorUso(idioma);
  const meses = enteroEn(POLITICA.transferencia.revisionMeses, idioma);
  // Las cantidades salen del módulo, nunca del diccionario.
  const cantidadDecisiones = enteroEn(DECISIONES.length, idioma);
  const abiertas = DECISIONES.filter((d) => d.estado === "abierta").length;
  const cantidadAbiertas = enteroEn(abiertas, idioma);
  const cantidadReglas = enteroEn(Object.keys(POLITICA).length, idioma);
  const cantidadCambios = enteroEn(CAMBIOS_DESDE_V_ANTERIOR.ids.length, idioma);
  const cantidadPrincipios = enteroEn(t.ostrom.filas.length, idioma);
  const cantidadPreguntas = enteroEn(PREGUNTAS_ABOGADO.length, idioma);

  const nodoA = {
    tokenTierra: "tokenTierra",
    tokenInversor: "tokenInversor",
    fideicomiso: "fideicomiso",
  } as const;
  const nombreNodo = (id: string) => t.nodos[id as keyof typeof t.nodos] ?? sinDato(idioma);

  const carrilA = {
    titulo: t.carriles.a.titulo,
    bajada: t.carriles.a.bajada,
    nodos: CARRILES.a.map((id) => ({ id, nombre: t.nodos[id], texto: t.carriles.a[nodoA[id]] })),
  };
  const carrilB = {
    titulo: t.carriles.b.titulo,
    bajada: t.carriles.b.bajada,
    nodos: CARRILES.b.map((id) => ({ id, nombre: t.nodos[id], texto: t.carriles.b[id] })),
  };

  const puentes = PUENTES.map((p) => {
    const d = t.puentes[p.id];
    const texto =
      p.id === "parteDeCadaPago"
        ? t.puentes.parteDeCadaPago.texto(porcentajeEn(p.valor?.fraccion, idioma))
        : (d.texto as string);
    return { id: p.id, nombre: d.nombre, texto, desde: nombreNodo(p.desde), hacia: nombreNodo(p.hacia) };
  });

  const puertas = PUERTAS.map((id) => ({
    id,
    nombre: t.puertas[id].nombre,
    texto: id === "conElLote" ? t.puertas.conElLote.texto(faroEn(FARO_POR_M2.valor, idioma)) : (t.puertas[id].texto as string),
  }));

  const tarjetas = (Object.keys(POLITICA) as IdPolitica[]).map((id) => ({
    id,
    titulo: t.politica[id].titulo,
    regla: id === "transferencia" ? t.politica.transferencia.regla(meses) : (t.politica[id].regla as string),
    // La fuente es una cita del documento de origen: sale del módulo, en el idioma de la persona.
    fuente: POLITICA[id].fuente[idioma],
  }));

  const filas = DECISIONES.map((d) => {
    const txt = t.decisiones[d.id as IdDecision];
    return {
      id: d.id,
      pregunta: txt.pregunta,
      recomendacion:
        d.id === "d3" ? t.decisiones.d3.recomendacion(meses) : (t.decisiones[d.id].recomendacion as string),
      termino: d.id === "d2" ? <TerminoLegal clave="primaobjetivo" idioma={idioma} /> : undefined,
      estado: d.estado === "abierta" ? ("abierta" as const) : ("decidida" as const),
      detalleEstado: d.estado === "abierta" ? undefined : textoDeEstado(d, t.decisiones, idioma),
    };
  });

  const cambios = CAMBIOS_DESDE_V_ANTERIOR.ids.map((id) => ({ id, texto: t.cambios[id] }));

  // El índice: los mismos títulos que los de las secciones, en el orden de la página.
  const indice = [
    { id: "h-frase", titulo: t.frase.titulo },
    { id: "h-carriles", titulo: t.carriles.titulo },
    { id: "h-puertas", titulo: t.puertas.titulo },
    { id: "h-que-da", titulo: `${t.queDa.titulo} / ${t.queNoTiene.titulo}` },
    { id: "h-politica", titulo: t.politica.titulo },
    { id: "h-barrio", titulo: t.barrio.titulo },
    { id: "h-decisiones", titulo: t.decisiones.titulo },
    { id: "h-cambios", titulo: t.cambios.titulo },
    { id: "h-ostrom", titulo: t.ostrom.titulo },
    { id: "h-parcelas", titulo: t.parcelas.titulo },
    { id: "h-nft", titulo: t.tokens.nft.titulo },
    { id: "h-abogado", titulo: t.abogado.titulo },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">{t.titulo}</h1>
      {/* Un solo aviso, antes de cualquier número: el estado de la propuesta. No es fijo: no tapa el foco del teclado. */}
      <Aviso tono="legal" className="mt-4 max-w-[68ch]" aria-label={t.sello.etiqueta}>
        <p className="font-semibold">{t.sello.texto(VERSION_PROPUESTA.version)}</p>
        <p className="mt-1">
          {t.sello.fecha(formatearFecha(VERSION_PROPUESTA.fecha, idioma, "largo"), VERSION_PROPUESTA.fuente)}
        </p>
        <p className="mt-1">
          {t.sello.simulacion}
          <TerminoLegal clave="noesoferta" idioma={idioma} />
        </p>
      </Aviso>

      <div className="mt-4 lg:hidden">
        <IndicePaginaMovil items={indice} etiqueta={t.indice.titulo} etiquetaCerrar={t.indice.cerrar} />
      </div>

      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
        <div className="hidden lg:block">
          <div className="sticky top-24 mt-12">
            <IndicePagina items={indice} etiqueta={t.indice.titulo} />
          </div>
        </div>

        <div className="min-w-0">
          <Seccion id="h-frase" titulo={t.frase.titulo}>
            <p className={LECTURA}>
              {t.frase.texto}
              <TerminoLegal clave="tokenbiencomun" idioma={idioma} />
            </p>
            <p className={`${LECTURA} font-medium`}>{t.frase.nadaAcordado}</p>
            <p className={`${LECTURA} text-muted`}>
              {parte === null ? t.bajadaSinDato : t.bajada(porcentajeEn(parte, idioma, 1))}
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {(["fideicomisobarrio", "tokentierra", "tokeninversor", "tesorocomun"] as const).map((c) => (
                <li key={c}>
                  {c === "fideicomisobarrio"
                    ? t.nodos.fideicomiso
                    : c === "tokentierra"
                      ? t.nodos.tokenTierra
                      : c === "tokeninversor"
                        ? t.nodos.tokenInversor
                        : t.nodos.tesoro}
                  <TerminoLegal clave={c} idioma={idioma} />
                </li>
              ))}
            </ul>
          </Seccion>

          <Seccion id="h-carriles" titulo={t.carriles.titulo} bajada={t.carriles.intro}>
            <DiagramaCarriles
              carrilA={carrilA}
              carrilB={carrilB}
              puentesTitulo={t.puentes.titulo}
              deEtiqueta={t.puentes.de}
              aEtiqueta={t.puentes.a}
              puentes={puentes}
            />
          </Seccion>

          <Seccion id="h-puertas" titulo={t.puertas.titulo} bajada={t.puertas.intro}>
            <ListaPuertas puertas={puertas} />
          </Seccion>

          <div className="grid md:grid-cols-2 md:gap-10">
            <Seccion id="h-que-da" titulo={t.queDa.titulo}>
              <ul className="grid list-disc gap-1 pl-5">
                {QUE_DA.map((id) => (
                  <li key={id}>
                    {t.queDa[id]}
                    {id === "expensas" ? <TerminoLegal clave="expensas" idioma={idioma} /> : null}
                  </li>
                ))}
              </ul>
              <p className="text-muted">{t.queDa.nota}</p>
            </Seccion>
            <Seccion id="h-que-no" titulo={t.queNoTiene.titulo}>
              <ul className="grid list-disc gap-1 pl-5">
                {QUE_NO_TIENE.map((id) => (
                  <li key={id}>{t.queNoTiene[id]}</li>
                ))}
              </ul>
            </Seccion>
          </div>

          <div className="mt-8 sm:mt-12">
            <SeccionPlegable id="h-politica" titulo={t.politica.titulo} resumen={t.resumenes.politica(cantidadReglas)}>
              <p className={LECTURA}>{t.politica.intro(cantidadReglas)}</p>
              <TarjetasPolitica deDondeEtiqueta={t.politica.deDonde} tarjetas={tarjetas} />
            </SeccionPlegable>
          </div>

          {/* Solo con sesión, hasta la revisión R14: sin sesión el componente muestra un aviso y ningún número del barrio. */}
          <SeccionBarrio partida={ENTRADAS_DE_PARTIDA} />

          <div className="mt-8 sm:mt-12">
            <SeccionPlegable id="h-decisiones" titulo={t.decisiones.titulo} resumen={t.resumenes.decisiones(cantidadAbiertas, abiertas)}>
              <p className={LECTURA}>{t.decisiones.intro(cantidadDecisiones)}</p>
              <TablaDecisiones
                caption={t.decisiones.caption(cantidadDecisiones)}
                columnas={{ pregunta: t.decisiones.pregunta, recomendacion: t.decisiones.recomendacionTitulo, estado: t.decisiones.estado }}
                filas={filas}
              />
            </SeccionPlegable>

            <SeccionPlegable id="h-cambios" titulo={t.cambios.titulo} resumen={t.resumenes.cambios(cantidadCambios)}>
              <p className={LECTURA}>
                {t.cambios.intro(formatearFecha(CAMBIOS_DESDE_V_ANTERIOR.fechaModeloAnterior, idioma, "largo"))}
              </p>
              <ListaCambios items={cambios} />
            </SeccionPlegable>

            <SeccionPlegable id="h-ostrom" titulo={t.ostrom.titulo} resumen={t.resumenes.ostrom(cantidadPrincipios)}>
              <p className={LECTURA}>{t.ostrom.intro}</p>
              <TablaFilas
                caption={t.ostrom.caption}
                columnas={{ nombre: t.ostrom.principio, detalle: t.ostrom.como, estado: t.ostrom.estado }}
                filas={t.ostrom.filas.map((f) => ({
                  id: f.principio,
                  nombre: f.principio,
                  detalle: f.como,
                  estado: <ChipEstado estado="enDiscusion" />,
                }))}
              />
            </SeccionPlegable>

            <SeccionPlegable id="h-parcelas" titulo={t.parcelas.titulo} resumen={t.resumenes.parcelas}>
              <p className={LECTURA}>{t.parcelas.texto}</p>
              <h3 className="font-medium">{t.parcelas.delPlano}</h3>
              <ul className="grid list-disc gap-1 pl-5">
                {usos.map((u) => (
                  <li key={u.uso}>
                    <strong>{u.codigos.join(", ")}</strong> · {u.uso}
                  </li>
                ))}
              </ul>
              <p className="font-medium">{t.parcelas.aSumar}</p>
              <ul className="grid list-disc gap-1 pl-5">
                {t.parcelas.aSumarItems.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </SeccionPlegable>

            <SeccionPlegable id="h-nft" titulo={t.tokens.nft.titulo} resumen={t.resumenes.nft}>
              <p className={LECTURA}>
                {t.tokens.nft.texto}
                <TerminoLegal clave="nftlote" idioma={idioma} />
              </p>
            </SeccionPlegable>

            <SeccionPlegable id="h-abogado" titulo={t.abogado.titulo} resumen={t.resumenes.abogado(cantidadPreguntas)}>
              <p className={LECTURA}>{t.abogado.intro}</p>
              <ol className={`grid ${LECTURA} list-decimal gap-2 pl-5`}>
                {PREGUNTAS_ABOGADO.map((q) => (
                  <li key={q.id} data-pregunta={q.id}>
                    {t.abogado.items[q.id]}
                    {q.termino ? <TerminoLegal clave={q.termino} idioma={idioma} /> : null}
                  </li>
                ))}
              </ol>
            </SeccionPlegable>
          </div>

          <p className="mt-8 text-muted">
            {t.version(VERSION_PROPUESTA.fuente, VERSION_PROPUESTA.version, formatearFecha(VERSION_PROPUESTA.fecha, idioma, "largo"))}{" "}
            <Link
              className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
              href="/lotes/hibrido"
            >
              {t.volver}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
