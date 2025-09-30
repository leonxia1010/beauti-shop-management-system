/**
 * Reports API Integration Tests
 *
 * Following testing standards:
 * - Test complete API endpoints against ephemeral database
 * - Validate request/response contracts
 * - Test data aggregation accuracy
 * - Performance and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Reports API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Clean up any existing test data
    await prismaService.serviceSession.deleteMany({
      where: { store_id: 'test-store' },
    });
    await prismaService.costEntry.deleteMany({
      where: { store_id: 'test-store' },
    });
    await prismaService.store.deleteMany({
      where: { id: 'test-store' },
    });
    await prismaService.beautician.deleteMany({
      where: { id: { in: ['beautician-001', 'beautician-002'] } },
    });

    // Create test fixtures
    await prismaService.store.create({
      data: {
        id: 'test-store',
        name: 'Test Store',
        code: 'TEST001',
      },
    });

    await prismaService.beautician.createMany({
      data: [
        {
          id: 'beautician-001',
          name: 'Test Beautician 1',
          employee_id: 'BEAU001',
        },
        {
          id: 'beautician-002',
          name: 'Test Beautician 2',
          employee_id: 'BEAU002',
        },
      ],
    });
  });

  afterAll(async () => {
    // Clean up test data (child tables first)
    await prismaService.serviceSession.deleteMany({
      where: { store_id: 'test-store' },
    });
    await prismaService.costEntry.deleteMany({
      where: { store_id: 'test-store' },
    });
    await prismaService.beautician.deleteMany({
      where: { id: { in: ['beautician-001', 'beautician-002'] } },
    });
    await prismaService.store.deleteMany({
      where: { id: 'test-store' },
    });

    await prismaService.$disconnect();
    await app.close();
  });

  describe('/api/v1/reports/daily (GET)', () => {
    beforeAll(async () => {
      // Create test revenue sessions
      const testSessions = [
        {
          store_id: 'test-store',
          beautician_id: 'beautician-001',
          service_date: new Date('2024-01-15'),
          gross_revenue: 1000,
          beautician_share: 600,
          net_revenue: 400,
          payment_method: 'cash',
          entry_channel: 'manual_entry',
        },
        {
          store_id: 'test-store',
          beautician_id: 'beautician-002',
          service_date: new Date('2024-01-15'),
          gross_revenue: 800,
          beautician_share: 480,
          net_revenue: 320,
          payment_method: 'transfer',
          entry_channel: 'manual_entry',
        },
        {
          store_id: 'test-store',
          beautician_id: 'beautician-001',
          service_date: new Date('2024-01-16'),
          gross_revenue: 1200,
          beautician_share: 720,
          net_revenue: 480,
          payment_method: 'cash',
          entry_channel: 'manual_entry',
        },
      ];

      await prismaService.serviceSession.createMany({
        data: testSessions,
      });

      // Create test cost entries
      const testCosts = [
        {
          store_id: 'test-store',
          category: 'Rent',
          payer: 'Store Manager',
          amount: 2500.0,
          allocation_rule_id: 'rule-001',
          created_by: 'user-001',
          created_at: new Date('2024-01-15'),
        },
        {
          store_id: 'test-store',
          category: 'Utilities',
          payer: 'John Doe',
          amount: 150.75,
          allocation_rule_id: 'rule-002',
          created_by: 'user-002',
          created_at: new Date('2024-01-15'),
        },
        {
          store_id: 'test-store',
          category: 'Supplies',
          payer: 'Jane Smith',
          amount: 89.99,
          allocation_rule_id: 'rule-003',
          created_by: 'user-003',
          created_at: new Date('2024-01-16'),
        },
      ];

      await prismaService.costEntry.createMany({
        data: testCosts,
      });
    });

    it('should return daily report for single date', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-15',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.summary).toMatchObject({
            totalRevenue: 1800, // 1000 + 800
            totalCosts: 2650.75, // 2500 + 150.75
            netProfit: -850.75, // 1800 - 2650.75
            profitMargin: expect.any(Number),
          });

          expect(res.body.dailyBreakdown).toHaveLength(1);
          expect(res.body.dailyBreakdown[0]).toMatchObject({
            date: '2024-01-15',
            revenue: 1800,
            costs: 2650.75,
            profit: -850.75,
            margin: expect.any(Number),
          });

          expect(res.body.beauticianPerformance).toHaveLength(2);
        });
    });

    it('should return daily report for date range', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.summary).toMatchObject({
            totalRevenue: 3000, // 1800 + 1200
            totalCosts: 2740.74, // 2650.75 + 89.99
            netProfit: 259.26, // 3000 - 2740.74
          });

          expect(res.body.dailyBreakdown).toHaveLength(2);
          expect(res.body.beauticianPerformance).toHaveLength(2);

          // Verify beautician performance data
          const beautician001 = res.body.beauticianPerformance.find(
            (b: any) => b.beautician_id === 'beautician-001'
          );
          expect(beautician001).toMatchObject({
            beautician_id: 'beautician-001',
            totalSessions: 2,
            totalRevenue: 2200, // 1000 + 1200
            averageRevenue: 1100,
          });
        });
    });

    it('should filter by specific store', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'different-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.summary.totalRevenue).toBe(0);
          expect(res.body.summary.totalCosts).toBe(0);
          expect(res.body.dailyBreakdown).toHaveLength(0);
          expect(res.body.beauticianPerformance).toHaveLength(0);
        });
    });

    it('should require store_id parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          date_from: '2024-01-15',
          date_to: '2024-01-15',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('store_id');
        });
    });

    it('should validate date format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: 'invalid-date',
          date_to: '2024-01-15',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('date');
        });
    });

    it('should validate date range order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-16',
          date_to: '2024-01-15', // date_to is before date_from
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'date_from must be before date_to'
          );
        });
    });

    it('should limit date range to maximum allowed period', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 366); // More than 1 year

      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-01',
          date_to: futureDate.toISOString().split('T')[0],
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('maximum');
        });
    });

    it('should handle empty data gracefully', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'empty-store',
          date_from: '2024-01-01',
          date_to: '2024-01-01',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.summary).toMatchObject({
            totalRevenue: 0,
            totalCosts: 0,
            netProfit: 0,
            profitMargin: 0,
          });
          expect(res.body.dailyBreakdown).toHaveLength(0);
          expect(res.body.beauticianPerformance).toHaveLength(0);
        });
    });
  });

  describe('/api/v1/reports/export (GET)', () => {
    it('should export daily report as Excel', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/export')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
          format: 'excel',
        })
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats/)
        .expect('Content-Disposition', /attachment; filename=/)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should export daily report as PDF', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/export')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
          format: 'pdf',
        })
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect('Content-Disposition', /attachment; filename=/)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should default to Excel format when format not specified', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/export')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
        })
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats/);
    });

    it('should validate export format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/export')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
          format: 'invalid-format',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('format');
        });
    });
  });

  describe('/api/v1/reports/kpi (GET)', () => {
    it('should return KPI summary for store', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/kpi')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            revenue: {
              total: 3000,
              growth: expect.any(Number),
              averagePerSession: expect.any(Number),
            },
            costs: {
              total: 2740.74,
              breakdown: expect.any(Object),
            },
            profit: {
              net: 259.26,
              margin: expect.any(Number),
            },
            sessions: {
              total: 3,
              averageValue: 1000,
            },
            paymentMethods: expect.any(Object),
          });
        });
    });

    it('should calculate growth percentage correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/kpi')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
          compare_period: 'previous',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.revenue.growth).toBeDefined();
          expect(typeof res.body.revenue.growth).toBe('number');
        });
    });
  });

  describe('Performance Tests', () => {
    it('should generate daily report within performance limits', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-01',
          date_to: '2024-01-31',
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds as per story requirements
    });

    it('should handle large date ranges efficiently', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-01',
          date_to: '2024-12-31',
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // Should handle large ranges within 5 seconds
    });

    it('should export large reports within reasonable time', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/v1/reports/export')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-01',
          date_to: '2024-01-31',
          format: 'excel',
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(10000); // Export should complete within 10 seconds
    });
  });

  describe('Data Accuracy Tests', () => {
    it('should calculate profit margins correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-15',
        })
        .expect(200)
        .expect((res) => {
          const { totalRevenue, totalCosts, profitMargin } = res.body.summary;
          const expectedMargin =
            ((totalRevenue - totalCosts) / totalRevenue) * 100;
          expect(Math.round(profitMargin * 100) / 100).toBe(
            Math.round(expectedMargin * 100) / 100
          );
        });
    });

    it('should aggregate beautician performance correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/daily')
        .query({
          store_id: 'test-store',
          date_from: '2024-01-15',
          date_to: '2024-01-16',
        })
        .expect(200)
        .expect((res) => {
          const beautician001 = res.body.beauticianPerformance.find(
            (b: any) => b.beautician_id === 'beautician-001'
          );

          expect(beautician001.totalSessions).toBe(2);
          expect(beautician001.totalRevenue).toBe(2200);
          expect(beautician001.averageRevenue).toBe(1100);
        });
    });
  });
});
