import { z } from 'zod';

// UUID validation pattern
const uuidSchema = z.string().uuid('Invalid UUID format');

// Positive number validation for monetary amounts
const monetaryAmountSchema = z
  .number()
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')
  .max(999999.99, 'Amount cannot exceed 999,999.99');

// Category validation - non-empty string
const categorySchema = z
  .string()
  .min(1, 'Category is required')
  .max(100, 'Category too long');

// Payer validation - non-empty string
const payerSchema = z
  .string()
  .min(1, 'Payer is required')
  .max(100, 'Payer name too long');

// Base CostEntry schema
export const costEntrySchema = z.object({
  id: uuidSchema,
  store_id: uuidSchema,
  category: categorySchema,
  payer: payerSchema,
  amount: monetaryAmountSchema,
  allocation_rule_id: uuidSchema,
  created_at: z.date(),
  updated_at: z.date(),
  created_by: uuidSchema,
});

// Create CostEntry DTO schema
export const createCostEntrySchema = z.object({
  store_id: uuidSchema,
  category: categorySchema,
  payer: payerSchema,
  amount: monetaryAmountSchema,
  allocation_rule_id: uuidSchema,
  created_by: uuidSchema,
});

// Update CostEntry DTO schema
export const updateCostEntrySchema = z.object({
  category: categorySchema.optional(),
  payer: payerSchema.optional(),
  amount: monetaryAmountSchema.optional(),
  allocation_rule_id: uuidSchema.optional(),
});

// Cost entry filter DTO schema
export const costEntryFilterSchema = z.object({
  store_id: uuidSchema.optional(),
  category: z.string().optional(),
  date_from: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  date_to: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

// Export inferred types for TypeScript
export type CostEntryType = z.infer<typeof costEntrySchema>;
export type CreateCostEntryType = z.infer<typeof createCostEntrySchema>;
export type UpdateCostEntryType = z.infer<typeof updateCostEntrySchema>;
export type CostEntryFilterType = z.infer<typeof costEntryFilterSchema>;
