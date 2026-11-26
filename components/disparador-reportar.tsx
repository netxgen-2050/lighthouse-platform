"use client";

import { Bug } from "lucide-react";
import { useIdioma } from "@/lib/idioma/cliente";
import { Boton } from "./ui/boton";
import { abrirReporte } from "./boton-reportar";

/**
 * "Reportar" de la barra superior (compu): botón de texto con el bicho, al lado de la campanita. En el celular el mismo
 * formulario se abre desde la hoja Más. El formulario todavía está solo en español: en inglés se marca como español.
 */
export function DisparadorReportar() {
  const idioma = useIdioma();
  return (
    <div className="hidden md:block">
      <Boton
        variante="texto"
        tamano="s"
        onClick={abrirReporte}
        aria-label="Reportar un problema o una idea"
        lang={idioma === "en" ? "es" : undefined}
      >
        <Bug aria-hidden="true" size={18} />
        Reportar
      </Boton>
    </div>
  );
}
