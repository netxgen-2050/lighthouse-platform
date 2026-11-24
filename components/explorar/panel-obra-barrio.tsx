"use client";

import { TerminoLegal } from "@/components/termino-legal";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import { Titulo } from "@/components/ui/titulo";
import { BarraAvance } from "@/components/ui/barra-avance";
import { Indicador } from "@/components/ui/indicador";
import { PanelVidrio } from "@/components/ui/panel-vidrio";
import { ANIOS_DEL_HORIZONTE, resumenObraBarrio } from "@/lib/bien-comun/barrio";
import { enteroEn } from "@/lib/bien-comun/formato";
import { difierenLosLotes } from "@/lib/barrios/norte";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { usdEn } from "@/lib/lotes/formato";

/**
 * Panel de la obra del barrio: solo con sesión (hasta R14, igual que "Los números del barrio"). Sin sesión, un aviso con el
 * enlace para entrar y ningún número: el cálculo corre acá, en el cliente, solo cuando hay sesión. Esto oculta, no protege (ADR-015).
 */
export function PanelObraBarrio({ lotesDelPlano }: { lotesDelPlano: number }) {
  const idioma = useIdioma();
  const t = useTextos("barrios");
  const { estado } = useSesion();

  if (estado === "cargando") return null;

  if (estado !== "ok") {
    return (
      <PanelVidrio como="section" className="grid content-start gap-3">
        <Titulo className="text-xl font-bold">{t.sinSesion.titulo}</Titulo>
        <p className="text-sm">{t.sinSesion.aviso}</p>
        <EntrarPara texto={t.sinSesion.entrar} />
      </PanelVidrio>
    );
  }

  const obra = resumenObraBarrio();
  const mes =
    obra.mesDevolucion === null
      ? t.obra.noEnAnios(enteroEn(ANIOS_DEL_HORIZONTE, idioma))
      : t.obra.mes(enteroEn(obra.mesDevolucion, idioma));

  return (
    <PanelVidrio como="section" className="grid content-start gap-4">
      <Titulo className="text-xl font-bold">{t.obra.titulo}</Titulo>
      <p className="max-w-3xl text-sm">
        {t.obra.intro} <TerminoLegal clave="tokeninversor" idioma={idioma} />
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Indicador etiqueta={t.obra.infraestructura} valor={obra.infraestructura === null ? null : usdEn(obra.infraestructura, idioma)} mono />
        <BarraAvance
          etiqueta={t.obra.juntado}
          fraccion={obra.juntado === null || obra.infraestructura === null ? null : obra.juntado / obra.infraestructura}
        />
      </div>
      <div className="grid gap-1 text-sm">
        <Titulo extra={1} className="font-semibold">{t.obra.devolucion}</Titulo>
        <p>{t.obra.devolucionTexto}</p>
        <p data-dato="mes">{mes}</p>
      </div>
      <div className="grid gap-2">
        <Titulo extra={1} className="font-semibold">{t.obra.comunTitulo}</Titulo>
        <div
          role="region"
          tabIndex={0}
          aria-label={t.obra.caption}
          className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
        >
          <table className="w-full text-sm">
            <caption className="sr-only">{t.obra.caption}</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-2 py-1.5 text-left font-semibold">
                  {t.obra.anio}
                </th>
                <th scope="col" className="px-2 py-1.5 text-left font-semibold">
                  {t.obra.total}
                </th>
              </tr>
            </thead>
            <tbody>
              {obra.comunPorAnio.map((total, i) => (
                <tr key={i} className="border-t border-line">
                  <th scope="row" className="px-2 py-1.5 text-left font-medium">
                    {enteroEn(i + 1, idioma)}
                  </th>
                  <td className="px-2 py-1.5">{usdEn(total, idioma)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {difierenLosLotes(obra.lotesDelModelo, lotesDelPlano) && (
        <p className="text-sm text-muted">
          {t.obra.lotesModelo(enteroEn(obra.lotesDelModelo, idioma), enteroEn(lotesDelPlano, idioma))}
        </p>
      )}
    </PanelVidrio>
  );
}
