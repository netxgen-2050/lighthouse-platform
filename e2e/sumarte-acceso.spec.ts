import AxeBuilder from "@axe-core/playwright";
import { COOKIE_PRUEBA, EMAILS, expect, test, type Page } from "./fixtura";

// Con Privy (previews y producción) elegir un plan abre el modal de Privy: los casos que usan "Entrar como…" van en el e2e local.
const CON_PRIVY = Boolean(process.env.BASE_URL || process.env.NEXT_PUBLIC_PRIVY_APP_ID);
const SIN_PRIVY = "Con Privy, elegir un plan abre el modal de Privy; este caso usa el panel Entrar como… del modo de prueba";

const rail = (page: Page) => page.getByRole("navigation", { name: "Principal" });
const barra = (page: Page) => page.getByRole("banner");
const PARTICIPAR = ["Pactos", "Semillas", "Fogón", "Compromisos"];

async function deshabilitados(page: Page, nombres: string[]) {
  for (const nombre of nombres) {
    const destino = rail(page).getByRole("link", { name: nombre, exact: true });
    await expect(destino).toHaveAttribute("aria-disabled", "true");
    await expect(destino).not.toHaveAttribute("href", /.*/);
  }
}

async function habilitados(page: Page, nombres: string[]) {
  for (const nombre of nombres) {
    const destino = rail(page).getByRole("link", { name: nombre, exact: true });
    await expect(destino).toHaveAttribute("href", /^\//);
    await expect(destino).not.toHaveAttribute("aria-disabled", "true");
  }
}

test.describe("sumarse desde Sumarte", () => {
  test.use({ rol: "ninguno" });

  test("sumarse gratis: queda como Explorador y ve habilitados Hifa y Congreso", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte");
    await expect(page.getByText("Todavía no te sumaste: elegí un plan.")).toBeVisible();
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    await habilitados(page, ["Congreso", "Inicio", "Sumarte"]);
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
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page).toHaveURL(/\/pactos$/);
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
    await habilitados(page, PARTICIPAR);
  });

  test("el Plan Tribu sin cuenta pide elegir la tribu y, al entrar, deja como líder de esa tribu", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi tribu" }).click();
    await page.getByRole("radio", { name: /Valle Solar/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page.getByText("Sos líder de Valle Solar (simulado)")).toBeVisible();
    await page.goto("/tribus/valle");
    await expect(page.getByRole("main").getByText("Admin de Valle Solar")).toBeVisible();
  });

  test("las opciones del Plan Tribu son las tribus activas o en formación y proponer una nueva", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi tribu" }).click();
    const grupo = page.getByRole("group", { name: "¿Qué tribu vas a liderar?" });
    await expect(grupo.getByRole("radio", { name: /Valle Solar/ })).toBeVisible();
    await expect(grupo.getByRole("radio", { name: /Barda Productiva/ })).toBeVisible();
    await expect(grupo.getByRole("radio", { name: "Proponer una tribu nueva" })).toBeVisible();
    // Los barrios vacantes no se lideran: se proponen.
    await expect(grupo.getByRole("radio", { name: /Barrio 3/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Ser líder de esta tribu" })).toBeDisabled();
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
    await habilitados(page, ["Congreso"]);
    await deshabilitados(page, PARTICIPAR);
  });
});

test.describe("Explorador", () => {
  test.use({ rol: "persona", plan: "explorador" });

  test("Participar aparece deshabilitado con 'Sumate para participar' y un enlace a Sumarte", async ({ page }) => {
    await page.goto("/");
    await deshabilitados(page, PARTICIPAR);
    for (const nombre of PARTICIPAR) {
      await expect(rail(page).getByRole("link", { name: `Sumate para participar: ${nombre}` })).toBeVisible();
    }
    await habilitados(page, ["Congreso", "Sumarte"]);
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
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toHaveCount(0);
    await page.getByRole("link", { name: "Sumate para adherir" }).click();
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Ftribus%2Fvalle&para=miembro$/);
    await expect(page.getByText("Esta acción se habilita con el plan Miembro.")).toBeVisible();
    // Al pasar a Miembro vuelve a la tribu.
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    await expect(page).toHaveURL(/\/tribus\/valle$/);
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toBeVisible();
  });

  test("subir a Miembro habilita Participar de inmediato y bajar a Explorador lo deshabilita", async ({ page }) => {
    await page.goto("/sumarte");
    await deshabilitados(page, PARTICIPAR);
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    await habilitados(page, PARTICIPAR);
    await page.getByRole("button", { name: "Volver a Explorador" }).click();
    await deshabilitados(page, PARTICIPAR);
  });

  test("axe sin violaciones serias o críticas con destinos deshabilitados en el rail", async ({ page }) => {
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

test.describe("Líder de tribu", () => {
  test.use({ rol: "persona" });

  test("elegir el Plan Tribu y liderar Valle Solar suma la marca de admin y todo lo de Miembro", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi tribu" }).click();
    await page.getByRole("radio", { name: /Valle Solar/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await expect(page.getByText("Sos líder de Valle Solar (simulado)")).toBeFocused();
    await expect(page.getByText("Tu plan actual:")).toContainText("Líder de tribu");
    await habilitados(page, PARTICIPAR);
    await page.goto("/tribus/valle");
    await expect(page.getByRole("main").getByText("Admin de Valle Solar")).toBeVisible();
    await page.goto("/tribus/semilla");
    await expect(page.getByText("Admin de Valle Solar")).toHaveCount(0);
  });

  async function liderarValle(page: Page) {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi tribu" }).click();
    await page.getByRole("radio", { name: /Valle Solar/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await expect(page.getByText("Sos líder de Valle Solar (simulado)")).toBeFocused();
  }

  test("sumar Taller Común siendo líder de Valle Solar pide confirmar y deja las dos marcas y el total", async ({ page }) => {
    await liderarValle(page);
    await page.getByRole("button", { name: "Sumar otra tribu" }).click();
    const grupo = page.getByRole("group", { name: "¿Qué otra tribu vas a liderar?" });
    await expect(grupo.getByRole("radio", { name: /Valle Solar/ })).toHaveCount(0);
    await grupo.getByRole("radio", { name: /Taller Común/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    const dialogo = page.getByRole("dialog", { name: "Sumar otra tribu" });
    await expect(dialogo).toContainText("Ya sos líder de Valle Solar. ¿Querés sumar también Taller Común? Vas a administrar las dos.");
    await expect(dialogo).toContainText("Simulado: en la versión real lo aprueba el super admin");
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);
    await dialogo.getByRole("button", { name: "Sí, sumar Taller Común" }).click();
    await expect(page.getByText("Sos líder de Valle Solar y Taller Común (simulado)")).toBeFocused();
    await expect(page.getByText("Total: USD 120/mes")).toBeVisible();
    await expect(page.getByText("USD 60/mes por tribu")).toBeVisible();
    await page.goto("/tribus/valle");
    await expect(page.getByRole("main").getByText("Admin de Valle Solar")).toBeVisible();
    await page.goto("/tribus/taller");
    await expect(page.getByRole("main").getByText("Admin de Taller Común")).toBeVisible();
    await page.goto("/tribus/semilla");
    await expect(page.getByText(/Admin de /)).toHaveCount(0);
  });

  test("cancelar el diálogo con Escape no suma y devuelve el foco a Sumar otra tribu", async ({ page }) => {
    await liderarValle(page);
    await page.getByRole("button", { name: "Sumar otra tribu" }).click();
    await page.getByRole("radio", { name: /Taller Común/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await expect(page.getByRole("dialog", { name: "Sumar otra tribu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Sumar otra tribu" })).toBeFocused();
    await expect(page.getByText("Sos líder de Valle Solar (simulado)")).toBeVisible();
  });

  test("cancelar el diálogo con el botón Cancelar no suma y devuelve el foco a Sumar otra tribu", async ({ page }) => {
    await liderarValle(page);
    await page.getByRole("button", { name: "Sumar otra tribu" }).click();
    await page.getByRole("radio", { name: /Taller Común/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await page.getByRole("dialog", { name: "Sumar otra tribu" }).getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Sumar otra tribu" })).toBeFocused();
    await expect(page.getByText("Sos líder de Valle Solar (simulado)")).toBeVisible();
  });

  test("el menú del avatar nombra las dos tribus que lidera", async ({ page }) => {
    await liderarValle(page);
    await page.getByRole("button", { name: "Sumar otra tribu" }).click();
    await page.getByRole("radio", { name: /Taller Común/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await page.getByRole("button", { name: "Sí, sumar Taller Común" }).click();
    await page.getByRole("button", { name: "Menú de la persona" }).click();
    await expect(page.getByText("Admin de Valle Solar y Taller Común")).toBeVisible();
  });

  test("dejar de liderar una tribu deja la otra, y la última deja como Miembro", async ({ page }) => {
    await liderarValle(page);
    await page.getByRole("button", { name: "Sumar otra tribu" }).click();
    await page.getByRole("radio", { name: /Taller Común/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await page.getByRole("button", { name: "Sí, sumar Taller Común" }).click();
    await page.getByRole("button", { name: "Dejar de liderar Taller Común" }).click();
    await expect(page.getByText("Sos líder de Valle Solar (simulado)")).toBeFocused();
    await page.getByRole("button", { name: "Dejar de liderar Valle Solar" }).click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Miembro");
    await expect(page.getByRole("button", { name: "Sumar mi tribu" })).toBeVisible();
    await habilitados(page, PARTICIPAR);
  });

  test("volver a Explorador deja todas las tribus", async ({ page }) => {
    await liderarValle(page);
    await page.getByRole("button", { name: "Sumar otra tribu" }).click();
    await page.getByRole("radio", { name: /Taller Común/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await page.getByRole("button", { name: "Sí, sumar Taller Común" }).click();
    await page.getByRole("button", { name: "Volver a Explorador" }).click();
    await page.goto("/tribus/valle");
    await expect(page.getByText(/Admin de /)).toHaveCount(0);
    await page.goto("/tribus/taller");
    await expect(page.getByText(/Admin de /)).toHaveCount(0);
  });

  test("con una tribu nueva pendiente no se ofrece proponer otra", async ({ page }) => {
    await liderarValle(page);
    await page.getByRole("button", { name: "Sumar otra tribu" }).click();
    await page.getByRole("radio", { name: "Proponer una tribu nueva" }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await page.getByRole("button", { name: "Sí, sumar una tribu nueva" }).click();
    await expect(page).toHaveURL(/\/tribus#sec-vacantes$/);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar otra tribu" }).click();
    await expect(page.getByRole("radio", { name: "Proponer una tribu nueva" })).toHaveCount(0);
  });

  test("proponer una tribu nueva lleva a los barrios vacantes", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi tribu" }).click();
    await page.getByRole("radio", { name: "Proponer una tribu nueva" }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
    await expect(page).toHaveURL(/\/tribus#sec-vacantes$/);
    await expect(page.getByRole("heading", { level: 1, name: "Tribus del Lighthouse" })).toBeVisible();
  });

  test("bajar a Miembro quita la marca de admin", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumar mi tribu" }).click();
    await page.getByRole("radio", { name: /Valle Solar/ }).check();
    await page.getByRole("button", { name: "Ser líder de esta tribu" }).click();
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
