import { z } from 'zod';
import { PaymentMethod } from '../models/service-session.model';

// UUID validation pattern
const uuidSchema = z.string().uuid('Invalid UUID format');

// PaymentMethod enum schema
const paymentMethodSchema = z.nativeEnum(PaymentMethod);

// Service date validation - must not be in the future
const serviceDateSchema = z.date().refine((date) => date <= new Date(), {
  message: 'Service date cannot be in the future',
});

// Positive number validation for monetary amounts
const monetaryAmountSchema = z
  .number()
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')
  .max(999999.99, 'Amount cannot exceed 999,999.99');

// Base ServiceSession schema
export const serviceSessionSchema = z.object({
  id: uuidSchema,
  store_id: uuidSchema,
  beautician_id: uuidSchema,
  service_date: serviceDateSchema,
  gross_revenue: monetaryAmountSchema,
  payment_method: paymentMethodSchema,
  beautician_share: monetaryAmountSchema,
  subsidy: z.number().min(0, 'Subsidy cannot be negative').default(0),
  net_revenue: monetaryAmountSchema,
  created_at: z.date(),
  updated_at: z.date(),
  entry_channel: z.string().optional(),
  exception_flag: z.boolean().default(false),
});

// Create ServiceSession DTO schema
export const createServiceSessionSchema = z.object({
  store_id: uuidSchema,
  beautician_id: uuidSchema,
  service_date: serviceDateSchema,
  gross_revenue: monetaryAmountSchema,
  payment_method: paymentMethodSchema,
  entry_channel: z.string().optional(),
});

// Update ServiceSession DTO schema
export const updateServiceSessionSchema = z.object({
  service_date: serviceDateSchema.optional(),
  gross_revenue: monetaryAmountSchema.optional(),
  payment_method: paymentMethodSchema.optional(),
});

// Bulk import ServiceSession DTO schema
export const bulkImportServiceSessionSchema = z.object({
  store_id: uuidSchema,
  beautician_id: uuidSchema,
  service_date: z.string().transform((val, ctx) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid date format',
      });
      return z.NEVER;
    }
    if (date > new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Service date cannot be in the future',
      });
      return z.NEVER;
    }
    return date;
  }),
  gross_revenue: z.string().transform((val, ctx) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid number format',
      });
      return z.NEVER;
    }
    if (num <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Amount must be positive',
      });
      return z.NEVER;
    }
    return num;
  }),
  payment_method: z.string().transform((val, ctx) => {
    if (!Object.values(PaymentMethod).includes(val as PaymentMethod)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Payment method must be one of: cash, transfer, other',
      });
      return z.NEVER;
    }
    return val as PaymentMethod;
  }),
});

// Query parameters schema for listing sessions
export const serviceSessionQuerySchema = z.object({
  store_id: uuidSchema.optional(),
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
export type ServiceSessionType = z.infer<typeof serviceSessionSchema>;
export type CreateServiceSessionType = z.infer<
  typeof createServiceSessionSchema
>;
export type UpdateServiceSessionType = z.infer<
  typeof updateServiceSessionSchema
>;
export type BulkImportServiceSessionType = z.infer<
  typeof bulkImportServiceSessionSchema
>;
export type ServiceSessionQueryType = z.infer<typeof serviceSessionQuerySchema>;
