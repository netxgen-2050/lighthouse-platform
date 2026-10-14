import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// renderToStaticMarkup no corre efectos: simulamos que el navegador ya calculó la hora actual.
const AHORA = Date.parse("2026-10-14T12:00:00-03:00");
vi.mock("react", async (original) => {
  const real = await original<typeof import("react")>();
  return { ...real, useState: () => [AHORA, () => {}], useEffect: () => {} };
});

import { CuentaRegresiva } from "./cuenta-regresiva";

describe("CuentaRegresiva (ya en el navegador)", () => {
  it("antes del momento clave muestra días, horas y minutos", () => {
    const html = renderToStaticMarkup(<CuentaRegresiva momentoIso="2027-02-06T12:00:00-03:00" />);
    expect(html).toContain("días");
    expect(html).toContain("horas");
    expect(html).toContain("min");
    expect(html).not.toContain("Llegó el día");
    expect(html).not.toContain("—");
  });

  it("pasado el momento clave dice Llegó el día", () => {
    const html = renderToStaticMarkup(<CuentaRegresiva momentoIso="2026-02-06T12:00:00-03:00" />);
    expect(html).toContain("Llegó el día");
    expect(html).not.toContain("ev-cuenta-caja");
  });
});
