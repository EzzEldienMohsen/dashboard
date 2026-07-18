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

test("unauthenticated visitors are redirected away from /dashboard", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
});

test("manager login lands on the dashboard overview with school card and charts", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("manager@schooldashboard.dev");
  await page.locator("#password").fill("Password123!");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
  await expect(page.getByText("Attendance breakdown")).toBeVisible();
  await expect(page.getByText("Grades by subject")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(2);
});

test("teacher login redirects to classes; /dashboard bounces back", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("teacher@schooldashboard.dev");
  await page.locator("#password").fill("Password123!");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/dashboard\/classes$/);
  await expect(page.getByRole("heading", { name: "Classes", exact: true })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard\/classes$/);
});

test("students page lists students and filters by class", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("manager@schooldashboard.dev");
  await page.locator("#password").fill("Password123!");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("link", { name: "Students" }).click();
  await expect(page).toHaveURL(/\/dashboard\/students$/);
  await expect(page.getByRole("heading", { name: "Students", exact: true })).toBeVisible();

  const rows = page.locator("table tbody tr");
  await expect(rows.first()).toBeVisible();
  const unfilteredCount = await rows.count();

  const classFilter = page.getByLabel("Filter by class");
  const options = await classFilter.locator("option").allTextContents();
  await classFilter.selectOption({ label: options[1] });

  await expect(rows.first()).toBeVisible();
  const filteredCount = await rows.count();
  expect(filteredCount).toBeLessThanOrEqual(unfilteredCount);
});
