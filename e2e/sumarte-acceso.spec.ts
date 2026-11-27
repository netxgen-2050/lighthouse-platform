import AxeBuilder from "@axe-core/playwright";
import { abrirModoDePrueba, aceptarPaso } from "./ayudas";
import { COOKIE_PRUEBA, EMAILS, expect, test, type Page } from "./fixtura";

// Con Privy (previews y producción) elegir un plan abre el modal de Privy: los casos que usan "Entrar como…" van en el e2e local.
const CON_PRIVY = Boolean(process.env.BASE_URL || process.env.NEXT_PUBLIC_PRIVY_APP_ID);
const SIN_PRIVY = "Con Privy, elegir un plan abre el modal de Privy; este caso usa el panel Entrar como… del modo de prueba";

const rail = (page: Page) => page.getByRole("navigation", { name: "Principal" });
const barra = (page: Page) => page.getByRole("banner");
const PARTICIPAR = ["Pactos", "Semillas", "Fogón"];

// Pactos, Semillas, Fogón y Compromisos salieron del menú (rediseño de cinco destinos, 23-nov-2026): el rail ya no los ofrece
// ni los muestra bloqueados, tenga el plan que tenga. Lo que sigue decidiendo el plan es el acceso por la dirección
// (ver "abrir una página de Participar por dirección lleva a Sumarte"). Los helpers conservan el nombre de la regla vieja.
async function fueraDelMenu(page: Page, nombres: string[]) {
  await expect(rail(page).locator('[aria-disabled="true"]')).toHaveCount(0);
  for (const nombre of [...nombres, "Compromisos"]) {
    await expect(rail(page).getByRole("link", { name: nombre, exact: true })).toHaveCount(0);
    await expect(rail(page).getByRole("link", { name: `Sumate para participar: ${nombre}` })).toHaveCount(0);
  }
}

async function deshabilitados(page: Page, nombres: string[]) {
  await fueraDelMenu(page, nombres);
}

async function habilitados(page: Page, nombres: string[]) {
  const fuera = nombres.filter((n) => PARTICIPAR.includes(n));
  await fueraDelMenu(page, fuera);
  for (const nombre of nombres.filter((n) => !PARTICIPAR.includes(n))) {
    const destino = rail(page).getByRole("link", { name: nombre, exact: true });
    await expect(destino).toHaveAttribute("href", /^\//);
    await expect(destino).not.toHaveAttribute("aria-disabled", "true");
  }
}

test.describe("sumarse desde Sumarte", () => {
  test.use({ rol: "ninguno" });

  test("sumarse gratis: queda como Explorador y ve habilitados Hifa y Comunidades", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte?plan=explorador");
    await expect(page.getByText("Todavía no te sumaste: elegí un plan.")).toBeVisible();
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page);
    await abrirModoDePrueba(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    await habilitados(page, ["Explorar", "Bien común", "Sumarte"]);
    await expect(page.getByRole("button", { name: "Hablar con Hifa" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reportar un problema o una idea" })).toBeVisible();
    await deshabilitados(page, PARTICIPAR);
  });

  test("volver después de sumarse: /pactos lleva a Sumarte con el aviso y, como Amigo, vuelve a /pactos", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/pactos");
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fpactos$/);
    await expect(page.getByText("Pactos se habilita con el plan Amigo.")).toBeVisible();
    await page.getByRole("button", { name: "Hacerme Amigo" }).click();
    await aceptarPaso(page);
    await abrirModoDePrueba(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page).toHaveURL(/\/pactos$/);
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
    await habilitados(page, PARTICIPAR);
  });

  test("Aliados sin cuenta pide entrar: no se elige con un plan ni deja a nadie con un nivel nuevo", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Hablemos" }).click();
    await aceptarPaso(page);
    await abrirModoDePrueba(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
    await expect(page.getByRole("button", { name: "Hablemos" })).toBeVisible();
  });

  test("axe sin violaciones serias o críticas en Sumarte con el aviso", async ({ page }) => {
    await page.goto("/pactos");
    await expect(page.getByText("Pactos se habilita con el plan Amigo.")).toBeVisible();
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});

test.describe("acceso abierto", () => {
  test.use({ rol: "ninguno" });

  test("una persona que no está en LH_PERSONAS entra como Explorador", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent("nueva@prueba.test"), url: baseURL! }]);
    await page.goto("/");
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    await habilitados(page, ["Explorar"]);
    await deshabilitados(page, PARTICIPAR);
  });
});

