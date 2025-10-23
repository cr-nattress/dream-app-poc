import { test, expect } from '@playwright/test';

test.describe('Dream Input Validation', () => {
  test('should show character count', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('textarea[placeholder*="Enter your dream"]');
    await expect(textarea).toBeVisible();

    await expect(page.locator('text=/0 \/ 500 characters/')).toBeVisible();
  });

  test('should disable submit button when prompt is too short', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('textarea[placeholder*="Enter your dream"]');
    const submitButton = page.locator('button:has-text("Generate Dream Video")');

    await textarea.fill('Short');
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button with valid prompt', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('textarea[placeholder*="Enter your dream"]');
    const submitButton = page.locator('button:has-text("Generate Dream Video")');

    await textarea.fill('A serene dream of floating through cherry blossom trees at sunset');
    await expect(submitButton).toBeEnabled();
  });

  test('should use example prompt', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('textarea[placeholder*="Enter your dream"]');
    const exampleButton = page.locator('button:has-text("Use example")');

    await exampleButton.click();

    const value = await textarea.inputValue();
    expect(value.length).toBeGreaterThan(10);
  });

  test('should show error for prompt too long', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('textarea[placeholder*="Enter your dream"]');
    const longPrompt = 'A'.repeat(501);

    await textarea.fill(longPrompt);
    await expect(page.locator('text=/501 \/ 500 characters/')).toBeVisible();

    const submitButton = page.locator('button:has-text("Generate Dream Video")');
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Page Layout', () => {
  test('should display header', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1:has-text("DreamIt")')).toBeVisible();
    await expect(
      page.locator('text=Create AI videos from your dream descriptions')
    ).toBeVisible();
  });

  test('should display video history section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h2:has-text("Your Dream Videos")')).toBeVisible();
  });

  test('should show empty state when no videos', async ({ page }) => {
    await page.goto('/');

    // Clear local storage
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(
      page.locator('text=No videos yet. Create your first dream video above!')
    ).toBeVisible();
  });
});
