import { expect, test } from "@playwright/test";

test("counts in both directions and emits a complete event payload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByLabel("Counter value")).toHaveText("0");

  await page.evaluate(() => {
    (window as typeof window & { received: unknown[] }).received = [];
    window.addEventListener("counter:changed", (event) => {
      (window as typeof window & { received: unknown[] }).received.push((event as CustomEvent).detail);
    });
  });
  await page.getByRole("button", { name: "Increase counter", exact: true }).click();
  await expect(page.getByLabel("Counter value")).toHaveText("1");
  await page.getByRole("button", { name: "Decrease counter", exact: true }).click();
  await page.getByRole("button", { name: "Decrease counter", exact: true }).click();
  await expect(page.getByLabel("Counter value")).toHaveText("-1");
  await expect(page.getByLabel("Total events")).toHaveText("3");

  const received = await page.evaluate(() => (window as typeof window & { received: unknown[] }).received);
  expect(received).toHaveLength(3);
  expect(received[2]).toMatchObject({ action: "decrement", previousValue: 0, value: -1, delta: -1, step: 1 });
  expect(received[2]).toMatchObject({ id: expect.any(String), timestamp: expect.any(String) });
  expect(errors).toEqual([]);
});

test("changes step, emits without changing the value, and resets", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("group", { name: "Step size" }).getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: "Increase counter", exact: true }).click();
  await expect(page.getByLabel("Counter value")).toHaveText("5");
  await page.getByRole("button", { name: "Emit event" }).click();
  await expect(page.getByLabel("Counter value")).toHaveText("5");
  await expect(page.getByLabel("Counter events")).toContainText("Event emitted");
  await page.getByRole("button", { name: "Reset counter" }).click();
  await expect(page.getByLabel("Counter value")).toHaveText("0");
  await expect(page.getByLabel("Total events")).toHaveText("3");
  await expect(page.getByLabel("Counter events")).toContainText("Reset counter");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("Total events")).toHaveText("0");
  await expect(page.getByText("Quiet, for now.")).toBeVisible();
});

test("keyboard shortcuts work without overriding focused controls", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("ArrowUp");
  await expect(page.getByLabel("Counter value")).toHaveText("1");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("Counter value")).toHaveText("0");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("Counter value")).toHaveText("-1");
  await page.keyboard.press("r");
  await expect(page.getByLabel("Counter value")).toHaveText("0");
  await page.getByRole("button", { name: "Increase counter", exact: true }).focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByLabel("Counter value")).toHaveText("0");
});

test("keeps the newest 50 events while counting every emitted event", async ({ page }) => {
  await page.goto("/");
  const increase = page.getByRole("button", { name: "Increase counter", exact: true });
  for (let i = 0; i < 55; i++) await increase.click();
  await expect(page.getByLabel("Counter value")).toHaveText("55");
  await expect(page.getByLabel("Total events")).toHaveText("55");
  await expect(page.locator(".event-row")).toHaveCount(50);
  await expect(page.locator(".event-row").first()).toContainText("55");
});

test("fits a narrow window and keeps the counter usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Increase counter", exact: true }).click();
  await expect(page.getByLabel("Counter value")).toHaveText("1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
