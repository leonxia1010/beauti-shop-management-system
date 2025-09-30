import {
  costEntrySchema,
  createCostEntrySchema,
  updateCostEntrySchema,
  costEntryFilterSchema,
} from './cost-entry.schema';

describe('Cost Entry Schemas', () => {
  const validCostEntry = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    store_id: '123e4567-e89b-12d3-a456-426614174001',
    category: 'Rent',
    payer: 'Store Manager',
    amount: 2500.0,
    allocation_rule_id: '123e4567-e89b-12d3-a456-426614174003',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: '123e4567-e89b-12d3-a456-426614174004',
  };

  describe('costEntrySchema', () => {
    it('should validate valid cost entry', () => {
      const result = costEntrySchema.safeParse(validCostEntry);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalid = { ...validCostEntry, id: 'invalid-uuid' };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty category', () => {
      const invalid = { ...validCostEntry, category: '' };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty payer', () => {
      const invalid = { ...validCostEntry, payer: '' };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject negative amount', () => {
      const invalid = { ...validCostEntry, amount: -100 };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const invalid = { ...validCostEntry, amount: 0 };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject amount exceeding maximum', () => {
      const invalid = { ...validCostEntry, amount: 1000000 };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject amount with more than 2 decimal places', () => {
      const invalid = { ...validCostEntry, amount: 100.123 };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept amount with exactly 2 decimal places', () => {
      const valid = { ...validCostEntry, amount: 100.99 };
      const result = costEntrySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject category too long', () => {
      const invalid = { ...validCostEntry, category: 'a'.repeat(101) };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject payer name too long', () => {
      const invalid = { ...validCostEntry, payer: 'a'.repeat(101) };
      const result = costEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('createCostEntrySchema', () => {
    it('should validate valid create DTO', () => {
      const createDto = {
        store_id: '123e4567-e89b-12d3-a456-426614174001',
        category: 'Utilities',
        payer: 'John Doe',
        amount: 150.75,
        allocation_rule_id: '123e4567-e89b-12d3-a456-426614174003',
        created_by: '123e4567-e89b-12d3-a456-426614174004',
      };
      const result = createCostEntrySchema.safeParse(createDto);
      expect(result.success).toBe(true);
    });
  });

  describe('updateCostEntrySchema', () => {
    it('should validate partial update DTO', () => {
      const updateDto = {
        category: 'Updated Category',
        amount: 200.5,
      };
      const result = updateCostEntrySchema.safeParse(updateDto);
      expect(result.success).toBe(true);
    });

    it('should validate empty update DTO', () => {
      const updateDto = {};
      const result = updateCostEntrySchema.safeParse(updateDto);
      expect(result.success).toBe(true);
    });
  });

  describe('costEntryFilterSchema', () => {
    it('should validate filter with all parameters', () => {
      const filter = {
        store_id: '123e4567-e89b-12d3-a456-426614174001',
        category: 'Rent',
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 25,
        cursor: 'cursor-123',
      };
      const result = costEntryFilterSchema.safeParse(filter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date_from).toBeInstanceOf(Date);
        expect(result.data.date_to).toBeInstanceOf(Date);
        expect(result.data.limit).toBe(25);
      }
    });

    it('should use default limit when not provided', () => {
      const filter = {};
      const result = costEntryFilterSchema.safeParse(filter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('should reject limit below minimum', () => {
      const filter = { limit: 0 };
      const result = costEntryFilterSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });

    it('should reject limit above maximum', () => {
      const filter = { limit: 101 };
      const result = costEntryFilterSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });

    it('should coerce string limit to number', () => {
      const filter = { limit: '30' };
      const result = costEntryFilterSchema.safeParse(filter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(30);
        expect(typeof result.data.limit).toBe('number');
      }
    });
  });
});
