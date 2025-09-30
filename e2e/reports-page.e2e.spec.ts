/**
 * Reports Page E2E Tests
 *
 * Tests the financial reporting dashboard:
 * - KPI cards display
 * - Charts rendering
 * - Date range filtering
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/reports`);
  });

  test.describe('Page Structure', () => {
    test('should display page header with title', async ({ page }) => {
      await expect(page.locator('h1')).toContainText(/报表|财务/i);
    });

    test('should display KPI cards or metrics section', async ({ page }) => {
      // Should show some kind of metrics display
      const hasKPICard = await page
        .locator('[class*="kpi"]')
        .isVisible()
        .catch(() => false);
      const hasMetrics = await page
        .locator('text=/总收入|总成本|净利润/i')
        .isVisible()
        .catch(() => false);
      const hasCards = await page
        .locator('[class*="card"]')
        .count()
        .then((c) => c > 0);

      expect(hasKPICard || hasMetrics || hasCards).toBeTruthy();
    });
  });

  test.describe('Data Visualization', () => {
    test('should display charts or visualizations', async ({ page }) => {
      // Wait for potential chart rendering
      await page.waitForTimeout(1000);

      // Check for common chart elements
      const hasSVG = await page
        .locator('svg')
        .isVisible()
        .catch(() => false);
      const hasCanvas = await page
        .locator('canvas')
        .isVisible()
        .catch(() => false);
      const hasChartContainer = await page
        .locator('[class*="chart"]')
        .isVisible()
        .catch(() => false);

      expect(hasSVG || hasCanvas || hasChartContainer).toBeTruthy();
    });
  });

  test.describe('Filters and Controls', () => {
    test('should have date range filter or control', async ({ page }) => {
      // Look for date picker, select, or buttons
      const hasDatePicker = await page
        .locator('input[type="date"]')
        .isVisible()
        .catch(() => false);
      const hasSelect = await page
        .locator('select')
        .isVisible()
        .catch(() => false);
      const hasButtons = await page
        .locator('button')
        .filter({ hasText: /日|周|月|年/i })
        .isVisible()
        .catch(() => false);

      expect(hasDatePicker || hasSelect || hasButtons).toBeTruthy();
    });
  });

  test.describe('Responsive Layout', () => {
    test('should be accessible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator('h1')).toBeVisible();

      // KPIs should still be visible (may stack vertically)
      const hasVisibleContent = await page
        .locator('text=/总收入|总成本|报表/i')
        .isVisible()
        .catch(() => false);
      expect(hasVisibleContent).toBeTruthy();
    });

    test('should be accessible on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Data Loading States', () => {
    test('should handle empty or loading state gracefully', async ({
      page,
    }) => {
      // Page should render without crashing even if no data
      await expect(page.locator('h1')).toBeVisible();

      // Should not show error message for empty data
      const hasError = await page
        .locator('text=/错误|失败/i')
        .isVisible()
        .catch(() => false);
      expect(hasError).toBeFalsy();
    });
  });
});
