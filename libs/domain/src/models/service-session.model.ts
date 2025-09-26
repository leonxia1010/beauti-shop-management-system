/**
 * ServiceSession Domain Model
 *
 * Core fields: id (UUID), store_id (UUID FK), beautician_id (UUID FK),
 * service_date (DATE), gross_revenue (NUMERIC), payment_method (ENUM)
 *
 * Calculated fields: beautician_share, subsidy, net_revenue (derived from business rules)
 * Audit fields: created_at, updated_at, entry_channel, exception_flag
 */

export interface ServiceSession {
  // Core fields
  id: string; // UUID
  store_id: string; // UUID FK
  beautician_id: string; // UUID FK
  service_date: Date; // DATE
  gross_revenue: number; // NUMERIC(12,2) - must be positive
  payment_method: PaymentMethod; // ENUM: 'cash', 'transfer', 'other'

  // Calculated fields (derived from business rules)
  beautician_share: number; // NUMERIC(12,2) - calculated via business rules engine
  subsidy: number; // NUMERIC(12,2) - default 0
  net_revenue: number; // NUMERIC(12,2) - calculated field

  // Audit fields
  created_at: Date;
  updated_at: Date;
  entry_channel?: string; // How the record was created (e.g., 'bulk_import', 'manual')
  exception_flag: boolean; // Default false
}

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  OTHER = 'other',
}

// DTO for creating ServiceSession
export interface CreateServiceSessionDto {
  store_id: string;
  beautician_id: string;
  service_date: Date;
  gross_revenue: number;
  payment_method: PaymentMethod;
  entry_channel?: string;
}

// DTO for updating ServiceSession
export interface UpdateServiceSessionDto {
  service_date?: Date;
  gross_revenue?: number;
  payment_method?: PaymentMethod;
}

// DTO for bulk import
export interface BulkImportServiceSessionDto {
  store_id: string;
  beautician_id: string;
  service_date: string; // Will be parsed to Date
  gross_revenue: string; // Will be parsed to number
  payment_method: string; // Will be validated against PaymentMethod enum
}
