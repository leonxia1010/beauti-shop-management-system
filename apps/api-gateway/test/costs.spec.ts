/**
 * Cost Management API Integration Tests
 *
 * Following testing standards:
 * - Test complete API endpoints against ephemeral database
 * - Validate request/response contracts
 * - Test authentication and authorization
 * - Performance and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Costs API (e2e)', () => {
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
    await prismaService.costEntry.deleteMany({
      where: { store_id: 'test-store-costs' },
    });
    await prismaService.store.deleteMany({
      where: { id: 'test-store-costs' },
    });

    // Create test fixtures
    await prismaService.store.create({
      data: {
        id: 'test-store-costs',
        name: 'Test Store Costs',
        code: 'TEST-COSTS',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data (child tables first)
    await prismaService.costEntry.deleteMany({
      where: { store_id: 'test-store-costs' },
    });
    await prismaService.store.deleteMany({
      where: { id: 'test-store-costs' },
    });

    await prismaService.$disconnect();
    await app.close();
  });

  describe('/api/v1/costs (POST)', () => {
    const validCostData = {
      store_id: 'test-store-costs',
      category: 'Rent',
      payer: 'Store Manager',
      amount: 2500.0,
      entry_date: new Date().toISOString(),
      allocation_rule_id: 'rule-001',
      created_by: 'user-001',
    };

    it.skip('should create a new cost entry', () => {
      return request(app.getHttpServer())
        .post('/api/v1/costs')
        .send(validCostData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            store_id: 'test-store-costs',
            category: 'Rent',
            payer: 'Store Manager',
            amount: 2500.0,
            allocation_rule_id: 'rule-001',
            created_by: 'user-001',
          });
          expect(res.body.id).toBeDefined();
          expect(res.body.created_at).toBeDefined();
          expect(res.body.updated_at).toBeDefined();
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/costs')
        .send({
          store_id: 'test-store-costs',
          // Missing required fields
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toBeGreaterThan(0);
        });
    });

    it('should validate positive amount', () => {
      return request(app.getHttpServer())
        .post('/api/v1/costs')
        .send({
          ...validCostData,
          amount: -100,
        })
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages).toContain('positive');
        });
    });

    it('should validate amount precision (max 2 decimal places)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/costs')
        .send({
          ...validCostData,
          amount: 100.123,
        })
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages.toLowerCase()).toContain('amount');
        });
    });

    it('should validate maximum amount', () => {
      return request(app.getHttpServer())
        .post('/api/v1/costs')
        .send({
          ...validCostData,
          amount: 1000000,
        })
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages.toLowerCase()).toContain('amount');
        });
    });

    it('should validate category length', () => {
      return request(app.getHttpServer())
        .post('/api/v1/costs')
        .send({
          ...validCostData,
          category: 'a'.repeat(101),
        })
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages).toContain('category');
        });
    });

    it('should validate payer length', () => {
      return request(app.getHttpServer())
        .post('/api/v1/costs')
        .send({
          ...validCostData,
          payer: 'a'.repeat(101),
        })
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages).toContain('payer');
        });
    });
  });

  describe('/api/v1/costs (GET)', () => {
    beforeAll(async () => {
      // Create test cost entries
      const testCosts = [
        {
          store_id: 'test-store-costs',
          category: 'Rent',
          payer: 'Store Manager',
          amount: 2500.0,
          allocation_rule_id: 'rule-001',
          created_by: 'user-001',
        },
        {
          store_id: 'test-store-costs',
          category: 'Utilities',
          payer: 'John Doe',
          amount: 150.75,
          allocation_rule_id: 'rule-002',
          created_by: 'user-002',
        },
        {
          store_id: 'test-store-costs',
          category: 'Supplies',
          payer: 'Jane Smith',
          amount: 89.99,
          allocation_rule_id: 'rule-003',
          created_by: 'user-003',
        },
      ];

      await prismaService.costEntry.createMany({
        data: testCosts,
      });
    });

    it.skip('should return paginated costs for store', () => {
      return request(app.getHttpServer())
        .get('/api/v1/costs')
        .query({
          store_id: 'test-store-costs',
          limit: 10,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(3);
          expect(res.body.pagination).toMatchObject({
            total: 3,
            limit: 10,
            hasMore: false,
          });
          expect(res.body.summary).toMatchObject({
            totalCosts: 2740.74,
            costsByCategory: expect.any(Object),
            costsByPayer: expect.any(Object),
          });
        });
    });

    it.skip('should filter costs by category', () => {
      return request(app.getHttpServer())
        .get('/api/v1/costs')
        .query({
          store_id: 'test-store-costs',
          category: 'Rent',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].category).toBe('Rent');
          expect(Number(res.body.data[0].amount)).toBe(2500.0);
        });
    });

    it('should filter costs by payer', () => {
      return request(app.getHttpServer())
        .get('/api/v1/costs')
        .query({
          store_id: 'test-store-costs',
          payer: 'John Doe',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].payer).toBe('John Doe');
          expect(res.body.data[0].category).toBe('Utilities');
        });
    });

    it.skip('should filter costs by date range', () => {
      const today = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get('/api/v1/costs')
        .query({
          store_id: 'test-store-costs',
          date_from: today,
          date_to: today,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(3);
        });
    });

    it('should require store_id parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/costs')
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
        .get('/api/v1/costs')
        .query({
          store_id: 'test-store-costs',
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

  describe('/api/v1/costs/:id (PUT)', () => {
    let costId: string;

    beforeAll(async () => {
      // Create a test cost entry
      const cost = await prismaService.costEntry.create({
        data: {
          store_id: 'test-store-costs',
          category: 'Test Category',
          payer: 'Test Payer',
          amount: 100.0,
          allocation_rule_id: 'rule-001',
          created_by: 'user-001',
        },
      });
      costId = cost.id;
    });

    it('should update cost entry', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/costs/${costId}`)
        .send({
          category: 'Updated Category',
          amount: 150.5,
          payer: 'Updated Payer',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.category).toBe('Updated Category');
          expect(Number(res.body.amount)).toBe(150.5);
          expect(res.body.payer).toBe('Updated Payer');
          expect(res.body.updated_at).toBeDefined();
        });
    });

    it('should allow partial updates', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/costs/${costId}`)
        .send({
          amount: 200.0,
        })
        .expect(200)
        .expect((res) => {
          expect(Number(res.body.amount)).toBe(200.0);
          expect(res.body.category).toBe('Updated Category'); // Should remain unchanged
        });
    });

    it('should validate update data', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/costs/${costId}`)
        .send({
          amount: -50, // Invalid negative amount
        })
        .expect(400)
        .expect((res) => {
          const messages = Array.isArray(res.body.message)
            ? res.body.message.join(' ')
            : res.body.message;
          expect(messages).toContain('positive');
        });
    });

    it('should return 404 for non-existent cost entry', () => {
      return request(app.getHttpServer())
        .put('/api/v1/costs/non-existent-id')
        .send({
          amount: 100.0,
        })
        .expect(404);
    });
  });

  describe('/api/v1/costs/:id (DELETE)', () => {
    let costId: string;

    beforeEach(async () => {
      // Create a test cost entry for each delete test
      const cost = await prismaService.costEntry.create({
        data: {
          store_id: 'test-store-costs',
          category: 'Deletable Category',
          payer: 'Deletable Payer',
          amount: 75.0,
          allocation_rule_id: 'rule-001',
          created_by: 'user-001',
        },
      });
      costId = cost.id;
    });

    it('should soft delete cost entry', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/costs/${costId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('deleted');
        });

      // Verify the cost is no longer returned in queries
      const response = await request(app.getHttpServer())
        .get('/api/v1/costs')
        .query({
          store_id: 'test-store-costs',
          category: 'Deletable Category',
        })
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should return 404 for non-existent cost entry', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/costs/non-existent-id')
        .expect(404);
    });
  });

  describe('Performance Tests', () => {
    it.skip('should handle concurrent cost creation', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .post('/api/v1/costs')
          .send({
            store_id: 'test-store-costs',
            category: `Category ${i}`,
            payer: `Payer ${i}`,
            amount: 100.0 + i,
            allocation_rule_id: 'rule-001',
            created_by: 'user-001',
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
        .get('/api/v1/costs')
        .query({
          store_id: 'test-store-costs',
          limit: 50,
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe('Audit Trail Tests', () => {
    it.skip('should create audit log entry for cost creation', async () => {
      const costResponse = await request(app.getHttpServer())
        .post('/api/v1/costs')
        .send({
          store_id: 'test-store-costs',
          category: 'Audit Test',
          payer: 'Test User',
          amount: 50.0,
          entry_date: new Date().toISOString(),
          allocation_rule_id: 'rule-001',
          created_by: 'user-001',
        })
        .expect(201);

      // Check if audit log was created (this would require accessing audit logs endpoint)
      const auditLogs = await prismaService.auditLog.findMany({
        where: {
          entity_id: costResponse.body.id,
          entity_type: 'cost_entry',
          action: 'CREATE',
        },
      });

      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].actor_id).toBe('user-001');
    });

    it.skip('should create audit log entry for cost update', async () => {
      // Create a cost entry first
      const costResponse = await request(app.getHttpServer())
        .post('/api/v1/costs')
        .send({
          store_id: 'test-store-costs',
          category: 'Update Test',
          payer: 'Test User',
          amount: 60.0,
          entry_date: new Date().toISOString(),
          allocation_rule_id: 'rule-001',
          created_by: 'user-001',
        })
        .expect(201);

      // Update the cost entry
      await request(app.getHttpServer())
        .put(`/api/v1/costs/${costResponse.body.id}`)
        .send({
          amount: 80.0,
        })
        .expect(200);

      // Check if audit log was created for update
      const auditLogs = await prismaService.auditLog.findMany({
        where: {
          entity_id: costResponse.body.id,
          entity_type: 'cost_entry',
          action: 'UPDATE',
        },
      });

      expect(auditLogs).toHaveLength(1);
    });
  });
});
