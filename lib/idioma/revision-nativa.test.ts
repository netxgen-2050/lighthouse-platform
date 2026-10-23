import { expect, test } from "vitest";
import { fuentesObligatorias, listaPendientes, REVISION_NATIVA, type Revision } from "./revision-nativa";

test("todo diccionario y el glosario están anotados en la revisión nativa", () => {
  for (const fuente of fuentesObligatorias()) {
    expect(REVISION_NATIVA[fuente], `"${fuente}" no está anotado en lib/idioma/revision-nativa.ts`).toBeDefined();
  }
});

test("lo revisado trae quién y cuándo", () => {
  for (const [fuente, r] of Object.entries(REVISION_NATIVA)) {
    if (r.estado === "revisado") {
      expect(r.revisadoPor, fuente).toBeTruthy();
      expect(r.fecha, fuente).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test("la lista deja afuera lo revisado", () => {
  const prueba: Record<string, Revision> = {
    "textos/a": { estado: "pendiente", que: "A" },
    "textos/b": { estado: "revisado", que: "B", revisadoPor: "Ana", fecha: "2026-11-01" },
  };
  const lista = listaPendientes(prueba);
  expect(lista).toContain("`textos/a`");
  expect(lista).not.toContain("`textos/b`");
});

test("la lista versionada en docs/idioma/revisar-nativo.md está al día", async () => {
  await expect(listaPendientes()).toMatchFileSnapshot("../../docs/idioma/revisar-nativo.md");
});