test.describe("Explorador", () => {
  test.use({ rol: "persona", plan: "explorador" });

  test("el rail no ofrece Participar ni lo muestra bloqueado, y deja Explorar y Sumarte habilitados", async ({ page }) => {
    await page.goto("/");
    await deshabilitados(page, PARTICIPAR);
    await habilitados(page, ["Explorar", "Sumarte"]);
  });

  test("abrir una página de Participar por dirección lleva a Sumarte con el aviso", async ({ page }) => {
    await page.goto("/semillas");
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fsemillas$/);
    await expect(page.getByText("Semillas se habilita con el plan Amigo.")).toBeVisible();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
  });

  test("la voz no se compra: un Explorador adhiere sin que le pidan un plan pago", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByRole("link", { name: "Sumate para adherir" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la comunidad" })).toBeVisible();
    await page.goto("/tribus/lighthouse");
    await expect(page.getByRole("link", { name: "Sumate para adherir" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de Lighthouse VRN" })).toBeVisible();
  });

  test("Invertir no depende de ningún plan: un Explorador abre /invertir", async ({ page }) => {
    await page.goto("/invertir");
    await expect(page).toHaveURL(/\/invertir$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("subir a Amigo habilita Participar por la dirección de inmediato y bajar a Explorador lo vuelve a pedir", async ({ page }) => {
    await page.goto("/sumarte?plan=amigo");
    await page.getByRole("button", { name: "Hacerme Amigo" }).click();
    await page.goto("/semillas");
    await expect(page).toHaveURL(/\/semillas$/);
    await page.goto("/sumarte?plan=explorador");
    await page.getByRole("button", { name: "Volver a Explorador" }).click();
    await page.goto("/semillas");
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fsemillas$/);
  });

  test("axe sin violaciones serias o críticas en el rail", async ({ page }) => {
    await page.goto("/");
    await deshabilitados(page, PARTICIPAR);
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});

test.describe("Amigo", () => {
  test.use({ rol: "persona" });

  test("Participar está habilitado y Fundador también habilita", async ({ page }) => {
    await page.goto("/");
    await habilitados(page, PARTICIPAR);
    await page.goto("/sumarte?plan=explorador");
    await page.getByRole("button", { name: "Volver a Explorador" }).click();
    await deshabilitados(page, PARTICIPAR);
    await page.getByRole("button", { name: "Quiero ser Fundador" }).click();
    await habilitados(page, PARTICIPAR);
  });
});

test.describe("Aliado (estado guardado del Plan Tribu)", () => {
  test.use({ rol: "persona" });

  test("un Plan Tribu guardado pasa a Aliado y deja de serlo al cambiar de plan", async ({ page }) => {
    await page.goto("/sumarte");
    await page.evaluate(() => window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", tribu: true, tribuId: "valle" })));
    await page.reload();
    await expect(page.getByText("Tu plan actual:")).toContainText("Aliado");
    await habilitados(page, PARTICIPAR);
    await page.goto("/tribus/valle");
    await expect(page.getByRole("main").getByText("Admin de Valle Solar")).toBeVisible();
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Hacerme Amigo" }).click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Amigo");
    await page.goto("/tribus/valle");
    await expect(page.getByText("Admin de Valle Solar")).toHaveCount(0);
  });
});

test.describe("Super admin", () => {
  // Sin plan elegido en Sumarte: el nivel sale solo de LH_PERSONAS.
  test.use({ rol: "superadmin", plan: "ninguno" });

  test("ve NetX y tiene acceso a todo", async ({ page }) => {
    await page.goto("/");
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toBeVisible();
    await habilitados(page, PARTICIPAR);
    await page.goto("/pactos");
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
  });
});
