import Link from "next/link";
import { buscarTerritorio, textoSuperficie, tribusDeTerritorio } from "@/lib/territorios/datos";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosNetx } from "./textos";

const ID_TERRITORIO = "lighthouse";

/** "El territorio": ilustración del valle y las cifras del catálogo de territorios de NetX ("sin dato" si faltan). */
export function Territorio({ idioma = "es" }: { idioma?: Idioma }) {
  const TEXTO_TERRITORIO = textosNetx(idioma).territorio;
  const territorio = buscarTerritorio(ID_TERRITORIO);
  const textoSup = territorio ? textoSuperficie(territorio) : "sin dato";
  const superficie = textoSup === "sin dato" ? TEXTO_TERRITORIO.sinDato : textoSup;
  const barrios = tribusDeTerritorio(ID_TERRITORIO).length;
  return (
    <section className="ev-seccion ev-territorio" id="territorio" aria-labelledby="t-territorio">
      <div className="ev-cont">
        <div className="ev-terr">
          <div className="ev-terr-mapa" role="img" aria-label={TEXTO_TERRITORIO.alternativa}>
            <svg viewBox="0 0 600 440" preserveAspectRatio="xMidYMid slice" focusable="false">
              <rect className="ev-mapa-fondo" width="600" height="440" />
              <path className="ev-mapa-estepa" d="M0 80 C120 60 200 120 300 100 S480 60 600 90" strokeWidth="40" />
              <path className="ev-mapa-estepa" d="M0 330 C150 300 260 360 380 330 S520 300 600 320" strokeWidth="50" />
              <path
                className="ev-mapa-rio"
                d="M-20 250 C80 210 160 280 260 240 S420 170 520 210 S600 240 640 220"
                strokeWidth="18"
              />
              <path
                className="ev-mapa-rio-brillo"
                d="M-20 250 C80 210 160 280 260 240 S420 170 520 210 S600 240 640 220"
                strokeWidth="5"
              />
              <ellipse className="ev-mapa-terreno" cx="300" cy="215" rx="95" ry="60" />
              <ellipse className="ev-mapa-terreno-borde" cx="300" cy="215" rx="95" ry="60" />
              <circle className="ev-mapa-punto" cx="300" cy="215" r="9" />
              <circle className="ev-mapa-aro" cx="300" cy="215" r="16" />
              <rect className="ev-mapa-etiqueta" x="318" y="150" width="104" height="28" rx="14" />
              <text className="ev-mapa-texto-claro" x="370" y="169" textAnchor="middle" fontSize="14" fontWeight="700">
                Lighthouse
              </text>
              <text className="ev-mapa-texto" x="70" y="300" fontSize="15" fontWeight="700">
                Río Negro
              </text>
            </svg>
          </div>
          <div className="ev-terr-info">
            <h2 id="t-territorio">{TEXTO_TERRITORIO.titulo}</h2>
            <div className="ev-dato-grande">
              <div>
                <b>{superficie}</b>
                <span>{TEXTO_TERRITORIO.superficie}</span>
              </div>
              <div>
                <b>{barrios > 0 ? barrios : TEXTO_TERRITORIO.sinDato}</b>
                <span>{TEXTO_TERRITORIO.barrios}</span>
              </div>
            </div>
            <p>{TEXTO_TERRITORIO.cuerpo}</p>
            <Link
              className="ev-boton ev-boton-linea"
              href="/territorios/lighthouse"
              hrefLang={idioma === "en" ? "es" : undefined}
            >
              {TEXTO_TERRITORIO.boton}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
