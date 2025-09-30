/**
 * CostEntry Domain Model
 *
 * Core fields: id (UUID), store_id (UUID FK), category (TEXT),
 * payer (TEXT), amount (NUMERIC), allocation_rule_id (UUID)
 *
 * Audit fields: created_at, updated_at, created_by (UUID FK)
 */

export interface CostEntry {
  // Core fields
  id: string; // UUID
  store_id: string; // UUID FK - must reference existing store
  category: string; // TEXT - cost category
  payer: string; // TEXT - who paid for this cost
  amount: number; // NUMERIC(12,2) - must be positive
  allocation_rule_id: string; // UUID - references allocation rule

  // Audit fields
  created_at: Date;
  updated_at: Date;
  created_by: string; // UUID FK - references user who created this entry
}

// DTO for creating CostEntry
export interface CreateCostEntryDto {
  store_id: string;
  category: string;
  payer: string;
  amount: number;
  allocation_rule_id: string;
  created_by: string;
}

// DTO for updating CostEntry
export interface UpdateCostEntryDto {
  category?: string;
  payer?: string;
  amount?: number;
  allocation_rule_id?: string;
}

// DTO for filtering cost entries
export interface CostEntryFilterDto {
  store_id?: string;
  category?: string;
  date_from?: Date;
  date_to?: Date;
  limit?: number;
  cursor?: string;
}
