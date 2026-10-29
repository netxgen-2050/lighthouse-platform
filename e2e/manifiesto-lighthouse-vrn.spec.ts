import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { conAdhesionAlManifiesto } from "./ayudas";
import { nombreDelComun } from "../lib/manifiestos/lighthouse-vrn";

const COMUN = nombreDelComun("es");
const COMUN_EN = nombreDelComun("en");

const LEYO = "Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas";
const CUIDAR = "Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos";

async function alFinal(page: Page) {
  await page.getByRole("region", { name: "Texto del manifiesto" }).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
}

async function adherir(page: Page) {
  await page.goto("/tribus/lighthouse/manifiesto");
  await alFinal(page);
  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
}

const decision = (page: Page, titulo: string) =>
  page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: titulo }) });

test.describe("la ficha del común", () => {
  test("desde /tribus, con el teclado, se llega a la ficha con el nombre y el propósito", async ({ page }) => {
    await page.goto("/tribus");
    const tarjeta = page.getByRole("link", { name: new RegExp(COMUN) });
    await tarjeta.focus();
    await expect(tarjeta).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/tribus\/lighthouse$/);
    await expect(page.getByRole("heading", { level: 1, name: COMUN })).toBeVisible();
    await expect(page.getByText(/Ponemos la regeneración y la vida en el centro de cada decisión/).first()).toBeVisible();
    await expect(page.getByText("Es la meta-tribu de la que forman parte todas las tribus.")).toBeVisible();
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    await expect(page.getByText("Borrador, a ratificar por el común").first()).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("los cinco grupos de principios están a la vista, con su práctica", async ({ page }) => {
    await page.goto("/tribus/lighthouse");
    for (const g of ["Tierra", "Agua", "Comunidad", "Economía", "Generaciones futuras"]) {
      await expect(page.getByRole("heading", { level: 3, name: g, exact: true })).toBeVisible();
    }
    await expect(page.getByText("La vida en el centro", { exact: true })).toBeVisible();
    await expect(page.getByText(/Suelo cubierto todo el año/)).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Derechos de la tierra/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Qué significa legalmente: Derechos de la tierra" })).toBeVisible();
  });

  test("los equipos transversales son los círculos del común y enlazan a la gobernanza", async ({ page }) => {
    await page.goto("/tribus/lighthouse");
    const equipos = page.getByRole("region", { name: "Equipos transversales: una startup para el procomún" });
    for (const n of [
      "Legal",
      "Permacultura y regeneración",
      "Marketing y comunicación",
      "Tecnología",
      "Gestión de contratistas",
      "Gobernanza",
      "Cuidado y conflictos",
      "Agua",
      "Tokenomics y Semillas",
    ]) {
      await expect(equipos.getByText(n, { exact: true })).toBeVisible();
    }
    await equipos.getByRole("link", { name: "Ver cómo decidimos" }).click();
    await expect(page).toHaveURL(/\/fogon\/gobernanza$/);
    await expect(page.getByRole("img", { name: /Dibujo de la estructura/ })).toBeVisible();
  });

  test("sin adhesión lo dice en texto y ofrece leer y adherir; con adhesión dice que adheriste", async ({ page }) => {
    await page.goto("/tribus/lighthouse");
    await expect(page.getByText(/Todavía no adheriste al manifiesto\. Sin adhesión podés mirar la gobernanza, pero no participar\./)).toBeVisible();
    await expect(page.getByRole("link", { name: "Leer el manifiesto de Lighthouse VRN" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de Lighthouse VRN" })).toBeVisible();

    await adherir(page);
    await page.goto("/tribus/lighthouse");
    await expect(page.getByText("Adheriste al manifiesto de Lighthouse VRN. Ya podés participar en la gobernanza.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de Lighthouse VRN" })).toHaveCount(0);
  });
});

test.describe("leer y adherir", () => {
  test("lectura completa: todas las secciones, 'cómo se cambia' con enlace al Fogón y sin botón para cambiarlo", async ({ page }) => {
    await page.goto("/tribus/lighthouse/manifiesto");
    await expect(page.getByRole("heading", { level: 1, name: "Manifiesto de Lighthouse VRN" })).toBeVisible();
    const texto = page.getByRole("region", { name: "Texto del manifiesto" });
    for (const h of [
      "Propósito",
      /^Principios$/,
      /^Derechos de la tierra/,
      "Compromisos de quien adhiere",
      "Cómo se cambia este manifiesto",
      "Los principios de cada tribu",
      "Las máquinas sugieren; las personas deciden",
    ]) {
      await expect(texto.getByRole("heading", { name: h })).toBeAttached();
    }
    await expect(texto.getByRole("link", { name: "Ir al Fogón" })).toHaveAttribute("href", "/fogon");
    await expect(page.getByRole("button", { name: /cambiar|ratificar|votar el manifiesto/i })).toHaveCount(0);
  });

  test("'Adherir' sigue deshabilitado hasta el final del texto y las dos casillas", async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 500 });
    await page.goto("/tribus/lighthouse/manifiesto");
    const boton = page.getByRole("button", { name: "Adherir", exact: true });
    await expect(boton).toBeDisabled();
    await page.getByLabel(LEYO).check();
    await page.getByLabel(CUIDAR).check();
    await expect(boton).toBeDisabled();
    await alFinal(page);
    await expect(boton).toBeEnabled();
  });

  test("adherir y ver el estado después de recargar, y volver a la ficha", async ({ page }) => {
    await adherir(page);
    await expect(page.getByText(/Adheriste al manifiesto de Lighthouse VRN/).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(/Adheriste al manifiesto de Lighthouse VRN/).first()).toBeVisible();
    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/tribus\/lighthouse$/);
    await expect(page.getByText("Adheriste al manifiesto de Lighthouse VRN. Ya podés participar en la gobernanza.")).toBeVisible();
  });

  test("el enlace de arriba también vuelve a la ficha", async ({ page }) => {
    await page.goto("/tribus/lighthouse/manifiesto");
    await page.getByRole("link", { name: new RegExp(`← ${COMUN}`) }).click();
    await expect(page).toHaveURL(/\/tribus\/lighthouse$/);
  });
});

