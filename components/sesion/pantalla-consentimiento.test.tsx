import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VERSION_POLITICA } from "@/lib/privacidad/consentimiento";

const sesionDe = vi.hoisted(() => ({ valor: {} as Record<string, unknown> }));
vi.mock("./contexto", () => ({ useSesion: () => sesionDe.valor }));

import { PantallaConsentimiento } from "./pantalla-consentimiento";

const base = {
  sesion: { idPersona: "p1", email: "p1@prueba.test" },
  salir: async () => {},
  cabeceras: async () => ({}),
  falloAceptacionPrevia: false,
};

const VERSION_ANTERIOR = "2026-10-14-borrador";
const anterior = { version: VERSION_ANTERIOR, aceptadoEn: "2026-10-14T12:00:00.000Z", aceptado: { politica: true, terminos: true }, canal: "alta", sensibles: null };

function dibujar(detalle: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  sesionDe.valor = { ...base, ...extra, detalleConsentimiento: { registro: null, novedades: null, sensibles: false, ...detalle } };
  return renderToStaticMarkup(<PantallaConsentimiento />);
}

// El e2e no puede sembrar una versión anterior (el servidor solo registra la vigente): esta pantalla se prueba acá.
describe("pantalla de consentimiento: re-consentimiento con lo que cambió", () => {
  it("con una versión anterior dice cuál aceptó, cuándo y qué cambió", () => {
    const html = dibujar({ registro: anterior });
    expect(html).toContain("Cambió la política de privacidad desde la última vez que la aceptaste");
    expect(html).toContain(`Aceptaste la versión ${VERSION_ANTERIOR} el`);
    expect(html).toContain("Qué cambió");
    expect(html).toContain("El login pasa a hacerse con Neon (Neon Auth); Privy se va a retirar.");
    expect(html).toContain("Leer la política completa");
  });

  it("quien nunca aceptó (o retiró) ve el texto de la primera vez, sin Qué cambió", () => {
    const html = dibujar({ registro: null });
    expect(html).toContain("Para usar la plataforma con tu cuenta necesitamos tu consentimiento");
    expect(html).not.toContain("Qué cambió");
    expect(html).not.toContain("Cambió la política");
  });

  it("la casilla de novedades se ofrece solo a quien nunca decidió", () => {
    expect(dibujar({ novedades: null })).toContain("Quiero recibir novedades por email");
    const decidida = { evento: "acepta", version: VERSION_ANTERIOR, registradoAt: "2026-10-14T12:00:00.000Z", canal: "alta" };
    expect(dibujar({ registro: anterior, novedades: decidida })).not.toContain("Quiero recibir novedades por email");
  });

  it("si falló guardar la aceptación del paso, avisa con role alert y deja las casillas sin marcar", () => {
    const html = dibujar({ registro: null }, { falloAceptacionPrevia: true });
    expect(html).toContain('role="alert"');
    expect(html).toContain("No pudimos guardar tu aceptación. Probá de nuevo.");
  });

  it("sin fallo no hay alerta", () => {
    expect(dibujar({ registro: null })).not.toContain("No pudimos guardar tu aceptación");
  });

  it("la versión vigente no es la anterior (el test usa una versión que ya pasó)", () => {
    expect(VERSION_POLITICA).not.toBe(VERSION_ANTERIOR);
  });
});
