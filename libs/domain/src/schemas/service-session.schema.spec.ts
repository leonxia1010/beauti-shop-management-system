import {
  serviceSessionSchema,
  createServiceSessionSchema,
  updateServiceSessionSchema,
  bulkImportServiceSessionSchema,
} from './service-session.schema';
import { PaymentMethod } from '../models/service-session.model';

describe('Service Session Schemas', () => {
  const validServiceSession = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    store_id: '123e4567-e89b-12d3-a456-426614174001',
    beautician_id: '123e4567-e89b-12d3-a456-426614174002',
    service_date: new Date('2024-01-15'),
    gross_revenue: 100.5,
    payment_method: PaymentMethod.CASH,
    beautician_share: 66.67,
    subsidy: 0,
    net_revenue: 33.83,
    created_at: new Date(),
    updated_at: new Date(),
    exception_flag: false,
  };

  describe('serviceSessionSchema', () => {
    it('should validate valid service session', () => {
      const result = serviceSessionSchema.safeParse(validServiceSession);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalid = { ...validServiceSession, id: 'invalid-uuid' };
      const result = serviceSessionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject future service date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const invalid = { ...validServiceSession, service_date: futureDate };
      const result = serviceSessionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject negative gross revenue', () => {
      const invalid = { ...validServiceSession, gross_revenue: -10.5 };
      const result = serviceSessionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject revenue exceeding maximum', () => {
      const invalid = { ...validServiceSession, gross_revenue: 1000000 };
      const result = serviceSessionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid payment method', () => {
      const invalid = {
        ...validServiceSession,
        payment_method: 'invalid' as PaymentMethod,
      };
      const result = serviceSessionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('createServiceSessionSchema', () => {
    it('should validate valid create DTO', () => {
      const createDto = {
        store_id: '123e4567-e89b-12d3-a456-426614174001',
        beautician_id: '123e4567-e89b-12d3-a456-426614174002',
        service_date: new Date('2024-01-15'),
        gross_revenue: 100.5,
        payment_method: PaymentMethod.TRANSFER,
      };
      const result = createServiceSessionSchema.safeParse(createDto);
      expect(result.success).toBe(true);
    });
  });

  describe('bulkImportServiceSessionSchema', () => {
    it('should transform valid string inputs', () => {
      const importDto = {
        store_id: '123e4567-e89b-12d3-a456-426614174001',
        beautician_id: '123e4567-e89b-12d3-a456-426614174002',
        service_date: '2024-01-15',
        gross_revenue: '100.50',
        payment_method: 'cash',
      };
      const result = bulkImportServiceSessionSchema.safeParse(importDto);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.service_date).toBeInstanceOf(Date);
        expect(result.data.gross_revenue).toBe(100.5);
        expect(result.data.payment_method).toBe(PaymentMethod.CASH);
      }
    });

    it('should reject invalid date string', () => {
      const importDto = {
        store_id: '123e4567-e89b-12d3-a456-426614174001',
        beautician_id: '123e4567-e89b-12d3-a456-426614174002',
        service_date: 'invalid-date',
        gross_revenue: '100.50',
        payment_method: 'cash',
      };
      const result = bulkImportServiceSessionSchema.safeParse(importDto);
      expect(result.success).toBe(false);
    });

    it('should reject invalid number string', () => {
      const importDto = {
        store_id: '123e4567-e89b-12d3-a456-426614174001',
        beautician_id: '123e4567-e89b-12d3-a456-426614174002',
        service_date: '2024-01-15',
        gross_revenue: 'not-a-number',
        payment_method: 'cash',
      };
      const result = bulkImportServiceSessionSchema.safeParse(importDto);
      expect(result.success).toBe(false);
    });
  });
});
