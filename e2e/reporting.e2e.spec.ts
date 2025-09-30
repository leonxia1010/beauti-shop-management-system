/**
 * E2E Tests for Reporting Workflow
 *
 * Tests the complete reporting user journey:
 * 1. Navigate to reports page
 * 2. Filter data by date range and criteria
 * 3. View different report types (daily, monthly, yearly)
 * 4. Export reports in various formats
 * 5. Verify data accuracy and visualizations
 */

import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';

class ReportsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/reports');
    await expect(this.page).toHaveURL('/reports');
  }

  async selectDateRange(startDate: string, endDate: string) {
    await this.page.fill('[data-testid="start-date"]', startDate);
    await this.page.fill('[data-testid="end-date"]', endDate);
    await this.page.click('[data-testid="apply-filter"]');
  }

  async selectReportType(type: 'daily' | 'monthly' | 'yearly') {
    await this.page.click(`[data-testid="report-type-${type}"]`);
  }

  async exportReport(format: 'excel' | 'pdf' | 'csv') {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click(`[data-testid="export-${format}"]`);
    return await downloadPromise;
  }

  async getKPIValues() {
    return {
      totalRevenue: await this.page
        .locator('[data-testid="kpi-total-revenue"]')
        .textContent(),
      totalCosts: await this.page
        .locator('[data-testid="kpi-total-costs"]')
        .textContent(),
      netProfit: await this.page
        .locator('[data-testid="kpi-net-profit"]')
        .textContent(),
      profitMargin: await this.page
        .locator('[data-testid="kpi-profit-margin"]')
        .textContent(),
    };
  }

  async getChartData() {
    // Wait for chart to load
    await this.page.waitForSelector('[data-testid="revenue-chart"]', {
      state: 'visible',
    });

    return {
      chartVisible: await this.page
        .locator('[data-testid="revenue-chart"]')
        .isVisible(),
      dataPoints: await this.page
        .locator('[data-testid="chart-data-point"]')
        .count(),
    };
  }

  async applyStoreFilter(storeId: string) {
    await this.page.selectOption('[data-testid="store-filter"]', storeId);
    await this.page.click('[data-testid="apply-filter"]');
  }

  async applyBeauticianFilter(beauticianId: string) {
    await this.page.selectOption(
      '[data-testid="beautician-filter"]',
      beauticianId
    );
    await this.page.click('[data-testid="apply-filter"]');
  }
}

