import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { armarResumen } from "@/lib/financiamiento/resumen";
import {
  AL_LADO_DE_LA_ESCALERA,
  BOLSILLOS,
  CASCADA,
  CASCADA_NOTA,
  ESCALERA_SAFU,
  ETAPAS,
  INSTRUMENTOS,
  A_VERIFICAR_CON_ABOGADO,
  SERIES_POSIBLES,
  SIN_MODELO,
  type Tamano,
} from "@/lib/financiamiento/relato";
import { ESCENARIOS } from "@/lib/series/escenarios";
import { numero, usd } from "@/lib/series/formato";
import { convertirSafu } from "@/lib/series/safu";
import type { ClaveTermino } from "@/lib/legal/terminos";
import { CARTA, FOCO, H2, SECCION, TD, TH } from "./estilos";

function Tabla({ titulo, columnas, children }: { titulo: string; columnas: readonly string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <caption className="sr-only">{titulo}</caption>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c} scope="col" className={TH}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function SeccionEtapas() {
  const r = armarResumen();
  const tamano = (t: Tamano): string => {
    if (typeof t === "string") return t;
    if (t.ref === "metaSafe") return `${usd(r.netx.safe.min)} a ${numero(r.netx.safe.max)} (meta)`;
    return `${usd(r.netx.gestionAnual.vinedo)} por año (viñedo) · ${usd(r.netx.gestionAnual.agrovoltaica)} por año (agrovoltaica)`;
  };
  return (
    <section aria-labelledby="m-etapas" className={SECCION}>
      <h2 id="m-etapas" className={H2}>
        La plata entra por etapas
      </h2>
      <div className="grid gap-4">
        {ETAPAS.map((e) => (
          <div key={e.id} className={CARTA}>
            <h3 className="mb-2 text-lg font-semibold">
              {e.nombre} · {e.cuando}
            </h3>
            <Tabla titulo={`Etapa ${e.nombre}: qué entra`} columnas={["Qué entra", "De qué tamaño", "De qué depende"]}>
              {e.items.map((i) => (
                <tr key={i.que}>
                  <td className={TD}>{i.que}</td>
                  <td className={TD}>{tamano(i.tamano)}</td>
                  <td className={TD}>{i.depende}</td>
                </tr>
              ))}
            </Tabla>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">
        Lo que no tiene número dice &quot;sin dato&quot;: no se inventa. El tamaño del SAFE y las comisiones se confirman con
        Vagner (ver &quot;Supuestos a confirmar&quot;).
      </p>
    </section>
  );
}

export function SeccionBolsillos() {
  return (
    <section aria-labelledby="m-bolsillos" className={SECCION}>
      <h2 id="m-bolsillos" className={H2}>
        Quién es quién con la plata
      </h2>
      <div className={CARTA}>
        <Tabla
          titulo="Los cuatro bolsillos: qué plata tiene cada uno y si NetX puede tomar de ahí"
          columnas={["Bolsillo", "Qué es", "Su plata", "¿NetX puede tomar de ahí?"]}
        >
          {BOLSILLOS.map((b) => (
            <tr key={b.id}>
              <th scope="row" className={`${TD} text-left font-semibold`}>
                {b.nombre}
              </th>
              <td className={TD}>
                {b.queEs} {b.id === "fundacion" && <TerminoLegal clave="fundaciontierra" />}
              </td>
              <td className={TD}>{b.plata}</td>
              <td className={TD}>{b.netxPuedeTomar}</td>
            </tr>
          ))}
        </Tabla>
      </div>
    </section>
  );
}

const TERMINO_DEL_PASO: Record<string, ClaveTermino> = {
  notas: "notasverdes",
  unidades: "unidadesregeneracion",
  primeraperdida: "primeraperdida",
};

export function SeccionCascada() {
  return (
    <section aria-labelledby="m-cascada" className={SECCION}>
      <h2 id="m-cascada" className={H2}>
        Cómo paga una serie
      </h2>
      <p className="mb-3 max-w-3xl text-muted">
        Cada serie <TerminoLegal clave="serieprograma" /> paga en este orden: lo que está más arriba cobra primero.
      </p>
      <ol className={`grid list-decimal gap-1 pl-6 ${CARTA} pl-8`}>
        {CASCADA.map((p) => (
          <li key={p.id}>
            {p.texto} {TERMINO_DEL_PASO[p.id] && <TerminoLegal clave={TERMINO_DEL_PASO[p.id]} />}
          </li>
        ))}
      </ol>
      <p className="mt-2 max-w-3xl text-sm text-muted">{CASCADA_NOTA}</p>

      <h3 className="mt-5 mb-2 text-lg font-semibold">Series posibles</h3>
      <ul className={`grid gap-2 ${CARTA}`}>
        {SERIES_POSIBLES.map((s) => (
          <li key={s.id}>
            <strong>{s.nombre}</strong> · {s.descripcion} {s.id === "madre" && <TerminoLegal clave="seriemadre" />} —{" "}
            {s.conModelo && s.modelo ? (
              <Link href="/netx/simulador" className={`underline ${FOCO}`}>
                {ESCENARIOS[s.modelo].etiqueta}
              </Link>
            ) : (
              <span>{SIN_MODELO}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

const TERMINO_DEL_INSTRUMENTO: Record<string, ClaveTermino> = {
  safu: "safu",
  safe: "safe",
  unidades: "unidadesregeneracion",
  madre: "seriemadre",
};

export function SeccionDineroTemprano() {
  const descuento = ESCENARIOS.vinedo.decididos.descuentoSafu.partida;
  const unidades = convertirSafu(1000, descuento / 100);
  return (
    <section aria-labelledby="m-temprano" className={SECCION}>
      <h2 id="m-temprano" className={H2}>
        Dinero temprano
      </h2>
      <p className="mb-3 max-w-3xl text-muted">
        Cómo se puede poner plata hoy, antes de que existan las series. Es una escalera: cada escalón lleva al siguiente.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <ol className={`grid list-decimal gap-2 pl-8 md:col-span-2 ${CARTA}`}>
          {ESCALERA_SAFU.map((p, i) => (
            <li key={p.cuando}>
              <strong>{p.cuando}</strong> · {p.texto}{" "}
              {i === 0 && <TerminoLegal clave="safu" />}
              {i === 1 && <TerminoLegal clave="seriemadre" />}
            </li>
          ))}
        </ol>
        <ul className={`grid gap-2 text-sm ${CARTA}`}>
          {AL_LADO_DE_LA_ESCALERA.map((a) => (
            <li key={a.id}>
              {a.texto}
              {a.marca && <span className="block text-muted">Ojo: {a.marca}</span>}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-lg">
        {usd(1000)} en SAFU se convierten en {usd(unidades)} de Unidades de la Serie Madre (descuento{" "}
        {numero(descuento)} %).
      </p>

      <h3 className="mt-5 mb-2 text-lg font-semibold">Instrumentos</h3>
      <div className={CARTA}>
        <Tabla
          titulo="Instrumentos: quién emite, para quién, qué recibís y su forma legal (a verificar con abogado)"
          columnas={["Instrumento", "Quién lo emite", "Para quién", "Qué recibís", `Forma legal · ${A_VERIFICAR_CON_ABOGADO}`]}
        >
          {INSTRUMENTOS.map((i) => (
            <tr key={i.id}>
              <th scope="row" className={`${TD} text-left font-semibold`}>
                {i.nombre}
              </th>
              <td className={TD}>{i.emite}</td>
              <td className={TD}>{i.paraQuien}</td>
              <td className={TD}>{i.recibis}</td>
              <td className={TD}>
                {i.formaLegal} {TERMINO_DEL_INSTRUMENTO[i.id] && <TerminoLegal clave={TERMINO_DEL_INSTRUMENTO[i.id]} />}
              </td>
            </tr>
          ))}
        </Tabla>
      </div>
    </section>
  );
}
