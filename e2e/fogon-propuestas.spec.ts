import { expect, test } from "./fixtura";

// Propuestas del Fogón (fogon-propuestas), noche 1: página de solo lectura. Todo es de ejemplo y simulado.

const NIVEL = "Mirá la propuesta como…";

test.describe("abrir la propuesta", () => {
  test("desde el Fogón: la tarjeta con propuesta tiene el botón y lleva a la página", async ({ page }) => {
    await page.goto("/fogon");
    const tarjeta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Pedido de Valle Solar al Fondo Común para la bomba solar" }) });
    await tarjeta.getByRole("link", { name: "Abrir la propuesta" }).click();
    await expect(page).toHaveURL(/\/fogon\/propuestas\/consejo-bomba$/);
    await expect(page.getByRole("heading", { level: 1, name: "Pedido de Valle Solar al Fondo Común para la bomba solar" })).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("una decisión sin propuesta no tiene el botón", async ({ page }) => {
    await page.goto("/fogon");
    const tarjeta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Permitir animales de granja en las chacras" }) });
    await expect(tarjeta).toBeVisible();
    await expect(tarjeta.getByRole("link", { name: "Abrir la propuesta" })).toHaveCount(0);
  });

  test("una propuesta que no existe muestra la pantalla de no encontrado", async ({ page }) => {
    // El estado HTTP ya no es 404 (ADR-004): se comprueba la pantalla.
    await page.goto("/fogon/propuestas/no-existe");
    await expect(page.getByRole("heading", { level: 1, name: "No encontramos esa página" })).toBeVisible();
  });

  test("desde la lente Decisiones de Cómo decidimos", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await page.getByRole("button", { name: /Decisiones que suben/ }).click();
    await page.getByRole("button", { name: /Calendario de siembra de otoño/ }).click();
    await page.getByRole("link", { name: "Abrir la propuesta" }).click();
    await expect(page).toHaveURL(/\/fogon\/propuestas\/siembra$/);
  });
});

test.describe("ficha", () => {
  test("con plata: el monto lleva (simulado)", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    const ficha = page.getByRole("region", { name: "Ficha" });
    await expect(ficha).toContainText("USD 4.800");
    await expect(ficha).toContainText("(simulado)");
    await expect(ficha).toContainText("Fondo Común");
  });

  test("monto sin cifra: sin dato, nunca 0", async ({ page }) => {
    await page.goto("/fogon/propuestas/cisterna-compartida");
    const ficha = page.getByRole("region", { name: "Ficha" });
    await expect(ficha).toContainText("sin dato");
    await expect(ficha).not.toContainText("USD 0");
  });

  test("no pide plata", async ({ page }) => {
    await page.goto("/fogon/propuestas/regalia");
    await expect(page.getByRole("region", { name: "Ficha" })).toContainText("No pide plata");
  });
});

test.describe("fases y discusión", () => {
  test("recorrido importante: ocho fases y la actual marcada con texto y aria-current", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    const fases = page.getByRole("list", { name: "Fases de la propuesta" });
    await expect(fases.getByRole("listitem")).toHaveCount(8);
    const actual = fases.locator("[aria-current='step']");
    await expect(actual).toHaveCount(1);
    await expect(actual).toContainText("Resolver concerns");
    await expect(actual).toContainText("ahora");
  });

  test("recorrido simple: presentación, plazo para objetar y cierre", async ({ page }) => {
    await page.goto("/fogon/propuestas/huerta");
    const fases = page.getByRole("list", { name: "Fases de la propuesta" });
    await expect(fases.getByRole("listitem")).toHaveText([/Presentación/, /Plazo para objetar/, /Cierre/]);
    await expect(fases.locator("[aria-current='step']")).toContainText("Plazo para objetar");
  });

  test("la discusión muestra el tipo de cada entrada en texto y el grupo de concerns con sus autoras", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    const discusion = page.getByRole("list", { name: "Entradas de la discusión" });
    await expect(discusion.getByRole("article").filter({ hasText: "Pregunta" }).first()).toBeVisible();
    const grupo = discusion.getByRole("article").filter({ has: page.getByRole("heading", { name: "Uso compartido" }) });
    await expect(grupo).toContainText("Ramiro (ejemplo)");
    await expect(grupo).toContainText("Paz (ejemplo)");
    await expect(grupo).toContainText("círculos más lejanos");
    await expect(grupo).toContainText("Los días de riego");
    // El concern de Inés queda suelto, fuera del grupo.
    await expect(discusion.getByRole("article").filter({ hasText: "Coincido con la sugerencia" })).not.toContainText("Uso compartido");
    await expect(discusion).toContainText("Sugerencia del Guardián (IA, simulado)");
    await expect(discusion).toContainText("Nadie la respaldó: no frena la propuesta");
  });

  test("principios: la lista de ejemplo se ve en la ficha", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    await expect(page.getByRole("region", { name: "Ficha" })).toContainText("Agua viva");
  });
});

