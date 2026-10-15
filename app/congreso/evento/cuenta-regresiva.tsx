"use client";

import { useEffect, useState } from "react";
import { tiempoRestante } from "@/lib/congreso/formatos";

type Props = {
  /** Momento clave con desfase horario, p. ej. 2027-02-06T12:00:00-03:00. */
  momentoIso: string;
  etiqueta?: string;
};

/** Cuenta regresiva en días, horas y minutos. Antes de calcular en el navegador muestra "—", nunca 0. */
export function CuentaRegresiva({ momentoIso, etiqueta = "Cuenta regresiva al eclipse" }: Props) {
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    const tic = () => setAhora(Date.now());
    tic();
    const t = setInterval(tic, 30000);
    return () => clearInterval(t);
  }, []);

  if (ahora === null) {
    return (
      <div className="ev-cuenta" role="group" aria-label={etiqueta}>
        <span className="ev-solo-lectores">Calculando la cuenta regresiva</span>
        {["días", "horas", "min"].map((u) => (
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
      <div className="ev-cuenta" role="group" aria-label={etiqueta}>
        <div className="ev-cuenta-llego">Llegó el día</div>
      </div>
    );
  }

  return (
    <div className="ev-cuenta" role="group" aria-label={etiqueta}>
      <div className="ev-cuenta-caja">
        <b>{resto.dias}</b>
        <span>días</span>
      </div>
      <div className="ev-cuenta-caja">
        <b>{resto.horas}</b>
        <span>horas</span>
      </div>
      <div className="ev-cuenta-caja">
        <b>{resto.minutos}</b>
        <span>min</span>
      </div>
    </div>
  );
}
