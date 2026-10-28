"use client";

import { useEffect } from "react";
import { idDeAncla } from "@/lib/tribus/ancla";

/** Al entrar con `#necesidad-<id>`, abre el <details> que corresponde. Sin JavaScript, el ancla igual lleva a la necesidad. */
export function AbrirPorAncla() {
  useEffect(() => {
    const abrir = () => {
      const id = idDeAncla(window.location.hash);
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView();
      }
    };
    abrir();
    window.addEventListener("hashchange", abrir);
    return () => window.removeEventListener("hashchange", abrir);
  }, []);
  return null;
}
