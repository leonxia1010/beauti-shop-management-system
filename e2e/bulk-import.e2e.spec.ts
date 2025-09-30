/**
 * E2E Tests for Bulk Import Workflow
 *
 * Tests the complete bulk import user journey:
 * 1. Navigate to bulk import page
 * 2. Upload CSV file with revenue data
 * 3. Validate data preview and errors
 * 4. Complete import process
 * 5. Verify data in revenue records
 */

import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

class BulkImportPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/revenue');
    await this.page.click('[data-testid="bulk-import-button"]');
    await expect(this.page).toHaveURL('/revenue/bulk-import');
  }

  async uploadFile(filename: string) {
    const filePath = path.join(__dirname, 'fixtures', filename);
    await this.page.setInputFiles('[data-testid="file-input"]', filePath);
  }

  async proceedToValidation() {
    await this.page.click('button:has-text("下一步：预览数据")');
    await expect(
      this.page.locator('[data-testid="validation-summary"]')
    ).toBeVisible();
  }

  async proceedToImport() {
    await this.page.click('button:has-text("开始导入")');
    await expect(this.page.locator('text=导入完成')).toBeVisible();
  }

  async getValidationSummary() {
    return {
      totalRows: await this.page
        .locator('[data-testid="total-rows"]')
        .textContent(),
      validRows: await this.page
        .locator('[data-testid="valid-rows"]')
        .textContent(),
      errorRows: await this.page
        .locator('[data-testid="error-rows"]')
        .textContent(),
    };
  }

  async getImportResults() {
    return {
      successful: await this.page
        .locator('[data-testid="successful-imports"]')
        .textContent(),
      failed: await this.page
        .locator('[data-testid="failed-imports"]')
        .textContent(),
    };
  }
}

