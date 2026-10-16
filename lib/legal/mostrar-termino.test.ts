import { describe, expect, it } from "vitest";
import { huella } from "@/lib/demo/bitacora";
import { entradaBitacoraTermino, terminoMostrado } from "./mostrar-termino";
import { TERMINOS, terminoEn } from "./terminos";

describe("terminoMostrado", () => {
  it("en español es lo de siempre", () => {
    const m = terminoMostrado("ticket");
    expect(m.titulo).toBe(TERMINOS.ticket.titulo);
    expect(m.etiqueta).toBe(`Qué significa legalmente: ${TERMINOS.ticket.titulo}`);
    expect(m.textoBorrador).toBe("Borrador: texto a revisar");
    expect(m.aviso).toBeUndefined();
    expect(m.langTexto).toBeUndefined();
  });

  it("en inglés, con versión en inglés: la muestra como borrador", () => {
    const m = terminoMostrado("ticket", "en");
    expect(m.titulo).toBe(terminoEn("ticket")!.titulo);
    expect(m.idioma).toBe("en");
    expect(m.borrador).toBe(true);
    expect(m.textoBorrador).toBe("Draft: text under review");
    expect(m.etiqueta).toMatch(/^What it means legally: /);
  });

  it("en inglés, sin versión en inglés: el español, avisado y con lang es", () => {
    const m = terminoMostrado("ritual", "en");
    expect(m.titulo).toBe(TERMINOS.ritual.titulo);
    expect(m.idioma).toBe("es");
    expect(m.langTexto).toBe("es");
    expect(m.aviso?.texto).toBe("Only available in Spanish");
  });
});

describe("entradaBitacoraTermino", () => {
  it("en español: idioma es y el borrador del catálogo", () => {
    const e = entradaBitacoraTermino("ticket");
    expect(e).toMatchObject({ tipo: "termino-legal", clave: "ticket", idioma: "es", borrador: false });
    expect(e.huella).toBe(huella(TERMINOS.ticket.titulo, TERMINOS.ticket.texto));
  });

  it("en inglés con inglés: idioma en, borrador true aunque el español no lo sea, huella del texto en inglés", () => {
    for (const clave of ["ticket", "presencia", "obra", "encuentroeducativo"] as const) {
      const en = terminoEn(clave)!;
      const e = entradaBitacoraTermino(clave, "en");
      expect(e.idioma).toBe("en");
      expect(e.borrador).toBe(true);
      expect(e.mostrado).toBe(en.titulo);
      expect(e.huella).toBe(huella(en.titulo, en.texto));
    }
  });

  it("en inglés sin inglés: se anota como es, con el borrador del español", () => {
    const e = entradaBitacoraTermino("ritual", "en");
    expect(e.idioma).toBe("es");
    expect(e.borrador).toBe(false);
    expect(e.mostrado).toBe(TERMINOS.ritual.titulo);
  });
});
