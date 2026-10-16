"use client";

import { useEffect, useState } from "react";
import { tiempoRestante } from "@/lib/congreso/formatos";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosEvento } from "@/lib/congreso/interfaz";

type Props = {
  /** Momento clave con desfase horario, p. ej. 2027-02-06T12:00:00-03:00. */
  momentoIso: string;
  etiqueta?: string;
  idioma?: Idioma;
};

/** Cuenta regresiva en días, horas y minutos. Antes de calcular en el navegador muestra "—", nunca 0. */
export function CuentaRegresiva({ momentoIso, etiqueta, idioma = "es" }: Props) {
  const t = textosEvento(idioma);
  const nombre = etiqueta ?? t.cuentaEtiqueta;
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    const tic = () => setAhora(Date.now());
    tic();
    const intervalo = setInterval(tic, 30000);
    return () => clearInterval(intervalo);
  }, []);

  if (ahora === null) {
    return (
      <div className="ev-cuenta" role="group" aria-label={nombre}>
        <span className="ev-solo-lectores">{t.cuentaCalculando}</span>
        {[t.dias, t.horas, t.minutos].map((u) => (
          <div className="ev-cuenta-caja" key={u} aria-hidden="true">
            <b>—</b>
            <span>{u}</span>
          </div>
        ))}
      </div>
    );
  }

  const resto = tiempoRestante(momentoIso, ahora);
  if (resto === "paso") {
    return (
      <div className="ev-cuenta" role="group" aria-label={nombre}>
        <div className="ev-cuenta-llego">{t.llegoElDia}</div>
      </div>
    );
  }

  return (
    <div className="ev-cuenta" role="group" aria-label={nombre}>
      <div className="ev-cuenta-caja">
        <b>{resto.dias}</b>
        <span>{t.dias}</span>
      </div>
      <div className="ev-cuenta-caja">
        <b>{resto.horas}</b>
        <span>{t.horas}</span>
      </div>
      <div className="ev-cuenta-caja">
        <b>{resto.minutos}</b>
        <span>{t.minutos}</span>
      </div>
    </div>
  );
}
