import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { TERMINOS } from "@/lib/legal/terminos";
import { SimuladorCliente } from "./simulador-cliente";

export const metadata: Metadata = { title: "Simulador de la tokenomics" };

export default function SimuladorPage() {
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/fogon">← Fogón</Link>
      </p>
      <p className="mb-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="mb-4 max-w-2xl rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {TERMINOS.avisosimulador.texto}
      </p>
      <p className="text-sm font-medium text-muted">Fogón de decisiones</p>
      <h1 className="text-3xl font-semibold">Simulador de la tokenomics (diseño B)</h1>
      <p className="mt-2 mb-6 max-w-2xl text-muted">
        Movés un valor y ves cuánto recibe el procomún, cuánto cada clase de inversor y cuánto NetX en una serie{" "}
        <TerminoLegal clave="serieprograma" /> del programa de fideicomisos. Separamos lo que se decide de lo que se mide.
        Nada se guarda: al recargar vuelven los valores de partida.
      </p>
      <SimuladorCliente />
    </div>
  );
}