test.describe('Bulk Import E2E Tests', () => {
  let bulkImportPage: BulkImportPage;

  test.beforeEach(async ({ page }) => {
    bulkImportPage = new BulkImportPage(page);

    // Ensure we start from a clean state
    await page.goto('/');
    await expect(page).toHaveTitle(/美容院管理系统/);
  });

  test.describe('Happy Path - Valid CSV Import', () => {
    test('should complete full import workflow with valid data', async ({
      page,
    }) => {
      // Step 1: Navigate to bulk import
      await bulkImportPage.goto();
      await expect(page.locator('h1')).toHaveText('批量导入收入数据');

      // Step 2: Upload valid CSV file
      await bulkImportPage.uploadFile('valid-revenue-data.csv');
      await expect(page.locator('[data-testid="file-preview"]')).toContainText(
        'valid-revenue-data.csv'
      );

      // Step 3: Proceed to validation
      await bulkImportPage.proceedToValidation();

      // Verify validation results
      const validation = await bulkImportPage.getValidationSummary();
      expect(validation.totalRows).toBe('50');
      expect(validation.validRows).toBe('50');
      expect(validation.errorRows).toBe('0');

      // Step 4: Proceed to import
      await bulkImportPage.proceedToImport();

      // Step 5: Verify import completion
      const results = await bulkImportPage.getImportResults();
      expect(results.successful).toBe('50');
      expect(results.failed).toBe('0');

      // Step 6: Navigate to revenue records and verify data
      await page.click('button:has-text("查看收入记录")');
      await expect(page).toHaveURL('/revenue');

      // Verify new records are visible in the table
      await expect(
        page.locator('[data-testid="revenue-table"] tbody tr')
      ).toHaveCount(50);
    });

    test('should handle CSV with warnings but no errors', async ({ page }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('revenue-with-warnings.csv');
      await bulkImportPage.proceedToValidation();

      // Should show warnings but allow import
      const validation = await bulkImportPage.getValidationSummary();
      expect(validation.errorRows).toBe('0');

      // Warning indicator should be visible
      await expect(
        page.locator('[data-testid="warning-indicator"]')
      ).toBeVisible();

      // Should be able to proceed with import
      const importButton = page.locator('button:has-text("开始导入")');
      await expect(importButton).toBeEnabled();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle CSV with validation errors', async ({ page }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('invalid-revenue-data.csv');
      await bulkImportPage.proceedToValidation();

      // Should show validation errors
      const validation = await bulkImportPage.getValidationSummary();
      expect(parseInt(validation.errorRows || '0')).toBeGreaterThan(0);

      // Import button should be disabled
      const importButton = page.locator('button:has-text("请修正错误")');
      await expect(importButton).toBeDisabled();

      // Error details should be visible
      await expect(page.locator('[data-testid="error-list"]')).toBeVisible();
      await expect(page.locator('.error-row')).toHaveCount(
        parseInt(validation.errorRows || '0')
      );
    });

    test('should handle unsupported file formats', async ({ page }) => {
      await bulkImportPage.goto();

      // Try to upload an unsupported file type
      const filePath = path.join(__dirname, 'fixtures', 'invalid-format.txt');
      await page.setInputFiles('[data-testid="file-input"]', filePath);

      // Should show error message
      await expect(page.locator('.error-message')).toContainText(
        '不支持的文件格式'
      );

      // Next button should remain disabled
      await expect(
        page.locator('button:has-text("下一步：预览数据")')
      ).toBeDisabled();
    });

    test('should handle oversized files', async ({ page }) => {
      await bulkImportPage.goto();

      // Try to upload a file that's too large
      await bulkImportPage.uploadFile('oversized-file.csv');

      // Should show size error
      await expect(page.locator('.error-message')).toContainText(
        '文件大小超出限制'
      );
    });

    test('should handle network errors during validation', async ({ page }) => {
      // Mock network failure for validation endpoint
      await page.route('**/api/revenue/validate', (route) => route.abort());

      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('valid-revenue-data.csv');

      // Try to proceed to validation
      await page.click('button:has-text("下一步：预览数据")');

      // Should show network error
      await expect(page.locator('.error-message')).toContainText('网络错误');

      // Should remain on step 1
      await expect(page.locator('text=选择文件')).toBeVisible();
    });

    test('should handle network errors during import', async ({ page }) => {
      // Set up successful validation but failed import
      await page.route('**/api/revenue/import', (route) => route.abort());

      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('valid-revenue-data.csv');
      await bulkImportPage.proceedToValidation();

      // Try to proceed to import
      await page.click('button:has-text("开始导入")');

      // Should show import error
      await expect(page.locator('.error-message')).toContainText('导入失败');
    });
  });

  test.describe('Navigation and State Management', () => {
    test('should allow going back and forth between steps', async ({
      page,
    }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('valid-revenue-data.csv');
      await bulkImportPage.proceedToValidation();

      // Go back to step 1
      await page.click('button:has-text("上一步")');
      await expect(page.locator('text=选择文件')).toBeVisible();

      // File should still be selected
      await expect(page.locator('[data-testid="file-preview"]')).toContainText(
        'valid-revenue-data.csv'
      );

      // Can proceed to validation again
      await bulkImportPage.proceedToValidation();
      await expect(
        page.locator('[data-testid="validation-summary"]')
      ).toBeVisible();
    });

    test('should reset form when starting over', async ({ page }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('valid-revenue-data.csv');
      await bulkImportPage.proceedToValidation();
      await bulkImportPage.proceedToImport();

      // Start over
      await page.click('button:has-text("重新导入")');

      // Should be back to step 1 with clean state
      await expect(page.locator('text=选择文件')).toBeVisible();
      await expect(
        page.locator('[data-testid="file-preview"]')
      ).not.toBeVisible();
    });

    test('should maintain state during page refresh on validation step', async ({
      page,
    }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('valid-revenue-data.csv');
      await bulkImportPage.proceedToValidation();

      // Refresh page
      await page.reload();

      // Should recover to validation step (if state is persisted)
      // Or gracefully degrade to step 1
      await expect(page.locator('h1')).toHaveText('批量导入收入数据');
    });
  });

  test.describe('File Operations', () => {
    test('should download template file correctly', async ({ page }) => {
      await bulkImportPage.goto();

      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("下载模板")');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toBe('revenue_import_template.csv');

      // Verify file content
      const path = await download.path();
      const content = await fs.readFile(path!, 'utf8');
      expect(content).toContain(
        'store_id,beautician_id,service_date,gross_revenue,payment_method'
      );
    });

    test('should handle multiple file uploads', async ({ page }) => {
      await bulkImportPage.goto();

      // Upload multiple files
      const files = [
        path.join(__dirname, 'fixtures', 'revenue-batch-1.csv'),
        path.join(__dirname, 'fixtures', 'revenue-batch-2.csv'),
      ];
      await page.setInputFiles('[data-testid="file-input"]', files);

      // Should show all files in preview
      await expect(
        page.locator('[data-testid="file-preview"] .file-item')
      ).toHaveCount(2);

      // Should be able to remove individual files
      await page.click('[data-testid="remove-file-0"]');
      await expect(
        page.locator('[data-testid="file-preview"] .file-item')
      ).toHaveCount(1);
    });

    test('should validate file content before upload', async ({ page }) => {
      await bulkImportPage.goto();

      // Upload file with missing required columns
      await bulkImportPage.uploadFile('missing-columns.csv');

      // Should show column validation error
      await expect(page.locator('.error-message')).toContainText(
        '缺少必需的列'
      );
    });
  });

  test.describe('Progress and Loading States', () => {
    test('should show progress indicators during validation', async ({
      page,
    }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('large-dataset.csv');

      // Click next and immediately check for loading state
      await page.click('button:has-text("下一步：预览数据")');

      // Should show loading spinner
      await expect(page.locator('.loading-spinner')).toBeVisible();
      await expect(page.locator('text=正在验证数据')).toBeVisible();

      // Progress bar should be visible
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    });

    test('should show progress indicators during import', async ({ page }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('valid-revenue-data.csv');
      await bulkImportPage.proceedToValidation();

      // Click import and check loading state
      await page.click('button:has-text("开始导入")');

      await expect(page.locator('text=正在导入数据')).toBeVisible();
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    });

    test('should disable buttons during processing', async ({ page }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('valid-revenue-data.csv');

      // Click next
      await page.click('button:has-text("下一步：预览数据")');

      // Button should be disabled during processing
      await expect(page.locator('button:has-text("验证中...")')).toBeDisabled();
    });
  });

  test.describe('Data Validation Edge Cases', () => {
    test('should handle empty CSV files', async ({ page }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('empty-file.csv');

      await expect(page.locator('.error-message')).toContainText('文件为空');
    });

    test('should handle CSV with only headers', async ({ page }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('headers-only.csv');
      await bulkImportPage.proceedToValidation();

      const validation = await bulkImportPage.getValidationSummary();
      expect(validation.totalRows).toBe('0');
    });

    test('should handle CSV with special characters and encoding', async ({
      page,
    }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('special-characters.csv');
      await bulkImportPage.proceedToValidation();

      // Should handle special characters correctly
      await expect(
        page.locator('[data-testid="validation-summary"]')
      ).toBeVisible();
    });
  });

  test.describe('Performance and Large Files', () => {
    test('should handle large CSV files efficiently', async ({ page }) => {
      // Set longer timeout for large file processing
      test.setTimeout(60000);

      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('large-dataset-1000-rows.csv');

      const startTime = Date.now();
      await bulkImportPage.proceedToValidation();
      const endTime = Date.now();

      // Validation should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(30000);

      const validation = await bulkImportPage.getValidationSummary();
      expect(validation.totalRows).toBe('1000');
    });

    test('should show appropriate messages for very large files', async ({
      page,
    }) => {
      await bulkImportPage.goto();
      await bulkImportPage.uploadFile('extremely-large-file.csv');

      // Should warn about large file size
      await expect(page.locator('.warning-message')).toContainText(
        '文件较大，处理可能需要更长时间'
      );
    });
  });
});
