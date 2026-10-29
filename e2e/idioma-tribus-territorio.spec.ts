import { expect, test, type Page } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";

// Las teselas satelitales son externas: los tests no dependen de ellas.
test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const html = (page: Page) => page.locator("html");
const ficha = (page: Page) => page.getByRole("complementary", { name: "Territory details" });
const NOTA = "Translated from Spanish";

test.describe("tribus en inglés", () => {
  test.use({ locale: "en-US" });

  test("listado: estados en inglés, nombres de las tribus sin traducir y nada de español suelto", async ({ page }) => {
    await page.goto("/tribus?ver=tribus");
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Lighthouse tribes" })).toBeVisible();
    await expect(page.getByText("Status: Active").first()).toBeVisible();
    await expect(page.getByText("Status: Forming").first()).toBeVisible();
    await expect(page.getByText("Status: Looking for a tribe").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Active tribes" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Vacant neighborhoods" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Valle Solar/ })).toBeVisible();
    await expect(page.locator('main [translate="no"]', { hasText: "Valle Solar" }).first()).toBeVisible();
    await expect(page.getByText("Contributes to the common pool:").first()).toBeVisible();
    await expect(page.getByText("Internal prototype · sample data").first()).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
    // Sin el aviso de "solo en español": la página ya está traducida.
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
  });

  test("ficha de Valle Solar: lo que tiene, lo que busca y el ritual en inglés; el nombre sigue igual", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByRole("heading", { level: 1, name: "Valle Solar" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "What it has" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "What it is looking for" })).toBeVisible();
    await expect(page.getByText("Vegetable garden")).toBeVisible();
    await expect(page.locator("summary", { hasText: "Solar energy" })).toBeVisible();
    await expect(page.getByText("Two calls, a weekend living together and the consent of the group.")).toBeVisible();
    await expect(page.getByText("Civil association")).toBeVisible();
    await expect(page.getByText("Funds pledged")).toBeVisible();
    await expect(page.getByText("USD 310,000 of USD 480,000")).toBeVisible();
    await expect(page.getByText("5 people from the network vouch for this tribe")).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("la declaración de la tribu se ve traducida con la nota del idioma original", async ({ page }) => {
    await page.goto("/tribus/valle");
    const encabezado = page.locator("main h1").locator("xpath=..");
    await expect(encabezado.getByText("Families who want to raise their children in community")).toBeVisible();
    await expect(encabezado.getByText(NOTA)).toBeVisible();
  });

  test("tribu en formación: el aviso y la etapa en inglés", async ({ page }) => {
    await page.goto("/tribus/monte");
    await expect(
      page.getByRole("note").filter({ hasText: "This community is forming" }),
    ).toContainText("(stage: Putting together its proposal)");
  });

  test("barrio vacante: título, necesidades y botón en inglés", async ({ page }) => {
    await page.goto("/tribus/grano");
    await expect(page.getByRole("heading", { level: 1, name: "Neighborhood 3 is looking for a tribe" })).toBeVisible();
    await expect(page.getByText("Extensive farming")).toBeVisible();
    await expect(page.getByText("Starting funds")).toBeVisible();
    await expect(page.getByRole("link", { name: "Propose a community" })).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("acciones de membresía: leer, adherir y la aceptación simulada, en inglés", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByRole("link", { name: "Read the tribe's manifesto" })).toBeVisible();
    await page.getByRole("link", { name: "Sign on to the tribe's manifesto" }).click();
    await expect(page).toHaveURL(/\/tribus\/valle\/manifiesto$/);
  });

  test("tribu inexistente: 404 en inglés sin aviso de sin traducir", async ({ page }) => {
    await page.goto("/tribus/no-existe");
    await expect(page.locator("[data-no-encontrada]")).toBeVisible();
    await expect(page.getByText("This page is only available in Spanish for now.")).not.toBeVisible();
  });
});

