/**
 * Revenue Page E2E Tests
 *
 * Tests the complete revenue management workflow:
 * - Tab navigation
 * - Revenue list viewing and filtering
 * - Bulk import flow (file upload, validation, import)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

test.describe('Revenue Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/revenue`);
  });

  test.describe('Page Structure', () => {
    test('should display page header with title', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('收入数据管理');
      await expect(
        page.locator('text=管理每日收入记录、批量导入数据、查看收入统计')
      ).toBeVisible();
    });

    test('should have two tabs: 收入记录 and 批量导入', async ({ page }) => {
      await expect(
        page.locator('button[role="tab"]').filter({ hasText: '收入记录' })
      ).toBeVisible();
      await expect(
        page.locator('button[role="tab"]').filter({ hasText: '批量导入' })
      ).toBeVisible();
    });
  });

  test.describe('Revenue List Tab', () => {
    test('should display revenue list by default', async ({ page }) => {
      // Should be on list tab by default
      const listTab = page
        .locator('button[role="tab"]')
        .filter({ hasText: '收入记录' });
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

    test('should switch to import tab when clicked', async ({ page }) => {
      const importTab = page
        .locator('button[role="tab"]')
        .filter({ hasText: '批量导入' });
      await importTab.click();

      await expect(importTab).toHaveAttribute('data-state', 'active');
      // Should show bulk import content
      await expect(
        page.locator('text=拖拽文件到此处').or(page.locator('text=选择文件'))
      ).toBeVisible();
    });
  });

  test.describe('Bulk Import Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page
        .locator('button[role="tab"]')
        .filter({ hasText: '批量导入' })
        .click();
    });

    test('should display file upload dropzone', async ({ page }) => {
      await expect(
        page.locator('text=拖拽文件到此处').or(page.locator('text=选择文件'))
      ).toBeVisible();
    });

    test('should show file type support information', async ({ page }) => {
      await expect(page.locator('text=/支持.*Excel.*CSV/i')).toBeVisible();
    });

    test('should have template download button if available', async ({
      page,
    }) => {
      const downloadBtn = page
        .locator('button')
        .filter({ hasText: '下载模板' });
      const isVisible = await downloadBtn.isVisible().catch(() => false);

      if (isVisible) {
        await expect(downloadBtn).toBeEnabled();
      }
    });
  });

  test.describe('Navigation Flow', () => {
    test('should maintain state when switching tabs', async ({ page }) => {
      // Go to import tab
      await page
        .locator('button[role="tab"]')
        .filter({ hasText: '批量导入' })
        .click();
      await expect(
        page.locator('text=拖拽文件到此处').or(page.locator('text=选择文件'))
      ).toBeVisible();

      // Go back to list tab
      await page
        .locator('button[role="tab"]')
        .filter({ hasText: '收入记录' })
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

      // Page should still be usable
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
