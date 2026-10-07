import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { TerminoLegal } from "@/components/termino-legal";
import { RegistroTicket } from "./registro-ticket";

export const metadata: Metadata = { title: "Congreso · Febrero 2027" };

const DIAS = [
  "Llegada y visita al Lighthouse",
  "Encuentros de tribus",
  "Minga: primera jornada de obra",
  "Masterplan y Ronda 0",
  "Fogón de cierre",
];

export default function CongresoPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="text-sm font-medium text-muted">Encontrarse en persona</p>
      <h1 className="text-3xl font-semibold">Congreso · Febrero 2027</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        El Congreso lo vende su organizador por separado
        <TerminoLegal clave="ticket" />. Acá registrás tu ticket y, cada día que hagas check-in en
        el territorio, tu presencia suma. El primer check-in te da el registro <b>Genesis</b>.
      </p>
      <AvisoEjemplo />
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <RegistroTicket />
        <section aria-labelledby="agenda" className="rounded-xl border border-faint bg-surface p-4">
          <h2 id="agenda" className="mb-3 text-xl font-semibold">Agenda</h2>
          <ol className="grid gap-3">
            {DIAS.map((d, i) => (
              <li key={d} className="flex gap-3">
                <span className="w-14 shrink-0 font-medium">Día {i + 1}</span>
                <div>
                  <b>{d}</b>
                  {i === 2 && (
                    <p className="text-sm text-muted">
                      Con seguro y modalidad definida
                      <TerminoLegal clave="obra" />.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <p className="mt-4 text-sm text-muted">
        La presencia da acceso y voz, no valor: no se compra ni se transfiere
        <TerminoLegal clave="presencia" />.
      </p>
    </div>
  );
}
