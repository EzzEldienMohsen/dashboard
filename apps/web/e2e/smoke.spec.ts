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

// One shared manager login backs every dashboard-overview assertion below —
// the API's ThrottlerGuard caps requests per minute, so a separate login
// per assertion would exceed it once the suite covers this many features.
test("manager dashboard: overview cards, month dropdown, and class drill-down via tabs", async ({
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
  await expect(page.getByText("Monthly performance")).toBeVisible();
  await expect(page.getByText("Performance over time")).toBeVisible();
  await expect(page.getByText("Improvement rate")).toBeVisible();
  // Doughnut (attendance) + Bar (grades) + Line (trend) — the monthly
  // performance gauge is CSS-only (RadialProgress), so it adds no canvas.
  await expect(page.locator("canvas")).toHaveCount(3);

  const monthSelect = page.getByLabel("Select month");
  const monthOptions = await monthSelect.locator("option").allTextContents();
  expect(monthOptions.length).toBeGreaterThan(1);
  await monthSelect.selectOption({ index: 0 });
  await expect(monthSelect).toHaveValue("0");

  await expect(page.getByRole("heading", { name: "Classes", exact: true })).toBeVisible();
  const firstClassLink = page.getByRole("link").filter({ hasText: /Grade \d/ }).first();
  // The link's own text also includes its performance badge (e.g. "Grade
  // 4-A86.2%") — the class name lives in its own span.
  const className = await firstClassLink.locator("span").first().textContent();
  await firstClassLink.click();

  await expect(page).toHaveURL(/\/dashboard\/classes\/.+$/);
  await expect(page.getByRole("tablist")).toBeVisible();
  if (className) {
    await expect(page.getByRole("heading", { name: className.trim() })).toBeVisible();
  }
  await expect(page.getByText("Monthly performance")).toBeVisible();

  const tabs = page.getByRole("tablist").getByRole("link");
  const secondTabName = await tabs.nth(1).textContent();
  await tabs.nth(1).click();
  if (secondTabName) {
    await expect(page.getByRole("heading", { name: secondTabName.trim() })).toBeVisible();
  }
});

test("teacher login redirects to classes, landing on the first class's tab", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill("teacher@schooldashboard.dev");
  await page.locator("#password").fill("Password123!");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/dashboard\/classes\/.+$/);
  await expect(page.getByRole("heading", { name: "Classes", exact: true })).toBeVisible();
  await expect(page.getByRole("tablist")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard\/classes\/.+$/);
});

// One shared manager login backs the list, filter, student drill-down, and
// locale-switch checks below, for the same rate-limit reason as above.
test("students: list, filter, drill into a student's commitment/strengths/advice, and locale switch", async ({
  page,
}) => {
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

  await classFilter.selectOption({ label: options[0] });
  await expect(rows.first()).toBeVisible();

  const firstRowLink = rows.first().getByRole("link");
  const studentFirstName = await firstRowLink.textContent();
  await firstRowLink.click();

  await expect(page).toHaveURL(/\/dashboard\/students\/.+$/);
  if (studentFirstName) {
    await expect(
      page.getByRole("heading", { name: new RegExp(studentFirstName.trim()) }),
    ).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Commitment" })).toBeVisible();
  await expect(page.getByText("Strengths")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Advice" })).toBeVisible();

  await page.getByRole("button", { name: "Switch to العربية" }).click();
  await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/ar\//);
  await expect(page.getByText("النصائح")).toBeVisible();
});
