import { test, expect } from "@playwright/test";

test("home page renders the hero, stats, and nav", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation").first()).toBeVisible();
  await expect(page.getByText("Schools", { exact: true })).toBeVisible();
});

test("login form shows an error for wrong credentials", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByPlaceholder("you@example.com").fill("manager@schooldashboard.dev");
  await page.locator("#password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("Invalid email or password")).toBeVisible();
});
