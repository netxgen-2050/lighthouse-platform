import { expect, test } from "@playwright/test";

test("la portada responde", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.status()).toBe(200);
});
