import AxeBuilder from "@axe-core/playwright";
import { aceptarPaso } from "./ayudas";
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
    await page.goto("/sumarte");
    await expect(page.getByText("Todavía no te sumaste: elegí un plan.")).toBeVisible();
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    await habilitados(page, ["Explorar", "Bien común", "Sumarte"]);
    await expect(page.getByRole("button", { name: "Hablar con Hifa" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reportar un problema o una idea" })).toBeVisible();
    await deshabilitados(page, PARTICIPAR);
  });

  test("volver después de sumarse: /pactos lleva a Sumarte con el aviso y, como Miembro, vuelve a /pactos", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/pactos");
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fpactos$/);
    await expect(page.getByText("Pactos se habilita con el plan Miembro.")).toBeVisible();
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page).toHaveURL(/\/pactos$/);
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
    await habilitados(page, PARTICIPAR);
  });

  test("el Plan Comunidad sin cuenta pide elegir la comunidad y, al entrar, deja como líder de esa comunidad", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi comunidad" }).click();
    await page.getByRole("radio", { name: /Valle Solar/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta comunidad" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page.getByText("Sos líder de Valle Solar (simulado)")).toBeVisible();
    await page.goto("/tribus/valle");
    await expect(page.getByRole("main").getByText("Admin de Valle Solar")).toBeVisible();
  });

  test("las opciones del Plan Comunidad son las comunidades activas o en formación y proponer una nueva", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi comunidad" }).click();
    const grupo = page.getByRole("group", { name: "¿Qué comunidad vas a liderar?" });
    await expect(grupo.getByRole("radio", { name: /Valle Solar/ })).toBeVisible();
    await expect(grupo.getByRole("radio", { name: /Barda Productiva/ })).toBeVisible();
    await expect(grupo.getByRole("radio", { name: "Proponer una comunidad nueva" })).toBeVisible();
    // Los barrios vacantes no se lideran: se proponen.
    await expect(grupo.getByRole("radio", { name: /Barrio 3/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Ser líder de esta comunidad" })).toBeDisabled();
  });

  test("axe sin violaciones serias o críticas en Sumarte con el aviso", async ({ page }) => {
    await page.goto("/pactos");
    await expect(page.getByText("Pactos se habilita con el plan Miembro.")).toBeVisible();
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
    await expect(page.getByText("Semillas se habilita con el plan Miembro.")).toBeVisible();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
  });

  test("adherir pide sumarse como Miembro", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByRole("link", { name: "Sumate para adherir" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la comunidad" })).toHaveCount(0);
    await page.getByRole("link", { name: "Sumate para adherir" }).click();
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Ftribus%2Fvalle&para=miembro$/);
    await expect(page.getByText("Esta acción se habilita con el plan Miembro.")).toBeVisible();
    // Al pasar a Miembro vuelve a la tribu.
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    await expect(page).toHaveURL(/\/tribus\/valle$/);
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la comunidad" })).toBeVisible();
  });

  test("subir a Miembro habilita Participar por la dirección de inmediato y bajar a Explorador lo vuelve a pedir", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    await page.goto("/semillas");
    await expect(page).toHaveURL(/\/semillas$/);
    await page.goto("/sumarte");
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

test.describe("Miembro", () => {
  test.use({ rol: "persona" });

  test("Participar está habilitado y el Pase Fundador también habilita", async ({ page }) => {
    await page.goto("/");
    await habilitados(page, PARTICIPAR);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Volver a Explorador" }).click();
    await deshabilitados(page, PARTICIPAR);
    await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
    await habilitados(page, PARTICIPAR);
  });
});

test.describe("Líder de comunidad", () => {
  test.use({ rol: "persona" });

  test("elegir el Plan Comunidad y liderar Valle Solar suma la marca de admin y todo lo de Miembro", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi comunidad" }).click();
    await page.getByRole("radio", { name: /Valle Solar/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta comunidad" }).click();
    await expect(page.getByText("Sos líder de Valle Solar (simulado)")).toBeFocused();
    await expect(page.getByText("Tu plan actual:")).toContainText("Líder de comunidad");
    await habilitados(page, PARTICIPAR);
    await page.goto("/tribus/valle");
    await expect(page.getByRole("main").getByText("Admin de Valle Solar")).toBeVisible();
    await page.goto("/tribus/semilla");
    await expect(page.getByText("Admin de Valle Solar")).toHaveCount(0);
  });

  test("proponer una comunidad nueva lleva a los barrios vacantes", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi comunidad" }).click();
    await page.getByRole("radio", { name: "Proponer una comunidad nueva" }).check();
    await page.getByRole("button", { name: "Ser líder de esta comunidad" }).click();
    await expect(page).toHaveURL(/\/participa\?ver=vision#sec-vacantes$/);
    await expect(page.getByRole("heading", { level: 1, name: "Participa" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Barrios vacantes" })).toBeVisible();
  });

  test("bajar a Miembro quita la marca de admin", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi comunidad" }).click();
    await page.getByRole("radio", { name: /Valle Solar/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta comunidad" }).click();
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
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