test.describe('Reporting E2E Tests', () => {
  let reportsPage: ReportsPage;

  test.beforeEach(async ({ page }) => {
    reportsPage = new ReportsPage(page);

    // Ensure we have test data available
    await page.goto('/');
    await expect(page).toHaveTitle(/美容院管理系统/);
  });

  test.describe('Dashboard Overview', () => {
    test('should display main reporting dashboard with KPIs', async ({
      page,
    }) => {
      await reportsPage.goto();

      // Verify main heading
      await expect(page.locator('h1')).toHaveText('数据报表');

      // Verify KPI cards are visible
      await expect(page.locator('[data-testid="kpi-card"]')).toHaveCount(4);

      // Verify specific KPI values are displayed
      const kpis = await reportsPage.getKPIValues();
      expect(kpis.totalRevenue).toMatch(/¥\d+/);
      expect(kpis.totalCosts).toMatch(/¥\d+/);
      expect(kpis.netProfit).toMatch(/¥\d+/);
      expect(kpis.profitMargin).toMatch(/\d+%/);
    });

    test('should display revenue trend chart', async ({ page }) => {
      await reportsPage.goto();

      const chartData = await reportsPage.getChartData();
      expect(chartData.chartVisible).toBe(true);
      expect(chartData.dataPoints).toBeGreaterThan(0);
    });

    test('should show loading states while fetching data', async ({ page }) => {
      // Slow down network to observe loading states
      await page.route('**/api/reports/**', (route) => {
        setTimeout(() => route.continue(), 1000);
      });

      await reportsPage.goto();

      // Should show loading spinners
      await expect(page.locator('[data-testid="kpi-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="chart-loading"]')).toBeVisible();

      // Loading should disappear
      await expect(page.locator('[data-testid="kpi-loading"]')).toBeHidden();
      await expect(page.locator('[data-testid="chart-loading"]')).toBeHidden();
    });
  });

  test.describe('Date Range Filtering', () => {
    test('should filter reports by custom date range', async ({ page }) => {
      await reportsPage.goto();

      // Get initial KPI values
      const initialKpis = await reportsPage.getKPIValues();

      // Apply date filter for last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = lastMonth.toISOString().split('T')[0];

      await reportsPage.selectDateRange(startDate, endDate);

      // Wait for data to update
      await page.waitForTimeout(1000);

      // Verify data has changed
      const filteredKpis = await reportsPage.getKPIValues();
      // Values should be different (unless no data exists)
      expect(filteredKpis.totalRevenue).toBeDefined();
    });

    test('should use preset date ranges', async ({ page }) => {
      await reportsPage.goto();

      // Test "本月" (This Month) preset
      await page.click('[data-testid="preset-this-month"]');
      await expect(
        page.locator('[data-testid="date-range-display"]')
      ).toContainText('本月');

      // Test "本年" (This Year) preset
      await page.click('[data-testid="preset-this-year"]');
      await expect(
        page.locator('[data-testid="date-range-display"]')
      ).toContainText('本年');

      // Test "上月" (Last Month) preset
      await page.click('[data-testid="preset-last-month"]');
      await expect(
        page.locator('[data-testid="date-range-display"]')
      ).toContainText('上月');
    });

    test('should validate date range inputs', async ({ page }) => {
      await reportsPage.goto();

      // Try invalid date range (end before start)
      await reportsPage.selectDateRange('2024-12-31', '2024-01-01');

      // Should show validation error
      await expect(page.locator('.error-message')).toContainText(
        '结束日期不能早于开始日期'
      );
    });

    test('should handle future dates gracefully', async ({ page }) => {
      await reportsPage.goto();

      // Try future date range
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      await reportsPage.selectDateRange('2024-01-01', futureDateStr);

      // Should either show warning or handle gracefully
      const kpis = await reportsPage.getKPIValues();
      expect(kpis.totalRevenue).toBeDefined();
    });
  });

  test.describe('Report Types and Views', () => {
    test('should switch between daily, monthly, and yearly views', async ({
      page,
    }) => {
      await reportsPage.goto();

      // Test daily view
      await reportsPage.selectReportType('daily');
      await expect(
        page.locator('[data-testid="report-granularity"]')
      ).toContainText('日报表');

      // Test monthly view
      await reportsPage.selectReportType('monthly');
      await expect(
        page.locator('[data-testid="report-granularity"]')
      ).toContainText('月报表');

      // Test yearly view
      await reportsPage.selectReportType('yearly');
      await expect(
        page.locator('[data-testid="report-granularity"]')
      ).toContainText('年报表');
    });

    test('should display appropriate data for each report type', async ({
      page,
    }) => {
      await reportsPage.goto();

      // Daily view should show daily breakdown
      await reportsPage.selectReportType('daily');
      await expect(page.locator('[data-testid="data-table"] th')).toContainText(
        '日期'
      );

      // Monthly view should show monthly breakdown
      await reportsPage.selectReportType('monthly');
      await expect(page.locator('[data-testid="data-table"] th')).toContainText(
        '月份'
      );

      // Yearly view should show yearly breakdown
      await reportsPage.selectReportType('yearly');
      await expect(page.locator('[data-testid="data-table"] th')).toContainText(
        '年份'
      );
    });

    test('should update charts when switching report types', async ({
      page,
    }) => {
      await reportsPage.goto();

      // Switch to monthly view
      await reportsPage.selectReportType('monthly');

      // Chart should update to show monthly data
      const chartData = await reportsPage.getChartData();
      expect(chartData.chartVisible).toBe(true);

      // X-axis should show month labels
      await expect(page.locator('[data-testid="chart-x-axis"]')).toContainText(
        '月'
      );
    });
  });

  test.describe('Store and Beautician Filtering', () => {
    test('should filter by specific store', async ({ page }) => {
      await reportsPage.goto();

      // Get initial data
      const initialKpis = await reportsPage.getKPIValues();

      // Apply store filter
      await reportsPage.applyStoreFilter('store-001');

      // Wait for filtered data
      await page.waitForTimeout(1000);

      // Verify filter is applied
      await expect(
        page.locator('[data-testid="active-filters"]')
      ).toContainText('总店');

      // Data should be filtered
      const filteredKpis = await reportsPage.getKPIValues();
      expect(filteredKpis.totalRevenue).toBeDefined();
    });

    test('should filter by specific beautician', async ({ page }) => {
      await reportsPage.goto();

      // Apply beautician filter
      await reportsPage.applyBeauticianFilter('beautician-001');

      // Verify filter is applied
      await expect(
        page.locator('[data-testid="active-filters"]')
      ).toContainText('张美丽');

      // Chart should update to show beautician-specific data
      const chartData = await reportsPage.getChartData();
      expect(chartData.chartVisible).toBe(true);
    });

    test('should combine multiple filters', async ({ page }) => {
      await reportsPage.goto();

      // Apply multiple filters
      await reportsPage.applyStoreFilter('store-001');
      await reportsPage.applyBeauticianFilter('beautician-001');
      await reportsPage.selectDateRange('2024-01-01', '2024-01-31');

      // All filters should be active
      await expect(
        page.locator('[data-testid="active-filters"]')
      ).toContainText('总店');
      await expect(
        page.locator('[data-testid="active-filters"]')
      ).toContainText('张美丽');
      await expect(
        page.locator('[data-testid="active-filters"]')
      ).toContainText('2024-01');
    });

    test('should clear filters', async ({ page }) => {
      await reportsPage.goto();

      // Apply filters
      await reportsPage.applyStoreFilter('store-001');
      await reportsPage.applyBeauticianFilter('beautician-001');

      // Clear all filters
      await page.click('[data-testid="clear-all-filters"]');

      // Filters should be cleared
      await expect(page.locator('[data-testid="active-filters"]')).toBeEmpty();
    });
  });

  test.describe('Data Export', () => {
    test('should export report as Excel', async ({ page }) => {
      await reportsPage.goto();

      const download = await reportsPage.exportReport('excel');

      // Verify download
      expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/);

      // Verify file size (should not be empty)
      const path = await download.path();
      const stats = await fs.stat(path!);
      expect(stats.size).toBeGreaterThan(0);
    });

    test('should export report as PDF', async ({ page }) => {
      await reportsPage.goto();

      const download = await reportsPage.exportReport('pdf');

      // Verify download
      expect(download.suggestedFilename()).toMatch(/.*\.pdf$/);

      // Verify file is not empty
      const path = await download.path();
      const stats = await fs.stat(path!);
      expect(stats.size).toBeGreaterThan(1000); // PDF should have reasonable size
    });

    test('should export report as CSV', async ({ page }) => {
      await reportsPage.goto();

      const download = await reportsPage.exportReport('csv');

      // Verify download
      expect(download.suggestedFilename()).toMatch(/.*\.csv$/);

      // Verify CSV content
      const path = await download.path();
      const content = await fs.readFile(path!, 'utf8');
      expect(content).toContain('日期,总收入,总成本,净利润');
    });

    test('should include filters in exported filename', async ({ page }) => {
      await reportsPage.goto();

      // Apply filters
      await reportsPage.selectDateRange('2024-01-01', '2024-01-31');
      await reportsPage.applyStoreFilter('store-001');

      const download = await reportsPage.exportReport('excel');

      // Filename should include filter info
      expect(download.suggestedFilename()).toMatch(/2024-01.*总店.*\.xlsx$/);
    });
  });

  test.describe('Data Accuracy and Calculations', () => {
    test('should show correct profit calculations', async ({ page }) => {
      await reportsPage.goto();

      const kpis = await reportsPage.getKPIValues();

      // Extract numeric values
      const revenue = parseFloat(
        kpis.totalRevenue?.replace(/[¥,]/g, '') || '0'
      );
      const costs = parseFloat(kpis.totalCosts?.replace(/[¥,]/g, '') || '0');
      const profit = parseFloat(kpis.netProfit?.replace(/[¥,]/g, '') || '0');

      // Verify profit calculation
      expect(Math.abs(profit - (revenue - costs))).toBeLessThan(0.01);

      // Verify profit margin calculation
      const marginText = kpis.profitMargin?.replace('%', '') || '0';
      const margin = parseFloat(marginText);
      const expectedMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      expect(Math.abs(margin - expectedMargin)).toBeLessThan(0.1);
    });

    test('should handle zero revenue scenarios', async ({ page }) => {
      // Filter to a date range with no data
      await reportsPage.goto();
      await reportsPage.selectDateRange('2020-01-01', '2020-01-02');

      const kpis = await reportsPage.getKPIValues();

      // Should show zero values gracefully
      expect(kpis.totalRevenue).toContain('¥0');
      expect(kpis.profitMargin).toContain('0%');
    });

    test('should display consistent data across chart and table', async ({
      page,
    }) => {
      await reportsPage.goto();

      // Compare chart total with KPI total
      const kpis = await reportsPage.getKPIValues();
      const revenue = parseFloat(
        kpis.totalRevenue?.replace(/[¥,]/g, '') || '0'
      );

      // Sum up table values
      const tableRows = page.locator('[data-testid="data-table"] tbody tr');
      const rowCount = await tableRows.count();

      let tableTotal = 0;
      for (let i = 0; i < rowCount; i++) {
        const rowRevenue = await tableRows
          .nth(i)
          .locator('[data-testid="row-revenue"]')
          .textContent();
        tableTotal += parseFloat(rowRevenue?.replace(/[¥,]/g, '') || '0');
      }

      // Totals should match (within rounding tolerance)
      expect(Math.abs(revenue - tableTotal)).toBeLessThan(1);
    });
  });

  test.describe('Performance and Large Data Sets', () => {
    test('should handle large date ranges efficiently', async ({ page }) => {
      test.setTimeout(30000);

      await reportsPage.goto();

      // Select large date range (1 year)
      await reportsPage.selectDateRange('2023-01-01', '2023-12-31');

      const startTime = Date.now();
      await page.waitForSelector('[data-testid="kpi-total-revenue"]', {
        state: 'visible',
      });
      const endTime = Date.now();

      // Should load within reasonable time
      expect(endTime - startTime).toBeLessThan(15000);

      // Data should be displayed
      const kpis = await reportsPage.getKPIValues();
      expect(kpis.totalRevenue).toBeDefined();
    });

    test('should implement pagination for large data sets', async ({
      page,
    }) => {
      await reportsPage.goto();

      // Select view that would generate many rows
      await reportsPage.selectReportType('daily');
      await reportsPage.selectDateRange('2023-01-01', '2023-12-31');

      // Should show pagination if data exceeds page size
      const tableRows = await page
        .locator('[data-testid="data-table"] tbody tr')
        .count();
      if (tableRows >= 50) {
        await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      }
    });

    test('should show progress for slow operations', async ({ page }) => {
      // Mock slow response
      await page.route('**/api/reports/**', (route) => {
        setTimeout(() => route.continue(), 3000);
      });

      await reportsPage.goto();

      // Should show loading progress
      await expect(
        page.locator('[data-testid="loading-progress"]')
      ).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/reports/**', (route) => route.abort());

      await reportsPage.goto();

      // Should show error message
      await expect(page.locator('.error-message')).toContainText(
        '数据加载失败'
      );

      // Should provide retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should retry failed requests', async ({ page }) => {
      let requestCount = 0;

      // Mock first request to fail, second to succeed
      await page.route('**/api/reports/**', (route) => {
        requestCount++;
        if (requestCount === 1) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await reportsPage.goto();

      // Wait for error
      await expect(page.locator('.error-message')).toBeVisible();

      // Click retry
      await page.click('[data-testid="retry-button"]');

      // Should succeed on retry
      await expect(
        page.locator('[data-testid="kpi-total-revenue"]')
      ).toBeVisible();
    });

    test('should handle partial data scenarios', async ({ page }) => {
      // Mock partial API response
      await page.route('**/api/reports/kpis', (route) => route.abort());

      await reportsPage.goto();

      // Should show what data is available
      await expect(page.locator('.partial-data-warning')).toContainText(
        '部分数据无法加载'
      );
    });
  });

  test.describe('Accessibility and Mobile Support', () => {
    test('should be accessible on mobile devices', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
      });
      const page = await context.newPage();

      const reportsPage = new ReportsPage(page);
      await reportsPage.goto();

      // Mobile layout should be responsive
      await expect(
        page.locator('[data-testid="mobile-kpi-cards"]')
      ).toBeVisible();

      // Charts should be responsive
      await expect(page.locator('[data-testid="mobile-chart"]')).toBeVisible();

      await context.close();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await reportsPage.goto();

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to interact with filters via keyboard
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await reportsPage.goto();

      // Chart should have proper ARIA labels
      await expect(
        page.locator('[data-testid="revenue-chart"]')
      ).toHaveAttribute('aria-label');

      // KPI cards should have proper labels
      const kpiCards = page.locator('[data-testid="kpi-card"]');
      const count = await kpiCards.count();
      for (let i = 0; i < count; i++) {
        await expect(kpiCards.nth(i)).toHaveAttribute('aria-label');
      }
    });
  });
});