test.describe("manifiesto en inglés", () => {
  test.use({ locale: "en-US" });

  test("botones, ayudas y texto en inglés, con la nota de traducción visible", async ({ page }) => {
    await page.goto("/tribus/valle/manifiesto");
    await expect(page.getByRole("heading", { level: 1, name: "Valle Solar Manifesto" })).toBeVisible();
    await expect(page.getByText(NOTA)).toBeVisible();
    const texto = page.getByRole("region", { name: "Manifesto text" });
    await expect(texto).toContainText("We are families who want to raise our children in community");
    await expect(texto.getByRole("heading", { level: 2, name: "1. We look after the children and the grown-ups" })).toBeVisible();
    await expect(page.getByText("Version dated October 8, 2026")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Before signing on" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /I read the manifesto carefully/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign on" })).toBeDisabled();
    await expect(page.getByText(/To sign on you still need to reach the end of the text and tick both boxes\./)).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("adherir y la aceptación simulada, con los avisos en inglés y el foco en el aviso", async ({ page }) => {
    await page.goto("/tribus/valle/manifiesto");
    const texto = page.getByRole("region", { name: "Manifesto text" });
    await texto.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.getByRole("checkbox", { name: /I read the manifesto carefully/ }).check();
    await page.getByRole("checkbox", { name: /I commit to looking after these agreements/ }).check();
    await page.getByRole("button", { name: "Sign on" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Your request reached Valle Solar." })).toBeFocused();
    await page.getByRole("button", { name: "Simulate: the community accepts me" }).click();
    await expect(page.getByRole("status").filter({ hasText: "You are now part of Valle Solar." })).toBeVisible();
  });

  test("el manifiesto del Lighthouse también está traducido", async ({ page }) => {
    await page.goto("/tribus/lighthouse/manifiesto");
    await expect(page.getByRole("heading", { level: 1, name: "Lighthouse Coexistence Pact" })).toBeVisible();
    await expect(page.getByText(NOTA)).toBeVisible();
  });
});

test.describe("postulación en inglés", () => {
  test.use({ locale: "en-US" });

  test("el error aparece en inglés, asociado al campo, y el foco va a ese campo", async ({ page }) => {
    await page.goto("/tribus/grano/postular");
    await expect(page.getByRole("heading", { level: 1, name: "Propose a community for Neighborhood 3" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Requirements to apply/ })).toBeVisible();
    await page.getByRole("button", { name: "Send application (simulated)" }).click();
    const campo = page.getByLabel(/^Name of the community/);
    await expect(campo).toHaveAttribute("aria-invalid", "true");
    await expect(campo).toBeFocused();
    await expect(campo).toHaveAccessibleDescription("Write the name of the community");
    await expect(page.getByText("Choose the current or planned legal form")).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("enviar una postulación completa muestra la confirmación en inglés", async ({ page }) => {
    await page.goto("/tribus/grano/postular");
    await page.getByLabel(/^Name of the community/).fill("Los Álamos");
    await page.getByLabel(/^Person leading the application/).fill("Ana Ejemplo");
    await page.getByLabel(/^Contact for that person/).fill("sample contact");
    await page.getByLabel(/^Number of people/).fill("12");
    await page.getByLabel(/^Number of households/).fill("4");
    await page.getByLabel(/^What you will produce/).fill("Grains and flour");
    await page.getByLabel(/^What you would contribute/).fill("Flour for the common core");
    await page.getByLabel(/^Current or planned legal form/).selectOption("cooperativa");
    await page.getByLabel(/^How you make decisions/).fill("By consensus");
    await page.getByLabel(/^What your entry ritual/).fill("A work party");
    await page.getByLabel(/^The community's initial time/).fill("10 hours a week");
    await page.getByRole("button", { name: "Send application (simulated)" }).click();
    await expect(page.getByText("We received your application (simulated).")).toBeFocused();
    await expect(page.getByRole("link", { name: /Schedule a call/ })).toBeVisible();
  });
});

test.describe("territorio en inglés", () => {
  test.use({ locale: "en-US" });

  test("la vitrina, la leyenda y la ficha del resumen en inglés", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Lighthouse" })).toBeVisible();
    await expect(page.getByText("~993 ha, twelve neighborhoods and the tribes forming them.")).toBeVisible();
    const region = page.getByRole("region", { name: "Map of Macrolote 7" });
    await expect(region).toBeVisible();
    const leyenda = region.getByRole("group", { name: "Map legend" });
    await expect(leyenda.getByText("Neighborhood with an active tribe", { exact: true })).toBeVisible();
    await expect(leyenda.getByRole("list", { name: "Places of interest" })).toBeVisible();
    await expect(ficha(page).getByText("Choose a neighborhood, the common land or a plot on the map or in the list.")).toBeVisible();
    await expect(ficha(page).getByText("Vacant")).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("el estado administrativo (Ord. 173) sigue en español, marcado", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    const aviso = page.locator('main [lang="es"]').filter({ hasText: "Titular:" });
    await expect(aviso).toBeVisible();
    await expect(aviso.getByText("(only available in Spanish)")).toBeAttached();
  });

  test("lugar del mapa: nombre y descripción en inglés; Temazcal queda igual", async ({ page }) => {
    await page.goto("/territorios/lighthouse?sel=lugar-restaurant-coliving-cowork-sala-de-practicas-banos");
    await expect(ficha(page).getByRole("heading", { name: "Restaurant, coliving, cowork, practice room and restrooms" })).toBeVisible();
    await expect(ficha(page).getByText("Shared services: restaurant, coliving, coworking, practice room and restrooms (sample).")).toBeVisible();
    await page.goto("/territorios/lighthouse?sel=lugar-temazcal");
    await expect(ficha(page).getByRole("heading", { name: "Temazcal" })).toBeVisible();
    await expect(ficha(page).getByText("A space for gathering and ceremony (sample).")).toBeVisible();
  });

  test("un barrio con tribu: estado, hogares y lo que busca en inglés", async ({ page }) => {
    await page.goto("/territorios/lighthouse?sel=barrio-6");
    await expect(ficha(page).getByRole("heading", { name: "Valle Solar" })).toBeVisible();
    await expect(ficha(page).getByText("Status: Active")).toBeVisible();
    await expect(ficha(page).getByText("7 households · 18 people")).toBeVisible();
    await expect(ficha(page).getByText("Natural building")).toBeVisible();
    await expect(ficha(page).getByRole("link", { name: "Get to know the tribe" })).toBeVisible();
  });

  test("finca disponible en inglés", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await page.getByText(/Available Soluna plots/).click();
    await page.getByRole("button", { name: "Plot 502", exact: true }).click();
    await expect(ficha(page).getByRole("heading", { name: "Plot 502" })).toBeVisible();
    await expect(ficha(page).getByText("9,130 m²")).toBeVisible();
    await expect(ficha(page).getByText("Status: Available")).toBeVisible();
    await expect(ficha(page).getByText(/NetX acts as an agency/)).toBeVisible();
    await expect(ficha(page).getByRole("button", { name: "Ask about this plot" })).toBeVisible();
  });

  test("los marcadores del mapa tienen nombre accesible en inglés", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await expect(page.locator('[aria-label^="Neighborhood "]')).toHaveCount(12);
    await expect(page.locator('[aria-label="Neighborhood 3 · Looking for a tribe"]')).toHaveCount(1);
    await expect(page.locator('[aria-label="Neighborhood 6 · Valle Solar · Active"]')).toHaveCount(1);
    await expect(page.locator('[aria-label="Place of interest · Temazcal"]')).toHaveCount(1);
  });

  test("territorio inexistente: 404 en inglés", async ({ page }) => {
    await page.goto("/territorios/no-existe");
    await expect(page.locator("[data-no-encontrada]")).toBeVisible();
  });
});

test.describe("en español no cambia nada", () => {
  test("la ficha de Valle Solar no lleva ninguna nota de traducción", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByText("Familias que quieren criar en comunidad, con energía y agua propias.")).toBeVisible();
    await expect(page.getByText("Traducido del inglés")).toHaveCount(0);
    await expect(page.getByText(NOTA)).toHaveCount(0);
  });

  test("el manifiesto en español muestra el texto original sin nota", async ({ page }) => {
    await page.goto("/tribus/valle/manifiesto");
    await expect(page.getByRole("heading", { level: 1, name: "Manifiesto de Valle Solar" })).toBeVisible();
    await expect(page.getByText("Versión del 8 de octubre de 2026")).toBeVisible();
    await expect(page.getByText("Traducido del inglés")).toHaveCount(0);
    await expect(page.getByText(NOTA)).toHaveCount(0);
  });

  test("cambiar al inglés desde la página de la tribu traduce los datos sin cambiar la dirección", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByRole("heading", { level: 2, name: "Lo que tiene" })).toBeVisible();
    await page.goto("/tribus/valle?lang=en");
    await expect(page).toHaveURL(/\/tribus\/valle$/);
    await expect(page.getByRole("heading", { level: 2, name: "What it has" })).toBeVisible();
  });
});
