/**
 * Revenue Business Rules Configuration
 *
 * This file contains all configurable business rules for revenue calculations.
 * These rules can be updated without code changes and support future
 * per-store or per-beautician customization.
 */

export interface RevenueShareRule {
  /**
   * Beautician's share percentage (0-100)
   * Default: 60 (60%)
   */
  beauticianSharePercent: number;

  /**
   * Store's share percentage (0-100)
   * Calculated as: 100 - beauticianSharePercent
   * Default: 40 (40%)
   */
  storeSharePercent: number;

  /**
   * Default subsidy amount
   * Default: 0
   */
  defaultSubsidy: number;

  /**
   * Rule description for audit purposes
   */
  description: string;
}

/**
 * Default Revenue Share Rule (4/6 Split)
 * Beautician gets 60%, Store gets 40%
 */
export const DEFAULT_REVENUE_SHARE_RULE: RevenueShareRule = {
  beauticianSharePercent: 60,
  storeSharePercent: 40,
  defaultSubsidy: 0,
  description: '4/6 split - Beautician 60%, Store 40%',
};

/**
 * Get revenue share rule for a specific context
 *
 * Future enhancement: This can be extended to support:
 * - Per-store rules
 * - Per-beautician rules
 * - Time-based rules
 * - Service-type based rules
 *
 * @param context - Optional context for rule selection
 * @returns The applicable revenue share rule
 */
export function getRevenueShareRule(context?: {
  storeId?: string;
  beauticianId?: string;
  serviceDate?: Date;
}): RevenueShareRule {
  // NOTE: Context-based rule selection deferred to Story 1.6 (Advanced Business Rules)
  // MVP uses uniform 60/40 split across all stores and beauticians
  // Future: Query business_rules table by context to support per-store/per-beautician customization
  return DEFAULT_REVENUE_SHARE_RULE;
}
