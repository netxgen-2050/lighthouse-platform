import AxeBuilder from "@axe-core/playwright";
import { EMAILS, expect, test, type Page } from "./fixtura";

// Sin el fixture de login: la persona no entró.
test.use({ rol: "ninguno" });

// Con Privy (previews y producción) "Entrar" abre el modal de Privy, no el panel "Entrar como…" de Sumarte: estos casos
// dependen del modo de prueba y se corren en el e2e local, que va sin Privy.
const CON_PRIVY = Boolean(process.env.BASE_URL || process.env.NEXT_PUBLIC_PRIVY_APP_ID);
const SIN_PRIVY = "Con Privy, Entrar abre el modal de Privy; este caso usa el panel Entrar como… del modo de prueba";

const barra =(page: Page) => page.getByRole("banner");
const rail = (page: Page) => page.getByRole("navigation", { name: "Principal" });

test.describe("páginas públicas sin sesión", () => {
  test("Territorio: se ve el mapa, la ficha lateral y el panel de tribus", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await expect(page.getByRole("heading", { name: "Mapa del Macrolote 7" })).toBeVisible();
    const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
    await expect(ficha).toBeVisible();
    await expect(ficha.getByRole("heading", { name: "Tribus del territorio" })).toBeVisible();
    await expect(ficha.getByRole("link", { name: "Sumate para adherir" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toHaveCount(0);
    await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
  });

  test("Inicio y Tribus se ven sin entrar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Encontrá tu tribu/ })).toBeVisible();
    await page.goto("/tribus?ver=tribus");
    await expect(page.getByRole("heading", { level: 1, name: "Tribus del Lighthouse" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para proponer una comunidad" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Proponer una comunidad para el Barrio/ })).toHaveCount(0);
  });

  test("Sumarte es público y las páginas internas llevan a Sumarte con el aviso del plan que las habilita", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await page.goto("/pactos");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(page.getByText("Pactos se habilita con el plan Miembro.")).toBeVisible();
    await page.goto("/tribus/valle/postular");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(page.getByText("se habilita al sumarte gratis como Explorador.")).toBeVisible();
  });

  test("Adherir sin cuenta: se lee el manifiesto y en lugar de Adherir hay un llamado a sumarse", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByRole("link", { name: "Leer el manifiesto de la tribu" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para adherir" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toHaveCount(0);

    await page.getByRole("link", { name: "Leer el manifiesto de la tribu" }).click();
    await expect(page).toHaveURL(/\/tribus\/valle\/manifiesto$/);
    await expect(page.getByRole("region", { name: "Texto del manifiesto" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para adherir" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Adherir", exact: true })).toHaveCount(0);
  });

  test("Consultar por un lote sin cuenta: aparece el llamado a sumarse", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await page.getByText(/Fincas disponibles de Soluna/).click();
    await page.getByRole("button", { name: /^Finca / }).first().click();
    const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
    await expect(ficha.getByRole("link", { name: "Sumate para consultar por este lote" })).toBeVisible();
    await expect(ficha.getByRole("button", { name: "Consultar por este lote", exact: true })).toHaveCount(0);
  });

  test("un barrio vacante pide sumarse para proponer una comunidad", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await page.getByRole("button", { name: /^Barrio \d+$/ }).first().click();
    const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
    await expect(ficha).toBeVisible();
    // El botón "Barrio N" a secas es el de un barrio vacante (los que tienen tribu llevan su nombre).
    await expect(ficha.getByRole("link", { name: "Sumate para proponer una comunidad" })).toBeVisible();
    await expect(ficha.getByRole("link", { name: "Conocer la tribu" })).toHaveCount(0);
  });
});

test.describe("navegación sin sesión", () => {
  test("el rail muestra Descubrir y Sumarte completos y el resto deshabilitado con 'Sumate…'", async ({ page }) => {
    await page.goto("/");
    for (const nombre of ["Inicio", "Territorio", "Tribus", "Sumarte"]) {
      await expect(rail(page).getByRole("link", { name: nombre, exact: true })).toBeVisible();
    }
    await expect(rail(page).getByRole("link", { name: "Compromisos", exact: true })).toHaveCount(0);
    await expect(rail(page).getByRole("link", { name: "Sumate para participar: Compromisos" })).toHaveCount(0);
    for (const nombre of ["Pactos", "Semillas", "Fogón"]) {
      const bloqueado = rail(page).getByRole("link", { name: nombre, exact: true });
      await expect(bloqueado).toHaveAttribute("aria-disabled", "true");
      await expect(bloqueado).not.toHaveAttribute("href", /.*/);
      await expect(rail(page).getByRole("link", { name: `Sumate para participar: ${nombre}` })).toBeVisible();
    }
    // Congreso se abrió sin cuenta (decisión de Gus, 14-oct): la vitrina se ve; vincular el ticket sí pide cuenta.
    const congreso = rail(page).getByRole("link", { name: "Congreso", exact: true });
    await expect(congreso).toHaveAttribute("href", "/congreso");
    await expect(congreso).not.toHaveAttribute("aria-disabled", "true");
    await expect(rail(page).getByRole("link", { name: "Sumate gratis para usar esto: Congreso" })).toHaveCount(0);
    await expect(rail(page).getByRole("link", { name: "Inicio", exact: true })).not.toHaveAttribute("aria-disabled", "true");
    // Un destino deshabilitado no navega: el enlace de ayuda lleva a Sumarte y vuelve a ese destino al sumarse.
    await rail(page).getByRole("link", { name: "Sumate para participar: Pactos" }).click();
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fpactos$/);
    await expect(page.getByText("Pactos se habilita con el plan Miembro.")).toBeVisible();
  });

  test("la barra superior muestra Sumarte y Entrar; Reportar aparece y Hifa no, sin cuenta", async ({ page }) => {
    await page.goto("/");
    await expect(barra(page).getByRole("link", { name: "Sumarte" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toHaveCount(0);
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reportar un problema o una idea" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hablar con Hifa" })).toHaveCount(0);
  });

  test("Entrar lleva a Sumarte con Entrar como… y, al entrar, la persona vuelve a donde estaba", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/tribus/valle");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Ftribus%2Fvalle/);
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    await expect(page).toHaveURL(/\/tribus\/valle$/);
    await expect(page.getByRole("heading", { level: 1, name: "Valle Solar" })).toBeVisible();
  });

  test("Sumate para consultar por este lote: al sumarse vuelve a la misma finca elegida", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/territorios/lighthouse");
    await page.getByText(/Fincas disponibles de Soluna/).click();
    await page.getByRole("button", { name: /^Finca / }).first().click();
    const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
    const titulo = await ficha.getByRole("heading", { level: 2 }).first().innerText();
    await ficha.getByRole("link", { name: "Sumate para consultar por este lote" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page).toHaveURL(/\/territorios\/lighthouse\?sel=/);
    await expect(ficha.getByRole("heading", { level: 2, name: titulo })).toBeVisible();
    await expect(ficha.getByRole("button", { name: "Consultar por este lote", exact: true })).toBeVisible();
  });
});

