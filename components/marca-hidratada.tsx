"use client";

import { useEffect } from "react";

/**
 * Sin interfaz: cuando React terminó de hidratar la página pone `data-hidratado` en `<html>`. Los e2e esperan esa marca antes de
 * tocar menús y hojas (un toque antes de hidratar no hace nada), en lugar de dormir un rato.
 */
export function MarcaHidratada() {
  useEffect(() => {
    document.documentElement.dataset.hidratado = "1";
  }, []);
  return null;
}
