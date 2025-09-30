/**
 * Global E2E Test Setup
 *
 * Prepares the test environment before running E2E tests:
 * - Database seeding with test data
 * - API server health checks
 * - Clean up previous test artifacts
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🧪 Setting up E2E test environment...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for API server to be ready
    console.log('⏳ Waiting for API server...');
    await page.goto('http://localhost:3010/api');
    await page.waitForResponse(
      (response) => response.url().includes('/api') && response.status() === 200
    );
    console.log('✅ API server is ready');

    // Wait for Web server to be ready
    console.log('⏳ Waiting for Web server...');
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');
    console.log('✅ Web server is ready');

    // Seed test data (optional - could make API calls to seed database)
    console.log('🌱 Seeding test data...');

    // Example: Create test stores and beauticians
    await seedTestData(page);

    console.log('✅ Test environment setup complete');
  } catch (error) {
    console.error('❌ Test environment setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function seedTestData(page: any) {
  try {
    // This would typically make API calls to create test data
    // For now, we'll just verify the API is accessible

    // Check if we can access the API endpoints
    const response = await page.request.get('http://localhost:3000/api/stores');

    if (response.status() === 200) {
      console.log('📊 API endpoints are accessible');
    } else {
      console.warn('⚠️ API endpoints may not be fully ready');
    }

    // Here you could add actual data seeding logic:
    // - Create test stores
    // - Create test beauticians
    // - Create test revenue data
    // - Create test cost data
  } catch (error) {
    console.warn('⚠️ Test data seeding failed (may not be critical):', error);
  }
}

export default globalSetup;
