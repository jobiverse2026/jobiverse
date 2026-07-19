import { expect, test, type Page } from "@playwright/test";

type TestRole = "admin" | "candidate" | "creator";

function hasCredentials(role: TestRole) {
  const prefix = `TEST_${role.toUpperCase()}`;
  return Boolean(process.env[`${prefix}_EMAIL`] && process.env[`${prefix}_PASSWORD`]);
}

function credentials(role: TestRole) {
  const prefix = `TEST_${role.toUpperCase()}`;
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) throw new Error(`${prefix}_EMAIL and ${prefix}_PASSWORD must be configured.`);
  return { email, password };
}

async function login(page: Page, role: TestRole, expectedPath: RegExp) {
  const account = credentials(role);
  await page.goto(`/login/${role}`);
  await page.getByPlaceholder("Email address").fill(account.email);
  await page.getByPlaceholder("Password").fill(account.password);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(expectedPath, { timeout: 30_000 });
  await expect(page.getByRole("alert")).toHaveCount(0);
}

test.describe("JobiVerse finance access", () => {
  test("admin can inspect live finance and Razorpay ledgers", async ({ page }) => {
    test.skip(!hasCredentials("admin"), "Admin test credentials are not configured.");
    await login(page, "admin", /\/admin(?:\/)?$/);
    await page.goto("/admin/finance");
    await expect(page.getByRole("heading", { name: "Finance & Payouts" })).toBeVisible();
    await expect(page.getByText("Captured collections")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Creator payout queue" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Razorpay transaction ledger" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Application error|Internal Server Error/i);
  });

  test("creator can inspect the real earnings and payout workspace", async ({ page }) => {
    test.skip(!hasCredentials("creator"), "Creator test credentials are not configured.");
    await login(page, "creator", /\/earn-with-jobiverse\/dashboard/);
    await page.goto("/earn-with-jobiverse/dashboard/earnings");
    await expect(page.getByRole("heading", { name: "Earnings & payouts." })).toBeVisible();
    await expect(page.getByText("Lifetime earned")).toBeVisible();
    await expect(page.getByText("Available for payout")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Earning ledger" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Payout requests" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Application error|Internal Server Error/i);
  });

  test("candidate cannot open admin finance", async ({ page }) => {
    test.skip(!hasCredentials("candidate"), "Candidate test credentials are not configured.");
    await login(page, "candidate", /\/candidates\/dashboard/);
    await page.goto("/admin/finance");
    await expect(page).not.toHaveURL(/\/admin\/finance$/);
  });
});
