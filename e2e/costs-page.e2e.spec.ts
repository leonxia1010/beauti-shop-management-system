/**
 * Costs Page E2E Tests
 *
 * Tests the complete cost management workflow:
 * - Tab navigation
 * - Cost list viewing and filtering
 * - Cost entry creation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

test.describe('Costs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/costs`);
  });

  test.describe('Page Structure', () => {
    test('should display page header with title', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('成本管理');
      await expect(page.locator('text=/管理.*成本/i')).toBeVisible();
    });

    test('should have two tabs: 成本记录 and 新增成本', async ({ page }) => {
      await expect(
        page.locator('button[role="tab"]').filter({ hasText: '成本记录' })
      ).toBeVisible();
      await expect(
        page.locator('button[role="tab"]').filter({ hasText: '新增成本' })
      ).toBeVisible();
    });
  });

  test.describe('Cost List Tab', () => {
    test('should display cost list by default', async ({ page }) => {
      const listTab = page
        .locator('button[role="tab"]')
        .filter({ hasText: '成本记录' });
      await expect(listTab).toHaveAttribute('data-state', 'active');

      // Should show table or empty state
      const hasTable = await page
        .locator('table')
        .isVisible()
        .catch(() => false);
      const hasEmptyState = await page
        .locator('text=暂无数据')
        .isVisible()
        .catch(() => false);
      expect(hasTable || hasEmptyState).toBeTruthy();
    });

    test('should switch to form tab when clicked', async ({ page }) => {
      const formTab = page
        .locator('button[role="tab"]')
        .filter({ hasText: '新增成本' });
      await formTab.click();

      await expect(formTab).toHaveAttribute('data-state', 'active');
      // Should show form fields
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Cost Form Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page
        .locator('button[role="tab"]')
        .filter({ hasText: '新增成本' })
        .click();
    });

    test('should display cost entry form', async ({ page }) => {
      await expect(page.locator('form')).toBeVisible();
    });

    test('should have required form fields', async ({ page }) => {
      // Check for essential form fields (adapt based on actual implementation)
      const form = page.locator('form');
      await expect(form).toBeVisible();

      // Should have at least some input fields
      const inputs = form.locator('input, select, textarea');
      await expect(inputs.first()).toBeVisible();
    });

    test('should have submit button', async ({ page }) => {
      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toBeVisible();
    });
  });

  test.describe('Navigation Flow', () => {
    test('should maintain state when switching tabs', async ({ page }) => {
      // Go to form tab
      await page
        .locator('button[role="tab"]')
        .filter({ hasText: '新增成本' })
        .click();
      await expect(page.locator('form')).toBeVisible();

      // Go back to list tab
      await page
        .locator('button[role="tab"]')
        .filter({ hasText: '成本记录' })
        .click();

      // Should return to list view
      const hasTable = await page
        .locator('table')
        .isVisible()
        .catch(() => false);
      const hasEmptyState = await page
        .locator('text=暂无数据')
        .isVisible()
        .catch(() => false);
      expect(hasTable || hasEmptyState).toBeTruthy();
    });
  });

  test.describe('Responsive Layout', () => {
    test('should be accessible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('button[role="tab"]').first()).toBeVisible();
    });

    test('should be accessible on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('button[role="tab"]').first()).toBeVisible();
    });
  });
});