test.describe("vincular el ticket del Congreso pide cuenta", () => {
  test("sin cuenta: el llamado lleva a Sumarte y, al sumarse, vuelve a /congreso#ticket con el formulario", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/congreso#ticket");
    await expect(page.getByLabel(/Código de tu ticket/)).toHaveCount(0);
    await page.getByRole("link", { name: "Sumate gratis para vincular tu ticket" }).click();
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fcongreso%23ticket&para=explorador$/);
    await expect(page.getByText("Esta acción se habilita al sumarte gratis como Explorador.")).toBeVisible();
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page).toHaveURL(/\/congreso#ticket$/);
    await expect(page.getByLabel(/Código de tu ticket/)).toBeVisible();
  });
});

test.describe("vincular el ticket con la política pendiente", () => {
  // Una persona Explorador que todavía no aceptó la política de privacidad vigente.
  test.use({ rol: "persona", plan: "explorador", consentimiento: "ninguno" });

  test("acepta la política en Sumarte y vuelve a /congreso#ticket con el formulario", async ({ page }) => {
    await page.goto("/congreso#ticket");
    await expect(page.getByLabel(/Código de tu ticket/)).toHaveCount(0);
    await page.getByRole("link", { name: "Aceptá la política de privacidad para vincular tu ticket" }).click();
    await page.getByRole("checkbox", { name: /Leí y acepto la política de privacidad/ }).check();
    await page.getByRole("checkbox", { name: /Acepto los términos de uso del prototipo/ }).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page).toHaveURL(/\/congreso#ticket$/);
    await expect(page.getByLabel(/Código de tu ticket/)).toBeVisible();
  });
});

test.describe("sin datos guardados sin sesión", () => {
  // La fixture siembra el consentimiento de los emails de prueba: acá nada debe quedar guardado.
  test.use({ consentimiento: "ninguno" });

  test("recorrer las páginas públicas no crea claves en el navegador", async ({ page }) => {
    for (const ruta of ["/", "/territorios/lighthouse", "/tribus", "/tribus/valle", "/tribus/valle/manifiesto", "/sumarte"]) {
      await page.goto(ruta);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
    }
    // Se elige algo en el mapa y se cambia la facturación de Sumarte: tampoco se guarda.
    await page.goto("/territorios/lighthouse");
    await page.getByRole("button", { name: /^Barrio \d+/ }).first().click();
    await page.goto("/sumarte");
    await page.getByRole("button", { name: /^Mensual/ }).click();
    const claves = await page.evaluate(() => Object.keys(window.localStorage));
    // Con Privy el SDK guarda sus propias claves (privy:…, base-acc-sdk.store, etc.): no son de la app ni de una persona.
    const deLaApp = claves.filter((c) => !/^privy[:.]|^base-acc-sdk|^walletconnect|^wc@|^WCM_|^-walletlink/i.test(c));
    expect(deLaApp.filter((c) => c.startsWith("u:") || c.startsWith("lh-bitacora") || c.startsWith("lh-hifa"))).toEqual([]);
    expect(deLaApp).toEqual([]);
  });
});

test.describe("accesibilidad sin sesión", () => {
  for (const ruta of ["/", "/territorios/lighthouse", "/tribus", "/tribus/valle", "/tribus/valle/manifiesto"]) {
    test(`axe sin violaciones serias o críticas en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
      await expect(page.locator("main")).toHaveCount(1);
      const r = await new AxeBuilder({ page }).analyze();
      expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });
  }
});
