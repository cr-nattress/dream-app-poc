# Epic 4: E2E Testing

## Overview
Implement comprehensive end-to-end tests to verify that the UI and Netlify functions work correctly both locally and when deployed to Netlify. Ensures the POC is production-ready and reliable.

## Goals
- Test complete user workflows from input to video playback
- Verify Netlify functions work locally and in deployment
- Test error scenarios and edge cases
- Automate testing in CI/CD pipeline
- Ensure tests are fast and reliable

## User Stories

### US-4.1: E2E Testing Setup
**As a** developer
**I want** E2E testing infrastructure configured
**So that** I can write and run automated tests

**Acceptance Criteria:**
- Playwright installed and configured
- Test scripts added to package.json
- Test directory structure created
- Test environment variables configured
- Tests can run locally and in CI

**Tasks:**
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Initialize Playwright config: `npx playwright install`
- [ ] Create `/tests/e2e` directory
- [ ] Configure `playwright.config.ts`
- [ ] Add test scripts to package.json
- [ ] Create test environment setup file
- [ ] Configure test data fixtures

**Playwright Configuration:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000, // Videos take time to generate
  use: {
    baseURL: 'http://localhost:8888', // Netlify dev
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'netlify dev',
    port: 8888,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

### US-4.2: Netlify Functions Unit Tests
**As a** developer
**I want** unit tests for Netlify functions
**So that** I can verify function logic independently

**Acceptance Criteria:**
- Test create-video function
- Test video-status function
- Test get-video function
- Mock external API calls
- Test error scenarios
- 80%+ code coverage for functions

**Tasks:**
- [ ] Install testing library: `npm install -D vitest`
- [ ] Create `/tests/unit/functions` directory
- [ ] Write tests for create-video function
- [ ] Write tests for video-status function
- [ ] Write tests for get-video function
- [ ] Mock OpenAI API responses
- [ ] Mock Netlify Blob storage
- [ ] Add coverage reporting

**Test Examples:**
```typescript
// tests/unit/functions/create-video.test.ts
import { describe, it, expect, vi } from 'vitest';
import { handler } from '../../../netlify/functions/create-video';

describe('create-video function', () => {
  it('should create video job with valid prompt', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ prompt: 'A dream about flying' })
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toHaveProperty('jobId');
  });

  it('should reject prompts that are too short', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ prompt: 'Short' })
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
  });
});
```

---

### US-4.3: Happy Path E2E Test
**As a** QA engineer
**I want** a test that covers the complete user workflow
**So that** I verify the entire system works end-to-end

**Acceptance Criteria:**
- Test navigates to home page
- Test enters dream description
- Test submits form
- Test waits for video status updates
- Test verifies video player appears
- Test can play the video
- Test verifies video appears in history

**Tasks:**
- [ ] Create `/tests/e2e/happy-path.spec.ts`
- [ ] Write test for entering dream description
- [ ] Write test for form submission
- [ ] Write test for status polling
- [ ] Write test for video playback
- [ ] Write test for video history
- [ ] Add assertions for each step
- [ ] Use test fixtures for consistent data

**Test Implementation:**
```typescript
// tests/e2e/happy-path.spec.ts
import { test, expect } from '@playwright/test';

test('complete video generation workflow', async ({ page }) => {
  // Navigate to app
  await page.goto('/');

  // Enter dream description
  const dreamPrompt = 'A peaceful dream of floating in space';
  await page.fill('textarea[name="dream-prompt"]', dreamPrompt);

  // Submit form
  await page.click('button:has-text("Generate Dream Video")');

  // Wait for job creation
  await expect(page.locator('text=Job ID:')).toBeVisible();

  // Wait for status to update (may take several minutes)
  await expect(page.locator('text=completed')).toBeVisible({
    timeout: 300000 // 5 minutes
  });

  // Verify video player appears
  await expect(page.locator('video')).toBeVisible();

  // Verify can play video
  const video = page.locator('video');
  await video.click(); // Play

  // Verify video is in history
  await expect(page.locator(`text=${dreamPrompt}`)).toBeVisible();

  // Take screenshot of success state
  await page.screenshot({ path: 'test-results/success.png' });
});
```

---

### US-4.4: Error Scenario Tests
**As a** QA engineer
**I want** tests for error scenarios
**So that** the app handles failures gracefully

**Acceptance Criteria:**
- Test invalid prompt (too short/long)
- Test network errors
- Test API failures
- Test missing job ID
- Test video not found
- All errors display helpful messages

**Tasks:**
- [ ] Create `/tests/e2e/error-scenarios.spec.ts`
- [ ] Test prompt validation errors
- [ ] Test API error handling
- [ ] Test network failure scenarios
- [ ] Test missing video scenarios
- [ ] Verify error messages are user-friendly
- [ ] Test error recovery flows

**Test Examples:**
```typescript
// tests/e2e/error-scenarios.spec.ts
import { test, expect } from '@playwright/test';

test('shows error for prompt too short', async ({ page }) => {
  await page.goto('/');
  await page.fill('textarea[name="dream-prompt"]', 'Hi');

  await expect(page.locator('button:has-text("Generate")')).toBeDisabled();
  await expect(page.locator('text=at least 10 characters')).toBeVisible();
});

test('shows error for prompt too long', async ({ page }) => {
  await page.goto('/');
  const longPrompt = 'A'.repeat(501);
  await page.fill('textarea[name="dream-prompt"]', longPrompt);

  await expect(page.locator('button:has-text("Generate")')).toBeDisabled();
  await expect(page.locator('text=maximum 500 characters')).toBeVisible();
});

test('handles API error gracefully', async ({ page }) => {
  await page.route('**/api/create-video', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'API Error' })
    });
  });

  await page.goto('/');
  await page.fill('textarea[name="dream-prompt"]', 'A valid dream prompt');
  await page.click('button:has-text("Generate")');

  await expect(page.locator('text=failed')).toBeVisible();
});
```

---

### US-4.5: Local Storage Tests
**As a** QA engineer
**I want** tests for video history persistence
**So that** local storage works correctly

**Acceptance Criteria:**
- Test saving videos to history
- Test loading videos from history
- Test clearing history
- Test persistence across page reloads
- Test handling corrupted storage data

**Tasks:**
- [ ] Create `/tests/e2e/local-storage.spec.ts`
- [ ] Test video history save
- [ ] Test video history load
- [ ] Test clear history
- [ ] Test page reload persistence
- [ ] Test storage quota limits
- [ ] Test invalid storage data handling

**Test Examples:**
```typescript
// tests/e2e/local-storage.spec.ts
import { test, expect } from '@playwright/test';

test('persists video history across page reloads', async ({ page, context }) => {
  await page.goto('/');

  // Generate a video (or mock the response)
  const jobId = 'video_test123';
  await page.evaluate((id) => {
    localStorage.setItem('dream-videos-history', JSON.stringify({
      version: 1,
      videos: [{
        jobId: id,
        prompt: 'Test dream',
        createdAt: new Date().toISOString(),
        status: 'completed'
      }]
    }));
  }, jobId);

  // Reload page
  await page.reload();

  // Verify history still exists
  await expect(page.locator(`text=${jobId}`)).toBeVisible();
});

test('clears history when requested', async ({ page }) => {
  await page.goto('/');

  // Add some history
  await page.evaluate(() => {
    localStorage.setItem('dream-videos-history', JSON.stringify({
      version: 1,
      videos: [{ jobId: 'test', prompt: 'Test', createdAt: '', status: 'completed' }]
    }));
  });

  // Clear history
  await page.click('button:has-text("Clear History")');

  // Verify history is empty
  const storage = await page.evaluate(() => localStorage.getItem('dream-videos-history'));
  expect(JSON.parse(storage).videos).toHaveLength(0);
});
```

---

### US-4.6: Deployment Tests
**As a** DevOps engineer
**I want** tests that verify deployment works
**So that** the app functions correctly on Netlify

**Acceptance Criteria:**
- Test can run against deployed URL
- Test environment variables are set
- Test functions are accessible
- Test blob storage works
- Can run tests in CI/CD pipeline

**Tasks:**
- [ ] Create deployment test configuration
- [ ] Add environment variable for test URL
- [ ] Create CI/CD workflow file (GitHub Actions)
- [ ] Test against preview deployments
- [ ] Add smoke tests for production
- [ ] Configure test reporting
- [ ] Add deployment verification script

**CI/CD Configuration:**
```yaml
# .github/workflows/test.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/
```

**Deployment Smoke Test:**
```typescript
// tests/e2e/deployment.spec.ts
import { test, expect } from '@playwright/test';

test('deployed app is accessible', async ({ page }) => {
  const deployedUrl = process.env.DEPLOY_URL || 'http://localhost:8888';
  await page.goto(deployedUrl);

  await expect(page).toHaveTitle(/Dream Video/);
  await expect(page.locator('textarea')).toBeVisible();
});

test('API functions are reachable', async ({ request }) => {
  const deployedUrl = process.env.DEPLOY_URL || 'http://localhost:8888';

  const response = await request.post(`${deployedUrl}/api/create-video`, {
    data: { prompt: 'Test dream for deployment verification' }
  });

  expect(response.status()).toBe(200);
});
```

---

### US-4.7: Test Data and Fixtures
**As a** developer
**I want** reusable test data and fixtures
**So that** tests are consistent and maintainable

**Acceptance Criteria:**
- Test fixtures for common scenarios
- Mock data for API responses
- Reusable test helpers
- Consistent test data across tests

**Tasks:**
- [ ] Create `/tests/fixtures` directory
- [ ] Create mock video job responses
- [ ] Create test helper functions
- [ ] Create page object models
- [ ] Document fixture usage
- [ ] Add TypeScript types for fixtures

**Fixtures Example:**
```typescript
// tests/fixtures/mock-data.ts
export const mockVideoJob = {
  jobId: 'video_test123',
  status: 'pending',
  createdAt: '2025-10-22T21:00:00Z'
};

export const mockCompletedJob = {
  ...mockVideoJob,
  status: 'completed',
  completedAt: '2025-10-22T21:05:00Z',
  videoUrl: 'https://example.com/video.mp4'
};

// tests/fixtures/helpers.ts
export async function fillDreamForm(page: Page, prompt: string) {
  await page.fill('textarea[name="dream-prompt"]', prompt);
  await page.click('button:has-text("Generate")');
}

export async function waitForVideoCompletion(page: Page, timeout = 300000) {
  await page.waitForSelector('text=completed', { timeout });
}
```

---

## Definition of Done
- [ ] Playwright is installed and configured
- [ ] Unit tests for all Netlify functions pass
- [ ] Happy path E2E test passes locally
- [ ] Error scenario tests pass
- [ ] Local storage tests pass
- [ ] Tests can run against deployed app
- [ ] CI/CD pipeline runs tests automatically
- [ ] Test coverage meets minimum threshold (80%)
- [ ] All tests are documented
- [ ] Test results are reported clearly

## Dependencies
- Epic 1: Project Setup & Infrastructure
- Epic 2: Core Netlify Functions
- Epic 3: Basic Frontend UI

## Estimated Effort
6-8 hours

## Technical Notes

### Testing Strategy
1. **Unit Tests**: Fast, isolated tests for individual functions
2. **Integration Tests**: Test function + API interactions
3. **E2E Tests**: Full user workflows in real browser
4. **Smoke Tests**: Quick verification of deployed app

### Test Data Management
- Use fixtures for consistent test data
- Mock external API calls in unit tests
- Use real API in integration tests (with test account)
- Consider using Netlify preview deployments for E2E

### Performance Considerations
- Video generation takes 3-5 minutes - plan test timeouts accordingly
- Run expensive E2E tests in CI only
- Use parallel test execution where possible
- Cache dependencies in CI

### Debugging Failed Tests
- Playwright saves screenshots on failure
- Video recordings available for E2E tests
- Use `--debug` flag for step-through debugging
- Check Netlify function logs for backend errors
