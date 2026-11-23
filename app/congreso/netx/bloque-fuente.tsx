import type { ReactNode } from "react";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosNetx } from "./textos";

export type Fuente = "unityhub" | "netx";

const NOMBRE: Record<Fuente, string> = { unityhub: "UnityHub", netx: "NetX" };

/** ¿Alguna ruta de `sinTraducir` cae en los campos de esta sección? ("voces" coincide con "voces.principales.0.afiliacion"). */
export function faltaTraduccion(sinTraducir: readonly string[] | undefined, prefijos: readonly string[] | undefined): boolean {
  if (!sinTraducir || !prefijos) return false;
  return sinTraducir.some((ruta) => prefijos.some((p) => ruta === p || ruta.startsWith(`${p}.`)));
}

type Props = {
  fuente: Fuente;
  /** Detalle ya traducido ("agenda" / "schedule"). */
  detalle: string;
  idioma?: Idioma;
  /** Rutas de los textos que cayeron al español (del evento) y los campos del contenido que usa esta sección. */
  sinTraducir?: readonly string[];
  campos?: readonly string[];
  children: ReactNode;
};

/**
 * Marca de dónde viene una sección: el atributo `data-fuente` pinta el contorno (violeta o verde) cuando el modo
 * "¿Qué viene de UnityHub?" está activo, y el texto de origen lo dice con palabras, para no depender del color.
 * Con el modo apagado el texto queda en `display: none`, así el lector de pantalla no lo lee.
 * En inglés, si a la sección le falta una traducción, avisa con una nota visible.
 */
export function BloqueFuente({ fuente, detalle, idioma = "es", sinTraducir, campos, children }: Props) {
  const t = textosNetx(idioma);
  const nota = idioma === "en" && faltaTraduccion(sinTraducir, campos);
  return (
    <div data-fuente={fuente}>
      <span className="ev-fuente">
        {t.fuente.viene} {NOMBRE[fuente]} · {detalle}
      </span>
      {nota ? <p className="ev-nota-idioma">{t.fuente.sinTraducir}</p> : null}
      {children}
    </div>
  );
}
