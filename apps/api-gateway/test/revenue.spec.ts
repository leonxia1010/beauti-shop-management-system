/**
 * Revenue API Integration Tests
 *
 * Following testing standards:
 * - Test complete API endpoints against ephemeral database
 * - Validate request/response contracts
 * - Test authentication and authorization
 * - Performance and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Revenue API (e2e)', () => {
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
      where: { store_id: 'test-store-revenue' },
    });
    await prismaService.store.deleteMany({
      where: { id: 'test-store-revenue' },
    });
    await prismaService.beautician.deleteMany({
      where: { id: { in: ['beautician-001', 'beautician-002'] } },
    });

    // Create test fixtures
    await prismaService.store.create({
      data: {
        id: 'test-store-revenue',
        name: 'Test Store',
        code: 'TEST-REVENUE',
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
      where: { store_id: 'test-store-revenue' },
    });
    await prismaService.beautician.deleteMany({
      where: { id: { in: ['beautician-001', 'beautician-002'] } },
    });
    await prismaService.store.deleteMany({
      where: { id: 'test-store-revenue' },
    });

    await prismaService.$disconnect();
    await app.close();
  });

  describe('/api/v1/revenue/sessions (POST)', () => {
    const validSessionData = {
      store_id: 'test-store-revenue',
      beautician_id: 'beautician-001',
      service_date: '2024-01-15',
      gross_revenue: 1000,
      payment_method: 'cash',
    };

    it('should create a new service session', () => {
      return request(app.getHttpServer())
        .post('/api/v1/revenue/sessions')
        .send(validSessionData)
        .expect(201)
        .expect((res) => {
          expect(res.body.store_id).toBe('test-store-revenue');
          expect(res.body.beautician_id).toBe('beautician-001');
          expect(Number(res.body.gross_revenue)).toBe(1000);
          expect(Number(res.body.beautician_share)).toBe(600); // 60% of 1000
          expect(Number(res.body.net_revenue)).toBe(400); // 40% of 1000
          expect(res.body.payment_method).toBe('cash');
          expect(res.body.entry_channel).toBe('manual_entry');
          expect(res.body.id).toBeDefined();
          expect(res.body.created_at).toBeDefined();
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/revenue/sessions')
        .send({
          store_id: 'test-store-revenue',
          // Missing required fields
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toBeGreaterThan(0);
        });
    });

    it('should validate payment method enum', () => {
      return request(app.getHttpServer())
        .post('/api/v1/revenue/sessions')
        .send({
          ...validSessionData,
          payment_method: 'invalid_method',
        })
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages).toContain('payment_method');
        });
    });

    it('should validate positive revenue amount', () => {
      return request(app.getHttpServer())
        .post('/api/v1/revenue/sessions')
        .send({
          ...validSessionData,
          gross_revenue: -100,
        })
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages).toContain('positive');
        });
    });
  });

  describe('/api/v1/revenue/sessions (GET)', () => {
    beforeAll(async () => {
      // Create test sessions
      const testSessions = [
        {
          store_id: 'test-store-revenue',
          beautician_id: 'beautician-001',
          service_date: new Date('2024-01-15'),
          gross_revenue: 1000,
          beautician_share: 600,
          net_revenue: 400,
          payment_method: 'cash',
          entry_channel: 'manual_entry',
        },
        {
          store_id: 'test-store-revenue',
          beautician_id: 'beautician-002',
          service_date: new Date('2024-01-16'),
          gross_revenue: 800,
          beautician_share: 480,
          net_revenue: 320,
          payment_method: 'transfer',
          entry_channel: 'manual_entry',
        },
      ];

      await prismaService.serviceSession.createMany({
        data: testSessions,
      });
    });

    it.skip('should return paginated sessions for store', () => {
      return request(app.getHttpServer())
        .get('/api/v1/revenue/sessions')
        .query({
          store_id: 'test-store-revenue',
          limit: 10,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.pagination).toMatchObject({
            total: 2,
            limit: 10,
            hasMore: false,
          });
        });
    });

    it.skip('should filter sessions by date range', () => {
      return request(app.getHttpServer())
        .get('/api/v1/revenue/sessions')
        .query({
          store_id: 'test-store-revenue',
          date_from: '2024-01-15',
          date_to: '2024-01-15',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].service_date).toContain('2024-01-15');
        });
    });

    it.skip('should filter sessions by beautician', () => {
      return request(app.getHttpServer())
        .get('/api/v1/revenue/sessions')
        .query({
          store_id: 'test-store-revenue',
          beautician_id: 'beautician-001',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].beautician_id).toBe('beautician-001');
        });
    });

    it('should require store_id parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/revenue/sessions')
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages).toContain('store_id');
        });
    });

    it('should handle pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/revenue/sessions')
        .query({
          store_id: 'test-store-revenue',
          limit: 1,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.pagination.hasMore).toBe(true);
          expect(res.body.pagination.cursor).toBeDefined();
        });
    });
  });

  describe('/api/v1/revenue/sessions/:id (PUT)', () => {
    let sessionId: string;

    beforeAll(async () => {
      // Create a test session
      const session = await prismaService.serviceSession.create({
        data: {
          store_id: 'test-store-revenue',
          beautician_id: 'beautician-001',
          service_date: new Date('2024-01-15'),
          gross_revenue: 1000,
          beautician_share: 600,
          net_revenue: 400,
          payment_method: 'cash',
          entry_channel: 'manual_entry',
        },
      });
      sessionId = session.id;
    });

    it('should update session with recalculated shares', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/revenue/sessions/${sessionId}`)
        .send({
          gross_revenue: 1500,
          payment_method: 'transfer',
        })
        .expect(200)
        .expect((res) => {
          expect(Number(res.body.gross_revenue)).toBe(1500);
          expect(Number(res.body.beautician_share)).toBe(900); // 60% of 1500
          expect(Number(res.body.net_revenue)).toBe(600); // 40% of 1500
          expect(res.body.payment_method).toBe('transfer');
        });
    });

    it('should return 404 for non-existent session', () => {
      return request(app.getHttpServer())
        .put('/api/v1/revenue/sessions/non-existent-id')
        .send({
          gross_revenue: 1500,
        })
        .expect(404);
    });
  });

  describe('/api/v1/revenue/bulk-import (POST)', () => {
    it('should handle CSV file upload', async () => {
      const csvContent = `store_id,beautician_id,service_date,gross_revenue,payment_method
test-store,beautician-001,2024-01-17,1200,cash
test-store,beautician-002,2024-01-17,900,transfer`;

      const response = await request(app.getHttpServer())
        .post('/api/v1/revenue/bulk-import')
        .attach('file', Buffer.from(csvContent), 'test.csv')
        .field('store_id', 'test-store-revenue')
        .expect(201);

      expect(response.body.total).toBe(2);
      expect(response.body.successful).toBe(2);
      expect(response.body.failed).toBe(0);
    });

    it.skip('should handle validation errors in bulk import', async () => {
      const csvContent = `store_id,beautician_id,service_date,gross_revenue,payment_method
test-store,beautician-001,2024-01-18,-100,cash
test-store,beautician-002,invalid-date,900,invalid_method`;

      const response = await request(app.getHttpServer())
        .post('/api/v1/revenue/bulk-import')
        .attach('file', Buffer.from(csvContent), 'test.csv')
        .field('store_id', 'test-store-revenue')
        .expect(201);

      expect(response.body.total).toBe(2);
      expect(response.body.successful).toBe(0);
      expect(response.body.failed).toBe(2);
      expect(response.body.errors).toHaveLength(2);
    });

    it('should require file upload', () => {
      return request(app.getHttpServer())
        .post('/api/v1/revenue/bulk-import')
        .field('store_id', 'test-store-revenue')
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages).toContain('file');
        });
    });
  });

  describe('/api/v1/revenue/validate (POST)', () => {
    it.skip('should validate session data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/revenue/validate')
        .send({
          store_id: 'test-store-revenue',
          beautician_id: 'beautician-001',
          service_date: '2024-01-15',
          gross_revenue: 10000, // High amount should trigger validation
          payment_method: 'cash',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.isValid).toBe(false);
          expect(res.body.exceptions).toContain(
            'Revenue amount 10000 seems unusually high'
          );
        });
    });

    it.skip('should pass validation for normal data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/revenue/validate')
        .send({
          store_id: 'test-store-revenue',
          beautician_id: 'beautician-001',
          service_date: '2024-01-15',
          gross_revenue: 1000,
          payment_method: 'cash',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.isValid).toBe(true);
          expect(res.body.exceptions).toHaveLength(0);
        });
    });
  });

  describe('Performance Tests', () => {
    it.skip('should handle concurrent session creation', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .post('/api/v1/revenue/sessions')
          .send({
            store_id: 'test-store-revenue',
            beautician_id: `beautician-${i}`,
            service_date: '2024-01-20',
            gross_revenue: 1000,
            payment_method: 'cash',
          })
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
      });
    });

    it('should respond within performance limits', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/v1/revenue/sessions')
        .query({
          store_id: 'test-store-revenue',
          limit: 50,
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