test.describe("cuando el manifiesto cambia de versión", () => {
  test("quien adhirió a otra versión tiene que volver a adherir para participar", async ({ page }) => {
    await conAdhesionAlManifiesto(page, "2026-01-01-borrador");
    await page.goto("/fogon");
    const huerta = decision(page, "Plan de huerta comunitaria 2027");
    await expect(huerta.getByText("El manifiesto cambió de versión: volvé a adherir para participar")).toBeVisible();
    await expect(page.getByRole("button", { name: "Votar" })).toHaveCount(0);

    await page.goto("/tribus/lighthouse");
    await expect(page.getByText(/El manifiesto cambió de versión desde que adheriste/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de Lighthouse VRN" })).toBeVisible();

    await page.goto("/tribus/lighthouse/manifiesto");
    await expect(page.getByText(/volvé a leerlo y a adherir/)).toBeVisible();
    await alFinal(page);
    await page.getByLabel(LEYO).check();
    await page.getByLabel(CUIDAR).check();
    await page.getByRole("button", { name: "Adherir", exact: true }).click();

    await page.goto("/fogon");
    await expect(decision(page, "Plan de huerta comunitaria 2027").getByRole("button", { name: "Votar" })).toBeVisible();
  });
});

test.describe("sin adhesión se mira pero no se participa", () => {
  test("en el Fogón: ni 'Votar' ni 'Llevar al consejo', el aviso con el enlace y los votos de ejemplo", async ({ page }) => {
    await page.addInitScript(() => {
      // Líder de Valle Solar: sin adhesión tampoco puede llevar la decisión al consejo.
      window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", tribu: true, tribuId: "valle" }));
    });
    await page.goto("/fogon");
    await expect(page.getByRole("heading", { level: 1, name: "Lo que se está decidiendo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Votar" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Llevar al consejo" })).toHaveCount(0);
    const huerta = decision(page, "Plan de huerta comunitaria 2027");
    await expect(huerta.getByText("Para participar, adherí al manifiesto de Lighthouse VRN")).toBeVisible();
    await expect(huerta.getByRole("link", { name: "Leer y adherir" })).toHaveAttribute("href", "/tribus/lighthouse/manifiesto");
    await expect(huerta.getByRole("button", { name: "Qué significa legalmente: Adherir para participar" })).toBeVisible();
    await expect(huerta.getByText(/Votos de ejemplo:/)).toBeVisible();
  });

  test("un solo motivo aunque falte también el Pase: el de la adhesión", async ({ page }) => {
    await page.goto("/fogon");
    const presupuesto = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /fondo común/i }) }).first();
    await expect(presupuesto.getByText("Votan quienes tienen el Pase Fundador")).toHaveCount(0);
    await expect(page.getByText("Votan quienes tienen el Pase Fundador")).toHaveCount(0);
    await expect(page.getByText("Para participar, adherí al manifiesto de Lighthouse VRN").first()).toBeVisible();
  });

  test("en una consulta: se ven opciones y resultados, pero no +/- ni 'Guardar', y sí el aviso", async ({ page }) => {
    await page.goto("/fogon/consultas/u1");
    await expect(page.getByRole("region", { name: "Mi reparto" })).toBeVisible();
    await expect(page.getByText("Para participar, adherí al manifiesto de Lighthouse VRN")).toBeVisible();
    await expect(page.getByRole("link", { name: "Leer y adherir" })).toHaveAttribute("href", "/tribus/lighthouse/manifiesto");
    await expect(page.getByRole("button", { name: /^Sumar un voto a / })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Quitar un voto a / })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Guardar mi reparto" })).toHaveCount(0);
  });

  test("después de adherir ya se ve 'Votar'", async ({ page }) => {
    await adherir(page);
    await page.goto("/fogon");
    await expect(decision(page, "Plan de huerta comunitaria 2027").getByRole("button", { name: "Votar" })).toBeVisible();
    await expect(page.getByText("Para participar, adherí al manifiesto de Lighthouse VRN")).toHaveCount(0);
  });

  test("axe en /fogon sin adhesión y en una consulta sin adhesión", async ({ page }) => {
    for (const ruta of ["/fogon", "/fogon/consultas/u1"]) {
      await page.goto(ruta);
      await expect(page.getByText("Para participar, adherí al manifiesto de Lighthouse VRN").first()).toBeVisible();
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(graves.map((v) => `${ruta} ${v.id}: ${v.help}`)).toEqual([]);
    }
  });
});