test.describe("permisos y niveles", () => {
  test("cambiar de nivel cambia las acciones: en preguntas el ámbito no ve levantar un concern", async ({ page }) => {
    await page.goto("/fogon/propuestas/cisterna-compartida");
    await page.getByLabel(NIVEL).selectOption("ambito");
    const hacer = page.getByRole("region", { name: "Qué podés hacer" });
    await expect(hacer).toContainText("Hacer preguntas para aclarar");
    await expect(hacer).toContainText("Firmar el acuse de conformidad");
    await expect(hacer).not.toContainText("Levantar un concern");
  });

  test("de la red en una decisión de tribu: lee y no comenta", async ({ page }) => {
    await page.goto("/fogon/propuestas/siembra");
    await page.getByLabel(NIVEL).selectOption("red");
    const hacer = page.getByRole("region", { name: "Qué podés hacer" });
    await expect(hacer).toContainText("Leer la propuesta");
    await expect(hacer).not.toContainText("Comentar en la discusión abierta");
  });

  test("del común en una decisión del común: comenta", async ({ page }) => {
    await page.goto("/fogon/propuestas/regalia");
    await expect(page.getByLabel(NIVEL)).toHaveValue("comun");
    await expect(page.getByRole("region", { name: "Qué podés hacer" })).toContainText("Comentar en la discusión abierta");
  });

  test("la tabla de permisos es accesible y está dentro de un details", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    await page.getByText("Ver la tabla de permisos por nivel").click();
    const tabla = page.getByRole("table", { name: /Permisos por nivel de implicación/ });
    await expect(tabla).toBeVisible();
    await expect(tabla.getByRole("columnheader")).toHaveCount(8);
    await expect(tabla.getByRole("rowheader", { name: "Bloquear citando un principio" })).toBeVisible();
  });

  test("la visita no ve nada: solo la invitación a abrir una cuenta", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    await page.getByLabel(NIVEL).selectOption("visita");
    await expect(page.getByRole("heading", { level: 1, name: /abrir una cuenta/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir una cuenta" })).toHaveAttribute("href", "/sumarte");
    await expect(page.getByRole("region", { name: "Ficha" })).toHaveCount(0);
    await expect(page.getByRole("list", { name: "Entradas de la discusión" })).toHaveCount(0);
  });
});

test.describe("quórum, ámbito y urgencia", () => {
  test("grupo chico: 2 de 3 para el quórum y dos acuses", async ({ page }) => {
    await page.goto("/fogon/propuestas/huerta");
    const part = page.getByRole("region", { name: "Participación" });
    await expect(part).toContainText("2 de 3 para el quórum (2 firmaron el acuse)");
    await expect(part).toContainText("Falta 1 persona");
  });

  test("ámbito del consejo: se ve la lista definida por el board", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    const ambito = page.getByRole("region", { name: "Quién es del ámbito" });
    await expect(ambito).toContainText("lo define el board de NetXGen");
    await expect(ambito).toContainText("7 personas");
  });

  test("la urgencia de la bomba está pedida y falta un respaldo", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    const u = page.getByRole("region", { name: "Urgencia" });
    await expect(u).toContainText("Urgencia pedida");
    await expect(u).toContainText("falta 1 respaldo");
    await expect(u).toContainText("Tope de urgencia: USD 5.000 (simulado)");
  });

  test("reabrir solo con un nuevo consenso: en una propuesta cerrada nadie ve editar ni pasar de fase", async ({ page }) => {
    await page.goto("/fogon/propuestas/siembra");
    await page.getByLabel(NIVEL).selectOption("presenta");
    const hacer = page.getByRole("region", { name: "Qué podés hacer" });
    await expect(hacer).not.toContainText("Editar la propuesta");
    await expect(hacer).not.toContainText("Pasar de fase");
    await expect(hacer).not.toContainText("Abrir la revisión");
  });

  test("una propuesta cerrada por consenso muestra el resultado y quién se hizo a un lado", async ({ page }) => {
    await page.goto("/fogon/propuestas/siembra");
    await expect(page.getByRole("region", { name: "Resultado" })).toContainText("Cerrada por consenso; se hicieron a un lado: Paz (ejemplo)");
  });
});

test.describe("ámbito del consejo sin super admin", () => {
  test.use({ rol: "persona" });
  test("se ve la lista del board y no hay control para cambiarla", async ({ page }) => {
    await page.goto("/fogon/propuestas/consejo-bomba");
    const ambito = page.getByRole("region", { name: "Quién es del ámbito" });
    await expect(ambito).toContainText("7 personas");
    await expect(page.getByText("Definir quién es del ámbito")).toHaveCount(0);
  });
});

test.describe("inglés", () => {
  test.use({ locale: "en-US" });
  test("la página se ve en inglés", async ({ page }) => {
    await page.goto("/fogon/propuestas/huerta");
    await expect(page.getByRole("heading", { name: "Phases" })).toBeVisible();
    await expect(page.getByLabel("See the proposal as…")).toBeVisible();
  });
});
