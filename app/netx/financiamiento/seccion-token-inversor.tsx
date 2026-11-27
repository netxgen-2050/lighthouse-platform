import Link from "next/link";
import { SelloPropuesta } from "@/components/bien-comun/sello-propuesta";
import { TerminoLegal } from "@/components/termino-legal";
import { Aviso } from "@/components/ui/aviso";
import { ENTRADAS_DE_PARTIDA, coberturaAFechaFija, cobrandoConLasCuotas, montoALevantar } from "@/lib/bien-comun/barrio";
import { VERSION_PROPUESTA } from "@/lib/bien-comun/modelo";
import { formatearFecha } from "@/lib/idioma/formatos";
import { textos } from "@/lib/idioma/textos";
import { TERMINOS } from "@/lib/legal/terminos";
import { SIN_DATO, numero, usd } from "@/lib/series/formato";
import { CARTA, FOCO, H2, SECCION, pctEntero } from "./estilos";

// Token Inversor de la propuesta v0.1 (NS_Tokenomics doc 34 §3 y §4). Propuesta en discusión, números de ejemplo del módulo
// `lib/bien-comun/barrio.ts`. El permiso `vista-netx` oculta, no protege (ADR-015): acá solo hay lo que ya es público en
// /bien-comun. Ningún nombre de inversor, monto comprometido ni condición de una ronda real.
export function SeccionTokenInversor() {
  const t = textos("biencomun", "es");
  const e = ENTRADAS_DE_PARTIDA;
  const monto = montoALevantar(e);
  const a12 = coberturaAFechaFija(e, 12);
  const a24 = coberturaAFechaFija(e, 24);
  const cobrando = cobrandoConLasCuotas(e);
  const dato = (x: { ok: true; valor: number } | { ok: false }, f: (v: number) => string) => (x.ok ? f(x.valor) : SIN_DATO);
  return (
    <section aria-labelledby="m-token-inversor" className={SECCION}>
      <h2 id="m-token-inversor" className={H2}>
        Token Inversor (propuesta v0.1, en discusión)
      </h2>
      <div className="mb-3 grid gap-2">
        <SelloPropuesta
          etiqueta={t.sello.etiqueta}
          texto={t.sello.texto(VERSION_PROPUESTA.version)}
          fecha={t.sello.fecha(formatearFecha(VERSION_PROPUESTA.fecha, "es", "largo"), VERSION_PROPUESTA.fuente)}
          simulacion={t.sello.simulacion}
        />
        <Aviso tono="legal" className="w-fit max-w-3xl">
          {TERMINOS.avisosimulador.texto}
        </Aviso>
      </div>

      <div className={`grid gap-3 ${CARTA}`}>
        <p className="max-w-3xl">
          El Token Inversor <TerminoLegal clave="tokeninversor" /> financiaría la infraestructura de un barrio dentro de su
          fideicomiso <TerminoLegal clave="fideicomisobarrio" />. Para un barrio de ejemplo, el monto a levantar sería{" "}
          <strong>{dato(monto, usd)}</strong> (infraestructura con imprevistos más
          el armado legal).
        </p>
        <p className="max-w-3xl">
          <strong>Cómo cobra:</strong> a medida que entran las cuotas de los lotes, con una prima objetivo{" "}
          <TerminoLegal clave="primaobjetivo" /> de {pctEntero(e.prima)} anual simple (de ejemplo). En el caso base{" "}
          {!cobrando.ok
            ? `terminaría de cobrar en una fecha que hoy figura como ${SIN_DATO}`
            : cobrando.mes === null
              ? "no terminaría de cobrar dentro del horizonte del modelo"
              : `terminaría de cobrar en el mes ${numero(cobrando.mes)}`}
          . Plazo máximo: {SIN_DATO}.
        </p>
        <div className="max-w-3xl">
          <p>
            <strong>Por qué no hay fecha fija:</strong> con lotes en cuotas, el fideicomiso solo tendría una parte de lo que
            debe si hubiera que devolver todo en una fecha.
          </p>
          <ul className="mt-1 list-disc pl-6">
            <li>A los 12 meses tendría {dato(a12, pctEntero)} de lo que debe.</li>
            <li>A los 24 meses tendría {dato(a24, pctEntero)} de lo que debe.</li>
          </ul>
        </div>
        <p className="max-w-3xl">
          <strong>Quién entraría primero:</strong> pocos inversores conocidos. Un ticket chico para el público necesita una
          vía de oferta pública <TerminoLegal clave="noesoferta" />, a verificar con abogado. El Token Equity (la parte de la empresa) queda fuera de este
          acuerdo.
        </p>
        <p className="text-sm">
          <Link href="/bien-comun" className={`underline ${FOCO}`}>
            Ver la propuesta en discusión
          </Link>
        </p>
      </div>
    </section>
  );
}
