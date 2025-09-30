/**
 * Global test setup for API Gateway integration tests
 */

import { vi } from 'vitest';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/beauty_shop_test';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Suppress console logs during tests unless explicitly needed
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: console.error, // Keep error logs visible
};
