import { afterEach, describe, expect, it, vi } from "vitest";
import { alVolverOCambiar, avisarCambioDeLotes } from "./usar-estados-lotes";

function montarNavegador(visibilidad: "visible" | "hidden") {
  const documento = Object.assign(new EventTarget(), { visibilityState: visibilidad });
  const ventana = new EventTarget();
  vi.stubGlobal("document", documento);
  vi.stubGlobal("window", ventana);
  return { documento, ventana };
}

afterEach(() => vi.unstubAllGlobals());

describe("alVolverOCambiar", () => {
  it("pide de nuevo al volver a la pestaña, no al esconderla", () => {
    const { documento } = montarNavegador("hidden");
    const pedir = vi.fn();
    alVolverOCambiar(pedir);
    documento.dispatchEvent(new Event("visibilitychange"));
    expect(pedir).not.toHaveBeenCalled();
    documento.visibilityState = "visible";
    documento.dispatchEvent(new Event("visibilitychange"));
    expect(pedir).toHaveBeenCalledTimes(1);
  });

  it("pide de nuevo cuando una pantalla avisa un cambio de lotes", () => {
    montarNavegador("visible");
    const pedir = vi.fn();
    alVolverOCambiar(pedir);
    avisarCambioDeLotes();
    expect(pedir).toHaveBeenCalledTimes(1);
  });

  it("deja de escuchar al limpiar", () => {
    const { documento } = montarNavegador("visible");
    const pedir = vi.fn();
    const dejar = alVolverOCambiar(pedir);
    dejar();
    avisarCambioDeLotes();
    documento.dispatchEvent(new Event("visibilitychange"));
    expect(pedir).not.toHaveBeenCalled();
  });
});
