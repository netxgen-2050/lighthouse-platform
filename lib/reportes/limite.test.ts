import { describe, expect, it } from "vitest";
import {
  crearLimite,
  MAX_POR_CLAVE,
  MAX_TOTAL,
  origenPermitido,
  VENTANA_CLAVE_MS,
  VENTANA_TOTAL_MS,
} from "./limite";

const h = (o: Record<string, string>) => new Headers(o);
const ip = (x: string) => h({ "x-forwarded-for": x });

describe("límite en memoria", () => {
  it("el 6.º en 10 minutos se rechaza con los segundos correctos y a los 10 minutos vuelve a pasar", () => {
    const l = crearLimite({ sal: "s" });
    const k = l.claveDeIp(ip("203.0.113.7"));
    for (let i = 0; i < MAX_POR_CLAVE; i++) expect(l.intentar(k, i * 1000)).toEqual({ permitido: true });
    expect(l.intentar(k, 60_000)).toEqual({ permitido: false, reintentarEnSegundos: 540 });
    expect(l.intentar(k, VENTANA_CLAVE_MS)).toEqual({ permitido: true });
  });

  it("IP distintas no se pisan", () => {
    const l = crearLimite({ sal: "s" });
    const a = l.claveDeIp(ip("203.0.113.7"));
    const b = l.claveDeIp(ip("203.0.113.8"));
    for (let i = 0; i < MAX_POR_CLAVE; i++) l.intentar(a, i);
    expect(l.intentar(a, 10).permitido).toBe(false);
    expect(l.intentar(b, 10).permitido).toBe(true);
  });

  it("el tope total corta en el envío 31", () => {
    const l = crearLimite({ sal: "s" });
    for (let i = 0; i < MAX_TOTAL; i++) {
      expect(l.intentar(l.claveDeIp(ip(`198.51.100.${i}`)), i).permitido).toBe(true);
    }
    const r = l.intentar(l.claveDeIp(ip("192.0.2.1")), 100);
    expect(r.permitido).toBe(false);
    if (!r.permitido) expect(r.reintentarEnSegundos).toBe(Math.ceil((VENTANA_TOTAL_MS - 100) / 1000));
  });

  it("la clave no contiene la IP en claro y cambia con la sal", () => {
    const h1 = ip("203.0.113.7");
    const k1 = crearLimite({ sal: "uno" }).claveDeIp(h1);
    const k2 = crearLimite({ sal: "dos" }).claveDeIp(h1);
    expect(k1).not.toContain("203.0.113.7");
    expect(k1).not.toBe(k2);
  });

  it("usa x-real-ip y después 'desconocida'", () => {
    const l = crearLimite({ sal: "s" });
    expect(l.claveDeIp(h({ "x-real-ip": "1.1.1.1" }))).toBe(l.claveDeIp(ip("1.1.1.1")));
    expect(l.claveDeIp(h({}))).toBe(l.claveDeIp(ip("desconocida")));
  });

  it("IPv6 del mismo /64 comparten el límite y otro /64 no", () => {
    const l = crearLimite({ sal: "s" });
    const a = l.claveDeIp(ip("2001:db8:1:2:aaaa::1"));
    expect(l.claveDeIp(ip("2001:db8:1:2:bbbb::9"))).toBe(a);
    expect(l.claveDeIp(ip("2001:db8:1:2::a"))).toBe(l.claveDeIp(ip("2001:0db8:1:2::b")));
    expect(l.claveDeIp(ip("2001:db8:1:3::a"))).not.toBe(a);
    for (let i = 0; i < MAX_POR_CLAVE; i++) l.intentar(l.claveDeIp(ip("2001:db8:1:2::a")), i);
    expect(l.intentar(l.claveDeIp(ip("2001:db8:1:2::b")), 10).permitido).toBe(false);
  });

  it("descontar devuelve el cupo", () => {
    const l = crearLimite({ sal: "s" });
    const k = l.claveDeIp(ip("203.0.113.7"));
    for (let i = 0; i < MAX_POR_CLAVE; i++) {
      l.intentar(k, 1000 + i);
      l.descontar(k, 1000 + i);
    }
    expect(l.intentar(k, 2000).permitido).toBe(true);
  });
});

describe("origenPermitido", () => {
  it("sin Origin, pasa", () => expect(origenPermitido(h({ host: "x.test" }))).toBe(true));
  it("mismo host, pasa", () =>
    expect(origenPermitido(h({ host: "x.test", origin: "https://x.test" }))).toBe(true));
  it("otro host, no", () =>
    expect(origenPermitido(h({ host: "x.test", origin: "https://otro.example" }))).toBe(false));
  it("Origin inválido, no", () => expect(origenPermitido(h({ host: "x.test", origin: "null" }))).toBe(false));
});
