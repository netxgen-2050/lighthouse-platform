import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { DiagramaCarriles } from "@/components/bien-comun/diagrama-carriles";
import { ListaCambios } from "@/components/bien-comun/lista-cambios";
import { ListaPuertas } from "@/components/bien-comun/lista-puertas";
import { SelloPropuesta } from "@/components/bien-comun/sello-propuesta";
import { TARJETA, TD, TH, REGION } from "@/components/bien-comun/estilos";
import { TablaDecisiones } from "@/components/bien-comun/tabla-decisiones";
import { TarjetasPolitica } from "@/components/bien-comun/tarjetas-politica";
import { TerminoLegal } from "@/components/termino-legal";
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
  const cantidadReglas = enteroEn(Object.keys(POLITICA).length, idioma);

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
      estado: textoDeEstado(d, t.decisiones, idioma),
    };
  });

  const cambios = CAMBIOS_DESDE_V_ANTERIOR.ids.map((id) => ({ id, texto: t.cambios[id] }));

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">{t.titulo}</h1>
      {/* El sello va primero, antes de cualquier número. No es fijo: no tapa el foco del teclado. */}
      <div className="mt-3 grid gap-2">
        <SelloPropuesta
          etiqueta={t.sello.etiqueta}
          texto={t.sello.texto(VERSION_PROPUESTA.version)}
          fecha={t.sello.fecha(formatearFecha(VERSION_PROPUESTA.fecha, idioma, "largo"), VERSION_PROPUESTA.fuente)}
          simulacion={t.sello.simulacion}
          terminoSimulacion={<TerminoLegal clave="noesoferta" idioma={idioma} />}
        />
        <AvisoEjemplo />
        <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          {textos("marco", idioma).aviso}
        </p>
      </div>

      <div className="mt-6 grid gap-6">
        <section aria-labelledby="h-frase" className={TARJETA}>
          <h2 id="h-frase" className="text-xl font-semibold">
            {t.frase.titulo}
            <TerminoLegal clave="tokenbiencomun" idioma={idioma} />
          </h2>
          <p className="max-w-3xl">{t.frase.texto}</p>
          <p className="max-w-3xl font-medium">{t.frase.nadaAcordado}</p>
          <p className="max-w-3xl text-sm text-muted">
            {parte === null ? t.bajadaSinDato : t.bajada(porcentajeEn(parte, idioma, 1))}
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
        </section>

        <DiagramaCarriles
          titulo={t.carriles.titulo}
          intro={t.carriles.intro}
          carrilA={carrilA}
          carrilB={carrilB}
          puentesTitulo={t.puentes.titulo}
          deEtiqueta={t.puentes.de}
          aEtiqueta={t.puentes.a}
          puentes={puentes}
        />

        <ListaPuertas titulo={t.puertas.titulo} intro={t.puertas.intro} puertas={puertas} />

        <div className="grid gap-3 md:grid-cols-2">
          <section aria-labelledby="h-que-da" className={TARJETA}>
            <h2 id="h-que-da" className="text-xl font-semibold">
              {t.queDa.titulo}
            </h2>
            <ul className="grid list-disc gap-1 pl-5 text-sm">
              {QUE_DA.map((id) => (
                <li key={id}>
                  {t.queDa[id]}
                  {id === "expensas" ? <TerminoLegal clave="expensas" idioma={idioma} /> : null}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">{t.queDa.nota}</p>
          </section>
          <section aria-labelledby="h-que-no" className={TARJETA}>
            <h2 id="h-que-no" className="text-xl font-semibold">
              {t.queNoTiene.titulo}
            </h2>
            <ul className="grid list-disc gap-1 pl-5 text-sm">
              {QUE_NO_TIENE.map((id) => (
                <li key={id}>{t.queNoTiene[id]}</li>
              ))}
            </ul>
          </section>
        </div>

        <TarjetasPolitica titulo={t.politica.titulo} intro={t.politica.intro(cantidadReglas)}deDondeEtiqueta={t.politica.deDonde} tarjetas={tarjetas} />

        <TablaDecisiones
          titulo={t.decisiones.titulo}
          intro={t.decisiones.intro(cantidadDecisiones)}
          caption={t.decisiones.caption(cantidadDecisiones)}
          columnas={{ pregunta: t.decisiones.pregunta, recomendacion: t.decisiones.recomendacionTitulo, estado: t.decisiones.estado }}
          filas={filas}
        />

        <ListaCambios
          titulo={t.cambios.titulo}
          intro={t.cambios.intro(formatearFecha(CAMBIOS_DESDE_V_ANTERIOR.fechaModeloAnterior, idioma, "largo"))}
          items={cambios}
        />

        <section aria-labelledby="h-ostrom" className={TARJETA}>
          <h2 id="h-ostrom" className="text-xl font-semibold">
            {t.ostrom.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.ostrom.intro}</p>
          <div role="region" tabIndex={0} aria-label={t.ostrom.caption} className={REGION}>
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">{t.ostrom.caption}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className={TH}>
                    {t.ostrom.principio}
                  </th>
                  <th scope="col" className={TH}>
                    {t.ostrom.como}
                  </th>
                  <th scope="col" className={TH}>
                    {t.ostrom.estado}
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.ostrom.filas.map((f) => (
                  <tr key={f.principio} className="border-t border-line">
                    <th scope="row" className={`${TD} text-left font-medium`}>
                      {f.principio}
                    </th>
                    <td className={TD}>{f.como}</td>
                    <td className={TD}>
                      <span className="w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium">
                        {t.ostrom.idea}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="h-parcelas" className={TARJETA}>
          <h2 id="h-parcelas" className="text-xl font-semibold">
            {t.parcelas.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.parcelas.texto}</p>
          <h3 className="font-medium">{t.parcelas.delPlano}</h3>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {usos.map((u) => (
              <li key={u.uso}>
                <strong>{u.codigos.join(", ")}</strong> · {u.uso}
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium">{t.parcelas.aSumar}</p>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {t.parcelas.aSumarItems.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="h-nft" className={TARJETA}>
          <h2 id="h-nft" className="text-xl font-semibold">
            {t.tokens.nft.titulo}
            <TerminoLegal clave="nftlote" idioma={idioma} />
          </h2>
          <p className="max-w-3xl text-sm">{t.tokens.nft.texto}</p>
        </section>

        <section aria-labelledby="h-abogado" className={TARJETA}>
          <h2 id="h-abogado" className="text-xl font-semibold">
            {t.abogado.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.abogado.intro}</p>
          <ol className="grid list-decimal gap-1 pl-5 text-sm">
            {PREGUNTAS_ABOGADO.map((q) => (
              <li key={q.id} data-pregunta={q.id}>
                {t.abogado.items[q.id]}
                {q.termino ? <TerminoLegal clave={q.termino} idioma={idioma} /> : null}
              </li>
            ))}
          </ol>
        </section>

        <p className="text-sm text-muted">
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
  );
}
