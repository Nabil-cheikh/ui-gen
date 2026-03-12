import { test, expect } from "@playwright/test";

test.describe("Code/Preview toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Preview tab is active by default", async ({ page }) => {
    // The Preview tab should be active on initial load
    const previewTab = page.getByRole("tab", { name: "Preview" });
    await expect(previewTab).toBeVisible();
    await expect(previewTab).toHaveAttribute("data-state", "active");

    // The Code tab should be inactive
    const codeTab = page.getByRole("tab", { name: "Code" });
    await expect(codeTab).toHaveAttribute("data-state", "inactive");
  });

  test("clicking Code tab switches to code view", async ({ page }) => {
    const codeTab = page.getByRole("tab", { name: "Code" });
    await codeTab.click();

    // Code tab should now be active
    await expect(codeTab).toHaveAttribute("data-state", "active");

    // The preview tab should be inactive
    const previewTab = page.getByRole("tab", { name: "Preview" });
    await expect(previewTab).toHaveAttribute("data-state", "inactive");

    // The code editor panel (file tree + editor) should be visible
    // Monaco editor or file tree should appear
    const codePanel = page.locator('[data-panel-group-id]').last();
    await expect(codePanel).toBeVisible();
  });

  test("clicking Preview tab switches back to preview view", async ({
    page,
  }) => {
    // First switch to Code view
    const codeTab = page.getByRole("tab", { name: "Code" });
    await codeTab.click();
    await expect(codeTab).toHaveAttribute("data-state", "active");

    // Then switch back to Preview
    const previewTab = page.getByRole("tab", { name: "Preview" });
    await previewTab.click();
    await expect(previewTab).toHaveAttribute("data-state", "active");
    await expect(codeTab).toHaveAttribute("data-state", "inactive");

    // The iframe for the preview should be visible
    // (or the welcome message if no files are loaded)
    const previewArea = page.locator("iframe[title='Preview'], .bg-gray-50").first();
    await expect(previewArea).toBeVisible();
  });

  test("toggle is visually reflected — only one tab active at a time", async ({
    page,
  }) => {
    const previewTab = page.getByRole("tab", { name: "Preview" });
    const codeTab = page.getByRole("tab", { name: "Code" });

    // Initial state: Preview active
    await expect(previewTab).toHaveAttribute("data-state", "active");
    await expect(codeTab).toHaveAttribute("data-state", "inactive");

    // Switch to Code
    await codeTab.click();
    await expect(codeTab).toHaveAttribute("data-state", "active");
    await expect(previewTab).toHaveAttribute("data-state", "inactive");

    // Switch back to Preview
    await previewTab.click();
    await expect(previewTab).toHaveAttribute("data-state", "active");
    await expect(codeTab).toHaveAttribute("data-state", "inactive");
  });
});
