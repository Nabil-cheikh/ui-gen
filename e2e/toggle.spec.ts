import { test, expect } from "@playwright/test";

test.describe("Code/Preview Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the app to load
    await page.waitForSelector('[role="tablist"]', { timeout: 15000 });
  });

  test("Preview tab is active by default", async ({ page }) => {
    const previewTab = page.getByRole("tab", { name: "Preview" });
    const codeTab = page.getByRole("tab", { name: "Code" });

    await expect(previewTab).toHaveAttribute("data-state", "active");
    await expect(codeTab).toHaveAttribute("data-state", "inactive");

    // Preview iframe should be visible
    await expect(page.locator("iframe")).toBeVisible();
  });

  test("Clicking Code tab switches to code view", async ({ page }) => {
    const previewTab = page.getByRole("tab", { name: "Preview" });
    const codeTab = page.getByRole("tab", { name: "Code" });

    // Click Code tab
    await codeTab.click();

    // Code tab should now be active
    await expect(codeTab).toHaveAttribute("data-state", "active");
    await expect(previewTab).toHaveAttribute("data-state", "inactive");

    // Preview iframe should NOT be visible
    await expect(page.locator("iframe")).not.toBeVisible();
  });

  test("Clicking Preview tab switches back to preview view", async ({
    page,
  }) => {
    const previewTab = page.getByRole("tab", { name: "Preview" });
    const codeTab = page.getByRole("tab", { name: "Code" });

    // Switch to Code first
    await codeTab.click();
    await expect(codeTab).toHaveAttribute("data-state", "active");

    // Switch back to Preview
    await previewTab.click();
    await expect(previewTab).toHaveAttribute("data-state", "active");
    await expect(codeTab).toHaveAttribute("data-state", "inactive");

    // Preview iframe should be visible again
    await expect(page.locator("iframe")).toBeVisible();
  });

  test("Only one tab is active at a time", async ({ page }) => {
    const previewTab = page.getByRole("tab", { name: "Preview" });
    const codeTab = page.getByRole("tab", { name: "Code" });

    // Check initial state
    await expect(previewTab).toHaveAttribute("data-state", "active");
    await expect(codeTab).toHaveAttribute("data-state", "inactive");

    // Toggle to Code
    await codeTab.click();
    await expect(codeTab).toHaveAttribute("data-state", "active");
    await expect(previewTab).toHaveAttribute("data-state", "inactive");

    // Toggle back to Preview
    await previewTab.click();
    await expect(previewTab).toHaveAttribute("data-state", "active");
    await expect(codeTab).toHaveAttribute("data-state", "inactive");
  });
});
