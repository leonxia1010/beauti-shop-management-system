/**
 * Global test setup for API Gateway integration tests.
 *
 * Uses real PostgreSQL database for testing to ensure consistency
 * with production environment.
 */

import { vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/beauty_shop';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Suppress console logs during tests unless explicitly needed
// Keep error logs visible to help diagnose failures quickly.
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: console.error,
};
