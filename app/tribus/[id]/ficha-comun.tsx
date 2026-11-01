import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { MembresiaAcciones } from "@/components/membresia-acciones";
import { TerminoLegal } from "@/components/termino-legal";
import { TextoBilingue } from "@/components/texto-bilingue";
import { CIRCULOS_DEL_COMUN } from "@/lib/gobernanza/datos";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { textoEn } from "@/lib/idioma/tipos";
import {
  GRUPOS_PRINCIPIO,
  MANIFIESTO_VRN,
  nombreDelComun,
  principioVrnPorId,
  principiosDelGrupo,
} from "@/lib/manifiestos/lighthouse-vrn";
import { destinosDisponibles } from "@/lib/navegacion";
import { EstadoAdhesionVrn } from "./estado-adhesion-vrn";

const tarjeta = "grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";
const MARCA = "w-fit rounded-full border border-faint px-2 py-0.5 text-xs";

/**
 * La ficha de Lighthouse VRN en Tribus (`/tribus/lighthouse`): propósito, principios por grupo, derechos de la tierra,
 * equipos transversales, estado de adhesión y botones para leer y adherir. Todo sale del manifiesto y de los
 * círculos del común: no tiene datos propios.
 */
export async function FichaComun() {
  const idioma = await idiomaDelPedido();
  const tx = textos("manifiestoVrn", idioma);
  const f = tx.ficha;
  const m = MANIFIESTO_VRN;
  const nombre = nombreDelComun(idioma);
  const traducido = idioma !== "es";
  const comunes = textos("comunes", idioma);

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/tribus">
          {textos("tribus", idioma).volverTribus}
        </Link>
      </p>
      <h1 className="text-3xl font-semibold" translate="no">
        {nombre}
      </h1>
      <p className="mt-1 text-muted">{f.metaTribu}</p>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span className={`${MARCA} font-medium`}>{tx.borrador}</span>
        <span className={MARCA}>{tx.ejemplo}</span>
        <span className="inline-flex items-center">
          <span className="text-muted">{f.versionDel(textoEn(m.version, idioma))}</span>
          <TerminoLegal clave="manifiestovrn" idioma={idioma} />
        </span>
      </p>
      {traducido && <p className="mt-1 text-sm font-medium text-muted">{comunes.traducidoDelOriginal}</p>}
      <div className="mt-3 grid gap-2">
        <AvisoEjemplo />
        <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          {textos("marco", idioma).aviso}
        </p>
      </div>

      <section aria-labelledby="vrn-proposito" className={`${tarjeta} mt-6`}>
        <h2 id="vrn-proposito" className="text-lg font-semibold">
          {f.proposito}
        </h2>
        <p className="text-lg">
          <TextoBilingue valor={m.proposito} sinNota />
        </p>
      </section>

      <section aria-labelledby="vrn-principios" className="mt-6">
        <h2 id="vrn-principios" className="text-2xl font-semibold">
          {f.principios}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {GRUPOS_PRINCIPIO.map((g) => (
            <section key={g} aria-labelledby={`vrn-grupo-${g}`} className={tarjeta}>
              <h3 id={`vrn-grupo-${g}`} className="text-lg font-semibold">
                {tx.grupos[g]}
              </h3>
              <ul className="grid gap-3">
                {principiosDelGrupo(g).map((p) => (
                  <li key={p.id} className="grid gap-0.5">
                    <span className="font-medium">
                      <TextoBilingue valor={p.nombre} sinNota />
                    </span>
                    <span className="text-sm text-muted">
                      <TextoBilingue valor={p.practica} sinNota />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="vrn-derechos" className={`${tarjeta} mt-6`}>
        <h2 id="vrn-derechos" className="text-2xl font-semibold">
          {f.derechos}
          <TerminoLegal clave="derechostierra" idioma={idioma} />
        </h2>
        <p className="text-muted">{f.derechosIntro}</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {m.derechos.map((d) => (
            <li key={d.id} className="grid gap-0.5 rounded-lg border border-faint p-3">
              <span className="font-medium">
                <TextoBilingue valor={d.nombre} sinNota />
              </span>
              <span className="text-sm">
                <TextoBilingue valor={d.practica} sinNota />
              </span>
              <span className="text-sm text-muted">
                {f.cuidaPrincipios}{" "}
                {d.principios
                  .map((id) => principioVrnPorId(id))
                  .flatMap((p) => (p ? [textoEn(p.nombre, idioma)] : []))
                  .join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vrn-equipos" className={`${tarjeta} mt-6`}>
        <h2 id="vrn-equipos" className="text-2xl font-semibold">
          {f.equipos}
        </h2>
        <p className="text-muted">{f.equiposIntro}</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {CIRCULOS_DEL_COMUN.map((c) => (
            <li key={c.id} className="grid gap-0.5 rounded-lg border border-faint p-3">
              <span className="font-medium">{textoEn(c.nombre, idioma)}</span>
              {c.paraTodoElLighthouse && <span className="text-sm">{textoEn(c.paraTodoElLighthouse, idioma)}</span>}
            </li>
          ))}
        </ul>
        <p>
          <Link className="underline" href="/fogon/gobernanza">
            {f.verGobernanza}
          </Link>
        </p>
      </section>

      <section aria-labelledby="vrn-adhesion" className={`${tarjeta} mt-6`}>
        <h2 id="vrn-adhesion" className="text-lg font-semibold">
          {f.adhesion}
          <TerminoLegal clave="adhesiongobernanza" idioma={idioma} />
        </h2>
        <EstadoAdhesionVrn />
        <MembresiaAcciones
          comunidad={m.id}
          nombre={nombre}
          pactos={destinosDisponibles().some((d) => d.href === "/pactos")}
        />
      </section>
    </div>
  );
}
