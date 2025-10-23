import { test, expect } from '@playwright/test';

test.describe('Local Storage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should persist video history across page reloads', async ({ page }) => {
    const testData = {
      version: 1,
      videos: [
        {
          jobId: 'video_test123',
          prompt: 'Test dream prompt',
          createdAt: new Date().toISOString(),
          status: 'completed',
          videoUrl: '/api/get-video/video_test123',
        },
      ],
    };

    await page.evaluate((data) => {
      localStorage.setItem('dream-videos-history', JSON.stringify(data));
    }, testData);

    await page.reload();

    await expect(page.locator('text="Test dream prompt"')).toBeVisible();
    await expect(page.locator('text=video_test123')).toBeVisible();
  });

  test('should clear history when requested', async ({ page }) => {
    const testData = {
      version: 1,
      videos: [
        {
          jobId: 'video_test123',
          prompt: 'Test dream prompt',
          createdAt: new Date().toISOString(),
          status: 'completed',
        },
      ],
    };

    await page.evaluate((data) => {
      localStorage.setItem('dream-videos-history', JSON.stringify(data));
    }, testData);

    await page.reload();

    // Click clear history button
    await page.click('button:has-text("Clear History")');

    // Confirm dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Should show empty state
    await page.reload();
    await expect(page.locator('text=No videos yet')).toBeVisible();
  });
});