test.describe("con adhesión se participa", () => {
  test("se puede votar y repartir créditos", async ({ page }) => {
    await conAdhesionAlManifiesto(page);
    await page.goto("/fogon");
    await expect(page.getByRole("button", { name: "Votar" }).first()).toBeVisible();
    await expect(page.getByText("Para participar, adherí al manifiesto de Lighthouse VRN")).toHaveCount(0);
    await page.goto("/fogon/consultas/u1");
    await expect(page.getByRole("button", { name: /^Sumar un voto a / }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Guardar mi reparto" })).toBeVisible();
  });
});

test.describe("principios propios de las tribus", () => {
  test("Semilla Viva suma los suyos, con el principio que profundiza y el enlace al común", async ({ page }) => {
    await page.goto("/tribus/semilla/manifiesto");
    const texto = page.getByRole("region", { name: "Texto del manifiesto" });
    await expect(texto.getByRole("heading", { name: "Suma a los principios de Lighthouse VRN" })).toBeVisible();
    await expect(texto.getByText("Las semillas son libres")).toBeVisible();
    await expect(texto.getByText("Profundiza: Suelo vivo, La tierra del común no es mercancía")).toBeVisible();
    await expect(texto.getByRole("link", { name: "Leer el manifiesto de Lighthouse VRN" })).toHaveAttribute(
      "href",
      "/tribus/lighthouse/manifiesto",
    );
  });

  test("Taller Común todavía no sumó principios propios", async ({ page }) => {
    await page.goto("/tribus/taller/manifiesto");
    const texto = page.getByRole("region", { name: "Texto del manifiesto" });
    await expect(texto.getByText("Esta tribu todavía no sumó principios propios.")).toBeVisible();
    await expect(texto.getByRole("link", { name: "Leer el manifiesto de Lighthouse VRN" })).toBeVisible();
  });
});

test.describe("Vista NetX y Sumarte", () => {
  test("Juego A o Juego B trae el bloque con la vida en el centro: 15 principios y el enlace", async ({ page }) => {
    await page.goto("/netx/financiamiento");
    const bloque = page.getByRole("group", { name: "Las decisiones, con la vida en el centro" });
    await expect(bloque).toBeVisible();
    await expect(bloque.getByText(/Ponemos la regeneración y la vida en el centro de cada decisión/)).toBeVisible();
    await expect(bloque.getByText("15 principios en total")).toBeVisible();
    await expect(bloque.getByText("Tierra: 4 principios")).toBeVisible();
    await expect(bloque.getByText("Generaciones futuras: 2 principios")).toBeVisible();
    await expect(bloque.getByText("Borrador, a ratificar por el común")).toBeVisible();
    await expect(bloque.getByRole("link", { name: "Ver el manifiesto de Lighthouse VRN" })).toHaveAttribute("href", "/tribus/lighthouse");
  });

  test("/sumarte no muestra el manifiesto, sus principios ni el aviso de adhesión", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const texto = await page.locator("main").innerText();
    expect(texto).not.toMatch(/Lighthouse VRN|manifiesto de|Para participar, adherí/i);
  });
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("la ficha, la lectura y el nombre salen en inglés, con una sola nota de traducción", async ({ page }) => {
    await page.goto("/tribus");
    await page.getByRole("link", { name: new RegExp(COMUN_EN) }).click();
    await expect(page).toHaveURL(/\/tribus\/lighthouse$/);
    await expect(page.getByRole("heading", { level: 1, name: COMUN_EN })).toBeVisible();
    await expect(page.getByText(/We put regeneration and life at the center of every decision/).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Future generations" })).toBeVisible();
    await expect(page.getByText("Translated from Spanish")).toHaveCount(1);

    await page.goto("/tribus/lighthouse/manifiesto");
    await expect(page.getByRole("heading", { level: 1, name: "Lighthouse VRN Manifesto" })).toBeVisible();
    await expect(page.getByText("Translated from Spanish")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "How this manifesto is changed" })).toBeAttached();
  });

  test("en el Fogón, sin adhesión, el aviso sale en inglés", async ({ page }) => {
    await page.goto("/fogon");
    await expect(page.getByText("To take part, sign on to the Lighthouse VRN manifesto").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Read and sign on" }).first()).toBeVisible();
  });
});
